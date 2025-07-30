"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Eye, Euro } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Leerling {
  id: number
  naam: string
  email: string
  telefoon: string
  transmissie: string
  status: string
  lessen: number
  instructeur: string
  startdatum: string
  adres: string
  postcode: string
  plaats: string
  tegoed: number
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
  const [students, setStudents] = useState<Student[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAdresDialogOpen, setIsAdresDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

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

  const [leerlingen, setLeerlingen] = useState<Leerling[]>([])

  // Mock data laden
  useEffect(() => {
    const mockLeerlingen: Leerling[] = [
      {
        id: 1,
        naam: "Emma van der Berg",
        email: "emma@email.com",
        telefoon: "06-12345678",
        transmissie: "Automaat",
        status: "Actief",
        lessen: 15,
        instructeur: "Jan Bakker",
        startdatum: "2024-01-15",
        adres: "Hoofdstraat 123",
        postcode: "1234 AB",
        plaats: "Amsterdam",
        tegoed: 150.0,
      },
      {
        id: 2,
        naam: "Tom Jansen",
        email: "tom@email.com",
        telefoon: "06-87654321",
        transmissie: "Schakel",
        status: "Examen",
        lessen: 28,
        instructeur: "Lisa de Vries",
        startdatum: "2023-11-20",
        adres: "Kerkstraat 45",
        postcode: "5678 CD",
        plaats: "Rotterdam",
        tegoed: 75.5,
      },
      {
        id: 3,
        naam: "Sophie Willems",
        email: "sophie@email.com",
        telefoon: "06-11223344",
        transmissie: "Automaat",
        status: "Actief",
        lessen: 8,
        instructeur: "Mark Peters",
        startdatum: "2024-02-10",
        adres: "Dorpsstraat 67",
        postcode: "9012 EF",
        plaats: "Utrecht",
        tegoed: 200.0,
      },
      {
        id: 4,
        naam: "David Smit",
        email: "david@email.com",
        telefoon: "06-55667788",
        transmissie: "Schakel",
        status: "Geslaagd",
        lessen: 35,
        instructeur: "Jan Bakker",
        startdatum: "2023-09-05",
        adres: "Schoolstraat 89",
        postcode: "3456 GH",
        plaats: "Den Haag",
        tegoed: 0.0,
      },
    ]
    
    setLeerlingen(mockLeerlingen)
    setLoading(false)
  }, [])

  const filteredLeerlingen = leerlingen.filter(
    (leerling) =>
      leerling.naam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leerling.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leerling.plaats.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  const addLeerling = () => {
    if (newLeerling.naam && newLeerling.email && newLeerling.telefoon) {
      const leerling: Leerling = {
        id: leerlingen.length + 1,
        naam: newLeerling.naam,
        email: newLeerling.email,
        telefoon: newLeerling.telefoon,
        transmissie: newLeerling.transmissie,
        instructeur: newLeerling.instructeur,
        adres: newLeerling.adres,
        postcode: newLeerling.postcode,
        plaats: newLeerling.plaats,
        status: "Nieuw",
        lessen: 0,
        startdatum: new Date().toISOString().split("T")[0],
        tegoed: 0.0,
      }
      setLeerlingen([...leerlingen, leerling])
      setNewLeerling({
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
    } catch (error) {
      console.error("Fout bij het verwijderen van leerling:", error)
      toast({
        title: "Leerling toegevoegd",
        description: `${newLeerling.naam} is succesvol toegevoegd.`,
      })
    } else {
      toast({
        title: "Validatiefout",
        description: "Vul alle verplichte velden in",
        variant: "destructive",
      })
    }
  }

  const deleteLeerling = (id: number) => {
    setLeerlingen(leerlingen.filter((l) => l.id !== id))
    toast({
      title: "Leerling verwijderd",
      description: "De leerling is succesvol verwijderd.",
      variant: "destructive",
    })
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
    setIsAdresDialogOpen(false)
  }

  if (loading) {
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
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Leerlingen</h1>
        <Button className="ml-auto" onClick={handleAddStudent}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nieuwe Leerling
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Overzicht Leerlingen</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefoon</TableHead>
                <TableHead>Instructeur</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>{getInstructorName(student.instructor)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === "Actief"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : student.status === "Gepauzeerd"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {student.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/leerlingen/${student.id}`}>
                      <Button variant="ghost" size="icon" className="mr-2">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Bekijken</span>
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => handleEditStudent(student)} className="mr-2">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Bewerken</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id)}>
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
            <DialogTitle>{currentStudent ? "Leerling Bewerken" : "Nieuwe Leerling Toevoegen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Naam
              </Label>
              <Input id="name" name="name" defaultValue={currentStudent?.name} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={currentStudent?.email}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Telefoon
              </Label>
              <Input id="phone" name="phone" defaultValue={currentStudent?.phone} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Adres
              </Label>
              <Input id="address" name="address" defaultValue={currentStudent?.address} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="postcode" className="text-right">
                Postcode
              </Label>
              <Input id="postcode" name="postcode" defaultValue={currentStudent?.postcode} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plaats" className="text-right">
                Plaats
              </Label>
              <Input id="plaats" name="plaats" defaultValue={currentStudent?.plaats} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dateOfBirth" className="text-right">
                Geboortedatum
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={currentStudent?.dateOfBirth}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="licenseType" className="text-right">
                Rijbewijs Type
              </Label>
              <Select name="licenseType" defaultValue={currentStudent?.licenseType} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B">B (Personenauto)</SelectItem>
                  <SelectItem value="A">A (Motor)</SelectItem>
                  <SelectItem value="AM">AM (Bromfiets)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transmission" className="text-right">
                Transmissie
              </Label>
              <Select name="transmission" defaultValue={currentStudent?.transmissie} required>
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
              <Label htmlFor="instructor" className="text-right">
                Instructeur
              </Label>
              <Select name="instructor" defaultValue={currentStudent?.instructor}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer instructeur" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instr) => (
                    <SelectItem key={instr.id} value={instr.id}>
                      {instr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select name="status" defaultValue={currentStudent?.status} required>
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
            <DialogFooter>
              <Button type="submit">{currentStudent ? "Opslaan" : "Toevoegen"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}