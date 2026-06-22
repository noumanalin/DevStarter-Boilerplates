import express from "express";
import multer from "multer";
import { createMedia,  getAllMedia, getSingleMedia, updateMedia, deleteMedia, getMediaStats, getCloudinaryUsage, } from "../controllers/media.controller.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/stats", getMediaStats);
router.get("/cloudinary-usage", getCloudinaryUsage);
router.post("/", upload.single("file"), createMedia);
router.get("/", getAllMedia);
router.get("/:id", getSingleMedia);
router.put("/:id", updateMedia); // <- this line was missing, hence the 404
router.delete("/:id", deleteMedia);

export default router;