'use strict'
const UserController = require('../controllers/userController')

function init(server) {
	server.get('*', function (req, res, next) {
		console.log('Request was made to: ' + req.originalUrl);
		return next();
	});

	server.get('/', function (req, res) {
		res.send('Pharma POS');
	});


	server.use('/api/users', UserController)
}

module.exports = {
	init: init
};