// controllers/UserController.js
import { findUserByEmail, createUser, recuperar, profileService, profileUpdateService } from '../services/userService.js';
import bcrypt from 'bcrypt';
import { addToBlacklist } from '../services/tokenBlacklist.js';
import * as jwt from '../services/jwt.js';


export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validar que ambos campos sean enviados
        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Correo y contraseña son requeridos",
            });
        }

        // Buscar usuario por correo electrónico
        const user = await findUserByEmail(email.toLowerCase());

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                status: "error",
                message: "Correo o contraseña incorrectos",
            });
        }

        // Validar si el usuario está activo (opcional)
        if (user.eliminado) {
            return res.status(403).json({
                status: "error",
                message: "Usuario deshabilitado, contacta al administrador",
            });
        }

        // Generar tokens JWT
        const accessToken = jwt.createToken(user);
        const refreshToken = jwt.createRefreshToken(user);

        // Establecer cookies HTTP-only
        res.cookie('access_token', accessToken, { httpOnly: true });
        res.cookie('refresh_token', refreshToken, { httpOnly: true });

        // Enviar respuesta
        res.json({
            status: "success",
            user: { id: user._id, email: user.email, name: user.name, surname: user.surname } // Opcional: excluir información sensible
        });

    } catch (error) {
        console.error(error); // Registro del error para depuración
        res.status(500).json({
            status: "error",
            message: "Error interno del servidor",
        });
    }
};

export const register = async (req, res) => {
    const { name, surname, email, password } = req.body;
    try {
        const newUser = await createUser({ name, surname, email, password });
        res.status(201).json({ message: 'Usuario registrado con éxito', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
};


// Controlador de recuperación de contraseña
export const recovery = async (req, res) => {
    const { email } = req.body;
    try {
        const response = await recuperar(email);
        res.json(response);
    } catch (error) {
        if (error.message === 'Usuario no encontrado') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error en el servidor', error: error.message });
        }
    }
};

export const profile = async (req, res) => {
    const { id: userId } = req.params;  // Desestructuración para obtener el userId

    // Validación del ID de usuario
    if (!userId) {
        return res.status(400).json({ status: 'error', message: 'El id del perfil no está incluido' });
    }

    try {
        // Llamar al servicio para obtener el perfil
        const profile = await profileService(userId); 

        // Si el perfil se encuentra, se retorna la respuesta
        return res.status(200).json({
            status: 'success',
            message: 'Perfil encontrado',
            user:profile
        });

    } catch (error) {
        // Capturar errores lanzados por el servicio
        console.error('Error al obtener usuario:', error.message);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Error al obtener el perfil del usuario'
        });
    }
};

// Controlador
export const update = async (req, res) => {
    try {
        const userIdentity = req.user;
        let userToUpdate = req.body;

        // Limpiar campos innecesarios
        delete userToUpdate.iat;
        delete userToUpdate.exp;
        delete userToUpdate.role;
        delete userToUpdate.image;

        // Llamar al servicio para actualizar el perfil
        const result = await profileUpdateService(userIdentity.id, userToUpdate);

        if (result.status === "error") {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al obtener la información en el servidor",
        });
    }
};

export const logout = async (req, res) => {
    const accessToken = req.cookies.access_token;
    console.log('acces',accessToken)
    const refreshToken = req.cookies.refresh_token;

    if (accessToken) {
        await addToBlacklist(accessToken);
    }

    if (refreshToken) {
        await addToBlacklist(refreshToken);
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    res.status(200).send({
        status: "success",
        message: "Sesión cerrada"
    });
};
