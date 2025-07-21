"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    // Define paths that do not require authentication
    const publicPaths = ["/login", "/register"]

    if (token && user) {
      setIsAuthenticated(true)
      // If on a public path and authenticated, redirect to dashboard
      if (publicPaths.includes(pathname)) {
        router.push("/")
      }
    } else {
      setIsAuthenticated(false)
      // If not authenticated and trying to access a protected path, redirect to login
      if (!publicPaths.includes(pathname)) {
        toast({
          title: "Niet geautoriseerd",
          description: "U moet inloggen om deze pagina te bekijken.",
          variant: "destructive",
        })
        router.push("/login")
      }
    }
  }, [pathname, router])

  // Render children only if authenticated or if it's a public path
  if (isAuthenticated || ["/login", "/register"].includes(pathname)) {
    return <>{children}</>
  }

  // Optionally, render a loading spinner or null while checking auth status
  return null
}
