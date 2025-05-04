"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Plus, Search, Filter } from "lucide-react-native"
import { MotoCard } from "@/components/MotoCard"
import { useMockData } from "@/hooks/useMockData"
import { useMotorcycles } from "@/hooks/useMotorcycles"
import type { Motorcycle } from "@/types"
import { MotoFormModal } from "@/components/MotoFormModal"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"

export default function MotosScreen() {
  const { motorcycles: mockMotorcycles } = useMockData()
  const { motorcycles, saveMotorcycle, deleteMotorcycle } = useMotorcycles()
  const { theme } = useTheme()
  const { t } = useLocalization()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingMoto, setEditingMoto] = useState<Motorcycle | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMotorcycles, setFilteredMotorcycles] = useState<Motorcycle[]>([])

  useEffect(() => {
    // Initialize with data if no motorcycles are saved yet
    if (motorcycles.length === 0) {
      mockMotorcycles.forEach((moto) => {
        saveMotorcycle(moto)
      })
    }
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMotorcycles(motorcycles)
    } else {
      const filtered = motorcycles.filter(
        (moto) =>
          moto.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          moto.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredMotorcycles(filtered)
    }
  }, [searchQuery, motorcycles])

  const handleAddMoto = () => {
    setEditingMoto(null)
    setIsModalVisible(true)
  }

  const handleEditMoto = (moto: Motorcycle) => {
    setEditingMoto(moto)
    setIsModalVisible(true)
  }

  const handleSaveMoto = (moto: Motorcycle) => {
    saveMotorcycle(moto)
    setIsModalVisible(false)
  }

  const handleDeleteMoto = (id: string) => {
    deleteMotorcycle(id)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.gray[50] }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: theme.colors.white, borderBottomColor: theme.colors.gray[200] }]}>
        <Text style={[styles.title, { color: theme.colors.gray[900] }]}>{t("motorcycles.title")}</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary[500] }]}
          onPress={handleAddMoto}
        >
          <Plus size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: theme.colors.white, borderColor: theme.colors.gray[200] },
          ]}
        >
          <Search size={20} color={theme.colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.gray[800] }]}
            placeholder={t("motorcycles.searchPlaceholder")}
            placeholderTextColor={theme.colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.colors.white, borderColor: theme.colors.gray[200] }]}
        >
          <Filter size={20} color={theme.colors.primary[500]} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredMotorcycles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MotoCard motorcycle={item} onEdit={() => handleEditMoto(item)} onDelete={() => handleDeleteMoto(item.id)} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.gray[600] }]}>{t("motorcycles.empty")}</Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.primary[500] }]}
              onPress={handleAddMoto}
            >
              <Text style={[styles.emptyButtonText, { color: theme.colors.white }]}>{t("motorcycles.add")}</Text>
            </TouchableOpacity>
          </View>
        }
      />

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
  container: {
    flex: 1,
  },
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
  searchContainer: {
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
  listContent: {
    padding: 16,
    paddingTop: 0,
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
})
