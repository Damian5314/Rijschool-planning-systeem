"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns"
import { nl } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Appointment {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  studentId: string
  studentName: string
  instructorId: string
  instructorName: string
  type: "Rijles" | "Examen" | "Intake" | "Anders"
  duration: number // in minutes
  notes?: string
}

interface Student {
  _id: string
  naam: string
}

interface Instructor {
  _id: string
  naam: string
}

export default function PlanningPage() {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/studenten`)
      if (!response.ok) {
        throw new Error("Failed to fetch students")
      }
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast({
        title: "Fout",
        description: "Kon leerlingen niet laden.",
        variant: "destructive",
      })
    }
  }, [toast])

  const fetchInstructors = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/instructeurs`)
      if (!response.ok) {
        throw new Error("Failed to fetch instructors")
      }
      const data = await response.json()
      setInstructors(data)
    } catch (error) {
      console.error("Error fetching instructors:", error)
      toast({
        title: "Fout",
        description: "Kon instructeurs niet laden.",
        variant: "destructive",
      })
    }
  }, [toast])

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lessen`)
      if (!response.ok) {
        throw new Error("Failed to fetch lessons")
      }
      const data = await response.json()

      // Map backend data to frontend Appointment interface
      const formattedAppointments: Appointment[] = data.map((lesson: any) => ({
        id: lesson._id,
        date: format(parseISO(lesson.datum), "yyyy-MM-dd"),
        time: lesson.tijd,
        studentId: lesson.student._id,
        studentName: lesson.student.naam,
        instructorId: lesson.instructeur._id,
        instructorName: lesson.instructeur.naam,
        type: lesson.type || "Rijles", // Default if not specified
        duration: lesson.duur,
        notes: lesson.opmerkingen,
      }))
      setAppointments(formattedAppointments)
    } catch (err) {
      console.error("Error fetching appointments:", err)
      setError("Kon afspraken niet laden. Probeer het later opnieuw.")
      toast({
        title: "Fout",
        description: "Kon afspraken niet laden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchStudents()
    fetchInstructors()
    fetchAppointments()
  }, [fetchStudents, fetchInstructors, fetchAppointments])

  const daysOfWeek = Array.from({ length: 7 }).map((_, i) =>
    addDays(startOfWeek(selectedDate || new Date(), { locale: nl }), i),
  )

  const appointmentsForSelectedDay = appointments
    .filter((appt) => isSameDay(parseISO(appt.date), selectedDate || new Date()))
    .sort((a, b) => a.time.localeCompare(b.time))

  const handleAddAppointment = () => {
    setCurrentAppointment(null)
    setIsDialogOpen(true)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setCurrentAppointment(appointment)
    setIsDialogOpen(true)
  }

  const handleDeleteAppointment = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lessen/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete lesson")
      }
      setAppointments(appointments.filter((appt) => appt.id !== id))
      toast({
        title: "Afspraak Verwijderd",
        description: "Afspraak is succesvol verwijderd.",
      })
    } catch (err) {
      console.error("Error deleting appointment:", err)
      toast({
        title: "Fout",
        description: "Kon afspraak niet verwijderen.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const studentId = formData.get("studentId") as string
    const instructorId = formData.get("instructorId") as string
    const student = students.find((s) => s._id === studentId)
    const instructor = instructors.find((i) => i._id === instructorId)

    if (!student || !instructor) {
      toast({
        title: "Fout",
        description: "Selecteer een geldige leerling en instructeur.",
        variant: "destructive",
      })
      return
    }

    const lessonData = {
      datum: formData.get("date") as string,
      tijd: formData.get("time") as string,
      duur: Number.parseInt(formData.get("duration") as string),
      student: studentId,
      instructeur: instructorId,
      type: formData.get("type") as string,
      opmerkingen: formData.get("notes") as string,
    }

    try {
      let response
      if (currentAppointment) {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lessen/${currentAppointment.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lessonData),
        })
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lessen`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lessonData),
        })
      }

      if (!response.ok) {
        throw new Error("Failed to save appointment")
      }

      await fetchAppointments() // Refresh the list
      setIsDialogOpen(false)
      toast({
        title: "Succes",
        description: `Afspraak succesvol ${currentAppointment ? "bijgewerkt" : "toegevoegd"}.`,
      })
    } catch (err) {
      console.error("Error saving appointment:", err)
      toast({
        title: "Fout",
        description: `Kon afspraak niet ${currentAppointment ? "bijwerken" : "toevoegen"}.`,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="p-4 md:p-6">Laden van planning...</div>
  }

  if (error) {
    return <div className="p-4 md:p-6 text-red-500">{error}</div>
  }

  return (
    <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Kalender</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              locale={nl}
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Afspraken op {selectedDate ? format(selectedDate, "PPP", { locale: nl }) : "Geen datum geselecteerd"}
            </CardTitle>
            <Button onClick={handleAddAppointment}>
              <PlusCircle className="mr-2 h-4 w-4" /> Nieuwe Afspraak
            </Button>
          </CardHeader>
          <CardContent>
            {appointmentsForSelectedDay.length === 0 ? (
              <p className="text-muted-foreground">Geen afspraken voor deze dag.</p>
            ) : (
              <div className="space-y-4">
                {appointmentsForSelectedDay.map((appt) => (
                  <div key={appt.id} className="border rounded-md p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {appt.time} - {appt.type}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Leerling: {appt.studentName} | Instructeur: {appt.instructorName}
                      </p>
                      <p className="text-sm text-muted-foreground">Duur: {appt.duration} minuten</p>
                      {appt.notes && <p className="text-sm italic">{appt.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditAppointment(appt)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Bewerk afspraak</span>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteAppointment(appt.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Verwijder afspraak</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentAppointment ? "Afspraak Bewerken" : "Nieuwe Afspraak Toevoegen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Datum
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={currentAppointment?.date || (selectedDate ? format(selectedDate, "yyyy-MM-dd") : "")}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Tijd
              </Label>
              <Input
                id="time"
                name="time"
                type="time"
                defaultValue={currentAppointment?.time || "09:00"}
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
                defaultValue={currentAppointment?.duration || 60}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="studentId" className="text-right">
                Leerling
              </Label>
              <Select
                name="studentId"
                value={currentAppointment?.studentId || ""}
                onValueChange={(value) =>
                  setCurrentAppointment((prev) =>
                    prev ? { ...prev, studentId: value } : { ...mockAppointment, studentId: value },
                  )
                }
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer leerling" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student._id} value={student._id}>
                      {student.naam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instructorId" className="text-right">
                Instructeur
              </Label>
              <Select
                name="instructorId"
                value={currentAppointment?.instructorId || ""}
                onValueChange={(value) =>
                  setCurrentAppointment((prev) =>
                    prev ? { ...prev, instructorId: value } : { ...mockAppointment, instructorId: value },
                  )
                }
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer instructeur" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor._id} value={instructor._id}>
                      {instructor.naam}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type Afspraak
              </Label>
              <Select name="type" defaultValue={currentAppointment?.type || "Rijles"} required>
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
              <Textarea id="notes" name="notes" defaultValue={currentAppointment?.notes || ""} className="col-span-3" />
            </div>
            <DialogFooter>
              <Button type="submit">{currentAppointment ? "Opslaan" : "Toevoegen"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Mock appointment for initial state if currentAppointment is null
const mockAppointment: Appointment = {
  id: "",
  date: format(new Date(), "yyyy-MM-dd"),
  time: "09:00",
  studentId: "",
  studentName: "",
  instructorId: "",
  instructorName: "",
  type: "Rijles",
  duration: 60,
  notes: "",
}
