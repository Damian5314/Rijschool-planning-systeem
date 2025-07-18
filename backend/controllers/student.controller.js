const Student = require('../models/student.model');

exports.getStudenten = async (req, res) => {
  try {
    const studenten = await Student.find();
    res.json(studenten);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};