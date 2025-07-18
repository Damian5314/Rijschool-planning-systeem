const Les = require('../models/les.model');

exports.getAllLessen = async () => {
  return await Les.find().populate('student', 'naam').populate('instructeur', 'naam');
};

exports.createLes = async (data) => {
  const les = new Les(data);
  return await les.save();
};

exports.getLesById = async (id) => {
  return await Les.findById(id).populate('student', 'naam').populate('instructeur', 'naam');
};

exports.updateLesById = async (id, data) => {
  return await Les.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteLesById = async (id) => {
  return await Les.findByIdAndDelete(id);
};