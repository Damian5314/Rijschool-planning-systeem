const mongoose = require("mongoose")

const StudentSchema = new mongoose.Schema({
  naam: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, "Please fill a valid email address"],
  },
  telefoon: {
    type: String,
    trim: true,
  },
  adres: {
    type: String,
    trim: true,
  },
  postcode: {
    type: String,
    trim: true,
  },
  plaats: {
    type: String,
    trim: true,
  },
  geboortedatum: {
    type: Date,
  },
  rijbewijsType: {
    type: String,
    enum: ["B", "A", "C"], // Example types
    default: "B",
  },
  transmissie: {
    type: String,
    enum: ["Handgeschakeld", "Automaat"],
    default: "Handgeschakeld",
  },
  status: {
    type: String,
    enum: ["Actief", "Inactief", "Gepauzeerd", "Afgestudeerd"],
    default: "Actief",
  },
  instructeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructeur",
  },
  tegoed: {
    type: Number, // e.g., remaining lesson hours/credits
    default: 0,
  },
  lesGeschiedenis: [
    {
      datum: { type: Date },
      duur: { type: Number }, // in minutes
      opmerkingen: { type: String },
    },
  ],
  examens: [
    {
      datum: { type: Date },
      type: { type: String },
      resultaat: { type: String, enum: ["Geslaagd", "Gezakt", "Gepland"] },
    },
  ],
  financieel: {
    openstaandBedrag: {
      type: Number,
      default: 0,
    },
    laatsteBetaling: {
      type: Date,
    },
  },
  datumAangemaakt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Student", StudentSchema)
