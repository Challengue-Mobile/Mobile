"use client"

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import type { Beacon } from "../../types"
import { Trash2, Edit2, Bike, Bluetooth, Battery, Wifi, MapPin } from "lucide-react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useLocalization } from "../contexts/LocalizationContext"

interface BeaconCardProps {
  beacon: Beacon
  onEdit?: () => void
  onDelete?: () => void
  isDeleting?: boolean
}

export const BeaconCard = React.memo(({ beacon, onEdit, onDelete, isDeleting = false }: BeaconCardProps) => {
  const { theme, isDark } = useTheme()
  const { t } = useLocalization()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return theme.colors.success[500]
      case "inactive":
        return theme.colors.error[500]
      case "offline":
        return theme.colors.gray[500]
      default:
        return theme.colors.gray[500]
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "inactive":
        return "Inativo"
      case "offline":
        return "Offline"
      default:
        return "Desconhecido"
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 50) return theme.colors.success[500]
    if (level > 20) return "#F59E0B" // warning
    return theme.colors.error[500]
  }

  const getSignalColor = (strength: number) => {
    if (strength > 70) return theme.colors.success[500]
    if (strength > 40) return "#F59E0B" // warning
    return theme.colors.error[500]
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.isDark ? theme.colors.gray[100] : theme.colors.white,
          shadowColor: theme.colors.gray[900],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Bluetooth size={18} color={getStatusColor(beacon.status)} style={styles.icon} />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {beacon.id.length > 12 ? `${beacon.id.substring(0, 12)}...` : beacon.id}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(beacon.status) }]}>
            <Text style={[styles.statusText, { color: theme.colors.white }]}>{getStatusText(beacon.status)}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Battery size={14} color={getBatteryColor(beacon.batteryLevel)} style={styles.detailIcon} />
            <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>{beacon.batteryLevel || 0}%</Text>
          </View>

          <View style={styles.detail}>
            <Wifi size={14} color={getSignalColor(beacon.signalStrength)} style={styles.detailIcon} />
            <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>{beacon.signalStrength || 0}%</Text>
          </View>

          {beacon.zone && (
            <View style={styles.detail}>
              <MapPin size={14} color={theme.colors.gray[500]} style={styles.detailIcon} />
              <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>{beacon.zone}</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsRow}>
          {beacon.motoId ? (
            <View style={styles.motoDetail}>
              <Bike size={16} color={theme.colors.primary[500]} />
              <Text style={[styles.detailValue, styles.motoText, { color: theme.colors.primary[700] }]}>
                {beacon.motoId}
              </Text>
            </View>
          ) : (
            <View style={styles.detail}>
              <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>Moto:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>Não associado</Text>
            </View>
          )}
        </View>
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity 
              style={[
                styles.actionButton,
                { opacity: isDeleting ? 0.5 : 1 }
              ]} 
              onPress={onEdit}
              disabled={isDeleting}
            >
              <Edit2 size={18} color={theme.colors.primary[500]} />
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity 
              style={[
                styles.actionButton,
                { opacity: isDeleting ? 0.5 : 1 }
              ]} 
              onPress={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={theme.colors.error[500]} />
              ) : (
                <Trash2 size={18} color={theme.colors.error[500]} />
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    flexDirection: "row",
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: "Poppins-Medium",
    fontSize: 10,
  },
  detailsRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  detail: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  detailIcon: {
    marginRight: 4,
  },
  detailLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginRight: 4,
  },
  detailValue: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
  },
  motoDetail: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  motoText: {
    marginLeft: 4,
  },
  actions: {
    justifyContent: "center",
  },
  actionButton: {
    padding: 8,
    marginBottom: 8,
  },
}))
