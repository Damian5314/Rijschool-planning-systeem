const Vehicle = require("../models/vehicle.model")

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate("instructeur")
    res.status(200).json(vehicles)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get a single vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate("instructeur")
    if (!vehicle) {
      return res.status(404).json({ message: "Voertuig niet gevonden" })
    }
    res.status(200).json(vehicle)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create a new vehicle
exports.createVehicle = async (req, res) => {
  const vehicle = new Vehicle({
    merk: req.body.merk,
    model: req.body.model,
    bouwjaar: req.body.bouwjaar,
    kenteken: req.body.kenteken,
    transmissie: req.body.transmissie,
    brandstof: req.body.brandstof,
    kilometerstand: req.body.kilometerstand,
    laatsteOnderhoud: req.body.laatsteOnderhoud,
    volgendeOnderhoud: req.body.volgendeOnderhoud,
    apkDatum: req.body.apkDatum,
    status: req.body.status,
    instructeur: req.body.instructeur,
  })

  try {
    const newVehicle = await vehicle.save()
    res.status(201).json(newVehicle)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update a vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: "Voertuig niet gevonden" })
    }

    vehicle.merk = req.body.merk || vehicle.merk
    vehicle.model = req.body.model || vehicle.model
    vehicle.bouwjaar = req.body.bouwjaar || vehicle.bouwjaar
    vehicle.kenteken = req.body.kenteken || vehicle.kenteken
    vehicle.transmissie = req.body.transmissie || vehicle.transmissie
    vehicle.brandstof = req.body.brandstof || vehicle.brandstof
    vehicle.kilometerstand = req.body.kilometerstand || vehicle.kilometerstand
    vehicle.laatsteOnderhoud = req.body.laatsteOnderhoud || vehicle.laatsteOnderhoud
    vehicle.volgendeOnderhoud = req.body.volgendeOnderhoud || vehicle.volgendeOnderhoud
    vehicle.apkDatum = req.body.apkDatum || vehicle.apkDatum
    vehicle.status = req.body.status || vehicle.status
    vehicle.instructeur = req.body.instructeur || vehicle.instructeur

    const updatedVehicle = await vehicle.save()
    res.status(200).json(updatedVehicle)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete a vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ message: "Voertuig niet gevonden" })
    }

    await Vehicle.deleteOne({ _id: req.params.id })
    res.status(200).json({ message: "Voertuig succesvol verwijderd" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
