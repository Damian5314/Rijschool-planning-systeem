const express = require("express")
const router = express.Router()
const lesController = require("../controllers/les.controller")
const { verifyToken, isAdmin, isAdminOrInstructeur } = require("../middleware/authJwt")

// Apply verifyToken to all routes
router.use(verifyToken)

// GET routes - accessible to all verified users
router.get("/", lesController.getAllLessen)
router.get("/:id", lesController.getLesById)

// Special GET routes for planning and scheduling
router.get("/planning/today", lesController.getTodayLessons)
router.get("/planning/week", lesController.getWeekLessons)
router.get("/planning/month", lesController.getMonthLessons)
router.get("/conflicts/check", [isAdminOrInstructeur], lesController.checkConflicts)

// POST routes - admin or instructeur can create lessons
router.post("/", [isAdminOrInstructeur], lesController.createLes)

// PUT routes - admin or instructeur can update lessons
router.put("/:id", [isAdminOrInstructeur], lesController.updateLes)
router.put("/:id/status", [isAdminOrInstructeur], lesController.updateLesStatus)

// DELETE routes - admin only (instructeurs might cancel, but not delete)
router.delete("/:id", [isAdmin], lesController.deleteLes)

// Bulk operations - admin only
router.post("/bulk/create", [isAdmin], lesController.createBulkLessons)
router.put("/bulk/update", [isAdmin], lesController.updateBulkLessons)
router.delete("/bulk/delete", [isAdmin], lesController.deleteBulkLessons)

module.exports = router