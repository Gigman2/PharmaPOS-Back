'use strict';
global.__basedir = __dirname;

const logger = require('./helpers/logger')
global.logger = logger

// IMPORT GLODAL VARIABLES
// require('./configs/index')

const
    server = require('./server')(),
    config = require('./config');

server.create(config);
server.start();