# Portafolio web

El repositorio contiene dos aplicaciones independientes:

- `api_portafolio/`: API Express y persistencia MongoDB.
- `portafolio_frontend/`: interfaz React + Vite.

## Desarrollo local

1. Copia `api_portafolio/.env.example` a `api_portafolio/.env` y configura
   `MONGODB_URL`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
2. Instala dependencias desde `api_portafolio` y `portafolio_frontend` con
   `npm install`.
3. Inicia la API con `npm run dev` desde `api_portafolio`.
4. En otra terminal, inicia Vite con `npm run dev` desde
   `portafolio_frontend`.
5. Abre <http://localhost:5173>. Vite redirige `/api` al backend local.

También se puede ejecutar `npm run dev` desde la raíz para iniciar ambos
servicios.

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
