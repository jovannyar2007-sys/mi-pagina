const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const usuarioPublico = (user) => ({
    _id: user._id,
    nombre: user.nombre ?? user.name,
    email: user.email,
    createdAt: user.createdAt,
});

// Crea un usuario en la colección users
async function crearUsuario(req, res) {
    try {
        const nombre = req.body.nombre ?? req.body.name;
        const email = typeof req.body.email === 'string'
            ? req.body.email.trim().toLowerCase()
            : '';
        const { password } = req.body;

        if (typeof nombre !== 'string' || !nombre.trim() ||
            !email || typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({
                error: 'Debes enviar nombre, correo electrónico y una contraseña de al menos 8 caracteres',
            });
        }

        const existingUser = await User.findOne({ email }).select('_id');
        if (existingUser) {
            return res.status(409).json({
                error: 'Ya existe una cuenta con ese correo electrónico',
            });
        }

        const newUser = await User.create({
            nombre: nombre.trim(),
            email,
            password: await bcrypt.hash(password, 10),
        });

        res.status(201).json(usuarioPublico(newUser));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function iniciarSesion(req, res) {
    const email = typeof req.body.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';
    const { password } = req.body;

    if (!email || typeof password !== 'string' || !password) {
        return res.status(400).json({
            error: 'Debes enviar correo electrónico y contraseña',
        });
    }

    try {
        const user = await User.findOne({ email });
        const passwordMatches = user && await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({
                error: 'El correo electrónico o la contraseña son incorrectos',
            });
        }

        res.json(usuarioPublico(user));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Devuelve todos los usuarios sin exponer sus contraseñas
async function obtenerUsuarios(req, res) {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Busca un usuario por su ID de MongoDB
async function obtenerUsuarioPorId(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'El ID no tiene un formato válido' });
    }

    try {
        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'No se encontró el usuario' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    crearUsuario,
    iniciarSesion,
    obtenerUsuarios,
    obtenerUsuarioPorId,
};
