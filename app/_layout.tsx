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
import { getToken } from "../lib/auth"

SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn("Error preventing splash screen auto-hide:", err)
})

function RootLayoutContent() {
  useFrameworkReady()
  const router = useRouter()
  const segments = useSegments()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  })

  // Verificar autenticação ao iniciar o app
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken()
        setIsAuthenticated(!!token) // true se tem token, false se não tem
      } catch (error) {
        console.error('Erro ao verificar token:', error)
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  // Redirecionar baseado no estado de autenticação
  useEffect(() => {
    if (isAuthenticated === null) return // Ainda carregando

    const inAuthGroup = segments[0] === '(auth)'
    
    if (!isAuthenticated && !inAuthGroup) {
      // Não autenticado e tentando acessar área protegida -> redirecionar para login
      router.replace('/(auth)/login')
    } else if (isAuthenticated && inAuthGroup) {
      // Autenticado e na área de auth -> redirecionar para tabs
      router.replace('/(tabs)')
    }
  }, [isAuthenticated, segments])

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch((err) => {
        console.warn("Error hiding splash screen:", err)
      })
    }
  }, [fontsLoaded, fontError])

  // Não renderizar nada até que fonts e auth sejam verificados
  if (!fontsLoaded && !fontError) {
    return null
  }

  if (isAuthenticated === null) {
    return null // Ainda verificando autenticação
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
