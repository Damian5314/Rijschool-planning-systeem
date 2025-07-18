const Les = require('../models/les.model');

exports.getLessen = async (req, res) => {
  try {
    const lessen = await Les.find()
      .populate('student', 'naam')
      .populate('instructeur', 'naam');
    res.json(lessen);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createLes = async (req, res) => {
  try {
    const les = new Les(req.body);
    await les.save();
    res.status(201).json(les);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getLesById = async (req, res) => {
  try {
    const les = await Les.findById(req.params.id)
      .populate('student', 'naam')
      .populate('instructeur', 'naam');
    if (!les) return res.status(404).json({ message: 'Les niet gevonden' });
    res.json(les);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLes = async (req, res) => {
  try {
    const les = await Les.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!les) return res.status(404).json({ message: 'Les niet gevonden' });
    res.json(les);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteLes = async (req, res) => {
  try {
    const les = await Les.findByIdAndDelete(req.params.id);
    if (!les) return res.status(404).json({ message: 'Les niet gevonden' });
    res.json({ message: 'Les verwijderd' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};