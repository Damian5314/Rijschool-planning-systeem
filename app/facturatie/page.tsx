"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { toast } from "@/components/ui/use-toast"
import { type Invoice, type InvoiceItem, mockInvoices, generateInvoiceNumber, calculateInvoiceTotals } from "@/lib/data"
import { PDFGenerator } from "@/components/pdf-generator"

export default function FacturatiePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])

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

  const handleAddInvoice = () => {
    setCurrentInvoice(null)
    setInvoiceItems([
      {
        id: "1",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
        duration: 0,
        unitPrice: 0,
        quantity: 1,
        discount: 0,
        total: 0,
      },
    ])
    setIsDialogOpen(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice)
    setInvoiceItems(invoice.items)
    setIsDialogOpen(true)
  }

  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter((invoice) => invoice.id !== id))
    toast({
      title: "Factuur verwijderd",
      description: `Factuur met nummer ${id} is succesvol verwijderd.`,
    })
  }

  const handleAddItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: `${invoiceItems.length + 1}`,
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
        duration: 0,
        unitPrice: 0,
        quantity: 1,
        discount: 0,
        total: 0,
      },
    ])
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoiceItems]
    // @ts-ignore
    updatedItems[index][field] = value

    // Recalculate total for the item
    if (field === "unitPrice" || field === "quantity" || field === "discount") {
      const price = updatedItems[index].unitPrice || 0
      const qty = updatedItems[index].quantity || 0
      const discount = updatedItems[index].discount || 0
      updatedItems[index].total = price * qty - discount
    }

    setInvoiceItems(updatedItems)
  }

  const handleRemoveItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    const studentId = formData.get("studentId") as string
    const selectedStudent = mockStudents.find((s) => s.id === studentId)

    if (!selectedStudent) {
      toast({
        title: "Fout",
        description: "Selecteer een geldige student.",
        variant: "destructive",
      })
      return
    }

    const instructorId = formData.get("instructorId") as string
    const selectedInstructor = mockInstructors.find((i) => i.id === instructorId)

    if (!selectedInstructor) {
      toast({
        title: "Fout",
        description: "Selecteer een geldige instructeur.",
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

    if (currentInvoice) {
      setInvoices(invoices.map((inv) => (inv.id === newInvoice.id ? newInvoice : inv)))
      toast({
        title: "Factuur bijgewerkt",
        description: `Factuur ${newInvoice.invoiceNumber} is succesvol bijgewerkt.`,
      })
    } else {
      setInvoices([...invoices, newInvoice])
      toast({
        title: "Factuur toegevoegd",
        description: `Nieuwe factuur ${newInvoice.invoiceNumber} is succesvol toegevoegd.`,
      })
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Facturatie</h1>
        <Button className="ml-auto" onClick={handleAddInvoice}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nieuwe Factuur
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Overzicht Facturen</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factuurnummer</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Vervaldatum</TableHead>
                <TableHead>Totaal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.studentName}</TableCell>
                  <TableCell>{format(new Date(invoice.date), "dd-MM-yyyy", { locale: nl })}</TableCell>
                  <TableCell>{format(new Date(invoice.dueDate), "dd-MM-yyyy", { locale: nl })}</TableCell>
                  <TableCell>€{invoice.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === "betaald"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : invoice.status === "verzonden"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : invoice.status === "vervallen"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <PDFGenerator invoice={invoice}>
                      <Button variant="ghost" size="icon" className="mr-2">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download PDF</span>
                      </Button>
                    </PDFGenerator>
                    <Button variant="ghost" size="icon" onClick={() => handleEditInvoice(invoice)} className="mr-2">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Bewerken</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteInvoice(invoice.id)}>
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
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{currentInvoice ? "Factuur Bewerken" : "Nieuwe Factuur Toevoegen"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Factuurnummer</Label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  defaultValue={currentInvoice?.invoiceNumber || generateInvoiceNumber()}
                  readOnly
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="date">Factuurdatum</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={currentInvoice?.date || format(new Date(), "yyyy-MM-dd")}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Vervaldatum</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  defaultValue={
                    currentInvoice?.dueDate || format(new Date().setDate(new Date().getDate() + 30), "yyyy-MM-dd")
                  }
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="studentId">Student</Label>
                <Select name="studentId" defaultValue={currentInvoice?.studentId} required>
                  <SelectTrigger className="mt-1">
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
              <div>
                <Label htmlFor="instructorId">Instructeur</Label>
                <Select name="instructorId" defaultValue={currentInvoice?.instructorId} required>
                  <SelectTrigger className="mt-1">
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
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={currentInvoice?.status || "concept"} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecteer status" />
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

            <h3 className="text-lg font-semibold mt-4">Factuurregels</h3>
            {invoiceItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end border-b pb-2 mb-2">
                <div className="col-span-2">
                  <Label htmlFor={`description-${index}`}>Beschrijving</Label>
                  <Input
                    id={`description-${index}`}
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`quantity-${index}`}>Aantal</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", Number.parseInt(e.target.value))}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`unitPrice-${index}`}>Prijs p/st</Label>
                  <Input
                    id={`unitPrice-${index}`}
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, "unitPrice", Number.parseFloat(e.target.value))}
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`discount-${index}`}>Korting</Label>
                  <Input
                    id={`discount-${index}`}
                    type="number"
                    value={item.discount}
                    onChange={(e) => handleItemChange(index, "discount", Number.parseFloat(e.target.value))}
                    step="0.01"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label>Totaal: €{item.total.toFixed(2)}</Label>
                  <Button variant="destructive" size="icon" onClick={() => handleRemoveItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddItem}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Regel toevoegen
            </Button>

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

            <DialogFooter>
              <Button type="submit">{currentInvoice ? "Factuur Opslaan" : "Factuur Toevoegen"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
//test