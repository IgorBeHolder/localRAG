const multer = require("multer");
const path = require("path");
const fs = require("fs");

function setupMulterCsv() {
  // Handle File uploads for auto-uploading.
  const storage = multer.diskStorage({
    destination: function (_, _, cb) {
      const uploadOutput = path.resolve(process.env.CODER_DIR);

      cb(null, uploadOutput);
    },
    filename: function (_, file, cb) {
      cb(null, file.originalname);
    },
  });

  return {handleUploadsCsv: multer({storage})};
}

module.exports = {
  setupMulterCsv
};
