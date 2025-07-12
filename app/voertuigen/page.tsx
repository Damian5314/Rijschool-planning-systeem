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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Search, Edit, Trash2, Car, Gauge, CalendarIcon, Wrench, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

export default function Voertuigen() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isOnderhoudDialogOpen, setIsOnderhoudDialogOpen] = useState(false)
  const [isKmDialogOpen, setIsKmDialogOpen] = useState(false)
  const [selectedVoertuig, setSelectedVoertuig] = useState<any>(null)
  const [onderhoudDatum, setOnderhoudDatum] = useState<Date>()
  const [nieuweKm, setNieuweKm] = useState("")

  const [newVoertuig, setNewVoertuig] = useState({
    kenteken: "",
    merk: "",
    model: "",
    jaar: "",
    transmissie: "",
    instructeur: "",
    kilometerstand: "",
    opmerkingen: "",
  })

  const [voertuigen, setVoertuigen] = useState([
    {
      id: 1,
      kenteken: "GDD-67-T",
      merk: "Volkswagen",
      model: "Polo",
      jaar: 2022,
      transmissie: "Automaat",
      kilometerstand: 45230,
      laatsteKeuring: "2024-03-15",
      status: "Actief",
      instructeur: "Jan Bakker",
      opmerkingen: "Nieuwe banden geplaatst",
      laatsteOnderhoud: "2024-01-15",
      volgendOnderhoud: "2024-07-15",
    },
    {
      id: 2,
      kenteken: "HLL-97-V",
      merk: "Toyota",
      model: "Yaris",
      jaar: 2021,
      transmissie: "Schakel",
      kilometerstand: 67890,
      laatsteKeuring: "2024-01-20",
      status: "Actief",
      instructeur: "Lisa de Vries",
      opmerkingen: "Onderhoud gepland voor volgende maand",
      laatsteOnderhoud: "2023-12-10",
      volgendOnderhoud: "2024-08-10",
    },
    {
      id: 3,
      kenteken: "ABC-12-D",
      merk: "Opel",
      model: "Corsa",
      jaar: 2020,
      transmissie: "Automaat",
      kilometerstand: 89450,
      laatsteKeuring: "2023-11-10",
      status: "Onderhoud",
      instructeur: "Mark Peters",
      opmerkingen: "In garage voor grote beurt",
      laatsteOnderhoud: "2024-06-01",
      volgendOnderhoud: "2024-12-01",
    },
  ])

  const filteredVoertuigen = voertuigen.filter(
    (voertuig) =>
      voertuig.kenteken.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voertuig.merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voertuig.model.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Actief":
        return "bg-green-100 text-green-800"
      case "Onderhoud":
        return "bg-yellow-100 text-yellow-800"
      case "Buiten dienst":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTransmissieColor = (transmissie: string) => {
    return transmissie === "Automaat" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
  }

  const addVoertuig = () => {
    if (newVoertuig.kenteken && newVoertuig.merk && newVoertuig.model) {
      const voertuig = {
        id: voertuigen.length + 1,
        ...newVoertuig,
        jaar: Number.parseInt(newVoertuig.jaar),
        kilometerstand: Number.parseInt(newVoertuig.kilometerstand) || 0,
        status: "Actief",
        laatsteKeuring: new Date().toISOString().split("T")[0],
        laatsteOnderhoud: new Date().toISOString().split("T")[0],
        volgendOnderhoud: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      }
      setVoertuigen([...voertuigen, voertuig])
      setNewVoertuig({
        kenteken: "",
        merk: "",
        model: "",
        jaar: "",
        transmissie: "",
        instructeur: "",
        kilometerstand: "",
        opmerkingen: "",
      })
      setIsDialogOpen(false)
      toast({
        title: "Voertuig toegevoegd",
        description: `${newVoertuig.merk} ${newVoertuig.model} is succesvol toegevoegd.`,
      })
    }
  }

  const planOnderhoud = () => {
    if (selectedVoertuig && onderhoudDatum) {
      setVoertuigen(
        voertuigen.map((v) =>
          v.id === selectedVoertuig.id
            ? { ...v, volgendOnderhoud: format(onderhoudDatum, "yyyy-MM-dd"), status: "Onderhoud gepland" }
            : v,
        ),
      )
      setIsOnderhoudDialogOpen(false)
      setOnderhoudDatum(undefined)
      toast({
        title: "Onderhoud gepland",
        description: `Onderhoud voor ${selectedVoertuig.kenteken} is gepland voor ${format(onderhoudDatum, "dd MMMM yyyy", { locale: nl })}.`,
      })
    }
  }

  const updateKilometerstand = () => {
    if (selectedVoertuig && nieuweKm) {
      setVoertuigen(
        voertuigen.map((v) => (v.id === selectedVoertuig.id ? { ...v, kilometerstand: Number.parseInt(nieuweKm) } : v)),
      )
      setIsKmDialogOpen(false)
      setNieuweKm("")
      toast({
        title: "Kilometerstand bijgewerkt",
        description: `Kilometerstand voor ${selectedVoertuig.kenteken} is bijgewerkt naar ${Number.parseInt(nieuweKm).toLocaleString()} km.`,
      })
    }
  }

  const deleteVoertuig = (id: number) => {
    setVoertuigen(voertuigen.filter((v) => v.id !== id))
    toast({
      title: "Voertuig verwijderd",
      description: "Het voertuig is succesvol verwijderd.",
      variant: "destructive",
    })
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Voertuigen
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="mr-2 h-4 w-4" />
              Voertuig Toevoegen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nieuw Voertuig Toevoegen</DialogTitle>
              <DialogDescription>Voer de gegevens van het nieuwe voertuig in.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kenteken">Kenteken *</Label>
                  <Input
                    id="kenteken"
                    placeholder="XX-XX-XX"
                    value={newVoertuig.kenteken}
                    onChange={(e) => setNewVoertuig({ ...newVoertuig, kenteken: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <Label htmlFor="jaar">Bouwjaar *</Label>
                  <Input
                    id="jaar"
                    type="number"
                    placeholder="2023"
                    value={newVoertuig.jaar}
                    onChange={(e) => setNewVoertuig({ ...newVoertuig, jaar: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="merk">Merk *</Label>
                  <Input
                    id="merk"
                    placeholder="Volkswagen"
                    value={newVoertuig.merk}
                    onChange={(e) => setNewVoertuig({ ...newVoertuig, merk: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    placeholder="Polo"
                    value={newVoertuig.model}
                    onChange={(e) => setNewVoertuig({ ...newVoertuig, model: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transmissie">Transmissie</Label>
                  <Select
                    value={newVoertuig.transmissie}
                    onValueChange={(value) => setNewVoertuig({ ...newVoertuig, transmissie: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer transmissie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automaat">Automaat</SelectItem>
                      <SelectItem value="Schakel">Schakel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="kilometerstand">Kilometerstand</Label>
                  <Input
                    id="kilometerstand"
                    type="number"
                    placeholder="50000"
                    value={newVoertuig.kilometerstand}
                    onChange={(e) => setNewVoertuig({ ...newVoertuig, kilometerstand: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="instructeur">Instructeur</Label>
                <Select
                  value={newVoertuig.instructeur}
                  onValueChange={(value) => setNewVoertuig({ ...newVoertuig, instructeur: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer instructeur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jan Bakker">Jan Bakker</SelectItem>
                    <SelectItem value="Lisa de Vries">Lisa de Vries</SelectItem>
                    <SelectItem value="Mark Peters">Mark Peters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="opmerkingen">Opmerkingen</Label>
                <Textarea
                  id="opmerkingen"
                  placeholder="Extra informatie over het voertuig..."
                  value={newVoertuig.opmerkingen}
                  onChange={(e) => setNewVoertuig({ ...newVoertuig, opmerkingen: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuleren
              </Button>
              <Button onClick={addVoertuig} className="bg-gradient-to-r from-blue-500 to-purple-500">
                Voertuig Toevoegen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistieken Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Voertuigen</CardTitle>
            <Car className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {voertuigen.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {voertuigen.filter((v) => v.status === "Actief").length} actief
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemiddelde KM-stand</CardTitle>
            <Gauge className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {Math.round(
                voertuigen.reduce((acc, v) => acc + v.kilometerstand, 0) / voertuigen.length,
              ).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Kilometers</p>
          </CardContent>
        </Card>

        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onderhoud Nodig</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              {voertuigen.filter((v) => v.status === "Onderhoud").length}
            </div>
            <p className="text-xs text-muted-foreground">Voertuigen</p>
          </CardContent>
        </Card>

        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keuringen</CardTitle>
            <CalendarIcon className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              2
            </div>
            <p className="text-xs text-muted-foreground">Binnenkort verlopen</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover glass-effect">
        <CardHeader>
          <CardTitle>Voertuigen Overzicht</CardTitle>
          <CardDescription>Beheer alle voertuigen en hun gegevens</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek voertuigen..."
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
                <TableHead>Kenteken</TableHead>
                <TableHead>Voertuig</TableHead>
                <TableHead>Transmissie</TableHead>
                <TableHead>Kilometerstand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Instructeur</TableHead>
                <TableHead>Onderhoud</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVoertuigen.map((voertuig) => (
                <TableRow key={voertuig.id}>
                  <TableCell className="font-medium">{voertuig.kenteken}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {voertuig.merk} {voertuig.model}
                      </div>
                      <div className="text-sm text-gray-500">{voertuig.jaar}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTransmissieColor(voertuig.transmissie)}>{voertuig.transmissie}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Gauge className="h-3 w-3" />
                      <span>{voertuig.kilometerstand.toLocaleString()} km</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(voertuig.status)}>{voertuig.status}</Badge>
                  </TableCell>
                  <TableCell>{voertuig.instructeur}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center space-x-1">
                        {new Date(voertuig.volgendOnderhoud) < new Date() ? (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        ) : (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                        <span>{new Date(voertuig.volgendOnderhoud).toLocaleDateString("nl-NL")}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" title="Bewerken">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="KM-stand bijwerken"
                        onClick={() => {
                          setSelectedVoertuig(voertuig)
                          setNieuweKm(voertuig.kilometerstand.toString())
                          setIsKmDialogOpen(true)
                        }}
                      >
                        <Gauge className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Onderhoud plannen"
                        onClick={() => {
                          setSelectedVoertuig(voertuig)
                          setIsOnderhoudDialogOpen(true)
                        }}
                      >
                        <Wrench className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Verwijderen" onClick={() => deleteVoertuig(voertuig.id)}>
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

      {/* Onderhoud Dialog */}
      <Dialog open={isOnderhoudDialogOpen} onOpenChange={setIsOnderhoudDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Onderhoud Plannen</DialogTitle>
            <DialogDescription>
              Plan onderhoud voor {selectedVoertuig?.kenteken} - {selectedVoertuig?.merk} {selectedVoertuig?.model}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Onderhoud Datum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {onderhoudDatum ? format(onderhoudDatum, "PPP", { locale: nl }) : "Selecteer datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={onderhoudDatum} onSelect={setOnderhoudDatum} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOnderhoudDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={planOnderhoud} className="bg-gradient-to-r from-blue-500 to-purple-500">
              Onderhoud Plannen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KM-stand Dialog */}
      <Dialog open={isKmDialogOpen} onOpenChange={setIsKmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kilometerstand Bijwerken</DialogTitle>
            <DialogDescription>Werk de kilometerstand bij voor {selectedVoertuig?.kenteken}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nieuwe-km">Nieuwe Kilometerstand</Label>
              <Input
                id="nieuwe-km"
                type="number"
                placeholder="Voer nieuwe kilometerstand in"
                value={nieuweKm}
                onChange={(e) => setNieuweKm(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsKmDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={updateKilometerstand} className="bg-gradient-to-r from-blue-500 to-purple-500">
              Bijwerken
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
