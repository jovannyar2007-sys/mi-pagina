const Movie = require('../models/Movie');

// Devuelve hasta 50 películas ordenadas por título
async function obtenerPeliculas(req, res) {
    try {
        const movies = await Movie.find()
            .sort({ title: 1 })
            .limit(50)
            .lean();

        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { obtenerPeliculas };
