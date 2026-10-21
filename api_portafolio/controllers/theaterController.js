const Theater = require('../models/Theater');

// Devuelve hasta 50 cines ordenados por identificador
async function obtenerCines(req, res) {
    try {
        const theaters = await Theater.find()
            .sort({ theaterId: 1 })
            .limit(50)
            .lean();

        res.json(theaters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { obtenerCines };
