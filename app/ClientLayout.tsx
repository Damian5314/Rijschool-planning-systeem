"use client"

import type React from "react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { AuthGuard } from "@/components/auth-guard"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar />
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </SidebarProvider>
      <Toaster />
    </AuthGuard>
  )
}
