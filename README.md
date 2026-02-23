# Portal Reembolsos Pacífico Demo

Demo web app para el preregistro de reembolsos (Paso 1: carga y validación de documentos).

## Requisitos
- Node.js 18+
- npm

## Instalación
```bash
npm install
```

## Desarrollo
```bash
npm run dev
```

## Deploy en AWS Amplify
1. Conecta este repositorio en Amplify Hosting.
2. Amplify detectará `amplify.yml` y usará `npm ci` + `npm run build`.
3. En Amplify Hosting, agrega una regla de rewrite para SPA:
   - Source: `/<*>`
   - Target: `/index.html`
   - Status: `200`

## Credenciales de éxito (demo)
- Número de póliza: `POL-12345`
- Fecha de nacimiento: `1989-05-10`
