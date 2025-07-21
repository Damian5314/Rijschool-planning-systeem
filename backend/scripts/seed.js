require("dotenv").config({ path: "../.env" }) // Load .env from parent directory
const mongoose = require("mongoose")
const path = require("path")

// Correctly resolve paths to models
const Student = require(path.resolve(__dirname, "../models/student.model"))
const Instructeur = require(path.resolve(__dirname, "../models/instructeur.model"))
const Les = require(path.resolve(__dirname, "../models/les.model"))
const User = require(path.resolve(__dirname, "../models/user.model"))

const connectDB = require(path.resolve(__dirname, "../config/db"))

connectDB()

const seedData = async () => {
  try {
    console.log("Clearing existing data...")
    await Student.deleteMany({})
    await Instructeur.deleteMany({})
    await Les.deleteMany({})
    await User.deleteMany({})
    console.log("Existing data cleared.")

    console.log("Creating test users...")
    const adminUser = await User.create({
      username: "admin",
      email: "admin@example.com",
      password: "password123", // This will be hashed by the pre-save hook
      roles: ["admin"],
    })
    const regularUser = await User.create({
      username: "user",
      email: "user@example.com",
      password: "password123",
      roles: ["user"],
    })
    console.log("Test users created.")

    console.log("Creating test instructors...")
    const instructeur1 = await Instructeur.create({
      naam: "Jan de Vries",
      email: "jan.devries@rijschool.nl",
      telefoon: "0612345678",
      rijbewijsType: ["B", "A"],
      status: "Actief",
    })
    const instructeur2 = await Instructeur.create({
      naam: "Marieke Jansen",
      email: "marieke.jansen@rijschool.nl",
      telefoon: "0687654321",
      rijbewijsType: ["B"],
      status: "Actief",
    })
    console.log("Test instructors created.")

    console.log("Creating test students...")
    const student1 = await Student.create({
      naam: "Emma Bakker",
      email: "emma.bakker@example.com",
      telefoon: "0611223344",
      adres: "Hoofdstraat 10",
      postcode: "1234 AB",
      plaats: "Amsterdam",
      geboortedatum: new Date("2005-03-15"),
      rijbewijsType: "B",
      transmissie: "Handgeschakeld",
      status: "Actief",
      instructeur: instructeur1._id,
      tegoed: 10,
      lesGeschiedenis: [
        { datum: new Date("2024-07-01"), duur: 60, opmerkingen: "Eerste les, basisbediening" },
        { datum: new Date("2024-07-08"), duur: 90, opmerkingen: "Verkeersregels en rotondes" },
      ],
      examens: [],
      financieel: {
        openstaandBedrag: 250,
        laatsteBetaling: new Date("2024-06-20"),
      },
    })

    const student2 = await Student.create({
      naam: "Noah Smits",
      email: "noah.smits@example.com",
      telefoon: "0655667788",
      adres: "Kerklaan 5",
      postcode: "5678 CD",
      plaats: "Utrecht",
      geboortedatum: new Date("2004-11-22"),
      rijbewijsType: "B",
      transmissie: "Automaat",
      status: "Actief",
      instructeur: instructeur2._id,
      tegoed: 5,
      lesGeschiedenis: [{ datum: new Date("2024-07-05"), duur: 60, opmerkingen: "Stad rijden" }],
      examens: [{ datum: new Date("2024-08-01"), type: "Theorie", resultaat: "Geslaagd" }],
      financieel: {
        openstaandBedrag: 0,
        laatsteBetaling: new Date("2024-07-01"),
      },
    })
    console.log("Test students created.")

    console.log("Creating test lessons...")
    await Les.create({
      datum: new Date("2024-07-25"),
      tijd: "10:00",
      duur: 60,
      student: student1._id,
      instructeur: instructeur1._id,
      type: "Rijles",
      opmerkingen: "Voorbereiding op examen",
    })
    await Les.create({
      datum: new Date("2024-07-26"),
      tijd: "14:30",
      duur: 90,
      student: student2._id,
      instructeur: instructeur2._id,
      type: "Rijles",
      opmerkingen: "Snelweg rijden",
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
