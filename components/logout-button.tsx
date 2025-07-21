"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast({
      title: "Uitgelogd",
      description: "U bent succesvol uitgelogd.",
    })
    router.push("/login")
  }

  return (
    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Uitloggen
    </Button>
  )
}
