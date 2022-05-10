'use strict';
const router = require("express").Router();
const Sequelize =  require('sequelize');
const Op = Sequelize.Op
const excelToJson = require('convert-excel-to-json');
 
const asyncWrapper = require("../helpers/async").AsyncWrapper;
var fs = require('fs');
var path = require('path')
const imagestorage = require('../helpers/upload').image
const Upload = require('../helpers/upload')
const Authenticator = require('../middlewares/auth-middleware')
const CustomError = require('../middlewares/error-handling')

const DataExport = require('../helpers/export')
const dataExport = new DataExport;

const ProductService = require('../services/productService')
const productService = new ProductService;

const DatabaseFunc = require('../helpers/crud');
const { connect } = require("tls");
const crudService = new DatabaseFunc;

router.post("/import", [], asyncWrapper(async(req, res) => {
    try {
        let result = excelToJson({
            sourceFile:  path.resolve(__dirname, '..', 'uploads', 'Products.xlsx'),
        });
        
        result = result['Sheet 1'];
        
        let keys = result[0];
        result.shift()
        let values = result;
  
        await Promise.all(values.map(async (column, index) => {
            console.log(column)
            let payload = {}
  
                Object.keys(keys).map((key) => {
                    let _value = column[key]
                    if(['quantity', 'pack_q', 'pack_l', 'timesSold', 'restock','left', 'categoryId', 'supplierId'].includes(keys[key])){
                        _value = Number(_value)
                    }
                    if(_value === undefined && ['wprice', 'cprice', 'restock'].includes(keys[key])) _value = 0
                    payload.pack_q = 1
        
                    if(payload.left > 0){
                        payload.left = payload.quantity - 1
                        payload.pack_l = 1
                    }
                    else {
                        payload.left = 0
                    }
                    payload[keys[key]] = _value
                })
        
            let saved = await crudService.create('Product', payload)
            console.log('Saved ', saved)
        
            try {
                productService.updateStock({
                    productId: saved.id, 
                    productName: saved.name,
                    supplierId: saved.supplierId,
                    initialStock: 0, 
                    currentStock: saved.quantity
                });
            } catch (err) {
                console.log(err)
            }
        }))   
        res.send({message: 'done'})
      } catch (error) {
        console.log(error)
      }
}))

router.post("/download",[Authenticator.auth], asyncWrapper(async(req, res)=> {
    let body = req.body;
    let data;
    let business = await crudService.findOne('Business', {id: 1});
    if(business == null){
        throw CustomError({statusCode: 422, message: 'Set business information before export'}, res)
    }

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