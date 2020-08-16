
const router = require("express").Router();
const asyncWrapper = require("../helpers/async").AsyncWrapper;
const Authenticator = require('../middlewares/auth-middleware')
const CustomError = require('../middlewares/error-handling')
const moment = require('moment');
const crudService = new DatabaseFunc;

//sales over a month
router.get("/sales", [Authenticator.auth], asyncWrapper(async(req, res)=> {
    //get month begining to current month date
    //get the sales per month by getting their created at in the datbase
    // then display the total sales for the current month
   //  so calculate for all the sales for the curent month
   //add to an array then sum up


   var currentDate = new Date()
    //moment.format(currentDate, 'M');
    var date =moment(currentDate)

     //sales per month in an array
    let salesArray =  await crudService.findAll('Sale',{createdAt: date.month() }) ;
    let data = salesArray.map(sales=>parseFloat(sales.grossTotal));

    //we have the totalal sale in teh current month

     data = data.reduce(function(sum, value) {
        return sum + value;
        });

    
    res.json({message: 'Result', result: data});
}));


//stock worth 
router.get("/stock-worth", [Authenticator.auth], asyncWrapper(async(req, res)=> {
   
    //obtain the number of products left
    //left is property in the products model(double)
    // by looping through all the left property and suming up the prices
    // we should obtain the stock worth



     //obtains the left propert
    let {left} = await crudService.findAll('Product');


    //converting object to array
    left = left.map(left=> left)


    //getting the sum of products left
    let data = left.reduce(function(sum, value) {
        return sum + value;
        });


    res.json({message: 'Result', result: data});
}));


//Account  admins
router.get("/account-admins", [Authenticator.auth], asyncWrapper(async(req, res)=> {

   // we ahave to obtain the number of users from the user table
   // and also loop through the role to find which ones are employees

   //we can use the  sequelize find and CountAll method
   //but that is not in the crud service

    let data = await crudService.listAll('User',{role:"employee"})

    data.map(user=>user.role);
     data=  data.prototype.length

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