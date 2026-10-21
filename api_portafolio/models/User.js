const mongoose = require('mongoose'); // Importa Mongoose para definir el esquema de la base de datos

// Define la estructura de datos que tendrá cada usuario en la base de datos
const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String, // El campo nombre será de tipo texto
        required: true, // Debe ser obligatorio
        trim: true, // Elimina espacios al inicio y final
    },
    password: {
        type: String, // El campo password será de tipo texto
        required: true, // Debe ser obligatorio
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    token:{
        type: String,
        default: null,
    }
}, {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
    strict: false, // Conserva campos que ya existen en documentos de la colección
});

// Usa explícitamente la colección 'users' en la base de datos configurada
module.exports = mongoose.model('Usuario', usuarioSchema, 'users');