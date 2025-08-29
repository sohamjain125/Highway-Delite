import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService } from '../services/authService'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (data: SignUpData) => Promise<void>
  verifyOTP: (data: OTPData) => Promise<void>
  signIn: (data: SignInData) => Promise<void>
  signOut: () => Promise<void>
  resendOTP: (email: string) => Promise<void>
}

interface SignUpData {
  name: string
  email: string
  dateOfBirth?: string
}

interface OTPData {
  email: string
  otp: string
}

interface SignInData {
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const signUp = async (data: SignUpData) => {
    try {
      await authService.signUp(data)
    } catch (error) {
      throw error
    }
  }

  const verifyOTP = async (data: OTPData) => {
    try {
      const response = await authService.verifyOTP(data)
      const { token, user: userData } = response
      localStorage.setItem('token', token)
      setUser(userData)
    } catch (error) {
      throw error
    }
  }

  const signIn = async (data: SignInData) => {
    try {
      const response = await authService.signIn(data)
      const { token, user: userData } = response
      localStorage.setItem('token', token)
      setUser(userData)
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      localStorage.removeItem('token')
      setUser(null)
    } catch (error) {
      console.error('Sign out failed:', error)
      // Still clear local state even if API call fails
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  const resendOTP = async (email: string) => {
    try {
      await authService.resendOTP(email)
    } catch (error) {
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    verifyOTP,
    signIn,
    signOut,
    resendOTP
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
