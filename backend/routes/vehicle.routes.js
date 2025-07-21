const express = require("express")
const router = express.Router()
const vehicleController = require("../controllers/vehicle.controller")
const { verifyToken, isAdmin } = require("../middleware/authJwt")

router.get("/", [verifyToken], vehicleController.getAllVehicles)
router.get("/:id", [verifyToken], vehicleController.getVehicleById)
router.post("/", [verifyToken, isAdmin], vehicleController.createVehicle)
router.put("/:id", [verifyToken, isAdmin], vehicleController.updateVehicle)
router.delete("/:id", [verifyToken, isAdmin], vehicleController.deleteVehicle)

module.exports = router
