const Instructeur = require("../models/instructeur.model")

// Get all instructors
exports.getAllInstructeurs = async (req, res) => {
  try {
    const instructeurs = await Instructeur.find()
    res.json(instructeurs)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get a single instructor by ID
exports.getInstructeurById = async (req, res) => {
  try {
    const instructeur = await Instructeur.findById(req.params.id)
    if (!instructeur) {
      return res.status(404).json({ message: "Instructeur not found" })
    }
    res.json(instructeur)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Create a new instructor
exports.createInstructeur = async (req, res) => {
  const { naam, email, telefoon, rijbewijsType, status } = req.body
  const newInstructeur = new Instructeur({
    naam,
    email,
    telefoon,
    rijbewijsType,
    status,
  })

  try {
    const savedInstructeur = await newInstructeur.save()
    res.status(201).json(savedInstructeur)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Update an instructor
exports.updateInstructeur = async (req, res) => {
  try {
    const updatedInstructeur = await Instructeur.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!updatedInstructeur) {
      return res.status(404).json({ message: "Instructeur not found" })
    }
    res.json(updatedInstructeur)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// Delete an instructor
exports.deleteInstructeur = async (req, res) => {
  try {
    const deletedInstructeur = await Instructeur.findByIdAndDelete(req.params.id)
    if (!deletedInstructeur) {
      return res.status(404).json({ message: "Instructeur not found" })
    }
    res.json({ message: "Instructeur deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
