"use client"

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import type { Motorcycle } from "@/types"
import { Trash2, Edit2, Bluetooth } from "lucide-react-native"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"

interface MotoCardProps {
  motorcycle: Motorcycle
  onEdit?: () => void
  onDelete?: () => void
  isDeleting?: boolean
}

export const MotoCard = React.memo(({ motorcycle, onEdit, onDelete, isDeleting = false }: MotoCardProps) => {
  const { theme } = useTheme()
  const { t } = useLocalization()

  // tokens com fallback (não exige success/error/warning/white no tema)
  const TOKENS = {
    success500: (theme as any)?.colors?.success?.[500] ?? "#10B981",
    error500:   (theme as any)?.colors?.error?.[500]   ?? "#EF4444",
    warning500: (theme as any)?.colors?.warning?.[500] ?? "#F59E0B",
    white:      (theme as any)?.colors?.white          ?? "#FFFFFF",
    secondary500: theme.colors.secondary[500],
    secondary700: theme.colors.secondary[700],
    shadow:       theme.colors.gray[900],
    surface:      (theme.colors as any).background ?? "#FFFFFF",
  }

  const status: string = (motorcycle as any).status ?? "unknown"

  const getStatusColor = (s: string) => {
    switch (s) {
      case "in-yard":     return TOKENS.success500
      case "out":         return TOKENS.error500
      case "maintenance": return TOKENS.warning500
      default:            return theme.colors.gray[500]
    }
  }

  const getStatusText = (s: string) => {
    switch (s) {
      case "in-yard":     return t("motorcycles.status.inYard")
      case "out":         return t("motorcycles.status.out")
      case "maintenance": return t("motorcycles.status.maintenance")
      default:            return t("common.unknown")
    }
  }

  const plate =
    ("licensePlate" in (motorcycle as any) && (motorcycle as any).licensePlate) ||
    (motorcycle as any).plate ||
    "-"

  const year  = (motorcycle as any).year  ?? "-"
  const color = (motorcycle as any).color ?? "-"

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: TOKENS.surface,
          shadowColor: TOKENS.shadow,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.model, { color: theme.colors.gray[900] }]}>
            {motorcycle.model}
          </Text>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Text style={[styles.statusText, { color: TOKENS.white }]}>
              {getStatusText(status)}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>
              {t("motorcycles.licensePlate")}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>
              {plate}
            </Text>
          </View>

          <View style={styles.detail}>
            <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>
              {t("motorcycles.year")}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>
              {year}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>
              {t("motorcycles.color")}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>
              {color}
            </Text>
          </View>

          {(motorcycle as any).beaconId ? (
            <View style={styles.beaconDetail}>
              <Bluetooth size={16} color={TOKENS.secondary500} />
              <Text style={[styles.detailValue, styles.beaconText, { color: TOKENS.secondary700 }]}>
                {(motorcycle as any).beaconId}
              </Text>
            </View>
          ) : (
            <View style={styles.detail}>
              <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>
                {t("motorcycles.beacon")}:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>
                {t("motorcycles.noBeacon")}
              </Text>
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
              <Edit2 size={18} color={theme.colors.primary} />
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
                <ActivityIndicator size="small" color={TOKENS.error500} />
              ) : (
                <Trash2 size={18} color={TOKENS.error500} />
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

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
  content: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  model: { fontFamily: "Poppins-SemiBold", fontSize: 16 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontFamily: "Poppins-Medium", fontSize: 10 },
  detailsRow: { flexDirection: "row", marginTop: 4 },
  detail: { flex: 1, flexDirection: "row", alignItems: "center", marginRight: 8 },
  detailLabel: { fontFamily: "Poppins-Regular", fontSize: 12, marginRight: 4 },
  detailValue: { fontFamily: "Poppins-Medium", fontSize: 12 },
  beaconDetail: { flex: 1, flexDirection: "row", alignItems: "center" },
  beaconText: { marginLeft: 4 },
  actions: { justifyContent: "center" },
  actionButton: { padding: 8, marginBottom: 8 },
}))
