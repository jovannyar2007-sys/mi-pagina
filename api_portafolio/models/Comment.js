const mongoose = require('mongoose');

// Esquema flexible para leer los documentos existentes de sample_mflix.comments
const commentSchema = new mongoose.Schema({}, {
    strict: false,
    versionKey: false,
});

// Usa explícitamente la colección existente 'comments'
module.exports = mongoose.model('Comment', commentSchema, 'comments');
