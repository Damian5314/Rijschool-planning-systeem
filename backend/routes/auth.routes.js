const express = require("express")
const router = express.Router()
const authController = require("../controllers/auth.controller")
const { verifyToken } = require("../middleware/authJwt")

// Public routes - no authentication required
router.post("/signup", authController.signup)
router.post("/signin", authController.signin)

// Protected routes - authentication required
router.get("/profile", [verifyToken], authController.getProfile)
router.post("/change-password", [verifyToken], authController.changePassword)
router.post("/logout", [verifyToken], (req, res) => {
  // Client-side logout (JWT is stateless)
  res.json({
    success: true,
    message: "Succesvol uitgelogd! Verwijder het token client-side."
  })
})

module.exports = router