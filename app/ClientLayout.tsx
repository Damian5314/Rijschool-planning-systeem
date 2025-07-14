"use client"

import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { AuthGuard } from "@/components/auth-guard"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

function ConditionalSidebar() {
  const pathname = usePathname()

  // Don't show sidebar on auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null
  }

  return <Sidebar />
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <ConditionalSidebar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50">
          {children}
        </main>
      </div>
      <Toaster />
    </AuthGuard>
  )
}
