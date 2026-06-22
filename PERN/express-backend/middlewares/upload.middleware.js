import multer from "multer";

const storage = multer.memoryStorage();

// Updated file filter to support documents
const fileFilter = (req, file, cb) => {
  const allowedImages = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  const allowedDocs = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  const allowedMimes = [...allowedImages, ...allowedDocs];

  if (allowedMimes.includes(file?.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: "${file?.mimetype}". Allowed types: jpeg, jpg, png, webp, gif, pdf, doc, docx.`
      ),
      false
    );
  }
};

// 10 MB limit for resume files
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default upload;