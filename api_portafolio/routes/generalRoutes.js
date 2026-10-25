// Agrupa rutas sencillas de saludo, PIN y guardado de productos.
const express = require('express');
const {
    saludo,
    pin,
    guardarProducto,
} = require('../controllers/generalController');

const router = express.Router();

router.get('/saludo', saludo);
router.get('/pin', pin);
router.post('/guardar', guardarProducto);

module.exports = router;
