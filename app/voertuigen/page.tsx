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

interface Vehicle {
  id: string
  kenteken: string
  merk: string
  model: string
  bouwjaar: number
  type: "Auto" | "Motor" | "Vrachtwagen"
  transmissie: "Handgeschakeld" | "Automaat"
  status: "Beschikbaar" | "In Onderhoud" | "Uit Dienst"
}

const mockVehicles: Vehicle[] = [
  {
    id: "v1",
    kenteken: "AB-12-CD",
    merk: "Volkswagen",
    model: "Golf",
    bouwjaar: 2020,
    type: "Auto",
    transmissie: "Handgeschakeld",
    status: "Beschikbaar",
  },
  {
    id: "v2",
    kenteken: "EF-34-GH",
    merk: "Audi",
    model: "A3",
    bouwjaar: 2021,
    type: "Auto",
    transmissie: "Automaat",
    status: "Beschikbaar",
  },
  {
    id: "v3",
    kenteken: "IJ-56-KL",
    merk: "Yamaha",
    model: "MT-07",
    bouwjaar: 2019,
    type: "Motor",
    transmissie: "Handgeschakeld",
    status: "In Onderhoud",
  },
  {
    id: "v4",
    kenteken: "MN-78-OP",
    merk: "Mercedes-Benz",
    model: "Actros",
    bouwjaar: 2018,
    type: "Vrachtwagen",
    transmissie: "Automaat",
    status: "Beschikbaar",
  },
]

export default function VoertuigenPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("Alles")
  const [filterStatus, setFilterStatus] = useState<string>("Alles")

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.kenteken.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "Alles" || vehicle.type === filterType
    const matchesStatus = filterStatus === "Alles" || vehicle.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleAddVehicle = () => {
    setCurrentVehicle(null)
    setIsDialogOpen(true)
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle)
    setIsDialogOpen(true)
  }

  const handleDeleteVehicle = (id: string) => {
    setVehicles(vehicles.filter((vehicle) => vehicle.id !== id))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newVehicle: Vehicle = {
      id: currentVehicle?.id || String(vehicles.length + 1),
      kenteken: formData.get("kenteken") as string,
      merk: formData.get("merk") as string,
      model: formData.get("model") as string,
      bouwjaar: Number.parseInt(formData.get("bouwjaar") as string),
      type: formData.get("type") as "Auto" | "Motor" | "Vrachtwagen",
      transmissie: formData.get("transmissie") as "Handgeschakeld" | "Automaat",
      status: formData.get("status") as "Beschikbaar" | "In Onderhoud" | "Uit Dienst",
    }

    if (currentVehicle) {
      setVehicles(vehicles.map((vehicle) => (vehicle.id === newVehicle.id ? newVehicle : vehicle)))
    } else {
      setVehicles([...vehicles, newVehicle])
    }
    setIsDialogOpen(false)
  }

  const getStatusBadgeVariant = (status: Vehicle["status"]) => {
    switch (status) {
      case "Beschikbaar":
        return "default"
      case "In Onderhoud":
        return "secondary"
      case "Uit Dienst":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Voertuigen</h1>
        <Button onClick={handleAddVehicle}>
          <PlusCircle className="mr-2 h-4 w-4" /> Voertuig Toevoegen
        </Button>
      </div>

      <div className="relative mb-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek op kenteken, merk of model..."
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
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter op type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alles">Alles</SelectItem>
            <SelectItem value="Auto">Auto</SelectItem>
            <SelectItem value="Motor">Motor</SelectItem>
            <SelectItem value="Vrachtwagen">Vrachtwagen</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter op status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alles">Alles</SelectItem>
            <SelectItem value="Beschikbaar">Beschikbaar</SelectItem>
            <SelectItem value="In Onderhoud">In Onderhoud</SelectItem>
            <SelectItem value="Uit Dienst">Uit Dienst</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kenteken</TableHead>
              <TableHead>Merk</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Bouwjaar</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Transmissie</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Geen voertuigen gevonden.
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.kenteken}</TableCell>
                  <TableCell>{vehicle.merk}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.bouwjaar}</TableCell>
                  <TableCell>{vehicle.type}</TableCell>
                  <TableCell>{vehicle.transmissie}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(vehicle.status)}>{vehicle.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditVehicle(vehicle)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Bewerk voertuig</span>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteVehicle(vehicle.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Verwijder voertuig</span>
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
            <DialogTitle>{currentVehicle ? "Voertuig Bewerken" : "Nieuw Voertuig Toevoegen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kenteken" className="text-right">
                Kenteken
              </Label>
              <Input
                id="kenteken"
                name="kenteken"
                defaultValue={currentVehicle?.kenteken || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="merk" className="text-right">
                Merk
              </Label>
              <Input id="merk" name="merk" defaultValue={currentVehicle?.merk || ""} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Model
              </Label>
              <Input
                id="model"
                name="model"
                defaultValue={currentVehicle?.model || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bouwjaar" className="text-right">
                Bouwjaar
              </Label>
              <Input
                id="bouwjaar"
                name="bouwjaar"
                type="number"
                defaultValue={currentVehicle?.bouwjaar || new Date().getFullYear()}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select name="type" defaultValue={currentVehicle?.type || "Auto"} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto">Auto</SelectItem>
                  <SelectItem value="Motor">Motor</SelectItem>
                  <SelectItem value="Vrachtwagen">Vrachtwagen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transmissie" className="text-right">
                Transmissie
              </Label>
              <Select name="transmissie" defaultValue={currentVehicle?.transmissie || "Handgeschakeld"} required>
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
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select name="status" defaultValue={currentVehicle?.status || "Beschikbaar"} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beschikbaar">Beschikbaar</SelectItem>
                  <SelectItem value="In Onderhoud">In Onderhoud</SelectItem>
                  <SelectItem value="Uit Dienst">Uit Dienst</SelectItem>
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
