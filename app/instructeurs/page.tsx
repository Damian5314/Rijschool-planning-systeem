"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import type { Instructor } from "@/lib/data"

export default function InstructeursPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentInstructor, setCurrentInstructor] = useState<Instructor | null>(null)

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/instructeurs`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setInstructors(
        data.map((item: any) => ({
          id: item._id,
          name: item.naam,
          email: item.email,
          phone: item.telefoon,
          specialization: item.rijbewijsType,
          experience: 0, // Not in model, default to 0
          rating: 0, // Not in model, default to 0
          availability: [], // Not in model, default to empty
          students: 0, // Not in model, default to 0
        })),
      )
    } catch (error) {
      console.error("Fout bij het ophalen van instructeurs:", error)
      toast({
        title: "Fout",
        description: "Kon instructeurs niet ophalen.",
        variant: "destructive",
      })
    }
  }

  const handleAddInstructor = () => {
    setCurrentInstructor(null)
    setIsDialogOpen(true)
  }

  const handleEditInstructor = (instructor: Instructor) => {
    setCurrentInstructor(instructor)
    setIsDialogOpen(true)
  }

  const handleDeleteInstructor = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/instructeurs/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      setInstructors(instructors.filter((instructor) => instructor.id !== id))
      toast({
        title: "Instructeur verwijderd",
        description: `Instructeur is succesvol verwijderd.`,
      })
    } catch (error) {
      console.error("Fout bij het verwijderen van instructeur:", error)
      toast({
        title: "Fout",
        description: "Kon instructeur niet verwijderen.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const instructorData = {
      naam: formData.get("name") as string,
      email: formData.get("email") as string,
      telefoon: formData.get("phone") as string,
      rijbewijsType: formData.getAll("specialization") as string[], // Assuming multi-select or comma-separated
    }

    try {
      let response
      if (currentInstructor) {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/instructeurs/${currentInstructor.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(instructorData),
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        toast({
          title: "Instructeur bijgewerkt",
          description: `Instructeur ${instructorData.naam} is succesvol bijgewerkt.`,
        })
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/instructeurs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(instructorData),
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        toast({
          title: "Instructeur toegevoegd",
          description: `Nieuwe instructeur ${instructorData.naam} is succesvol toegevoegd.`,
        })
      }
      setIsDialogOpen(false)
      fetchInstructors() // Refresh the list
    } catch (error) {
      console.error("Fout bij opslaan instructeur:", error)
      toast({
        title: "Fout",
        description: "Kon instructeur niet opslaan.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Instructeurs</h1>
        <Button className="ml-auto" onClick={handleAddInstructor}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nieuwe Instructeur
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Overzicht Instructeurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefoon</TableHead>
                <TableHead>Specialisatie</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructors.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell>{instructor.name}</TableCell>
                  <TableCell>{instructor.email}</TableCell>
                  <TableCell>{instructor.phone}</TableCell>
                  <TableCell>{instructor.specialization.join(", ")}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditInstructor(instructor)}
                      className="mr-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Bewerken</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteInstructor(instructor.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Verwijderen</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentInstructor ? "Instructeur Bewerken" : "Nieuwe Instructeur Toevoegen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Naam
              </Label>
              <Input id="name" name="name" defaultValue={currentInstructor?.name} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={currentInstructor?.email}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Telefoon
              </Label>
              <Input id="phone" name="phone" defaultValue={currentInstructor?.phone} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialization" className="text-right">
                Rijbewijs Type
              </Label>
              <Select
                name="specialization"
                defaultValue={currentInstructor?.specialization[0]} // Assuming single select for simplicity in form
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B">B (Personenauto)</SelectItem>
                  <SelectItem value="A">A (Motor)</SelectItem>
                  <SelectItem value="C">C (Vrachtwagen)</SelectItem>
                  <SelectItem value="D">D (Bus)</SelectItem>
                  <SelectItem value="E">E (Aanhangwagen)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{currentInstructor ? "Opslaan" : "Toevoegen"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
