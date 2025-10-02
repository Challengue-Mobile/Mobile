"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useBeacons } from "@/hooks/useBeacons";

import { BeaconCard } from "@/components/BeaconCard";
import { BeaconFormModal } from "@/components/BeaconFormModal";
import type { Beacon } from "@/types";
import { logError } from "../../lib/errorHandler";

export default function BeaconsScreen() {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const { beacons: storedBeacons, loading, saving, deleting, saveBeacon, deleteBeacon } = useBeacons();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBeacon, setEditingBeacon] = useState<Beacon | null>(null);

  // Se precisar inicializar mocks quando não houver nada salvo:
  useEffect(() => {
    if (storedBeacons.length === 0) {
      // setup inicial se usar mock
    }
  }, [storedBeacons]);

  const handleAdd = () => {
    setEditingBeacon(null);
    setIsModalVisible(true);
  };

  const handleEdit = (b: Beacon) => {
    setEditingBeacon(b);
    setIsModalVisible(true);
  };

  // Aqui a mágica: se alterou o ID, primeiro removemos o antigo e só então salvamos o novo
  const handleSave = async (b: Beacon) => {
    try {
      if (editingBeacon && editingBeacon.id !== b.id) {
        await deleteBeacon(editingBeacon.id);
      }
      await saveBeacon(b);
      setIsModalVisible(false);
    } catch (error) {
      logError('BeaconsScreen - Save', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBeacon(id);
    } catch (error) {
      logError('BeaconsScreen - Delete', error);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.gray[50] }]}
      edges={["top"]}
    >
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.white,
            borderBottomColor: theme.colors.gray[200],
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.colors.gray[900] }]}>
          {t("beacons.title")}
        </Text>
        <TouchableOpacity
          style={[
            styles.addButton, 
            { 
              backgroundColor: (loading || saving) ? theme.colors.gray[400] : theme.colors.primary[500] 
            }
          ]}
          onPress={handleAdd}
          disabled={loading || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <Plus size={20} color={theme.colors.white} />
          )}
        </TouchableOpacity>
      </View>

      {/* LISTA DE BEACONS */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={[styles.loadingText, { color: theme.colors.gray[600] }]}>
            Carregando beacons...
          </Text>
        </View>
      ) : (
        <FlatList
          data={storedBeacons}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BeaconCard
              beacon={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item.id)}
              isDeleting={deleting === item.id}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.gray[600] }]}>
                {t("beacons.empty")}
              </Text>
              <TouchableOpacity
                style={[
                  styles.emptyButton, 
                  { 
                    backgroundColor: saving ? theme.colors.gray[400] : theme.colors.primary[500] 
                  }
                ]}
                onPress={handleAdd}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Text style={[styles.emptyButtonText, { color: theme.colors.white }]}>
                    {t("beacons.add")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      <BeaconFormModal
        visible={isModalVisible}
        beacon={editingBeacon}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: { 
    marginTop: 12, 
    fontFamily: "Poppins-Regular", 
    fontSize: 14 
  },
});
