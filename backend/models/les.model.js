const mongoose = require('mongoose');

const lesSchema = new mongoose.Schema({
  datum: { type: Date, required: true },
  starttijd: { type: String, required: true },
  eindtijd: { type: String, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  instructeur: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructeur' },
  locatie: { type: String, required: true },
});

module.exports = mongoose.model('Les', lesSchema);