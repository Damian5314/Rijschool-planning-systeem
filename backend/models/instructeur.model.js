const mongoose = require("mongoose")

const InstructeurSchema = new mongoose.Schema({
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
  rijbewijsType: {
    type: [String], // Array of strings, e.g., ['B', 'A']
    enum: ["B", "A", "C", "D", "E"], // Example types
    default: ["B"],
  },
  status: {
    type: String,
    enum: ["Actief", "Inactief"],
    default: "Actief",
  },
  datumAangemaakt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Instructeur", InstructeurSchema)
