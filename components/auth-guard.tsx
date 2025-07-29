"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { usePathname } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth()
  const pathname = usePathname()

  // Define paths that do not require authentication
  const publicPaths = ["/login", "/register"]
  const isPublicPath = publicPaths.includes(pathname)

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Allow public paths regardless of authentication status
  if (isPublicPath) {
    return <>{children}</>
  }

  // For protected paths, only render if authenticated
  if (isAuthenticated) {
    return <>{children}</>
  }

  // This case should be handled by the auth context redirecting to login
  return null
}
