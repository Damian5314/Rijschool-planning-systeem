const express = require("express")
const router = express.Router()
const studentController = require("../controllers/student.controller")
const { verifyToken } = require("../middleware/authJwt") // Assuming you want to protect these routes

// Apply verifyToken middleware to all student routes if needed
// router.use(verifyToken);

router.get("/", studentController.getAllStudents)
router.get("/:id", studentController.getStudentById)
router.post("/", studentController.createStudent)
router.put("/:id", studentController.updateStudent)
router.delete("/:id", studentController.deleteStudent)

module.exports = router
