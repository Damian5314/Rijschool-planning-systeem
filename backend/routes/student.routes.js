const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');

router.get('/studenten', studentController.getStudenten);
router.post('/studenten', studentController.createStudent);

module.exports = router;