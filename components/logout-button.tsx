"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function LogoutButton() {
  const { logout } = useAuth()

  return (
    <Button variant="ghost" className="w-full justify-start" onClick={logout}>
      <LogOut className="mr-2 h-4 w-4" />
      Uitloggen
    </Button>
  )
}
