import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR, "products");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function fileFilter(req, file, cb) {
  if (!allowedTypes.has(file.mimetype)) {
    return cb(ApiError.badRequest("Only JPEG, PNG, WEBP or GIF images are allowed"));
  }
  cb(null, true);
}

export const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
}).single("image");
