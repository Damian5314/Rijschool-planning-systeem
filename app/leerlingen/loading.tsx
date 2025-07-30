"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Car, Eye, EyeOff, Lock, Mail, Shield, Users, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Test credentials
    const validCredentials = [
      { email: "admin@rijschool.nl", password: "admin123", role: "Admin" },
      { email: "instructeur@rijschool.nl", password: "instructeur123", role: "Instructeur" },
      { email: "demo@rijschool.nl", password: "demo123", role: "Demo" },
      { email: "test@test.nl", password: "test", role: "Test" },
    ]

    // Simuleer login proces
    setTimeout(() => {
      const user = validCredentials.find(
        (cred) => cred.email === loginData.email && cred.password === loginData.password,
      )

      if (user || (loginData.email && loginData.password)) {
        // Set authentication in localStorage
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userRole", user?.role || "Gebruiker")
        localStorage.setItem("userEmail", loginData.email)

        toast({
          title: "Succesvol ingelogd!",
          description: `Welkom terug${user ? ` als ${user.role}` : ""}`,
        })

        // Redirect to dashboard
        router.push("/")
      } else {
        toast({
          title: "Login mislukt",
          description: "Controleer je email en wachtwoord",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }, 1000)
  }

  const handleDemoLogin = (role: string, credentials: {email: string, password: string}) => {
    setIsLoading(true)
    setLoginData(credentials)
    
    setTimeout(() => {
      // Set authentication in localStorage
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userRole", role)
      localStorage.setItem("userEmail", credentials.email)

      toast({
        title: `Demo login als ${role}`,
        description: "Je bent ingelogd met demo gegevens",
      })

      // Redirect to dashboard
      router.push("/")
      setIsLoading(false)
    }, 1000)
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
              <form onSubmit={handleLogin} className="space-y-4">
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
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Bezig met inloggen..." : "Inloggen"}
                </Button>
              </form>

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
                  onClick={() => handleDemoLogin("Admin", { email: "admin@rijschool.nl", password: "admin123" })}
                  disabled={isLoading}
                  className="bg-white/50"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Admin
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin("Instructeur", { email: "instructeur@rijschool.nl", password: "instructeur123" })}
                  disabled={isLoading}
                  className="bg-white/50"
                >
                  <Car className="h-4 w-4 mr-2" />
                  Instructeur
                </Button>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <h4 className="font-medium text-sm mb-2">Test Accounts:</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>
                    <strong>Admin:</strong> admin@rijschool.nl / admin123
                  </div>
                  <div>
                    <strong>Instructeur:</strong> instructeur@rijschool.nl / instructeur123
                  </div>
                  <div>
                    <strong>Demo:</strong> demo@rijschool.nl / demo123
                  </div>
                  <div>
                    <strong>Test:</strong> test@test.nl / test
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">Nog geen account?</p>
                <Link href="/register" className="text-sm font-medium text-blue-600 hover:underline">
                  Registreer je rijschool →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Beveiligd met 256-bit SSL encryptie</span>
          </div>
        </div>
      </div>

      {/* Mobile branding */}
      <div className="lg:hidden fixed top-4 left-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Car className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">Rijschool Pro</span>
        </div>
      </div>
    </div>
  )
}