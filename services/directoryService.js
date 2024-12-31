import Directory from '../models/directory.js';
import File from '../models/file.js';
import fs from 'fs';
import path from 'path';

/**
 * Obtener el siguiente número de directorio raíz.
 */
export const getNextParentNumber = async () => {
    const lastDirectory = await Directory.findOne({ parent: null }).sort({ parentNumber: -1 });
    return lastDirectory ? lastDirectory.parentNumber + 1 : 1;
};

/**
 * Crear un directorio físico y en la base de datos.
 */
export const createDirectoryService = async (name, parent, createdBy) => {
    const baseDir = 'uploads/directorios';
    let parentPath = baseDir;
    let parentNumber = null;
    let parentDirectory = null;

    if (parent) {
        parentDirectory = await Directory.findById(parent);
        if (!parentDirectory) throw new Error('Directorio padre no encontrado');
        parentPath = path.join(parentDirectory.path);
        parentNumber = parentDirectory.parentNumber;
    } else {
        parentNumber = await getNextParentNumber();
    }

    const newPath = path.join(parentPath, name);

    // Verificar si el directorio ya existe
    const existingDirectory = await Directory.findOne({ name, parent });
    if (existingDirectory) throw new Error('El nombre del directorio ya existe.');

    // Crear el directorio físico
    fs.mkdirSync(newPath, { recursive: true });

    // Guardar el directorio en la base de datos
    const newDirectory = new Directory({
        name,
        parent: parent || null,
        parentNumber,
        createdBy,
        path: parentDirectory ? path.join(parentDirectory.path, name).replace(/\\/g, '/') : name
    });

    await newDirectory.save();
    return newDirectory;
};

/**
 * Eliminar un directorio y su contenido.
 */
export const deleteDirectoryService = async (directoryId) => {
    const directory = await Directory.findById(directoryId);
    if (!directory) throw new Error('Directorio no encontrado');

    // Eliminar archivos dentro del directorio
    const files = await File.find({ filepath: { $regex: `^${directory.path}` } });
    for (const file of files) {
        const filePath = path.join(file.filepath);
        fs.unlinkSync(filePath);
        await File.findByIdAndDelete(file._id);
    }

    // Eliminar subdirectorios de forma recursiva
    const subDirectories = await Directory.find({ parent: directoryId });
    for (const subDir of subDirectories) {
        await deleteDirectoryService(subDir._id);
    }

    // Eliminar el directorio físico
    fs.rmSync(directory.path, { recursive: true });
    await Directory.findByIdAndDelete(directoryId);
};

/**
 * Obtener todos los subdirectorios de un directorio raíz.
 */
export const getAllDirectoriesService = async (page, limit) => {
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        populate: [{ path: 'createdBy', select: 'name surname' }]
    };

    const result = await Directory.paginate({ parent: null }, options);
    return result;
};


export const fetchRootDirectory = async (userId) => {
    return await Directory.findOne({ createdBy: userId, parent: null });
};

export const countFilesInDirectory = async (directoryId) => {
    return await File.countDocuments({ directory: directoryId });
};

export const fetchFilesWithPagination = async (directoryId, page, limit) => {
    return await File.find({ directory: directoryId })
        .skip((page - 1) * limit)
        .limit(limit);
};

export const fetchSubDirectories = async (parentId, userId) => {
    return await Directory.find({ parent: parentId, createdBy: userId });
};