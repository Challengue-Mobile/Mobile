// app/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { login, register as apiRegister, logout, getCurrentUser } from '../../lib/auth'

type User = {
  id: number
  email: string
  name?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStoredUser()
  }, [])

  const checkStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Error checking stored user:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Tentar login com API primeiro
      const response = await login(email, password)
      setUser(response.user)
    } catch (apiError: any) {
      console.warn('API não disponível, tentando login offline:', apiError.message)
      
      // Fallback: sistema offline usando AsyncStorage
      try {
        const storedUsers = await AsyncStorage.getItem('@users')
        const users = storedUsers ? JSON.parse(storedUsers) : []
        
        const foundUser = users.find((u: User & { password: string }) => 
          u.email === email && u.password === password
        )
        
        if (!foundUser) {
          throw new Error('Email ou senha incorretos (modo offline)')
        }

        const { password: _, ...userWithoutPassword } = foundUser
        setUser(userWithoutPassword)
        await AsyncStorage.setItem('@user', JSON.stringify(userWithoutPassword))
      } catch (offlineError) {
        // Se não tiver usuários offline, criar um usuário de teste
        if (email === 'test@test.com' && password === '123456') {
          const testUser = {
            id: 1,
            email: 'test@test.com',
            name: 'Usuário Teste'
          }
          setUser(testUser)
          await AsyncStorage.setItem('@user', JSON.stringify(testUser))
        } else {
          throw new Error('API indisponível. Use test@test.com / 123456 para testar offline')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Tentar registro com API primeiro
      const response = await apiRegister({ name: email.split('@')[0], email, password })
      setUser(response.user)
    } catch (apiError: any) {
      console.warn('API não disponível, fazendo registro offline:', apiError.message)
      
      // Fallback: sistema offline usando AsyncStorage
      const storedUsers = await AsyncStorage.getItem('@users')
      const users = storedUsers ? JSON.parse(storedUsers) : []
      
      const existingUser = users.find((u: User) => u.email === email)
      if (existingUser) {
        throw new Error('Usuário já existe com este email (modo offline)')
      }

      // Criar novo usuário offline
      const newUser = {
        id: Date.now(),
        email,
        password,
        name: email.split('@')[0] // usar parte do email como nome
      }

      users.push(newUser)
      await AsyncStorage.setItem('@users', JSON.stringify(users))

      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)
      await AsyncStorage.setItem('@user', JSON.stringify(userWithoutPassword))
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    // Simulação - em produção enviaria email real
    throw new Error('Funcionalidade de reset de senha não implementada')
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await AsyncStorage.removeItem('@user')
      setUser(null)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, register, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
