"use client"

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Link, Href } from "expo-router" // 1. Importe o tipo Href
import { ChevronRight } from "lucide-react-native"
import { useTheme } from "@/contexts/ThemeContext"
import { useLocalization } from "@/contexts/LocalizationContext"

interface SectionHeaderProps {
  title: string
  linkTo?: Href // 2. Use Href em vez de string para linkTo
}

export function SectionHeader({ title, linkTo }: SectionHeaderProps) {
  const { theme } = useTheme()
  const { t } = useLocalization()

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.gray[800] }]}>{title}</Text>
      {linkTo && (
        // 3. Agora 'linkTo' tem o tipo correto esperado por 'href'
        <Link href={linkTo} asChild>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={[styles.viewAllText, { color: theme.colors.primary[500] }]}>{t("home.viewAll")}</Text>
            <ChevronRight size={16} color={theme.colors.primary[500]} />
          </TouchableOpacity>
        </Link>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 16,
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    marginRight: 4,
  },
})