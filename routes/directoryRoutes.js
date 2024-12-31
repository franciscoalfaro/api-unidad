import express from "express";

import { createDirectoryController, deleteDirectoryController, getAllDirectoriesController, getDirectoriesController } from '../controllers/DirectoryController.js';

import { auth as checkAuth } from "../middleware/auth.js";

const router = express.Router()


router.post("/create",checkAuth, createDirectoryController)

router.get("/list/:page?",checkAuth, getDirectoriesController)
router.get("/listAll/:page?",checkAuth, getAllDirectoriesController)

router.delete("/delete/:directoryId", checkAuth, deleteDirectoryController);


//exportar router
export default router;