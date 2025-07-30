"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Calendar, Award, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Examen {
  id: number
  leerling: string
  instructeur: string
  datum: string
  tijd: string
  transmissie: string
  type: string
  status: string
  locatie: string
  opmerkingen: string
  resultaat?: string
  punten?: number
}

export default function Examens() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<"gepland" | "afgerond">("gepland")
  const [examens, setExamens] = useState<Examen[]>([])
  const [loading, setLoading] = useState(true)

  const [newExamen, setNewExamen] = useState({
    leerling: "",
    instructeur: "",
    datum: "",
    tijd: "",
    type: "Praktijkexamen",
    locatie: "",
    opmerkingen: "",
  })

  // Mock data - vervang door echte API calls
  useEffect(() => {
    const mockExamens: Examen[] = [
      {
        id: 1,
        leerling: "Tom Jansen",
        instructeur: "Jan Bakker",
        datum: "2024-12-25",
        tijd: "10:30",
        transmissie: "Schakel",
        type: "Praktijkexamen",
        status: "Gepland",
        locatie: "CBR Centrum Barendrecht",
        opmerkingen: "Eerste examenpoging",
      },
      {
        id: 2,
        leerling: "Sophie Willems",
        instructeur: "Lisa de Vries",
        datum: "2024-12-20",
        tijd: "14:00",
        transmissie: "Automaat",
        type: "Praktijkexamen",
        status: "Geslaagd",
        locatie: "CBR Centrum Barendrecht",
        opmerkingen: "Uitstekend gereden, geen fouten",
        resultaat: "Geslaagd",
        punten: 0,
      },
      {
        id: 3,
        leerling: "David Smit",
        instructeur: "Mark Peters",
        datum: "2024-12-15",
        tijd: "09:00",
        transmissie: "Schakel",
        type: "Praktijkexamen",
        status: "Gezakt",
        locatie: "CBR Centrum Rotterdam",
        opmerkingen: "Problemen met parkeren en voorrang",
        resultaat: "Gezakt",
        punten: 8,
      },
    ]
    
    setExamens(mockExamens)
    setLoading(false)
  }, [])

  const geplandeExamens = examens.filter((e) => e.status === "Gepland")
  const afgerondeExamens = examens.filter((e) => e.status !== "Gepland")

  const currentExamens = selectedTab === "gepland" ? geplandeExamens : afgerondeExamens

  const filteredExamens = currentExamens.filter(
    (examen) =>
      examen.leerling.toLowerCase().includes(searchTerm.toLowerCase()) ||
      examen.instructeur.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Gepland":
        return "bg-blue-100 text-blue-800"
      case "Geslaagd":
        return "bg-green-100 text-green-800"
      case "Gezakt":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Gepland":
        return <AlertCircle className="h-4 w-4" />
      case "Geslaagd":
        return <CheckCircle className="h-4 w-4" />
      case "Gezakt":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleCreateExamen = () => {
    if (!newExamen.leerling || !newExamen.instructeur || !newExamen.datum || !newExamen.tijd) {
      toast({
        title: "Validatiefout",
        description: "Vul alle verplichte velden in",
        variant: "destructive",
      })
      return
    }

    const examen: Examen = {
      id: examens.length + 1,
      ...newExamen,
      transmissie: "Automaat", // Dit zou uit leerling data moeten komen
      status: "Gepland",
    }

    setExamens([...examens, examen])
    setNewExamen({
      leerling: "",
      instructeur: "",
      datum: "",
      tijd: "",
      type: "Praktijkexamen",
      locatie: "",
      opmerkingen: "",
    })
    setIsDialogOpen(false)

    toast({
      title: "Examen ingepland",
      description: `Examen voor ${newExamen.leerling} is succesvol ingepland`,
    })
  }

  const slagingspercentage = afgerondeExamens.length > 0 
    ? Math.round((afgerondeExamens.filter((e) => e.status === "Geslaagd").length / afgerondeExamens.length) * 100)
    : 0

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded mt-6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 min-h-screen animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Examens
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="mr-2 h-4 w-4" />
              Examen Inplannen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nieuw Examen Inplannen</DialogTitle>
              <DialogDescription>Plan een praktijkexamen in voor een leerling.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leerling" className="text-right">
                  Leerling
                </Label>
                <Select value={newExamen.leerling} onValueChange={(value) => setNewExamen({...newExamen, leerling: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecteer leerling" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Emma van der Berg">Emma van der Berg</SelectItem>
                    <SelectItem value="Tom Jansen">Tom Jansen</SelectItem>
                    <SelectItem value="Sophie Willems">Sophie Willems</SelectItem>
                    <SelectItem value="David Smit">David Smit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructeur" className="text-right">
                  Instructeur
                </Label>
                <Select value={newExamen.instructeur} onValueChange={(value) => setNewExamen({...newExamen, instructeur: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecteer instructeur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jan Bakker">Jan Bakker</SelectItem>
                    <SelectItem value="Lisa de Vries">Lisa de Vries</SelectItem>
                    <SelectItem value="Mark Peters">Mark Peters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="datum" className="text-right">
                  Datum
                </Label>
                <Input 
                  id="datum" 
                  type="date" 
                  className="col-span-3" 
                  value={newExamen.datum}
                  onChange={(e) => setNewExamen({...newExamen, datum: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tijd" className="text-right">
                  Tijd
                </Label>
                <Input 
                  id="tijd" 
                  type="time" 
                  className="col-span-3" 
                  value={newExamen.tijd}
                  onChange={(e) => setNewExamen({...newExamen, tijd: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="locatie" className="text-right">
                  Locatie
                </Label>
                <Select value={newExamen.locatie} onValueChange={(value) => setNewExamen({...newExamen, locatie: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecteer CBR locatie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBR Centrum Rotterdam">CBR Centrum Rotterdam</SelectItem>
                    <SelectItem value="CBR Centrum Barendrecht">CBR Centrum Barendrecht</SelectItem>
                    <SelectItem value="CBR Centrum Rijswijk">CBR Centrum Rijswijk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="opmerkingen" className="text-right">
                  Opmerkingen
                </Label>
                <Textarea 
                  id="opmerkingen" 
                  className="col-span-3" 
                  rows={3} 
                  value={newExamen.opmerkingen}
                  onChange={(e) => setNewExamen({...newExamen, opmerkingen: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleCreateExamen}>
                Examen Inplannen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistieken Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geplande Examens</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {geplandeExamens.length}
            </div>
            <p className="text-xs text-muted-foreground">Komende examens</p>
          </CardContent>
        </Card>

        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slagingspercentage</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {slagingspercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              {afgerondeExamens.filter((e) => e.status === "Geslaagd").length} van {afgerondeExamens.length} geslaagd
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deze Week</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              {examens.filter((e) => {
                const examenDatum = new Date(e.datum)
                const nu = new Date()
                const weekStart = new Date(nu.setDate(nu.getDate() - nu.getDay()))
                const weekEnd = new Date(nu.setDate(nu.getDate() - nu.getDay() + 6))
                return examenDatum >= weekStart && examenDatum <= weekEnd
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Examens deze week</p>
          </CardContent>
        </Card>

        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemiddelde Punten</CardTitle>
            <User className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {afgerondeExamens.length > 0 
                ? Math.round(afgerondeExamens.reduce((acc, e) => acc + (e.punten || 0), 0) / afgerondeExamens.length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Foutpunten per examen</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={selectedTab === "gepland" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab("gepland")}
        >
          Geplande Examens ({geplandeExamens.length})
        </Button>
        <Button
          variant={selectedTab === "afgerond" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab("afgerond")}
        >
          Afgeronde Examens ({afgerondeExamens.length})
        </Button>
      </div>

      <Card className="card-hover glass-effect">
        <CardHeader>
          <CardTitle>{selectedTab === "gepland" ? "Geplande Examens" : "Afgeronde Examens"}</CardTitle>
          <CardDescription>
            {selectedTab === "gepland"
              ? "Overzicht van alle geplande praktijkexamens"
              : "Resultaten van afgeronde praktijkexamens"}
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek examens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-white/50"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leerling</TableHead>
                <TableHead>Instructeur</TableHead>
                <TableHead>Datum & Tijd</TableHead>
                <TableHead>Transmissie</TableHead>
                <TableHead>Locatie</TableHead>
                <TableHead>Status</TableHead>
                {selectedTab === "afgerond" && <TableHead>Resultaat</TableHead>}
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExamens.map((examen) => (
                <TableRow key={examen.id}>
                  <TableCell className="font-medium">{examen.leerling}</TableCell>
                  <TableCell>{examen.instructeur}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">{new Date(examen.datum).toLocaleDateString("nl-NL")}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">{examen.tijd}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={examen.transmissie === "Automaat" ? "default" : "secondary"}>
                      {examen.transmissie}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{examen.locatie}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(examen.status)}
                      <Badge className={getStatusColor(examen.status)}>{examen.status}</Badge>
                    </div>
                  </TableCell>
                  {selectedTab === "afgerond" && (
                    <TableCell>
                      {examen.punten !== undefined && (
                        <div className="text-sm">
                          <div className={examen.status === "Geslaagd" ? "text-green-600" : "text-red-600"}>
                            {examen.punten} foutpunten
                          </div>
                        </div>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {selectedTab === "gepland" && examen.status === "Gepland" && (
                        <Button variant="ghost" size="sm">
                          <Award className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}