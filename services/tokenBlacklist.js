import TokenBlacklist from '../models/tokenBlacklist.js';

export const addToBlacklist = async (token) => {
    const blacklistedToken = new TokenBlacklist({ token });
    await blacklistedToken.save();
};

export const isBlacklisted = async (token) => {
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    return !!blacklistedToken;
};
