# Portafolio web

El repositorio contiene dos aplicaciones independientes:

- `api_portafolio/`: API Express y persistencia MongoDB.
- `portafolio_frontend/`: interfaz React + Vite.

## Desarrollo local

Requisitos: Node.js 20.19 o superior y una base de datos MongoDB accesible.

1. Desde la raíz del repositorio, crea o abre el archivo local de configuración
   de la API:

   ```powershell
   notepad api_portafolio\.env
   ```

2. Añade las variables siguientes y reemplaza los valores de ejemplo. No
   compartas ni subas este archivo:

   ```env
   MONGODB_URL=<URI de conexión de MongoDB>
   ADMIN_EMAIL=<correo del administrador>
   ADMIN_PASSWORD=<contraseña segura>
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   PORT=3000
   ```

   Para desarrollo local, deja `VITE_API_URL` sin configurar o vacío para que
   Vite use el proxy local. El archivo
   `portafolio_frontend/.env.example` muestra la URL de la API publicada.
3. Instala las dependencias de ambos servicios (solo la primera vez o cuando
   cambien sus archivos de dependencias):

   ```powershell
   npm ci --prefix api_portafolio
   npm ci --prefix portafolio_frontend
   ```

4. Desde la raíz, inicia ambos servicios juntos:

   ```powershell
   npm run dev
   ```

5. Abre <http://localhost:5173>. En desarrollo, deja `VITE_API_URL` vacío en
   `portafolio_frontend/.env` si creas ese archivo; Vite redirige las
   solicitudes `/api` al backend local en el puerto 3000. La API también ofrece
   el chequeo de estado en <http://localhost:3000/healthz>.

## Despliegue del backend en Render

- Crea un Web Service con `api_portafolio` como **Root Directory**.
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/healthz`
- Configura `MONGODB_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y
  `FRONTEND_URL` como variables de entorno. `FRONTEND_URL` debe ser el origen
  publicado de Vercel, sin una ruta (por ejemplo, `https://mi-sitio.vercel.app`).
- Render define `PORT`; el servidor lo usa automáticamente.

## Despliegue del frontend en Vercel

- Importa el mismo repositorio y establece `portafolio_frontend` como
  **Root Directory**.
- Framework preset: Vite; Build command: `npm run build`; Output directory:
  `dist`.
- Configura `VITE_API_URL` con el origen público del servicio Render, sin
  `/api` al final (por ejemplo, `https://mi-api.onrender.com`).
- Tras cambiar el dominio de Vercel, actualiza `FRONTEND_URL` en Render.

## Operaciones MongoDB de usuarios

- `GET /api/users` (o `/api/usuarios`) lista usuarios sin incluir contraseñas.
- `POST /api/users` crea un usuario con `nombre`, `email` y `password`.
- `POST /api/login` autentica un usuario existente.
- `DELETE /api/users/:id` (o `/api/usuarios/:id`) elimina un usuario por su ID.

El login de administración de proyectos es independiente de las cuentas de
usuario y usa `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
