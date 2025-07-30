"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { AuthGuard } from "@/components/auth-guard"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/register"

  if (isAuthPage) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">{children}</div>
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AuthGuard>
  )
}