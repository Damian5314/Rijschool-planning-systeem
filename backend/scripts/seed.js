require("dotenv").config({ path: "../.env" }) // Load .env from parent directory
const mongoose = require("mongoose")
const path = require("path")

// Correctly resolve paths to models
const Student = require(path.resolve(__dirname, "../models/student.model"))
const Instructeur = require(path.resolve(__dirname, "../models/instructeur.model"))
const Les = require(path.resolve(__dirname, "../models/les.model"))
const User = require(path.resolve(__dirname, "../models/user.model"))
const Vehicle = require(path.resolve(__dirname, "../models/vehicle.model")) // New Vehicle model

const connectDB = require(path.resolve(__dirname, "../config/db"))

connectDB()

const seedData = async () => {
  try {
    console.log("Clearing existing data...")
    await Student.deleteMany({})
    await Instructeur.deleteMany({})
    await Les.deleteMany({})
    await User.deleteMany({})
    await Vehicle.deleteMany({}) // Clear vehicles as well
    console.log("Existing data cleared.")

    console.log("Creating test users...")
    const adminUser = await User.create({
      naam: "Admin",
      email: "admin@rijschool.nl",
      wachtwoord: "password123", // This will be hashed by the pre-save hook
      rol: "admin",
    })
    const regularUser = await User.create({
      naam: "Gebruiker",
      email: "gebruiker@rijschool.nl",
      wachtwoord: "password123",
      rol: "gebruiker",
    })
    console.log("Test users created.")

    console.log("Creating test instructors...")
    const instructeur1 = await Instructeur.create({
      naam: "Jan Bakker",
      email: "jan.bakker@rijschool.nl",
      telefoon: "0612345678",
      rijbewijsType: ["B", "A"],
      status: "Actief",
    })
    const instructeur2 = await Instructeur.create({
      naam: "Lisa de Vries",
      email: "lisa.devries@rijschool.nl",
      telefoon: "0687654321",
      rijbewijsType: ["B"],
      status: "Actief",
    })
    const instructeur3 = await Instructeur.create({
      naam: "Mark Peters",
      email: "mark.peters@rijschool.nl",
      telefoon: "0611223344",
      rijbewijsType: ["B", "C"],
      status: "Actief",
    })
    console.log("Test instructors created.")

    console.log("Creating test vehicles...")
    const vehicle1 = await Vehicle.create({
      merk: "Volkswagen",
      model: "Golf",
      bouwjaar: 2020,
      kenteken: "AB-123-CD",
      transmissie: "Handgeschakeld",
      brandstof: "benzine",
      kilometerstand: 50000,
      laatsteOnderhoud: new Date("2024-01-15"),
      volgendeOnderhoud: new Date("2025-01-15"),
      apkDatum: new Date("2025-03-01"),
      status: "beschikbaar",
      instructeur: instructeur1._id,
    })
    const vehicle2 = await Vehicle.create({
      merk: "Toyota",
      model: "Yaris",
      bouwjaar: 2022,
      kenteken: "EF-456-GH",
      transmissie: "Automaat",
      brandstof: "hybride",
      kilometerstand: 15000,
      laatsteOnderhoud: new Date("2024-05-20"),
      volgendeOnderhoud: new Date("2025-05-20"),
      apkDatum: new Date("2026-07-01"),
      status: "beschikbaar",
      instructeur: instructeur2._id,
    })
    const vehicle3 = await Vehicle.create({
      merk: "Mercedes-Benz",
      model: "Actros",
      bouwjaar: 2018,
      kenteken: "IJ-789-KL",
      transmissie: "Automaat",
      brandstof: "diesel",
      kilometerstand: 200000,
      laatsteOnderhoud: new Date("2024-02-10"),
      volgendeOnderhoud: new Date("2025-02-10"),
      apkDatum: new Date("2025-04-15"),
      status: "onderhoud",
      instructeur: instructeur3._id,
    })
    console.log("Test vehicles created.")

    console.log("Creating test students...")
    const student1 = await Student.create({
      naam: "Emma van der Berg",
      email: "emma.vanderberg@example.com",
      telefoon: "0611223344",
      adres: "Kerkstraat 1",
      postcode: "1000 AA",
      plaats: "Amsterdam",
      geboortedatum: new Date("2005-03-15"),
      rijbewijsType: "B",
      transmissie: "Handgeschakeld",
      status: "Actief",
      instructeur: instructeur1._id,
      tegoed: 15,
      lesGeschiedenis: [
        { datum: new Date("2024-06-01"), duur: 60, opmerkingen: "Eerste les, basisbediening" },
        { datum: new Date("2024-06-08"), duur: 90, opmerkingen: "Verkeersregels en rotondes" },
      ],
      examens: [{ datum: new Date("2024-07-20"), type: "Theorie", resultaat: "Geslaagd" }],
      financieel: {
        openstaandBedrag: 150,
        laatsteBetaling: new Date("2024-06-10"),
      },
    })

    const student2 = await Student.create({
      naam: "Tom Jansen",
      email: "tom.jansen@example.com",
      telefoon: "0655667788",
      adres: "Stationsplein 5",
      postcode: "3000 BB",
      plaats: "Rotterdam",
      geboortedatum: new Date("2004-11-22"),
      rijbewijsType: "B",
      transmissie: "Automaat",
      status: "Actief",
      instructeur: instructeur2._id,
      tegoed: 8,
      lesGeschiedenis: [{ datum: new Date("2024-06-05"), duur: 60, opmerkingen: "Stad rijden" }],
      examens: [],
      financieel: {
        openstaandBedrag: 0,
        laatsteBetaling: new Date("2024-06-25"),
      },
    })

    const student3 = await Student.create({
      naam: "Sophie Willems",
      email: "sophie.willems@example.com",
      telefoon: "0699887766",
      adres: "Dorpsstraat 12",
      postcode: "5000 CC",
      plaats: "Tilburg",
      geboortedatum: new Date("2006-01-01"),
      rijbewijsType: "B",
      transmissie: "Handgeschakeld",
      status: "Gepauzeerd",
      instructeur: instructeur1._id,
      tegoed: 5,
      lesGeschiedenis: [],
      examens: [],
      financieel: {
        openstaandBedrag: 50,
        laatsteBetaling: new Date("2024-05-01"),
      },
    })
    console.log("Test students created.")

    console.log("Creating test lessons...")
    await Les.create({
      datum: new Date("2024-07-22T09:00:00Z"),
      tijd: "09:00",
      duur: 60,
      student: student1._id,
      instructeur: instructeur1._id,
      type: "Rijles",
      opmerkingen: "Voorbereiding op praktijkexamen",
    })
    await Les.create({
      datum: new Date("2024-07-23T10:30:00Z"),
      tijd: "10:30",
      duur: 90,
      student: student2._id,
      instructeur: instructeur2._id,
      type: "Rijles",
      opmerkingen: "Snelweg rijden",
    })
    await Les.create({
      datum: new Date("2024-07-24T13:00:00Z"),
      tijd: "13:00",
      duur: 60,
      student: student1._id,
      instructeur: instructeur1._id,
      type: "Rijles",
      opmerkingen: "Bijzondere verrichtingen",
    })
    console.log("Test lessons created.")

    console.log("Database seeding complete!")
    process.exit()
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedData()
