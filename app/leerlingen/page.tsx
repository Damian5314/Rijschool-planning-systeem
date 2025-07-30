"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Eye, Euro, Users, Award } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Student } from "@/lib/api"
import { useDebounce } from "@/hooks/useDebounce"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Extend Student interface with additional display properties
interface Leerling extends Student {
  lessen?: number
  instructeur?: string
  startdatum?: string
}

interface NewLeerling {
  naam: string
  email: string
  telefoon: string
  transmissie: string
  instructeur: string
  adres: string
  postcode: string
  plaats: string
  geboortedatum: string
  opmerkingen: string
}

export default function LeerlingenPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [leerlingen, setLeerlingen] = useState<Leerling[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [newLeerling, setNewLeerling] = useState<NewLeerling>({
    naam: "",
    email: "",
    telefoon: "",
    transmissie: "",
    instructeur: "",
    adres: "",
    postcode: "",
    plaats: "",
    geboortedatum: "",
    opmerkingen: "",
  })

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadLeerlingen()
    }
  }, [isAuthenticated, authLoading])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  }

  const loadLeerlingen = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/students`, {
        headers: getAuthHeaders(),
      })
      
      if (response.ok) {
        const data = await response.json()
        setLeerlingen(data.data || [])
      } else {
        toast.error("Fout bij laden", {
          description: "Kon leerlingen niet laden",
        })
      }
    } catch (error) {
      console.error('Error loading students:', error)
      toast.error("Verbindingsfout", {
        description: "Kon geen verbinding maken met de server",
      })
    } finally {
      setLoading(false)
    }
  }

  // Debounced search for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  // Memoized filtered results for better performance
  const filteredLeerlingen = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return leerlingen
    
    const term = debouncedSearchTerm.toLowerCase()
    return leerlingen.filter((leerling) =>
      leerling.naam.toLowerCase().includes(term) ||
      leerling.email.toLowerCase().includes(term) ||
      (leerling.plaats && leerling.plaats.toLowerCase().includes(term))
    )
  }, [leerlingen, debouncedSearchTerm])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Actief":
        return "bg-green-100 text-green-800"
      case "Examen":
        return "bg-yellow-100 text-yellow-800"
      case "Geslaagd":
        return "bg-blue-100 text-blue-800"
      case "Gestopt":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const addLeerling = async () => {
    if (!newLeerling.naam || !newLeerling.email || !newLeerling.telefoon) {
      toast.error("Validatiefout", {
        description: "Naam, email en telefoon zijn verplicht",
      })
      return
    }

    // Optimistic update - add immediately to UI
    const tempStudent: Leerling = {
      id: Date.now(), // Temporary ID
      naam: newLeerling.naam,
      email: newLeerling.email,
      telefoon: newLeerling.telefoon,
      adres: newLeerling.adres,
      postcode: newLeerling.postcode,
      plaats: newLeerling.plaats,
      geboortedatum: newLeerling.geboortedatum,
      rijbewijs_type: 'B',
      transmissie: newLeerling.transmissie as 'Handgeschakeld' | 'Automaat',
      status: 'Actief',
      instructeur_id: undefined,
      instructeur_naam: newLeerling.instructeur,
      tegoed: 0,
      openstaand_bedrag: 0,
      lessen: 0,
      instructeur: newLeerling.instructeur,
      startdatum: new Date().toISOString().split('T')[0],
    }

    setLeerlingen(prev => [...prev, tempStudent])
    setIsDialogOpen(false)
    
    // Reset form
    const resetForm = {
      naam: "",
      email: "",
      telefoon: "",
      transmissie: "",
      instructeur: "",
      adres: "",
      postcode: "",
      plaats: "",
      geboortedatum: "",
      opmerkingen: "",
    }
    setNewLeerling(resetForm)

    try {
      const response = await fetch(`${API_BASE_URL}/api/students`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newLeerling),
      })

      const data = await response.json()

      if (data.success) {
        // Replace temp student with real one from server
        setLeerlingen(prev => prev.map(l => l.id === tempStudent.id ? data.data : l))
        toast.success("Leerling toegevoegd", {
          description: `${newLeerling.naam} is succesvol toegevoegd.`,
        })
      } else {
        // Rollback optimistic update
        setLeerlingen(prev => prev.filter(l => l.id !== tempStudent.id))
        toast.error("Fout bij toevoegen", {
          description: data.message || "Er ging iets mis",
        })
      }
    } catch (error) {
      // Rollback optimistic update
      setLeerlingen(prev => prev.filter(l => l.id !== tempStudent.id))
      console.error('Error adding student:', error)
      toast.error("Verbindingsfout", {
        description: "Kon leerling niet toevoegen",
      })
    }
  }

  const deleteLeerling = async (id: number) => {
    // Store original student for potential rollback
    const originalStudent = leerlingen.find(l => l.id === id)
    
    // Optimistic update - remove immediately from UI
    setLeerlingen(prev => prev.filter(l => l.id !== id))
    toast.success("Leerling verwijderd", {
      description: "De leerling is succesvol verwijderd.",
    })

    try {
      const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (!data.success) {
        // Rollback optimistic update
        if (originalStudent) {
          setLeerlingen(prev => [...prev, originalStudent].sort((a, b) => a.id - b.id))
        }
        toast.error("Fout bij verwijderen", {
          description: data.message || "Er ging iets mis",
        })
      }
    } catch (error) {
      // Rollback optimistic update
      if (originalStudent) {
        setLeerlingen(prev => [...prev, originalStudent].sort((a, b) => a.id - b.id))
      }
      console.error('Error deleting student:', error)
      toast.error("Verbindingsfout", {
        description: "Kon leerling niet verwijderen",
      })
    }
  }

  // Adres suggesties (mock data - in productie zou dit een echte API zijn)
  const adresSuggesties = [
    { adres: "Hoofdstraat 123", postcode: "1234 AB", plaats: "Amsterdam" },
    { adres: "Kerkstraat 45", postcode: "5678 CD", plaats: "Rotterdam" },
    { adres: "Dorpsstraat 67", postcode: "9012 EF", plaats: "Utrecht" },
    { adres: "Schoolstraat 89", postcode: "3456 GH", plaats: "Den Haag" },
  ]

  const selectAdres = (adres: typeof adresSuggesties[0]) => {
    setNewLeerling({
      ...newLeerling,
      adres: adres.adres,
      postcode: adres.postcode,
      plaats: adres.plaats,
    })
    // setIsAdresDialogOpen(false) // Feature not implemented yet
  }

  if (loading || authLoading || !isAuthenticated) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 min-h-screen animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Leerlingen
        </h2>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          <Plus className="mr-2 h-4 w-4" />
          Nieuwe Leerling
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Leerlingen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leerlingen.length}</div>
            <p className="text-xs text-muted-foreground">Alle leerlingen</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Leerlingen</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {leerlingen.filter(l => l.status === "Actief").length}
            </div>
            <p className="text-xs text-muted-foreground">In opleiding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemiddeld Tegoed</CardTitle>
            <Euro className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              €{leerlingen.length > 0 ? (leerlingen.reduce((acc, l) => acc + Number(l.tegoed || 0), 0) / leerlingen.length).toFixed(0) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Per leerling</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Examenklaar</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {leerlingen.filter(l => l.status === "Examen").length}
            </div>
            <p className="text-xs text-muted-foreground">Klaar voor examen</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overzicht Leerlingen</CardTitle>
          <div className="flex items-center space-x-2 mt-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek leerlingen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLeerlingen.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Geen leerlingen gevonden</div>
            ) : (
              filteredLeerlingen.map((leerling) => (
                <div key={leerling.id} className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">{leerling.naam}</h3>
                      <p className="text-sm text-gray-500">{leerling.email}</p>
                      <p className="text-xs text-gray-400">{leerling.plaats || ''} {leerling.plaats && leerling.instructeur ? '•' : ''} {leerling.instructeur || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-medium">€{Number(leerling.tegoed || 0).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{leerling.lessen || 0} lessen</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leerling.status)}`}>
                      {leerling.status}
                    </span>
                    <Link href={`/leerlingen/${leerling.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteLeerling(leerling.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nieuwe Leerling Toevoegen</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="naam" className="text-right">
                Naam
              </Label>
              <Input 
                id="naam" 
                className="col-span-3"
                value={newLeerling.naam}
                onChange={(e) => setNewLeerling({ ...newLeerling, naam: e.target.value })}
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-mail
              </Label>
              <Input 
                id="email" 
                type="email" 
                className="col-span-3"
                value={newLeerling.email}
                onChange={(e) => setNewLeerling({ ...newLeerling, email: e.target.value })}
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefoon" className="text-right">
                Telefoon
              </Label>
              <Input 
                id="telefoon" 
                className="col-span-3"
                value={newLeerling.telefoon}
                onChange={(e) => setNewLeerling({ ...newLeerling, telefoon: e.target.value })}
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transmissie" className="text-right">
                Transmissie
              </Label>
              <Select 
                value={newLeerling.transmissie}
                onValueChange={(value) => setNewLeerling({ ...newLeerling, transmissie: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer transmissie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Handgeschakeld">Handgeschakeld</SelectItem>
                  <SelectItem value="Automaat">Automaat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instructeur" className="text-right">
                Instructeur
              </Label>
              <Select 
                value={newLeerling.instructeur}
                onValueChange={(value) => setNewLeerling({ ...newLeerling, instructeur: value })}
              >
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
          </div>
          <DialogFooter>
            <Button type="button" onClick={addLeerling}>Leerling Toevoegen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}