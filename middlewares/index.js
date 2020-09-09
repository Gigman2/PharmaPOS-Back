'use strict'

const
    bodyParser  = require('body-parser'),
    cors        = require('cors'),
    helmet      = require('helmet'),
    morgan      = require('morgan');

module.exports = (app) => {
    app.use(bodyParser.json({limit: '50mb'}))
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
    app.use(morgan("common"))
    app.use(cors())
    app.use(helmet())
}



