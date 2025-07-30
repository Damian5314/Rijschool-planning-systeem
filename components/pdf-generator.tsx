"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Invoice } from "@/lib/data"

interface PDFGeneratorProps {
  invoice: Invoice
  children?: React.ReactNode
}

export function PDFGenerator({ invoice, children }: PDFGeneratorProps) {
  const generatePDF = () => {
    // Create a simple HTML representation of the invoice
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Factuur ${invoice.invoiceNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            line-height: 1.6;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px;
            border-bottom: 2px solid #3B82F6;
            padding-bottom: 20px;
          }
          .company-info { color: #374151; }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #1F2937;
            margin-bottom: 10px;
          }
          .invoice-info { text-align: right; }
          .invoice-title { 
            font-size: 28px; 
            font-weight: bold; 
            color: #3B82F6;
            margin-bottom: 10px;
          }
          .details { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px;
          }
          .customer-info, .invoice-details { width: 45%; }
          .label { 
            font-weight: bold; 
            color: #374151;
            margin-bottom: 5px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
          }
          th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #E5E7EB;
          }
          th { 
            background-color: #F3F4F6; 
            font-weight: bold;
            color: #374151;
          }
          .totals { 
            width: 300px; 
            margin-left: auto;
            background-color: #F9FAFB;
            padding: 20px;
            border-radius: 8px;
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px;
          }
          .total-final { 
            font-weight: bold; 
            font-size: 18px;
            border-top: 2px solid #3B82F6;
            padding-top: 8px;
            margin-top: 8px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 14px;
          }
          .notes {
            margin-top: 30px;
            padding: 15px;
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <div class="company-name">Willes-Rijschool</div>
            <div>Hoofdstraat 123</div>
            <div>1234 AB Amsterdam</div>
            <div>Tel: 020-1234567</div>
            <div>Email: info@willes-rijschool.nl</div>
            <div>KvK: 12345678</div>
          </div>
          <div class="invoice-info">
            <div class="invoice-title">FACTUUR</div>
            <div><strong>${invoice.invoiceNumber}</strong></div>
          </div>
        </div>

        <div class="details">
          <div class="customer-info">
            <div class="label">Factuuradres:</div>
            <div><strong>${invoice.studentName}</strong></div>
            <div>${invoice.studentAddress}</div>
            <div>${invoice.studentEmail}</div>
          </div>
          <div class="invoice-details">
            <div class="label">Factuurgegevens:</div>
            <div><strong>Factuurdatum:</strong> ${new Date(invoice.date).toLocaleDateString('nl-NL')}</div>
            <div><strong>Vervaldatum:</strong> ${new Date(invoice.dueDate).toLocaleDateString('nl-NL')}</div>
            <div><strong>Instructeur:</strong> ${invoice.instructorName}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Beschrijving</th>
              <th>Datum</th>
              <th>Tijd</th>
              <th>Duur</th>
              <th>Prijs</th>
              <th>Korting</th>
              <th>Totaal</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${new Date(item.date).toLocaleDateString('nl-NL')}</td>
                <td>${item.time || '-'}</td>
                <td>${item.duration} min</td>
                <td>€ ${item.unitPrice.toFixed(2)}</td>
                <td>${item.discount > 0 ? '-€ ' + item.discount.toFixed(2) : '-'}</td>
                <td>€ ${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotaal:</span>
            <span>€ ${invoice.subtotal.toFixed(2)}</span>
          </div>
          ${invoice.discount > 0 ? `
            <div class="total-row">
              <span>Korting:</span>
              <span style="color: #DC2626;">-€ ${invoice.discount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="total-row">
            <span>BTW (${invoice.taxRate}%):</span>
            <span>€ ${invoice.taxAmount.toFixed(2)}</span>
          </div>
          <div class="total-row total-final">
            <span>Totaal:</span>
            <span>€ ${invoice.total.toFixed(2)}</span>
          </div>
        </div>

        ${invoice.notes ? `
          <div class="notes">
            <div class="label">Notities:</div>
            <div>${invoice.notes}</div>
          </div>
        ` : ''}

        <div class="footer">
          <div>Betaling binnen 30 dagen na factuurdatum.</div>
          <div>Rekeningnummer: NL12 BANK 0123 4567 89 t.n.v. Willes-Rijschool</div>
          <div>Vermeld bij betaling: ${invoice.invoiceNumber}</div>
          <br>
          <div>Bedankt voor uw vertrouwen in Willes-Rijschool!</div>
        </div>
      </body>
      </html>
    `

    // Create a new window and print the invoice
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print()
        // Close the window after printing
        setTimeout(() => {
          printWindow.close()
        }, 100)
      }
    }
  }

  if (children) {
    return (
      <div onClick={generatePDF} style={{ cursor: 'pointer' }}>
        {children}
      </div>
    )
  }

  return (
    <Button onClick={generatePDF} variant="outline">
      <Download className="h-4 w-4 mr-2" />
      Download PDF
    </Button>
  )
}