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

// Mock data voor studenten
export const mockStudents: Student[] = [
  {
    id: "1",
    name: "Emma van der Berg",
    email: "emma.vandenberg@email.com",
    phone: "06-12345678",
    address: "Hoofdstraat 123, 1234 AB Amsterdam",
    dateOfBirth: "2005-03-15",
    licenseType: "B",
    startDate: "2024-01-15",
    instructor: "Jan Jansen",
    lessonCount: 25,
    theoryPassed: true,
    practicalExamDate: "2024-03-20",
    status: "active",
    progress: 75,
    nextLesson: "2024-02-20T10:00",
  },
  {
    id: "2",
    name: "Lucas de Vries",
    email: "lucas.devries@email.com",
    phone: "06-87654321",
    address: "Kerkstraat 45, 5678 CD Utrecht",
    dateOfBirth: "2004-07-22",
    licenseType: "B",
    startDate: "2024-02-01",
    instructor: "Marie Bakker",
    lessonCount: 18,
    theoryPassed: true,
    status: "active",
    progress: 60,
    nextLesson: "2024-02-21T14:00",
  },
  {
    id: "3",
    name: "Sophie Janssen",
    email: "sophie.janssen@email.com",
    phone: "06-11223344",
    address: "Dorpsplein 67, 9012 EF Rotterdam",
    dateOfBirth: "2005-11-08",
    licenseType: "B",
    startDate: "2023-11-10",
    instructor: "Jan Jansen",
    lessonCount: 42,
    theoryPassed: true,
    status: "passed",
    progress: 100,
  },
  {
    id: "4",
    name: "Damian Willemse",
    email: "boma5314@gmail.com",
    phone: "06-11223344",
    address: "Dorpsplein 67, 9012 EF Rotterdam",
    dateOfBirth: "2005-11-08",
    licenseType: "B",
    startDate: "2023-11-10",
    instructor: "Jan Jansen",
    lessonCount: 42,
    theoryPassed: true,
    status: "passed",
    progress: 100,
  },
]

// Mock data voor instructeurs
export const mockInstructors: Instructor[] = [
  {
    id: "1",
    name: "Jan Jansen",
    email: "jan.jansen@rijschool.nl",
    phone: "06-11111111",
    specialization: ["B", "BE"],
    experience: 15,
    rating: 4.8,
    availability: ["ma", "di", "wo", "do", "vr"],
    students: 25,
  },
  {
    id: "2",
    name: "Marie Bakker",
    email: "marie.bakker@rijschool.nl",
    phone: "06-22222222",
    specialization: ["B", "A"],
    experience: 8,
    rating: 4.9,
    availability: ["di", "wo", "do", "vr", "za"],
    students: 18,
  },
  {
    id: "3",
    name: "Piet de Jong",
    email: "piet.dejong@rijschool.nl",
    phone: "06-33333333",
    specialization: ["B"],
    experience: 12,
    rating: 4.7,
    availability: ["ma", "wo", "vr"],
    students: 22,
  },
]

// Mock data voor voertuigen
export const mockVehicles: Vehicle[] = [
  {
    id: "1",
    brand: "Volkswagen",
    model: "Golf",
    year: 2022,
    licensePlate: "1-ABC-23",
    type: "manual",
    fuelType: "benzine",
    mileage: 45000,
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-04-15",
    keuringDate: "2024-12-01",
    status: "beschikbaar",
    instructor: "Jan Jansen",
  },
  {
    id: "2",
    brand: "Toyota",
    model: "Yaris",
    year: 2023,
    licensePlate: "2-DEF-45",
    type: "automatic",
    fuelType: "hybride",
    mileage: 28000,
    lastMaintenance: "2024-02-01",
    nextMaintenance: "2024-05-01",
    keuringDate: "2025-01-15",
    status: "beschikbaar",
    instructor: "Marie Bakker",
  },
  {
    id: "3",
    brand: "Opel",
    model: "Corsa",
    year: 2021,
    licensePlate: "3-GHI-67",
    type: "manual",
    fuelType: "benzine",
    mileage: 62000,
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-04-20",
    keuringDate: "2024-11-10",
    status: "onderhoud",
  },
]

// Mock data voor facturen
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
export const getStudentById = (id: string): Student | undefined => {
  return mockStudents.find((student) => student.id === id)
}

export const getInstructorById = (id: string): Instructor | undefined => {
  return mockInstructors.find((instructor) => instructor.id === id)
}

export const getVehicleById = (id: string): Vehicle | undefined => {
  return mockVehicles.find((vehicle) => vehicle.id === id)
}

export const getInvoiceById = (id: string): Invoice | undefined => {
  return mockInvoices.find((invoice) => invoice.id === id)
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

// Legacy data voor backward compatibility
export const leerlingenData = mockStudents.map((student) => ({
  id: Number.parseInt(student.id),
  naam: student.name,
  telefoon: student.phone,
  email: student.email,
  adres: student.address.split(",")[0],
  postcode: student.address.split(",")[1]?.split(" ")[1] + " " + student.address.split(",")[1]?.split(" ")[2] || "",
  plaats: student.address.split(",")[1]?.split(" ").slice(3).join(" ") || "",
  transmissie: student.licenseType === "B" ? "Automaat" : "Handgeschakeld",
  status: student.status === "active" ? "Actief" : student.status === "passed" ? "Geslaagd" : "Nieuw",
  instructeur: student.instructor,
  datumLeerlingnummer: student.id.padStart(3, "0"),
  debiteurNummer: (Number.parseInt(student.id) + 9).toString(),
  leerlingSinds: new Date(student.startDate).toLocaleDateString("nl-NL"),
  tegoed: Math.floor(Math.random() * 300),
  chatViaWhatsApp: Math.random() > 0.5,
  lesGeschiedenis: [],
  examens: [],
  financieel: {
    totaalBetaald: Math.floor(Math.random() * 1500) + 500,
    laatsteBetaling: {
      datum: new Date().toLocaleDateString("nl-NL"),
      bedrag: Math.floor(Math.random() * 300) + 100,
    },
  },
}))

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
