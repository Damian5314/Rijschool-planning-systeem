const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const UserSchema = new mongoose.Schema({
  naam: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  wachtwoord: {
    type: String,
    required: true,
  },
  rol: {
    type: String,
    enum: ["gebruiker", "admin"],
    default: "gebruiker",
  },
  datumAangemaakt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("wachtwoord")) {
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  this.wachtwoord = await bcrypt.hash(this.wachtwoord, salt)
  next()
})

module.exports = mongoose.model("User", UserSchema)
