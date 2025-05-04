"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Definição de tipos
interface ScanContextType {
  autoScanEnabled: boolean
  toggleAutoScan: () => void
  isScanning: boolean
  startScan: () => void
  stopScan: () => void
}

// Valores padrão para o contexto
const defaultContextValue: ScanContextType = {
  autoScanEnabled: false,
  toggleAutoScan: () => {},
  isScanning: false,
  startScan: () => {},
  stopScan: () => {},
}

// Chave para armazenamento local
const STORAGE_KEY = "@scan_settings"

// Criação do contexto
const ScanContext = createContext<ScanContextType>(defaultContextValue)

// Hook personalizado para usar o contexto
export const useScan = () => useContext(ScanContext)

// Props do provedor
interface ScanProviderProps {
  children: ReactNode
}

// Componente provedor do contexto
export const ScanProvider: React.FC<ScanProviderProps> = ({ children }) => {
  // Estados
  const [autoScanEnabled, setAutoScanEnabled] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  // Carrega as configurações salvas
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEY)
        if (savedSettings !== null) {
          const { autoScanEnabled } = JSON.parse(savedSettings)
          setAutoScanEnabled(autoScanEnabled)
          
          // Inicia o scan automaticamente se estiver habilitado
          if (autoScanEnabled) {
            setIsScanning(true)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar configurações de scan:", error)
      }
    }

    loadSettings()
  }, [])

  // Salva as configurações quando mudam
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            autoScanEnabled,
          })
        )
      } catch (error) {
        console.error("Erro ao salvar configurações de scan:", error)
      }
    }

    saveSettings()
  }, [autoScanEnabled])

  // Alterna o estado do auto scan
  const toggleAutoScan = () => {
    setAutoScanEnabled((prev) => !prev)
    // Se desativar o auto scan, também para o scan atual
    if (autoScanEnabled && isScanning) {
      setIsScanning(false)
    }
  }

  // Inicia um scan manual
  const startScan = () => {
    setIsScanning(true)
  }

  // Para o scan atual
  const stopScan = () => {
    setIsScanning(false)
  }

  // Valor do contexto
  const contextValue: ScanContextType = {
    autoScanEnabled,
    toggleAutoScan,
    isScanning,
    startScan,
    stopScan,
  }

  return <ScanContext.Provider value={contextValue}>{children}</ScanContext.Provider>
}

export default ScanProvider