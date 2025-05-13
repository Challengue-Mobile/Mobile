"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { Platform } from "react-native"
import * as Notifications from "expo-notifications"
import { useSettings } from "@/hooks/useSettings"

// Configurando o comportamento das notificações
Notifications.setNotificationHandler({
  // Add the explicit return type Promise<Notifications.NotificationBehavior>
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    // --- Add the missing properties ---
    shouldShowBanner: true, // Controls if the notification shows as a banner when the app is foregrounded (iOS specific behavior interpretation, generally means visible)
    shouldShowList: true,   // Controls if the notification appears in the notification list/center
    // You could potentially add other properties like priority here if needed
    // priority: Notifications.AndroidNotificationPriority.MAX, // Example for Android
    // ---------------------------------
  }),
})

// Definindo o tipo para o contexto de notificações
type NotificationContextType = {
  // Ensure the Record value type is defined, e.g., unknown or any if truly variable
  sendNotification: (title: string, body: string, data?: Record<string, unknown>) => Promise<void> // Changed Record to Record<string, unknown> and Promise to Promise<void>
  notificationsEnabled: boolean
  toggleNotifications: () => void
}

// Criando o contexto com um valor padrão
const NotificationContext = createContext<NotificationContextType>({ // Explicitly type createContext
  sendNotification: async () => {},
  notificationsEnabled: false,
  toggleNotifications: () => {},
})

// Hook personalizado para usar o contexto de notificações
export const useNotifications = () => useContext(NotificationContext)

// Provedor de notificações que envolve a aplicação
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSetting } = useSettings()
  // Initialize state directly from settings or a default
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings?.notifications ?? false) // Added nullish coalescing for safety

  // Função para enviar uma notificação
  // Explicitly type data and return type Promise<void>
  const sendNotification = async (title: string, body: string, data: Record<string, unknown> = {}): Promise<void> => {
    // Verifica se as notificações estão habilitadas
    // Check settings directly for the most up-to-date value if needed, though state should be in sync
    if (!notificationsEnabled) {
        console.log("Notifications are disabled in settings.")
        return
    }

    try {
      let finalStatus = 'undetermined';
      // Solicita permissões se estiver no dispositivo físico
      if (Platform.OS !== "web") {
        // Check existing permissions first
        const existingStatus = await Notifications.getPermissionsAsync();
        finalStatus = existingStatus.status;

        // Only ask if permissions are undetermined; handle denied/granted cases
        if (finalStatus === 'undetermined') {
            const { status } = await Notifications.requestPermissionsAsync()
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
          console.log("Notification permissions are not granted. Status:", finalStatus)
          // Optionally inform the user they need to enable permissions in settings
          return
        }
      } else {
          // Handle web permissions if applicable, or set status to granted if not needed/supported
          finalStatus = 'granted'; // Assuming web doesn't need explicit permission here or it's handled elsewhere
      }

       // Only schedule if permission is granted
      if (finalStatus === 'granted') {
        // Envia a notificação
        const notificationId = await Notifications.scheduleNotificationAsync({ // scheduleNotificationAsync returns the ID
          content: {
            title,
            body,
            data,
          },
          trigger: null, // Notificação imediata
        })
        console.log("Notification scheduled with ID:", notificationId); // Optional: log the ID
      }

    } catch (error) {
      console.error("Error sending notification:", error)
    }
  }

  // Função para alternar o estado das notificações
  const toggleNotifications = () => {
    setNotificationsEnabled((prevEnabled) => {
        const newValue = !prevEnabled;
        updateSetting("notifications", newValue);
        return newValue;
    });
  }

  // Efeito para sincronizar o estado com as configurações
  useEffect(() => {
    // Ensure settings is loaded before setting the state
    if (settings && typeof settings.notifications === 'boolean') {
       setNotificationsEnabled(settings.notifications)
    }
  }, [settings]) // Depend only on settings object

  const contextValue = { // Define value outside JSX for clarity
      sendNotification,
      notificationsEnabled,
      toggleNotifications,
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}