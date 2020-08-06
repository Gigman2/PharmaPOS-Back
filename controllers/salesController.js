const router = require("express").Router();
const asyncWrapper = require("../helpers/async").AsyncWrapper;
const DatabaseFunc = require('../helpers/crud')
const crudService = new DatabaseFunc;


router.get("/list", asyncWrapper(async(req, res)=> {
    let data = await crudService.listAll('Sale')
    res.json({message: 'Result', result: data});
}));

module.exports = router;