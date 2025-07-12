"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Car } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      try {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
        setIsAuthenticated(isLoggedIn)

        // If not authenticated and trying to access protected route
        if (!isLoggedIn && !pathname.startsWith("/login") && !pathname.startsWith("/register")) {
          router.push("/login")
        }
        // If authenticated and trying to access auth pages, redirect to dashboard
        else if (isLoggedIn && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
          router.push("/")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Small delay to prevent flash
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [pathname, router])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Car className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
