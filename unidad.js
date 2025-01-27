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



const corsOptions = {
  origin: 'http://localhost:5174', // Origen permitido
  credentials: true, // Habilitar el envío de cookies y credenciales
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
