const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const multer = require('multer')
const path = require('path')

cloudinary.config({ 
    cloud_name:  process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

var imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,  
    params: async (req, file) => {
        return {
          folder: 'nagiland',
          format: 'jpeg',
        };
      },
});

var docStorage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, file.extname);
    },
    filename: function(req, file, callback){
        var originalname = file.originalname.substr(0, file.originalname.lastIndexOf("."))
        console.log(originalname)
        var filename = originalname + '-' + Date.now() + path.extname(file.originalname);
        callback(null, filename);
    }
});


module.exports = {
    image: multer({ storage: imageStorage }),
    doc:  multer({ storage: docStorage })
}