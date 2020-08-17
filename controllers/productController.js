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

const Authenticator = require('../middlewares/auth-middleware')
const CustomError = require('../middlewares/error-handling')


router.post("/new",[Upload.single('image'), Authenticator.auth], asyncWrapper(async (req, res) => {
    var body = req.body
    const validated = await productService.authenticateData(body, 'create')
    if(validated != null){
        throw CustomError({statusCode: validated.code, message: validated.message}, res)
    }
    body.userId = req.account.id
    body.timesSold = 0
    body.left = body.quantity
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
    if(req.query.type == 'simple'){
        data = await crudService.findOne('Product', {id: req.body.id})
    }else{
        data =  await productService.fetchProduct()
    }
    res.json({message: 'Result', result: data});
}))

router.get("/list", [Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await productService.fetchProducts()
    res.json({message: 'Result', result: data});
}));

router.get('/stock', [Authenticator.auth], asyncWrapper(async(req, res) => {
    let data = await productService.fetchStock();
    res.json({message: 'Result', result: data});
}))

router.post('/remove', [Authenticator.auth], asyncWrapper(async(req, res) => {
    let data = await crudService.delete('Product', {id: req.body.id})
    res.json({message: 'Deleted', result: data});
}))


router.get('/search', [Authenticator.auth], asyncWrapper(async(req, res) => {
    try {
        let query = req.query;
        // delete query.name
        if(req.query.name){
            query = {
                [Op.and]: [
                    Sequelize.literal("product.name LIKE '%"+ req.query.name+"%'"),
                ]
            }
        }

        console.log(query)

        

        let data = await productService.fetchProducts(query)
        res.json({message: 'Result', result: data});

    } catch (error) {
        console.log(error)
    }
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
    if(req.query.type != ""){
        data = await crudService.listAll('Category')
    }else{
        data = await productService.fetchCategories()
    }
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
    body.products.forEach(item => {
        item.saleId = transaction.id
        crudService.createOrUpdate('ProductSale', item , {id: item.id})
    })
    if(body.state == 'complete'){
        let printData = {
            issuer: req.account.firstname+' '+req.account.lastname
        }
        printData.business = await crudService.findOne('Business', {id: 1});
        printData.transaction
        deviceService.printReceipt(printData) 
    }
    
    res.json({message: 'Result', result: transaction});
}))


router.get("/transaction/list", [Authenticator.auth], asyncWrapper(async(req, res) => {
    let data = await productService.fetchTransactions();
    
    res.json({message: 'Result', result: data});
}))


module.exports = router;