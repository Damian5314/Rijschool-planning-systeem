"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Input } from "@/components/ui/input"
import { Plus, Clock, User, Car, Filter, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

export default function Planning() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedInstructeur, setSelectedInstructeur] = useState("alle")
  const [viewMode, setViewMode] = useState<"dag" | "week">("week")
  const [currentWeek, setCurrentWeek] = useState(0) // 0 = deze week

  const [afspraken] = useState([
    // Maandag
    {
      id: 1,
      type: "les",
      leerling: "Emma van der Berg",
      instructeur: "Jan Bakker",
      datum: "2024-01-08",
      tijd: "09:00",
      duur: 60,
      transmissie: "Automaat",
    },
    {
      id: 2,
      type: "les",
      leerling: "Sophie Willems",
      instructeur: "Lisa de Vries",
      datum: "2024-01-08",
      tijd: "10:00",
      duur: 60,
      transmissie: "Automaat",
    },
    // Dinsdag
    {
      id: 3,
      type: "examen",
      leerling: "Tom Jansen",
      instructeur: "Jan Bakker",
      datum: "2024-01-09",
      tijd: "10:30",
      duur: 90,
      transmissie: "Schakel",
    },
    {
      id: 4,
      type: "les",
      leerling: "David Smit",
      instructeur: "Mark Peters",
      datum: "2024-01-09",
      tijd: "14:00",
      duur: 60,
      transmissie: "Schakel",
    },
    // Woensdag
    {
      id: 5,
      type: "les",
      leerling: "Emma van der Berg",
      instructeur: "Jan Bakker",
      datum: "2024-01-10",
      tijd: "09:00",
      duur: 60,
      transmissie: "Automaat",
    },
    {
      id: 6,
      type: "examen",
      leerling: "Sophie Willems",
      instructeur: "Lisa de Vries",
      datum: "2024-01-10",
      tijd: "10:30",
      duur: 90,
      transmissie: "Automaat",
    },
    {
      id: 7,
      type: "les",
      leerling: "David Smit",
      instructeur: "Mark Peters",
      datum: "2024-01-10",
      tijd: "16:00",
      duur: 60,
      transmissie: "Schakel",
    },
    // Donderdag
    {
      id: 8,
      type: "les",
      leerling: "Tom Jansen",
      instructeur: "Jan Bakker",
      datum: "2024-01-11",
      tijd: "11:00",
      duur: 60,
      transmissie: "Schakel",
    },
    {
      id: 9,
      type: "les",
      leerling: "Emma van der Berg",
      instructeur: "Lisa de Vries",
      datum: "2024-01-11",
      tijd: "15:00",
      duur: 60,
      transmissie: "Automaat",
    },
    // Vrijdag
    {
      id: 10,
      type: "examen",
      leerling: "David Smit",
      instructeur: "Mark Peters",
      datum: "2024-01-12",
      tijd: "09:00",
      duur: 90,
      transmissie: "Schakel",
    },
    {
      id: 11,
      type: "les",
      leerling: "Sophie Willems",
      instructeur: "Jan Bakker",
      datum: "2024-01-12",
      tijd: "13:00",
      duur: 60,
      transmissie: "Automaat",
    },
  ])

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
  ]

  const instructeurs = ["Jan Bakker", "Lisa de Vries", "Mark Peters"]

  const weekDays = [
    { key: "2024-01-08", label: "Ma 8 Jan" },
    { key: "2024-01-09", label: "Di 9 Jan" },
    { key: "2024-01-10", label: "Wo 10 Jan" },
    { key: "2024-01-11", label: "Do 11 Jan" },
    { key: "2024-01-12", label: "Vr 12 Jan" },
  ]

  const filteredInstructeurs = selectedInstructeur === "alle" ? instructeurs : [selectedInstructeur]
  const filteredAfspraken =
    selectedInstructeur === "alle" ? afspraken : afspraken.filter((a) => a.instructeur === selectedInstructeur)

  const getAfspraakForTimeAndInstructeur = (tijd: string, instructeur: string, datum?: string) => {
    return filteredAfspraken.find(
      (a) => a.tijd === tijd && a.instructeur === instructeur && (!datum || a.datum === datum),
    )
  }

  const getWeekTitle = () => {
    if (currentWeek === 0) return "Deze Week"
    if (currentWeek === 1) return "Volgende Week"
    if (currentWeek === -1) return "Vorige Week"
    return `Week ${currentWeek > 0 ? "+" : ""}${currentWeek}`
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Planning</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe Afspraak
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nieuwe Afspraak Inplannen</DialogTitle>
              <DialogDescription>Plan een nieuwe les of examen in.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecteer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="les">Rijles</SelectItem>
                    <SelectItem value="examen">Examen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecteer tijd" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((tijd) => (
                      <SelectItem key={tijd} value={tijd}>
                        {tijd}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setIsDialogOpen(false)}>
                Afspraak Inplannen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters en View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <Select value={selectedInstructeur} onValueChange={setSelectedInstructeur}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter instructeur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle instructeurs</SelectItem>
                {instructeurs.map((instructeur) => (
                  <SelectItem key={instructeur} value={instructeur}>
                    {instructeur}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant={viewMode === "dag" ? "default" : "outline"} size="sm" onClick={() => setViewMode("dag")}>
              Dag
            </Button>
            <Button variant={viewMode === "week" ? "default" : "outline"} size="sm" onClick={() => setViewMode("week")}>
              Week
            </Button>
          </div>
        </div>

        {viewMode === "week" && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(currentWeek - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[100px] text-center">{getWeekTitle()}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(currentWeek + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planning Overzicht</CardTitle>
          <CardDescription>
            {viewMode === "week"
              ? `Weekplanning voor ${selectedInstructeur === "alle" ? "alle instructeurs" : selectedInstructeur} - 8-12 Januari 2024`
              : `Dagplanning voor ${selectedInstructeur === "alle" ? "alle instructeurs" : selectedInstructeur} - Woensdag 10 Januari 2024`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {viewMode === "week" ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-50 text-left font-medium">Tijd</th>
                    {weekDays.map((day) => (
                      <th key={day.key} className="border p-2 bg-gray-50 text-left font-medium min-w-[150px]">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{day.label}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((tijd) => (
                    <tr key={tijd}>
                      <td className="border p-2 font-medium bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{tijd}</span>
                        </div>
                      </td>
                      {weekDays.map((day) => {
                        const dayAfspraken = filteredAfspraken.filter((a) => a.datum === day.key && a.tijd === tijd)
                        return (
                          <td key={`${tijd}-${day.key}`} className="border p-2 align-top">
                            {dayAfspraken.length > 0 ? (
                              <div className="space-y-1">
                                {dayAfspraken.map((afspraak) => (
                                  <div key={afspraak.id} className="space-y-1">
                                    <Badge
                                      variant={afspraak.type === "examen" ? "destructive" : "default"}
                                      className="text-xs"
                                    >
                                      {afspraak.type === "examen" ? "EXAMEN" : "LES"}
                                    </Badge>
                                    <div className="text-xs font-medium">{afspraak.leerling}</div>
                                    <div className="text-xs text-gray-500">{afspraak.instructeur}</div>
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                      <Car className="h-3 w-3" />
                                      <span>{afspraak.transmissie}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-400 text-xs">Beschikbaar</div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-50 text-left font-medium">Tijd</th>
                    {filteredInstructeurs.map((instructeur) => (
                      <th key={instructeur} className="border p-2 bg-gray-50 text-left font-medium min-w-[200px]">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{instructeur}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((tijd) => (
                    <tr key={tijd}>
                      <td className="border p-2 font-medium bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{tijd}</span>
                        </div>
                      </td>
                      {filteredInstructeurs.map((instructeur) => {
                        const afspraak = getAfspraakForTimeAndInstructeur(tijd, instructeur, "2024-01-10")
                        return (
                          <td key={`${tijd}-${instructeur}`} className="border p-2">
                            {afspraak ? (
                              <div className="space-y-2">
                                <Badge variant={afspraak.type === "examen" ? "destructive" : "default"}>
                                  {afspraak.type === "examen" ? "EXAMEN" : "LES"}
                                </Badge>
                                <div className="text-sm font-medium">{afspraak.leerling}</div>
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <Car className="h-3 w-3" />
                                  <span>{afspraak.transmissie}</span>
                                  <span>•</span>
                                  <span>{afspraak.duur} min</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">Beschikbaar</div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
