// hooks/useMotorcycles.ts
import { useState, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Motorcycle } from "@/types"
import { showUserFriendlyError, logError } from "../lib/errorHandler"
import * as motoService from '../lib/motoService'

const STORAGE_KEY = 'motorcycles'

export function useMotorcycles() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null) // ID da moto sendo deletada
  const [error, setError] = useState<string | null>(null)

  // 1. Carrega do AsyncStorage na primeira montagem
  useEffect(() => {
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
        if (raw) setMotorcycles(JSON.parse(raw))
        setError(null)
      } catch (err) {
        logError("Motorcycles - Load", err)
        setError(showUserFriendlyError(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // 2. Persiste no AsyncStorage sempre que 'motorcycles' mudar
  useEffect(() => {
    if (loading) return
    AsyncStorage
      .setItem(STORAGE_KEY, JSON.stringify(motorcycles))
      .catch((err) => {
        logError("Motorcycles - Persist", err)
        setError(showUserFriendlyError(err))
      })
  }, [motorcycles, loading])

  // 3. Adiciona ou atualiza uma moto
  const saveMotorcycle = useCallback(async (moto: Motorcycle) => {
    setSaving(true)
    setError(null)
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMotorcycles((prev) => {
        const idx = prev.findIndex((m) => m.id === moto.id)
        if (idx >= 0) {
          const copy = [...prev]
          copy[idx] = moto
          return copy
        }
        return [...prev, moto]
      })
    } catch (err) {
      logError("Motorcycles - Save", err)
      const errorMessage = showUserFriendlyError(err)
      setError(errorMessage)
      throw new Error(errorMessage) // Re-throw com mensagem amigável
    } finally {
      setSaving(false)
    }
  }, [])

  // 4. Remove uma moto pelo ID
  const deleteMotorcycle = useCallback(async (id: string) => {
    setDeleting(id)
    setError(null)
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setMotorcycles((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      logError("Motorcycles - Delete", err)
      const errorMessage = showUserFriendlyError(err)
      setError(errorMessage)
      throw new Error(errorMessage) // Re-throw com mensagem amigável
    } finally {
      setDeleting(null)
    }
  }, [])

  return {
    motorcycles,
    loading,
    saving,
    deleting,
    error,
    saveMotorcycle,
    deleteMotorcycle,
  }
}
