'use strict'
const UserController = require('../controllers/userController')
const ProductController = require('../controllers/productController')
const SalesController = require('../controllers/salesController')

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
	server.use('/api/sales', SalesController)
	//dashboard
	//customer
}

module.exports = {
	init: init
};