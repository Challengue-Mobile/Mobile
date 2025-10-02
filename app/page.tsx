"use client";

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";
import { logout } from "../lib/auth";

export default function IndexPage() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: 20,
      color: theme.colors.gray[900],
      fontWeight: "600",
    },
    btn: {
      backgroundColor: "#ef4444",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    txt: { color: "#fff", fontWeight: "700" },
    content: {
      flex: 1,
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
        <TouchableOpacity style={styles.btn} onPress={handleLogout}>
          <Text style={styles.txt}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Bem-vindo ao NavMotu!</Text>
      </View>
    </SafeAreaView>
  );
}
