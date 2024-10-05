const multer = require("multer");
const path = require('path');

const downloadsPath = path.resolve(__dirname, '../downloads');

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, downloadsPath); // Pass the destination to multer
    },
    filename: (req, file, cb) => {
        console.log("File uploaded")
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage
}).single('videoFile');

module.exports = upload;