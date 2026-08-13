const multer = require("multer");
const os = require("os");
const path = require("path");

// Files land briefly in the OS temp folder, get uploaded to Cloudinary,
// then are deleted — never committed to the repo, never stored long-term.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function fileFilter(req, file, cb) {
  if (file.fieldname === "video") {
    if (!ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      return cb(new Error("Video must be MP4, WebM, or MOV."));
    }
  } else if (file.fieldname === "thumbnail") {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(new Error("Thumbnail must be JPEG, PNG, or WebP."));
    }
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB — reasonable ceiling for a demo/dev app, not arbitrary huge
  },
});

module.exports = upload;