// Responde con un mensaje de prueba
function saludo(req, res) {
    res.send('hola, backend! el servidor esta al tiro');
}

// Responde con otra ruta sencilla de prueba
function pin(req, res) {
    res.send('pon');
}

// Almacena productos temporalmente mientras el servidor sigue encendido
const productos = [];

function guardarProducto(req, res) {
    productos.push(req.body);
    res.status(201).json({
        status: 'success',
        message: 'Producto guardado correctamente',
    });
}

module.exports = {
    saludo,
    pin,
    guardarProducto,
};
