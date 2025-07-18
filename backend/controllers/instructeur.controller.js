const Instructeur = require('../models/instructeur.model');

exports.getInstructeurs = async (req, res) => {
  try {
    const instructeurs = await Instructeur.find();
    res.json(instructeurs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createInstructeur = async (req, res) => {
  try {
    const instructeur = new Instructeur(req.body);
    await instructeur.save();
    res.status(201).json(instructeur);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getInstructeurById = async (req, res) => {
  try {
    const instructeur = await Instructeur.findById(req.params.id);
    if (!instructeur) return res.status(404).json({ message: 'Instructeur niet gevonden' });
    res.json(instructeur);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateInstructeur = async (req, res) => {
  try {
    const instructeur = await Instructeur.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!instructeur) return res.status(404).json({ message: 'Instructeur niet gevonden' });
    res.json(instructeur);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteInstructeur = async (req, res) => {
  try {
    const instructeur = await Instructeur.findByIdAndDelete(req.params.id);
    if (!instructeur) return res.status(404).json({ message: 'Instructeur niet gevonden' });
    res.json({ message: 'Instructeur verwijderd' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};