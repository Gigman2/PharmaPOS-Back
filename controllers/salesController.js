const router = require("express").Router();
const asyncWrapper = require("../helpers/async").AsyncWrapper;
const DatabaseFunc = require('../helpers/crud')
const Authenticator = require('../middlewares/auth-middleware')
const crudService = new DatabaseFunc;


router.get("/sales-list",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await crudService.listAll('Sale')
    res.json({message: 'Result', result: data});
}));

router.get("/customer-list",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await crudService.listAll('Customer')
    res.json({message: 'Result', result: data});
}));

router.post("/customer-save",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    var body = req.body
    body.userId = req.account.id
    let data = await crudService.createOrUpdate('Customer', body, {id: body.id})
    res.json({message: 'Customer added successfully', result: data});
}));


router.get("/discount-promo-list",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await crudService.listAll('Discount')
    res.json({message: 'Result', result: data});
}));

module.exports = router;