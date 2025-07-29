"use client"

import type React from "react"

import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { AuthGuard } from "@/components/auth-guard"
import { AuthProvider } from "@/contexts/auth-context"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar />
        <AuthGuard>{children}</AuthGuard>
        <Toaster />
        <SonnerToaster richColors position="top-right" />
      </SidebarProvider>
    </AuthProvider>
  )
}
