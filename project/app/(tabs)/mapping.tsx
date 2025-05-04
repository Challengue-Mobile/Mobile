"use client"

import { useState, useRef } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useMockData } from "@/hooks/useMockData"
import { MapPin, Bluetooth, RefreshCcw } from "lucide-react-native"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"

export default function MappingScreen() {
  const { beacons } = useMockData()
  const { theme } = useTheme()
  const { t } = useLocalization()
  const [selectedBeacon, setSelectedBeacon] = useState<string | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  // Simulate beacon positions on the yard map
  const beaconPositions = {
    "beacon-001": { top: "20%", left: "35%" },
    "beacon-002": { top: "30%", left: "35%" },
    "beacon-003": { top: "60%", left: "75%" },
    "beacon-004": { top: "80%", left: "15%" },
    "beacon-005": { top: "50%", left: "30%" },
  }

  const handleBeaconPress = (beaconId: string) => {
    setSelectedBeacon(beaconId === selectedBeacon ? null : beaconId)
  }

  const handleRefreshMap = () => {
    // Simulate refreshing beacon data
    setSelectedBeacon(null)
    // You would typically fetch new beacon positions here
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.gray[50] }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: theme.colors.white, borderBottomColor: theme.colors.gray[200] }]}>
        <Text style={[styles.title, { color: theme.colors.gray[900] }]}>{t("mapping.title")}</Text>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: theme.colors.primary[500] }]}
          onPress={handleRefreshMap}
        >
          <RefreshCcw size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.mapContainer,
          {
            backgroundColor: theme.colors.white,
            shadowColor: theme.colors.gray[900],
          },
        ]}
      >
        <Image
          source={require("@/assets/images/MAPA.png")} // Replace with your map image
          style={styles.mapImage}
        />

        {/* Place beacon indicators on the map */}
        {Object.keys(beaconPositions).map((beaconId) => {
          const position = beaconPositions[beaconId as keyof typeof beaconPositions]
          const beacon = beacons.find((b) => b.id === beaconId)
          const isSelected = selectedBeacon === beaconId

          if (!beacon) return null

          return (
            <TouchableOpacity
              key={beaconId}
              style={[
                styles.beaconMarker,
                {
                  top: position.top as `${number}%`,
                  left: position.left as `${number}%`,
                  backgroundColor: theme.colors.white,
                  shadowColor: theme.colors.gray[900], 
                },///VALOR DO BEACON AQUI DE POSIÇÃO
                isSelected && [styles.beaconMarkerSelected, { backgroundColor: theme.colors.primary[500] }],
              ]}
              onPress={() => handleBeaconPress(beaconId)}
            >
              {isSelected ? (
                <Bluetooth size={24} color={theme.colors.white} />
              ) : (
                <MapPin
                  size={24}
                  color={beacon.status === "active" ? theme.colors.primary[500] : theme.colors.gray[400]}
                />
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={[styles.infoPanel, { backgroundColor: theme.colors.white, borderTopColor: theme.colors.gray[200] }]}>
        <Text style={[styles.infoPanelTitle, { color: theme.colors.gray[900] }]}>{t("mapping.beaconInfo")}</Text>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.beaconList}
        >
          {beacons.map((beacon) => (
            <TouchableOpacity
              key={beacon.id}
              style={[
                styles.beaconCard,
                { backgroundColor: theme.colors.gray[100] },
                selectedBeacon === beacon.id && [
                  styles.beaconCardSelected,
                  { backgroundColor: theme.colors.primary[50], borderColor: theme.colors.primary[300] },
                ],
              ]}
              onPress={() => handleBeaconPress(beacon.id)}
            >
              <Bluetooth
                size={24}
                color={beacon.status === "active" ? theme.colors.primary[500] : theme.colors.gray[400]}
              />
              <Text style={[styles.beaconCardId, { color: theme.colors.gray[900] }]}>{beacon.id}</Text>
              <Text style={[styles.beaconCardStatus, { color: theme.colors.gray[600] }]}>
                {beacon.status === "active" ? t("beacons.status.active") : t("beacons.status.inactive")}
              </Text>
              {beacon.motoId && (
                <Text style={[styles.beaconCardMoto, { color: theme.colors.secondary[700] }]}>
                  {t("motorcycles.model")}: {beacon.motoId}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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
  refreshButton: {
    padding: 8,
    borderRadius: 8,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  mapImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  beaconMarker: {
    position: "absolute",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  beaconMarkerSelected: {
    transform: [{ translateX: -20 }, { translateY: -20 }, { scale: 1.2 }],
  },
  infoPanel: {
    padding: 16,
    borderTopWidth: 1,
  },
  infoPanelTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    marginBottom: 12,
  },
  beaconList: {
    paddingRight: 16,
  },
  beaconCard: {
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 140,
    alignItems: "center",
  },
  beaconCardSelected: {
    borderWidth: 1,
  },
  beaconCardId: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginTop: 8,
  },
  beaconCardStatus: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  beaconCardMoto: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginTop: 4,
  },
})
