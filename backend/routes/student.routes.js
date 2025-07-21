const express = require("express")
const router = express.Router()
const studentController = require("../controllers/student.controller")
const { verifyToken, isAdmin } = require("../middleware/authJwt")

// Apply verifyToken to all routes, isAdmin to specific ones
router.get("/", [verifyToken], studentController.getAllStudents)
router.get("/:id", [verifyToken], studentController.getStudentById)
router.post("/", [verifyToken, isAdmin], studentController.createStudent)
router.put("/:id", [verifyToken, isAdmin], studentController.updateStudent)
router.delete("/:id", [verifyToken, isAdmin], studentController.deleteStudent)

module.exports = router
