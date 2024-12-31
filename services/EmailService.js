import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs/promises';  // Usar promises para lectura asincrónica

// Función para crear el transporter
function crearTransporter() {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    return nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        auth: {
            user: emailUser, // Cambia con tu dirección de correo de tu servidor 
            pass: emailPassword // Cambia con tu contraseña
        }
    });
}

// Función para enviar correo de recuperación utilizando servidor SMTP
async function enviarCorreoRecuperacion(email, nuevaContrasena) {
    const transporter = crearTransporter();
    const emailUser = process.env.EMAIL_USER;

    try {
        const emailTemplatePath = path.join('uploads', 'html', 'reset-password.html');
        const emailTemplate = await fs.readFile(emailTemplatePath, 'utf8'); // Lectura asincrónica

        const mailOptions = {
            from: emailUser,
            to: email,
            subject: 'Recuperación de Contraseña',
            html: emailTemplate.replace('${nuevaContrasena}', nuevaContrasena)
        };

        await transporter.sendMail(mailOptions);
       
    } catch (error) {
        console.error('Error al enviar correo de recuperación:', error);
    }
}

//funcion para enviar enlace de recuperacion token, 
async function enviarEnlaceRecuperacion(email, urlconvertida) {
    const transporter = crearTransporter();
    const emailUser = process.env.EMAIL_USER;

    try {
        const emailTemplatePath = path.join('uploads', 'html', 'enlace.html');
        const emailTemplate = await fs.readFile(emailTemplatePath, 'utf8'); // Lectura asincrónica

        const mailOptions = {
            from: emailUser,
            to: email,
            subject: 'enlace de recuperacion de Contraseña',
            html: emailTemplate
            .replace('${urlconvertida}', urlconvertida) // Reemplazar ${resetToken}, si es necesario
        };

        await transporter.sendMail(mailOptions);
        
    } catch (error) {
        console.error('Error al enviar correo de recuperación:', error);
    }
}


export default { enviarCorreoRecuperacion,enviarEnlaceRecuperacion };
