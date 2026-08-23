import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});


export const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 4 }, // 4MB limit of pdf file
});