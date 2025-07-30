'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, User } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (naam: string, email: string, password: string, rol?: string) => Promise<boolean>
  updateProfile: (userData: Partial<User>) => void
  isAuthenticated: boolean
  isEigenaar: boolean
  isInstructeur: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await api.getProfile()
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('auth_token')
        api.removeToken()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth_token')
      api.removeToken()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await api.login(email, password)
      
      if (response.success && response.data) {
        setUser(response.data.user)
        toast.success('Succesvol ingelogd!')
        return true
      } else {
        toast.error(response.message || 'Login mislukt')
        return false
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      toast.error(error.message || 'Login mislukt')
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (naam: string, email: string, password: string, rol?: string): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await api.register(naam, email, password, rol)
      
      if (response.success) {
        toast.success('Account succesvol aangemaakt! Je kunt nu inloggen.')
        return true
      } else {
        toast.error(response.message || 'Registratie mislukt')
        return false
      }
    } catch (error: any) {
      console.error('Registration failed:', error)
      toast.error(error.message || 'Registratie mislukt')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    api.removeToken()
    toast.success('Succesvol uitgelogd')
    router.push('/login')
  }

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated: !!user,
    isEigenaar: user?.rol === 'eigenaar',
    isInstructeur: user?.rol === 'instructeur' || user?.rol === 'eigenaar',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/login')
      }
    }, [isAuthenticated, loading, router])

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}

// HOC for eigenaar-only routes
export function withEigenaarAuth<P extends object>(Component: React.ComponentType<P>) {
  return function EigenaarAuthenticatedComponent(props: P) {
    const { isAuthenticated, isEigenaar, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          router.push('/login')
        } else if (!isEigenaar) {
          router.push('/')
          toast.error('Je hebt geen toegang tot deze pagina')
        }
      }
    }, [isAuthenticated, isEigenaar, loading, router])

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )
    }

    if (!isAuthenticated || !isEigenaar) {
      return null
    }

    return <Component {...props} />
  }
}