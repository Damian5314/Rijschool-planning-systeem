const Student = require("../models/student.model")

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("instructeur")
    res.status(200).json(students)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get a single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("instructeur")
    if (!student) {
      return res.status(404).json({ message: "Student niet gevonden" })
    }
    res.status(200).json(student)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create a new student
exports.createStudent = async (req, res) => {
  const student = new Student({
    naam: req.body.naam,
    email: req.body.email,
    telefoon: req.body.telefoon,
    adres: req.body.adres,
    postcode: req.body.postcode,
    plaats: req.body.plaats,
    geboortedatum: req.body.geboortedatum,
    rijbewijsType: req.body.rijbewijsType,
    transmissie: req.body.transmissie,
    status: req.body.status,
    instructeur: req.body.instructeur,
    tegoed: req.body.tegoed,
    lesGeschiedenis: req.body.lesGeschiedenis || [],
    examens: req.body.examens || [],
    financieel: req.body.financieel,
  })

  try {
    const newStudent = await student.save()
    res.status(201).json(newStudent)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) {
      return res.status(404).json({ message: "Student niet gevonden" })
    }

    student.naam = req.body.naam || student.naam
    student.email = req.body.email || student.email
    student.telefoon = req.body.telefoon || student.telefoon
    student.adres = req.body.adres || student.adres
    student.postcode = req.body.postcode || student.postcode
    student.plaats = req.body.plaats || student.plaats
    student.geboortedatum = req.body.geboortedatum || student.geboortedatum
    student.rijbewijsType = req.body.rijbewijsType || student.rijbewijsType
    student.transmissie = req.body.transmissie || student.transmissie
    student.status = req.body.status || student.status
    student.instructeur = req.body.instructeur || student.instructeur
    student.tegoed = req.body.tegoed || student.tegoed
    student.lesGeschiedenis = req.body.lesGeschiedenis || student.lesGeschiedenis
    student.examens = req.body.examens || student.examens
    student.financieel = req.body.financieel || student.financieel

    const updatedStudent = await student.save()
    res.status(200).json(updatedStudent)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) {
      return res.status(404).json({ message: "Student niet gevonden" })
    }

    await Student.deleteOne({ _id: req.params.id })
    res.status(200).json({ message: "Student succesvol verwijderd" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
