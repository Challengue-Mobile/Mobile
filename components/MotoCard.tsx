"use client"

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import type { Motorcycle } from "@/types"
import { Trash2, Edit2, Bluetooth } from "lucide-react-native"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"

interface MotoCardProps {
  motorcycle: Motorcycle
  onEdit?: () => void
  onDelete?: () => void
}

export function MotoCard({ motorcycle, onEdit, onDelete }: MotoCardProps) {
  const { theme } = useTheme()
  const { t } = useLocalization()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-yard":
        return theme.colors.success[500]
      case "out":
        return theme.colors.error[500]
      case "maintenance":
        return theme.colors.warning[500]
      default:
        return theme.colors.gray[500]
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "in-yard":
        return t("motorcycles.status.inYard")
      case "out":
        return t("motorcycles.status.out")
      case "maintenance":
        return t("motorcycles.status.maintenance")
      default:
        return t("common.unknown")
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.white,
          shadowColor: theme.colors.gray[900],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.model, { color: theme.colors.gray[900] }]}>{motorcycle.model}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(motorcycle.status) }]}>
            <Text style={[styles.statusText, { color: theme.colors.white }]}>{getStatusText(motorcycle.status)}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>
              {t("motorcycles.licensePlate")}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>{motorcycle.licensePlate}</Text>
          </View>

          <View style={styles.detail}>
            <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>{t("motorcycles.year")}:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>{motorcycle.year}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>{t("motorcycles.color")}:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>{motorcycle.color}</Text>
          </View>

          {motorcycle.beaconId ? (
            <View style={styles.beaconDetail}>
              <Bluetooth size={16} color={theme.colors.secondary[500]} />
              <Text style={[styles.detailValue, styles.beaconText, { color: theme.colors.secondary[700] }]}>
                {motorcycle.beaconId}
              </Text>
            </View>
          ) : (
            <View style={styles.detail}>
              <Text style={[styles.detailLabel, { color: theme.colors.gray[600] }]}>{t("motorcycles.beacon")}:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.gray[800] }]}>{t("motorcycles.noBeacon")}</Text>
            </View>
          )}
        </View>
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Edit2 size={18} color={theme.colors.primary[500]} />
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Trash2 size={18} color={theme.colors.error[500]} />
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
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  model: {
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
  detailLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginRight: 4,
  },
  detailValue: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
  },
  beaconDetail: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  beaconText: {
    marginLeft: 4,
  },
  actions: {
    justifyContent: "center",
  },
  actionButton: {
    padding: 8,
    marginBottom: 8,
  },
})
