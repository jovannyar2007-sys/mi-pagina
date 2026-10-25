// Define el endpoint para consultar peliculas.
const express = require('express');
const { obtenerPeliculas } = require('../controllers/movieController');

const router = express.Router();

router.get('/movies', obtenerPeliculas);

module.exports = router;
