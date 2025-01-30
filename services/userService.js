// services/userService.js
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import sendEmail from '../services/EmailService.js';
import nuevaclave from '../middleware/generatepassword.js'
import * as jwt from '../services/jwt.js';


export const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};


//servicio de login
export const loginService = async (email, password) => {
    // Validar que ambos campos se proporcionen
    if (!email || !password) {
        return {
            status: 400,
            message: "Correo y contraseña son requeridos",
        };
    }

    // Buscar usuario por correo electrónico
    const user = await findUserByEmail(email.toLowerCase());

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return {
            status: 401,
            message: "Correo o contraseña incorrectos",
        };
    }

    // Validar si el usuario está activo
    if (user.eliminado) {
        return {
            status: 403,
            message: "Usuario deshabilitado, contacta al administrador",
        };
    }

    // Generar tokens JWT
    const accessToken = jwt.createToken(user);
    const refreshToken = jwt.createRefreshToken(user);
    console.log('token generado',accessToken)

    return {
        status: 200,
        accessToken,
        refreshToken,
        user: { id: user._id, email: user.email, name: user.name, surname: user.surname },
    };
};

export const findUserById = async (userId) => {
    return await User.findById(userId).select({ "password": 0 });
}

export const createUser = async ({ name, surname, email, password }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, surname, email, password: hashedPassword });
    return await newUser.save();
};


//perfil
export const profileService = async (userId) => {
    // Buscar el perfil en la base de datos
    const profile = await findUserById(userId);

    if (!profile) {
        throw new Error('Usuario no encontrado');  // Lanzar un error si el perfil no existe
    }

    return profile;  // Retornar el perfil encontrado
};

//recuperacion 
export const recuperar = async (email) => {
    const user = await findUserByEmail(email);
    if (!user) throw new Error('Usuario no encontrado');

    // Generar nueva contraseña temporal y hashearla
    const nuevaContrasena = nuevaclave.generarNuevaContrasena();
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

    // Actualizar la contraseña en la base de datos
    user.password = hashedPassword;
    await user.save();

    // Enviar correo con la nueva contraseña
    await sendEmail.enviarCorreoRecuperacion(email, nuevaContrasena);

    return { message: 'Correo de recuperación enviado' };
};



// Recuperación de contraseña por enlace y token
export const generateResetToken = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    // Generar un token único

    const resetToken = jwt.createToken(user)
    const resetTokenExpiration = Date.now() + 3600000; // Válido por 1 hora

    // Guardar el token y su vencimiento
    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;
    await user.save();

    return resetToken;
};

export const resetPassword = async (token, newPassword) => {
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })

    if (!user) {
        throw new Error('Token inválido o vencido')
    }
    user.password = await bcrypt.hash(newPassword, 10);

    user.resetToken = undefined; // Limpiar el token después de usarlo
    user.resetTokenExpiration = undefined;
    await user.save();

    return user;

}


//servicio
export const profileUpdateService = async (userId, userToUpdate) => {
    try {
        // Comprobar si el usuario ya existe
        const users = await User.find({
            $or: [{ email: userToUpdate.email.toLowerCase() }],
        });

        if (!users) {
            return { status: "error", message: "No existe el usuario a actualizar" };
        }

        let userIsset = false;
        users.forEach((user) => {
            if (user && user._id != userId) userIsset = true;
        });

        if (userIsset) {
            return { status: "warning", message: "El usuario ya existe" };
        }

        // Si hay contraseña, cifrarla
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        } else {
            delete userToUpdate.password;
        }

        // Buscar el usuario y actualizarlo
        const userUpdate = await User.findByIdAndUpdate(userId, userToUpdate, { new: true });

        if (!userUpdate) {
            return { status: "error", message: "Error al actualizar" };
        }

        return { status: "success", message: "Profile update success", user: userUpdate };
    } catch (error) {
        return { status: "error", message: "Error en el servidor" };
    }
};
