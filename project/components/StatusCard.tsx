"use client"

import { View, Text, StyleSheet } from "react-native"
import { Bike, Bluetooth, Wifi, Truck, AlertTriangle } from "lucide-react-native"
import { useTheme } from "@/contexts/ThemeContext"

type IconName = "bike" | "beacon" | "wifi" | "truck" | "warning"

interface StatusCardProps {
  title: string
  value: string
  iconName: IconName
  color: string
}

export function StatusCard({ title, value, iconName, color }: StatusCardProps) {
  const { theme } = useTheme()

  const renderIcon = () => {
    switch (iconName) {
      case "bike":
        return <Bike size={24} color={color} />
      case "beacon":
        return <Bluetooth size={24} color={color} />
      case "wifi":
        return <Wifi size={24} color={color} />
      case "truck":
        return <Truck size={24} color={color} />
      case "warning":
        return <AlertTriangle size={24} color={color} />
      default:
        return <Bluetooth size={24} color={color} />
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          borderLeftColor: color,
          backgroundColor: theme.colors.white,
          shadowColor: theme.colors.gray[900],
        },
      ]}
    >
      <View style={styles.iconContainer}>{renderIcon()}</View>
      <View>
        <Text style={[styles.value, { color: theme.colors.gray[900] }]}>{value}</Text>
        <Text style={[styles.title, { color: theme.colors.gray[600] }]}>{title}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    width: "48%",
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    marginRight: 16,
  },
  title: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  value: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
  },
})
