'use strict'
const UserController = require('../controllers/userController')
const ProductController = require('../controllers/productController')

function init(server) {
	server.get('*', function (req, res, next) {
		console.log('Request was made to: ' + req.originalUrl);
		return next();
	});

	server.get('/', function (req, res) {
		res.send('Pharma POS');
	});


	server.use('/api/users', UserController)
	server.use('/api/product', ProductController)
}

module.exports = {
	init: init
};