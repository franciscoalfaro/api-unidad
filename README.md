# 📘 API Unidad

API Unidad es una aplicación backend para la gestión de usuarios, archivos y directorios, construida con Node.js, Express y MongoDB (Mongoose).  
Está desplegada en AWS y soporta autenticación, subida de archivos, y operaciones CRUD para usuarios y directorios.

## 🧰 Tecnologías

- Node.js + Express
- MongoDB con Mongoose
- dotenv para variables de entorno
- JWT para autenticación (checkAuth)
- Multer para subida de archivos
- Middlewares y rutas organizadas por responsabilidad
- CORS configurado para orígenes permitidos
- Despliegue en AWS

## 🚀 Funcionalidades

- Registro y login de usuarios, recuperación de contraseña
- Perfil de usuario con actualización
- Subida, listado, descarga, reproducción y gestión de archivos
- Gestión de directorios (crear, listar, eliminar)
- Variables de entorno para configuración
- Despliegue en AWS

## 🛠️ Instalación y ejecución local

Clona el repositorio:

```bash
git clone https://github.com/franciscoalfaro/api-unidad.git
cd api-unidad
```

Instala dependencias:

```bash
npm install
```

Crea un archivo `.env` en la raíz del proyecto usando como base el archivo `.env.example`.

Inicia el servidor:

```bash
npm run dev   # modo desarrollo
npm start     # producción
```

## 📂 Estructura de carpetas
```
api-unidad/
├── controllers/       # Controladores de usuarios, archivos y directorios
├── routes/            # Rutas de usuario, archivo y directorio
├── services/          # Lógica de negocio
├── models/            # Modelos de MongoDB
├── middlewares/       # checkAuth, subida de archivos, etc.
├── helpers/           # Funciones auxiliares
├── uploads/           # Archivos subidos
├── .env               # Variables de entorno locales
├── .env.example       # Ejemplo de variables de entorno
├── unidad.js          # Punto de entrada
└── package.json
```

## 🔍 Endpoints

### Usuario (`/api/user`)
| Método | Ruta         | Descripción                   | Body / Parámetros                 |
|--------|-------------|-------------------------------|----------------------------------|
| POST   | /register   | Registrar un nuevo usuario     | {name, email, password}          |
| POST   | /login      | Login de usuario              | {email, password}                |
| POST   | /recovery   | Recuperar contraseña          | {email}                          |
| GET    | /profile/:id| Obtener perfil de usuario     | id en params (JWT requerido)     |
| PUT    | /update     | Actualizar perfil de usuario  | {name?, email?, password?} (JWT requerido) |

### Archivos (`/api/file`)
| Método | Ruta                  | Descripción                     | Body / Parámetros                     |
|--------|---------------------|---------------------------------|--------------------------------------|
| POST   | /uploads/:folderId   | Subir archivos a carpeta        | Form-data: files (JWT requerido)     |
| DELETE | /delete/:fileId      | Borrar archivo por ID           | fileId en params (JWT requerido)     |
| GET    | /files/:folderId/:page?| Listar archivos de una carpeta | folderId en params                    |
| GET    | /allfiles            | Listar todos los archivos       | — (JWT requerido)                     |
| GET    | /download/:fileId    | Descargar archivo               | fileId en params                      |
| PUT    | /update/:fileId      | Actualizar archivo              | {name?, description?} (JWT requerido)|


### Directorios (`/api/directory`)
| Método | Ruta              | Descripción                     | Body / Parámetros                 |
|--------|-----------------|---------------------------------|----------------------------------|
| POST   | /create          | Crear nueva carpeta             | {name, parentId?} (JWT requerido)|
| GET    | /list/:page?     | Listar carpetas paginadas       | page opcional                     |
| GET    | /listAll/:page?  | Listar todas las carpetas       | page opcional                     |
| DELETE | /delete/:directoryId | Eliminar carpeta por ID      | directoryId en params             |

## 🌐 Despliegue en AWS

La API está desplegada en AWS.  
👉 URL de producción: https://franalfaro.ddns.net/api-unidad

## ⏭️ Roadmap / Futuras mejoras

- Roles y permisos de usuario
- Validaciones avanzadas
- Documentación con Swagger / OpenAPI
- Paginación y filtros en archivos y directorios
- Tests unitarios con Jest / Supertest

## 🧑‍💻 Autor

Francisco Alfaro  
GitHub: [franciscoalfaro](https://github.com/franciscoalfaro)  
Email: contacto@franciscoalfaro.cl

## 📝 Licencia

Este proyecto está bajo la licencia MIT.


---

## 📂 .env.example

```env
# Servidor
PORT=3000              # Puerto a eleccion

# Base de datos MongoDB
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/agenda

# Seguridad
JWT_SECRET=tu_secreto_jwt

# (Opcional) Configuración AWS / Logs
AWS_REGION=us-east-1
```
