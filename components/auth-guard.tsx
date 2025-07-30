"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check for login and register pages
    if (pathname === '/login' || pathname === '/register') {
      return
    }

    // Redirect to login if not authenticated and not loading
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router, pathname])

  // Skip auth guard for login and register pages
  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Bezig met laden...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}