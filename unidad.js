// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import directoryRoutes from './routes/directoryRoutes.js';
import { connection } from './bd/conexion.js';
import path from 'path';
import cookieParser from 'cookie-parser';

dotenv.config();

// efectuar conexion a BD
connection();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));



const allowedOrigins = ['https://franalfaro.ddns.net', 'https://miunidad.pages.dev','https://zp1v56uxy8rdx5ypatb0ockcb9tr6a-oci3--5173--cb7c0bca.local-credentialless.webcontainer-api.io'];

const corsOptions = {
  origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true); // Permitir acceso
      } else {
          callback(new Error('Origen no permitido por CORS'));
      }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Asegúrate de permitir OPTIONS
  credentials: true,
};

//configurar cors
app.use(cors(corsOptions));

app.use(cookieParser());


app.use('/uploads', express.static(path.join('uploads')));

// Rutas
app.use('/api/user', userRoutes);
app.use('/api/file', fileRoutes);
app.use('/api/directory', directoryRoutes);


// Iniciar el servidor
const PORT = process.env.PORT;


app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
