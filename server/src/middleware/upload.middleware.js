const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

// Ensure destination directory exists
const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with randomized UUID filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate UUID v4 filename to prevent collisions and sanitize file names
    const uniqueName = `${crypto.randomUUID()}.pdf`;
    cb(null, uniqueName);
  }
});

// File filter strictly validating BOTH mimetype and file extension
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (ext === '.pdf' && mime === 'application/pdf') {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type: Only PDF documents (.pdf) are allowed');
    error.status = 400;
    cb(error, false);
  }
};

const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 Megabytes
  }
});

// Wrapper to format Multer errors into standard API error envelope
const handleResumeUpload = (fieldName = 'resume') => {
  const upload = uploadResume.single(fieldName);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: {
              message: 'File size exceeds limit: Resume must be 2MB or smaller'
            }
          });
        }
        return res.status(err.status || 400).json({
          error: {
            message: err.message || 'File upload failed'
          }
        });
      }
      next();
    });
  };
};

module.exports = {
  handleResumeUpload,
  uploadDir
};
