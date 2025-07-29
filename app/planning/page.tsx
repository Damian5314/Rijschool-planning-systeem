"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2, CalendarIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { toast } from "@/components/ui/use-toast"
import type { Lesson, Student, Instructor, Vehicle } from "@/lib/data" // Import interfaces

export default function PlanningPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    fetchLessons()
    fetchStudents()
    fetchInstructors()
    fetchVehicles()
  }, [])

  const fetchLessons = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setLessons(
        data.map((item: any) => ({
          id: item._id,
          studentId: item.student,
          instructorId: item.instructeur,
          vehicleId: "mock-vehicle-id", // Placeholder as vehicle is not directly linked in lesson model yet
          date: new Date(item.datum).toISOString().split("T")[0],
          time: item.tijd,
          duration: item.duur,
          type: item.type,
          status: "scheduled", // Assuming all fetched lessons are scheduled
          notes: item.opmerkingen,
          location: "N.v.t.", // Placeholder
        })),
      )
    } catch (error) {
      console.error("Fout bij het ophalen van lessen:", error)
      toast({
        title: "Fout",
        description: "Kon lessen niet ophalen.",
        variant: "destructive",
      })
    }
  }

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
          instructor: item.instructeur,
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
          progress: (item.lesGeschiedenis.length / 40) * 100,
          nextLesson: "N.v.t.",
          avatar: "/placeholder-user.jpg",
          postcode: item.postcode,
          plaats: item.plaats,
          transmissie: item.transmissie,
          financieel: item.financieel,
        })),
      )
    } catch (error) {
      console.error("Fout bij het ophalen van leerlingen:", error)
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
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicles`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setVehicles(
        data.map((item: any) => ({
          id: item._id,
          brand: item.merk,
          model: item.model,
          year: item.bouwjaar,
          licensePlate: item.kenteken,
          type: item.transmissie === "Handgeschakeld" ? "manual" : "automatic",
          fuelType: item.brandstof,
          mileage: item.kilometerstand,
          lastMaintenance: item.laatsteOnderhoud ? new Date(item.laatsteOnderhoud).toISOString().split("T")[0] : "",
          nextMaintenance: item.volgendeOnderhoud ? new Date(item.volgendeOnderhoud).toISOString().split("T")[0] : "",
          keuringDate: item.apkDatum ? new Date(item.apkDatum).toISOString().split("T")[0] : "",
          status: item.status,
          instructor: item.instructeur,
          image: "/placeholder.svg", // Placeholder
        })),
      )
    } catch (error) {
      console.error("Fout bij het ophalen van voertuigen:", error)
    }
  }

  const handleAddLesson = () => {
    setCurrentLesson(null)
    setDate(undefined)
    setIsDialogOpen(true)
  }

  const handleEditLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson)
    setDate(new Date(lesson.date))
    setIsDialogOpen(true)
  }

  const handleDeleteLesson = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      setLessons(lessons.filter((lesson) => lesson.id !== id))
      toast({
        title: "Les verwijderd",
        description: `Les is succesvol verwijderd.`,
      })
    } catch (error) {
      console.error("Fout bij het verwijderen van les:", error)
      toast({
        title: "Fout",
        description: "Kon les niet verwijderen.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const lessonData = {
      datum: date ? date.toISOString() : "",
      tijd: formData.get("time") as string,
      duur: Number.parseInt(formData.get("duration") as string),
      student: formData.get("studentId") as string,
      instructeur: formData.get("instructorId") as string,
      type: formData.get("type") as string,
      opmerkingen: formData.get("notes") as string,
    }

    try {
      let response
      if (currentLesson) {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons/${currentLesson.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lessonData),
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        toast({
          title: "Les bijgewerkt",
          description: `Les is succesvol bijgewerkt.`,
        })
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lessonData),
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        toast({
          title: "Les toegevoegd",
          description: `Nieuwe les is succesvol toegevoegd.`,
        })
      }
      setIsDialogOpen(false)
      fetchLessons() // Refresh the list
    } catch (error) {
      console.error("Fout bij opslaan les:", error)
      toast({
        title: "Fout",
        description: "Kon les niet opslaan.",
        variant: "destructive",
      })
    }
  }

  const getStudentName = (studentId: string) => {
    return students.find((s) => s.id === studentId)?.name || "Onbekende student"
  }

  const getInstructorName = (instructorId: string) => {
    return instructors.find((i) => i.id === instructorId)?.name || "Onbekende instructeur"
  }

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : "N.v.t."
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Lesplanning</h1>
        <Button className="ml-auto" onClick={handleAddLesson}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nieuwe Les
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Overzicht Lessen</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Tijd</TableHead>
                <TableHead>Duur (min)</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Instructeur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Opmerkingen</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>{format(new Date(lesson.date), "dd-MM-yyyy", { locale: nl })}</TableCell>
                  <TableCell>{lesson.time}</TableCell>
                  <TableCell>{lesson.duration}</TableCell>
                  <TableCell>{getStudentName(lesson.studentId)}</TableCell>
                  <TableCell>{getInstructorName(lesson.instructorId)}</TableCell>
                  <TableCell>{lesson.type}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{lesson.notes || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditLesson(lesson)} className="mr-2">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Bewerken</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(lesson.id)}>
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
            <DialogTitle>{currentLesson ? "Les Bewerken" : "Nieuwe Les Toevoegen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Datum
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`col-span-3 justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: nl }) : <span>Kies een datum</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={nl} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Tijd
              </Label>
              <Input
                id="time"
                name="time"
                type="time"
                defaultValue={currentLesson?.time}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duur (min)
              </Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                defaultValue={currentLesson?.duration || 60}
                className="col-span-3"
                min="15"
                step="15"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="studentId" className="text-right">
                Student
              </Label>
              <Select name="studentId" defaultValue={currentLesson?.studentId} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instructorId" className="text-right">
                Instructeur
              </Label>
              <Select name="instructorId" defaultValue={currentLesson?.instructorId} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer instructeur" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type Les
              </Label>
              <Select name="type" defaultValue={currentLesson?.type || "Rijles"} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rijles">Rijles</SelectItem>
                  <SelectItem value="Examen">Examen</SelectItem>
                  <SelectItem value="Intake">Intake</SelectItem>
                  <SelectItem value="Anders">Anders</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Opmerkingen
              </Label>
              <Textarea id="notes" name="notes" defaultValue={currentLesson?.notes || ""} className="col-span-3" />
            </div>
            <DialogFooter>
              <Button type="submit">{currentLesson ? "Opslaan" : "Toevoegen"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
//test