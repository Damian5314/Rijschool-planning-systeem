const express = require('express');
const router = express.Router();
const instructeurController = require('../controllers/instructeur.controller');

router.get('/instructeurs', instructeurController.getInstructeurs);
router.get('/instructeurs/:id', instructeurController.getInstructeurById);
router.post('/instructeurs', instructeurController.createInstructeur);
router.put('/instructeurs/:id', instructeurController.updateInstructeur);
router.delete('/instructeurs/:id', instructeurController.deleteInstructeur);

module.exports = router;