import fs from 'fs';
import path from 'path';
import { deleteFile, downloadFileService, findFolder, listAllFilesService, listFilesService, playVideoService, updateFile, uploadFileService, mediaService } from '../services/FileService.js';


// Subir archivos
export const uploadFileController = async (req, res) => {
    const { folderId } = req.params;
    const userId = req.user.id;

    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No se han subido archivos' });
        }

        const directory = await findFolder(folderId);
        const uploadedFiles = await uploadFileService(req.files, directory, userId);

        res.status(201).json({
            status: 'success',
            message: 'Archivos subidos correctamente',
            files: uploadedFiles.map((file) => ({
                filename: file.filename,
                filepath: file.filepath,
                quality: file.quality || 'original',
            })),
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
    const { fileId } = req.params;

    if (!fileId) {
        return res.status(400).json({ status: 'error', message: 'El parámetro fileId es requerido' });
    }

    try {
        const videoFilePath = await playVideoService({ fileId });

        if (!videoFilePath) {
            return res.status(404).json({ status: 'error', message: 'El archivo de video no se encontró' });
        }

        const absolutePath = path.resolve(videoFilePath);
        const stat = fs.statSync(absolutePath); // Obtener información del archivo

        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            // Transmisión parcial
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            const chunkSize = (end - start) + 1;
            const fileStream = fs.createReadStream(absolutePath, { start, end });

            res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunkSize,
                "Content-Type": "video/mp4"
            });

            fileStream.pipe(res);
        } else {
            // Enviar todo el archivo si no hay encabezado `Range`
            res.writeHead(200, {
                "Content-Length": fileSize,
                "Content-Type": "video/mp4"
            });

            fs.createReadStream(absolutePath).pipe(res);
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: 'error', message: error.message });
    }
};


export const media = async (req, res) => {
    try {
        // Obtener el parámetro de la URL.
        const ImageId = req.params.file;

        // Llamar al servicio para obtener la ubicación del archivo.
        const ubication = await mediaService({ ImageId });

        // Enviar el archivo como respuesta.
        return res.sendFile(ubication);
    } catch (error) {
        // Manejar errores y enviar la respuesta adecuada.
        if (error.message.includes("Archivo no encontrado")) {
            return res.status(404).json({ status: "error", message: error.message });
        }

        return res.status(500).json({ status: "error", message: "Error interno del servidor" });
    }
};