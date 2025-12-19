// import multer from "multer";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "./public")
//     },
//     filename: function (req, file, cb) {
      
//       cb(null, file.originalname)
//     }
//   })
  
// export const upload = multer({ 
//     storage, 
// })

import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure upload folder always exists
const uploadPath = "./public";
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
});

// Allowed file types (PDF/JPG/PNG)
const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF, JPG, PNG allowed."), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});
