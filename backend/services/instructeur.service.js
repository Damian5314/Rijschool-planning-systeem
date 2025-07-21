const Instructeur = require('../models/instructeur.model');

exports.getAllInstructeurs = async () => {
  return await Instructeur.find();
};

exports.createInstructeur = async (data) => {
  const instructeur = new Instructeur(data);
  return await instructeur.save();
};

exports.getInstructeurById = async (id) => {
  return await Instructeur.findById(id);
};

exports.updateInstructeurById = async (id, data) => {
  return await Instructeur.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteInstructeurById = async (id) => {
  return await Instructeur.findByIdAndDelete(id);
};
