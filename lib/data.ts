// Bestaande data types...
export interface Student {
  id: string
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  licenseType: "B" | "A" | "AM"
  startDate: string
  instructor: string
  lessonCount: number
  theoryPassed: boolean
  practicalExamDate?: string
  status: "active" | "passed" | "failed" | "paused"
  avatar?: string
  progress: number
  nextLesson?: string
}

export interface Instructor {
  id: string
  name: string
  email: string
  phone: string
  specialization: string[]
  experience: number
  rating: number
  avatar?: string
  availability: string[]
  students: number
}

export interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  licensePlate: string
  type: "manual" | "automatic"
  fuelType: "benzine" | "diesel" | "elektrisch" | "hybride"
  mileage: number
  lastMaintenance: string
  nextMaintenance: string
  keuringDate: string
  status: "beschikbaar" | "onderhoud" | "defect"
  instructor?: string
  image?: string
}

export interface Lesson {
  id: string
  studentId: string
  instructorId: string
  vehicleId: string
  date: string
  time: string
  duration: number
  type: "practical" | "theory" | "exam"
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  location?: string
}

export interface Exam {
  id: string
  studentId: string
  type: "theory" | "practical"
  date: string
  time: string
  location: string
  status: "scheduled" | "passed" | "failed"
  attempts: number
  notes?: string
}

// Nieuwe facturatie types
export interface InvoiceItem {
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

export interface Invoice {
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

// Rijschool instellingen interface
export interface RijschoolSettings {
  rijschoolNaam: string
  adres: string
  postcode: string
  plaats: string
  telefoon: string
  email: string
  website: string
  kvkNummer: string
  btwNummer?: string
  iban?: string
  openingstijden: {
    maandag: { open: string; dicht: string; gesloten: boolean }
    dinsdag: { open: string; dicht: string; gesloten: boolean }
    woensdag: { open: string; dicht: string; gesloten: boolean }
    donderdag: { open: string; dicht: string; gesloten: boolean }
    vrijdag: { open: string; dicht: string; gesloten: boolean }
    zaterdag: { open: string; dicht: string; gesloten: boolean }
    zondag: { open: string; dicht: string; gesloten: boolean }
  }
  lesDuur: number
  examenDuur: number
  pauzeMinuten: number
  emailNotificaties: boolean
  smsNotificaties: boolean
  herinneringVoorExamen: number
  herinneringVoorLes: number
  automatischeBackup: boolean
  backupTijd: string
  dataRetentie: number
  prijsAutomaat: number
  prijsSchakel: number
  prijsExamen: number
}

// Rijschool instellingen data
export const rijschoolSettings: RijschoolSettings = {
  rijschoolNaam: "Willes-Rijschool",
  adres: "Hoofdstraat 123",
  postcode: "3011 AB",
  plaats: "Rotterdam",
  telefoon: "+31(6)15941215",
  email: "info@willes-rijschool.nl",
  website: "www.willesrijschool.nl",
  kvkNummer: "81692471",
  btwNummer: "NL123456789B01",
  iban: "NL91 ABNA 0417 1643 00",

  openingstijden: {
    maandag: { open: "08:00", dicht: "20:00", gesloten: false },
    dinsdag: { open: "08:00", dicht: "20:00", gesloten: false },
    woensdag: { open: "08:00", dicht: "20:00", gesloten: false },
    donderdag: { open: "08:00", dicht: "20:00", gesloten: false },
    vrijdag: { open: "08:00", dicht: "20:00", gesloten: false },
    zaterdag: { open: "09:00", dicht: "18:00", gesloten: false },
    zondag: { open: "10:00", dicht: "16:00", gesloten: true },
  },

  lesDuur: 60,
  examenDuur: 90,
  pauzeMinuten: 15,

  emailNotificaties: true,
  smsNotificaties: true,
  herinneringVoorExamen: 24,
  herinneringVoorLes: 2,

  automatischeBackup: true,
  backupTijd: "03:00",
  dataRetentie: 365,

  prijsAutomaat: 48,
  prijsSchakel: 52,
  prijsExamen: 220,
}

// Mock data voor facturen (blijft voor nu, omdat er geen backend voor is)
export const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "WR-2025-001",
    studentId: "1",
    studentName: "Emma van der Berg",
    studentEmail: "emma.vandenberg@email.com",
    studentAddress: "Hoofdstraat 123, 1234 AB Amsterdam",
    instructorId: "1",
    instructorName: "Jan Jansen",
    date: "2025-01-14",
    dueDate: "2025-02-13",
    items: [
      {
        id: "1",
        description: "Rijles - Automaat",
        date: "2025-01-10",
        time: "10:00",
        duration: 60,
        unitPrice: 48,
        quantity: 1,
        discount: 0,
        total: 48,
      },
      {
        id: "2",
        description: "Rijles - Automaat",
        date: "2025-01-12",
        time: "14:00",
        duration: 60,
        unitPrice: 48,
        quantity: 1,
        discount: 0,
        total: 48,
      },
    ],
    subtotal: 96,
    discount: 0,
    taxRate: 21,
    taxAmount: 20.16,
    total: 116.16,
    status: "verzonden",
    createdAt: "2025-01-14T09:00:00Z",
    updatedAt: "2025-01-14T09:00:00Z",
  },
  {
    id: "2",
    invoiceNumber: "WR-2025-002",
    studentId: "2",
    studentName: "Lucas de Vries",
    studentEmail: "lucas.devries@email.com",
    studentAddress: "Kerkstraat 45, 5678 CD Utrecht",
    instructorId: "2",
    instructorName: "Marie Bakker",
    date: "2025-01-14",
    dueDate: "2025-02-13",
    items: [
      {
        id: "1",
        description: "Rijlespakket - 10 lessen Schakel",
        date: "2025-01-01",
        time: "",
        duration: 600,
        unitPrice: 52,
        quantity: 10,
        discount: 50,
        total: 470,
      },
    ],
    subtotal: 520,
    discount: 50,
    taxRate: 21,
    taxAmount: 98.7,
    total: 568.7,
    status: "concept",
    createdAt: "2025-01-14T10:30:00Z",
    updatedAt: "2025-01-14T10:30:00Z",
  },
]

// Utility functies
// Deze functies zijn nu afhankelijk van de backend, dus ze moeten worden aangepast of verwijderd als ze niet meer nodig zijn.
// Voor nu laat ik ze staan, maar ze zullen geen mock data meer gebruiken.
export const getStudentById = (id: string): Student | undefined => {
  // Deze functie moet nu een API call maken
  return undefined // Of een fetch implementeren
}

export const getInstructorById = (id: string): Instructor | undefined => {
  // Deze functie moet nu een API call maken
  return undefined // Of een fetch implementeren
}

export const getVehicleById = (id: string): Vehicle | undefined => {
  // Deze functie moet nu een API call maken
  return undefined // Of een fetch implementeren
}

export const getInvoiceById = (id: string): Invoice | undefined => {
  // Deze functie moet nu een API call maken
  return mockInvoices.find((invoice) => invoice.id === id) // Blijft mockdata voor facturen
}

export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear()
  const count = mockInvoices.length + 1
  return `WR-${year}-${count.toString().padStart(3, "0")}`
}

export const calculateInvoiceTotals = (items: InvoiceItem[], taxRate = 21) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0)
  const taxableAmount = subtotal - totalDiscount
  const taxAmount = (taxableAmount * taxRate) / 100
  const total = taxableAmount + taxAmount

  return {
    subtotal,
    discount: totalDiscount,
    taxAmount,
    total,
  }
}

// Legacy data voor backward compatibility - deze wordt nu verwijderd
export const leerlingenData: any[] = [] // Leeg array, data komt van backend
export const facturenData = mockInvoices.map((invoice) => ({
  id: Number.parseInt(invoice.id),
  factuurNummer: invoice.invoiceNumber,
  datum: invoice.date,
  vervaldatum: invoice.dueDate,
  leerlingId: Number.parseInt(invoice.studentId),
  leerlingNaam: invoice.studentName,
  leerlingEmail: invoice.studentEmail,
  leerlingAdres: invoice.studentAddress,
  instructeur: invoice.instructorName,
  items: invoice.items.map((item) => ({
    id: Number.parseInt(item.id),
    beschrijving: item.description,
    datum: item.date,
    tijd: item.time || "",
    duur: item.duration,
    prijsPerUur: item.unitPrice,
    korting: item.discount,
    totaal: item.total,
  })),
  subtotaal: invoice.subtotal,
  btw: invoice.taxAmount,
  totaal: invoice.total,
  status: invoice.status,
  opmerkingen: invoice.notes,
}))
