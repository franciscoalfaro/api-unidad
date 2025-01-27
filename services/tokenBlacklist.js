import TokenBlacklist from '../models/tokenBlacklist.js';

export const addToBlacklist = async (token) => {
    if (!token) {
        console.log('Token is null or undefined');
        return; // Salir si el token es nulo o indefinido
    }

    // Quitar espacios en blanco del token para evitar problemas de coincidencia
    const cleanedToken = token.trim();
    console.log('Token limpiado:', cleanedToken);

    // Verificar si el token ya está en la blacklist
    const blacklistedToken = await TokenBlacklist.findOne({ token: cleanedToken });
    console.log('Token encontrado en blacklist:', blacklistedToken);

    if (!blacklistedToken) {
        // Si el token no está en la blacklist, agregarlo
        const newBlacklistedToken = new TokenBlacklist({ token: cleanedToken });
        await newBlacklistedToken.save();
        console.log('Token agregado a la blacklist');
    } else {
        console.log('El token ya está en la blacklist');
    }
};

export const isBlacklisted = async (token) => {
    if (!token) {
        console.log('Token es nulo o indefinido');
        return false;
    }

    const cleanedToken = token.trim();
    const blacklistedToken = await TokenBlacklist.findOne({ token: cleanedToken });
    return !!blacklistedToken;
};
