import jwt from "jwt-simple";
import moment from 'moment';
import { secret_key } from "../services/jwt.js";
import { isBlacklisted } from "../services/tokenBlacklist.js";

export const auth = async (req, res, next) => {
    if (!req.cookies.access_token) {
        return res.status(403).send({
            status: "error",
            message: "La petición no tiene cabecera de autenticación."
        });
    }

    let token = req.cookies.access_token;

    if (await isBlacklisted(token)) {
        return res.status(401).send({
            status: "error",
            message: "Token revocado"
        });
    }

    try {
        let payload = jwt.decode(token, secret_key);

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "error",
                message: "Token expirado"
            });
        }

        req.user = payload;

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Token inválido"
        });
    }

    next();
};
