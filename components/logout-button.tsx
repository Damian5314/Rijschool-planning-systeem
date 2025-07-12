"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LogoutButton() {
  const { toast } = useToast()

  const handleLogout = () => {
    // Clear authentication
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")

    toast({
      title: "Uitgelogd",
      description: "Je bent succesvol uitgelogd",
    })

    // Redirect to login
    window.location.href = "/login"
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Uitloggen
    </Button>
  )
}
