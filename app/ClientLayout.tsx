"use client"

import type React from "react"

import { Toaster } from "@/components/ui/toaster"
import { AuthGuard } from "@/components/auth-guard"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <AuthGuard>{children}</AuthGuard>
      <Toaster />
    </SidebarProvider>
  )
}
