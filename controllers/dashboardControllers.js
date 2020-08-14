
const router = require("express").Router();
const asyncWrapper = require("../helpers/async").AsyncWrapper;
const Authenticator = require('../middlewares/auth-middleware')
const CustomError = require('../middlewares/error-handling')
const crudService = new DatabaseFunc;

//sales over a month
router.get("/sales", [Authenticator.auth], asyncWrapper(async(req, res)=> {
    
    //get the sales per month by getting their created at in the datbase
    // then display the total sales for the current month
   //  so calculate for all the sales for the curent month
   //add to an array then sum up

    let data ;
    res.json({message: 'Result', result: data});
}));


//stock worth 
router.get("/stock-worth", [Authenticator.auth], asyncWrapper(async(req, res)=> {
   
    //obtain the number of products left
    //left is property in the products model(integer)
    // by looping through all the left property and suming up the prices
    // we should obtain the stock worth

    let data = await crudService.listAll('Product')
    res.json({message: 'Result', result: data});
}));


//Account  admins
router.get("/account-admins", [Authenticator.auth], asyncWrapper(async(req, res)=> {

   // we ahave to obtain the number of users from the user table
   // and also loop through the role to find which ones are employees
    let data = await crudService.listAll('User')
    res.json({message: 'Result', result: data});
}));


//Total sales from first usage of the App
router.get("/total-sales", [Authenticator.auth], asyncWrapper(async(req, res)=> {

    //we will obtain a timestamp from the first sale 
    //then  sum up all the  sale from that date to current

    //let data = await crudService.listAll('Product')
    res.json({message: 'Result', result: data});
}));

module.exports = router;