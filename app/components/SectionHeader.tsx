"use client"

import React from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from "react-native"
import { Link, LinkProps } from "expo-router"
import { ChevronRight } from "lucide-react-native"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"

export interface SectionHeaderProps {
  title: string
  // para o botão "Ver todas"
  linkTo?: LinkProps["href"]
  linkText?: string
  // para o botão "Limpar"
  clearText?: string
  onClearPress?: () => void
  // se quiser customizar estilo externo
  style?: StyleProp<ViewStyle>
}

export const SectionHeader = React.memo(({
  title,
  linkTo,
  linkText,
  clearText,
  onClearPress,
  style,
}: SectionHeaderProps) => {
  const { theme } = useTheme()
  const { t } = useLocalization()

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: theme.colors.gray[800] }]}>
        {title}
      </Text>

      <View style={styles.actions}>
        {/* botão "Limpar" (quando passar clearText) */}
        {clearText && onClearPress && (
          <TouchableOpacity
            onPress={onClearPress}
            style={styles.clearButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={[
                styles.clearText,
                { color: theme.colors.error ? theme.colors.error[500] : "#ef4444" },
              ]}
            >
              {clearText}
            </Text>
          </TouchableOpacity>
        )}

        {/* botão "Ver todas" (quando passar linkTo) */}
        {linkTo && (
          <Link href={linkTo} asChild>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text
                style={[
                  styles.viewAllText,
                  { color: theme.colors.primary[500] },
                ]}
              >
                {linkText ?? t("common.viewAll")}
              </Text>
              <ChevronRight size={16} color={theme.colors.primary[500]} />
            </TouchableOpacity>
          </Link>
        )}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  clearButton: {
    marginRight: 12,
  },
  clearText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginRight: 4,
  },
})
