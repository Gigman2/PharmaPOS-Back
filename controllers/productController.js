const Sequelize =  require('sequelize');
const Op = Sequelize.Op
const router = require("express").Router();
const asyncWrapper = require("../helpers/async").AsyncWrapper;
const DatabaseFunc = require('../helpers/crud')
const Upload = require('../helpers/upload')
const crudService = new DatabaseFunc;

const ProductService = require('../services/productService')
const productService = new ProductService;
const DeviceService = require('../services/deviceService')
const deviceService = new DeviceService;
const AnalyticsService = require('../services/analyticsService');
const analyticsService = new AnalyticsService;


const Authenticator = require('../middlewares/auth-middleware')
const CustomError = require('../middlewares/error-handling');

router.post("/new",[Upload.single('image'), Authenticator.auth], asyncWrapper(async (req, res) => {
    var body = req.body
    const validated = await productService.authenticateData(body, 'create')
    if(validated != null){
        throw CustomError({statusCode: validated.code, message: validated.message}, res)
    }
    body.userId = req.account.id
    body.timesSold = 0
    body.left = body.quantity - 1
    body.pack_l = body.pack_q

    body.active = true;

    if(req.file){
        body.image = req.file.filename;
    }
    let data = await crudService.create('Product', body)

    productService.updateStock({
        productId: data.id, 
        userId: req.account.id, 
        productName: data.name,
        supplierId: body.supplierId,
        initialStock: 0, 
        currentStock: body.quantity
    });

    res.json({message: 'New Product added successfully', result: data});
}));

router.post("/update",[Upload.single('image'), Authenticator.auth], asyncWrapper(async (req, res) => {
    var body = JSON.parse(JSON.stringify(req.body));
    delete body.id;

    const validated = await productService.authenticateData(body, 'update')
    if(validated != null){
        throw CustomError({statusCode: validated.code, message: validated.message}, res)
    }

    if(req.file){
        body.image = req.file.filename;
    }
    let data = await crudService.update('Product', body, {id: req.body.id})
    res.json({message: 'New Product update successfully', result: data});
}));


router.post("/single", [Authenticator.auth], asyncWrapper(async(req, res) => {
    let data;
    console.log(req.body)
    if(req.query.type == 'simple'){ 
        data = await crudService.findOne('Product', {id: req.body.id})
    }else{
        data =  await productService.fetchProduct()
    }
    res.json({message: 'Result', result: data});
}))

router.get("/list", [Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data
    if(req.query.size == 'all'){
        data = await crudService.findAll('Product') 
    }else{
        data = await productService.fetchRecentProducts() 
    }
    res.json({message: 'Result', result: data});
}));

router.get("/list-top-best", [Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await productService.fetchTopBestProduct()
    res.json({message: 'Result', result: data});
}));

router.post('/remove', [Authenticator.auth], asyncWrapper(async(req, res) => {
    let data = await crudService.delete('Product', {id: req.body.id})
    res.json({message: 'Deleted', result: data});
}))

router.get('/stock', [Authenticator.auth], asyncWrapper(async(req, res) => {
    let data = await productService.fetchStock();
    res.json({message: 'Result', result: data});
}))

router.get('/search', [Authenticator.auth], asyncWrapper(async(req, res) => {
    try {
        let query = req.query;
        let data;
        // delete query.name
        if(query.type == 'category'){

        }else{
            if(req.query.name){
                query = {
                    [Op.and]: [
                        Sequelize.literal("product.name LIKE '%"+ req.query.name+"%'"),
                    ]
                }
            }
            data = await productService.fetchProducts(query)
        }
        res.json({message: 'Result', result: data});

    } catch (error) {
        console.log(error)
    }
}))

router.post("/report", [Authenticator.auth], asyncWrapper(async(req, res) => {
    let body = req.body;
    let data = await analyticsService.inventoryReport(body)
    res.json({message: 'Result', result: data});
}))

// *********************************************************************************//
// -------------------------- STOCK ENDPOINT -----------------------------------//
// *********************************************************************************//
 

router.post('/stock/add', [Authenticator.auth], asyncWrapper(async(req, res) => {
    let body = req.body;
    let data = await crudService.create('Stock', body)
    
    let product = await crudService.findOne('Product', {id: body.productId})
    let updateData = body;

    updateData.quantity = parseInt(product.left) + parseInt(updateData.quantity)
    updateData.left = updateData.quantity

    crudService.update('Product', req.body, {id: body.productId})
    res.json({message: 'Result', result: data});
}))


router.get('/stock/list', [Authenticator.auth], asyncWrapper(async(req, res) => {
    let body = req.body;
    let data = await productService.fetchStockUpdated()
    res.json({message: 'Result', result: data});
}))

// *********************************************************************************//
// -------------------------- CATEGORY ENDPOINT -----------------------------------//
// *********************************************************************************//
 
router.post("/save-category", [Authenticator.auth], asyncWrapper(async (req, res) => {
    var body = req.body
    const validated = await productService.authenticateCategory();
    if(validated != null){
        throw CustomError({statusCode: validated.code, message: validated.message}, res)
    }

    body.userId = req.account.id
    let data = await crudService.createOrUpdate('Category', body, {id: body.id})
    res.json({message: 'New Category added successfully', result: data});
}))

router.get("/category/list", [Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data;
    if(req.query.type != undefined){
        data = await crudService.listAll('Category')
    }else{
        data = await productService.fetchCategories()
    }
    res.json({message: 'Result', result: data});
}));

router.get("/category/search", [Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data;
    query = {
        [Op.and]: [
            Sequelize.literal("category.name LIKE '%"+ req.query.q+"%'"),
        ]
    }

    data = await productService.fetchCategories(query)
    res.json({message: 'Result', result: data});
}));


router.post('/category/remove', [Authenticator.auth], asyncWrapper(async(req, res) => {
    let data = await crudService.delete('Category', {id: req.body.id})
    res.json({message: 'Deleted', result: data});
}))



// *********************************************************************************//
// -------------------------- SUPPLIERS ENDPOINT -----------------------------------//
// *********************************************************************************//

router.post("/save-supplier", [Authenticator.auth], asyncWrapper(async (req, res) => {
    var body = req.body
    const validated = await productService.authenticateCategory();
    if(validated != null){
        throw CustomError({statusCode: validated.code, message: validated.message}, res)
    }

    body.userId = req.account.id
    let data = await crudService.createOrUpdate('Supplier', body, {id: body.id})
    res.json({message: 'New Supplier added successfully', result: data});
}))

router.get("/supplier/list", [Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await crudService.listAll('Supplier')
    res.json({message: 'Result', result: data});
}));

router.get("/supplier/search", [Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data;
    let query = {
        [Op.and]: [
            Sequelize.literal("supplier.name LIKE '%"+ req.query.q+"%'"),
        ]
    }

    data = await productService.fetchSupplier(query)
    res.json({message: 'Result', result: data});
}));

router.post("/supplier/report", [Authenticator.auth], asyncWrapper(async(req, res) => {
    let body = req.body;
    let data = await analyticsService.supplierReport(body)
    res.json({message: 'Result', result: data});
}))

router.post('/supplier/remove', [Authenticator.auth], asyncWrapper(async(req, res) => {
    let data = await crudService.delete('Supplier', {id: req.body.id})
    res.json({message: 'Deleted', result: data});
}))


// *********************************************************************************//
// ------------------------------ SALES ENDPOINT -----------------------------------//
// *********************************************************************************//


router.post("/transaction/save", [Authenticator.auth], asyncWrapper(async(req, res) => {
    let body = req.body;
    body.userId = req.account.id
    if(body.state != 'holding'){
        body.state = 'complete'; 
    }
    let transaction = await crudService.createOrUpdate('Sale', body, {id: body.id})
    let productsSaved = await Promise.all(body.products.map(async item => {
        item.saleId = transaction.id
        await crudService.createOrUpdate('ProductSale', item , {id: item.id})
    }))

    if(transaction.customerId){
        crudService.update('Customer', {lastPurchase: Date.now()}, {id: transaction.customerId});
    }

    if(productsSaved){
        productService.updateStockAfterPurchase(transaction.id)
        let stock = await analyticsService.stockWorth()
        crudService.update('Sale', {stockWorth: stock.stockWorth}, {id: transaction.id})

        if(body.state == 'complete'){
            let printData = {
                issuer: req.account.firstname+' '+req.account.lastname
            }
            if(body.print){
                printData.business = await crudService.findOne('Business', {id: 1});
                printData.transaction = await productService.fetchTransaction(transaction.id)

                deviceService.printReceipt(printData) 
            }
        }
    }
    

    res.json({message: 'Result', result: transaction});
}))


router.get("/transaction/list", [Authenticator.auth], asyncWrapper(async(req, res) => {
    let data = await productService.fetchTransactions();
    
    res.json({message: 'Result', result: data});
}))

router.post("/transaction/return", [Authenticator.auth], asyncWrapper(async(req, res) => {
    let data = await crudService.update('Sale', {state: 'returned'}, {id: req.body.id})
    let products = await crudService.findAll('ProductSale', {saleId: req.body.id})
    products.map(item => {
        let product = await = crudService.findOne('Product', {id : item.productId})
        crudService.update('Product', {quantity: parseFloat(item.quantity) + parseFloat(product.quantity)}, {id : item.productId})
    })
    
    res.json({message: 'Result', result: data}); 
}))

router.post("/transaction/refund", [Authenticator.auth], asyncWrapper(async(req, res) => {
    let data = await crudService.update('Sale', {state: 'refunded'}, {id: req.body.id})
    
    res.json({message: 'Result', result: data});
}))

router.get("/transaction/search", [Authenticator.auth], asyncWrapper(async(req, res) => {
    let query = {
        [Op.or]: [
            Sequelize.literal("sale.id LIKE '%"+ req.query.q+"%'"),
            Sequelize.literal("sale.state LIKE '%"+ req.query.q+"%'")
        ]
    }
    let data = await productService.fetchTransactions(query);
    
    res.json({message: 'Result', result: data});
}))

router.post("/transaction/print", [Authenticator.auth], asyncWrapper(async(req, res) => {
    let body = req.body
    let printData = {};

    console.log(body)
    let business = await crudService.findOne('Business', {id: 1});
    let transaction = await productService.fetchTransaction(body.id)
    let issuer = await crudService.findOne('User', transaction.userId)

    console.log(transaction)
    printData.business = business
    printData.transaction = transaction
    printData.issuer = issuer.firstname+' '+issuer.lastname

    deviceService.printReceipt(printData) 
    
    res.json({message: 'Result', result: data});
}))




module.exports = router;