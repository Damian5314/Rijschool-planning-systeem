"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Edit, Save, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface Student {
  _id: string
  naam: string
  email: string
  telefoon?: string
  adres?: string
  postcode?: string
  plaats?: string
  geboortedatum?: string
  rijbewijsType?: string
  transmissie?: "Handgeschakeld" | "Automaat"
  status?: "Actief" | "Inactief" | "Gepauzeerd" | "Afgestudeerd"
  instructeur?: string // ID van instructeur
  tegoed?: number
  lesGeschiedenis?: { datum: string; duur: number; opmerkingen?: string }[]
  examens?: { datum: string; type: string; resultaat: "Geslaagd" | "Gezakt" | "Gepland" }[]
  financieel?: { openstaandBedrag: number; laatsteBetaling: string }
}

interface Instructor {
  _id: string
  naam: string
}

export default function LeerlingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [student, setStudent] = useState<Student | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedStudent, setEditedStudent] = useState<Student | null>(null)
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/studenten/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch student")
      }
      const data: Student = await response.json()
      // Mock additional fields for display if not present in backend
      setStudent({
        ...data,
        telefoon: data.telefoon || "N.v.t.",
        adres: data.adres || "N.v.t.",
        postcode: data.postcode || "N.v.t.",
        plaats: data.plaats || "N.v.t.",
        geboortedatum: data.geboortedatum || "",
        rijbewijsType: data.rijbewijsType || "B",
        transmissie: data.transmissie || "Handgeschakeld",
        status: data.status || "Actief",
        instructeur: data.instructeur || "",
        tegoed: data.tegoed !== undefined ? data.tegoed : 0,
        lesGeschiedenis: data.lesGeschiedenis || [],
        examens: data.examens || [],
        financieel: data.financieel || { openstaandBedrag: 0, laatsteBetaling: "N.v.t." },
      })
      setEditedStudent({
        ...data,
        telefoon: data.telefoon || "",
        adres: data.adres || "",
        postcode: data.postcode || "",
        plaats: data.plaats || "",
        geboortedatum: data.geboortedatum || "",
        rijbewijsType: data.rijbewijsType || "B",
        transmissie: data.transmissie || "Handgeschakeld",
        status: data.status || "Actief",
        instructeur: data.instructeur || "",
        tegoed: data.tegoed !== undefined ? data.tegoed : 0,
        lesGeschiedenis: data.lesGeschiedenis || [],
        examens: data.examens || [],
        financieel: data.financieel || { openstaandBedrag: 0, laatsteBetaling: "" },
      })
    } catch (err) {
      console.error("Error fetching student:", err)
      setError("Kon leerlinggegevens niet laden. Probeer het later opnieuw.")
      toast({
        title: "Fout",
        description: "Kon leerlinggegevens niet laden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [id, toast])

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
        description: "Kon instructeurs niet laden voor dropdown.",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    if (id) {
      fetchStudent()
      fetchInstructors()
    }
  }, [id, fetchStudent, fetchInstructors])

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (isEditing) {
      // Reset changes if cancelling edit
      setEditedStudent(student)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setEditedStudent((prev) => (prev ? { ...prev, [id]: value } : null))
  }

  const handleDateChange = (date: Date | undefined) => {
    setEditedStudent((prev) => (prev ? { ...prev, geboortedatum: date ? format(date, "yyyy-MM-dd") : "" } : null))
  }

  const handleSave = async () => {
    if (!editedStudent) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/studenten/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedStudent),
      })

      if (!response.ok) {
        throw new Error("Failed to update student")
      }

      const updatedData = await response.json()
      setStudent({
        ...updatedData,
        telefoon: updatedData.telefoon || "N.v.t.",
        adres: updatedData.adres || "N.v.t.",
        postcode: updatedData.postcode || "N.v.t.",
        plaats: updatedData.plaats || "N.v.t.",
        geboortedatum: updatedData.geboortedatum || "",
        rijbewijsType: updatedData.rijbewijsType || "B",
        transmissie: updatedData.transmissie || "Handgeschakeld",
        status: updatedData.status || "Actief",
        instructeur: updatedData.instructeur || "",
        tegoed: updatedData.tegoed !== undefined ? updatedData.tegoed : 0,
        lesGeschiedenis: updatedData.lesGeschiedenis || [],
        examens: updatedData.examens || [],
        financieel: updatedData.financieel || { openstaandBedrag: 0, laatsteBetaling: "N.v.t." },
      })
      setIsEditing(false)
      toast({
        title: "Succes",
        description: "Leerlinggegevens succesvol bijgewerkt.",
      })
    } catch (err) {
      console.error("Error saving student:", err)
      toast({
        title: "Fout",
        description: "Kon leerlinggegevens niet opslaan.",
        variant: "destructive",
      })
    }
  }

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
    return <div className="p-4 md:p-6">Laden...</div>
  }

  if (error) {
    return <div className="p-4 md:p-6 text-red-500">{error}</div>
  }

  if (!student || !editedStudent) {
    return <div className="p-4 md:p-6">Leerling niet gevonden.</div>
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{student.naam}</h1>
        <Button onClick={handleEditToggle} variant={isEditing ? "secondary" : "default"}>
          {isEditing ? (
            <>
              <XCircle className="mr-2 h-4 w-4" /> Annuleren
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" /> Bewerken
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Algemene Informatie */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Algemene Informatie</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="naam">Naam</Label>
                <Input id="naam" value={editedStudent.naam} onChange={handleChange} disabled={!isEditing} />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedStudent.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefoon">Telefoon</Label>
                <Input
                  id="telefoon"
                  type="tel"
                  value={editedStudent.telefoon}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="geboortedatum">Geboortedatum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !editedStudent.geboortedatum && "text-muted-foreground"
                      }`}
                      disabled={!isEditing}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedStudent.geboortedatum ? (
                        format(new Date(editedStudent.geboortedatum), "PPP")
                      ) : (
                        <span>Kies een datum</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editedStudent.geboortedatum ? new Date(editedStudent.geboortedatum) : undefined}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <Label htmlFor="adres">Adres</Label>
              <Input id="adres" value={editedStudent.adres} onChange={handleChange} disabled={!isEditing} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input id="postcode" value={editedStudent.postcode} onChange={handleChange} disabled={!isEditing} />
              </div>
              <div>
                <Label htmlFor="plaats">Plaats</Label>
                <Input id="plaats" value={editedStudent.plaats} onChange={handleChange} disabled={!isEditing} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rijbewijsType">Rijbewijs Type</Label>
                <Select
                  value={editedStudent.rijbewijsType}
                  onValueChange={(value) =>
                    setEditedStudent((prev) => (prev ? { ...prev, rijbewijsType: value } : null))
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B">B (Auto)</SelectItem>
                    <SelectItem value="A">A (Motor)</SelectItem>
                    <SelectItem value="C">C (Vrachtwagen)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transmissie">Transmissie</Label>
                <Select
                  value={editedStudent.transmissie}
                  onValueChange={(value) =>
                    setEditedStudent((prev) =>
                      prev ? { ...prev, transmissie: value as "Handgeschakeld" | "Automaat" } : null,
                    )
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer transmissie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Handgeschakeld">Handgeschakeld</SelectItem>
                    <SelectItem value="Automaat">Automaat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editedStudent.status}
                  onValueChange={(value) =>
                    setEditedStudent((prev) =>
                      prev ? { ...prev, status: value as "Actief" | "Inactief" | "Gepauzeerd" | "Afgestudeerd" } : null,
                    )
                  }
                  disabled={!isEditing}
                >
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
              <div>
                <Label htmlFor="instructeur">Toegewezen Instructeur</Label>
                <Select
                  value={editedStudent.instructeur}
                  onValueChange={(value) => setEditedStudent((prev) => (prev ? { ...prev, instructeur: value } : null))}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer instructeur" />
                  </SelectTrigger>
                  <SelectContent>
                    {instructors.map((inst) => (
                      <SelectItem key={inst._id} value={inst._id}>
                        {inst.naam}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {isEditing && (
              <Button onClick={handleSave} className="w-fit mt-4">
                <Save className="mr-2 h-4 w-4" /> Wijzigingen Opslaan
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Financieel Overzicht */}
        <Card>
          <CardHeader>
            <CardTitle>Financieel Overzicht</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span>Openstaand bedrag:</span>
              <span className="font-medium">€{student.financieel?.openstaandBedrag.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between">
              <span>Laatste betaling:</span>
              <span className="font-medium">{student.financieel?.laatsteBetaling || "N.v.t."}</span>
            </div>
            <div className="flex justify-between">
              <span>Tegoed (uren/lessen):</span>
              <span className="font-medium">{student.tegoed || 0}</span>
            </div>
            {/* Add more financial details as needed */}
          </CardContent>
        </Card>

        {/* Lesgeschiedenis */}
        <Card>
          <CardHeader>
            <CardTitle>Lesgeschiedenis</CardTitle>
          </CardHeader>
          <CardContent>
            {student.lesGeschiedenis && student.lesGeschiedenis.length > 0 ? (
              <ul className="space-y-2">
                {student.lesGeschiedenis.map((les, index) => (
                  <li key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{les.datum}</span>
                      <span>{les.duur} minuten</span>
                    </div>
                    {les.opmerkingen && <p className="text-sm text-muted-foreground">{les.opmerkingen}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nog geen lesgeschiedenis.</p>
            )}
          </CardContent>
        </Card>

        {/* Examens */}
        <Card>
          <CardHeader>
            <CardTitle>Examens</CardTitle>
          </CardHeader>
          <CardContent>
            {student.examens && student.examens.length > 0 ? (
              <ul className="space-y-2">
                {student.examens.map((examen, index) => (
                  <li key={index} className="border-b pb-2 last:border-b-0 last:pb-0">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {examen.datum} - {examen.type}
                      </span>
                      <Badge
                        variant={
                          examen.resultaat === "Geslaagd"
                            ? "default"
                            : examen.resultaat === "Gezakt"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {examen.resultaat}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nog geen examens geregistreerd.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
