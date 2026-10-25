// Ensambla las rutas Express generales bajo el prefijo /api.
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const generalRoutes = require('./routes/generalRoutes');
const commentRoutes = require('./routes/commentRoutes');
const movieRoutes = require('./routes/movieRoutes');
const theaterRoutes = require('./routes/theaterRoutes');

const app = express();

app.use(express.json()); // Permite recibir datos en formato JSON
app.use('/api', userRoutes);
app.use('/api', generalRoutes);
app.use('/api', commentRoutes);
app.use('/api', movieRoutes);
app.use('/api', theaterRoutes);

module.exports = app;
