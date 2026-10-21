const Comment = require('../models/Comment');

// Devuelve hasta 50 comentarios, sin incluir direcciones de correo
async function obtenerComentarios(req, res) {
    try {
        const comments = await Comment.find()
            .select('-email')
            .sort({ date: -1 })
            .limit(50)
            .lean();

        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { obtenerComentarios };
