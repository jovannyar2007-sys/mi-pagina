const mongoose = require('mongoose');

// Esquema flexible para leer documentos existentes de sample_mflix.movies
const movieSchema = new mongoose.Schema({}, {
    strict: false,
    versionKey: false,
});

module.exports = mongoose.model('Movie', movieSchema, 'movies');
