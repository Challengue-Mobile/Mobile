import { useState, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Motorcycle } from "@/types"

const STORAGE_KEY = "@navmotu:motorcycles"

export function useMotorcycles() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 1. Carrega do AsyncStorage na primeira montagem
  useEffect(() => {
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
        if (raw) setMotorcycles(JSON.parse(raw))
        setError(null)
      } catch (err) {
        console.error("Erro ao carregar motos:", err)
        setError("Não foi possível carregar as motos")
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
        console.error("Erro ao salvar motos:", err)
        setError("Não foi possível salvar as motos")
      })
  }, [motorcycles, loading])

  // 3. Adiciona ou atualiza uma moto
  const saveMotorcycle = useCallback((moto: Motorcycle) => {
    setMotorcycles((prev) => {
      const idx = prev.findIndex((m) => m.id === moto.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = moto
        return copy
      }
      return [...prev, moto]
    })
  }, [])

  // 4. Remove uma moto pelo ID
  const deleteMotorcycle = useCallback((id: string) => {
    setMotorcycles((prev) => prev.filter((m) => m.id !== id))
  }, [])

  return {
    motorcycles,
    loading,
    error,
    saveMotorcycle,
    deleteMotorcycle,
  }
}
