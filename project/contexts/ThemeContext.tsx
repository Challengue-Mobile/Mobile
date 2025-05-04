"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useColorScheme } from "react-native"
import { useSettings } from "@/hooks/useSettings"
import Themes from "@/constants/Themes"

// Definindo o tipo para o contexto do tema
type ThemeContextType = {
  isDarkMode: boolean
  toggleDarkMode: () => void
  theme: typeof Themes
}

// Criando o contexto com um valor padrão
const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  theme: Themes,
})

// Hook personalizado para usar o contexto do tema
export const useTheme = () => useContext(ThemeContext)

// Provedor do tema que envolve a aplicação
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSetting } = useSettings()
  const systemColorScheme = useColorScheme()
  const [isDarkMode, setIsDarkMode] = useState(settings.darkMode)

  // Tema escuro personalizado baseado no tema padrão
  const darkTheme = {
    ...Themes,
    colors: {
      ...Themes.colors,
      // Cores primárias e secundárias permanecem as mesmas
      primary: Themes.colors.primary,
      secondary: Themes.colors.secondary,
      error: Themes.colors.error,
      success: Themes.colors.success,
      warning: Themes.colors.warning,
      // Inversão da escala de cinza para o modo escuro
      gray: {
        50: "#212529", // Invertido do 900
        100: "#343a40", // Invertido do 800
        200: "#495057", // Invertido do 700
        300: "#868e96", // Invertido do 600
        400: "#adb5bd", // Invertido do 500
        500: "#ced4da", // Invertido do 400
        600: "#dee2e6", // Invertido do 300
        700: "#e9ecef", // Invertido do 200
        800: "#f1f3f5", // Invertido do 100
        900: "#f8f9fa", // Invertido do 50
      },
      // Cores base invertidas
      white: "#121212", // Fundo escuro padrão
      black: "#ffffff",
    },
  }

  // Seleciona o tema com base no modo escuro
  const theme = isDarkMode ? darkTheme : Themes

  // Função para alternar o modo escuro
  const toggleDarkMode = () => {
    const newValue = !isDarkMode
    setIsDarkMode(newValue)
    updateSetting("darkMode", newValue)
  }

  // Efeito para sincronizar o estado com as configurações
  useEffect(() => {
    setIsDarkMode(settings.darkMode)
  }, [settings.darkMode])

  return <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, theme }}>{children}</ThemeContext.Provider>
}
