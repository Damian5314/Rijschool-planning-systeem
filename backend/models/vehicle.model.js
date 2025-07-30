const mongoose = require("mongoose")

const VehicleSchema = new mongoose.Schema({
  merk: {
    type: String,
    required: true,
    trim: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  bouwjaar: {
    type: Number,
    required: true,
  },
  kenteken: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  transmissie: {
    type: String,
    enum: ["Handgeschakeld", "Automaat"],
    required: true,
  },
  brandstof: {
    type: String,
    enum: ["benzine", "diesel", "elektrisch", "hybride"],
    required: true,
  },
  kilometerstand: {
    type: Number,
    default: 0,
  },
  laatsteOnderhoud: {
    type: Date,
  },
  volgendeOnderhoud: {
    type: Date,
  },
  apkDatum: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["beschikbaar", "onderhoud", "defect"],
    default: "beschikbaar",
  },
  instructeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructeur",
    default: null, // Can be unassigned
  },
  datumAangemaakt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Vehicle", VehicleSchema)
