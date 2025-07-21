"use client"

import type React from "react"
import { type Invoice, type RijschoolSettings, rijschoolSettings } from "@/lib/data"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

interface PDFGeneratorProps {
  invoice: Invoice
  children: React.ReactNode
}

export function PDFGenerator({ invoice, children }: PDFGeneratorProps) {
  const generatePdf = () => {
    const doc = new jsPDF()

    const settings: RijschoolSettings = rijschoolSettings

    // Header
    doc.setFontSize(18)
    doc.text(settings.rijschoolNaam, 14, 22)
    doc.setFontSize(10)
    doc.text(`${settings.adres}, ${settings.postcode} ${settings.plaats}`, 14, 28)
    doc.text(`Telefoon: ${settings.telefoon}`, 14, 34)
    doc.text(`E-mail: ${settings.email}`, 14, 40)
    doc.text(`Website: ${settings.website}`, 14, 46)
    doc.text(`KVK: ${settings.kvkNummer}`, 14, 52)
    if (settings.btwNummer) doc.text(`BTW: ${settings.btwNummer}`, 14, 58)
    if (settings.iban) doc.text(`IBAN: ${settings.iban}`, 14, 64)

    // Invoice Title
    doc.setFontSize(24)
    doc.text("FACTUUR", 14, 80)

    // Invoice Details
    doc.setFontSize(10)
    doc.text(`Factuurnummer: ${invoice.invoiceNumber}`, 14, 90)
    doc.text(`Factuurdatum: ${format(new Date(invoice.date), "dd-MM-yyyy", { locale: nl })}`, 14, 96)
    doc.text(`Vervaldatum: ${format(new Date(invoice.dueDate), "dd-MM-yyyy", { locale: nl })}`, 14, 102)
    doc.text(`Status: ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}`, 14, 108)

    // Bill To
    doc.setFontSize(12)
    doc.text("Gefactureerd aan:", 14, 120)
    doc.setFontSize(10)
    doc.text(invoice.studentName, 14, 126)
    doc.text(invoice.studentAddress, 14, 132)
    doc.text(invoice.studentEmail, 14, 138)

    // Table of items
    const tableColumn = ["Beschrijving", "Datum", "Duur (min)", "Aantal", "Prijs p/st", "Korting", "Totaal"]
    const tableRows = invoice.items.map((item) => [
      item.description,
      format(new Date(item.date), "dd-MM-yyyy", { locale: nl }),
      item.duration.toString(),
      item.quantity.toString(),
      `€${item.unitPrice.toFixed(2)}`,
      `€${item.discount.toFixed(2)}`,
      `€${item.total.toFixed(2)}`,
    ])

    autoTable(doc, {
      startY: 150,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 15 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { cellWidth: 25, halign: "right" },
      },
    })

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.text(`Subtotaal: €${invoice.subtotal.toFixed(2)}`, 140, finalY)
    doc.text(`Korting: €${invoice.discount.toFixed(2)}`, 140, finalY + 6)
    doc.text(`BTW (${invoice.taxRate}%): €${invoice.taxAmount.toFixed(2)}`, 140, finalY + 12)
    doc.setFontSize(12)
    doc.text(`Totaal: €${invoice.total.toFixed(2)}`, 140, finalY + 20)

    // Notes
    if (invoice.notes) {
      doc.setFontSize(10)
      doc.text("Opmerkingen:", 14, finalY + 30)
      doc.text(invoice.notes, 14, finalY + 36, { maxWidth: 180 })
    }

    doc.save(`Factuur_${invoice.invoiceNumber}.pdf`)
  }

  return <div onClick={generatePdf}>{children}</div>
}
