"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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

export default function Leerlingen() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
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
      setIsDialogOpen(false)
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
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Leerlingen
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe Leerling
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nieuwe Leerling Toevoegen</DialogTitle>
              <DialogDescription>Voer de gegevens van de nieuwe leerling in.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="naam">Volledige Naam *</Label>
                  <Input
                    id="naam"
                    placeholder="Voor- en achternaam"
                    value={newLeerling.naam}
                    onChange={(e) => setNewLeerling({ ...newLeerling, naam: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="geboortedatum">Geboortedatum</Label>
                  <Input
                    id="geboortedatum"
                    type="date"
                    value={newLeerling.geboortedatum}
                    onChange={(e) => setNewLeerling({ ...newLeerling, geboortedatum: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="naam@email.com"
                    value={newLeerling.email}
                    onChange={(e) => setNewLeerling({ ...newLeerling, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="telefoon">Telefoon *</Label>
                  <Input
                    id="telefoon"
                    placeholder="06-12345678"
                    value={newLeerling.telefoon}
                    onChange={(e) => setNewLeerling({ ...newLeerling, telefoon: e.target.value })}
                  />
                </div>
              </div>

              {/* Adres sectie */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Adresgegevens</Label>
                  <Dialog open={isAdresDialogOpen} onOpenChange={setIsAdresDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        Zoek adres
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adres zoeken</DialogTitle>
                        <DialogDescription>Zoek en selecteer het juiste adres</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input placeholder="Typ adres, postcode of plaats..." />
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {adresSuggesties.map((adres, index) => (
                            <div
                              key={index}
                              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                              onClick={() => selectAdres(adres)}
                            >
                              <div className="font-medium">{adres.adres}</div>
                              <div className="text-sm text-gray-600">
                                {adres.postcode} {adres.plaats}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div>
                  <Label htmlFor="adres">Straat en huisnummer</Label>
                  <Input
                    id="adres"
                    placeholder="Hoofdstraat 123"
                    value={newLeerling.adres}
                    onChange={(e) => setNewLeerling({ ...newLeerling, adres: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postcode">Postcode</Label>
                    <Input
                      id="postcode"
                      placeholder="1234 AB"
                      value={newLeerling.postcode}
                      onChange={(e) => setNewLeerling({ ...newLeerling, postcode: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="plaats">Plaats</Label>
                    <Input
                      id="plaats"
                      placeholder="Amsterdam"
                      value={newLeerling.plaats}
                      onChange={(e) => setNewLeerling({ ...newLeerling, plaats: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transmissie">Transmissie</Label>
                  <Select
                    value={newLeerling.transmissie}
                    onValueChange={(value) => setNewLeerling({ ...newLeerling, transmissie: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer transmissie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automaat">Automaat</SelectItem>
                      <SelectItem value="Schakel">Schakel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="instructeur">Instructeur</Label>
                  <Select
                    value={newLeerling.instructeur}
                    onValueChange={(value) => setNewLeerling({ ...newLeerling, instructeur: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer instructeur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Jan Bakker">Jan Bakker</SelectItem>
                      <SelectItem value="Lisa de Vries">Lisa de Vries</SelectItem>
                      <SelectItem value="Mark Peters">Mark Peters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="opmerkingen">Opmerkingen</Label>
                <Textarea
                  id="opmerkingen"
                  placeholder="Extra informatie over de leerling..."
                  value={newLeerling.opmerkingen}
                  onChange={(e) => setNewLeerling({ ...newLeerling, opmerkingen: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuleren
              </Button>
              <Button onClick={addLeerling} className="bg-gradient-to-r from-blue-500 to-purple-500">
                Leerling Toevoegen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-hover glass-effect">
        <CardHeader>
          <CardTitle>Leerlingen Overzicht</CardTitle>
          <CardDescription>Beheer alle leerlingen en hun contractgegevens</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek leerlingen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-white/50"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Adres</TableHead>
                <TableHead>Transmissie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lessen</TableHead>
                <TableHead>Tegoed</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeerlingen.map((leerling) => (
                <TableRow key={leerling.id}>
                  <TableCell className="font-medium">{leerling.naam}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-sm">{leerling.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span className="text-sm">{leerling.telefoon}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start space-x-1">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      <div className="text-sm">
                        <div>{leerling.adres}</div>
                        <div className="text-gray-500">
                          {leerling.postcode} {leerling.plaats}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={leerling.transmissie === "Automaat" ? "default" : "secondary"}>
                      {leerling.transmissie}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(leerling.status)}>{leerling.status}</Badge>
                  </TableCell>
                  <TableCell>{leerling.lessen}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Euro className="h-3 w-3" />
                      <span className={leerling.tegoed > 0 ? "text-green-600 font-medium" : "text-gray-500"}>
                        {leerling.tegoed.toFixed(2)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Link href={`/leerlingen/${leerling.id}`}>
                        <Button variant="ghost" size="sm" title="Bekijk profiel">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" title="Bewerken">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Verwijderen" onClick={() => deleteLeerling(leerling.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}