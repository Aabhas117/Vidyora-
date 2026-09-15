const multer = require("multer");
const os = require("os");
const path = require("path");
const fs = require("fs");

// Files land briefly in the OS temp folder, get uploaded to Cloudinary,
// then are deleted — never committed to the repo, never stored long-term.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, os.tmpdir()),
  filename: (req, file, cb) => {
    // Sanitize extension to alphanumeric only
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, "");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `vidyora_${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "video") {
    if (!ALLOWED_VIDEO_TYPES.includes(file.mimetype) || !ALLOWED_VIDEO_EXTENSIONS.includes(ext)) {
      return cb(new Error("Video must be a valid MP4, WebM, or MOV file."));
    }
  } else if (file.fieldname === "thumbnail" || file.fieldname === "avatar") {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype) || !ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      return cb(new Error("Image must be a valid JPEG, PNG, or WebP file."));
    }
  } else {
    return cb(new Error("Unexpected file field."));
  }

  cb(null, true);
}

/**
 * Validates actual binary content of an uploaded file using magic number signatures.
 */
function validateFileSignature(filePath, fieldname) {
  if (!filePath || !fs.existsSync(filePath)) return false;

  const buffer = Buffer.alloc(12);
  let fd;
  try {
    fd = fs.openSync(filePath, "r");
    fs.readSync(fd, buffer, 0, 12, 0);
  } catch {
    return false;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }

  if (fieldname === "thumbnail" || fieldname === "avatar") {
    // JPEG: FF D8 FF
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    // PNG: 89 50 4E 47
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    // WEBP: RIFF at 0..3 and WEBP at 8..11
    const isWebp =
      buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";

    return isJpeg || isPng || isWebp;
  }

  if (fieldname === "video") {
    // MP4/MOV: ftyp at offset 4..8
    const isFtyp = buffer.toString("ascii", 4, 8) === "ftyp";
    // WEBM: EBML header 1A 45 DF A3
    const isWebm = buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3;

    return isFtyp || isWebm;
  }

  return true;
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB ceiling for video
  },
});

module.exports = upload;
module.exports.validateFileSignature = validateFileSignature;