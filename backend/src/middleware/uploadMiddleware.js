import multer from 'multer';

// Memory storage keeps file buffers in memory for immediate Cloudinary stream/upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow images, videos, and PDFs
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-matroska',
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: Images, Videos, PDFs`), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max for video uploads
  },
  fileFilter,
});
