// app/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { auth } from "@/config/firebase"

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
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null)
      setLoading(false)
    })
    return unsub
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await signInWithEmailAndPassword(auth, email, password)
      setUser(res.user)
    } finally { setLoading(false) }
  }

  const register = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password)
      setUser(res.user)
    } finally { setLoading(false) }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    try { await sendPasswordResetEmail(auth, email) }
    finally { setLoading(false) }
  }

  const signOut = async () => {
    setLoading(true)
    try { await firebaseSignOut(auth); setUser(null) }
    finally { setLoading(false) }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, register, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
