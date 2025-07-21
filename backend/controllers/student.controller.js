const Student = require("../models/student.model")

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("instructeur", "naam") // Populate instructor name
    res.json(students)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get a single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("instructeur", "naam")
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }
    res.json(student)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Create a new student
exports.createStudent = async (req, res) => {
  const {
    naam,
    email,
    telefoon,
    adres,
    postcode,
    plaats,
    geboortedatum,
    rijbewijsType,
    transmissie,
    status,
    instructeur,
    tegoed,
    lesGeschiedenis,
    examens,
    financieel,
  } = req.body
  const newStudent = new Student({
    naam,
    email,
    telefoon,
    adres,
    postcode,
    plaats,
    geboortedatum,
    rijbewijsType,
    transmissie,
    status,
    instructeur,
    tegoed,
    lesGeschiedenis,
    examens,
    financieel,
  })

  try {
    const savedStudent = await newStudent.save()
    res.status(201).json(savedStudent)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("instructeur", "naam")
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" })
    }
    res.json(updatedStudent)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id)
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found" })
    }
    res.json({ message: "Student deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
