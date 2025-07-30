"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Plus, Search, Edit, Trash2, Phone, Mail, Calendar, Users, Award } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Instructeur {
  id: number
  naam: string
  email: string
  telefoon?: string
  rijbewijs_type: string[]
  status: string
  aantal_studenten?: number
  komende_lessen?: number
  created_at: string
}

export default function Instructeurs() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [instructeurs, setInstructeurs] = useState<Instructeur[]>([])
  const [loading, setLoading] = useState(true)

  const [newInstructeur, setNewInstructeur] = useState({
    naam: "",
    email: "",
    telefoon: "",
    rijbewijs_type: ["B"],
    status: "Actief",
  })

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadInstructeurs()
    }
  }, [isAuthenticated, authLoading])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  }

  const loadInstructeurs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/instructeurs`, {
        headers: getAuthHeaders(),
      })
      
      if (response.ok) {
        const data = await response.json()
        setInstructeurs(data.data || [])
      } else {
        toast.error("Fout bij laden", {
          description: "Kon instructeurs niet laden",
        })
      }
    } catch (error) {
      console.error('Error loading instructeurs:', error)
      toast.error("Verbindingsfout", {
        description: "Kon geen verbinding maken met de server",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredInstructeurs = instructeurs.filter(
    (instructeur) =>
      instructeur.naam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructeur.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Actief":
        return "bg-green-100 text-green-800"
      case "Inactief":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRijbewijsColor = (types: string[]) => {
    if (types.length > 1) return "bg-purple-100 text-purple-800"
    if (types.includes("A")) return "bg-orange-100 text-orange-800"
    return "bg-blue-100 text-blue-800"
  }

  const addInstructeur = async () => {
    if (!newInstructeur.naam || !newInstructeur.email) {
      toast.error("Vereiste velden", {
        description: "Naam en email zijn verplicht",
      })
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/instructeurs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newInstructeur),
      })

      const data = await response.json()

      if (data.success) {
        setInstructeurs([...instructeurs, data.data])
        setNewInstructeur({
          naam: "",
          email: "",
          telefoon: "",
          rijbewijs_type: ["B"],
          status: "Actief",
        })
        setIsDialogOpen(false)
        toast.success("Instructeur toegevoegd", {
          description: `${newInstructeur.naam} is succesvol toegevoegd.`,
        })
      } else {
        toast.error("Fout bij toevoegen", {
          description: data.message || "Er ging iets mis",
        })
      }
    } catch (error) {
      console.error('Error adding instructeur:', error)
      toast.error("Verbindingsfout", {
        description: "Kon instructeur niet toevoegen",
      })
    }
  }

  const deleteInstructeur = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/instructeurs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (data.success) {
        setInstructeurs(instructeurs.filter((i) => i.id !== id))
        toast.success("Instructeur verwijderd", {
          description: "De instructeur is succesvol verwijderd.",
        })
      } else {
        toast.error("Fout bij verwijderen", {
          description: data.message || "Er ging iets mis",
        })
      }
    } catch (error) {
      console.error('Error deleting instructeur:', error)
      toast.error("Verbindingsfout", {
        description: "Kon instructeur niet verwijderen",
      })
    }
  }

  if (loading || authLoading || !isAuthenticated) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen animate-fade-in">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
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
                <Input 
                  id="naam" 
                  className="col-span-3"
                  value={newInstructeur.naam}
                  onChange={(e) => setNewInstructeur({ ...newInstructeur, naam: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  className="col-span-3"
                  value={newInstructeur.email}
                  onChange={(e) => setNewInstructeur({ ...newInstructeur, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefoon" className="text-right">
                  Telefoon
                </Label>
                <Input 
                  id="telefoon" 
                  className="col-span-3"
                  value={newInstructeur.telefoon}
                  onChange={(e) => setNewInstructeur({ ...newInstructeur, telefoon: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rijbewijs" className="text-right">
                  Rijbewijs
                </Label>
                <Select
                  value={newInstructeur.rijbewijs_type[0]}
                  onValueChange={(value) => setNewInstructeur({ ...newInstructeur, rijbewijs_type: [value] })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecteer rijbewijs type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B">B - Auto</SelectItem>
                    <SelectItem value="A">A - Motor</SelectItem>
                    <SelectItem value="C">C - Vrachtwagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={addInstructeur}>
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
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">Alle instructeurs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Leerlingen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {instructeurs.reduce((acc, i) => acc + (i.aantal_studenten || 0), 0)}
            </div>
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
          <CardTitle>Overzicht Instructeurs</CardTitle>
          <div className="flex items-center space-x-2 mt-4">
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Naam</th>
                  <th className="text-left p-3 font-medium">Contact</th>
                  <th className="text-left p-3 font-medium">Rijbewijs</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Leerlingen</th>
                  <th className="text-left p-3 font-medium">Acties</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstructeurs.map((instructeur) => (
                  <tr key={instructeur.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{instructeur.naam}</td>
                    <td className="p-3">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-sm">{instructeur.email}</span>
                        </div>
                        {instructeur.telefoon && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span className="text-sm">{instructeur.telefoon}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getRijbewijsColor(instructeur.rijbewijs_type)}>
                        {instructeur.rijbewijs_type.join(", ")}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(instructeur.status)}>{instructeur.status}</Badge>
                    </td>
                    <td className="p-3">{instructeur.aantal_studenten || 0}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteInstructeur(instructeur.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredInstructeurs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "Geen instructeurs gevonden" : "Nog geen instructeurs toegevoegd"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}