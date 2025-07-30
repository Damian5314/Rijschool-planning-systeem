"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Car, Eye, EyeOff, Lock, Mail, Shield, Users, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    wachtwoord: "",
  })

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (data.success) {
        // Store authentication data
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        localStorage.setItem('isLoggedIn', 'true')
        
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true')
        }

        toast({
          title: "Succesvol ingelogd!",
          description: `Welkom terug, ${data.data.user.naam}`,
        })

        // Redirect to dashboard
        router.push("/")
      } else {
        toast({
          title: "Login mislukt",
          description: data.message || "Controleer je email en wachtwoord",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Verbindingsfout",
        description: "Er ging iets mis bij het inloggen. Probeer het opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (email: string, password: string, role: string) => {
    setLoginData({ email, wachtwoord: password })
    setIsLoading(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, wachtwoord: password }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        localStorage.setItem('isLoggedIn', 'true')

        toast({
          title: `Demo login als ${role}`,
          description: "Je bent ingelogd met demo gegevens",
        })

        router.push("/")
      } else {
        toast({
          title: "Demo login mislukt",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Verbindingsfout",
        description: "Er ging iets mis bij de demo login.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Linker kant - Branding & Features */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Rijschool Plansysteem Pro
                </h1>
                <p className="text-gray-600">Het complete beheersysteem voor rijscholen</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Leerling Management</h3>
                <p className="text-gray-600 text-sm">
                  Beheer al je leerlingen, hun voortgang en contracten op één centrale plek
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Voertuig Beheer</h3>
                <p className="text-gray-600 text-sm">
                  Houd je wagenpark bij, plan onderhoud en monitor kilometerstanden
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Examen Planning</h3>
                <p className="text-gray-600 text-sm">
                  Plan examens, volg resultaten en behoud overzicht van slagingspercentages
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Veilig & Betrouwbaar</h3>
                <p className="text-gray-600 text-sm">
                  Je gegevens zijn veilig opgeslagen met automatische backups en encryptie
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-200/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="font-semibold text-gray-900">Vertrouwd door 500+ rijscholen</span>
            </div>
            <p className="text-gray-600 text-sm">
              "Sinds we Rijschool Plansysteem Pro gebruiken, hebben we 40% meer tijd voor onze leerlingen en is onze
              administratie volledig geautomatiseerd."
            </p>
            <p className="text-gray-500 text-xs mt-2">- Jan Bakker, Rijschool De Veilige Weg</p>
          </div>
        </div>

        {/* Rechter kant - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="glass-effect border-0 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Welkom terug</CardTitle>
              <CardDescription>Log in op je rijschool account om verder te gaan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email adres</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="naam@rijschool.nl"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="pl-10 bg-white/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Wachtwoord</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginData.wachtwoord}
                      onChange={(e) => setLoginData({ ...loginData, wachtwoord: e.target.value })}
                      className="pl-10 pr-10 bg-white/50"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Onthoud mij
                    </Label>
                  </div>
                  <Button variant="link" className="px-0 text-sm">
                    Wachtwoord vergeten?
                  </Button>
                </div>

                <Button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Bezig met inloggen..." : "Inloggen"}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Of probeer demo</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin("admin@rijschool.nl", "admin123", "Admin")}
                  disabled={isLoading}
                  className="bg-white/50"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Admin
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin("instructeur@rijschool.nl", "instructeur123", "Instructeur")}
                  disabled={isLoading}
                  className="bg-white/50"
                >
                  <Car className="h-4 w-4 mr-2" />
                  Instructeur
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inloggen...
                </>
              ) : (
                "Inloggen"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Heb je nog geen account?{" "}
            <Link href="/register" className="underline">
              Registreren
            </Link>
          </div>
          <div className="mt-2 text-xs text-center text-muted-foreground">
            Demo: admin@rijschool.nl / admin123
          </div>
        </CardContent>
      </Card>
    </div>
  )
}