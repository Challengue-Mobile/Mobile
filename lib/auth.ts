// lib/auth.ts
import api from './api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface LoginResponse {
  token: string
  user: {
    id: number
    email: string
    name: string
  }
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await api.post('/api/auth/login', { email, password })
    const { token, user } = response.data
    
    // Salvar token para próximas requisições
    await AsyncStorage.setItem('authToken', token)
    await AsyncStorage.setItem('user', JSON.stringify(user))
    
    return { token, user }
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Erro ao fazer login')
  }
}

export async function register(data: RegisterData): Promise<LoginResponse> {
  try {
    const response = await api.post('/api/auth/register', data)
    const { token, user } = response.data
    
    // Salvar token para próximas requisições
    await AsyncStorage.setItem('authToken', token)
    await AsyncStorage.setItem('user', JSON.stringify(user))
    
    return { token, user }
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Erro ao fazer cadastro')
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout')
  } catch (error) {
    // Ignorar erros de logout da API
  } finally {
    // Limpar dados locais sempre
    await AsyncStorage.multiRemove(['authToken', 'user'])
  }
}

export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('authToken')
}

export async function getCurrentUser() {
  try {
    const userString = await AsyncStorage.getItem('user')
    return userString ? JSON.parse(userString) : null
  } catch {
    return null
  }
}
