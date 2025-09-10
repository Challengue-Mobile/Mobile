"use client"

import { useEffect } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useFrameworkReady } from "@/hooks/useFrameworkReady"
import { useFonts } from "expo-font"
import { SplashScreen } from "expo-router"
import { ThemeProvider } from "./contexts/ThemeContext"
import { LocalizationProvider } from "./contexts/LocalizationContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { ScanProvider } from "./contexts/ScanContext"
import { HistoryProvider } from "./contexts/HistoryContext"

SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn("Error preventing splash screen auto-hide:", err)
})

function RootLayoutContent() {
  useFrameworkReady()

  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  })

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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="not-found" options={{ title: "Página não encontrada" }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  )
}

export default function RootLayout() {
  return (
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
  )
}
