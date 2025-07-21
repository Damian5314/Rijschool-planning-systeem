const mongoose = require("mongoose")

const LesSchema = new mongoose.Schema({
  datum: {
    type: Date,
    required: true,
  },
  tijd: {
    type: String, // e.g., "09:00"
    required: true,
  },
  duur: {
    type: Number, // in minutes
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  instructeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructeur",
    required: true,
  },
  type: {
    type: String,
    enum: ["Rijles", "Examen", "Intake", "Anders"],
    default: "Rijles",
  },
  opmerkingen: {
    type: String,
    trim: true,
  },
  datumAangemaakt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Les", LesSchema)
