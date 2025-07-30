"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, Car, Gauge, Wrench, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { api, Vehicle } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/hooks/useDebounce"

export default function VoertuigenPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isOnderhoudDialogOpen, setIsOnderhoudDialogOpen] = useState(false)
  const [isKmDialogOpen, setIsKmDialogOpen] = useState(false)
  const [selectedVoertuig, setSelectedVoertuig] = useState<Vehicle | null>(null)
  const [onderhoudDatum, setOnderhoudDatum] = useState<Date>()
  const [nieuweKm, setNieuweKm] = useState("")
  const [voertuigen, setVoertuigen] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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
    if (isAuthenticated && !authLoading) {
      fetchVoertuigen()
    }
  }, [isAuthenticated, authLoading])

  const fetchVoertuigen = async () => {
    try {
      const response = await api.getVehicles()
      if (response.success) {
        setVoertuigen(response.data || [])
      } else {
        toast.error("Fout bij laden", {
          description: "Kon voertuigen niet laden",
        })
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error("Verbinding fout", {
        description: "Kon geen verbinding maken met de server",
      })
    } finally {
      setLoading(false)
    }
  }

  // Debounced search for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  // Memoized filtered results for better performance
  const filteredVoertuigen = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return voertuigen
    
    const term = debouncedSearchTerm.toLowerCase()
    return voertuigen.filter((voertuig: Vehicle) =>
      voertuig.merk?.toLowerCase().includes(term) ||
      voertuig.model?.toLowerCase().includes(term) ||
      voertuig.kenteken?.toLowerCase().includes(term)
    )
  }, [voertuigen, debouncedSearchTerm])

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
      toast.error("Validatie fout", {
        description: "Merk, model en kenteken zijn verplicht",
      })
      return
    }

    // Optimistic update - add immediately to UI
    const tempVehicle: Vehicle = {
      id: Date.now(), // Temporary ID
      merk: newVoertuig.merk,
      model: newVoertuig.model,
      kenteken: newVoertuig.kenteken,
      bouwjaar: parseInt(newVoertuig.bouwjaar),
      transmissie: newVoertuig.transmissie as 'Handgeschakeld' | 'Automaat',
      brandstof: newVoertuig.brandstof as 'benzine' | 'diesel' | 'elektrisch' | 'hybride',
      kilometerstand: parseInt(newVoertuig.kilometerstand) || 0,
      status: newVoertuig.status as 'beschikbaar' | 'onderhoud' | 'defect',
      instructeur_id: newVoertuig.instructeur_id ? parseInt(newVoertuig.instructeur_id) : undefined,
      laatste_onderhoud: newVoertuig.laatste_onderhoud,
      volgende_onderhoud: newVoertuig.volgende_onderhoud,
      apk_datum: newVoertuig.apk_datum,
    }

    setVoertuigen(prev => [...prev, tempVehicle])
    setIsDialogOpen(false)
    
    // Reset form
    const resetForm = {
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
    }
    setNewVoertuig(resetForm)

    try {
      const token = localStorage.getItem('auth_token')
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
        // Replace temp vehicle with real one from server
        setVoertuigen(prev => prev.map(v => v.id === tempVehicle.id ? data.data : v))
        toast.success("Voertuig toegevoegd", {
          description: `${newVoertuig.merk} ${newVoertuig.model} is succesvol toegevoegd.`,
        })
      } else {
        // Rollback optimistic update
        setVoertuigen(prev => prev.filter(v => v.id !== tempVehicle.id))
        const errorData = await response.json()
        toast.error("Fout bij toevoegen", {
          description: errorData.message || "Kon voertuig niet toevoegen",
        })
      }
    } catch (error) {
      // Rollback optimistic update
      setVoertuigen(prev => prev.filter(v => v.id !== tempVehicle.id))
      toast.error("Verbinding fout", {
        description: "Kon geen verbinding maken met de server",
      })
    }
  }

  const updateKilometerstand = async () => {
    if (!selectedVoertuig || !nieuweKm) return

    try {
      const token = localStorage.getItem('auth_token')
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
        toast.success("Kilometerstand bijgewerkt", {
          description: `Kilometerstand voor ${selectedVoertuig.kenteken} is bijgewerkt naar ${parseInt(nieuweKm).toLocaleString()} km.`,
        })
      } else {
        toast.error("Fout bij bijwerken", {
          description: "Kon kilometerstand niet bijwerken",
        })
      }
    } catch (error) {
      toast.error("Verbinding fout", {
        description: "Kon geen verbinding maken met de server",
      })
    }
  }

  const deleteVoertuig = async (id: number) => {
    if (!confirm("Weet je zeker dat je dit voertuig wilt verwijderen?")) return

    // Store original vehicle for potential rollback
    const originalVehicle = voertuigen.find(v => v.id === id)
    
    // Optimistic update - remove immediately from UI
    setVoertuigen(prev => prev.filter(v => v.id !== id))
    toast.success("Voertuig verwijderd", {
      description: "Het voertuig is succesvol verwijderd.",
    })

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`http://localhost:5000/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        // Rollback optimistic update
        if (originalVehicle) {
          setVoertuigen(prev => [...prev, originalVehicle].sort((a, b) => a.id - b.id))
        }
        toast.error("Fout bij verwijderen", {
          description: "Kon voertuig niet verwijderen",
        })
      }
    } catch (error) {
      // Rollback optimistic update
      if (originalVehicle) {
        setVoertuigen(prev => [...prev, originalVehicle].sort((a, b) => a.id - b.id))
      }
      toast.error("Verbinding fout", {
        description: "Kon geen verbinding maken met de server",
      })
    }
  }

  const planOnderhoud = async () => {
    if (!selectedVoertuig || !onderhoudDatum) return

    try {
      const token = localStorage.getItem('auth_token')
      const formattedDate = onderhoudDatum.toISOString().split('T')[0]
      const response = await fetch(`http://localhost:5000/api/vehicles/${selectedVoertuig.id}/maintenance`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          volgende_onderhoud: formattedDate
        })
      })

      if (response.ok) {
        await fetchVoertuigen()
        setIsOnderhoudDialogOpen(false)
        setOnderhoudDatum(undefined)
        toast.success("Onderhoud gepland", {
          description: `Onderhoud voor ${selectedVoertuig.kenteken} is gepland voor ${onderhoudDatum.toLocaleDateString('nl-NL')}.`,
        })
      } else {
        toast.error("Fout bij plannen", {
          description: "Kon onderhoud niet plannen",
        })
      }
    } catch (error) {
      toast.error("Verbinding fout", {
        description: "Kon geen verbinding maken met de server",
      })
    }
  }

  if (loading || authLoading || !isAuthenticated) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Statistics Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="card-hover glass-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card className="card-hover glass-effect">
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-10 w-64" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-20" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <div className="flex space-x-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <Skeleton key={j} className="h-8 w-8 rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
              {voertuigen.filter((v: Vehicle) => v.status === "beschikbaar").length} beschikbaar
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
                ? Math.round(voertuigen.reduce((acc: number, v: Vehicle) => acc + (v.kilometerstand || 0), 0) / voertuigen.length).toLocaleString()
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
              {voertuigen.filter((v: Vehicle) => v.status === "onderhoud").length}
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
              {voertuigen.filter((v: Vehicle) => v.status === "beschikbaar").length}
            </div>
            <p className="text-xs text-muted-foreground">Voertuigen</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover glass-effect">
        <CardHeader>
          <CardTitle>Overzicht Voertuigen</CardTitle>
          <div className="flex items-center space-x-2 mt-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek voertuigen..."
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
                <TableHead>Merk</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Kenteken</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Brandstof</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVoertuigen.map((voertuig: Vehicle) => (
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
    </div>
  )
}