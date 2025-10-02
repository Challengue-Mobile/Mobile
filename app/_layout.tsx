"use client"

import { useEffect, useState } from "react"
import { Stack, useRouter, useSegments } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useFrameworkReady } from "@/hooks/useFrameworkReady"
import { useFonts } from "expo-font"
import { SplashScreen } from "expo-router"
import { ThemeProvider } from "./contexts/ThemeContext"
import { LocalizationProvider } from "./contexts/LocalizationContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { ScanProvider } from "./contexts/ScanContext"
import { HistoryProvider } from "./contexts/HistoryContext"
import { AuthProvider, useAuth } from "./contexts/AuthContext"

SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn("Error preventing splash screen auto-hide:", err)
})

function RootLayoutContent() {
  useFrameworkReady()
  const router = useRouter()
  const segments = useSegments()
  const { user, loading } = useAuth()

  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  })

  // Redirecionar baseado no estado de autenticação
  useEffect(() => {
    if (loading) return // Ainda carregando

    const inAuthGroup = segments.includes("(auth)")

    if (user && inAuthGroup) {
      // Usuário logado mas está na tela de auth, redirecionar para tabs
      router.replace("/(tabs)")
    } else if (!user && !inAuthGroup) {
      // Usuário não logado e não está na tela de auth, redirecionar para login
      router.replace("/(auth)/login")
    }
  }, [user, loading, segments, router])

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch((err) => {
        console.warn("Error hiding splash screen:", err)
      })
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <StatusBar style="light" />
    </>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LocalizationProvider>
          <NotificationProvider>
            <ScanProvider>
              <HistoryProvider>
                <RootLayoutContent />
              </HistoryProvider>
            </ScanProvider>
          </NotificationProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}