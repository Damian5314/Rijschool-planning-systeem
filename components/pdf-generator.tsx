"use client"

import type { ReactNode } from "react"
import jsPDF from "jspdf"
import { format } from "date-fns"
import { toast } from "sonner"
import type { Invoice } from "@/lib/data"

interface PDFGeneratorProps {
  invoice: Invoice
  children: ReactNode
}

export function PDFGenerator({ invoice, children }: PDFGeneratorProps) {
  const generatePDF = () => {
    try {
      const doc = new jsPDF()

      // Rijschool header
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("Willes-Rijschool", 20, 30)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Hoofdstraat 123", 20, 40)
      doc.text("1234 AB Amsterdam", 20, 45)
      doc.text("Tel: 020-1234567", 20, 50)
      doc.text("Email: info@willes-rijschool.nl", 20, 55)
      doc.text("KvK: 12345678", 20, 60)
      doc.text("BTW: NL123456789B01", 20, 65)

      // Factuur titel
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("FACTUUR", 150, 30)

      // Factuur info
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(`Factuurnummer: ${invoice.invoiceNumber}`, 150, 40)
      doc.text(`Datum: ${format(new Date(invoice.date), "dd-MM-yyyy")}`, 150, 45)
      doc.text(`Vervaldatum: ${format(new Date(invoice.dueDate), "dd-MM-yyyy")}`, 150, 50)

      // Klant info
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Factuuradres:", 20, 85)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(invoice.studentName, 20, 95)

      // Adres splitsen op komma's
      const addressParts = invoice.studentAddress.split(", ")
      let yPos = 100
      addressParts.forEach((part) => {
        doc.text(part, 20, yPos)
        yPos += 5
      })

      // Items tabel header
      const tableStartY = 130
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")

      // Tabel headers
      doc.text("Beschrijving", 20, tableStartY)
      doc.text("Datum", 80, tableStartY)
      doc.text("Tijd", 110, tableStartY)
      doc.text("Duur", 130, tableStartY)
      doc.text("Prijs", 150, tableStartY)
      doc.text("Korting", 170, tableStartY)
      doc.text("Totaal", 190, tableStartY)

      // Lijn onder header
      doc.line(20, tableStartY + 2, 200, tableStartY + 2)

      // Items
      doc.setFont("helvetica", "normal")
      let currentY = tableStartY + 10

      invoice.items.forEach((item) => {
        // Beschrijving (kan lang zijn, dus wrappen)
        const description = item.description
        if (description.length > 25) {
          const words = description.split(" ")
          let line = ""
          let lineY = currentY

          words.forEach((word) => {
            if ((line + word).length > 25) {
              doc.text(line, 20, lineY)
              line = word + " "
              lineY += 5
            } else {
              line += word + " "
            }
          })
          if (line.trim()) {
            doc.text(line.trim(), 20, lineY)
          }
          currentY = lineY
        } else {
          doc.text(description, 20, currentY)
        }

        doc.text(format(new Date(item.date), "dd-MM"), 80, currentY)
        doc.text(item.time || "-", 110, currentY)
        doc.text(`${item.duration}m`, 130, currentY)
        doc.text(`€${item.unitPrice.toFixed(2)}`, 150, currentY)
        doc.text(item.discount > 0 ? `-€${item.discount.toFixed(2)}` : "-", 170, currentY)
        doc.text(`€${item.total.toFixed(2)}`, 190, currentY)

        currentY += 10
      })

      // Totalen sectie
      const totalsStartY = currentY + 10
      doc.line(20, totalsStartY, 200, totalsStartY)

      let totalsY = totalsStartY + 10

      // Subtotaal
      doc.text("Subtotaal:", 150, totalsY)
      doc.text(`€${invoice.subtotal.toFixed(2)}`, 190, totalsY)
      totalsY += 8

      // Korting (als van toepassing)
      if (invoice.discount > 0) {
        doc.text("Korting:", 150, totalsY)
        doc.text(`-€${invoice.discount.toFixed(2)}`, 190, totalsY)
        totalsY += 8
      }

      // BTW
      doc.text(`BTW (${invoice.taxRate}%):`, 150, totalsY)
      doc.text(`€${invoice.taxAmount.toFixed(2)}`, 190, totalsY)
      totalsY += 8

      // Totaal
      doc.setFont("helvetica", "bold")
      doc.text("Totaal:", 150, totalsY)
      doc.text(`€${invoice.total.toFixed(2)}`, 190, totalsY)

      // Betalingsinformatie
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      const paymentY = totalsY + 20
      doc.text("Betalingsinformatie:", 20, paymentY)
      doc.text("IBAN: NL12 ABCD 0123 4567 89", 20, paymentY + 8)
      doc.text("BIC: ABCDNL2A", 20, paymentY + 16)
      doc.text(`Betalingskenmerk: ${invoice.invoiceNumber}`, 20, paymentY + 24)
      doc.text(`Gelieve binnen 30 dagen te betalen`, 20, paymentY + 32)

      // Notities (als van toepassing)
      if (invoice.notes) {
        doc.text("Notities:", 20, paymentY + 44)
        doc.text(invoice.notes, 20, paymentY + 52)
      }

      // Footer
      doc.setFontSize(8)
      doc.text("Willes-Rijschool - Uw partner in rijopleidingen", 105, 280, { align: "center" })

      // Download PDF
      doc.save(`Factuur_${invoice.invoiceNumber}.pdf`)

      toast.success(`PDF van factuur ${invoice.invoiceNumber} gedownload`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Fout bij genereren van PDF")
    }
  }

  return (
    <div onClick={generatePDF} style={{ cursor: "pointer" }}>
      {children}
    </div>
  )
}
