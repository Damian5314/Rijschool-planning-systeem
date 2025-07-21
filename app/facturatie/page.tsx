"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { PlusCircle, Edit, Trash2, Search, Mail, X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PDFDownloadLink } from "@react-pdf/renderer"
import InvoicePDF from "@/components/pdf-generator"
import { useToast } from "@/components/ui/use-toast"
import { rijschoolSettings } from "@/lib/data" // Import rijschoolSettings

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  btwPercentage: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  studentId: string
  studentName: string
  invoiceDate: string
  dueDate: string
  items: InvoiceItem[]
  discountPercentage: number
  status: "Open" | "Betaald" | "Verlopen" | "Verzonden"
  emailSent: boolean
}

interface Student {
  _id: string
  naam: string
  email: string
}

interface Instructor {
  _id: string
  naam: string
}

const calculateSubtotal = (items: InvoiceItem[]) => {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

const calculateBTW = (items: InvoiceItem[]) => {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.btwPercentage / 100), 0)
}

const calculateTotal = (items: InvoiceItem[], discountPercentage: number) => {
  const subtotal = calculateSubtotal(items)
  const btw = calculateBTW(items)
  const totalBeforeDiscount = subtotal + btw
  return totalBeforeDiscount * (1 - discountPercentage / 100)
}

const generateInvoiceNumber = (invoices: Invoice[]) => {
  const currentYear = new Date().getFullYear()
  const lastInvoice = invoices
    .filter((inv) => inv.invoiceNumber.startsWith(`${currentYear}`))
    .sort((a, b) => {
      const numA = Number.parseInt(a.invoiceNumber.split("-")[1])
      const numB = Number.parseInt(b.invoiceNumber.split("-")[1])
      return numA - numB
    })
    .pop()

  let nextNumber = 1
  if (lastInvoice) {
    nextNumber = Number.parseInt(lastInvoice.invoiceNumber.split("-")[1]) + 1
  }
  return `${currentYear}-${String(nextNumber).padStart(4, "0")}`
}

const calculateDueDate = (invoiceDate: string, days = 14) => {
  const date = new Date(invoiceDate)
  date.setDate(date.getDate() + days)
  return date.toISOString().split("T")[0]
}

export default function FacturatiePage() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("Alles")
  const [students, setStudents] = useState<Student[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [discountPercentage, setDiscountPercentage] = useState<number>(0)

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

  useEffect(() => {
    fetchStudents()
    fetchInstructors()
  }, [fetchStudents, fetchInstructors])

  useEffect(() => {
    // Initialize mock invoices if empty, or load from local storage
    const storedInvoices = localStorage.getItem("invoices")
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices))
    } else {
      // Generate initial mock invoices with dynamic numbers and due dates
      const initialMockInvoices: Invoice[] = [
        {
          id: "inv-1",
          invoiceNumber: generateInvoiceNumber([]),
          studentId: students[0]?._id || "mock-student-1",
          studentName: students[0]?.naam || "Jan de Boer",
          invoiceDate: "2024-07-01",
          dueDate: calculateDueDate("2024-07-01"),
          items: [
            { id: "item-1", description: "Rijles pakket 10 uur", quantity: 1, unitPrice: 500, btwPercentage: 21 },
            { id: "item-2", description: "Theorieboek", quantity: 1, unitPrice: 30, btwPercentage: 9 },
          ],
          discountPercentage: 0,
          status: "Open",
          emailSent: false,
        },
        {
          id: "inv-2",
          invoiceNumber: generateInvoiceNumber([{ invoiceNumber: `${new Date().getFullYear()}-0001` }]),
          studentId: students[1]?._id || "mock-student-2",
          studentName: students[1]?.naam || "Anna Bakker",
          invoiceDate: "2024-06-15",
          dueDate: calculateDueDate("2024-06-15"),
          items: [{ id: "item-3", description: "Losse rijles", quantity: 5, unitPrice: 55, btwPercentage: 21 }],
          discountPercentage: 10,
          status: "Betaald",
          emailSent: true,
        },
      ]
      setInvoices(initialMockInvoices)
    }
  }, [students]) // Depend on students to ensure they are loaded for initial mock data

  useEffect(() => {
    localStorage.setItem("invoices", JSON.stringify(invoices))
  }, [invoices])

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "Alles" || invoice.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleAddInvoice = () => {
    setCurrentInvoice(null)
    setInvoiceItems([{ id: "new-item-1", description: "", quantity: 1, unitPrice: 0, btwPercentage: 21 }])
    setDiscountPercentage(0)
    setSelectedStudentId("")
    setIsDialogOpen(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice)
    setInvoiceItems(invoice.items)
    setDiscountPercentage(invoice.discountPercentage)
    setSelectedStudentId(invoice.studentId)
    setIsDialogOpen(true)
  }

  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter((invoice) => invoice.id !== id))
    toast({
      title: "Factuur Verwijderd",
      description: `Factuur ${id} is succesvol verwijderd.`,
    })
  }

  const handleAddItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { id: `new-item-${invoiceItems.length + 1}`, description: "", quantity: 1, unitPrice: 0, btwPercentage: 21 },
    ])
  }

  const handleRemoveItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== id))
  }

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(invoiceItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const student = students.find((s) => s._id === selectedStudentId)
    if (!student) {
      toast({
        title: "Fout",
        description: "Selecteer een geldige leerling.",
        variant: "destructive",
      })
      return
    }

    const invoiceDate = formData.get("invoiceDate") as string
    const newInvoice: Invoice = {
      id: currentInvoice?.id || `inv-${Date.now()}`,
      invoiceNumber: currentInvoice?.invoiceNumber || generateInvoiceNumber(invoices),
      studentId: student._id,
      studentName: student.naam,
      invoiceDate: invoiceDate,
      dueDate: calculateDueDate(invoiceDate),
      items: invoiceItems,
      discountPercentage: discountPercentage,
      status: (formData.get("status") as "Open" | "Betaald" | "Verlopen" | "Verzonden") || "Open",
      emailSent: currentInvoice?.emailSent || false,
    }

    if (currentInvoice) {
      setInvoices(invoices.map((invoice) => (invoice.id === newInvoice.id ? newInvoice : invoice)))
      toast({
        title: "Factuur Opgeslagen",
        description: `Factuur ${newInvoice.invoiceNumber} is succesvol bijgewerkt.`,
      })
    } else {
      setInvoices([...invoices, newInvoice])
      toast({
        title: "Factuur Aangemaakt",
        description: `Factuur ${newInvoice.invoiceNumber} is succesvol aangemaakt.`,
      })
    }
    setIsDialogOpen(false)
  }

  const handleSendEmail = (invoiceId: string) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === invoiceId ? { ...invoice, emailSent: true, status: "Verzonden" } : invoice,
      ),
    )
    toast({
      title: "E-mail Verzonden",
      description: `Factuur ${invoiceId} is succesvol via e-mail verzonden.`,
    })
  }

  const getStatusBadgeVariant = (status: Invoice["status"]) => {
    switch (status) {
      case "Open":
        return "secondary"
      case "Betaald":
        return "default"
      case "Verlopen":
        return "destructive"
      case "Verzonden":
        return "outline"
      default:
        return "outline"
    }
  }

  const totalAmount = currentInvoice
    ? calculateTotal(currentInvoice.items, currentInvoice.discountPercentage)
    : calculateTotal(invoiceItems, discountPercentage)

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Facturatie</h1>
        <Button onClick={handleAddInvoice}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nieuwe Factuur
        </Button>
      </div>

      <div className="relative mb-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek op factuurnummer of studentnaam..."
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
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter op status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Alles">Alles</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Betaald">Betaald</SelectItem>
            <SelectItem value="Verlopen">Verlopen</SelectItem>
            <SelectItem value="Verzonden">Verzonden</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Factuurnummer</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Factuurdatum</TableHead>
              <TableHead>Vervaldatum</TableHead>
              <TableHead>Totaal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Geen facturen gevonden.
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.studentName}</TableCell>
                  <TableCell>{invoice.invoiceDate}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>€{calculateTotal(invoice.items, invoice.discountPercentage).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <PDFDownloadLink
                        document={
                          <InvoicePDF
                            invoice={invoice}
                            rijschoolSettings={rijschoolSettings}
                            studentEmail={students.find((s) => s._id === invoice.studentId)?.email || "N/A"}
                          />
                        }
                        fileName={`Factuur_${invoice.invoiceNumber}.pdf`}
                      >
                        {({ loading }) => (
                          <Button variant="outline" size="icon" disabled={loading}>
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download PDF</span>
                          </Button>
                        )}
                      </PDFDownloadLink>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSendEmail(invoice.id)}
                        disabled={invoice.emailSent}
                      >
                        <Mail className="h-4 w-4" />
                        <span className="sr-only">Verzend e-mail</span>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleEditInvoice(invoice)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Bewerk factuur</span>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteInvoice(invoice.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Verwijder factuur</span>
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
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{currentInvoice ? "Factuur Bewerken" : "Nieuwe Factuur Toevoegen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="studentId" className="text-right">
                Student
              </Label>
              <Select
                name="studentId"
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
                required
                className="col-span-3"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een student" />
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
              <Label htmlFor="invoiceDate" className="text-right">
                Factuurdatum
              </Label>
              <Input
                id="invoiceDate"
                name="invoiceDate"
                type="date"
                defaultValue={currentInvoice?.invoiceDate || new Date().toISOString().split("T")[0]}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select name="status" defaultValue={currentInvoice?.status || "Open"} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Betaald">Betaald</SelectItem>
                  <SelectItem value="Verlopen">Verlopen</SelectItem>
                  <SelectItem value="Verzonden">Verzonden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <h3 className="text-lg font-semibold mt-4 col-span-4">Factuurregels</h3>
            {invoiceItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-10 items-center gap-2">
                <Input
                  placeholder="Omschrijving"
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                  className="col-span-4"
                  required
                />
                <Input
                  type="number"
                  placeholder="Aantal"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, "quantity", Number.parseInt(e.target.value))}
                  className="col-span-2"
                  required
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Prijs p/st"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(item.id, "unitPrice", Number.parseFloat(e.target.value))}
                  className="col-span-2"
                  required
                />
                <Input
                  type="number"
                  step="1"
                  placeholder="BTW %"
                  value={item.btwPercentage}
                  onChange={(e) => handleItemChange(item.id, "btwPercentage", Number.parseInt(e.target.value))}
                  className="col-span-1"
                  required
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveItem(item.id)}
                  className="col-span-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddItem} className="col-span-4 bg-transparent">
              <PlusCircle className="mr-2 h-4 w-4" /> Regel Toevoegen
            </Button>

            <div className="grid grid-cols-4 items-center gap-4 mt-4">
              <Label htmlFor="discount" className="text-right">
                Korting (%)
              </Label>
              <Input
                id="discount"
                name="discount"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(Number.parseFloat(e.target.value))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4 font-bold text-lg">
              <div className="col-span-3 text-right">Totaalbedrag:</div>
              <div className="col-span-1">€{totalAmount.toFixed(2)}</div>
            </div>

            <DialogFooter>
              <Button type="submit">{currentInvoice ? "Factuur Opslaan" : "Factuur Aanmaken"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
