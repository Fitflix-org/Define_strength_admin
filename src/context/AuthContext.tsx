import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { User } from '../types'
import { authAPI } from '../services/api'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const queryClient = useQueryClient()

  // Check if user has a valid token
  const token = localStorage.getItem('admin_token')

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authAPI.getProfile()
      // Backend returns { user } at top-level
      return (response.data as any).user
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    if (user && !error) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
      if (error) {
        // Clear invalid token
        localStorage.removeItem('admin_token')
      }
    }
  }, [user, error])

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password)
      // Backend returns { accessToken, user } at top-level
      const { accessToken: newToken, user: userData } = (response.data as any)

      // Store token
      localStorage.setItem('admin_token', newToken)

      // Update query cache
      queryClient.setQueryData(['auth', 'me'], userData)
      setIsAuthenticated(true)
    } catch (error: any) {
      localStorage.removeItem('admin_token')
      setIsAuthenticated(false)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setIsAuthenticated(false)
    queryClient.clear()
    authAPI.logout()
  }

  const value = {
    user: user || null,
    login,
    logout,
    isLoading: isLoading && !!token,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}