// Define los campos y reglas de validacion de los proyectos en MongoDB.
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: (tags) => tags.length <= 10 && tags.every((tag) => tag.length <= 30),
            message: 'Cada proyecto puede tener hasta 10 etiquetas de 30 caracteres.',
        },
    },
    url: {
        type: String,
        trim: true,
        default: '',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('PortfolioProject', projectSchema, 'portfolio_projects');
