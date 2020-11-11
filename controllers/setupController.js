const router = require("express").Router();
const asyncWrapper = require("../helpers/async").AsyncWrapper;
const DatabaseFunc = require('../helpers/crud')
const Upload = require('../helpers/upload')
const Authenticator = require('../middlewares/auth-middleware')
const crudService = new DatabaseFunc;

const DeviceService = require('../services/deviceService')
const deviceService = new DeviceService;
const ProductService = require('../services/productService')
const productService = new ProductService;

router.post("/business-save", [Upload.single('image'), Authenticator.auth], asyncWrapper(async(req, res)=> {
    let body = req.body;
    body.userId = req.account.id
    if(req.file){
        body.logo = req.file.filename;
    }
    let data = await crudService.createOrUpdate('Business', body, {id: body.id})

    res.json({message: 'Result', result: data});
}));

router.get("/business-info", [Authenticator.auth], asyncWrapper(async(req, res)=> {
    let body = req.body;
    body.userId = req.account.id
    let data = await crudService.findOne('Business', {id: 1})
    
    res.json({message: 'Result', result: data});
}));

router.get("/printer", asyncWrapper(async(req, res)=> {
    let data = await deviceService.printerInfo()
    res.json({message: 'Result', result: data});
}));

router.get("/print", asyncWrapper(async(req, res)=> {
    let data = {};
    let business = await crudService.listAll('Business');
    data.business = business[0]

    let transaction = await productService.fetchTransactions();
    data.transaction = transaction[0]

    await deviceService.printReceipt(data)
    res.json({message: 'Result', result: data});
}));


router.get("/barcode", asyncWrapper(async(req, res) => {
    let data = await deviceService.scannersInfo()
    res.json({message: 'Result', result: data});
}));


router.get("/set-resources", asyncWrapper(async(req, res) => {
    let resources = [
        {"id":"1","name":"Can view dashboard","group":"analytics"},
        {"id":"2","name":"Access to Sell page", "group":"sales"},
        {"id":"3","name":"Access to sale records","group":"sales"},
        {"id":"4","name":"Can modify a sales record","group":"sales"},
        {"id":"5","name":"Can delete a sales record","group":"sales"},
        {"id":"6","name":"Can refund a transaction","group":"sales"},
        {"id":"7","name":"Can return a transaction","group":"sales"},
        {"id":"14","name":"can add customer","group":"customer"},
        {"id":"15","name":"can modify customer details","group":"customer"},
        {"id":"16","name":"can delete a customer","group":"customer"},
        {"id":"21","name":"can add new discount ","group":"discount"},
        {"id":"22","name":"can modify a discount","group":"discount"},
        {"id":"23","name":"can delete a discount","group":"discount"},
        {"id":"24","name":"can apply discount to a transaction","group":"discount"},
        {"id":"25","name":"can add product","group":"inventory"},
        {"id":"26","name":"can modify added product's details","group":"inventory"},
        {"id":"27","name":"can remove product","group":"inventory"},
        {"id":"28","name":"can add stock to product","group":"inventory"},
        {"id":"29","name":"can add a category","group":"category"},
        {"id":"30","name":"can modify a category","group":"category"},
        {"id":"31","name":"can delete a category","group":"category"},
        {"id":"32","name":"can add a supplier","group":"supplier"},
        {"id":"33","name":"can modify a supplier","group":"supplier"},
        {"id":"34","name":"can delete a supplier","group":"supplier"},
        {"id":"35","name":"can access all reports","group":"report"},
        {"id":"36","name":"can export inventory data","group":"inventory"},
        {"id":"37","name":"can add new inventory by import","group":"inventory"},
        {"id":"38","name":"Has full office access","group":"Office"}
    ]
    let success = 0
    resources.forEach(async item => {
        let created = await crudService.create('Resource', item)
        if(created){
            success++
        }
    })

    res.json({message: 'Successfully created '+success+' resources'});
}));

module.exports = router;