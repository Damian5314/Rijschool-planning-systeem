const express = require("express")
const router = express.Router()
const studentController = require("../controllers/student.controller")
const { verifyToken, isAdmin, isInstructeur, isAdminOrInstructeur } = require("../middleware/authJwt")
const { validateCreateStudent, validateUpdateStudent, validateId, validateTransaction } = require("../middleware/validation")
const { sanitizeStudentData, sanitizeTransactionData } = require("../middleware/sanitization")

// Apply verifyToken to all routes
router.use(verifyToken)

// GET routes - accessible to all verified users
router.get("/", studentController.getAllStudents)
router.get("/:id", validateId, studentController.getStudentById)

// Student specific routes
router.get("/:id/lessen", validateId, studentController.getStudentLessons)
router.get("/:id/financieel", [isAdminOrInstructeur], validateId, studentController.getStudentFinancieel)
router.get("/:id/examens", validateId, studentController.getStudentExamens)

// POST routes - admin only for creating students
router.post("/", [isAdmin], validateCreateStudent, sanitizeStudentData, studentController.createStudent)

// PUT routes - admin/instructeur can update students
router.put("/:id", [isAdminOrInstructeur], validateUpdateStudent, sanitizeStudentData, studentController.updateStudent)

// DELETE routes - admin only
router.delete("/:id", [isAdmin], validateId, studentController.deleteStudent)

// Financial transaction routes - admin only
router.post("/:id/transactie", [isAdmin], validateTransaction, sanitizeTransactionData, studentController.addTransaction)

module.exports = router