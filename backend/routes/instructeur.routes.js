const express = require("express")
const router = express.Router()
const instructeurController = require("../controllers/instructeur.controller")
const { verifyToken } = require("../middleware/authJwt") // Assuming you want to protect these routes

// Apply verifyToken middleware to all instructor routes if needed
// router.use(verifyToken);

router.get("/", instructeurController.getAllInstructeurs)
router.get("/:id", instructeurController.getInstructeurById)
router.post("/", instructeurController.createInstructeur)
router.put("/:id", instructeurController.updateInstructeur)
router.delete("/:id", instructeurController.deleteInstructeur)

module.exports = router
