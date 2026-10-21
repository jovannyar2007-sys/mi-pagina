# Portafolio frontend

Interfaz React + Vite del portafolio profesional. Consulta el
[README principal](../README.md) para instalación y despliegue.

## Scripts

- `npm run dev`: inicia Vite en <http://localhost:5173>.
- `npm run build`: genera el sitio estático en `dist`.
- `npm run lint`: valida el código del frontend.

En local, Vite redirige las solicitudes `/api` a
`http://127.0.0.1:3000`. Para conectarse directamente a una API remota, define
`VITE_API_URL` con el origen del backend, sin `/api` al final.

El inicio de sesión de administración usa una cookie `HttpOnly`. En producción
la API requiere el origen de Vercel en su variable `FRONTEND_URL` y configura la
cookie como `SameSite=None; Secure` para las solicitudes entre dominios.
