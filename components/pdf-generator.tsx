import type React from "react"
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

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

interface RijschoolSettings {
  name: string
  address: string
  zipCode: string
  city: string
  phone: string
  email: string
  kvk: string
  btw: string
  bankAccount: string
  iban: string
  logoUrl: string
}

interface InvoicePDFProps {
  invoice: Invoice
  rijschoolSettings: RijschoolSettings
  studentEmail: string
}

const calculateSubtotal = (items: InvoiceItem[]) => {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

const calculateBTW = (items: InvoiceItem[]) => {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.btwPercentage / 100), 0)
}

const calculateTotalBeforeDiscount = (items: InvoiceItem[]) => {
  return calculateSubtotal(items) + calculateBTW(items)
}

const calculateDiscountAmount = (items: InvoiceItem[], discountPercentage: number) => {
  const totalBeforeDiscount = calculateTotalBeforeDiscount(items)
  return totalBeforeDiscount * (discountPercentage / 100)
}

const calculateTotal = (items: InvoiceItem[], discountPercentage: number) => {
  const totalBeforeDiscount = calculateTotalBeforeDiscount(items)
  return totalBeforeDiscount * (1 - discountPercentage / 100)
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    alignItems: "flex-start",
  },
  logo: {
    width: 100,
    height: 100,
    objectFit: "contain",
  },
  rijschoolInfo: {
    fontSize: 10,
    textAlign: "right",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    fontSize: 10,
  },
  addressBlock: {
    width: "45%",
  },
  invoiceDetails: {
    width: "45%",
    textAlign: "right",
  },
  table: {
    display: "table",
    width: "auto",
    marginBottom: 20,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    fontSize: 9,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
    fontSize: 9,
  },
  tableColDescription: {
    width: "40%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
    fontSize: 9,
  },
  tableColQuantity: {
    width: "10%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
    fontSize: 9,
    textAlign: "right",
  },
  tableColUnitPrice: {
    width: "15%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
    fontSize: 9,
    textAlign: "right",
  },
  tableColBTW: {
    width: "10%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
    fontSize: 9,
    textAlign: "right",
  },
  tableColTotal: {
    width: "25%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderColor: "#bfbfbf",
    padding: 5,
    fontSize: 9,
    textAlign: "right",
  },
  summary: {
    flexDirection: "column",
    alignItems: "flex-end",
    fontSize: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "40%",
    marginBottom: 5,
  },
  summaryLabel: {
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "grey",
  },
})

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, rijschoolSettings, studentEmail }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {rijschoolSettings.logoUrl && (
          <Image src={rijschoolSettings.logoUrl || "/placeholder.svg"} style={styles.logo} />
        )}
        <View style={styles.rijschoolInfo}>
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>{rijschoolSettings.name}</Text>
          <Text>{rijschoolSettings.address}</Text>
          <Text>
            {rijschoolSettings.zipCode}, {rijschoolSettings.city}
          </Text>
          <Text>Telefoon: {rijschoolSettings.phone}</Text>
          <Text>E-mail: {rijschoolSettings.email}</Text>
          <Text>KVK: {rijschoolSettings.kvk}</Text>
          <Text>BTW: {rijschoolSettings.btw}</Text>
        </View>
      </View>

      <Text style={styles.title}>FACTUUR</Text>

      <View style={styles.subHeader}>
        <View style={styles.addressBlock}>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Factuuradres:</Text>
          <Text>{invoice.studentName}</Text>
          {/* Assuming student address is not directly in invoice, add placeholder or fetch */}
          <Text>Student Adres (indien beschikbaar)</Text>
          <Text>Student Postcode, Plaats</Text>
          <Text>E-mail: {studentEmail}</Text>
        </View>
        <View style={styles.invoiceDetails}>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Factuurnummer:</Text> {invoice.invoiceNumber}
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Factuurdatum:</Text> {invoice.invoiceDate}
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Vervaldatum:</Text> {invoice.dueDate}
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Status:</Text> {invoice.status}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColDescription}>Omschrijving</Text>
          <Text style={styles.tableColQuantity}>Aantal</Text>
          <Text style={styles.tableColUnitPrice}>Prijs p/st</Text>
          <Text style={styles.tableColBTW}>BTW %</Text>
          <Text style={styles.tableColTotal}>Totaal</Text>
        </View>
        {invoice.items.map((item) => (
          <View style={styles.tableRow} key={item.id}>
            <Text style={styles.tableColDescription}>{item.description}</Text>
            <Text style={styles.tableColQuantity}>{item.quantity}</Text>
            <Text style={styles.tableColUnitPrice}>€{item.unitPrice.toFixed(2)}</Text>
            <Text style={styles.tableColBTW}>{item.btwPercentage}%</Text>
            <Text style={styles.tableColTotal}>
              €{(item.quantity * item.unitPrice * (1 + item.btwPercentage / 100)).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotaal:</Text>
          <Text>€{calculateSubtotal(invoice.items).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>BTW:</Text>
          <Text>€{calculateBTW(invoice.items).toFixed(2)}</Text>
        </View>
        {invoice.discountPercentage > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Korting ({invoice.discountPercentage}%):</Text>
            <Text>-€{calculateDiscountAmount(invoice.items, invoice.discountPercentage).toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, { marginTop: 10, borderTopWidth: 1, paddingTop: 5 }]}>
          <Text style={styles.summaryLabel}>Totaalbedrag:</Text>
          <Text style={{ fontSize: 12, fontWeight: "bold" }}>
            €{calculateTotal(invoice.items, invoice.discountPercentage).toFixed(2)}
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 10, marginTop: 20 }}>
        Gelieve het totaalbedrag van €{calculateTotal(invoice.items, invoice.discountPercentage).toFixed(2)} over te
        maken naar:
      </Text>
      <Text style={{ fontSize: 10, marginBottom: 5 }}>Bankrekeninghouder: {rijschoolSettings.bankAccount}</Text>
      <Text style={{ fontSize: 10, marginBottom: 20 }}>IBAN: {rijschoolSettings.iban}</Text>

      <Text style={styles.footer}>Bedankt voor uw vertrouwen in {rijschoolSettings.name}!</Text>
    </Page>
  </Document>
)

export default InvoicePDF
