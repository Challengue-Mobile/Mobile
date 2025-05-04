"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { Platform } from "react-native"
import * as Notifications from "expo-notifications"
import { useSettings } from "@/hooks/useSettings"

// Configurando o comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// Definindo o tipo para o contexto de notificações
type NotificationContextType = {
  sendNotification: (title: string, body: string, data?: Record<string, unknown>) => Promise<void>
  notificationsEnabled: boolean
  toggleNotifications: () => void
}

// Criando o contexto com um valor padrão
const NotificationContext = createContext<NotificationContextType>({
  sendNotification: async () => {},
  notificationsEnabled: false,
  toggleNotifications: () => {},
})

// Hook personalizado para usar o contexto de notificações
export const useNotifications = () => useContext(NotificationContext)

// Provedor de notificações que envolve a aplicação
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSetting } = useSettings()
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notifications)

  // Função para enviar uma notificação
  const sendNotification = async (title: string, body: string, data: Record<string, unknown> = {}): Promise<void> => {
    // Verifica se as notificações estão habilitadas
    if (!notificationsEnabled) return

    try {
      // Solicita permissões se estiver no dispositivo físico
      if (Platform.OS !== "web") {
        const { status } = await Notifications.requestPermissionsAsync()
        if (status !== "granted") {
          console.log("Notification permissions not granted")
          return
        }
      }

      // Envia a notificação
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Notificação imediata
      })
    } catch (error) {
      console.error("Error sending notification:", error)
    }
  }

  // Função para alternar o estado das notificações
  const toggleNotifications = () => {
    const newValue = !notificationsEnabled
    setNotificationsEnabled(newValue)
    updateSetting("notifications", newValue)
  }

  // Efeito para sincronizar o estado com as configurações
  useEffect(() => {
    setNotificationsEnabled(settings.notifications)
  }, [settings.notifications])

  return (
    <NotificationContext.Provider value={{ sendNotification, notificationsEnabled, toggleNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}
