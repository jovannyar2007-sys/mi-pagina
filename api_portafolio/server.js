// Importa las herramientas del servidor, la conexión a MongoDB y los modelos.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const bcrypt = require('bcrypt');
const { randomBytes, timingSafeEqual } = require('node:crypto');
require('dotenv').config();

const User = require('./models/User');
const Comment = require('./models/Comment');
const Movie = require('./models/Movie');
const Theater = require('./models/Theater');
const Project = require('./models/Project');

// Crea la aplicación, define el puerto y una lista temporal de productos.
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const productos = [];
const adminSessions = new Map();
const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const ADMIN_SESSION_COOKIE = 'admin_session';
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// Prepara los datos públicos del usuario, sin incluir su contraseña.
const usuarioPublico = (user) => ({
    _id: user._id,
    nombre: user.nombre ?? user.name,
    email: user.email,
    createdAt: user.createdAt,
});

function configuracionAdmin() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        return null;
    }

    return { email, password };
}

function compararCredenciales(ingresada, configurada) {
    const ingresadaBuffer = Buffer.from(ingresada);
    const configuradaBuffer = Buffer.from(configurada);

    return ingresadaBuffer.length === configuradaBuffer.length &&
        timingSafeEqual(ingresadaBuffer, configuradaBuffer);
}

function establecerCookieSesion(res, sessionId) {
    const attributes = [
        `${ADMIN_SESSION_COOKIE}=${sessionId}`,
        'Path=/api',
        'HttpOnly',
        `SameSite=${process.env.NODE_ENV === 'production' ? 'None' : 'Strict'}`,
        `Max-Age=${ADMIN_SESSION_TTL_MS / 1000}`,
    ];
    if (process.env.NODE_ENV === 'production') attributes.push('Secure');
    res.setHeader('Set-Cookie', attributes.join('; '));
}

function leerCookie(req, name) {
    const cookie = req.headers.cookie
        ?.split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`));

    return cookie ? cookie.slice(name.length + 1) : '';
}

function requiereAdmin(req, res, next) {
    const config = configuracionAdmin();

    if (!config) {
        return res.status(503).json({
            error: 'El administrador no está configurado. Revisa ADMIN_EMAIL y ADMIN_PASSWORD en el archivo .env.',
        });
    }

    const sessionId = leerCookie(req, ADMIN_SESSION_COOKIE);
    const session = adminSessions.get(sessionId);
    if (!session || session.expiresAt <= Date.now() || session.email !== config.email) {
        if (sessionId) adminSessions.delete(sessionId);
        return res.status(401).json({ error: 'La sesión de administrador no es válida o ha expirado.' });
    }

    session.expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
    next();
}

// Define qué origen web y qué métodos pueden comunicarse con esta API.
const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Activa lectura de JSON, CORS y protección contra parámetros maliciosos.
app.use(express.json());
app.use(cors(corsOptions));

app.use((req, res, next) => {
    mongoSanitize.sanitize(req.body);
    mongoSanitize.sanitize(req.params);
    mongoSanitize.sanitize(req.headers);

    if (mongoSanitize.has(req.query)) {
        return res.status(400).json({
            error: 'La consulta contiene parámetros no permitidos',
        });
    }

    next();
});

app.get('/healthz', (req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({
        status: connected ? 'ok' : 'unavailable',
        database: connected ? 'connected' : 'disconnected',
    });
});

// Valida los datos, evita correos repetidos, cifra la contraseña y crea la cuenta.
const crearUsuario = async (req, res) => {
    try {
        const nombre = req.body.nombre ?? req.body.name;
        const email = typeof req.body.email === 'string'
            ? req.body.email.trim().toLowerCase()
            : '';
        const { password } = req.body;

        if (typeof nombre !== 'string' || !nombre.trim() ||
            !email || typeof password !== 'string' || !password) {
            return res.status(400).json({
                error: 'Debes enviar nombre (o name), email y password',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 6 caracteres',
            });
        }

        const existingUser = await User.findOne({ email }).select('_id');
        if (existingUser) {
            return res.status(409).json({
                error: 'Ya existe una cuenta con ese correo electrónico',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 6);
        const newUser = await User.create({
            nombre: nombre.trim(),
            email,
            password: hashedPassword,
        });

        res.status(201).json(usuarioPublico(newUser));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Permite registrar usuarios con cualquiera de estas dos direcciones.
app.post(['/api/users', '/api/usuarios'], crearUsuario);

// Valida las credenciales de administrador configuradas en el entorno, sin consultar MongoDB.
app.post('/api/admin/login', async (req, res) => {
    const config = configuracionAdmin();
    if (!config) {
        return res.status(503).json({
            error: 'El administrador no está configurado. Revisa ADMIN_EMAIL y ADMIN_PASSWORD en el archivo .env.',
        });
    }

    const email = typeof req.body.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';
    const { password } = req.body;

    if (!email || typeof password !== 'string' || !password) {
        return res.status(400).json({ error: 'Debes enviar correo electrónico y contraseña.' });
    }

    if (email !== config.email || !compararCredenciales(password, config.password)) {
        return res.status(401).json({ error: 'El correo electrónico o la contraseña son incorrectos.' });
    }

    for (const [sessionId, session] of adminSessions) {
        if (session.expiresAt <= Date.now()) adminSessions.delete(sessionId);
    }

    const sessionId = randomBytes(32).toString('hex');
    adminSessions.set(sessionId, {
        email: config.email,
        expiresAt: Date.now() + ADMIN_SESSION_TTL_MS,
    });
    establecerCookieSesion(res, sessionId);
    res.json({ admin: { email: config.email } });
});

app.post('/api/admin/logout', (req, res) => {
    const sessionId = leerCookie(req, ADMIN_SESSION_COOKIE);
    if (sessionId) adminSessions.delete(sessionId);

    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    const sameSite = process.env.NODE_ENV === 'production' ? 'None' : 'Strict';
    res.setHeader(
        'Set-Cookie',
        `${ADMIN_SESSION_COOKIE}=; Path=/api; HttpOnly; SameSite=${sameSite}; Max-Age=0${secure}`
    );
    res.json({ message: 'Sesión cerrada.' });
});

// Muestra proyectos guardados en MongoDB al público.
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 }).lean();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Solo el administrador autenticado puede agregar proyectos persistentes.
app.post('/api/projects', requiereAdmin, async (req, res) => {
    const { title, description, tags = [], url = '' } = req.body;

    if (typeof title !== 'string' || !title.trim() ||
        typeof description !== 'string' || !description.trim() ||
        !Array.isArray(tags) ||
        !tags.every((tag) => typeof tag === 'string' && tag.trim()) ||
        typeof url !== 'string') {
        return res.status(400).json({
            error: 'Envía un nombre, una descripción, una lista de etiquetas válida y un enlace de texto.',
        });
    }

    if (url.trim()) {
        try {
            const parsedUrl = new URL(url);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                throw new Error('Protocolo no permitido');
            }
        } catch {
            return res.status(400).json({ error: 'El enlace debe ser una URL válida que comience con http o https.' });
        }
    }

    try {
        const project = await Project.create({
            title: title.trim(),
            description: description.trim(),
            tags: tags.map((tag) => tag.trim()),
            url: url.trim(),
        });
        res.status(201).json(project);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/projects/:id', requiereAdmin, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'El ID del proyecto no tiene un formato válido.' });
    }

    try {
        const project = await Project.findByIdAndDelete(id);
        if (!project) {
            return res.status(404).json({ error: 'No se encontró el proyecto.' });
        }

        res.json({ message: 'Proyecto eliminado correctamente.', id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Comprueba el correo y la contraseña para iniciar sesión.
app.post('/api/login', async (req, res) => {
    const email = typeof req.body.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';
    const { password } = req.body;

    if (!email || typeof password !== 'string' || !password) {
        return res.status(400).json({
            error: 'Debes enviar correo electrónico y contraseña',
        });
    }

    try {
        const user = await User.findOne({ email });
        const passwordMatches = user && await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({
                error: 'El correo electrónico o la contraseña son incorrectos',
            });
        }

        res.json(usuarioPublico(user));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Devuelve todos los usuarios, ocultando sus contraseñas.
app.get(['/api/users', '/api/usuarios'], async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Busca un usuario por su ID y devuelve un error si el ID no es válido o no existe.
app.get('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'El ID no tiene un formato válido' });
    }

    try {
        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'No se encontró el usuario' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualiza los campos enviados para un usuario y devuelve el registro actualizado.
app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'El ID no tiene un formato válido' });
    }

    try {
        const user = await User.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        }).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'No se encontró el usuario' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Elimina un usuario por su ID.
app.delete(['/api/users/:id', '/api/usuarios/:id'], async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'El ID no tiene un formato válido' });
    }

    try {
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ error: 'No se encontró el usuario' });
        }

        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Devuelve hasta 20 comentarios recientes, sin mostrar el correo asociado.
app.get('/api/comentarios', async (req, res) => {
    try {
        const comments = await Comment.find()
            .select('-email')
            .sort({ date: -1 })
            .limit(20)
            .lean();

        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Devuelve hasta 10 películas, ordenadas alfabéticamente por título.
app.get('/api/peliculas', async (req, res) => {
    try {
        const movies = await Movie.find()
            .sort({ title: 1 })
            .limit(10)
            .lean();

        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Devuelve hasta 10 cines, ordenados por identificador.
app.get('/api/cines', async (req, res) => {
    try {
        const theaters = await Theater.find()
            .sort({ theaterId: 1 })
            .limit(10)
            .lean();

        res.json(theaters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Configura los modelos, el orden y el límite usados por la ruta de catálogo.
const catalogos = {
    peliculas: {
        model: Movie,
        sort: { title: 1, _id: 1 },
        limit: 10,
    },
    cines: {
        model: Theater,
        sort: { theaterId: 1, _id: 1 },
        limit: 10,
    },
    comentarios: {
        model: Comment,
        sort: { date: -1, _id: 1 },
        projection: '-email',
        limit: 20,
    },
};

// Consulta películas, cines o comentarios con paginación según el tipo solicitado.
app.get('/api/catalogo/:tipo', async (req, res) => {
    if (!Object.prototype.hasOwnProperty.call(catalogos, req.params.tipo)) {
        return res.status(404).json({ error: 'La colección solicitada no está disponible' });
    }

    const catalog = catalogos[req.params.tipo];

    const page = Number(req.query.page ?? 1);
    const limit = catalog.limit;

    if (!Number.isInteger(page) || page < 1) {
        return res.status(400).json({ error: 'El número de página no es válido' });
    }

    try {
        const [items, total] = await Promise.all([
            catalog.model.find()
                .select(catalog.projection || '')
                .sort(catalog.sort)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            catalog.model.countDocuments(),
        ]);

        res.json({
            items,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rutas sencillas de prueba para comprobar que la API responde.
app.get('/api/saludo', (req, res) => {
    res.send('hola, backend! el servidor esta al tiro');
});

app.get('/api/pin', (req, res) => {
    res.send('pon');
});

// Guarda productos solo en memoria; no los persiste en MongoDB.
app.post('/api/guardar', (req, res) => {
    productos.push(req.body);
    res.status(201).json({
        status: 'success',
        message: 'Producto guardado correctamente',
    });
});

// Responde con un mensaje claro cuando el cliente envía un JSON mal formado.
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
            error: 'El cuerpo no contiene JSON válido. En Thunder Client selecciona Body > JSON y envía un objeto JSON.',
        });
    }

    next(error);
});

// Conecta con MongoDB y, si la conexión funciona, pone el servidor a escuchar.
async function iniciarServidor() {
    if (!process.env.MONGODB_URL) {
        throw new Error('Falta definir MONGODB_URL en el archivo .env');
    }

    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Conexión a MongoDB exitosa');

    app.listen(PORT, () => {
        console.log(`servidor corriendo en http://localhost:${PORT}`);
    });
}

// Informa los errores que impidan iniciar el servidor.
iniciarServidor().catch((error) => {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exitCode = 1;
});
