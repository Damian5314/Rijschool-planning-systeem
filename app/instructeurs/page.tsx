"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { PlusCircle, Edit, Trash2, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import Loading from "@/components/ui/loading" // Declare the Loading component

interface Instructor {
  _id: string
  naam: string
  email: string
  telefoon?: string
  rijbewijsType: string[] // Bijv. ['B', 'A', 'C']
  status: "Actief" | "Inactief"
  specialisatieDisplay?: string // Voor frontend weergave
}

export default function InstructeursPage() {
  const { toast } = useToast()
  const [instructeurs, setInstructeurs] = useState<Instructor[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentInstructeur, setCurrentInstructeur] = useState<Instructor | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInstructeurs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/instructeurs`)
      if (!response.ok) {
        throw new Error("Failed to fetch instructors")
      }
      const data: Instructor[] = await response.json()
      // Voeg een display-veld toe voor specialisaties
      const formattedData = data.map((inst) => ({
        ...inst,
        specialisatieDisplay: inst.rijbewijsType.join(", ") || "N.v.t.",
        // Mock telefoon en status als ze niet van de backend komen
        telefoon: inst.telefoon || "N.v.t.",
        status: inst.status || "Actief",
      }))
      setInstructeurs(formattedData)
    } catch (err) {
      console.error("Error fetching instructors:", err)
      setError("Kon instructeurs niet laden. Probeer het later opnieuw.")
      toast({
        title: "Fout",
        description: "Kon instructeurs niet laden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchInstructeurs()
  }, [fetchInstructeurs])

  const handleAddInstructeur = () => {
    setCurrentInstructeur(null)
    setIsDialogOpen(true)
  }

  const handleEditInstructeur = (instructeur: Instructor) => {
    setCurrentInstructeur(instructeur)
    setIsDialogOpen(true)
  }

  const handleDeleteInstructeur = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/instructeurs/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete instructor")
      }
      setInstructeurs(instructeurs.filter((inst) => inst._id !== id))
      toast({
        title: "Instructeur Verwijderd",
        description: "Instructeur is succesvol verwijderd.",
      })
    } catch (err) {
      console.error("Error deleting instructor:", err)
      toast({
        title: "Fout",
        description: "Kon instructeur niet verwijderen.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const naam = formData.get("naam") as string
    const email = formData.get("email") as string
    const telefoon = formData.get("telefoon") as string
    const rijbewijsType = (formData.getAll("rijbewijsType") as string[]) || []
    const status = formData.get("status") as "Actief" | "Inactief"

    const instructorData = {
      naam,
      email,
      telefoon,
      rijbewijsType,
      status,
    }

    try {
      let response
      if (currentInstructeur) {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/instructeurs/${currentInstructeur._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(instructorData),
        })
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/instructeurs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(instructorData),
        })
      }

      if (!response.ok) {
        throw new Error("Failed to save instructor")
      }

      await fetchInstructeurs() // Refresh the list
      setIsDialogOpen(false)
      toast({
        title: "Succes",
        description: `Instructeur succesvol ${currentInstructeur ? "bijgewerkt" : "toegevoegd"}.`,
      })
    } catch (err) {
      console.error("Error saving instructor:", err)
      toast({
        title: "Fout",
        description: `Kon instructeur niet ${currentInstructeur ? "bijwerken" : "toevoegen"}.`,
        variant: "destructive",
      })
    }
  }

  const filteredInstructeurs = instructeurs.filter(
    (instructeur) =>
      instructeur.naam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructeur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instructeur.telefoon && instructeur.telefoon.includes(searchTerm)) ||
      instructeur.specialisatieDisplay?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <div className="p-4 md:p-6 text-red-500">{error}</div>
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Instructeurs</h1>
        <Button onClick={handleAddInstructeur}>
          <PlusCircle className="mr-2 h-4 w-4" /> Instructeur Toevoegen
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Zoek op naam, e-mail of specialisatie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 pr-8"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:bg-transparent"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefoon</TableHead>
              <TableHead>Rijbewijs Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInstructeurs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Geen instructeurs gevonden.
                </TableCell>
              </TableRow>
            ) : (
              filteredInstructeurs.map((instructeur) => (
                <TableRow key={instructeur._id}>
                  <TableCell className="font-medium">{instructeur.naam}</TableCell>
                  <TableCell>{instructeur.email}</TableCell>
                  <TableCell>{instructeur.telefoon}</TableCell>
                  <TableCell>{instructeur.specialisatieDisplay}</TableCell>
                  <TableCell>{instructeur.status}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditInstructeur(instructeur)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Bewerk instructeur</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteInstructeur(instructeur._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Verwijder instructeur</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentInstructeur ? "Instructeur Bewerken" : "Nieuwe Instructeur Toevoegen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="naam" className="text-right">
                Naam
              </Label>
              <Input
                id="naam"
                name="naam"
                defaultValue={currentInstructeur?.naam || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={currentInstructeur?.email || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefoon" className="text-right">
                Telefoon
              </Label>
              <Input
                id="telefoon"
                name="telefoon"
                type="tel"
                defaultValue={currentInstructeur?.telefoon || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rijbewijsType" className="text-right">
                Rijbewijs Type
              </Label>
              <Select
                name="rijbewijsType"
                defaultValue={currentInstructeur?.rijbewijsType[0] || ""} // Selecteer de eerste, of pas aan voor multi-select
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B">B (Auto)</SelectItem>
                  <SelectItem value="A">A (Motor)</SelectItem>
                  <SelectItem value="C">C (Vrachtwagen)</SelectItem>
                  <SelectItem value="D">D (Bus)</SelectItem>
                  <SelectItem value="E">E (Aanhanger)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select name="status" defaultValue={currentInstructeur?.status || "Actief"} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actief">Actief</SelectItem>
                  <SelectItem value="Inactief">Inactief</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{currentInstructeur ? "Opslaan" : "Toevoegen"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
