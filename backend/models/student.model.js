const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  naam: { type: String, required: true },
  telefoon: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  aantalLessen: { type: Number, default: 0 },
});

module.exports = mongoose.model('Student', studentSchema);