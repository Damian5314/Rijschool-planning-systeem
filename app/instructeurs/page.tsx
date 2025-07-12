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
import { Plus, Search, Edit, Trash2, Phone, Mail, Calendar, Users, Award } from "lucide-react"

export default function Instructeurs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [instructeurs] = useState([
    {
      id: 1,
      naam: "Jan Bakker",
      email: "jan.bakker@rijschool.nl",
      telefoon: "06-11111111",
      specialisatie: "Automaat & Schakel",
      status: "Actief",
      leerlingen: 15,
      slagingspercentage: 85,
      ervaring: "8 jaar",
      beschikbaarheid: "Ma-Vr 8:00-18:00",
      startdatum: "2016-03-15",
    },
    {
      id: 2,
      naam: "Lisa de Vries",
      email: "lisa.devries@rijschool.nl",
      telefoon: "06-22222222",
      specialisatie: "Automaat",
      status: "Actief",
      leerlingen: 12,
      slagingspercentage: 75,
      ervaring: "5 jaar",
      beschikbaarheid: "Di-Za 9:00-17:00",
      startdatum: "2019-09-01",
    },
    {
      id: 3,
      naam: "Mark Peters",
      email: "mark.peters@rijschool.nl",
      telefoon: "06-33333333",
      specialisatie: "Schakel",
      status: "Actief",
      leerlingen: 11,
      slagingspercentage: 73,
      ervaring: "3 jaar",
      beschikbaarheid: "Ma-Do 10:00-19:00",
      startdatum: "2021-01-10",
    },
    {
      id: 4,
      naam: "Sarah Jansen",
      email: "sarah.jansen@rijschool.nl",
      telefoon: "06-44444444",
      specialisatie: "Automaat & Schakel",
      status: "Verlof",
      leerlingen: 0,
      slagingspercentage: 80,
      ervaring: "6 jaar",
      beschikbaarheid: "Tijdelijk niet beschikbaar",
      startdatum: "2018-05-20",
    },
  ])

  const filteredInstructeurs = instructeurs.filter(
    (instructeur) =>
      instructeur.naam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructeur.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Actief":
        return "bg-green-100 text-green-800"
      case "Verlof":
        return "bg-yellow-100 text-yellow-800"
      case "Inactief":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSpecialisatieColor = (specialisatie: string) => {
    if (specialisatie.includes("&")) return "bg-purple-100 text-purple-800"
    if (specialisatie === "Automaat") return "bg-blue-100 text-blue-800"
    return "bg-orange-100 text-orange-800"
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Instructeurs</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe Instructeur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nieuwe Instructeur Toevoegen</DialogTitle>
              <DialogDescription>Voer de gegevens van de nieuwe instructeur in.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="naam" className="text-right">
                  Naam
                </Label>
                <Input id="naam" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" type="email" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefoon" className="text-right">
                  Telefoon
                </Label>
                <Input id="telefoon" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specialisatie" className="text-right">
                  Specialisatie
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecteer specialisatie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automaat">Automaat</SelectItem>
                    <SelectItem value="schakel">Schakel</SelectItem>
                    <SelectItem value="beide">Automaat & Schakel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startdatum" className="text-right">
                  Startdatum
                </Label>
                <Input id="startdatum" type="date" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsDialogOpen(false)}>
                Instructeur Toevoegen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistieken Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Instructeurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructeurs.length}</div>
            <p className="text-xs text-muted-foreground">
              {instructeurs.filter((i) => i.status === "Actief").length} actief
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemiddeld Slagingspercentage</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(instructeurs.reduce((acc, i) => acc + i.slagingspercentage, 0) / instructeurs.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Alle instructeurs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Leerlingen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructeurs.reduce((acc, i) => acc + i.leerlingen, 0)}</div>
            <p className="text-xs text-muted-foreground">Actieve leerlingen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beschikbare Instructeurs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructeurs.filter((i) => i.status === "Actief").length}</div>
            <p className="text-xs text-muted-foreground">Voor nieuwe leerlingen</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructeurs Overzicht</CardTitle>
          <CardDescription>Beheer alle instructeurs en hun gegevens</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek instructeurs..."
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
                <TableHead>Naam</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Specialisatie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Leerlingen</TableHead>
                <TableHead>Slagingspercentage</TableHead>
                <TableHead>Ervaring</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstructeurs.map((instructeur) => (
                <TableRow key={instructeur.id}>
                  <TableCell className="font-medium">{instructeur.naam}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-sm">{instructeur.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span className="text-sm">{instructeur.telefoon}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSpecialisatieColor(instructeur.specialisatie)}>
                      {instructeur.specialisatie}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(instructeur.status)}>{instructeur.status}</Badge>
                  </TableCell>
                  <TableCell>{instructeur.leerlingen}</TableCell>
                  <TableCell>{instructeur.slagingspercentage}%</TableCell>
                  <TableCell>{instructeur.ervaring}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
