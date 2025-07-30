"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Download, Mail, Eye, Trash2, Edit, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface Invoice {
  id: number
  invoiceNumber: string
  studentName: string
  studentEmail: string
  amount: number
  date: string
  dueDate: string
  status: "draft" | "sent" | "paid" | "overdue"
  description: string
}

export default function FacturatiePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [newInvoice, setNewInvoice] = useState({
    studentName: "",
    studentEmail: "",
    amount: 0,
    description: "",
    dueDate: "",
  })

  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: 1,
        invoiceNumber: "INV-2024-001",
        studentName: "Emma van der Berg",
        studentEmail: "emma@example.com",
        amount: 250.00,
        date: "2024-12-15",
        dueDate: "2024-12-30",
        status: "sent",
        description: "Rijlessen December 2024"
      },
      {
        id: 2,
        invoiceNumber: "INV-2024-002",
        studentName: "Tom Jansen",
        studentEmail: "tom@example.com",
        amount: 180.00,
        date: "2024-12-10",
        dueDate: "2024-12-25",
        status: "paid",
        description: "Rijlessen November 2024"
      },
      {
        id: 3,
        invoiceNumber: "INV-2024-003",
        studentName: "Lisa de Vries",
        studentEmail: "lisa@example.com",
        amount: 320.00,
        date: "2024-12-01",
        dueDate: "2024-12-16",
        status: "overdue",
        description: "Rijlessen + Examen"
      }
    ]
    
    setInvoices(mockInvoices)
    setLoading(false)
  }, [])

  const handleCreateInvoice = () => {
    if (!newInvoice.studentName || !newInvoice.studentEmail || newInvoice.amount <= 0) {
      toast.error("Validatiefout", {
        description: "Vul alle verplichte velden correct in",
      })
      return
    }

    const invoice: Invoice = {
      id: invoices.length + 1,
      invoiceNumber: `INV-2024-${String(invoices.length + 4).padStart(3, '0')}`,
      studentName: newInvoice.studentName,
      studentEmail: newInvoice.studentEmail,
      amount: newInvoice.amount,
      date: new Date().toISOString().split('T')[0],
      dueDate: newInvoice.dueDate,
      status: "draft",
      description: newInvoice.description
    }

    setInvoices([...invoices, invoice])
    setNewInvoice({
      studentName: "",
      studentEmail: "",
      amount: 0,
      description: "",
      dueDate: "",
    })
    setIsCreateDialogOpen(false)

    toast.success("Factuur aangemaakt", {
      description: `Factuur ${invoice.invoiceNumber} is succesvol aangemaakt`,
    })
  }

  const handleDeleteInvoice = (id: number) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id))
    toast.success("Factuur verwijderd", {
      description: "De factuur is succesvol verwijderd",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800"
      case "sent": return "bg-blue-100 text-blue-800"
      case "draft": return "bg-gray-100 text-gray-800"
      case "overdue": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid": return "Betaald"
      case "sent": return "Verzonden"
      case "draft": return "Concept"
      case "overdue": return "Verlopen"
      default: return status
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const paidAmount = invoices.filter(inv => inv.status === "paid").reduce((sum, invoice) => sum + invoice.amount, 0)
  const overdueAmount = invoices.filter(inv => inv.status === "overdue").reduce((sum, invoice) => sum + invoice.amount, 0)

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded mt-6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Facturatie
        </h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe Factuur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nieuwe Factuur Aanmaken</DialogTitle>
              <DialogDescription>Maak een nieuwe factuur aan voor een leerling.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="studentName" className="text-right">
                  Student
                </Label>
                <Input
                  id="studentName"
                  value={newInvoice.studentName}
                  onChange={(e) => setNewInvoice({...newInvoice, studentName: e.target.value})}
                  className="col-span-3"
                  placeholder="Naam van de student"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="studentEmail" className="text-right">
                  Email
                </Label>
                <Input
                  id="studentEmail"
                  type="email"
                  value={newInvoice.studentEmail}
                  onChange={(e) => setNewInvoice({...newInvoice, studentEmail: e.target.value})}
                  className="col-span-3"
                  placeholder="student@example.com"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Bedrag
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({...newInvoice, amount: parseFloat(e.target.value) || 0})}
                  className="col-span-3"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  Vervaldatum
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Beschrijving
                </Label>
                <Textarea
                  id="description"
                  value={newInvoice.description}
                  onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                  placeholder="Beschrijving van de diensten"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleCreateInvoice}>
                Factuur Aanmaken
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Facturen</CardTitle>
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">Alle facturen</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Bedrag</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Alle facturen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Betaald</CardTitle>
            <Download className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{paidAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ontvangen betalingen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verlopen</CardTitle>
            <Download className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{overdueAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Verlopen facturen</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Facturen</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek facturen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="draft">Concept</SelectItem>
                <SelectItem value="sent">Verzonden</SelectItem>
                <SelectItem value="paid">Betaald</SelectItem>
                <SelectItem value="overdue">Verlopen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Geen facturen gevonden</div>
            ) : (
              filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                      <p className="text-sm text-gray-500">{invoice.studentName}</p>
                      <p className="text-xs text-gray-400">{invoice.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-medium">€{invoice.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{invoice.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteInvoice(invoice.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}