const mongoose = require('mongoose');

// Esquema flexible para leer documentos existentes de sample_mflix.theaters
const theaterSchema = new mongoose.Schema({}, {
    strict: false,
    versionKey: false,
});

module.exports = mongoose.model('Theater', theaterSchema, 'theaters');
