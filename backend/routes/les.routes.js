const express = require('express');
const router = express.Router();
const lesController = require('../controllers/les.controller');

router.get('/lessen', lesController.getLessen);
router.get('/lessen/:id', lesController.getLesById);
router.post('/lessen', lesController.createLes);
router.put('/lessen/:id', lesController.updateLes);
router.delete('/lessen/:id', lesController.deleteLes);

module.exports = router;