'use strict'

const chalk      = require("chalk");
const express    = require('express')
const Middleware = require('../middlewares')
const models     = require("../models/index"); 
const CustomError = require('../middlewares/error-handling')

module.exports = function() {
	let server = express(),
		create, 
		start;

	create = function(config) {
		let routes = require('../routes');

		// Server settings
		server.set('env', config.env);
		server.set('port', config.port);
		server.set('hostname', config.hostname);
		server.set('viewDir', config.viewDir);

		server.use('/static',express.static(__basedir+'/uploads'))
 
		// Setup Database
		// models.sequelize.sync()
		logger.info('✌ ================ Database Loaded ==================')
 
		Middleware(server)

		// Set up routes
		routes.init(server); 
		logger.info('✌ ================ Route Loaded =====================')

		//Set up global winston logger

		//Error handling
		// ErrorHandlingMiddleware(server)
		logger.info('✌ ================ Server Created ==================')
		
		server.use(function(err, req, res, next) {
			console.log(err)
			throw CustomError({statusCode: 500, message: 'Internal server error'}, res)
		});
	};

	start = function() {
		let hostname = server.get('hostname'),
			port = server.get('port');

		server.listen(port, function () {
			logger.info('✌ Server Started on - http://' + hostname + ':' + port)
		});
	};

	return {
		create: create,
		start: start
	};
}
