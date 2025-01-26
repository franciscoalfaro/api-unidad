// controllers/UserController.js
import { generateResetToken, resetPassword } from '../services/userService.js';
import EmailService from '../services/EmailService.js';



export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const resetToken = await generateResetToken(email);

        // URL para restablecer la contraseña
        const resetURL = `${process.env.FRONTEND_URL}reset-password/${resetToken}`;
        let urlconvertida = resetURL.toString()

        // Enviar email al usuario
        await EmailService.enviarEnlaceRecuperacion(
            email,urlconvertida
        );
        
        res.status(200).json({ status:'success', message: 'Email de recuperación enviado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al solicitar la recuperación', error: error.message });
    }
};

export const handlePasswordReset = async (req, res) => {
    const { newPassword } = req.body;
    const {token} = req.params

    try {
        await resetPassword(token, newPassword);
        res.status(200).json({ status:'success', message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
