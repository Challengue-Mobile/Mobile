// components/ApiStatus.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../contexts/ThemeContext'
import { getApiUrl } from '../../config/environment'

export function ApiStatus() {
  const { theme } = useTheme()
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const [apiUrl, setApiUrl] = useState('')

  useEffect(() => {
    checkApiStatus()
    setApiUrl(getApiUrl())
    
    // Verificar status a cada 30 segundos
    const interval = setInterval(checkApiStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkApiStatus = async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout
      
      const response = await fetch(`${getApiUrl()}/health`, {
        method: 'GET',
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      setIsOnline(response.ok)
    } catch (error) {
      setIsOnline(false)
    }
  }

  if (isOnline === null) return null // Ainda verificando

  return (
    <View style={[styles.container, { backgroundColor: isOnline ? theme.colors.success[100] : theme.colors.error[100] }]}>
      <Text style={[styles.text, { color: isOnline ? theme.colors.success[700] : theme.colors.error[700] }]}>
        API: {isOnline ? '🟢 Online' : '🔴 Offline (modo local)'}
      </Text>
      <Text style={[styles.url, { color: theme.colors.text }]}>
        {apiUrl}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  url: {
    fontSize: 10,
    opacity: 0.7,
  },
})