export const leerlingenData = [
  {
    id: 1,
    naam: "Emma van der Berg",
    telefoon: "06-12345678",
    email: "emma.vandenberg@email.com",
    adres: "Kerkstraat 45",
    postcode: "1234 AB",
    plaats: "Amsterdam",
    transmissie: "Automaat",
    status: "Actief",
    instructeur: "Jan Willems",
    datumLeerlingnummer: "001",
    debiteurNummer: "10",
    leerlingSinds: "15-01-2025",
    tegoed: 150.0,
    chatViaWhatsApp: true,
    lesGeschiedenis: [
      {
        id: 1,
        datum: "10 jan 25",
        tijd: "10:00 (60min)",
        rijles: "Rijles #5",
        status: "Thuis ophalen",
        type: "les",
        opmerkingen: "Goed geoefend met parkeren en achteruitrijden",
      },
      {
        id: 2,
        datum: "08 jan 25",
        tijd: "14:00 (60min)",
        rijles: "Rijles #4",
        status: "Thuis ophalen",
        type: "les",
        opmerkingen: "Voorrang oefenen, gaat steeds beter",
      },
    ],
    examens: [
      {
        id: 1,
        type: "Theorie-examen",
        datum: "20 december 2024",
        tijd: "09:00",
        status: "Geslaagd",
        locatie: "CBR Rijswijk",
      },
    ],
    financieel: {
      totaalBetaald: 800.0,
      laatsteBetaling: {
        datum: "05 januari 2025",
        bedrag: 200.0,
      },
    },
  },
  {
    id: 2,
    naam: "Tom Jansen",
    telefoon: "06-87654321",
    email: "tom@email.com",
    adres: "Kerkstraat 45",
    postcode: "5678 CD",
    plaats: "Rotterdam",
    transmissie: "Handgeschakeld",
    status: "Geslaagd",
    instructeur: "Leon Wilson",
    datumLeerlingnummer: "294",
    debiteurNummer: "40",
    leerlingSinds: "08-01-2025",
    tegoed: 0,
    chatViaWhatsApp: true,
    lesGeschiedenis: [
      {
        id: 1,
        datum: "21 aug 25",
        tijd: "08:00 (60min)",
        rijles: "B - Praktijkexamen",
        status: "Examen bij Borendrecht (aftel 8)",
        type: "examen",
        opmerkingen: "Uitstekend gereden, geen fouten gemaakt",
      },
      {
        id: 2,
        datum: "21 aug 25",
        tijd: "07:30 (60min)",
        rijles: "Rijles #10",
        status: "Thuis ophalen (voorrijden)",
        type: "les",
        opmerkingen: "Goed geoefend met parkeren",
      },
      {
        id: 3,
        datum: "19 jul 25",
        tijd: "10:30 (60min)",
        rijles: "Rijles #9",
        status: "Thuis ophalen (wil 30 min les)",
        type: "les",
        opmerkingen: "Voorrang oefenen, gaat steeds beter",
      },
      {
        id: 4,
        datum: "15 jul 25",
        tijd: "11:30 (60min)",
        rijles: "Rijles #8",
        status: "Thuis ophalen (wil 30 min les)",
        type: "les",
        opmerkingen: "Inhalen geoefend, meer zelfvertrouwen",
      },
      {
        id: 5,
        datum: "12 jul 25",
        tijd: "10:30 (60min)",
        rijles: "Rijles #7",
        status: "Thuis ophalen (wil 30 min les)",
        type: "les",
        opmerkingen: "Rotonde oefening, nog wat onzeker",
      },
    ],
    examens: [
      {
        id: 1,
        type: "B - Praktijkexamen",
        datum: "21 augustus 2025",
        tijd: "08:00",
        status: "Geslaagd",
        locatie: "CBR Barendrecht",
      },
    ],
    financieel: {
      totaalBetaald: 1250.0,
      laatsteBetaling: {
        datum: "15 juli 2025",
        bedrag: 300.0,
      },
    },
  },
  {
    id: 3,
    naam: "Sophie Willems",
    telefoon: "06-11223344",
    email: "sophie@email.com",
    adres: "Dorpsstraat 67",
    postcode: "9012 EF",
    plaats: "Utrecht",
    transmissie: "Automaat",
    status: "Nieuw",
    instructeur: "Maria de Vries",
    datumLeerlingnummer: "002",
    debiteurNummer: "11",
    leerlingSinds: "20-01-2025",
    tegoed: 300.0,
    chatViaWhatsApp: false,
    lesGeschiedenis: [
      {
        id: 1,
        datum: "22 jan 25",
        tijd: "11:00 (60min)",
        rijles: "Rijles #1",
        status: "Kennismaking en eerste les",
        type: "les",
        opmerkingen: "Eerste kennismaking, uitleg basis bediening",
      },
    ],
    examens: [],
    financieel: {
      totaalBetaald: 300.0,
      laatsteBetaling: {
        datum: "20 januari 2025",
        bedrag: 300.0,
      },
    },
  },
  {
    id: 4,
    naam: "David Smit",
    telefoon: "06-55667788",
    email: "david@email.com",
    adres: "Schoolstraat 89",
    postcode: "3456 GH",
    plaats: "Den Haag",
    transmissie: "Handgeschakeld",
    status: "Examen",
    instructeur: "Piet Hendriks",
    datumLeerlingnummer: "003",
    debiteurNummer: "12",
    leerlingSinds: "10-12-2024",
    tegoed: 50.0,
    chatViaWhatsApp: true,
    lesGeschiedenis: [
      {
        id: 1,
        datum: "15 jan 25",
        tijd: "13:00 (60min)",
        rijles: "Rijles #15",
        status: "Examenvoorbereiding",
        type: "les",
        opmerkingen: "Laatste voorbereiding voor praktijkexamen",
      },
      {
        id: 2,
        datum: "12 jan 25",
        tijd: "10:00 (60min)",
        rijles: "Rijles #14",
        status: "Examenroute oefenen",
        type: "les",
        opmerkingen: "Examenroute doorgenomen, zeer goed gereden",
      },
    ],
    examens: [
      {
        id: 1,
        type: "Theorie-examen",
        datum: "15 december 2024",
        tijd: "14:00",
        status: "Geslaagd",
        locatie: "CBR Rotterdam",
      },
      {
        id: 2,
        type: "B - Praktijkexamen",
        datum: "25 januari 2025",
        tijd: "10:00",
        status: "Gepland",
        locatie: "CBR Rotterdam",
      },
    ],
    financieel: {
      totaalBetaald: 1100.0,
      laatsteBetaling: {
        datum: "10 januari 2025",
        bedrag: 150.0,
      },
    },
  },
]

export const rijschoolSettings = {
  rijschoolNaam: "Willes-Rijschool",
  adres: "",
  postcode: "",
  plaats: "Rotterdam",
  telefoon: "+31(6)15941215",
  email: "info@willes-rijschool.nl",
  website: "www.willesrijschool.nl",
  kvkNummer: "81692471",

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

// Factuur data
export interface Factuur {
  id: number
  factuurNummer: string
  datum: string
  vervaldatum: string
  leerlingId: number
  leerlingNaam: string
  leerlingEmail: string
  leerlingAdres: string
  instructeur: string
  items: FactuurItem[]
  subtotaal: number
  btw: number
  totaal: number
  status: "concept" | "verzonden" | "betaald" | "vervallen"
  opmerkingen?: string
}

export interface FactuurItem {
  id: number
  beschrijving: string
  datum: string
  tijd: string
  duur: number // in minuten
  prijsPerUur: number
  korting: number
  totaal: number
}

export const facturenData: Factuur[] = [
  {
    id: 1,
    factuurNummer: "WR-2025-001",
    datum: "2025-01-15",
    vervaldatum: "2025-02-14",
    leerlingId: 1,
    leerlingNaam: "Emma van der Berg",
    leerlingEmail: "emma.vandenberg@email.com",
    leerlingAdres: "Kerkstraat 45, 1234 AB Amsterdam",
    instructeur: "Jan Willems",
    items: [
      {
        id: 1,
        beschrijving: "Rijles #4",
        datum: "2025-01-08",
        tijd: "14:00",
        duur: 60,
        prijsPerUur: 48,
        korting: 0,
        totaal: 48,
      },
      {
        id: 2,
        beschrijving: "Rijles #5",
        datum: "2025-01-10",
        tijd: "10:00",
        duur: 60,
        prijsPerUur: 48,
        korting: 0,
        totaal: 48,
      },
    ],
    subtotaal: 96,
    btw: 20.16,
    totaal: 116.16,
    status: "verzonden",
    opmerkingen: "Betaling binnen 30 dagen",
  },
  {
    id: 2,
    factuurNummer: "WR-2025-002",
    datum: "2025-01-20",
    vervaldatum: "2025-02-19",
    leerlingId: 2,
    leerlingNaam: "Tom Jansen",
    leerlingEmail: "tom@email.com",
    leerlingAdres: "Kerkstraat 45, 5678 CD Rotterdam",
    instructeur: "Leon Wilson",
    items: [
      {
        id: 1,
        beschrijving: "Rijlespakket 5 lessen",
        datum: "2025-01-15",
        tijd: "Diverse tijden",
        duur: 300, // 5 x 60 minuten
        prijsPerUur: 52,
        korting: 20, // 5% korting op pakket
        totaal: 240,
      },
    ],
    subtotaal: 240,
    btw: 50.4,
    totaal: 290.4,
    status: "betaald",
  },
]
