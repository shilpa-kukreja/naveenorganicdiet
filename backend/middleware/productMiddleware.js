// import multer from "multer";
// import path from "path";


// const productdir = path.join(process.cwd(), "uploads/products");
// if (!fs.existsSync(productdir)) {
//     fs.mkdirSync(productdir, { recursive: true });
// }
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, productdir);
//     },
//     filename: function (req, file, cb) {
//         const ext = path.extname(file.originalname);
//         cb(null, Date.now() + "-" + file.originalname);
//     },
// });
// const fileFilter = (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|webp/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);
//     if (extname && mimetype) {
//         cb(null, true);
//     } else {
//         cb(new Error("Only images are allowed"));
//     }
// };
// export const upload = multer({ storage, fileFilter });





import multer from "multer";
import path from "path";
import fs from "fs";

const productDir = path.join(process.cwd(), "uploads/products");
if (!fs.existsSync(productDir)) {
  fs.mkdirSync(productDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, productDir),
  filename: (req, file, cb) => {
    const safeName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const valid = allowed.test(file.mimetype);
  valid ? cb(null, true) : cb(new Error("Only Image Files Allowed"));
};

export const upload = multer({ storage, fileFilter }).fields([
  { name: "thumbImg", maxCount: 1 },
  { name: "galleryImg", maxCount: 10 },
]);
