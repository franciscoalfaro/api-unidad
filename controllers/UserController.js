// controllers/UserController.js
import { createUser, recuperar, profileService, profileUpdateService, loginService } from '../services/userService.js';
import { addToBlacklist } from '../services/tokenBlacklist.js';


export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await loginService(email, password);

        // Manejar diferentes respuestas según el servicio
        if (result.status !== 200) {
            return res.status(result.status).json({
                status: "error",
                message: result.message,
            });
        }

        // Configurar cookies HTTP-only
        res.cookie('access_token', result.accessToken, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.cookie('refresh_token', result.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });

        // Enviar respuesta exitosa
        res.json({
            status: "success",
            user: result.user,
            message:'login correcto'
        });
    } catch (error) {
        console.error(error); // Registrar error para depuración
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

// controlador 
export const logout = async (req, res) => {
    const accessToken = req.cookies.access_token;

    const refreshToken = req.cookies.refresh_token;

    try {
        if (accessToken) {
            const tokenblac = await addToBlacklist(accessToken);  // Esto ahora solo insertará si el token no está en la blacklist
            console.log('enviado accessToken', tokenblac)
        }

        if (refreshToken) {
            const tokenblac = await addToBlacklist(refreshToken);  // Lo mismo para el refreshToken
            console.log('enviado refreshToken', tokenblac)
        }

        // Limpiar las cookies
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        res.status(200).send({
            status: "success",
            message: "Sesión cerrada"
        });
    } catch (error) {
        res.status(500).send({
            status: "error",
            message: "Hubo un problema al cerrar sesión."
        });
    }
};
