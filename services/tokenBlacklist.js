import TokenBlacklist from '../models/tokenBlacklist.js';

export const addToBlacklist = async (token) => {
    if (!token) {
        
        return; // Salir si el token es nulo o indefinido
    }

    // Quitar espacios en blanco del token para evitar problemas de coincidencia
    const cleanedToken = token.trim();
    

    // Verificar si el token ya está en la blacklist
    const blacklistedToken = await TokenBlacklist.findOne({ token: cleanedToken });
    

    if (!blacklistedToken) {
        // Si el token no está en la blacklist, agregarlo
        const newBlacklistedToken = new TokenBlacklist({ token: cleanedToken });
        await newBlacklistedToken.save();
        
    } else {
        
    }
};

export const isBlacklisted = async (token) => {
    if (!token) {
        
        return false;
    }

    const cleanedToken = token.trim();
    const blacklistedToken = await TokenBlacklist.findOne({ token: cleanedToken });
    return !!blacklistedToken;
};
