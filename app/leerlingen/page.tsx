"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { PlusCircle, Edit, Trash2, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import Loading from "./loading"

interface Student {
  _id: string
  naam: string
  email: string
  telefoon?: string
  rijbewijsType?: string
  status?: "Actief" | "Inactief" | "Gepauzeerd" | "Afgestudeerd"
  instructeur?: string // ID van instructeur
  instructeurNaam?: string // Voor frontend weergave
}

interface Instructor {
  _id: string
  naam: string
}

export default function LeerlingenPage() {
  const { toast } = useToast()
  const [leerlingen, setLeerlingen] = useState<Student[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentLeerling, setCurrentLeerling] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeerlingen = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/studenten`)
      if (!response.ok) {
        throw new Error("Failed to fetch students")
      }
      const data: Student[] = await response.json()

      // Fetch instructors to map instructor IDs to names
      const instructorsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/instructeurs`)
      const instructorsData: Instructor[] = instructorsResponse.ok ? await instructorsResponse.json() : []
      setInstructors(instructorsData)

      const formattedData = data.map((student) => ({
        ...student,
        rijbewijsType: student.rijbewijsType || "B", // Mock if not present
        status: student.status || "Actief", // Mock if not present
        telefoon: student.telefoon || "N.v.t.", // Mock if not present
        instructeurNaam: student.instructeur
          ? instructorsData.find((inst) => inst._id === student.instructeur)?.naam || "Onbekend"
          : "N.v.t.",
      }))
      setLeerlingen(formattedData)
    } catch (err) {
      console.error("Error fetching students:", err)
      setError("Kon leerlingen niet laden. Probeer het later opnieuw.")
      toast({
        title: "Fout",
        description: "Kon leerlingen niet laden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchLeerlingen()
  }, [fetchLeerlingen])

  const handleAddLeerling = () => {
    setCurrentLeerling(null)
    setIsDialogOpen(true)
  }

  const handleEditLeerling = (leerling: Student) => {
    setCurrentLeerling(leerling)
    setIsDialogOpen(true)
  }

  const handleDeleteLeerling = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/studenten/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete student")
      }
      setLeerlingen(leerlingen.filter((leerling) => leerling._id !== id))
      toast({
        title: "Leerling Verwijderd",
        description: "Leerling is succesvol verwijderd.",
      })
    } catch (err) {
      console.error("Error deleting student:", err)
      toast({
        title: "Fout",
        description: "Kon leerling niet verwijderen.",
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
    const rijbewijsType = formData.get("rijbewijsType") as string
    const status = formData.get("status") as "Actief" | "Inactief" | "Gepauzeerd" | "Afgestudeerd"
    const instructeur = formData.get("instructeur") as string

    const studentData = {
      naam,
      email,
      telefoon,
      rijbewijsType,
      status,
      instructeur: instructeur === "N.v.t." ? undefined : instructeur, // Send undefined if 'N.v.t.'
    }

    try {
      let response
      if (currentLeerling) {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/studenten/${currentLeerling._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        })
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/studenten`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        })
      }

      if (!response.ok) {
        throw new Error("Failed to save student")
      }

      await fetchLeerlingen() // Refresh the list
      setIsDialogOpen(false)
      toast({
        title: "Succes",
        description: `Leerling succesvol ${currentLeerling ? "bijgewerkt" : "toegevoegd"}.`,
      })
    } catch (err) {
      console.error("Error saving student:", err)
      toast({
        title: "Fout",
        description: `Kon leerling niet ${currentLeerling ? "bijwerken" : "toevoegen"}.`,
        variant: "destructive",
      })
    }
  }

  const filteredLeerlingen = leerlingen.filter(
    (leerling) =>
      leerling.naam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leerling.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (leerling.telefoon && leerling.telefoon.includes(searchTerm)) ||
      (leerling.instructeurNaam && leerling.instructeurNaam.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getStatusBadgeVariant = (status: Student["status"]) => {
    switch (status) {
      case "Actief":
        return "default"
      case "Inactief":
        return "destructive"
      case "Gepauzeerd":
        return "secondary"
      case "Afgestudeerd":
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <div className="p-4 md:p-6 text-red-500">{error}</div>
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Leerlingen</h1>
        <Button onClick={handleAddLeerling}>
          <PlusCircle className="mr-2 h-4 w-4" /> Leerling Toevoegen
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Zoek op naam, e-mail of instructeur..."
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
              <TableHead>Instructeur</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeerlingen.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Geen leerlingen gevonden.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeerlingen.map((leerling) => (
                <TableRow key={leerling._id}>
                  <TableCell className="font-medium">
                    <Link href={`/leerlingen/${leerling._id}`} className="hover:underline">
                      {leerling.naam}
                    </Link>
                  </TableCell>
                  <TableCell>{leerling.email}</TableCell>
                  <TableCell>{leerling.telefoon}</TableCell>
                  <TableCell>{leerling.rijbewijsType}</TableCell>
                  <TableCell>{leerling.instructeurNaam}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(leerling.status)}>{leerling.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditLeerling(leerling)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Bewerk leerling</span>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteLeerling(leerling._id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Verwijder leerling</span>
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
            <DialogTitle>{currentLeerling ? "Leerling Bewerken" : "Nieuwe Leerling Toevoegen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="naam" className="text-right">
                Naam
              </Label>
              <Input id="naam" name="naam" defaultValue={currentLeerling?.naam || ""} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={currentLeerling?.email || ""}
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
                defaultValue={currentLeerling?.telefoon || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rijbewijsType" className="text-right">
                Rijbewijs Type
              </Label>
              <Select name="rijbewijsType" defaultValue={currentLeerling?.rijbewijsType || "B"} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B">B (Auto)</SelectItem>
                  <SelectItem value="A">A (Motor)</SelectItem>
                  <SelectItem value="C">C (Vrachtwagen)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select name="status" defaultValue={currentLeerling?.status || "Actief"} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Actief">Actief</SelectItem>
                  <SelectItem value="Inactief">Inactief</SelectItem>
                  <SelectItem value="Gepauzeerd">Gepauzeerd</SelectItem>
                  <SelectItem value="Afgestudeerd">Afgestudeerd</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instructeur" className="text-right">
                Instructeur
              </Label>
              <Select name="instructeur" defaultValue={currentLeerling?.instructeur || ""}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer instructeur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N.v.t.">N.v.t.</SelectItem>
                  {instructors.map((inst) => (
                    <SelectItem key={inst._id} value={inst._id}>
                      {inst.naam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{currentLeerling ? "Opslaan" : "Toevoegen"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
