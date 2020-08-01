const router = require("express").Router();
const pwdGenerator = require('generate-password')
const asyncWrapper = require("../helpers/async").AsyncWrapper;
const DatabaseFunc = require('../helpers/crud')
const Upload = require('../helpers/upload')
const crudService = new DatabaseFunc;

const AccountService = require('../services/accountService')
const accountService = new AccountService;
const Authenticator = require('../middlewares/auth-middleware')
const CustomError = require('../middlewares/error-handling')

/**
 * LOGIN USER ROUTE
 */
router.post('/auth',asyncWrapper(async(req, res) => {
    var body = req.body
    const validated = await accountService.signinUserCheck(body)
    if(validated != null){
        throw CustomError({statusCode: validated.code, message: validated.message}, res)
    }

    const result = await accountService.signinUser(req.body)
    if(result.error != null){
        throw CustomError({statusCode: result.error.code, message: result.error.message}, res)
    }
    
    let data = {
        type: 'user',
        result: result.data
    }
        
    let requestOption = {
        issuer: 'POS',
        audience: 'POS'
    }

    let token = result.user.getJWT(requestOption)
    res.json({message: 'User login successfull', result: data, token: token});
}))


/**
 * REGISTER USER ROUTE
 */
router.post("/new",[Upload.single('avatar')], asyncWrapper(async (req, res) => {
    var body = req.body
    body.password = pwdGenerator.generate({length: 10, numbers: true, uppercase: false});
    console.log(body.password)
    // const validated = await accountService.authenticateData(body, 'create')
    // if(validated != null){
    //     throw CustomError({statusCode: validated.code, message: validated.message}, res)
    // }
    body.active = true
    if(req.file){
        body.avatar = req.file.filename;
    }
    let user = await crudService.create('User', body)
    let serialized = user.toWeb()
    delete serialized.password
    delete serialized.id

    res.json({message: 'User created successfully', result: serialized});
}));


/**
 * UPDATE USER  ACCOUNT
 */
router.put("/update",[Upload.single('avatar')], asyncWrapper(async (req, res) => {
    var body = JSON.parse(JSON.stringify(req.body));
    delete body.id;

    const validated = await accountService.authenticateData(body, 'update')
    if(validated != null){
        throw CustomError({statusCode: validated.code, message: validated.message}, res)
    }
    if(req.file){
        body.avatar =req.file.filename;
    }
    console.log(body)
    let success = await crudService.update('User', body, {id: req.body.id})
    res.json({message: 'User created successfully', result: success});
}));


/**
 * REMOVE USER ACCOUNT
 */
router.post('/remove', [Authenticator.auth], asyncWrapper(async(req, res) => {
    let data = await crudService.delete('User', {id: req.body.id})
    res.json({message: 'All users', result: data});
}))


/**
 * VIEW SINGLE USER  ACCOUNT
 */
router.post('/single', [Authenticator.auth], asyncWrapper(async(req, res) => {
    console.log(req.body.id)
    let data = await crudService.findOne('User', {id: req.body.id})
    data.password = "*****"
    res.json({message: 'All users', result: data});
}))


/**
 * LIST USER ACCOUNT
 */
router.get('/list', [Authenticator.auth], asyncWrapper(async(req, res) => {
    let data = await crudService.findAll('User')
    data.map(item => item.password = "*****")
    res.json({message: 'All users', result: data});
}))
module.exports = router;


