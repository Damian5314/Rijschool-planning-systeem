"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { Plus, Search, Download, Mail, Eye, Trash2, CalendarIcon, Receipt, Euro, Send } from "lucide-react"
import { facturenData, leerlingenData, rijschoolSettings, type Factuur, type FactuurItem } from "@/lib/data"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function FacturatiePage() {
  const [facturen, setFacturen] = useState<Factuur[]>(facturenData)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("alle")
  const [selectedFactuur, setSelectedFactuur] = useState<Factuur | null>(null)
  const [isNewFactuurOpen, setIsNewFactuurOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)

  // Nieuwe factuur state
  const [newFactuur, setNewFactuur] = useState({
    leerlingId: "",
    datum: new Date(),
    vervaldatum: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dagen later
    items: [] as FactuurItem[],
    opmerkingen: "",
  })

  const [newItem, setNewItem] = useState({
    beschrijving: "",
    datum: new Date(),
    tijd: "",
    duur: 60,
    prijsPerUur: 48,
    korting: 0,
  })

  const filteredFacturen = facturen.filter((factuur) => {
    const matchesSearch =
      factuur.leerlingNaam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factuur.factuurNummer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "alle" || factuur.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concept":
        return "bg-gray-100 text-gray-800"
      case "verzonden":
        return "bg-blue-100 text-blue-800"
      case "betaald":
        return "bg-green-100 text-green-800"
      case "vervallen":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "concept":
        return "Concept"
      case "verzonden":
        return "Verzonden"
      case "betaald":
        return "Betaald"
      case "vervallen":
        return "Vervallen"
      default:
        return status
    }
  }

  const addItemToFactuur = () => {
    if (!newItem.beschrijving || !newItem.tijd) {
      toast({
        title: "Velden ontbreken",
        description: "Vul alle verplichte velden in.",
        variant: "destructive",
      })
      return
    }

    const totaal = (newItem.duur / 60) * newItem.prijsPerUur - newItem.korting
    const item: FactuurItem = {
      id: Date.now(),
      ...newItem,
      datum: format(newItem.datum, "yyyy-MM-dd"),
      totaal,
    }

    setNewFactuur((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }))

    // Reset form
    setNewItem({
      beschrijving: "",
      datum: new Date(),
      tijd: "",
      duur: 60,
      prijsPerUur: 48,
      korting: 0,
    })

    toast({
      title: "Item toegevoegd",
      description: "Het item is toegevoegd aan de factuur.",
    })
  }

  const removeItemFromFactuur = (itemId: number) => {
    setNewFactuur((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }))
  }

  const calculateTotals = (items: FactuurItem[]) => {
    const subtotaal = items.reduce((sum, item) => sum + item.totaal, 0)
    const btw = subtotaal * 0.21 // 21% BTW
    const totaal = subtotaal + btw
    return { subtotaal, btw, totaal }
  }

  const createFactuur = () => {
    if (!newFactuur.leerlingId || newFactuur.items.length === 0) {
      toast({
        title: "Factuur onvolledig",
        description: "Selecteer een leerling en voeg minimaal één item toe.",
        variant: "destructive",
      })
      return
    }

    const leerling = leerlingenData.find((l) => l.id === Number.parseInt(newFactuur.leerlingId))
    if (!leerling) return

    const { subtotaal, btw, totaal } = calculateTotals(newFactuur.items)
    const factuurNummer = `WR-${new Date().getFullYear()}-${String(facturen.length + 1).padStart(3, "0")}`

    const factuur: Factuur = {
      id: Date.now(),
      factuurNummer,
      datum: format(newFactuur.datum, "yyyy-MM-dd"),
      vervaldatum: format(newFactuur.vervaldatum, "yyyy-MM-dd"),
      leerlingId: leerling.id,
      leerlingNaam: leerling.naam,
      leerlingEmail: leerling.email,
      leerlingAdres: `${leerling.adres}, ${leerling.postcode} ${leerling.plaats}`,
      instructeur: leerling.instructeur,
      items: newFactuur.items,
      subtotaal,
      btw,
      totaal,
      status: "concept",
      opmerkingen: newFactuur.opmerkingen,
    }

    setFacturen((prev) => [factuur, ...prev])
    setIsNewFactuurOpen(false)

    // Reset form
    setNewFactuur({
      leerlingId: "",
      datum: new Date(),
      vervaldatum: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [],
      opmerkingen: "",
    })

    toast({
      title: "Factuur aangemaakt",
      description: `Factuur ${factuurNummer} is succesvol aangemaakt.`,
    })
  }

  const downloadPDF = (factuur: Factuur) => {
    toast({
      title: "PDF wordt gegenereerd",
      description: "De factuur wordt als PDF gedownload...",
    })
    // Hier zou de PDF generatie komen
  }

  const sendEmail = (factuur: Factuur) => {
    toast({
      title: "Email wordt verzonden",
      description: `Factuur wordt verzonden naar ${factuur.leerlingEmail}`,
    })

    // Update status naar verzonden
    setFacturen((prev) => prev.map((f) => (f.id === factuur.id ? { ...f, status: "verzonden" as const } : f)))
  }

  const viewFactuur = (factuur: Factuur) => {
    setSelectedFactuur(factuur)
    setIsViewOpen(true)
  }

  const deleteFactuur = (factuurId: number) => {
    setFacturen((prev) => prev.filter((f) => f.id !== factuurId))
    toast({
      title: "Factuur verwijderd",
      description: "De factuur is succesvol verwijderd.",
    })
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturatie</h1>
          <p className="text-muted-foreground">Beheer facturen en betalingen</p>
        </div>
        <Dialog open={isNewFactuurOpen} onOpenChange={setIsNewFactuurOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Factuur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nieuwe Factuur Aanmaken</DialogTitle>
              <DialogDescription>Maak een nieuwe factuur aan voor een leerling</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Leerling selectie */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leerling">Leerling</Label>
                  <Select
                    value={newFactuur.leerlingId}
                    onValueChange={(value) => setNewFactuur((prev) => ({ ...prev, leerlingId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer leerling" />
                    </SelectTrigger>
                    <SelectContent>
                      {leerlingenData.map((leerling) => (
                        <SelectItem key={leerling.id} value={leerling.id.toString()}>
                          {leerling.naam}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vervaldatum">Vervaldatum</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newFactuur.vervaldatum && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newFactuur.vervaldatum
                          ? format(newFactuur.vervaldatum, "PPP", { locale: nl })
                          : "Selecteer datum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newFactuur.vervaldatum}
                        onSelect={(date) => date && setNewFactuur((prev) => ({ ...prev, vervaldatum: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Item toevoegen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Item Toevoegen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="beschrijving">Beschrijving</Label>
                      <Input
                        id="beschrijving"
                        value={newItem.beschrijving}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, beschrijving: e.target.value }))}
                        placeholder="Bijv. Rijles #1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tijd">Tijd</Label>
                      <Input
                        id="tijd"
                        type="time"
                        value={newItem.tijd}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, tijd: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="datum">Datum</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !newItem.datum && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(newItem.datum, "dd/MM", { locale: nl })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newItem.datum}
                            onSelect={(date) => date && setNewItem((prev) => ({ ...prev, datum: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duur">Duur (min)</Label>
                      <Input
                        id="duur"
                        type="number"
                        value={newItem.duur}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, duur: Number.parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prijsPerUur">Prijs/uur (€)</Label>
                      <Input
                        id="prijsPerUur"
                        type="number"
                        step="0.01"
                        value={newItem.prijsPerUur}
                        onChange={(e) =>
                          setNewItem((prev) => ({ ...prev, prijsPerUur: Number.parseFloat(e.target.value) }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="korting">Korting (€)</Label>
                      <Input
                        id="korting"
                        type="number"
                        step="0.01"
                        value={newItem.korting}
                        onChange={(e) =>
                          setNewItem((prev) => ({ ...prev, korting: Number.parseFloat(e.target.value) }))
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={addItemToFactuur} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Item Toevoegen
                  </Button>
                </CardContent>
              </Card>

              {/* Items overzicht */}
              {newFactuur.items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Factuur Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Beschrijving</TableHead>
                          <TableHead>Datum</TableHead>
                          <TableHead>Tijd</TableHead>
                          <TableHead>Duur</TableHead>
                          <TableHead>Prijs</TableHead>
                          <TableHead>Korting</TableHead>
                          <TableHead>Totaal</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newFactuur.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.beschrijving}</TableCell>
                            <TableCell>{format(new Date(item.datum), "dd/MM/yyyy", { locale: nl })}</TableCell>
                            <TableCell>{item.tijd}</TableCell>
                            <TableCell>{item.duur} min</TableCell>
                            <TableCell>€ {item.prijsPerUur}</TableCell>
                            <TableCell>€ {item.korting}</TableCell>
                            <TableCell>€ {item.totaal.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => removeItemFromFactuur(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Totalen */}
                    <div className="mt-4 space-y-2 text-right">
                      <div className="flex justify-end space-x-4">
                        <span>Subtotaal:</span>
                        <span>€ {calculateTotals(newFactuur.items).subtotaal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-end space-x-4">
                        <span>BTW (21%):</span>
                        <span>€ {calculateTotals(newFactuur.items).btw.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-end space-x-4 font-bold text-lg">
                        <span>Totaal:</span>
                        <span>€ {calculateTotals(newFactuur.items).totaal.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Opmerkingen */}
              <div className="space-y-2">
                <Label htmlFor="opmerkingen">Opmerkingen</Label>
                <Textarea
                  id="opmerkingen"
                  value={newFactuur.opmerkingen}
                  onChange={(e) => setNewFactuur((prev) => ({ ...prev, opmerkingen: e.target.value }))}
                  placeholder="Eventuele opmerkingen..."
                />
              </div>

              {/* Acties */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsNewFactuurOpen(false)}>
                  Annuleren
                </Button>
                <Button onClick={createFactuur}>Factuur Aanmaken</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Facturen</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facturen.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Openstaand</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{" "}
              {facturen
                .filter((f) => f.status === "verzonden")
                .reduce((sum, f) => sum + f.totaal, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Betaald</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              €{" "}
              {facturen
                .filter((f) => f.status === "betaald")
                .reduce((sum, f) => sum + f.totaal, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vervallen</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              €{" "}
              {facturen
                .filter((f) => f.status === "vervallen")
                .reduce((sum, f) => sum + f.totaal, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Facturen Overzicht</CardTitle>
          <CardDescription>Beheer alle facturen en betalingen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek op leerling of factuurnummer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle statussen</SelectItem>
                <SelectItem value="concept">Concept</SelectItem>
                <SelectItem value="verzonden">Verzonden</SelectItem>
                <SelectItem value="betaald">Betaald</SelectItem>
                <SelectItem value="vervallen">Vervallen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Facturen tabel */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factuurnummer</TableHead>
                <TableHead>Leerling</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Vervaldatum</TableHead>
                <TableHead>Bedrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFacturen.map((factuur) => (
                <TableRow key={factuur.id}>
                  <TableCell className="font-medium">{factuur.factuurNummer}</TableCell>
                  <TableCell>{factuur.leerlingNaam}</TableCell>
                  <TableCell>{format(new Date(factuur.datum), "dd/MM/yyyy", { locale: nl })}</TableCell>
                  <TableCell>{format(new Date(factuur.vervaldatum), "dd/MM/yyyy", { locale: nl })}</TableCell>
                  <TableCell>€ {factuur.totaal.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(factuur.status)}>{getStatusText(factuur.status)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => viewFactuur(factuur)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => downloadPDF(factuur)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {factuur.status === "concept" && (
                        <Button variant="ghost" size="sm" onClick={() => sendEmail(factuur)}>
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => deleteFactuur(factuur.id)}>
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

      {/* Factuur bekijken dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Factuur {selectedFactuur?.factuurNummer}</DialogTitle>
            <DialogDescription>Factuur details en preview</DialogDescription>
          </DialogHeader>

          {selectedFactuur && (
            <div className="space-y-6">
              {/* Factuur header */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{rijschoolSettings.rijschoolNaam}</h3>
                  <p className="text-sm text-muted-foreground">
                    {rijschoolSettings.plaats}
                    <br />
                    {rijschoolSettings.telefoon}
                    <br />
                    {rijschoolSettings.email}
                    <br />
                    KvK: {rijschoolSettings.kvkNummer}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold text-lg mb-2">Factuur aan:</h3>
                  <p className="text-sm">
                    {selectedFactuur.leerlingNaam}
                    <br />
                    {selectedFactuur.leerlingAdres}
                    <br />
                    {selectedFactuur.leerlingEmail}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Factuur details */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Factuurnummer:</span>
                  <br />
                  {selectedFactuur.factuurNummer}
                </div>
                <div>
                  <span className="font-medium">Factuurdatum:</span>
                  <br />
                  {format(new Date(selectedFactuur.datum), "dd MMMM yyyy", { locale: nl })}
                </div>
                <div>
                  <span className="font-medium">Vervaldatum:</span>
                  <br />
                  {format(new Date(selectedFactuur.vervaldatum), "dd MMMM yyyy", { locale: nl })}
                </div>
              </div>

              <Separator />

              {/* Items */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beschrijving</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Tijd</TableHead>
                    <TableHead>Duur</TableHead>
                    <TableHead>Prijs/uur</TableHead>
                    <TableHead>Korting</TableHead>
                    <TableHead className="text-right">Totaal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedFactuur.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.beschrijving}</TableCell>
                      <TableCell>{format(new Date(item.datum), "dd/MM/yyyy", { locale: nl })}</TableCell>
                      <TableCell>{item.tijd}</TableCell>
                      <TableCell>{item.duur} min</TableCell>
                      <TableCell>€ {item.prijsPerUur}</TableCell>
                      <TableCell>€ {item.korting}</TableCell>
                      <TableCell className="text-right">€ {item.totaal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totalen */}
              <div className="space-y-2 text-right">
                <div className="flex justify-end space-x-4">
                  <span>Subtotaal:</span>
                  <span>€ {selectedFactuur.subtotaal.toFixed(2)}</span>
                </div>
                <div className="flex justify-end space-x-4">
                  <span>BTW (21%):</span>
                  <span>€ {selectedFactuur.btw.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-end space-x-4 font-bold text-lg">
                  <span>Totaal:</span>
                  <span>€ {selectedFactuur.totaal.toFixed(2)}</span>
                </div>
              </div>

              {selectedFactuur.opmerkingen && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Opmerkingen:</h4>
                    <p className="text-sm text-muted-foreground">{selectedFactuur.opmerkingen}</p>
                  </div>
                </>
              )}

              {/* Acties */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => downloadPDF(selectedFactuur)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {selectedFactuur.status === "concept" && (
                  <Button onClick={() => sendEmail(selectedFactuur)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Verstuur Email
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
