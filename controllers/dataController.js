'use strict';
const router = require("express").Router();
const Sequelize =  require('sequelize');
const Op = Sequelize.Op
const excelToJson = require('convert-excel-to-json');
 
const asyncWrapper = require("../helpers/async").AsyncWrapper;
var fs = require('fs');
var path = require('path')

const Upload = require('../helpers/upload')
const Authenticator = require('../middlewares/auth-middleware')
const CustomError = require('../middlewares/error-handling')

const DataExport = require('../helpers/export')
const dataExport = new DataExport;

const ProductService = require('../services/productService')
const productService = new ProductService;

const DatabaseFunc = require('../helpers/crud')
const crudService = new DatabaseFunc;

router.post("/import", [Upload.single('file'), Authenticator.auth], asyncWrapper(async(req, res) => {
    let body = req.body
    let result = excelToJson({
        sourceFile:  path.resolve(__dirname, '..', 'uploads',req.file.filename),
        header:{
            rows: body.row,
            sheets: [body.sheet]
        }
    });
    
    if(!body.sheet){
        result = result[Object.keys(result)[0]];
    }else{
        result = result[body.sheet]
    }
    

    let keys = Object.keys(result[0]);
    let values = result;
    let count = 0;

    await Promise.all(values.map(async (column, index) => {

        if(index != 0){
            let payload = {}
            keys.forEach((row, i) => {
                // console.log(result[0][row])
                payload[result[0][row]] = column[row]
            })

            payload.left = payload.quantity
            payload.timesSold = 0
    
            let saved = await crudService.create('Product', payload)

            productService.updateStock({
                productId: saved.id, 
                userId: req.account.id, 
                productName: saved.name,
                supplierId: payload.supplierId,
                initialStock: 0, 
                currentStock: payload.quantity
            });
            count = count + 1;
        }
    }))

    if(count >= result.length - 1){
        res.send({message: 'Result'});
    }
}))
router.post("/download",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let body = req.body;
    let data;
    let business = await crudService.findOne('Business', {id: 1});
    body.business = business
    data = await dataExport.excelExport(body)
    res.send( {file: data+'.xlsx'});
    res.end;
}));
router.post("/download",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let body = req.body;
    let data;
    let business = await crudService.findOne('Business', {id: 1});
    body.business = business
    data = await dataExport.excelExport(body)
    res.send({file: data+'.xlsx'});
    res.end;
}));

router.get("/download", function (req, res) {
    let filePath = path.resolve(__dirname, '..', 'download',req.query.file)
    res.send('Hello World').download(filePath);
});



module.exports = router;