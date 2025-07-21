const express = require("express")
const router = express.Router()
const lesController = require("../controllers/les.controller")
const { verifyToken, isAdmin } = require("../middleware/authJwt")

router.get("/", [verifyToken], lesController.getAllLessen)
router.get("/:id", [verifyToken], lesController.getLesById)
router.post("/", [verifyToken, isAdmin], lesController.createLes)
router.put("/:id", [verifyToken, isAdmin], lesController.updateLes)
router.delete("/:id", [verifyToken, isAdmin], lesController.deleteLes)

module.exports = router
