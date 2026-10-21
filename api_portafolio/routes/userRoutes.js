const express = require('express');
const {
    crearUsuario,
    iniciarSesion,
    obtenerUsuarios,
    obtenerUsuarioPorId,
} = require('../controllers/userController');

const router = express.Router();

router.post('/usuarios', crearUsuario);
router.post('/users', crearUsuario);
router.post('/login', iniciarSesion);
router.get('/users', obtenerUsuarios);
router.get('/users/:id', obtenerUsuarioPorId);

module.exports = router;
