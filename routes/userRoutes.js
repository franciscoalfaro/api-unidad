import express from 'express';
import { login, register, recovery, profile, update} from '../controllers/UserController.js';

import {requestPasswordReset, handlePasswordReset } from '../controllers/RecoveryController.js';

import { auth as checkAuth } from "../middleware/auth.js";

const router = express.Router();

// Rutas para usuarios
router.post('/login', login);
router.post('/register', register);
router.post('/recovery', recovery);
router.get('/profile/:id',checkAuth, profile);
router.put("/update", checkAuth, update);


router.post('/forgot-password', requestPasswordReset); // Solicitar recuperación
router.post('/reset-password', handlePasswordReset);  // Restablecer contraseña

export default router;
