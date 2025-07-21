const Les = require("../models/les.model")
const Student = require("../models/student.model")
const Instructeur = require("../models/instructeur.model")

// Get all lessons
exports.getAllLessen = async (req, res) => {
  try {
    const lessen = await Les.find()
      .populate("student", "naam email") // Populate student with name and email
      .populate("instructeur", "naam email") // Populate instructor with name and email
    res.json(lessen)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get a single lesson by ID
exports.getLesById = async (req, res) => {
  try {
    const les = await Les.findById(req.params.id)
      .populate("student", "naam email")
      .populate("instructeur", "naam email")
    if (!les) {
      return res.status(404).json({ message: "Les not found" })
    }
    res.json(les)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Create a new lesson
exports.createLes = async (req, res) => {
  const { datum, tijd, duur, student, instructeur, type, opmerkingen } = req.body

  // Basic validation for required fields
  if (!datum || !tijd || !duur || !student || !instructeur) {
    return res.status(400).json({ message: "Missing required fields: datum, tijd, duur, student, instructeur" })
  }

  // Check if student and instructor exist
  const existingStudent = await Student.findById(student)
  if (!existingStudent) {
    return res.status(404).json({ message: "Student not found" })
  }
  const existingInstructeur = await Instructeur.findById(instructeur)
  if (!existingInstructeur) {
    return res.status(404).json({ message: "Instructeur not found" })
  }

  const newLes = new Les({
    datum,
    tijd,
    duur,
    student,
    instructeur,
    type,
    opmerkingen,
  })

  try {
    const savedLes = await newLes.save()
    // Populate the saved lesson to return full student/instructor objects
    const populatedLes = await Les.findById(savedLes._id)
      .populate("student", "naam email")
      .populate("instructeur", "naam email")
    res.status(201).json(populatedLes)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Update a lesson
exports.updateLes = async (req, res) => {
  try {
    const { student, instructeur } = req.body

    // Check if student and instructor exist if they are being updated
    if (student) {
      const existingStudent = await Student.findById(student)
      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" })
      }
    }
    if (instructeur) {
      const existingInstructeur = await Instructeur.findById(instructeur)
      if (!existingInstructeur) {
        return res.status(404).json({ message: "Instructeur not found" })
      }
    }

    const updatedLes = await Les.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("student", "naam email")
      .populate("instructeur", "naam email")

    if (!updatedLes) {
      return res.status(404).json({ message: "Les not found" })
    }
    res.json(updatedLes)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Delete a lesson
exports.deleteLes = async (req, res) => {
  try {
    const deletedLes = await Les.findByIdAndDelete(req.params.id)
    if (!deletedLes) {
      return res.status(404).json({ message: "Les not found" })
    }
    res.json({ message: "Les deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
