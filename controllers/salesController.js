const router = require("express").Router();
const asyncWrapper = require("../helpers/async").AsyncWrapper;
const Authenticator = require('../middlewares/auth-middleware')
const Sequelize   =  require('sequelize');
const path   =  require('path');
const Op  = Sequelize.Op

const DatabaseFunc = require('../helpers/crud')
const crudService = new DatabaseFunc;


const AnalyticsService = require('../services/analyticsService');
const analyticsService  = new AnalyticsService;

//Cusomer
router.post("/new", asyncWrapper(async (req, res) => {
    let body= req.body

    //body.id = req.account.id
    body.firstname = req.body.firstname
    body.lastname = req.body.lastname
    body.email = req.body.email
    body.phone = req.body.phone
    body.lastPurchase = req.body.lastPurchase

    
    const customerExist = await crudService.findOne('Customer', {email:body.email})

    if(customerExist)throw CustomError({statusCode: '422', message: 'Customer already exists'}, res)

    let data = await crudService.create('Customer', body)

    
    res.json({message: 'New Customer added successfully', result: data});
}));

router.get("/sales-list",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await crudService.listAll('Sale')
    res.json({message: 'Result', result: data});
}));

router.post("/customer-attach",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await crudService.update('Sale', req.body, {id: req.body.id})
    res.json({message: 'Result', result: data});
}));

router.get("/customer-list",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await crudService.listAll('Customer')
    res.json({message: 'Result', result: data});
}));

router.get("/customer-search",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await crudService.listAll('Customer')
    res.json({message: 'Result', result: data});
}));

router.post("/customer-save",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    var body = req.body
    body.userId = req.account.id
    let data = await crudService.createOrUpdate('Customer', body, {id: body.id})
    res.json({message: 'Customer added successfully', result: data});
}));

router.post("/customer-report",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    var body = req.body
    let data = await analyticsService.customerReport(body)
    res.json({message: 'Customer added successfully', result: data});
})); 


router.get("/discount-promo-list",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await crudService.listAll('Discount')
    res.json({message: 'Result', result: data});
}));

router.post("/discount-add",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let body = req.body
    body.userId = req.account.id
    let data = await crudService.createOrUpdate('Discount', body, {id: body.id})
    res.json({message: 'Customer added successfully', result: data});
}));

router.get("/discount-search",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    try {
        let query = req.query;
        let data;
        if(req.query.q){
            query = {
                [Op.and]: [
                    Sequelize.literal("discount.code LIKE '%"+ req.query.q+"%'"),
                ]
            }
        }
        data = await crudService.findAll('Discount' ,query)
        res.json({message: 'Result', result: data});

    } catch (error) {
        console.log(error)
    }
}));

router.post("/report",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let body = req.body;
    let data = await analyticsService.salesReport(body)
    res.json({message: 'Result', result: data});
}));



module.exports = router;