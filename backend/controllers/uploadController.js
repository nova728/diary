const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
const imageDir = path.join(uploadDir, "images");

[uploadDir, imageDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imageDir),
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${uniqueId}${ext}`);
  },
});

// File filter — images only
const fileFilter = (req, file, cb) => {
  const allowed = /^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Upload a single image
exports.uploadImage = [
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const url = `${baseUrl}/uploads/images/${req.file.filename}`;

    res.json({ url, filename: req.file.filename });
  },
];

// Upload multiple images (max 10)
exports.uploadImages = [
  upload.array("images", 10),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No image files provided" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const files = req.files.map((file) => ({
      url: `${baseUrl}/uploads/images/${file.filename}`,
      filename: file.filename,
    }));

    res.json({ files });
  },
];

// Delete an image
exports.deleteImage = (req, res) => {
  const { filename } = req.params;
  // Prevent directory traversal
  if (filename.includes("..") || filename.includes("/")) {
    return res.status(400).json({ error: "Invalid filename" });
  }

  const filePath = path.join(imageDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Image not found" });
  }

  fs.unlinkSync(filePath);
  res.json({ message: "Image deleted" });
};
