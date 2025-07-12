"use client"

import { useState } from "react"
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

export default function Examens() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<"gepland" | "afgerond">("gepland")

  const [examens] = useState([
    {
      id: 1,
      leerling: "Tom Jansen",
      instructeur: "Jan Bakker",
      datum: "2024-01-15",
      tijd: "10:30",
      transmissie: "Schakel",
      type: "Praktijkexamen",
      status: "Gepland",
      locatie: "CBR Centrum Amsterdam",
      opmerkingen: "Eerste examenpoging",
    },
    {
      id: 2,
      leerling: "Sophie Willems",
      instructeur: "Lisa de Vries",
      datum: "2024-01-12",
      tijd: "14:00",
      transmissie: "Automaat",
      type: "Praktijkexamen",
      status: "Geslaagd",
      locatie: "CBR Centrum Amsterdam",
      opmerkingen: "Uitstekend gereden, geen fouten",
      resultaat: "Geslaagd",
      punten: 0,
    },
    {
      id: 3,
      leerling: "David Smit",
      instructeur: "Mark Peters",
      datum: "2024-01-10",
      tijd: "09:00",
      transmissie: "Schakel",
      type: "Praktijkexamen",
      status: "Gezakt",
      locatie: "CBR Centrum Amsterdam",
      opmerkingen: "Problemen met parkeren en voorrang",
      resultaat: "Gezakt",
      punten: 8,
    },
    {
      id: 4,
      leerling: "Emma van der Berg",
      instructeur: "Jan Bakker",
      datum: "2024-01-18",
      tijd: "11:00",
      transmissie: "Automaat",
      type: "Praktijkexamen",
      status: "Gepland",
      locatie: "CBR Centrum Haarlem",
      opmerkingen: "Tweede examenpoging",
    },
    {
      id: 5,
      leerling: "Lisa Bakker",
      instructeur: "Lisa de Vries",
      datum: "2024-01-08",
      tijd: "15:30",
      transmissie: "Automaat",
      type: "Praktijkexamen",
      status: "Geslaagd",
      locatie: "CBR Centrum Amsterdam",
      opmerkingen: "Zeer zelfverzekerd gereden",
      resultaat: "Geslaagd",
      punten: 2,
    },
  ])

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

  const slagingspercentage = Math.round(
    (afgerondeExamens.filter((e) => e.status === "Geslaagd").length / afgerondeExamens.length) * 100,
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Examens</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecteer leerling" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emma">Emma van der Berg</SelectItem>
                    <SelectItem value="tom">Tom Jansen</SelectItem>
                    <SelectItem value="sophie">Sophie Willems</SelectItem>
                    <SelectItem value="david">David Smit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructeur" className="text-right">
                  Instructeur
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecteer instructeur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jan">Jan Bakker</SelectItem>
                    <SelectItem value="lisa">Lisa de Vries</SelectItem>
                    <SelectItem value="mark">Mark Peters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="datum" className="text-right">
                  Datum
                </Label>
                <Input id="datum" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tijd" className="text-right">
                  Tijd
                </Label>
                <Input id="tijd" type="time" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="locatie" className="text-right">
                  Locatie
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecteer CBR locatie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amsterdam">CBR Centrum Amsterdam</SelectItem>
                    <SelectItem value="haarlem">CBR Centrum Haarlem</SelectItem>
                    <SelectItem value="zaandam">CBR Centrum Zaandam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="opmerkingen" className="text-right">
                  Opmerkingen
                </Label>
                <Textarea id="opmerkingen" className="col-span-3" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsDialogOpen(false)}>
                Examen Inplannen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistieken Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geplande Examens</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{geplandeExamens.length}</div>
            <p className="text-xs text-muted-foreground">Komende examens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slagingspercentage</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slagingspercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {afgerondeExamens.filter((e) => e.status === "Geslaagd").length} van {afgerondeExamens.length} geslaagd
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deze Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {examens.filter((e) => e.datum >= "2024-01-08" && e.datum <= "2024-01-14").length}
            </div>
            <p className="text-xs text-muted-foreground">Examens deze week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemiddelde Punten</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(afgerondeExamens.reduce((acc, e) => acc + (e.punten || 0), 0) / afgerondeExamens.length)}
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

      <Card>
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
              className="max-w-sm"
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
