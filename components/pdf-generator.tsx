"use client"

import type React from "react"

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer"
import { type Factuur, rijschoolSettings } from "@/lib/data"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  companyInfo: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  invoiceInfo: {
    textAlign: "right",
    fontSize: 12,
    lineHeight: 1.5,
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  customerInfo: {
    marginBottom: 30,
    fontSize: 12,
    lineHeight: 1.5,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "14.28%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 8,
  },
  tableCol: {
    width: "14.28%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 9,
  },
  totals: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 5,
    fontSize: 12,
  },
  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    marginBottom: 5,
    fontSize: 14,
    fontWeight: "bold",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    paddingTop: 5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
})

interface FactuurPDFProps {
  factuur: Factuur
}

const FactuurPDF = ({ factuur }: FactuurPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>{rijschoolSettings.rijschoolNaam}</Text>
          <Text style={styles.companyInfo}>
            {rijschoolSettings.plaats}
            {"\n"}
            {rijschoolSettings.telefoon}
            {"\n"}
            {rijschoolSettings.email}
            {"\n"}
            KvK: {rijschoolSettings.kvkNummer}
          </Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text>Factuurnummer: {factuur.factuurNummer}</Text>
          <Text>Factuurdatum: {format(new Date(factuur.datum), "dd MMMM yyyy", { locale: nl })}</Text>
          <Text>Vervaldatum: {format(new Date(factuur.vervaldatum), "dd MMMM yyyy", { locale: nl })}</Text>
        </View>
      </View>

      <Text style={styles.invoiceTitle}>FACTUUR</Text>

      {/* Customer Info */}
      <View style={styles.customerInfo}>
        <Text>Factuur aan:</Text>
        <Text>{factuur.leerlingNaam}</Text>
        <Text>{factuur.leerlingAdres}</Text>
        <Text>{factuur.leerlingEmail}</Text>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Beschrijving</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Datum</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Tijd</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Duur</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Prijs/uur</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Korting</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Totaal</Text>
          </View>
        </View>
        {factuur.items.map((item) => (
          <View style={styles.tableRow} key={item.id}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.beschrijving}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{format(new Date(item.datum), "dd/MM/yyyy", { locale: nl })}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.tijd}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.duur} min</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>€ {item.prijsPerUur}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>€ {item.korting}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>€ {item.totaal.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text>Subtotaal:</Text>
          <Text>€ {factuur.subtotaal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>BTW (21%):</Text>
          <Text>€ {factuur.btw.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRowFinal}>
          <Text>Totaal:</Text>
          <Text>€ {factuur.totaal.toFixed(2)}</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Gelieve het factuurbedrag binnen 30 dagen over te maken naar rekeningnummer NL00 BANK 0000 0000 00
        {"\n"}
        onder vermelding van het factuurnummer {factuur.factuurNummer}
      </Text>
    </Page>
  </Document>
)

interface PDFDownloadButtonProps {
  factuur: Factuur
  children: React.ReactNode
}

export const PDFDownloadButton = ({ factuur, children }: PDFDownloadButtonProps) => (
  <PDFDownloadLink document={<FactuurPDF factuur={factuur} />} fileName={`factuur-${factuur.factuurNummer}.pdf`}>
    {children}
  </PDFDownloadLink>
)

export default FactuurPDF
