const mongoose = require('mongoose');

const instructeurSchema = new mongoose.Schema({
  naam: { type: String, required: true },
  beschikbaarheid: { type: [String], default: ['ma', 'di', 'wo', 'do', 'vr'] },
  rijbewijsType: { type: String, enum: ['automaat', 'schakel'], required: true },
});

module.exports = mongoose.model('Instructeur', instructeurSchema);