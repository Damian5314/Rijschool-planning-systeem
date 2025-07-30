"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Car, Eye, EyeOff, Lock, Mail, User, Building, Phone, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)

  const [registerData, setRegisterData] = useState({
    // Persoonlijke gegevens
    voornaam: "",
    achternaam: "",
    email: "",
    telefoon: "",
    password: "",
    confirmPassword: "",

    // Rijschool gegevens
    rijschoolNaam: "",
    kvkNummer: "",
    adres: "",
    postcode: "",
    plaats: "",
    website: "",
    aantalInstructeurs: "",
    aantalVoertuigen: "",
    beschrijving: "",
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptTerms || !acceptPrivacy) {
      toast({
        title: "Voorwaarden accepteren",
        description: "Je moet de algemene voorwaarden en privacyverklaring accepteren",
        variant: "destructive",
      })
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Wachtwoorden komen niet overeen",
        description: "Controleer je wachtwoord en probeer opnieuw",
        variant: "destructive",
      })
      return
    }

    if (registerData.password.length < 6) {
      toast({
        title: "Wachtwoord te kort",
        description: "Het wachtwoord moet minimaal 6 karakters bevatten",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simuleer registratie proces
    setTimeout(() => {
      toast({
        title: "Account succesvol aangemaakt!",
        description: "Je kunt nu inloggen met je nieuwe account",
      })
      router.push("/login")
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rijschool Plansysteem Pro
            </h1>
          </div>
          <p className="text-gray-600">Start je 30-dagen gratis proefperiode</p>
        </div>

        <Card className="glass-effect border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Registreer je rijschool</CardTitle>
            <CardDescription>
              Vul je gegevens in om te beginnen met het beste plansysteem voor rijscholen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-8">
              {/* Persoonlijke gegevens */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Persoonlijke gegevens</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="voornaam">Voornaam *</Label>
                    <Input
                      id="voornaam"
                      placeholder="Jan"
                      value={registerData.voornaam}
                      onChange={(e) => setRegisterData({ ...registerData, voornaam: e.target.value })}
                      className="bg-white/50"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="achternaam">Achternaam *</Label>
                    <Input
                      id="achternaam"
                      placeholder="Bakker"
                      value={registerData.achternaam}
                      onChange={(e) => setRegisterData({ ...registerData, achternaam: e.target.value })}
                      className="bg-white/50"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email adres *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="jan@rijschool.nl"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="pl-10 bg-white/50"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="telefoon">Telefoon *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="telefoon"
                        placeholder="06-12345678"
                        value={registerData.telefoon}
                        onChange={(e) => setRegisterData({ ...registerData, telefoon: e.target.value })}
                        className="pl-10 bg-white/50"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Wachtwoord *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
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
                  <div>
                    <Label htmlFor="confirmPassword">Bevestig wachtwoord *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className="pl-10 pr-10 bg-white/50"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rijschool gegevens */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Rijschool gegevens</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rijschoolNaam">Rijschool naam *</Label>
                    <Input
                      id="rijschoolNaam"
                      placeholder="Rijschool De Veilige Weg"
                      value={registerData.rijschoolNaam}
                      onChange={(e) => setRegisterData({ ...registerData, rijschoolNaam: e.target.value })}
                      className="bg-white/50"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="kvkNummer">KvK nummer</Label>
                    <Input
                      id="kvkNummer"
                      placeholder="12345678"
                      value={registerData.kvkNummer}
                      onChange={(e) => setRegisterData({ ...registerData, kvkNummer: e.target.value })}
                      className="bg-white/50"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="adres">Adres *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="adres"
                      placeholder="Hoofdstraat 123"
                      value={registerData.adres}
                      onChange={(e) => setRegisterData({ ...registerData, adres: e.target.value })}
                      className="pl-10 bg-white/50"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      placeholder="1234 AB"
                      value={registerData.postcode}
                      onChange={(e) => setRegisterData({ ...registerData, postcode: e.target.value.toUpperCase() })}
                      className="bg-white/50"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="plaats">Plaats *</Label>
                    <Input
                      id="plaats"
                      placeholder="Amsterdam"
                      value={registerData.plaats}
                      onChange={(e) => setRegisterData({ ...registerData, plaats: e.target.value })}
                      className="bg-white/50"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="www.rijschool.nl"
                    value={registerData.website}
                    onChange={(e) => setRegisterData({ ...registerData, website: e.target.value })}
                    className="bg-white/50"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="aantalInstructeurs">Aantal instructeurs</Label>
                    <Select
                      value={registerData.aantalInstructeurs}
                      onValueChange={(value) => setRegisterData({ ...registerData, aantalInstructeurs: value })}
                    >
                      <SelectTrigger className="bg-white/50">
                        <SelectValue placeholder="Selecteer aantal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 instructeur</SelectItem>
                        <SelectItem value="2-5">2-5 instructeurs</SelectItem>
                        <SelectItem value="6-10">6-10 instructeurs</SelectItem>
                        <SelectItem value="11+">11+ instructeurs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="aantalVoertuigen">Aantal voertuigen</Label>
                    <Select
                      value={registerData.aantalVoertuigen}
                      onValueChange={(value) => setRegisterData({ ...registerData, aantalVoertuigen: value })}
                    >
                      <SelectTrigger className="bg-white/50">
                        <SelectValue placeholder="Selecteer aantal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 voertuig</SelectItem>
                        <SelectItem value="2-5">2-5 voertuigen</SelectItem>
                        <SelectItem value="6-10">6-10 voertuigen</SelectItem>
                        <SelectItem value="11+">11+ voertuigen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="beschrijving">Beschrijving (optioneel)</Label>
                  <Textarea
                    id="beschrijving"
                    placeholder="Vertel iets over je rijschool..."
                    value={registerData.beschrijving}
                    onChange={(e) => setRegisterData({ ...registerData, beschrijving: e.target.value })}
                    className="bg-white/50"
                    rows={3}
                  />
                </div>
              </div>

              {/* Voorwaarden */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    Ik ga akkoord met de{" "}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      algemene voorwaarden
                    </Link>{" "}
                    en{" "}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      privacyverklaring
                    </Link>
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="privacy"
                    checked={acceptPrivacy}
                    onCheckedChange={(checked) => setAcceptPrivacy(checked as boolean)}
                  />
                  <Label htmlFor="privacy" className="text-sm leading-relaxed">
                    Ik ga akkoord met het verwerken van mijn gegevens voor het aanmaken van een account
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? "Account aanmaken..." : "Start gratis proefperiode"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Heb je al een account?{" "}
                  <Link href="/login" className="text-blue-600 hover:underline font-medium">
                    Log hier in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>30 dagen gratis proberen • Geen creditcard vereist • Direct beginnen</p>
        </div>
      </div>
    </div>
  )
}