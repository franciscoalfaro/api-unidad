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



const corsOptions = {
  origin: 'http://localhost:5173', // Asegúrate de que esta URL sea la del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
  credentials: true,
};

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Middleware
app.use(cors(corsOptions));

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
