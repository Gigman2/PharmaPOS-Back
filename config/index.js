'use strict';

const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
    path: path.resolve(__basedir, ".env")
})


let config = {
    hostname:  process.env.HOSTNAME,
    port:  process.env.PORT,

    database: {
        url: process.env.DATABASE_URL,
        host: process.env.DB_HOST,
        username: process.env.DB_USER, 
        port: process.env.DB_PORT,
        password: process.env.DB_PASS,
        name: process.env.DB_DATABASE,
        dialect: process.env.DB_DIALECT,
    },

    jwt: {
        expiration:  process.env.JWT_EXPIRATION,
        secret: process.env.JWT_SECRET,
    },

    redis: {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
        pass: ''
    }
    
    // cloudinary_cloud_name:"blossomanalytics",
    // cloudinary_api_key:875684348465699,
    // cloudinary_api_secret:"ldUYiIZR4SJ4xVOX99K7AGE1xUc",
};

module.exports = config;