const Student = require('../models/student.model');

exports.getAllStudenten = async () => {
  return await Student.find();
};

exports.createStudent = async (data) => {
  const student = new Student(data);
  return await student.save();
};

exports.getStudentById = async (id) => {
  return await Student.findById(id);
};

exports.updateStudentById = async (id, data) => {
  return await Student.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteStudentById = async (id) => {
  return await Student.findByIdAndDelete(id);
};
