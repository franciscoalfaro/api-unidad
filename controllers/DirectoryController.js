import {
    countFilesInDirectory,
    createDirectoryService,
    deleteDirectoryService,
    fetchFilesWithPagination,
    fetchRootDirectory,
    fetchSubDirectories,
    getAllDirectoriesService
} from '../services/directoryService.js';

/**
 * Controlador para crear un directorio.
 */
export const createDirectoryController = async (req, res) => {
    const { name, parent } = req.body;
    const createdBy = req.user.id;

    try {
        const newDirectory = await createDirectoryService(name, parent, createdBy);
        return res.status(200).send({
            status: 'success',
            message: 'Directorio creado correctamente',
            newDirectory
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Controlador para eliminar un directorio.
 */
export const deleteDirectoryController = async (req, res) => {
    const { directoryId } = req.params;

    try {
        await deleteDirectoryService(directoryId);
        res.status(200).json({ message: 'Directorio y su contenido eliminados correctamente.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Controlador para obtener todos los directorios raíz.
 */
export const getAllDirectoriesController = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const result = await getAllDirectoriesService(page, limit);
        res.status(200).json({
            status: 'success',
            message: 'Directorios raíz encontrados',
            directorios: result.docs,
            totalDoc: result.totalDocs,
            limit: result.limit,
            totalPage: result.totalPages,
            page: result.page
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const getDirectoriesController = async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        if (!userId) {
            return res.status(401).json({
                error: 'No autorizado. Debes estar autenticado para ver archivos.',
            });
        }

        const rootDirectory = await fetchRootDirectory(userId);
        if (!rootDirectory) {
            return res.status(404).json({ error: 'Directorio principal no encontrado' });
        }

        const totalFiles = await countFilesInDirectory(rootDirectory._id);
        const files = await fetchFilesWithPagination(rootDirectory._id, page, limit);
        const subDirectories = await fetchSubDirectories(rootDirectory._id, userId);

        res.status(200).json({
            status: 'success',
            message: 'Archivos y directorios encontrados',
            resultado: {
                totalFiles,
                currentPage: page,
                totalPages: Math.ceil(totalFiles / limit),
                files,
                directorios: subDirectories,
                parent: rootDirectory._id,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};