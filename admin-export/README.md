# Sun Glass — Admin Panel (standalone)

Panel de administración standalone listo para desplegar en **Railway**.

## Stack
- **Backend**: Node.js 20 + Express + Drizzle ORM (PostgreSQL)
- **Frontend**: React 19 + Vite (servido estáticamente desde el backend)
- **Auth**: JWT (7 días)

---

## Despliegue en Railway

### 1. Crear el proyecto
1. Entrá a [railway.app](https://railway.app) y creá un nuevo proyecto.
2. Elegí **"Deploy from GitHub repo"** (o subí el ZIP descomprimido a un repo).

### 2. Agregar la base de datos
1. En tu proyecto Railway, hacé clic en **"New Service → Database → PostgreSQL"**.
2. Railway va a inyectar `DATABASE_URL` automáticamente.

### 3. Configurar variables de entorno
En **Settings → Variables** del servicio Node.js, agregá:

| Variable     | Valor                            |
|--------------|----------------------------------|
| `JWT_SECRET` | una cadena larga y aleatoria     |
| `NODE_ENV`   | `production`                     |

> `PORT` y `DATABASE_URL` Railway los inyecta automáticamente — no hace falta agregarlos.

### 4. Comandos de build y start
Railway los detecta del `package.json`, pero si querés configurarlos manualmente:
- **Build command**: `npm install && npm run build`
- **Start command**: `npm start`

### 5. ¡Listo!
Una vez desplegado vas a tener:
- `https://tu-app.railway.app/` — Panel de login admin
- `https://tu-app.railway.app/api/` — API REST

---

## Credenciales por defecto
```
Email:      admin@tienda.com
Contraseña: fiamayjorge
```
El admin se crea automáticamente en el primer arranque. Podés cambiar la contraseña directamente en la base de datos.

---

## Variables de entorno (.env local)
Copiá `.env.example` a `.env` para desarrollo local:
```bash
cp .env.example .env
# Editá DATABASE_URL con tu Postgres local o Railway
```

## Desarrollo local
```bash
npm install
npm run dev        # Inicia solo el backend en modo watch
# Abrí otra terminal:
cd frontend
npx vite           # Inicia el frontend en modo dev (proxy → :3000)
```
