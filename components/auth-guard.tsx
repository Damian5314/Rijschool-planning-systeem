"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      try {
        const isLoggedIn = localStorage.getItem("isLoggedIn")
        const role = localStorage.getItem("userRole")
        const email = localStorage.getItem("userEmail")

        if (isLoggedIn === "true" && email) {
          setIsAuthenticated(true)
          setUserRole(role)
        } else {
          setIsAuthenticated(false)
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router, pathname])

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Bezig met laden...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  // Role-based access control (optional - can be extended)
  const hasAccess = () => {
    // For now, all authenticated users have access
    // You can add role-based restrictions here if needed
    return true
  }

  if (!hasAccess()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-red-600 text-center">
              Je hebt geen toegang tot deze pagina.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}