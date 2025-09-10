"use client"

import { View, Text, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTheme } from '@/contexts/ThemeContext';

export default function Page() {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.gray[50],
    },
    header: {
      padding: 16,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray[200],
    },
    title: {
      fontSize: 20,
      color: theme.colors.gray[900],
      fontWeight: '600',
    },
    content: {
      flex: 1,
      padding: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    text: {
      fontSize: 16,
      color: theme.colors.gray[800],
    },
  });

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