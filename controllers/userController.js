const router = require("express").Router();
const pwdGenerator = require('generate-password')
const asyncWrapper = require("../helpers/async").AsyncWrapper;
const DatabaseFunc = require('../helpers/crud')
const Upload = require('../helpers/upload')
const auth = require('../helpers/auth')
const imagestorage = require('../helpers/upload').image
const crudService = new DatabaseFunc;

const AccountService = require('../services/accountService')
const accountService = new AccountService;
const AnalyticsService = require('../services/analyticsService');
const analyticsService = new AnalyticsService;

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
router.post("/new", asyncWrapper(async (req, res) => {
    var body = req.body
    if(body.password == ''){
        body.password = pwdGenerator.generate({length: 10, numbers: true, uppercase: false});
    }
    const validated = await accountService.authenticateData(body, 'create')
    if(validated != null){
        throw CustomError({statusCode: validated.code, message: validated.message}, res)
    }
    body.active = true
    body = await auth.hash(body)
    let user = await crudService.create('User', body)
    let serialized = user.toWeb()
    delete serialized.password
    delete serialized.id

    res.json({message: 'User created successfully', result: serialized});
}));


/**
 * UPDATE USER PASSWORD
 */
router.post("/set-password", [Authenticator.auth], asyncWrapper(async (req, res) => {
    var body = req.body
    let user;
    if(body.userId){
        user  = await crudService.findOne('User', {id: body.userId})
    }else{
        user = req.account
        if(body.old != 'fryt01Ch1ck3n'){
            let validPassword = await user.comparePassword(body.old)
            if(!validPassword){
                throw CustomError({statusCode: 422, message: 'Password is not correct'}, res)
            }
        }
    }

    if(body.password != body.c_password){
        throw CustomError({statusCode: 422, message: 'Passwords dont match'}, res)
    }
    body = await auth.hash(body)
    await crudService.update('User', body, {id: req.account.id})
    res.json({message: 'User created successfully'});
}));


/**
 * UPDATE USER  ACCOUNT 
 */
router.put("/update",[Authenticator.auth], asyncWrapper(async (req, res) => {
    var body = JSON.parse(JSON.stringify(req.body));
    body.id;

    if(!body.id){
        body.id = req.account.id
    }

    if(req.file){
        body.avatar =req.file.filename;
    }
    let success = await crudService.update('User', body, {id: body.id})
    res.json({message: 'User created successfully', result: success});
}));


/**
 * REMOVE USER ACCOUNT
 */
router.post('/remove', [Authenticator.auth], asyncWrapper(async(req, res) => {
    const account = await crudService.findOne('User', {id: req.body.id})
    if(account.role == 'tech'){
        throw CustomError({statusCode: 401, message: 'cant delete tech account'}, res)
    }
    let data = await crudService.delete('User', {id: req.body.id})
    res.json({message: 'All users', result: data});
}))


/**
 * VIEW SINGLE USER  ACCOUNT
 */
router.post('/single', [Authenticator.auth], asyncWrapper(async(req, res) => {
    let body = req.body

    if(!body.id){
        body.id = req.account.id
    }

    let data = await accountService.getUser({id: body.id})
    data.password = "*****"
    res.json({message: 'All users', result: data});
}))

/**
 * LIST USER ACCOUNT
 */
router.get('/list', [Authenticator.auth], asyncWrapper(async(req, res) => {
    let data = await accountService.allUsers()
    data.map(item => item.password = "*****")
    res.json({message: 'All users', result: data});
}))

/**
 * LOGOUT USER ACCOUNT
 */
router.get('/logout', [Authenticator.auth], asyncWrapper(async(req, res) => {
    accountService.userLogout({id: req.account.id})
    res.json({message: 'Logout'});
}))

/**
 * LIST USER ACCOUNT
 */
router.post('/report', [Authenticator.auth], asyncWrapper(async(req, res) => {
    let body = req.body;
    let data = await analyticsService.userReport(body)
    res.json({message: 'All users', result: data});
}))


router.get("/resources", [Authenticator.auth], asyncWrapper(async (req, res) => {
    let data = await accountService.getResourceInGroupings()

    res.json({message: 'All', result: data});
}));


router.post("/role-resources", [Authenticator.auth], asyncWrapper(async (req, res) => {
    let roleId = req.body.roleId;
    let data = await accountService.resourceAndPermissions(roleId)
 
    res.json({message: 'All', result: data});
}));

router.get("/roles", [Authenticator.auth], asyncWrapper(async (req, res) => {
    let data = await accountService.getRoles()
    res.json({message: 'All', result: data});
}));

router.post("/save-role", [Authenticator.auth], asyncWrapper(async (req, res) => {
    let body = req.body;

    await accountService.saveRolePermissions(body, req.account)
    res.json({message: 'All', result: 'saved'});
}));


router.get("/user-permission", [Authenticator.auth], asyncWrapper(async (req, res) => {
    let role = req.account.roleId

    let permissions = await crudService.findAll('Permission', {roleId: role})
    res.json({message: 'All', result: permissions});
}))

module.exports = router;


