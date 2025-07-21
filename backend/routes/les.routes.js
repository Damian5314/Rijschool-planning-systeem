const express = require("express")
const router = express.Router()
const lesController = require("../controllers/les.controller")
const { verifyToken } = require("../middleware/authJwt") // Assuming you want to protect these routes

// Apply verifyToken middleware to all lesson routes if needed
// router.use(verifyToken);

router.get("/", lesController.getAllLessen)
router.get("/:id", lesController.getLesById)
router.post("/", lesController.createLes)
router.put("/:id", lesController.updateLes)
router.delete("/:id", lesController.deleteLes)

module.exports = router
