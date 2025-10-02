"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Search, Filter, Wifi, Battery } from "lucide-react-native";

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
  const { beacons: storedBeacons, loading, saving, deleting, saveBeacon, deleteBeacon, refetch } = useBeacons();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBeacon, setEditingBeacon] = useState<Beacon | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredBeacons, setFilteredBeacons] = useState<Beacon[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Filtrar beacons conforme busca e status
  useEffect(() => {
    let filtered = storedBeacons;

    // Filtrar por texto de busca (UUID)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((beacon) =>
        beacon.id.toLowerCase().includes(query)
      );
    }

    // Filtrar por status
    if (statusFilter !== "all") {
      filtered = filtered.filter((beacon) => beacon.status === statusFilter);
    }

    setFilteredBeacons(filtered);
  }, [storedBeacons, searchQuery, statusFilter]);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch?.();
    } catch (error) {
      logError('BeaconsScreen - Refresh', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
            borderBottomColor: theme.colors.gray[200],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Beacons Ativos
          </Text>
          <Text style={[styles.counter, { color: theme.colors.gray[600] }]}>
            {storedBeacons.length} {storedBeacons.length === 1 ? 'beacon' : 'beacons'}
          </Text>
        </View>
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

      {/* FILTROS */}
      <View style={styles.filtersContainer}>
        {/* Busca por UUID */}
        <View
          style={[
            styles.searchInputContainer,
            { 
              backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white, 
              borderColor: theme.colors.gray[200] 
            },
          ]}
        >
          <Search size={20} color={theme.colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Buscar por UUID..."
            placeholderTextColor={theme.colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filtro por Status */}
        <TouchableOpacity
          style={[
            styles.filterButton, 
            { 
              backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white, 
              borderColor: theme.colors.gray[200] 
            }
          ]}
        >
          <Filter size={20} color={theme.colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* Status Filter Pills */}
      <View style={styles.statusFiltersContainer}>
        {[
          { key: "all", label: "Todos", count: storedBeacons.length },
          { key: "active", label: "Ativos", count: storedBeacons.filter(b => b.status === "active").length },
          { key: "inactive", label: "Inativos", count: storedBeacons.filter(b => b.status === "inactive").length },
          { key: "offline", label: "Offline", count: storedBeacons.filter(b => b.status === "offline").length },
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.statusFilterPill,
              {
                backgroundColor: statusFilter === filter.key 
                  ? theme.colors.primary[500] 
                  : theme.isDark ? theme.colors.gray[100] : theme.colors.white,
                borderColor: statusFilter === filter.key 
                  ? theme.colors.primary[500] 
                  : theme.colors.gray[300],
              },
            ]}
            onPress={() => setStatusFilter(filter.key)}
          >
            <Text
              style={[
                styles.statusFilterText,
                {
                  color: statusFilter === filter.key 
                    ? theme.colors.white 
                    : theme.colors.text,
                },
              ]}
            >
              {filter.label} ({filter.count})
            </Text>
          </TouchableOpacity>
        ))}
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
          data={filteredBeacons}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              activeOpacity={0.7}
            >
              <BeaconCard
                beacon={item}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDelete(item.id)}
                isDeleting={deleting === item.id}
              />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary[500]]}
              tintColor={theme.colors.primary[500]}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.gray[600] }]}>
                {searchQuery || statusFilter !== "all" 
                  ? "Nenhum beacon encontrado" 
                  : "Nenhum beacon cadastrado"}
              </Text>
              <TouchableOpacity
                style={[
                  styles.emptyButton, 
                  { 
                    backgroundColor: saving ? theme.colors.gray[400] : theme.colors.primary[500] 
                  }
                ]}
                onPress={searchQuery || statusFilter !== "all" 
                  ? () => { setSearchQuery(""); setStatusFilter("all"); }
                  : handleAdd
                }
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={theme.colors.white} />
                ) : (
                  <Text style={[styles.emptyButtonText, { color: theme.colors.white }]}>
                    {searchQuery || statusFilter !== "all" 
                      ? "Limpar filtros" 
                      : "Adicionar Beacon"}
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
  headerContent: {
    flex: 1,
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
  },
  counter: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
  },

  // Filtros
  filtersContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  filterButton: {
    marginLeft: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },

  // Status Filter Pills
  statusFiltersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statusFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  statusFilterText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
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
