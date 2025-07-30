"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Download, Mail, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

interface InvoiceItem {
  id: string
  description: string
  date: string
  time?: string
  duration: number
  unitPrice: number
  quantity: number
  discount: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  studentId: string
  studentName: string
  studentEmail: string
  studentAddress: string
  instructorId: string
  instructorName: string
  date: string
  dueDate: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  taxRate: number
  taxAmount: number
  total: number
  status: "concept" | "verzonden" | "betaald" | "vervallen"
  notes?: string
  createdAt: string
  updatedAt: string
}

const statusColors = {
  concept: "bg-gray-100 text-gray-800",
  verzonden: "bg-blue-100 text-blue-800",
  betaald: "bg-green-100 text-green-800",
  vervallen: "bg-red-100 text-red-800",
}

const statusLabels = {
  concept: "Concept",
  verzonden: "Verzonden",
  betaald: "Betaald",
  vervallen: "Vervallen",
}

// Mock data
const mockStudents = [
  { id: "1", name: "Emma van der Berg", email: "emma@example.com", address: "Hoofdstraat 123, 1234 AB Amsterdam" },
  { id: "2", name: "Tom Jansen", email: "tom@example.com", address: "Kerkstraat 45, 5678 CD Rotterdam" },
  { id: "3", name: "Sophie Willems", email: "sophie@example.com", address: "Dorpsstraat 67, 9012 EF Utrecht" },
]

const mockInstructors = [
  { id: "1", name: "Jan Bakker" },
  { id: "2", name: "Lisa de Vries" },
  { id: "3", name: "Mark Peters" },
]

const generateInvoiceNumber = () => {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${year}-${random}`
}

const calculateInvoiceTotals = (items: InvoiceItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  const discount = items.reduce((sum, item) => sum + item.discount, 0)
  const netAmount = subtotal - discount
  const taxAmount = netAmount * 0.21 // 21% BTW
  const total = netAmount + taxAmount
  
  return { subtotal, discount, taxAmount, total }
}

export default function FacturatiePage() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Mock data for students and instructors (replace with actual fetch later)
  const mockStudents = [
    { id: "1", name: "Emma van der Berg", email: "emma@example.com", address: "Straat 1, 1234 AB Stad" },
    { id: "2", name: "Lucas de Vries", email: "lucas@example.com", address: "Weg 2, 5678 CD Dorp" },
  ]
  const mockInstructors = [
    { id: "1", name: "Jan Jansen" },
    { id: "2", name: "Marie Bakker" },
  ]

  useEffect(() => {
    setInvoices(mockInvoices)
  }, [])

  const [newItem, setNewItem] = useState({
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "",
    duration: 60,
    unitPrice: 48,
    quantity: 1,
    discount: 0,
  })

  // Mock facturen laden
  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: "1",
        invoiceNumber: "2024-001",
        studentId: "1",
        studentName: "Emma van der Berg",
        studentEmail: "emma@example.com",
        studentAddress: "Hoofdstraat 123, 1234 AB Amsterdam",
        instructorId: "1",
        instructorName: "Jan Bakker",
        date: "2024-12-01",
        dueDate: "2024-12-31",
        items: [
          {
            id: "1",
            description: "Rijles - Automaat",
            date: "2024-11-15",
            time: "10:00",
            duration: 60,
            unitPrice: 48,
            quantity: 1,
            discount: 0,
            total: 48,
          }
        ],
        subtotal: 48,
        discount: 0,
        taxRate: 21,
        taxAmount: 10.08,
        total: 58.08,
        status: "verzonden",
        notes: "Eerste factuur",
        createdAt: "2024-12-01T10:00:00Z",
        updatedAt: "2024-12-01T10:00:00Z",
      },
      {
        id: "2",
        invoiceNumber: "2024-002",
        studentId: "2",
        studentName: "Tom Jansen",
        studentEmail: "tom@example.com",
        studentAddress: "Kerkstraat 45, 5678 CD Rotterdam",
        instructorId: "2",
        instructorName: "Lisa de Vries",
        date: "2024-12-05",
        dueDate: "2025-01-05",
        items: [
          {
            id: "2",
            description: "Rijles pakket - 5 lessen",
            date: "2024-11-20",
            time: "",
            duration: 300,
            unitPrice: 48,
            quantity: 5,
            discount: 24,
            total: 216,
          }
        ],
        subtotal: 240,
        discount: 24,
        taxRate: 21,
        taxAmount: 45.36,
        total: 261.36,
        status: "betaald",
        createdAt: "2024-12-05T14:00:00Z",
        updatedAt: "2024-12-10T09:00:00Z",
      }
    ]
    
    setInvoices(mockInvoices)
    setLoading(false)
  }, [])

  // Filter facturen
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Statistieken
  const stats = {
    total: invoices.length,
    concept: invoices.filter((i) => i.status === "concept").length,
    verzonden: invoices.filter((i) => i.status === "verzonden").length,
    betaald: invoices.filter((i) => i.status === "betaald").length,
    vervallen: invoices.filter((i) => i.status === "vervallen").length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
    paidAmount: invoices.filter((i) => i.status === "betaald").reduce((sum, i) => sum + i.total, 0),
  }

  const handleAddItem = () => {
    if (!newItem.description) {
      toast({
        title: "Validatiefout",
        description: "Beschrijving is verplicht",
        variant: "destructive",
      })
      return
    }

    const item: InvoiceItem = {
      id: Date.now().toString(),
      description: newItem.description,
      date: newItem.date,
      time: newItem.time,
      duration: newItem.duration,
      unitPrice: newItem.unitPrice,
      quantity: newItem.quantity,
      discount: newItem.discount,
      total: newItem.unitPrice * newItem.quantity - newItem.discount,
    }

    setNewInvoice((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }))

    // Reset form
    setNewItem({
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "",
      duration: 60,
      unitPrice: 48,
      quantity: 1,
      discount: 0,
    })

    toast({
      title: "Item toegevoegd",
      description: "Item is toegevoegd aan de factuur",
    })
  }

  const handleRemoveItem = (itemId: string) => {
    setNewInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }))
    toast({
      title: "Item verwijderd",
      description: "Item is verwijderd van de factuur",
    })
  }

  const handleCreateInvoice = () => {
    if (!newInvoice.studentId || !newInvoice.instructorId || newInvoice.items.length === 0) {
      toast({
        title: "Validatiefout",
        description: "Vul alle verplichte velden in en voeg minimaal één item toe",
        variant: "destructive",
      })
      return
    }

    const instructorId = formData.get("instructorId") as string
    const selectedInstructor = mockInstructors.find((i) => i.id === instructorId)

    if (!student || !instructor) {
      toast({
        title: "Fout",
        description: "Student of instructeur niet gevonden",
        variant: "destructive",
      })
      return
    }

    const { subtotal, discount, taxAmount, total } = calculateInvoiceTotals(
      invoiceItems,
      Number.parseFloat(formData.get("taxRate") as string),
    )

    const newInvoice: Invoice = {
      id: currentInvoice?.id || `inv-${Date.now()}`,
      invoiceNumber: currentInvoice?.invoiceNumber || generateInvoiceNumber(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentEmail: selectedStudent.email,
      studentAddress: selectedStudent.address,
      instructorId: selectedInstructor.id,
      instructorName: selectedInstructor.name,
      date: formData.get("date") as string,
      dueDate: formData.get("dueDate") as string,
      items: invoiceItems,
      subtotal,
      discount,
      taxRate: Number.parseFloat(formData.get("taxRate") as string),
      taxAmount,
      total,
      status: formData.get("status") as "concept" | "verzonden" | "betaald" | "vervallen",
      notes: formData.get("notes") as string,
      createdAt: currentInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setInvoices((prev) => [invoice, ...prev])
    setIsCreateDialogOpen(false)

    // Reset form
    setNewInvoice({
      studentId: "",
      instructorId: "",
      items: [],
      notes: "",
    })

    toast({
      title: "Factuur aangemaakt",
      description: `Factuur ${invoice.invoiceNumber} is succesvol aangemaakt`,
    })
  }

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      // Mock email verzending
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setInvoices((prev) =>
        prev.map((i) =>
          i.id === invoice.id ? { ...i, status: "verzonden" as const, updatedAt: new Date().toISOString() } : i,
        ),
      )

      toast({
        title: "Factuur verzonden",
        description: `Factuur ${invoice.invoiceNumber} is verzonden naar ${invoice.studentEmail}`,
      })
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verzenden van de factuur",
        variant: "destructive",
      })
    }
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsViewDialogOpen(true)
  }

  const handleStatusChange = (invoiceId: string, newStatus: Invoice["status"]) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status: newStatus, updatedAt: new Date().toISOString() } : i)),
    )
    toast({
      title: "Status bijgewerkt",
      description: "Factuur status is succesvol gewijzigd",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded mt-6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Facturatie
            </h1>
            <p className="text-gray-600">Beheer facturen en betalingen</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                {/* Basis informatie */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student">Leerling *</Label>
                    <Select
                      value={newInvoice.studentId}
                      onValueChange={(value) => setNewInvoice((prev) => ({ ...prev, studentId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer leerling" />
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

                  <div>
                    <Label htmlFor="instructor">Instructeur *</Label>
                    <Select
                      value={newInvoice.instructorId}
                      onValueChange={(value) => setNewInvoice((prev) => ({ ...prev, instructorId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer instructeur" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockInstructors.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Items toevoegen */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Items</h3>

                  {/* Nieuw item formulier */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Nieuw Item Toevoegen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="description">Beschrijving *</Label>
                          <Input
                            id="description"
                            value={newItem.description}
                            onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Bijv. Rijles - Automaat"
                          />
                        </div>
                        <div>
                          <Label htmlFor="date">Datum</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newItem.date}
                            onChange={(e) => setNewItem((prev) => ({ ...prev, date: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="time">Tijd</Label>
                          <Input
                            id="time"
                            type="time"
                            value={newItem.time}
                            onChange={(e) => setNewItem((prev) => ({ ...prev, time: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration">Duur (min)</Label>
                          <Input
                            id="duration"
                            type="number"
                            value={newItem.duration}
                            onChange={(e) =>
                              setNewItem((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) || 0 }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="unitPrice">Prijs per uur (€)</Label>
                          <Input
                            id="unitPrice"
                            type="number"
                            step="0.01"
                            value={newItem.unitPrice}
                            onChange={(e) =>
                              setNewItem((prev) => ({ ...prev, unitPrice: Number.parseFloat(e.target.value) || 0 }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="discount">Korting (€)</Label>
                          <Input
                            id="discount"
                            type="number"
                            step="0.01"
                            value={newItem.discount}
                            onChange={(e) =>
                              setNewItem((prev) => ({ ...prev, discount: Number.parseFloat(e.target.value) || 0 }))
                            }
                          />
                        </div>
                      </div>

                      <Button onClick={handleAddItem} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Item Toevoegen
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Items lijst */}
                  {newInvoice.items.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Toegevoegde Items</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {newInvoice.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{item.description}</div>
                                <div className="text-sm text-gray-600">
                                  {format(new Date(item.date), "dd MMM yyyy", { locale: nl })}
                                  {item.time && ` om ${item.time}`} • {item.duration} min • €{item.unitPrice}/uur
                                  {item.discount > 0 && ` • Korting: €${item.discount}`}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">€{item.total.toFixed(2)}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Totalen */}
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          {(() => {
                            const totals = calculateInvoiceTotals(newInvoice.items)
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span>Subtotaal:</span>
                                  <span>€{totals.subtotal.toFixed(2)}</span>
                                </div>
                                {totals.discount > 0 && (
                                  <div className="flex justify-between text-red-600">
                                    <span>Korting:</span>
                                    <span>-€{totals.discount.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span>BTW (21%):</span>
                                  <span>€{totals.taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg">
                                  <span>Totaal:</span>
                                  <span>€{totals.total.toFixed(2)}</span>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Notities */}
                <div>
                  <Label htmlFor="notes">Notities</Label>
                  <Textarea
                    id="notes"
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optionele notities voor de factuur"
                    rows={3}
                  />
                </div>

                {/* Acties */}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuleren
                  </Button>
                  <Button onClick={handleCreateInvoice}>Factuur Aanmaken</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistieken */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Totaal Facturen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Openstaand</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.verzonden}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Betaald</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.betaald}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Totaal Omzet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">€{stats.paidAmount.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Zoek op naam of factuurnummer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  <SelectItem value="concept">Concept</SelectItem>
                  <SelectItem value="verzonden">Verzonden</SelectItem>
                  <SelectItem value="betaald">Betaald</SelectItem>
                  <SelectItem value="vervallen">Vervallen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Facturen lijst */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle>Facturen</CardTitle>
            <CardDescription>
              {filteredInvoices.length} van {invoices.length} facturen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-white/20"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-semibold text-gray-900">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-600">{invoice.studentName}</div>
                      </div>
                      <Badge className={statusColors[invoice.status]}>{statusLabels[invoice.status]}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {format(new Date(invoice.date), "dd MMM yyyy", { locale: nl })} • Vervaldatum:{" "}
                      {format(new Date(invoice.dueDate), "dd MMM yyyy", { locale: nl })} • €{invoice.total.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)}>
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>

                    {invoice.status === "concept" && (
                      <Button variant="ghost" size="sm" onClick={() => handleSendInvoice(invoice)}>
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}

                    <Select
                      value={invoice.status}
                      onValueChange={(value: Invoice["status"]) => handleStatusChange(invoice.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concept">Concept</SelectItem>
                        <SelectItem value="verzonden">Verzonden</SelectItem>
                        <SelectItem value="betaald">Betaald</SelectItem>
                        <SelectItem value="vervallen">Vervallen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}

              {filteredInvoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">Geen facturen gevonden</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Factuur detail dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedInvoice && (
              <>
                <DialogHeader>
                  <DialogTitle>Factuur {selectedInvoice.invoiceNumber}</DialogTitle>
                  <DialogDescription>Factuur details voor {selectedInvoice.studentName}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Factuur header */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Factuurgegevens</h3>
                      <div className="space-y-1 text-sm">
                        <div>Factuurnummer: {selectedInvoice.invoiceNumber}</div>
                        <div>Datum: {format(new Date(selectedInvoice.date), "dd MMM yyyy", { locale: nl })}</div>
                        <div>
                          Vervaldatum: {format(new Date(selectedInvoice.dueDate), "dd MMM yyyy", { locale: nl })}
                        </div>
                        <div>
                          Status:{" "}
                          <Badge className={statusColors[selectedInvoice.status]}>
                            {statusLabels[selectedInvoice.status]}
                          </Badge>
                        </div>
                      </div>
                    </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="taxRate">BTW Tarief (%)</Label>
                <Input
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  defaultValue={currentInvoice?.taxRate || 21}
                  onChange={(e) => {
                    const newTaxRate = Number.parseFloat(e.target.value)
                    const { subtotal, discount, taxAmount, total } = calculateInvoiceTotals(invoiceItems, newTaxRate)
                    setCurrentInvoice((prev) =>
                      prev ? { ...prev, subtotal, discount, taxAmount, total, taxRate: newTaxRate } : null,
                    )
                  }}
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label>Subtotaal</Label>
                <Input
                  value={`€${calculateInvoiceTotals(invoiceItems, currentInvoice?.taxRate || 21).subtotal.toFixed(2)}`}
                  readOnly
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Korting Totaal</Label>
                <Input
                  value={`€${calculateInvoiceTotals(invoiceItems, currentInvoice?.taxRate || 21).discount.toFixed(2)}`}
                  readOnly
                  className="mt-1"
                />
              </div>
              <div>
                <Label>BTW Bedrag</Label>
                <Input
                  value={`€${calculateInvoiceTotals(invoiceItems, currentInvoice?.taxRate || 21).taxAmount.toFixed(2)}`}
                  readOnly
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Totaalbedrag</Label>
                <Input
                  value={`€${calculateInvoiceTotals(invoiceItems, currentInvoice?.taxRate || 21).total.toFixed(2)}`}
                  readOnly
                  className="mt-1 font-bold text-lg"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="notes">Opmerkingen</Label>
              <Textarea id="notes" name="notes" defaultValue={currentInvoice?.notes || ""} className="mt-1" rows={3} />
            </div>

                  {/* Notities */}
                  {selectedInvoice.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Notities</h3>
                      <p className="text-sm text-gray-600">{selectedInvoice.notes}</p>
                    </div>
                  )}

                  {/* Acties */}
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>

                    {selectedInvoice.status === "concept" && (
                      <Button onClick={() => handleSendInvoice(selectedInvoice)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Verzenden
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}