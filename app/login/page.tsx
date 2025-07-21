"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, wachtwoord: password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Inloggen mislukt")
      }

      const data = await response.json()
      localStorage.setItem("token", data.accessToken)
      localStorage.setItem("user", JSON.stringify(data.user))

      toast({
        title: "Succesvol ingelogd",
        description: "U wordt doorgestuurd naar het dashboard.",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Inlogfout",
        description: error.message || "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Voer uw e-mailadres hieronder in om in te loggen op uw account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Wachtwoord</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Wachtwoord vergeten?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Inloggen..." : "Inloggen"}
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              Inloggen met Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Heb je nog geen account?{" "}
            <Link href="/register" className="underline">
              Meld je aan
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
