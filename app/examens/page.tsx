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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { toast } from "@/components/ui/use-toast"
import type { Exam } from "@/lib/data" // Assuming Exam interface is defined here

export default function ExamensPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentExam, setCurrentExam] = useState<Exam | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)

  // Mock data for students (replace with actual fetch later)
  const mockStudents = [
    { id: "1", name: "Emma van der Berg" },
    { id: "2", name: "Lucas de Vries" },
    { id: "3", name: "Sophie Willems" },
  ]

  useEffect(() => {
    // Mock fetching exams
    const fetchedExams: Exam[] = [
      {
        id: "e1",
        studentId: "1",
        type: "practical",
        date: "2024-08-10",
        time: "10:00",
        location: "CBR Rotterdam",
        status: "scheduled",
        attempts: 1,
      },
      {
        id: "e2",
        studentId: "2",
        type: "theory",
        date: "2024-07-25",
        time: "14:00",
        location: "Online",
        status: "passed",
        attempts: 1,
      },
      {
        id: "e3",
        studentId: "3",
        type: "practical",
        date: "2024-09-01",
        time: "09:30",
        location: "CBR Utrecht",
        status: "failed",
        attempts: 2,
      },
    ]
    setExams(fetchedExams)
  }, [])

  const handleAddExam = () => {
    setCurrentExam(null)
    setDate(undefined)
    setIsDialogOpen(true)
  }

  const handleEditExam = (exam: Exam) => {
    setCurrentExam(exam)
    setDate(new Date(exam.date))
    setIsDialogOpen(true)
  }

  const handleDeleteExam = (id: string) => {
    setExams(exams.filter((exam) => exam.id !== id))
    toast({
      title: "Examen verwijderd",
      description: `Examen met ID ${id} is succesvol verwijderd.`,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const newExam: Exam = {
      id: currentExam?.id || `e${exams.length + 1}`,
      studentId: formData.get("studentId") as string,
      type: formData.get("type") as "theory" | "practical",
      date: date ? format(date, "yyyy-MM-dd") : "",
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      status: formData.get("status") as "scheduled" | "passed" | "failed",
      attempts: Number.parseInt(formData.get("attempts") as string) || 1,
    }

    if (currentExam) {
      setExams(exams.map((exam) => (exam.id === newExam.id ? newExam : exam)))
      toast({
        title: "Examen bijgewerkt",
        description: `Examen voor ${mockStudents.find((s) => s.id === newExam.studentId)?.name} is succesvol bijgewerkt.`,
      })
    } else {
      setExams([...exams, newExam])
      toast({
        title: "Examen toegevoegd",
        description: `Nieuw examen voor ${mockStudents.find((s) => s.id === newExam.studentId)?.name} is succesvol toegevoegd.`,
      })
    }
    setIsDialogOpen(false)
  }

  const getStudentName = (studentId: string) => {
    return mockStudents.find((s) => s.id === studentId)?.name || "Onbekende student"
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Examens</h1>
        <Button className="ml-auto" onClick={handleAddExam}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nieuw Examen
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Overzicht Examens</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Tijd</TableHead>
                <TableHead>Locatie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pogingen</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{getStudentName(exam.studentId)}</TableCell>
                  <TableCell>{exam.type === "practical" ? "Praktijk" : "Theorie"}</TableCell>
                  <TableCell>{format(new Date(exam.date), "dd-MM-yyyy", { locale: nl })}</TableCell>
                  <TableCell>{exam.time}</TableCell>
                  <TableCell>{exam.location}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        exam.status === "scheduled"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : exam.status === "passed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {exam.status === "scheduled" ? "Gepland" : exam.status === "passed" ? "Geslaagd" : "Gezakt"}
                    </span>
                  </TableCell>
                  <TableCell>{exam.attempts}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditExam(exam)} className="mr-2">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Bewerken</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteExam(exam.id)}>
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
            <DialogTitle>{currentExam ? "Examen Bewerken" : "Nieuw Examen Toevoegen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="studentId" className="text-right">
                Student
              </Label>
              <Select name="studentId" defaultValue={currentExam?.studentId} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer student" />
                </SelectTrigger>
                <SelectContent>
                  {mockStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select name="type" defaultValue={currentExam?.type} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="practical">Praktijk</SelectItem>
                  <SelectItem value="theory">Theorie</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                defaultValue={currentExam?.time}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Locatie
              </Label>
              <Input
                id="location"
                name="location"
                defaultValue={currentExam?.location}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select name="status" defaultValue={currentExam?.status} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Gepland</SelectItem>
                  <SelectItem value="passed">Geslaagd</SelectItem>
                  <SelectItem value="failed">Gezakt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attempts" className="text-right">
                Pogingen
              </Label>
              <Input
                id="attempts"
                name="attempts"
                type="number"
                defaultValue={currentExam?.attempts || 1}
                className="col-span-3"
                min="1"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">{currentExam ? "Opslaan" : "Toevoegen"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
//test