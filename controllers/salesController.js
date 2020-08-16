const router = require("express").Router();
const asyncWrapper = require("../helpers/async").AsyncWrapper;
const DatabaseFunc = require('../helpers/crud')
const Authenticator = require('../middlewares/auth-middleware')
const Sequelize   =  require('sequelize');
const Op  = Sequelize.Op
const crudService = new DatabaseFunc;

//Cusomer
router.post("/new", asyncWrapper(async (req, res) => {
    let body= req.body

    //body.id = req.account.id
    body.firstname = req.body.firstname
    body.lastname = req.body.lastname
    body.email = req.body.email
    body.phone = req.body.phone
    body.lastPurchase = req.body.lastPurchase


    console.log(req)
    console.log('customer body',body)
    
    const customerExist = await crudService.findOne('Customer', {email:body.email})

    if(customerExist)throw CustomError({statusCode: '422', message: 'Customer already exists'}, res)

    // const validated = await productService.authenticateData(body, 'create')
    // if(validated != null){
    //     throw CustomError({statusCode: validated.code, message: validated.message}, res)
    // }
    
    // body.purchases = req.body.purchases
    
    // let body={firstname,lastname,email,phone,lastPurchase}
    console.log('customer body',body)
    let data = await crudService.create('Customer', body)

    
    res.json({message: 'New Customer added successfully', result: data});
}));

router.get("/sales-list",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await crudService.listAll('Sale')
    res.json({message: 'Result', result: data});
}));

router.get("/customer-list",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await crudService.listAll('Customer')
    res.json({message: 'Result', result: data});
}));


router.get("/discount-promo-list",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await crudService.listAll('Discount')
    res.json({message: 'Result', result: data});
}));

module.exports = router;