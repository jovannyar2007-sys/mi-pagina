const mongoose = require('mongoose');

// Conecta la aplicación con la base indicada en MONGODB_URL
async function connectDB() {
    if (!process.env.MONGODB_URL) {
        throw new Error('Falta definir MONGODB_URL en el archivo .env');
    }

    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Conexión a MongoDB exitosa');
}

module.exports = connectDB;
