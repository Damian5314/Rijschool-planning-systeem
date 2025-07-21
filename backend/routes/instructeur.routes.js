const express = require("express")
const router = express.Router()
const instructeurController = require("../controllers/instructeur.controller")
const { verifyToken, isAdmin } = require("../middleware/authJwt")

// Apply verifyToken to all routes, isAdmin to specific ones
router.get("/", [verifyToken], instructeurController.getAllInstructeurs)
router.get("/:id", [verifyToken], instructeurController.getInstructeurById)
router.post("/", [verifyToken, isAdmin], instructeurController.createInstructeur)
router.put("/:id", [verifyToken, isAdmin], instructeurController.updateInstructeur)
router.delete("/:id", [verifyToken, isAdmin], instructeurController.deleteInstructeur)

module.exports = router
