const express = require('express');
const { obtenerCines } = require('../controllers/theaterController');

const router = express.Router();

router.get('/theaters', obtenerCines);

module.exports = router;
