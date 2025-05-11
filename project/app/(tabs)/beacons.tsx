"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Switch } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Plus, Bluetooth, RefreshCw } from "lucide-react-native"
import { BeaconCard } from "@/components/BeaconCard"
import { useMockData } from "@/hooks/useMockData"
import { BeaconFormModal } from "@/components/BeaconFormModal"
import { useBeacons } from "@/hooks/useBeacons"
import type { Beacon } from "@/types"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"
import { useScan } from "@/contexts/ScanContext"

export default function BeaconsScreen() {
  const { beacons: mockBeacons } = useMockData()
  const { beacons, saveBeacon, deleteBeacon } = useBeacons()
  const { theme } = useTheme()
  const { t } = useLocalization()
  const { isScanning, startScan } = useScan()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingBeacon, setEditingBeacon] = useState<Beacon | null>(null)
  const [showActive, setShowActive] = useState(true)
  const [filteredBeacons, setFilteredBeacons] = useState<Beacon[]>([])

  useEffect(() => {
    // Initialize with data if no beacons are saved yet
    if (beacons.length === 0) {
      mockBeacons.forEach((beacon) => {
        saveBeacon(beacon)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (showActive) {
      setFilteredBeacons(beacons)
    } else {
      // Only show active beacons
      setFilteredBeacons(beacons.filter((beacon) => beacon.status === "active"))
    }
  }, [showActive, beacons])

  const handleAddBeacon = () => {
    setEditingBeacon(null)
    setIsModalVisible(true)
  }

  const handleEditBeacon = (beacon: Beacon) => {
    setEditingBeacon(beacon)
    setIsModalVisible(true)
  }

  const handleSaveBeacon = (beacon: Beacon) => {
    saveBeacon(beacon)
    setIsModalVisible(false)
  }

  const handleDeleteBeacon = (id: string) => {
    deleteBeacon(id)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.gray[50] }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: theme.colors.white, borderBottomColor: theme.colors.gray[200] }]}>
        <Text style={[styles.title, { color: theme.colors.gray[900] }]}>{t("beacons.title")}</Text>
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: theme.colors.primary[500] },
            isScanning && [styles.scanningButton, { backgroundColor: theme.colors.gray[400] }],
          ]}
          onPress={isScanning ? undefined : handleAddBeacon}
          disabled={isScanning}
        >
          <Plus size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.filterContainer,
          { backgroundColor: theme.colors.white, borderBottomColor: theme.colors.gray[200] },
        ]}
      >
        <View style={styles.filterOption}>
          <Text style={[styles.filterLabel, { color: theme.colors.gray[800] }]}>{t("beacons.showAll")}</Text>
          <Switch
            value={showActive}
            onValueChange={setShowActive}
            trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary[300] }}
            thumbColor={showActive ? theme.colors.primary[500] : theme.colors.gray[100]}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.scanButton,
            { backgroundColor: theme.colors.secondary[500] },
            isScanning && [styles.scanningButton, { backgroundColor: theme.colors.gray[400] }],
          ]}
          onPress={startScan}
          disabled={isScanning}
        >
          <RefreshCw size={16} color={theme.colors.white} />
          <Text style={[styles.scanButtonText, { color: theme.colors.white }]}>
            {isScanning ? t("beacons.scanning") : t("beacons.scan")}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBeacons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BeaconCard
            beacon={item}
            onEdit={() => handleEditBeacon(item)}
            onDelete={() => handleDeleteBeacon(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bluetooth size={40} color={theme.colors.gray[400]} />
            <Text style={[styles.emptyText, { color: theme.colors.gray[600] }]}>{t("beacons.empty")}</Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.colors.primary[500] }]}
              onPress={handleAddBeacon}
            >
              <Text style={[styles.emptyButtonText, { color: theme.colors.white }]}>{t("beacons.add")}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <BeaconFormModal
        visible={isModalVisible}
        beacon={editingBeacon}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveBeacon}
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
  scanningButton: {
    backgroundColor: "#9CA3AF",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    marginRight: 8,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scanButtonText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    marginLeft: 4,
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
    marginVertical: 16,
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
