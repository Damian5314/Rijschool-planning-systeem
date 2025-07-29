const express = require("express")
const router = express.Router()
const instructeurController = require("../controllers/instructeur.controller")
const { verifyToken, isAdmin, isInstructeur, isAdminOrInstructeur } = require("../middleware/authJwt")

// Apply verifyToken to all routes
router.use(verifyToken)

// GET routes - accessible to all verified users
router.get("/", instructeurController.getAllInstructeurs)
router.get("/:id", instructeurController.getInstructeurById)

// Planning routes - instructeurs can view their own, admins can view all
router.get("/:id/planning", instructeurController.getInstructeurPlanning)
router.get("/:id/students", [isAdminOrInstructeur], instructeurController.getInstructeurStudents)
router.get("/:id/vehicles", [isAdminOrInstructeur], instructeurController.getInstructeurVehicles)

// POST routes - admin only
router.post("/", [isAdmin], instructeurController.createInstructeur)

// PUT routes - admin only (instructeurs could update their own profile in future)
router.put("/:id", [isAdmin], instructeurController.updateInstructeur)

// DELETE routes - admin only
router.delete("/:id", [isAdmin], instructeurController.deleteInstructeur)

// Statistics route for instructeurs
router.get("/:id/stats", [isAdminOrInstructeur], instructeurController.getInstructeurStats)

module.exports = router