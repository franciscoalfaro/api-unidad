import fs from 'fs';
import path from 'path';
import { deleteFile, downloadFileService, findFolder, listAllFilesService, listFilesService, playVideoService, updateFile, uploadFileService } from '../services/FileService.js';


// Subir archivos
export const uploadFileController = async (req, res) => {
    const { folderId } = req.params;
    const userId = req.user.id;

    try {
        // Verificar si se recibieron archivos
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No se han subido archivos' });
        }

        // Buscar el directorio en base al ID
        const directory = await findFolder(folderId);

        // Procesar y guardar los archivos
        const uploadedFiles = await uploadFileService(req.files, directory, userId);

        // Responder con los archivos subidos
        res.status(201).json({
            status: 'success',
            message: 'Archivos subidos correctamente',
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Error al procesar la carga:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Eliminar archivo
export const deleteFileController = async (req, res) => {
    const { fileId } = req.params;

    try {
        const deletedFile = await deleteFile(fileId);
        return res.status(200).json({ status: 'success', message: 'Archivo eliminado correctamente', file: deletedFile });
    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};

// Actualizar archivo
export const updateFileController = async (req, res) => {
    const { fileId } = req.params;
    const { newFilename } = req.body;

    try {
        const updatedFile = await updateFile(fileId, newFilename);
        return res.status(200).json({ status: 'success', message: 'Archivo actualizado correctamente', file: updatedFile });
    } catch (error) {
        return res.status(400).json({ status: 'error', message: error.message });
    }
};


export const listFilesController = async (req, res) => {
    const { folderId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const result = await listFilesService(folderId, page, limit);
        res.status(200).json({
            status: "success",
            message: "Archivos y directorios encontrados",
            resultado: result,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const downloadFileController = async (req, res) => {
    const { fileId } = req.params;
    const userId = req.user.id;

    try {
        if (!userId) {
            return res.status(401).json({ error: 'No autorizado. Debes estar autenticado para descargar archivos.' });
        }

        const { filePath, file } = await downloadFileService(fileId);

        res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
        res.setHeader('Content-Length', file.size);

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        fileStream.on('error', () => {
            res.status(500).json({ error: 'Error al descargar el archivo' });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const listAllFilesController = async (req, res) => {
    try {
        const files = await listAllFilesService();
        res.status(200).json({
            status: "success",
            message: "Todos los archivos encontrados",
            resultado: files,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller
export const playVideo = async (req, res) => {
    const { fileId } = req.params; // Obtener el fileId desde los parámetros de la ruta

    if (!fileId) {
        return res.status(400).json({ status: 'error', message: 'El parámetro fileId es requerido' });
    }

    try {
        const videoFilePath = await playVideoService({ fileId });

        if (!videoFilePath) {
            return res.status(404).json({ status: 'error', message: 'El archivo de video no se encontró' });
        }

        // Servir el archivo al cliente
        res.set("Content-Type", "video/mp4");
        res.set("Content-Disposition", `attachment; filename="${path.basename(videoFilePath)}"`);
        return res.sendFile(path.resolve(videoFilePath));

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ status: 'error', message: error.message });
    }
};