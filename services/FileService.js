import fs from 'fs';
import path from 'path';
import Directory from '../models/directory.js';
import File from '../models/file.js';
import { allowedExtensions, disallowedExtensions } from '../middleware/allowExtension.js';
import  {Readable}  from 'stream';

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

    // Iterar sobre los archivos recibidos
    for (const file of files) {
        const fileExtension = path.extname(file.originalname).slice(1).toLowerCase();

        // Validar extensiones de archivos
        if (allowedExtensions.includes(fileExtension) && !disallowedExtensions.includes(fileExtension)) {
            const filePath = path.join(uploadPath, `${Date.now()}-${file.originalname}`); // Nombre único

            // Crear un WriteStream para guardar el archivo
            const writeStream = fs.createWriteStream(filePath);

            // Crear un Readable Stream con el contenido del archivo (buffer)
            const readableStream = new Readable();
            readableStream.push(file.buffer);
            readableStream.push(null);  // Finaliza el stream

            // Pipe del Readable al WriteStream
            readableStream.pipe(writeStream);

            // Esperar a que termine la escritura
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });

            // Guardar los datos del archivo en la base de datos
            const newFile = new File({
                filename: file.originalname,
                filepath: filePath.replace(/\\/g, '/'),  // Asegurar formato de path
                mimetype: file.mimetype,
                size: file.size,
                uploadedBy: userId,
                directory: directory._id
            });

            await newFile.save();
            uploadedFiles.push(newFile);
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
    const file = await File.findById(fileId); // Buscar el archivo

    if (!file) {
        throw new Error('Archivo no encontrado');
    }

    // Devolver solo la ruta relativa del archivo
    return file.filepath; // Ruta lógica del archivo
};