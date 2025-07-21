const Les = require("../models/les.model")

// Get all lessons
exports.getAllLessen = async (req, res) => {
  try {
    const lessen = await Les.find().populate("student").populate("instructeur")
    res.status(200).json(lessen)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get a single lesson by ID
exports.getLesById = async (req, res) => {
  try {
    const les = await Les.findById(req.params.id).populate("student").populate("instructeur")
    if (!les) {
      return res.status(404).json({ message: "Les niet gevonden" })
    }
    res.status(200).json(les)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create a new lesson
exports.createLes = async (req, res) => {
  const les = new Les({
    datum: req.body.datum,
    tijd: req.body.tijd,
    duur: req.body.duur,
    student: req.body.student,
    instructeur: req.body.instructeur,
    type: req.body.type,
    opmerkingen: req.body.opmerkingen,
  })

  try {
    const newLes = await les.save()
    res.status(201).json(newLes)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update a lesson
exports.updateLes = async (req, res) => {
  try {
    const les = await Les.findById(req.params.id)
    if (!les) {
      return res.status(404).json({ message: "Les niet gevonden" })
    }

    les.datum = req.body.datum || les.datum
    les.tijd = req.body.tijd || les.tijd
    les.duur = req.body.duur || les.duur
    les.student = req.body.student || les.student
    les.instructeur = req.body.instructeur || les.instructeur
    les.type = req.body.type || les.type
    les.opmerkingen = req.body.opmerkingen || les.opmerkingen

    const updatedLes = await les.save()
    res.status(200).json(updatedLes)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete a lesson
exports.deleteLes = async (req, res) => {
  try {
    const les = await Les.findById(req.params.id)
    if (!les) {
      return res.status(404).json({ message: "Les niet gevonden" })
    }

    await Les.deleteOne({ _id: req.params.id })
    res.status(200).json({ message: "Les succesvol verwijderd" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
