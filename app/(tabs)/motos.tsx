"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Plus, Search, Filter } from "lucide-react-native"
import { MotoCard } from "@/components/MotoCard"
import { useMockData } from "@/hooks/useMockData"
import { useMotorcycles } from "@/hooks/useMotorcycles"
import type { Motorcycle } from "@/types"
import { MotoFormModal } from "@/components/MotoFormModal"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { logError } from "../../lib/errorHandler"

const SEEDED_FLAG = "@navmotu:motoSeeded"
const WHITE = "#FFFFFF"

export default function MotosScreen() {
  const { mockMotorcycles } = useMockData() as { mockMotorcycles: Motorcycle[] }
  const { motorcycles = [], loading, saving, deleting, saveMotorcycle, deleteMotorcycle, refetch } = useMotorcycles()
  const { theme } = useTheme()
  const { t } = useLocalization()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingMoto, setEditingMoto] = useState<Motorcycle | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMotorcycles, setFilteredMotorcycles] = useState<Motorcycle[]>([])
  const [refreshing, setRefreshing] = useState(false)

  // Seed inicial idempotente
  useEffect(() => {
    const seed = async () => {
      const seeded = await AsyncStorage.getItem(SEEDED_FLAG)
      if (!seeded && (motorcycles?.length ?? 0) === 0 && (mockMotorcycles?.length ?? 0) > 0) {
        for (const moto of mockMotorcycles) {
          await Promise.resolve(saveMotorcycle(moto))
        }
        await AsyncStorage.setItem(SEEDED_FLAG, "1")
      }
    }
    seed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMotorcycles(motorcycles)
    } else {
      const q = searchQuery.toLowerCase()
      const filtered = motorcycles.filter((m) => {
        const model = m.model?.toLowerCase() ?? ""
        // aceita licensePlate ou plate
        const plate = (("licensePlate" in m ? (m as any).licensePlate : (m as any).plate) ?? "").toLowerCase()
        return model.includes(q) || plate.includes(q)
      })
      setFilteredMotorcycles(filtered)
    }
  }, [searchQuery, motorcycles])

  const handleAddMoto = () => { setEditingMoto(null); setIsModalVisible(true) }
  const handleEditMoto = (moto: Motorcycle) => { setEditingMoto(moto); setIsModalVisible(true) }
  const handleSaveMoto = async (moto: Motorcycle) => { 
    try {
      await saveMotorcycle(moto); 
      setIsModalVisible(false) 
    } catch (error) {
      logError('MotosScreen - Save', error)
    }
  }
  const handleDeleteMoto = async (id: string) => { 
    try {
      await deleteMotorcycle(id) 
    } catch (error) {
      logError('MotosScreen - Delete', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch?.()
    } catch (error) {
      logError('MotosScreen - Refresh', error)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white, borderBottomColor: theme.colors.gray[200] }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Motos no Pátio</Text>
          <Text style={[styles.counter, { color: theme.colors.gray[600] }]}>
            {motorcycles.length} {motorcycles.length === 1 ? 'moto' : 'motos'}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.addButton, 
            { 
              backgroundColor: (loading || saving) ? theme.colors.gray[400] : theme.colors.primary[500]
            }
          ]}
          onPress={handleAddMoto}
          disabled={loading || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={WHITE} />
          ) : (
            <Plus size={20} color={WHITE} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white, borderColor: theme.colors.gray[200] },
          ]}
        >
          <Search size={20} color={theme.colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Buscar por placa ou modelo..."
            placeholderTextColor={theme.colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white, borderColor: theme.colors.gray[200] }]}
        >
          <Filter size={20} color={theme.colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={[styles.loadingText, { color: theme.colors.gray[600] }]}>
            Carregando motos...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMotorcycles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleEditMoto(item)}
              activeOpacity={0.7}
            >
              <MotoCard 
                motorcycle={item} 
                onEdit={() => handleEditMoto(item)} 
                onDelete={() => handleDeleteMoto(item.id)}
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
                {searchQuery ? "Nenhuma moto encontrada" : "Nenhuma moto cadastrada"}
              </Text>
              <TouchableOpacity
                style={[
                  styles.emptyButton, 
                  { 
                    backgroundColor: saving ? theme.colors.gray[400] : theme.colors.primary[500]
                  }
                ]}
                onPress={searchQuery ? () => setSearchQuery("") : handleAddMoto}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={WHITE} />
                ) : (
                  <Text style={[styles.emptyButtonText, { color: WHITE }]}>
                    {searchQuery ? "Limpar busca" : "Adicionar Moto"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <MotoFormModal
        visible={isModalVisible}
        motorcycle={editingMoto}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveMoto}
      />
    </SafeAreaView>
  )
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
  title: { fontFamily: "Poppins-SemiBold", fontSize: 20 },
  counter: { fontFamily: "Poppins-Regular", fontSize: 14, marginTop: 2 },
  addButton: { padding: 12, borderRadius: 8 },
  searchContainer: { flexDirection: "row", padding: 16, alignItems: "center" },
  searchInputContainer: {
    flex: 1, flexDirection: "row", alignItems: "center",
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: "100%", fontFamily: "Poppins-Regular", fontSize: 14 },
  filterButton: { marginLeft: 12, padding: 12, borderRadius: 8, borderWidth: 1 },
  listContent: { padding: 16, paddingTop: 0 },
  emptyContainer: { padding: 24, alignItems: "center", justifyContent: "center" },
  emptyText: { fontFamily: "Poppins-Medium", fontSize: 16, marginBottom: 16 },
  emptyButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  emptyButtonText: { fontFamily: "Poppins-Medium", fontSize: 14 },
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
})
