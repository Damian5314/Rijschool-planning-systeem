"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function LogoutButton() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = () => {
    localStorage.removeItem("token") // Remove the stored token
    toast({
      title: "Uitgelogd",
      description: "U bent succesvol uitgelogd.",
    })
    router.push("/login") // Redirect to login page
  }

  return (
    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Uitloggen
    </Button>
  )
}
