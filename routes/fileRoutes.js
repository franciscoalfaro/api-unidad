import express from "express";
import multer from "multer";
import { deleteFileController,updateFileController, listFilesController, listAllFilesController, uploadFileController, downloadFileController, playVideo  } from '../controllers/FileController.js';
import { auth as checkAuth } from "../middleware/auth.js";


const router = express.Router();

// Configuración de Multer con almacenamiento en memoria
const storage = multer.memoryStorage(); // Usamos memoryStorage para tener acceso al archivo en buffer
const uploads = multer({ storage });

// Endpoint para subir archivos
router.post("/uploads/:folderId", checkAuth, uploads.array('files'), uploadFileController);
router.delete("/delete/:fileId", checkAuth, deleteFileController)

//obtener el listado de archivos
router.get("/files/:folderId", checkAuth, listFilesController);

//listar todos los archivos
router.get("/allfiles", checkAuth, listAllFilesController);

//descargar archivo que corresponde
router.get("/download/:fileId", checkAuth, downloadFileController);

router.put("/update/:fileId", checkAuth, updateFileController);

router.get("/play/:fileId",checkAuth,  playVideo);

// Exportar router
export default router;
