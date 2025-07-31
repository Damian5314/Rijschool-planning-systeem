"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Car, Eye, EyeOff, Lock, Mail, Shield, Users, Award, Loader2, CheckCircle, Calendar, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    wachtwoord: "",
  })
  
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(loginData.email, loginData.wachtwoord)
      
      if (success) {
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true')
        }
        router.push("/")
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error("Er ging iets mis bij het inloggen. Probeer het opnieuw.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (email: string, password: string, role: string) => {
    setIsLoading(true)
    
    try {
      const success = await login(email, password)
      
      if (success) {
        toast.success(`Demo login als ${role}`, {
          description: "Je bent ingelogd met demo gegevens"
        })
        router.push("/")
      }
    } catch (error) {
      toast.error("Er ging iets mis bij de demo login.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-300 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Linker kant - Branding & Features */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Car className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Rijschool <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PlanSysteem</span>
                </h1>
                <p className="text-slate-600 font-medium">Professioneel beheersysteem voor rijscholen</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Leerling Management</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Beheer al je leerlingen, hun voortgang en contracten in één overzichtelijk systeem
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Voertuig & Planning</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Optimaal wagenpark management met slimme planning en onderhoudstracking
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Examen Administratie</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Volledige examenplanning met automatische resultatenanalyse en rapportage
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 mb-1">Inzichten & Rapportage</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Uitgebreide analyses van prestaties, financiën en bedrijfsvoering
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl border border-blue-200/30 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 text-lg">Betrouwbaar systeem</span>
                <div className="flex items-center space-x-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                  <span className="text-slate-600 text-sm ml-2">(4.9/5)</span>
                </div>
              </div>
            </div>
            <blockquote className="text-slate-700 text-sm leading-relaxed italic">
              "Sinds we PlanSysteem gebruiken, hebben we 45% meer tijd voor onze leerlingen. 
              De administratie loopt volledig automatisch en onze slagingspercentages zijn merkbaar gestegen."
            </blockquote>
            <footer className="text-slate-500 text-xs mt-3 font-medium">
              — Petra van Dijk, Rijschool Veilig & Snel (Amsterdam)
            </footer>
          </div>
        </div>

        {/* Rechter kant - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl shadow-blue-900/10">
            <CardHeader className="space-y-2 text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">Welkom terug</CardTitle>
              <CardDescription className="text-slate-600">
                Log in om verder te gaan met je rijschool management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email adres
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="naam@rijschool.nl"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="pl-10 bg-white/70 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Wachtwoord
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      value={loginData.wachtwoord}
                      onChange={(e) => setLoginData({ ...loginData, wachtwoord: e.target.value })}
                      className="pl-10 pr-12 bg-white/70 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-10 w-10 hover:bg-slate-100 rounded-lg"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-slate-300"
                    />
                    <Label htmlFor="remember" className="text-sm text-slate-600">
                      Onthoud mij
                    </Label>
                  </div>
                  <Button variant="link" className="px-0 text-sm text-blue-600 hover:text-blue-700">
                    Wachtwoord vergeten?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium h-12 shadow-lg shadow-blue-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/30"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Bezig met inloggen...</span>
                    </div>
                  ) : (
                    "Inloggen"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-500 font-medium">Of probeer demo</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin("eigenaar@rijschool.nl", "eigenaar123", "Eigenaar")}
                  disabled={isLoading}
                  className="bg-white/70 border-slate-200 hover:bg-slate-50 h-11 font-medium"
                >
                  <Users className="h-4 w-4 mr-2 text-slate-600" />
                  <span className="text-slate-700">Eigenaar</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin("instructeur@rijschool.nl", "instructeur123", "Instructeur")}
                  disabled={isLoading}
                  className="bg-white/70 border-slate-200 hover:bg-slate-50 h-11 font-medium"
                >
                  <Car className="h-4 w-4 mr-2 text-slate-600" />
                  <span className="text-slate-700">Instructeur</span>
                </Button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-center text-sm text-slate-600">
                  Nog geen account?{" "}
                  <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium underline decoration-2 underline-offset-2">
                    Account aanmaken
                  </Link>
                </div>
                <div className="text-center">
                  <div className="inline-block px-3 py-1.5 bg-slate-100 rounded-lg">
                    <div className="text-xs text-slate-500 font-medium">Demo toegang:</div>
                    <div className="text-xs text-slate-600 font-mono">eigenaar@rijschool.nl / eigenaar123</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}