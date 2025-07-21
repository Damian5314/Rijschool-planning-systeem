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
import type { Vehicle, Instructor } from "@/lib/data" // Assuming Instructor interface is also here

export default function VoertuigenPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    fetchVehicles()
    fetchInstructors()
  }, [])

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
      toast({
        title: "Fout",
        description: "Kon voertuigen niet ophalen.",
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

  const handleAddVehicle = () => {
    setCurrentVehicle(null)
    setIsDialogOpen(true)
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle)
    setIsDialogOpen(true)
  }

  const handleDeleteVehicle = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicles/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== id))
      toast({
        title: "Voertuig verwijderd",
        description: `Voertuig is succesvol verwijderd.`,
      })
    } catch (error) {
      console.error("Fout bij het verwijderen van voertuig:", error)
      toast({
        title: "Fout",
        description: "Kon voertuig niet verwijderen.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const vehicleData = {
      merk: formData.get("brand") as string,
      model: formData.get("model") as string,
      bouwjaar: Number.parseInt(formData.get("year") as string),
      kenteken: formData.get("licensePlate") as string,
      transmissie: formData.get("type") === "manual" ? "Handgeschakeld" : "Automaat",
      brandstof: formData.get("fuelType") as string,
      kilometerstand: Number.parseInt(formData.get("mileage") as string),
      laatsteOnderhoud: formData.get("lastMaintenance")
        ? new Date(formData.get("lastMaintenance") as string).toISOString()
        : undefined,
      volgendeOnderhoud: formData.get("nextMaintenance")
        ? new Date(formData.get("nextMaintenance") as string).toISOString()
        : undefined,
      apkDatum: formData.get("keuringDate") ? new Date(formData.get("keuringDate") as string).toISOString() : undefined,
      status: formData.get("status") as string,
      instructeur: (formData.get("instructor") as string) || null, // Can be null
    }

    try {
      let response
      if (currentVehicle) {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicles/${currentVehicle.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(vehicleData),
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        toast({
          title: "Voertuig bijgewerkt",
          description: `Voertuig ${vehicleData.merk} ${vehicleData.model} is succesvol bijgewerkt.`,
        })
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/vehicles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(vehicleData),
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        toast({
          title: "Voertuig toegevoegd",
          description: `Nieuw voertuig ${vehicleData.merk} ${vehicleData.model} is succesvol toegevoegd.`,
        })
      }
      setIsDialogOpen(false)
      fetchVehicles() // Refresh the list
    } catch (error) {
      console.error("Fout bij opslaan voertuig:", error)
      toast({
        title: "Fout",
        description: "Kon voertuig niet opslaan.",
        variant: "destructive",
      })
    }
  }

  const getInstructorName = (instructorId: string | undefined) => {
    if (!instructorId) return "N.v.t."
    const instructor = instructors.find((inst) => inst.id === instructorId)
    return instructor ? instructor.name : "Onbekend"
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Voertuigen</h1>
        <Button className="ml-auto" onClick={handleAddVehicle}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nieuw Voertuig
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Overzicht Voertuigen</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merk</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Kenteken</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Instructeur</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.licensePlate}</TableCell>
                  <TableCell>{vehicle.type === "manual" ? "Schakel" : "Automaat"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.status === "beschikbaar"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : vehicle.status === "onderhoud"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{getInstructorName(vehicle.instructor)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditVehicle(vehicle)} className="mr-2">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Bewerken</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteVehicle(vehicle.id)}>
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
            <DialogTitle>{currentVehicle ? "Voertuig Bewerken" : "Nieuw Voertuig Toevoegen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">
                Merk
              </Label>
              <Input id="brand" name="brand" defaultValue={currentVehicle?.brand} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Model
              </Label>
              <Input id="model" name="model" defaultValue={currentVehicle?.model} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right">
                Bouwjaar
              </Label>
              <Input
                id="year"
                name="year"
                type="number"
                defaultValue={currentVehicle?.year}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="licensePlate" className="text-right">
                Kenteken
              </Label>
              <Input
                id="licensePlate"
                name="licensePlate"
                defaultValue={currentVehicle?.licensePlate}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Transmissie
              </Label>
              <Select
                name="type"
                defaultValue={currentVehicle?.type || "manual"} // Updated default value
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Schakel</SelectItem>
                  <SelectItem value="automatic">Automaat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fuelType" className="text-right">
                Brandstof
              </Label>
              <Select
                name="fuelType"
                defaultValue={currentVehicle?.fuelType || "benzine"} // Updated default value
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer brandstof" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="benzine">Benzine</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="elektrisch">Elektrisch</SelectItem>
                  <SelectItem value="hybride">Hybride</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mileage" className="text-right">
                Kilometerstand
              </Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                defaultValue={currentVehicle?.mileage}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastMaintenance" className="text-right">
                Laatste Onderhoud
              </Label>
              <Input
                id="lastMaintenance"
                name="lastMaintenance"
                type="date"
                defaultValue={currentVehicle?.lastMaintenance}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nextMaintenance" className="text-right">
                Volgende Onderhoud
              </Label>
              <Input
                id="nextMaintenance"
                name="nextMaintenance"
                type="date"
                defaultValue={currentVehicle?.nextMaintenance}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="keuringDate" className="text-right">
                APK Datum
              </Label>
              <Input
                id="keuringDate"
                name="keuringDate"
                type="date"
                defaultValue={currentVehicle?.keuringDate}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                name="status"
                defaultValue={currentVehicle?.status || "beschikbaar"} // Updated default value
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beschikbaar">Beschikbaar</SelectItem>
                  <SelectItem value="onderhoud">Onderhoud</SelectItem>
                  <SelectItem value="defect">Defect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instructor" className="text-right">
                Toegewezen Instructeur
              </Label>
              <Select
                name="instructor"
                defaultValue={currentVehicle?.instructor || ""} // Updated default value
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer instructeur (optioneel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Geen</SelectItem>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{currentVehicle ? "Opslaan" : "Toevoegen"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
