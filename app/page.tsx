"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Users, Calendar, Award, Car, CheckCircle, Clock, FileText, Download, MapPin, Plus, Edit } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    activeLeerlingen: 45,
    totaalLessen: 128,
    slagingspercentage: 78,
    dezeWeekLessen: 32,
    automaat: 28,
    schakel: 17,
  })

  const [onboardingTaken, setOnboardingTaken] = useState([
    { id: 1, titel: "Eerste leerling invoeren", voltooid: true },
    { id: 2, titel: "Eerste afspraak inplannen", voltooid: true },
    { id: 3, titel: "Voertuigen instellen", voltooid: false },
    { id: 4, titel: "Leskaart inrichten", voltooid: false },
    { id: 5, titel: "Prijzen en pakketten instellen", voltooid: false },
    { id: 6, titel: "Logo instellen op je factuur", voltooid: false },
    { id: 7, titel: "iDeal activeren voor je rijschool", voltooid: false },
    { id: 8, titel: "PlanGo koppelen aan je CBR-account", voltooid: false },
  ])

  const [notities, setNotities] = useState([
    { id: 1, tekst: "Vergeet niet om de nieuwe auto op te halen vrijdag", datum: "11-07-2025" },
    { id: 2, tekst: "Emma's examen volgende week - extra oefening parkeren", datum: "10-07-2025" },
  ])

  const [newNotitie, setNewNotitie] = useState("")
  const [isNotitieDialogOpen, setIsNotitieDialogOpen] = useState(false)

  const komendExamens = [
    {
      id: 1,
      leerling: "Chenayra (automaat) Wijnstein",
      instructeur: "Leon Wilson",
      datum: "14-07-2025",
      tijd: "14:00",
      type: "Praktijkexamen",
      status: "Gepland",
    },
    {
      id: 2,
      leerling: "Demi (automaat) Amian",
      instructeur: "Leon Wilson",
      datum: "22-07-2025",
      tijd: "09:50",
      type: "Praktijkexamen",
      status: "Gepland",
    },
    {
      id: 3,
      leerling: "Shareen (Willes-automaat) Mook",
      instructeur: "Leon Wilson",
      datum: "23-07-2025",
      tijd: "11:30",
      type: "BNOR examen",
      status: "Gepland",
    },
  ]

  const getCurrentGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Goedemorgen"
    if (hour < 18) return "Goedemiddag"
    return "Goedenavond"
  }

  const toggleTaak = (id: number) => {
    setOnboardingTaken((taken) => taken.map((taak) => (taak.id === id ? { ...taak, voltooid: !taak.voltooid } : taak)))
    toast({
      title: "Taak bijgewerkt",
      description: "De taak status is succesvol gewijzigd.",
    })
  }

  const downloadAgenda = () => {
    toast({
      title: "Agenda downloaden",
      description: "Je agenda wordt gedownload als PDF...",
    })
  }

  const addNotitie = () => {
    if (newNotitie.trim()) {
      const nieuweNotitie = {
        id: notities.length + 1,
        tekst: newNotitie,
        datum: new Date().toLocaleDateString("nl-NL"),
      }
      setNotities([...notities, nieuweNotitie])
      setNewNotitie("")
      setIsNotitieDialogOpen(false)
      toast({
        title: "Notitie toegevoegd",
        description: "Je notitie is succesvol opgeslagen.",
      })
    }
  }

  const voltooidePercentage = Math.round(
    (onboardingTaken.filter((t) => t.voltooid).length / onboardingTaken.length) * 100,
  )

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen animate-fade-in">
      {/* Persoonlijke Begroeting */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{getCurrentGreeting()}, Leon Wilson!</h1>
            <p className="text-lg text-gray-600">Rijschool De Veilige Weg</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="w-24 h-16 bg-gradient-to-r from-gray-800 to-gray-600 rounded-lg flex items-center justify-center shadow-lg">
              <Car className="h-8 w-8 text-white" />
            </div>
            <div className="w-20 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
              <Car className="h-6 w-6 text-white transform rotate-12" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Op Dit Moment */}
        <Card className="lg:col-span-1 card-hover glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>OP DIT MOMENT</span>
            </CardTitle>
            <CardDescription>Op dit moment zijn er geen afspraken</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={downloadAgenda} className="bg-white/50">
                <Download className="h-4 w-4 mr-2" />
                Download agenda vandaag
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="bg-white/50">
                <Calendar className="h-4 w-4 mr-2" />
                Morgen
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="bg-white/50">
                <MapPin className="h-4 w-4 mr-2" />
                Kilometerstand
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Examens en Toetsen */}
        <Card className="lg:col-span-1 card-hover glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span>EXAMENS EN TOETSEN</span>
            </CardTitle>
            <CardDescription>Aankomende dagen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {komendExamens.map((examen) => (
                <div key={examen.id} className="flex items-start space-x-3 p-3 bg-white/30 rounded-lg backdrop-blur-sm">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-white">
                      {examen.leerling.split(" ")[0].substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(examen.datum).toLocaleDateString("nl-NL")} {examen.tijd}
                    </div>
                    <div className="text-sm text-gray-600">{examen.leerling}</div>
                    <div className="text-xs text-gray-500">{examen.type}</div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Gepland
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Taken Checklist */}
        <Card className="lg:col-span-1 card-hover glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Alle taken</span>
              <Button variant="ghost" size="sm">
                +
              </Button>
            </CardTitle>
            <CardDescription>
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${voltooidePercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{voltooidePercentage}%</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {onboardingTaken.slice(0, 6).map((taak) => (
                <div key={taak.id} className="flex items-center space-x-3">
                  <Checkbox
                    checked={taak.voltooid}
                    onCheckedChange={() => toggleTaak(taak.id)}
                    className="data-[state=checked]:bg-green-500"
                  />
                  <span className={`text-sm ${taak.voltooid ? "line-through text-gray-500" : "text-gray-900"}`}>
                    {taak.titel}
                  </span>
                  {taak.voltooid && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
              ))}
              {onboardingTaken.length > 6 && (
                <Button variant="ghost" size="sm" className="w-full">
                  Toon alle taken ({onboardingTaken.length - 6} meer)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistieken */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Leerlingen</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {stats.activeLeerlingen}
            </div>
            <p className="text-xs text-muted-foreground">+12% ten opzichte van vorige maand</p>
          </CardContent>
        </Card>

        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessen Deze Week</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {stats.dezeWeekLessen}
            </div>
            <p className="text-xs text-muted-foreground">Van {stats.totaalLessen} totaal gepland</p>
          </CardContent>
        </Card>

        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slagingspercentage</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              {stats.slagingspercentage}%
            </div>
            <p className="text-xs text-muted-foreground">+5% ten opzichte van vorig kwartaal</p>
          </CardContent>
        </Card>

        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automaat vs Schakel</CardTitle>
            <Car className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {stats.automaat}/{stats.schakel}
            </div>
            <p className="text-xs text-muted-foreground">Automaat / Schakel leerlingen</p>
          </CardContent>
        </Card>
      </div>

      {/* Notities */}
      <Card className="card-hover glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <CardTitle>NOTITIES</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                <span>vrijdag</span>
                <span className="ml-2">11-07-2025</span>
              </div>
              <Dialog open={isNotitieDialogOpen} onOpenChange={setIsNotitieDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Notitie toevoegen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nieuwe Notitie</DialogTitle>
                    <DialogDescription>Voeg een nieuwe notitie toe aan je dashboard.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notitie">Notitie</Label>
                      <Textarea
                        id="notitie"
                        placeholder="Typ je notitie hier..."
                        value={newNotitie}
                        onChange={(e) => setNewNotitie(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNotitieDialogOpen(false)}>
                      Annuleren
                    </Button>
                    <Button onClick={addNotitie} className="bg-gradient-to-r from-blue-500 to-purple-500">
                      Notitie opslaan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Geen notities</p>
          ) : (
            <div className="space-y-3">
              {notities.map((notitie) => (
                <div
                  key={notitie.id}
                  className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{notitie.tekst}</p>
                      <p className="text-xs text-gray-500 mt-1">{notitie.datum}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
