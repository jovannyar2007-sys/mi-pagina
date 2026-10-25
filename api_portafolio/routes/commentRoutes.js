// Asocia la ruta de comentarios con su controlador.
const express = require('express');
const { obtenerComentarios } = require('../controllers/commentController');

const router = express.Router();

router.get('/comments', obtenerComentarios);

module.exports = router;
