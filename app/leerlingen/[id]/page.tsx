"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Student, Instructor } from "@/lib/data" // Assuming Instructor interface is also here

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  const [student, setStudent] = useState<Student | null>(null)
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student data
        const studentRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/students/${studentId}`)
        if (!studentRes.ok) {
          throw new Error(`Failed to fetch student: ${studentRes.statusText}`)
        }
        const studentData = await studentRes.json()
        setStudent({
          id: studentData._id,
          name: studentData.naam,
          email: studentData.email,
          phone: studentData.telefoon,
          address: studentData.adres,
          dateOfBirth: studentData.geboortedatum ? format(new Date(studentData.geboortedatum), "yyyy-MM-dd") : "",
          licenseType: studentData.rijbewijsType,
          startDate: format(new Date(studentData.datumAangemaakt), "yyyy-MM-dd"),
          instructor: studentData.instructeur, // This will be the instructor ID
          lessonCount: studentData.lesGeschiedenis.length,
          theoryPassed: studentData.examens.some(
            (exam: any) => exam.type === "Theorie" && exam.resultaat === "Geslaagd",
          ),
          practicalExamDate: studentData.examens.find(
            (exam: any) => exam.type === "Praktijk" && exam.resultaat === "Gepland",
          )?.datum
            ? format(
                new Date(
                  studentData.examens.find((exam: any) => exam.type === "Praktijk" && exam.resultaat === "Gepland")
                    ?.datum,
                ),
                "yyyy-MM-dd",
              )
            : undefined,
          status: studentData.status,
          progress: (studentData.lesGeschiedenis.length / 40) * 100, // Example progress calculation
          nextLesson: "N.v.t.", // Placeholder, needs actual lesson fetching
          avatar: "/placeholder-user.jpg", // Placeholder
        })

        // Fetch instructors for the select dropdown
        const instructorRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/instructeurs`)
        if (!instructorRes.ok) {
          throw new Error(`Failed to fetch instructors: ${instructorRes.statusText}`)
        }
        const instructorData = await instructorRes.json()
        setInstructors(
          instructorData.map((item: any) => ({
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
      } catch (err: any) {
        setError(err.message)
        toast({
          title: "Fout",
          description: `Kon studentgegevens niet laden: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (studentId) {
      fetchData()
    }
  }, [studentId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!student) return

    const formData = new FormData(e.target as HTMLFormElement)
    const updatedStudentData = {
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
      // lesGeschiedenis, examens, financieel are updated separately or handled by backend
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/students/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedStudentData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setStudent({
        id: result._id,
        name: result.naam,
        email: result.email,
        phone: result.telefoon,
        address: result.adres,
        dateOfBirth: result.geboortedatum ? format(new Date(result.geboortedatum), "yyyy-MM-dd") : "",
        licenseType: result.rijbewijsType,
        startDate: format(new Date(result.datumAangemaakt), "yyyy-MM-dd"),
        instructor: result.instructeur,
        lessonCount: result.lesGeschiedenis.length,
        theoryPassed: result.examens.some((exam: any) => exam.type === "Theorie" && exam.resultaat === "Geslaagd"),
        practicalExamDate: result.examens.find((exam: any) => exam.type === "Praktijk" && exam.resultaat === "Gepland")
          ?.datum
          ? format(
              new Date(
                result.examens.find((exam: any) => exam.type === "Praktijk" && exam.resultaat === "Gepland")?.datum,
              ),
              "yyyy-MM-dd",
            )
          : undefined,
        status: result.status,
        progress: (result.lesGeschiedenis.length / 40) * 100,
        nextLesson: "N.v.t.",
        avatar: "/placeholder-user.jpg",
      })

      toast({
        title: "Student bijgewerkt",
        description: `Gegevens van ${updatedStudentData.naam} zijn succesvol opgeslagen.`,
      })
    } catch (err: any) {
      console.error("Fout bij opslaan student:", err)
      toast({
        title: "Fout",
        description: `Kon studentgegevens niet opslaan: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Laden...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Fout: {error}</div>
  }

  if (!student) {
    return <div className="flex justify-center items-center h-screen">Student niet gevonden.</div>
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Terug</span>
        </Button>
        <h1 className="text-lg font-semibold md:text-2xl">Student: {student.name}</h1>
      </div>

      <form onSubmit={handleSave} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Persoonlijke Gegevens</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Naam</Label>
              <Input id="name" name="name" defaultValue={student.name} required />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" defaultValue={student.email} required />
            </div>
            <div>
              <Label htmlFor="phone">Telefoon</Label>
              <Input id="phone" name="phone" defaultValue={student.phone} required />
            </div>
            <div>
              <Label htmlFor="address">Adres</Label>
              <Input id="address" name="address" defaultValue={student.address} />
            </div>
            <div>
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" name="postcode" defaultValue={student.postcode} />
            </div>
            <div>
              <Label htmlFor="plaats">Plaats</Label>
              <Input id="plaats" name="plaats" defaultValue={student.plaats} />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Geboortedatum</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={student.dateOfBirth} />
            </div>
            <div>
              <Label htmlFor="licenseType">Rijbewijs Type</Label>
              <Select name="licenseType" defaultValue={student.licenseType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B">B (Personenauto)</SelectItem>
                  <SelectItem value="A">A (Motor)</SelectItem>
                  <SelectItem value="AM">AM (Bromfiets)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transmission">Transmissie</Label>
              <Select name="transmission" defaultValue={student.transmissie} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer transmissie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Handgeschakeld">Handgeschakeld</SelectItem>
                  <SelectItem value="Automaat">Automaat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="instructor">Instructeur</Label>
              <Select name="instructor" defaultValue={student.instructor}>
                <SelectTrigger>
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
            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={student.status} required>
                <SelectTrigger>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lesgeschiedenis & Examens</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* This section would ideally fetch and display actual lesson history and exams */}
            <p className="text-sm text-muted-foreground">
              Lesgeschiedenis en examenresultaten worden hier weergegeven. Functionaliteit om deze te bewerken/toevoegen
              komt later.
            </p>
            <div>
              <Label>Aantal Lessen</Label>
              <Input value={student.lessonCount} readOnly />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="theoryPassed" checked={student.theoryPassed} disabled />
              <Label htmlFor="theoryPassed">Theorie Examen Geslaagd</Label>
            </div>
            <div>
              <Label htmlFor="practicalExamDate">Praktijk Examen Datum (gepland)</Label>
              <Input id="practicalExamDate" type="date" value={student.practicalExamDate || ""} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financiële Gegevens</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* This section would ideally fetch and display actual financial data */}
            <p className="text-sm text-muted-foreground">
              Financiële gegevens worden hier weergegeven. Functionaliteit om deze te bewerken/toevoegen komt later.
            </p>
            <div>
              <Label>Openstaand Bedrag</Label>
              <Input value={`€${student.financieel?.openstaandBedrag?.toFixed(2) || "0.00"}`} readOnly />
            </div>
            <div>
              <Label>Laatste Betaling</Label>
              <Input
                value={
                  student.financieel?.laatsteBetaling
                    ? format(new Date(student.financieel.laatsteBetaling), "dd-MM-yyyy", { locale: nl })
                    : "N.v.t."
                }
                readOnly
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full md:w-auto">
          Wijzigingen Opslaan
        </Button>
      </form>
    </div>
  )
}
