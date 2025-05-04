"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useSettings } from "@/hooks/useSettings"
import type { Motorcycle, Beacon } from "@/types"

// Definindo os tipos para o histórico
export type HistoryAction = "add" | "edit" | "delete"
export type HistoryEntityType = "motorcycle" | "beacon"

export interface HistoryEntry {
  id: string
  timestamp: number
  action: HistoryAction
  entityType: HistoryEntityType
  entityId: string
  entityData: Motorcycle | Beacon | null
}

// Definindo o tipo para o contexto de histórico
type HistoryContextType = {
  history: HistoryEntry[]
  addToHistory: (
    action: HistoryAction,
    entityType: HistoryEntityType,
    entityId: string,
    entityData: Motorcycle | Beacon | null,
  ) => Promise<void>
  clearHistory: () => Promise<void>
  saveHistoryEnabled: boolean
  toggleSaveHistory: () => void
}

// Criando o contexto com um valor padrão
const HistoryContext = createContext<HistoryContextType>({
  history: [],
  addToHistory: async () => {},
  clearHistory: async () => {},
  saveHistoryEnabled: true,
  toggleSaveHistory: () => {},
})

// Hook personalizado para usar o contexto de histórico
export const useHistory = () => useContext(HistoryContext)

// Provedor de histórico que envolve a aplicação
export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSetting } = useSettings()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [saveHistoryEnabled, setSaveHistoryEnabled] = useState(settings.saveHistory)

  // Carrega o histórico do AsyncStorage
  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem("history")
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory))
      }
    } catch (error) {
      console.error("Error loading history:", error)
    }
  }

  // Adiciona uma entrada ao histórico
  const addToHistory = async (
    action: HistoryAction,
    entityType: HistoryEntityType,
    entityId: string,
    entityData: Motorcycle | Beacon | null,
  ) => {
    if (!saveHistoryEnabled) return

    try {
      const newEntry: HistoryEntry = {
        id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        action,
        entityType,
        entityId,
        entityData,
      }

      const updatedHistory = [newEntry, ...history].slice(0, 100) // Limita a 100 entradas
      setHistory(updatedHistory)
      await AsyncStorage.setItem("history", JSON.stringify(updatedHistory))
    } catch (error) {
      console.error("Error adding to history:", error)
    }
  }

  // Limpa todo o histórico
  const clearHistory = async () => {
    try {
      setHistory([])
      await AsyncStorage.removeItem("history")
    } catch (error) {
      console.error("Error clearing history:", error)
    }
  }

  // Função para alternar o salvamento de histórico
  const toggleSaveHistory = () => {
    const newValue = !saveHistoryEnabled
    setSaveHistoryEnabled(newValue)
    updateSetting("saveHistory", newValue)
  }

  // Efeito para carregar o histórico na inicialização
  useEffect(() => {
    loadHistory()
  }, [])

  // Efeito para sincronizar o estado com as configurações
  useEffect(() => {
    setSaveHistoryEnabled(settings.saveHistory)
  }, [settings.saveHistory])

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory, saveHistoryEnabled, toggleSaveHistory }}>
      {children}
    </HistoryContext.Provider>
  )
}
