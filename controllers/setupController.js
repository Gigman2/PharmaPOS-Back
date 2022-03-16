const router = require("express").Router();
const asyncWrapper = require("../helpers/async").AsyncWrapper;
const DatabaseFunc = require('../helpers/crud')
const Upload = require('../helpers/upload')
const Authenticator = require('../middlewares/auth-middleware')
const crudService = new DatabaseFunc;
const auth = require('../helpers/auth')
const imagestorage = require('../helpers/upload').image

const AccountService = require('../services/accountService')
const accountService = new AccountService;

router.post("/business-save", [imagestorage.single('logo'), Authenticator.auth], asyncWrapper(async(req, res)=> {
    let body = req.body;
    body.userId = req.account.id
    if(req.file){
        body.logo = req.file.url
    }
    let data = await crudService.createOrUpdate('Business', body, {id: body.id})

    res.json({message: 'Result', result: data});
}));

router.get("/business-info", [Authenticator.auth], asyncWrapper(async(req, res)=> {
    let body = req.body;
    body.userId = req.account.id
    let data = await crudService.findAll('Business')
    if(data.length) data[0]
    
    res.json({message: 'Result', result: data});
}));


router.get('/setup-account', asyncWrapper(async(req, res) => {

    logger.info('✌ Setting Up Resources')
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
    resources.map(async item => {
        let created = await crudService.create('Resource', item)
        if(created){
            success++
        }
    })

    logger.info('✌ Creating Admin role With Permissions')
    let roleAndPermissions = { "name":"Admin",
        "resource":{
            "Analytics":[
                {"name":"Can view dashboard","resourceId":1,"state":true,"group":"analytics"}
            ],
            "Sales":[
                {"name":"Access to Sell page","resourceId":2,"state":true,"group":"sales"},
                {"name":"Access to sale records","resourceId":3,"state":false,"group":"sales"},
                {"name":"Can modify a sales record","resourceId":4,"state":false,"group":"sales"},
                {"name":"Can delete a sales record","resourceId":5,"state":false,"group":"sales"},
                {"name":"Can refund a transaction","resourceId":6,"state":false,"group":"sales"},
                {"name":"Can return a transaction","resourceId":7,"state":false,"group":"sales"}
            ],
            "Customer":[
                {"name":"can add customer","resourceId":14,"state":false,"group":"customer"},
                {"name":"can modify customer details","resourceId":15,"state":false,"group":"customer"},
                {"name":"can delete a customer","resourceId":16,"state":false,"group":"customer"}
            ],
            "Discount":[
                {"name":"can add new discount ","resourceId":21,"state":false,"group":"discount"},
                {"name":"can modify a discount","resourceId":22,"state":false,"group":"discount"},
                {"name":"can delete a discount","resourceId":23,"state":false,"group":"discount"},
                {"name":"can apply discount to a transaction","resourceId":24,"state":false,"group":"discount"}
            ],
            "Inventory":[
                {"name":"can add product","resourceId":25,"state":false,"group":"inventory"},
                {"name":"can modify added product's details","resourceId":26,"state":false,"group":"inventory"},
                {"name":"can remove product","resourceId":27,"state":false,"group":"inventory"},
                {"name":"can add stock to product","resourceId":28,"state":false,"group":"inventory"},
                {"name":"can export inventory data","resourceId":36,"state":false,"group":"inventory"},
                {"name":"can add new inventory by import","resourceId":37,"state":false,"group":"inventory"}
            ],
            "Category":[
                {"name":"can add a category","resourceId":29,"state":false,"group":"category"},
                {"name":"can modify a category","resourceId":30,"state":false,"group":"category"},
                {"name":"can delete a category","resourceId":31,"state":false,"group":"category"}
            ],
            "Supplier":[
                {"name":"can add a supplier","resourceId":32,"state":false,"group":"supplier"},
                {"name":"can modify a supplier","resourceId":33,"state":false,"group":"supplier"},
                {"name":"can delete a supplier","resourceId":34,"state":false,"group":"supplier"}
            ],
            "Report":[
                {"name":"can access all reports","resourceId":35,"state":true,"group":"report"}
            ],
            "Office":[
                {"name":"Has full office access","resourceId":38,"state":true,"group":"Office"}
            ]
        }
    }

   let newRole =  await accountService.saveRolePermissions(roleAndPermissions, req.account)

    logger.info('✌ Creating Account with assigned role')
    let userBody = {
        "username": 'Tech',
        "firstname": 'Sluxify',
        "lastname": 'Tech',
        "email": 'kojoaeric@gmail.com',
        "roleId": newRole.id,
        "phone": '0245268415',
        "active": true,
        "password": "Cisco_980"
      }
    userBody = await auth.hash(userBody)
    let user = await crudService.create('User', userBody)
    res.json({message: `Account setup successful, ${success} resources added`, result: user});
}))


module.exports = router;