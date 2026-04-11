# Valkiric Frontend

Frontend de Valkiric construido con Angular 19 standalone.

## Stack

- Angular 19
- SCSS
- Router standalone
- HttpClient + interceptors

## Requisitos

- Node.js 20 o superior
- npm 9 o superior

## Desarrollo local

```bash
npm install
npm start
```

App local: `http://localhost:4200`

## Build de producción

```bash
npm run build:prod
```

Salida: `dist/valkiric`

## Configuración de API

Desarrollo:

- `src/environments/environment.ts`

Producción:

- `src/environments/environment.prod.ts`

Antes de desplegar, ajusta `apiUrl` al dominio del backend en Railway.

## Deploy recomendado

### Vercel

- Root directory: `frontend/`
- Build command: `npm run build:prod`
- Output directory: `dist/valkiric`

El archivo `vercel.json` ya está preparado para SPA routing.

## Seguridad

- No subas `.env` ni archivos locales de entorno
- No guardes secretos del backend en este repositorio
- `environment.prod.ts` solo debe contener URLs públicas, no credenciales
