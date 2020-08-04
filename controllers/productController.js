const router = require("express").Router();
const asyncWrapper = require("../helpers/async").AsyncWrapper;
const DatabaseFunc = require('../helpers/crud')
const Upload = require('../helpers/upload')
const crudService = new DatabaseFunc;

const ProductService = require('../services/productService')
const productService = new ProductService;
const Authenticator = require('../middlewares/auth-middleware')
const CustomError = require('../middlewares/error-handling')


router.post("/new",[Upload.single('image'), Authenticator.auth], asyncWrapper(async (req, res) => {
    var body = req.body
    const validated = await productService.authenticateData(body, 'create')
    if(validated != null){
        throw CustomError({statusCode: validated.code, message: validated.message}, res)
    }
    body.userId = req.account.id
    body.active = true
    if(req.file){
        body.avatar = req.file.filename;
    }
    let data = await crudService.create('Product', body)

    res.json({message: 'New Product added successfully', result: data});
}));

 
router.post("/add-category", [Authenticator.auth], asyncWrapper(async (req, res) => {
    var body = req.body
    const validated = await productService.authenticateCategory();
    if(validated != null){
        throw CustomError({statusCode: validated.code, message: validated.message}, res)
    }

    body.userId = req.account.id
    let data = await crudService.create('Category', body)
    res.json({message: 'New Category added successfully', result: data});
}))

router.get("/category/list", [Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await productService.fetchCategories()
    res.json({message: 'Result', result: data});
}));

router.get("/list", [Authenticator.auth], asyncWrapper(async(req, res)=> {
    let data = await crudService.findAll('Product')
    res.json({message: 'Result', result: data});
}));

module.exports = router;