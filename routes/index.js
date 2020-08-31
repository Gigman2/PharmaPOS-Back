'use strict'
const UserController = require('../controllers/userController')
const ProductController = require('../controllers/productController')
const DashboardController = require('../controllers/dashboardControllers')
const SalesController = require('../controllers/salesController')
const HardwareController = require('../controllers/setupController')
const DataController = require('../controllers/dataController')

const path = require('path')

function init(server) {
	server.get('*', function (req, res, next) {
		console.log('Request was made to: ' + req.originalUrl);
		return next();
	});

	server.get('/', function (req, res) {
		res.send('Sluxi POS');
	});


	server.use('/api/users', UserController)
	server.use('/api/dashboard', DashboardController)
	server.use('/api/product', ProductController)
	server.use('/api/sales', SalesController)
	server.use('/api/hardware', HardwareController)
	server.use('/api/setup', HardwareController)
	server.use('/api/data', DataController)
	
}

module.exports = {
	init: init
};