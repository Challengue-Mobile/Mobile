// hooks/useBeacons.ts
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Beacon } from '@/types'

const STORAGE_KEY = 'beacons'

export function useBeacons() {
  const [beacons, setBeacons] = useState<Beacon[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 1) Carrega tudo na inicialização
  useEffect(() => {
    loadBeacons()
  }, [])

  // 2) Lê os beacons do AsyncStorage
  async function loadBeacons() {
    try {
      setLoading(true)
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      const list: Beacon[] = raw ? JSON.parse(raw) : []
      setBeacons(list)
      setError(null)
    } catch (e) {
      console.error('Error loading beacons:', e)
      setError('Failed to load beacons')
    } finally {
      setLoading(false)
    }
  }

  // 3) Salva ou atualiza um beacon
  async function saveBeacon(beacon: Beacon) {
    try {
      setLoading(true)

      // -- lê o estado mais recente do storage --
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      const list: Beacon[] = raw ? JSON.parse(raw) : []

      const idx = list.findIndex((b) => b.id === beacon.id)
      if (idx >= 0) {
        // atualização
        list[idx] = beacon
      } else {
        // inserção no topo (ou no fim, se preferir)
        list.unshift(beacon)
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list))

      // -- refaz o load para garantir tudo limpo --
      setBeacons(list)
      setError(null)
    } catch (e) {
      console.error('Error saving beacon:', e)
      setError('Failed to save beacon')
    } finally {
      setLoading(false)
    }
  }

  // 4) Deleta um beacon
  async function deleteBeacon(id: string) {
    try {
      setLoading(true)
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      const list: Beacon[] = raw ? JSON.parse(raw) : []
      const filtered = list.filter((b) => b.id !== id)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      setBeacons(filtered)
      setError(null)
    } catch (e) {
      console.error('Error deleting beacon:', e)
      setError('Failed to delete beacon')
    } finally {
      setLoading(false)
    }
  }

  return {
    beacons,
    loading,
    error,
    loadBeacons,
    saveBeacon,
    deleteBeacon,
  }
}
