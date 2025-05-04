"use client"

import { useEffect } from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useFrameworkReady } from "@/hooks/useFrameworkReady"
import { useFonts } from "expo-font"
import { SplashScreen } from "expo-router"
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext"
import { LocalizationProvider } from "@/contexts/LocalizationContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { ScanProvider } from "@/contexts/ScanContext"
import { HistoryProvider } from "@/contexts/HistoryContext"

// Prevent splash screen from auto-hiding before we're ready
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn("Error preventing splash screen auto-hide:", err)
})

// Componente de layout raiz que inclui os provedores de contexto
function RootLayoutContent() {
  // Call framework ready hook to ensure everything is initialized
  useFrameworkReady()
  
  // Get theme from context
  const { isDarkMode } = useTheme()

  // Load custom fonts
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("@/assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("@/assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("@/assets/fonts/Poppins-Bold.ttf"),
  })

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch((err) => {
        console.warn("Error hiding splash screen:", err)
      })
    }
  }, [fontsLoaded, fontError])

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="not-found" options={{ title: "Página não encontrada" }} />
      </Stack>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </>
  )
}

// Componente de layout raiz que envolve a aplicação com os provedores de contexto
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