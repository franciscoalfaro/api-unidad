// app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import directoryRoutes from './routes/directoryRoutes.js';
import { connection } from './bd/conexion.js';
import path from 'path';

dotenv.config();

// efectuar conexion a BD
connection();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));


// Middleware
app.use(cors());

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
