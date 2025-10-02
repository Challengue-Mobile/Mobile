// hooks/useBeacons.ts
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Beacon } from '@/types'
import { showUserFriendlyError, logError } from '../lib/errorHandler'
import * as beaconService from '../lib/beaconService'

const STORAGE_KEY = 'beacons'

export function useBeacons() {
  const [beacons, setBeacons] = useState<Beacon[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null) // ID do beacon sendo deletado
  const [error, setError] = useState<string | null>(null)

  // 1) Carrega tudo na inicialização
  useEffect(() => {
    loadBeacons()
  }, [])

  // 2) Carrega beacons da API com fallback para AsyncStorage
  async function loadBeacons() {
    try {
      setLoading(true)
      setError(null)
      
      // Tentar carregar da API primeiro
      try {
        const response = await beaconService.getBeacons()
        setBeacons(response.content || response || [])
        // Salvar cache local
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(response.content || response || []))
      } catch (apiError) {
        // Fallback para dados locais se API falhar
        console.warn('API indisponível, usando dados locais:', apiError)
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
        const list: Beacon[] = raw ? JSON.parse(raw) : []
        setBeacons(list)
      }
    } catch (e) {
      logError('Beacons - Load', e)
      setError(showUserFriendlyError(e))
    } finally {
      setLoading(false)
    }
  }

  // 3) Salva ou atualiza um beacon
  async function saveBeacon(beacon: Beacon) {
    setSaving(true)
    setError(null)
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))

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
      logError('Beacons - Save', e)
      const errorMessage = showUserFriendlyError(e)
      setError(errorMessage)
      throw new Error(errorMessage) // Re-throw com mensagem amigável
    } finally {
      setSaving(false)
    }
  }

  // 4) Deleta um beacon
  async function deleteBeacon(id: string) {
    setDeleting(id)
    setError(null)
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      const list: Beacon[] = raw ? JSON.parse(raw) : []
      const filtered = list.filter((b) => b.id !== id)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      setBeacons(filtered)
      setError(null)
    } catch (e) {
      logError('Beacons - Delete', e)
      const errorMessage = showUserFriendlyError(e)
      setError(errorMessage)
      throw new Error(errorMessage) // Re-throw com mensagem amigável
    } finally {
      setDeleting(null)
    }
  }

  return {
    beacons,
    loading,
    saving,
    deleting,
    error,
    loadBeacons,
    saveBeacon,
    deleteBeacon,
  }
}
