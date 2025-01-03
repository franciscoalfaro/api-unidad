import fs from 'fs';
import ds from 'fs/promises';
import path from 'path';
import Directory from '../models/directory.js';
import File from '../models/file.js';
import { allowedExtensions, disallowedExtensions } from '../middleware/allowExtension.js';
import { Readable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(process.env.DRIVER);


// Buscar directorio por ID
export const findFolder = async (folderId) => {
    const directory = await Directory.findById(folderId);
    if (!directory) {
        throw new Error('Directorio no encontrado.');
    }
    return directory;
};

// Procesar archivos subidos
export const uploadFileService = async (files, directory, userId) => {
    const uploadedFiles = [];
    const uploadPath = path.join(directory.path);

    // Ruta de la carpeta temporal
    const tempPath = path.join(uploadPath, 'temp');

    // Crear la carpeta temporal si no existe
    if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
    }

    for (const file of files) {
        const fileExtension = path.extname(file.originalname).slice(1).toLowerCase();

        if (allowedExtensions.includes(fileExtension) && !disallowedExtensions.includes(fileExtension)) {
            const uniqueFilename = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(uploadPath, uniqueFilename);

            // Guardar el archivo original
            const writeStream = fs.createWriteStream(filePath);
            const readableStream = new Readable();
            readableStream.push(file.buffer);
            readableStream.push(null);
            readableStream.pipe(writeStream);

            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });

            // Procesar video si es necesario
            if (['mp4', 'avi', 'mkv', 'mov', 'wmv'].includes(fileExtension)) {
                const qualities = [
                    { label: '360p', resolution: '640x360' },

                ];

                const processedFiles = [];

                // Convertir el archivo a diferentes calidades y guardarlo en la carpeta temporal
                for (const quality of qualities) {
                    const outputFilePath = path.join(tempPath, `${uniqueFilename}_${quality.label}.${fileExtension}`);

                    await new Promise((resolve, reject) => {
                        ffmpeg(filePath)
                            .size(quality.resolution)
                            .output(outputFilePath)
                            .on('end', () => {
                                processedFiles.push({
                                    quality: quality.label,
                                    path: outputFilePath.replace(/\\/g, '/'),
                                });
                                resolve();
                            })
                            .on('error', (err) => reject(err))
                            .run();
                    });

                }
                //mantener el original y solo reproducir el webm y cuando se eliminen se eliminar tambien el original. 
                // Eliminar archivo original si se han generado versiones procesadas
                //if (processedFiles.length > 0) {
                //    fs.unlinkSync(filePath); // Eliminar archivo original
                //}

                // Guardar versiones procesadas en la base de datos
                for (const processedFile of processedFiles) {
                    const newFile = new File({
                        filename: `${uniqueFilename}_${processedFile.quality}`,
                        filepath: processedFile.path,
                        mimetype: file.mimetype,
                        size: fs.statSync(processedFile.path).size,
                        uploadedBy: userId,
                        directory: directory._id,
                        quality: processedFile.quality,
                    });

                    await newFile.save();
                    uploadedFiles.push(newFile);
                }
            } else {
                // Guardar archivo no procesado en la base de datos
                const newFile = new File({
                    filename: file.originalname,
                    filepath: filePath.replace(/\\/g, '/'),
                    mimetype: file.mimetype,
                    size: file.size,
                    uploadedBy: userId,
                    directory: directory._id,
                });

                await newFile.save();
                uploadedFiles.push(newFile);
            }
        } else {
            throw new Error(`Extensión no permitida: ${fileExtension}`);
        }
    }

    return uploadedFiles;
};

// Eliminar archivo
export const deleteFile = async (fileId) => {
    const file = await File.findById(fileId);
    if (!file) {
        throw new Error('Archivo no encontrado');
    }

    if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
    }

    await File.deleteOne({ _id: fileId });
    return file;
};

// Actualizar archivo (ejemplo de renombrar)
export const updateFile = async (fileId, newFilename) => {
    const file = await File.findById(fileId);
    if (!file) {
        throw new Error('Archivo no encontrado');
    }

    const newFilePath = path.join(path.dirname(file.filepath), newFilename);

    fs.renameSync(file.filepath, newFilePath);

    file.filename = newFilename;
    file.filepath = newFilePath.replace(/\\/g, '/');
    await file.save();

    return file;
};

// Servicio para listar archivos en un directorio con paginación
export const listFilesService = async (folderId, page, limit) => {
    const directory = await Directory.findById(folderId);
    if (!directory) {
        throw new Error('Directorio no encontrado');
    }

    const totalFiles = await File.countDocuments({ directory: folderId });
    const files = await File.find({ directory: folderId })
        .skip((page - 1) * limit)
        .limit(limit);

    const subDirectories = await Directory.find({ parent: directory._id });

    return {
        totalFiles,
        currentPage: page,
        totalPages: Math.ceil(totalFiles / limit),
        files,
        subDirectories,
        parent: directory._id,
    };
};

// Servicio para descargar un archivo
export const downloadFileService = async (fileId) => {
    const file = await File.findById(fileId);
    if (!file) {
        throw new Error('Archivo no encontrado');
    }

    const filePath = path.resolve(file.filepath);
    if (!fs.existsSync(filePath)) {
        throw new Error('Archivo no encontrado en el sistema de archivos');
    }

    return {
        filePath,
        file,
    };
};

// Servicio para listar todos los archivos
export const listAllFilesService = async () => {
    return await File.find({}).populate('uploadedBy', 'name surname');
};

//servicio
export const playVideoService = async ({ fileId }) => {
    const file = await File.findById(fileId);

    if (!file) {
        throw new Error('Archivo no encontrado');
    }

    // Validar que el archivo existe en el sistema
    const fullPath = path.resolve(file.filepath);
    if (!fs.existsSync(fullPath)) {
        throw new Error('Archivo físico no encontrado en el servidor');
    }

    return fullPath;
};

export const mediaService = async ({ ImageId }) => {
    // Buscar el archivo en la base de datos.
    const file = await File.findById(ImageId);
    if (!file) {
        throw new Error("Archivo no encontrado en la base de datos");
    }

    const ubication = file.filepath;

    // Comprobar si el archivo existe.
    try {
        await ds.stat(ubication);
    } catch {
        throw new Error("Archivo no encontrado en el sistema de archivos");
    }

    // Devolver la ruta completa.
    return path.resolve(ubication);
};