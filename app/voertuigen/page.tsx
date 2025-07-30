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
  const [voertuigen, setVoertuigen] = useState([])
  const [loading, setLoading] = useState(true)

  const [newVoertuig, setNewVoertuig] = useState({
    merk: "",
    model: "",
    bouwjaar: "",
    kenteken: "",
    transmissie: "",
    brandstof: "",
    kilometerstand: "",
    status: "beschikbaar",
    instructeur_id: "",
    laatste_onderhoud: "",
    volgende_onderhoud: "",
    apk_datum: "",
  })

  // Fetch voertuigen from backend
  useEffect(() => {
    fetchVoertuigen()
  }, [])

  const fetchVoertuigen = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:5000/api/vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setVoertuigen(data.data || [])
      } else {
        toast({
          title: "Fout bij laden",
          description: "Kon voertuigen niet laden",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast({
        title: "Verbinding fout",
        description: "Kon geen verbinding maken met de server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredVoertuigen = voertuigen.filter((voertuig: any) =>
    voertuig.merk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voertuig.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voertuig.kenteken?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "beschikbaar":
        return "bg-green-100 text-green-800"
      case "onderhoud":
        return "bg-yellow-100 text-yellow-800"
      case "defect":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTransmissieColor = (transmissie: string) => {
    return transmissie === "Automaat" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
  }

  const addVoertuig = async () => {
    if (!newVoertuig.merk || !newVoertuig.model || !newVoertuig.kenteken) {
      toast({
        title: "Validatie fout",
        description: "Merk, model en kenteken zijn verplicht",
        variant: "destructive"
      })
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('http://localhost:5000/api/vehicles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newVoertuig,
          bouwjaar: parseInt(newVoertuig.bouwjaar),
          kilometerstand: parseInt(newVoertuig.kilometerstand) || 0
        })
      })

      if (response.ok) {
        const data = await response.json()
        await fetchVoertuigen() // Refresh list
        setNewVoertuig({
          merk: "",
          model: "",
          bouwjaar: "",
          kenteken: "",
          transmissie: "",
          brandstof: "",
          kilometerstand: "",
          status: "beschikbaar",
          instructeur_id: "",
          laatste_onderhoud: "",
          volgende_onderhoud: "",
          apk_datum: "",
        })
        setIsDialogOpen(false)
        toast({
          title: "Voertuig toegevoegd",
          description: `${newVoertuig.merk} ${newVoertuig.model} is succesvol toegevoegd.`,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Fout bij toevoegen",
          description: errorData.message || "Kon voertuig niet toevoegen",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Verbinding fout",
        description: "Kon geen verbinding maken met de server",
        variant: "destructive"
      })
    }
  }

  const updateKilometerstand = async () => {
    if (!selectedVoertuig || !nieuweKm) return

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:5000/api/vehicles/${selectedVoertuig.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kilometerstand: parseInt(nieuweKm)
        })
      })

      if (response.ok) {
        await fetchVoertuigen()
        setIsKmDialogOpen(false)
        setNieuweKm("")
        toast({
          title: "Kilometerstand bijgewerkt",
          description: `Kilometerstand voor ${selectedVoertuig.kenteken} is bijgewerkt naar ${parseInt(nieuweKm).toLocaleString()} km.`,
        })
      } else {
        toast({
          title: "Fout bij bijwerken",
          description: "Kon kilometerstand niet bijwerken",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Verbinding fout",
        description: "Kon geen verbinding maken met de server",
        variant: "destructive"
      })
    }
  }

  const deleteVoertuig = async (id: number) => {
    if (!confirm("Weet je zeker dat je dit voertuig wilt verwijderen?")) return

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:5000/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await fetchVoertuigen()
        toast({
          title: "Voertuig verwijderd",
          description: "Het voertuig is succesvol verwijderd.",
        })
      } else {
        toast({
          title: "Fout bij verwijderen",
          description: "Kon voertuig niet verwijderen",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Verbinding fout",
        description: "Kon geen verbinding maken met de server",
        variant: "destructive"
      })
    }
  }

  const planOnderhoud = async () => {
    if (!selectedVoertuig || !onderhoudDatum) return

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`http://localhost:5000/api/vehicles/${selectedVoertuig.id}/maintenance`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          volgende_onderhoud: format(onderhoudDatum, "yyyy-MM-dd")
        })
      })

      if (response.ok) {
        await fetchVoertuigen()
        setIsOnderhoudDialogOpen(false)
        setOnderhoudDatum(undefined)
        toast({
          title: "Onderhoud gepland",
          description: `Onderhoud voor ${selectedVoertuig.kenteken} is gepland voor ${format(onderhoudDatum, "dd MMMM yyyy", { locale: nl })}.`,
        })
      } else {
        toast({
          title: "Fout bij plannen",
          description: "Kon onderhoud niet plannen",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Verbinding fout",
        description: "Kon geen verbinding maken met de server",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
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
                  <Label htmlFor="bouwjaar">Bouwjaar *</Label>
                  <Input
                    id="bouwjaar"
                    type="number"
                    placeholder="2023"
                    value={newVoertuig.bouwjaar}
                    onChange={(e) => setNewVoertuig({ ...newVoertuig, bouwjaar: e.target.value })}
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
                      <SelectItem value="Handgeschakeld">Handgeschakeld</SelectItem>
                      <SelectItem value="Automaat">Automaat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="brandstof">Brandstof</Label>
                  <Select
                    value={newVoertuig.brandstof}
                    onValueChange={(value) => setNewVoertuig({ ...newVoertuig, brandstof: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer brandstof" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="benzine">Benzine</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="elektrisch">Elektrisch</SelectItem>
                      <SelectItem value="hybride">Hybride</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              {voertuigen.filter((v: any) => v.status === "beschikbaar").length} beschikbaar
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
              {voertuigen.length > 0 
                ? Math.round(voertuigen.reduce((acc: number, v: any) => acc + (v.kilometerstand || 0), 0) / voertuigen.length).toLocaleString()
                : 0
              }
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
              {voertuigen.filter((v: any) => v.status === "onderhoud").length}
            </div>
            <p className="text-xs text-muted-foreground">Voertuigen</p>
          </CardContent>
        </Card>

        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beschikbaar</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {voertuigen.filter((v: any) => v.status === "beschikbaar").length}
            </div>
            <p className="text-xs text-muted-foreground">Voertuigen</p>
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
                <TableHead>Brandstof</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVoertuigen.map((voertuig: any) => (
                <TableRow key={voertuig.id}>
                  <TableCell className="font-medium">{voertuig.kenteken}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {voertuig.merk} {voertuig.model}
                      </div>
                      <div className="text-sm text-gray-500">{voertuig.bouwjaar}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTransmissieColor(voertuig.transmissie)}>
                      {voertuig.transmissie}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Gauge className="h-3 w-3" />
                      <span>{voertuig.kilometerstand?.toLocaleString() || 0} km</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(voertuig.status)}>
                      {voertuig.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{voertuig.brandstof}</TableCell>
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
                          setNieuweKm(voertuig.kilometerstand?.toString() || "0")
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Verwijderen" 
                        onClick={() => deleteVoertuig(voertuig.id)}
                      >
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