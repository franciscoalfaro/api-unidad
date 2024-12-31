// controllers/UserController.js
import { generateResetToken, resetPassword } from '../services/userService.js';
import EmailService from '../services/EmailService.js';



export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const resetToken = await generateResetToken(email);

        // URL para restablecer la contraseña
        const resetURL = `http://${process.env.FRONTEND_URL}api/usuarios/reset-password?token=${resetToken}`;
        let urlconvertida = resetURL.toString()

        // Enviar email al usuario
        await EmailService.enviarEnlaceRecuperacion(
            email,urlconvertida
        );
        
        res.status(200).json({ message: 'Email de recuperación enviado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al solicitar la recuperación', error: error.message });
    }
};

export const handlePasswordReset = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const user = await resetPassword(token, newPassword);
        res.status(200).json({ message: 'Contraseña restablecida correctamente', user });
    } catch (error) {
        res.status(500).json({ message: 'Error al restablecer la contraseña', error: error.message });
    }
};
