"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { AuthProvider } from "@/contexts/auth-context"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { useAuth } from "@/contexts/auth-context"

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  
  // Check if current page is login or register
  const isAuthPage = pathname === '/login' || pathname === '/register'
  
  // Show sidebar only if authenticated and not on auth pages
  const showSidebar = isAuthenticated && !isAuthPage

  if (showSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    )
  }

  // No sidebar for login/register pages or when not authenticated
  return <>{children}</>
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <LayoutContent>{children}</LayoutContent>
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </AuthGuard>
    </AuthProvider>
  )
}
