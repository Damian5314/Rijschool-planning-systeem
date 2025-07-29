const express = require("express")
const router = express.Router()
const vehicleController = require("../controllers/vehicle.controller")
const { verifyToken, isAdmin, isAdminOrInstructeur } = require("../middleware/authJwt")

// Apply verifyToken to all routes
router.use(verifyToken)

// GET routes - accessible to all verified users
router.get("/", vehicleController.getAllVehicles)
router.get("/:id", vehicleController.getVehicleById)

// Special routes that should come before /:id to avoid conflicts
router.get("/maintenance/alerts", vehicleController.getMaintenanceAlerts)
router.get("/available/now", vehicleController.getAvailableVehicles)
router.get("/planning/:id", [isAdminOrInstructeur], vehicleController.getVehiclePlanning)

// POST routes - admin only
router.post("/", [isAdmin], vehicleController.createVehicle)

// PUT routes - admin only (instructeurs might update mileage in future)
router.put("/:id", [isAdmin], vehicleController.updateVehicle)
router.put("/:id/maintenance", [isAdmin], vehicleController.updateVehicleMaintenance)
router.put("/:id/status", [isAdminOrInstructeur], vehicleController.updateVehicleStatus)

// DELETE routes - admin only
router.delete("/:id", [isAdmin], vehicleController.deleteVehicle)

// Maintenance and inspection routes
router.post("/:id/maintenance", [isAdmin], vehicleController.addMaintenanceRecord)
router.get("/:id/maintenance/history", [isAdminOrInstructeur], vehicleController.getMaintenanceHistory)

module.exports = router