const multer = require('multer');
const path = require("path");

var localStorage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, './uploads');
    },
    filename: function(req, file, callback){
        var filename = 'file-upload' + '-' + Date.now() + path.extname(file.originalname);
        callback(null, filename);
    }
});

module.exports = multer({storage: localStorage})