const Instructeur = require("../models/instructeur.model")

// Get all instructors
exports.getAllInstructeurs = async (req, res) => {
  try {
    const instructeurs = await Instructeur.find()
    res.status(200).json(instructeurs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get a single instructor by ID
exports.getInstructeurById = async (req, res) => {
  try {
    const instructeur = await Instructeur.findById(req.params.id)
    if (!instructeur) {
      return res.status(404).json({ message: "Instructeur niet gevonden" })
    }
    res.status(200).json(instructeur)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create a new instructor
exports.createInstructeur = async (req, res) => {
  const instructeur = new Instructeur({
    naam: req.body.naam,
    email: req.body.email,
    telefoon: req.body.telefoon,
    rijbewijsType: req.body.rijbewijsType,
    status: req.body.status,
  })

  try {
    const newInstructeur = await instructeur.save()
    res.status(201).json(newInstructeur)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update an instructor
exports.updateInstructeur = async (req, res) => {
  try {
    const instructeur = await Instructeur.findById(req.params.id)
    if (!instructeur) {
      return res.status(404).json({ message: "Instructeur niet gevonden" })
    }

    instructeur.naam = req.body.naam || instructeur.naam
    instructeur.email = req.body.email || instructeur.email
    instructeur.telefoon = req.body.telefoon || instructeur.telefoon
    instructeur.rijbewijsType = req.body.rijbewijsType || instructeur.rijbewijsType
    instructeur.status = req.body.status || instructeur.status

    const updatedInstructeur = await instructeur.save()
    res.status(200).json(updatedInstructeur)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete an instructor
exports.deleteInstructeur = async (req, res) => {
  try {
    const instructeur = await Instructeur.findById(req.params.id)
    if (!instructeur) {
      return res.status(404).json({ message: "Instructeur niet gevonden" })
    }

    await Instructeur.deleteOne({ _id: req.params.id })
    res.status(200).json({ message: "Instructeur succesvol verwijderd" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
