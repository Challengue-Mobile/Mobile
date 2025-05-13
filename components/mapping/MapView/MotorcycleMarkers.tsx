"use client"

import type React from "react"
import { TouchableOpacity, StyleSheet, View, Text } from "react-native"
import { Bike, Bluetooth } from "lucide-react-native"
import { useTheme } from "@/contexts/ThemeContext"
import type { Motorcycle, Beacon } from "@/types"
import type { Zone } from "@/components/mapping/types"

interface MotorcycleMarkersProps {
  motorcycles: Motorcycle[]
  beacons: Beacon[]
  markerPositions: { id: string; position: { x: number; y: number }; zoneId: string | null }[]
  onMotorcyclePress: (motoId: string) => void
  zones: Zone[]
}

const MotorcycleMarkers: React.FC<MotorcycleMarkersProps> = ({
  motorcycles,
  beacons,
  markerPositions,
  onMotorcyclePress,
  zones,
}) => {
  const { theme } = useTheme()

  return (
    <>
      {motorcycles
        .filter((moto) => moto.status === "in-yard")
        .map((moto) => {
          const markerPosition = markerPositions.find((p) => p.id === moto.id)
          const hasBeacon = moto.beaconId !== null
          const beacon = hasBeacon ? beacons.find((b) => b.id === moto.beaconId) : null

          if (!markerPosition) return null

          // Encontrar a zona em que a moto está
          const zone = markerPosition.zoneId ? zones.find((z) => z.id === markerPosition.zoneId) : null

          return (
            <TouchableOpacity
              key={moto.id}
              style={[
                styles.marker,
                {
                  backgroundColor: theme.colors.white,
                  top: `${markerPosition.position.y}%`,
                  left: `${markerPosition.position.x}%`,
                },
              ]}
              onPress={() => onMotorcyclePress(moto.id)}
            >
              <Bike size={24} color={theme.colors.secondary[500]} />

              {/* Indicador de beacon associado */}
              {hasBeacon && (
                <View
                  style={[
                    styles.beaconIndicator,
                    {
                      backgroundColor:
                        beacon?.status === "active"
                          ? theme.colors.success[500]
                          : beacon?.status === "inactive"
                            ? theme.colors.warning[500]
                            : theme.colors.error[500],
                    },
                  ]}
                >
                  <Bluetooth size={12} color={theme.colors.white} />
                </View>
              )}

              {/* Indicador de zona */}
              {zone && (
                <View
                  style={[
                    styles.zoneIndicator,
                    {
                      backgroundColor: zone.color,
                    },
                  ]}
                >
                  <Text style={styles.zoneText}>{zone.name.charAt(0)}</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        })}
    </>
  )
}

const styles = StyleSheet.create({
  marker: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  beaconIndicator: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  zoneIndicator: {
    position: "absolute",
    bottom: -5,
    left: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  zoneText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
})

export default MotorcycleMarkers
