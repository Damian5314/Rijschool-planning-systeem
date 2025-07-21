"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const publicPaths = ["/login", "/register"]

    if (token) {
      // In a real app, you'd validate the token with your backend
      // For now, we just check for its presence
      setIsAuthenticated(true)
      setLoading(false)
      if (publicPaths.includes(pathname)) {
        router.push("/") // Redirect logged-in users from login/register pages
      }
    } else {
      setIsAuthenticated(false)
      setLoading(false)
      if (!publicPaths.includes(pathname)) {
        toast({
          title: "Niet geautoriseerd",
          description: "U moet inloggen om deze pagina te bekijken.",
          variant: "destructive",
        })
        router.push("/login") // Redirect unauthenticated users to login
      }
    }
  }, [pathname, router, toast])

  if (loading) {
    // You can render a loading spinner or skeleton here
    return <div className="flex items-center justify-center min-h-screen">Laden...</div>
  }

  // Render children only if authenticated or on a public path
  if (isAuthenticated || ["/login", "/register"].includes(pathname)) {
    return <>{children}</>
  }

  return null // Or a message like "Access Denied"
}
