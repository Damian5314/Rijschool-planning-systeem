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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Clock, User, Car, Filter, Calendar, ChevronLeft, ChevronRight, X, CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function Planning() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedInstructeur, setSelectedInstructeur] = useState("alle")
  const [viewMode, setViewMode] = useState<"dag" | "week">("week")
  const [currentWeek, setCurrentWeek] = useState(0) // 0 = deze week

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(["GDD-67-T. Polo Schakel"])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [startHour, setStartHour] = useState("09")
  const [startMinute, setStartMinute] = useState("00")
  const [endHour, setEndHour] = useState("10")
  const [endMinute, setEndMinute] = useState("00")
  const [rememberValues, setRememberValues] = useState(false)

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

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

  const instructeurs = ["Jan Bakker", "Lisa de Vries", "Mark Peters"]
  const leerlingen = ["Emma van der Berg", "Tom Jansen", "Sophie Willems", "David Smit"]
  const voertuigen = ["GDD-67-T. Polo Schakel", "HLL-97-V. Toyota Yaris Automaat", "ABC-12-D. Opel Corsa Schakel"]

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

  const removeVehicle = (vehicle: string) => {
    setSelectedVehicles((prev) => prev.filter((v) => v !== vehicle))
  }

  const removeStudent = (student: string) => {
    setSelectedStudents((prev) => prev.filter((s) => s !== student))
  }

  const handleSubmit = () => {
    // Handle form submission here
    console.log({
      date: selectedDate,
      startTime: `${startHour}:${startMinute}`,
      endTime: `${endHour}:${endMinute}`,
      students: selectedStudents,
      vehicles: selectedVehicles,
      rememberValues,
    })
    setIsDialogOpen(false)
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
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Afspraak toevoegen</DialogTitle>
              <DialogDescription>Plan een nieuwe rijles of examen in.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              {/* Categorie */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categorie" className="text-right font-medium">
                  Categorie
                </Label>
                <div className="col-span-3">
                  <Select defaultValue="categorie-b">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="categorie-b">Categorie B</SelectItem>
                      <SelectItem value="categorie-a">Categorie A</SelectItem>
                      <SelectItem value="categorie-am">Categorie AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Onderdeel */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="onderdeel" className="text-right font-medium">
                  Onderdeel
                </Label>
                <div className="col-span-3">
                  <Select defaultValue="rijles-60">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rijles-60">B - Rijles (60 minuten)</SelectItem>
                      <SelectItem value="rijles-90">B - Rijles (90 minuten)</SelectItem>
                      <SelectItem value="examen">B - Praktijkexamen</SelectItem>
                      <SelectItem value="theorie">Theorie-examen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Datum */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="datum" className="text-right font-medium">
                  Datum
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "dd-MM-yyyy", { locale: nl })
                        ) : (
                          <span>Selecteer datum</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Tijd */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tijd" className="text-right font-medium">
                  Tijd
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Select value={startHour} onValueChange={setStartHour}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>:</span>
                  <Select value={startMinute} onValueChange={setStartMinute}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes
                        .filter((_, i) => i % 15 === 0)
                        .map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <span className="mx-2">tot</span>
                  <Select value={endHour} onValueChange={setEndHour}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>:</span>
                  <Select value={endMinute} onValueChange={setEndMinute}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes
                        .filter((_, i) => i % 15 === 0)
                        .map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Leerling(en) */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="leerlingen" className="text-right font-medium pt-2">
                  Leerling(en)
                </Label>
                <div className="col-span-3 space-y-2">
                  <Select
                    onValueChange={(value) => {
                      if (!selectedStudents.includes(value)) {
                        setSelectedStudents((prev) => [...prev, value])
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer leerling" />
                    </SelectTrigger>
                    <SelectContent>
                      {leerlingen
                        .filter((l) => !selectedStudents.includes(l))
                        .map((leerling) => (
                          <SelectItem key={leerling} value={leerling}>
                            {leerling}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudents.map((student) => (
                      <Badge key={student} variant="secondary" className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {student}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeStudent(student)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Voertuig(en) */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="voertuigen" className="text-right font-medium pt-2">
                  Voertuig(en)
                </Label>
                <div className="col-span-3 space-y-2">
                  <Select
                    onValueChange={(value) => {
                      if (!selectedVehicles.includes(value)) {
                        setSelectedVehicles((prev) => [...prev, value])
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer voertuig" />
                    </SelectTrigger>
                    <SelectContent>
                      {voertuigen
                        .filter((v) => !selectedVehicles.includes(v))
                        .map((voertuig) => (
                          <SelectItem key={voertuig} value={voertuig}>
                            {voertuig}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    {selectedVehicles.map((vehicle) => (
                      <Badge
                        key={vehicle}
                        variant="outline"
                        className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200"
                      >
                        <Car className="h-3 w-3" />
                        {vehicle}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeVehicle(vehicle)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notitie aan leerling */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notitie-leerling" className="text-right font-medium pt-2">
                  Notitie aan leerling
                </Label>
                <div className="col-span-3">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="(Kies snelkeuze)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thuis-ophalen">Thuis ophalen</SelectItem>
                      <SelectItem value="school-ophalen">Op school ophalen</SelectItem>
                      <SelectItem value="rijschool">Naar rijschool komen</SelectItem>
                      <SelectItem value="custom">Aangepaste notitie...</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea className="mt-2" placeholder="Voeg een notitie toe voor de leerling..." rows={3} />
                </div>
              </div>

              {/* Interne notitie */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="interne-notitie" className="text-right font-medium pt-2">
                  Interne notitie
                </Label>
                <div className="col-span-3">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="(Kies snelkeuze)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eerste-les">Eerste les</SelectItem>
                      <SelectItem value="examen-voorbereiding">Examenvoorbereiding</SelectItem>
                      <SelectItem value="herhaling">Herhaling vorige les</SelectItem>
                      <SelectItem value="custom">Aangepaste notitie...</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea className="mt-2" placeholder="Interne notitie voor instructeur..." rows={3} />
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-values" checked={rememberValues} onCheckedChange={setRememberValues} />
                <Label htmlFor="remember-values" className="text-sm">
                  Waarden onthouden
                </Label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
                  Toevoegen
                </Button>
              </div>
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
