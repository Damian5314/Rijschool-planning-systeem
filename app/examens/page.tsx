"use client"

import type React from "react"

import { useState } from "react"
import { PlusCircle, Edit, Trash2, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Examen {
  id: string
  studentNaam: string
  datum: string
  type: string
  resultaat: "Geslaagd" | "Gezakt" | "Gepland"
  opmerkingen?: string
}

const mockExamens: Examen[] = [
  {
    id: "1",
    studentNaam: "Emma van der Berg",
    datum: "2024-08-10",
    type: "Praktijk B",
    resultaat: "Geslaagd",
    opmerkingen: "Eerste keer geslaagd!",
  },
  {
    id: "2",
    studentNaam: "Tom Jansen",
    datum: "2024-09-01",
    type: "Theorie",
    resultaat: "Gezakt",
    opmerkingen: "Niet goed voorbereid op verkeersregels.",
  },
  {
    id: "3",
    studentNaam: "Sophie de Vries",
    datum: "2024-09-15",
    type: "Praktijk B",
    resultaat: "Gepland",
    opmerkingen: "Examen aangevraagd.",
  },
  {
    id: "4",
    studentNaam: "Liam Bakker",
    datum: "2024-08-20",
    type: "Praktijk A",
    resultaat: "Geslaagd",
    opmerkingen: "Rijvaardigheid uitstekend.",
  },
  {
    id: "5",
    studentNaam: "Mia Smits",
    datum: "2024-10-05",
    type: "Theorie",
    resultaat: "Gepland",
    opmerkingen: "Nog geen datum bevestigd.",
  },
]

export default function ExamensPage() {
  const [examens, setExamens] = useState<Examen[]>(mockExamens)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentExamen, setCurrentExamen] = useState<Examen | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterResultaat, setFilterResultaat] = useState<string>("Alles")

  const filteredExamens = examens.filter((examen) => {
    const matchesSearch = examen.studentNaam.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesResultaat = filterResultaat === "Alles" || examen.resultaat === filterResultaat
    return matchesSearch && matchesResultaat
  })

  const handleAddExamen = () => {
    setCurrentExamen(null)
    setIsDialogOpen(true)
  }

  const handleEditExamen = (examen: Examen) => {
    setCurrentExamen(examen)
    setIsDialogOpen(true)
  }

  const handleDeleteExamen = (id: string) => {
    setExamens(examens.filter((examen) => examen.id !== id))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newExamen: Examen = {
      id: currentExamen?.id || String(examens.length + 1),
      studentNaam: formData.get("studentNaam") as string,
      datum: formData.get("datum") as string,
      type: formData.get("type") as string,
      resultaat: formData.get("resultaat") as "Geslaagd" | "Gezakt" | "Gepland",
      opmerkingen: formData.get("opmerkingen") as string,
    }

    if (currentExamen) {
      setExamens(examens.map((examen) => (examen.id === newExamen.id ? newExamen : examen)))
    } else {
      setExamens([...examens, newExamen])
    }
    setIsDialogOpen(false)
  }

  const getResultaatBadgeVariant = (resultaat: Examen["resultaat"]) => {
    switch (resultaat) {
      case "Geslaagd":
        return "default"
      case "Gezakt":
        return "destructive"
      case "Gepland":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Examens</h1>
        <Button onClick={handleAddExamen}>
          <PlusCircle className="mr-2 h-4 w-4" /> Examen Toevoegen
        </Button>
      </div>

      <div className="relative mb-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek op studentnaam..."
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
        <Select value={filterResultaat} onValueChange={setFilterResultaat}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter op resultaat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alles">Alles</SelectItem>
            <SelectItem value="Geslaagd">Geslaagd</SelectItem>
            <SelectItem value="Gezakt">Gezakt</SelectItem>
            <SelectItem value="Gepland">Gepland</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Naam</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Resultaat</TableHead>
              <TableHead className="text-right">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExamens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Geen examens gevonden.
                </TableCell>
              </TableRow>
            ) : (
              filteredExamens.map((examen) => (
                <TableRow key={examen.id}>
                  <TableCell className="font-medium">{examen.studentNaam}</TableCell>
                  <TableCell>{examen.datum}</TableCell>
                  <TableCell>{examen.type}</TableCell>
                  <TableCell>
                    <Badge variant={getResultaatBadgeVariant(examen.resultaat)}>{examen.resultaat}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditExamen(examen)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Bewerk examen</span>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteExamen(examen.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Verwijder examen</span>
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
            <DialogTitle>{currentExamen ? "Examen Bewerken" : "Nieuw Examen Toevoegen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="studentNaam" className="text-right">
                Student Naam
              </Label>
              <Input
                id="studentNaam"
                name="studentNaam"
                defaultValue={currentExamen?.studentNaam || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="datum" className="text-right">
                Datum
              </Label>
              <Input
                id="datum"
                name="datum"
                type="date"
                defaultValue={currentExamen?.datum || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select name="type" defaultValue={currentExamen?.type || ""} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Theorie">Theorie</SelectItem>
                  <SelectItem value="Praktijk B">Praktijk B</SelectItem>
                  <SelectItem value="Praktijk A">Praktijk A</SelectItem>
                  <SelectItem value="Praktijk C">Praktijk C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resultaat" className="text-right">
                Resultaat
              </Label>
              <Select name="resultaat" defaultValue={currentExamen?.resultaat || "Gepland"} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer resultaat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Geslaagd">Geslaagd</SelectItem>
                  <SelectItem value="Gezakt">Gezakt</SelectItem>
                  <SelectItem value="Gepland">Gepland</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="opmerkingen" className="text-right">
                Opmerkingen
              </Label>
              <Input
                id="opmerkingen"
                name="opmerkingen"
                defaultValue={currentExamen?.opmerkingen || ""}
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button type="submit">{currentExamen ? "Opslaan" : "Toevoegen"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
