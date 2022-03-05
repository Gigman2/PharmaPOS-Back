'use strict'

const chalk      = require("chalk");
const socketIO   = require("socket.io")
const express    = require('express')
const Http       = require('http') 
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
		server.use('/download',express.static(__basedir+'/download'))
 
		// Setup Database
		models.sequelize.sync()
		logger.info('✌ ================ Database Loaded ==================')
 
		Middleware(server)
 
		// Set up routes
		routes.init(server); 
		logger.info('✌ ================ Route Loaded =====================')



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
		
		const http = Http.createServer(server);
		

		http.listen(port, function () {
			logger.info('✌ Server Started on - http://' + hostname + ':' + port)
		});
	};

	return {
		create: create,
		start: start
	};
}
