"use client"

// components/SettingItem.tsx
import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from "react-native"
import type { LucideProps } from "lucide-react-native"
import { useTheme } from "@/contexts/ThemeContext"

// Interface para as props do componente SettingItem
interface SettingItemProps {
  icon?: React.ComponentType<LucideProps>
  label: string
  children?: React.ReactNode
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

export const SettingItem: React.FC<SettingItemProps> = ({ icon: Icon, label, children, onPress, style }) => {
  const { theme } = useTheme()

  const content = (
    <View
      style={[
        styles.settingItem,
        {
          borderBottomColor: theme.colors.gray[200],
          backgroundColor: theme.colors.white,
        },
        style,
      ]}
    >
      <View style={styles.settingInfo}>
        {Icon && <Icon size={20} color={theme.colors.gray[700]} />}
        <Text style={[styles.settingLabel, { color: theme.colors.gray[800] }]}>{label}</Text>
      </View>
      {children}
    </View>
  )

  // Se 'onPress' for fornecido, torna a linha inteira clicável
  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>
  }

  return content
}

// Estilos
const styles = StyleSheet.create({
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginRight: 8,
  },
  settingLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    marginLeft: 12,
  },
})
