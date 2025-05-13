"use client"

import { View, Text, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Themes from "@/constants/Themes"

export default function Page() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Página Inicial</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Bem-vindo ao NavMotu!</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Themes.colors.gray[50],
  },
  header: {
    padding: 16,
    backgroundColor: Themes.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Themes.colors.gray[200],
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: Themes.colors.gray[900],
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: Themes.colors.gray[800],
  },
})
