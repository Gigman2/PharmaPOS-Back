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


module.exports = router;