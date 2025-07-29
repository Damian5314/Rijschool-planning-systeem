"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import type { Student, Instructor } from "@/lib/data" // Assuming Instructor interface is also here

export default function LeerlingenPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)

  useEffect(() => {
    fetchStudents()
    fetchInstructors()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/students`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setStudents(
        data.map((item: any) => ({
          id: item._id,
          name: item.naam,
          email: item.email,
          phone: item.telefoon,
          address: item.adres,
          dateOfBirth: item.geboortedatum ? new Date(item.geboortedatum).toISOString().split("T")[0] : "",
          licenseType: item.rijbewijsType,
          startDate: new Date(item.datumAangemaakt).toISOString().split("T")[0],
          instructor: item.instructeur, // This will be the instructor ID
          lessonCount: item.lesGeschiedenis.length,
          theoryPassed: item.examens.some((exam: any) => exam.type === "Theorie" && exam.resultaat === "Geslaagd"),
          practicalExamDate: item.examens.find((exam: any) => exam.type === "Praktijk" && exam.resultaat === "Gepland")
            ?.datum
            ? new Date(
                item.examens.find((exam: any) => exam.type === "Praktijk" && exam.resultaat === "Gepland")?.datum,
              )
                .toISOString()
                .split("T")[0]
            : undefined,
          status: item.status,
          progress: (item.lesGeschiedenis.length / 40) * 100, // Example progress calculation
          nextLesson: "N.v.t.", // Placeholder, needs actual lesson fetching
          avatar: "/placeholder-user.jpg", // Placeholder
          postcode: item.postcode,
          plaats: item.plaats,
          transmissie: item.transmissie,
          financieel: item.financieel,
        })),
      )
    } catch (error) {
      console.error("Fout bij het ophalen van leerlingen:", error)
      toast({
        title: "Fout",
        description: "Kon leerlingen niet ophalen.",
        variant: "destructive",
      })
    }
  }

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
          experience: 0,
          rating: 0,
          availability: [],
          students: 0,
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

  const handleAddStudent = () => {
    setCurrentStudent(null)
    setIsDialogOpen(true)
  }

  const handleEditStudent = (student: Student) => {
    setCurrentStudent(student)
    setIsDialogOpen(true)
  }

  const handleDeleteStudent = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/students/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      setStudents(students.filter((student) => student.id !== id))
      toast({
        title: "Leerling verwijderd",
        description: `Leerling is succesvol verwijderd.`,
      })
    } catch (error) {
      console.error("Fout bij het verwijderen van leerling:", error)
      toast({
        title: "Fout",
        description: "Kon leerling niet verwijderen.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const studentData = {
      naam: formData.get("name") as string,
      email: formData.get("email") as string,
      telefoon: formData.get("phone") as string,
      adres: formData.get("address") as string,
      postcode: formData.get("postcode") as string,
      plaats: formData.get("plaats") as string,
      geboortedatum: formData.get("dateOfBirth")
        ? new Date(formData.get("dateOfBirth") as string).toISOString()
        : undefined,
      rijbewijsType: formData.get("licenseType") as string,
      transmissie: formData.get("transmission") as string,
      status: formData.get("status") as string,
      instructeur: formData.get("instructor") as string,
    }

    try {
      let response
      if (currentStudent) {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/students/${currentStudent.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        toast({
          title: "Leerling bijgewerkt",
          description: `Leerling ${studentData.naam} is succesvol bijgewerkt.`,
        })
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/students`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentData),
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        toast({
          title: "Leerling toegevoegd",
          description: `Nieuwe leerling ${studentData.naam} is succesvol toegevoegd.`,
        })
      }
      setIsDialogOpen(false)
      fetchStudents() // Refresh the list
    } catch (error) {
      console.error("Fout bij opslaan leerling:", error)
      toast({
        title: "Fout",
        description: "Kon leerling niet opslaan.",
        variant: "destructive",
      })
    }
  }

  const getInstructorName = (instructorId: string) => {
    const instructor = instructors.find((inst) => inst.id === instructorId)
    return instructor ? instructor.name : "N.v.t."
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
//test