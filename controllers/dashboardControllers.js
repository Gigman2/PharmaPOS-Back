
const router = require("express").Router();
const Sequelize =  require('sequelize');
const Op = Sequelize.Op
const asyncWrapper = require("../helpers/async").AsyncWrapper;

const Authenticator = require('../middlewares/auth-middleware')
const CustomError = require('../middlewares/error-handling')

const DatabaseFunc = require('../helpers/crud')
const crudService = new DatabaseFunc; 
const AnalyticsService = require('../services/analyticsService')
const analyticsService = new AnalyticsService;


//sales
router.get("/sales-monthly", [Authenticator.auth], asyncWrapper(async (req, res) => {
    //get month begining to current month date
    //get the sales per month by getting their created at in the datbase
    // then display the total sales for the current month
    //  so calculate for all the sales for the curent month
    //add to an array then sum up

    try {
        let salesData = await analyticsService.salesMonthly()
        res.json({ message: 'Result', result: salesData });

    } catch (err) {
        console.log(err)
        res.json({ message: 'Error', result: err });
    }

}));

//sales over a month
router.get("/sales", [Authenticator.auth], asyncWrapper(async (req, res) => {
    //get month begining to current month date
    //get the sales per month by getting their created at in the datbase
    // then display the total sales for the current month
    //  so calculate for all the sales for the curent month
    //add to an array then sum up

    try {
        let salesData = await analyticsService.sales()
        res.json({ message: 'Result', result: salesData });

    } catch (err) {
        console.log(err)
        res.json({ message: 'Error', result: err });
    }

}));


//stock worth 
router.get("/stock-worth", [], asyncWrapper(async (req, res) => {

    //obtain the number of products left
    //left is property in the products model(double)
    // by looping through all the left property and suming up the prices
    // we should obtain the stock worth

    try {
        //obtains the left propert
        let data =  await analyticsService.stockWorth()

        res.json({ message: 'Result', result: data });

    } catch (err) {

        console.log(err)
        res.json({ message: 'Error', result: err });

    }
}));


//sales data 
router.get("/sales-graph", [Authenticator.auth], asyncWrapper(async (req, res) => {

    //obtain the number of products left
    //left is property in the products model(double)
    // by looping through all the left property and suming up the prices
    // we should obtain the stock worth

    try {
        
        let data =  await analyticsService.salesGraph()
        res.json({ message: 'Result', result: data });

    } catch (err) {

        console.log(err)
        res.json({ message: 'Error', result: err });

    }
}));


//Account  admins
router.get("/account-admins", [Authenticator.auth], asyncWrapper(async (req, res) => {

    // we ahave to obtain the number of users from the user table
    // and also loop through the role to find which ones are employees

    //we can use the  sequelize find and CountAll method
    //but that is not in the crud service

    try {
        let data = await analyticsService.totalAccounts()

        res.json({ message: 'Result', result: data });

    } catch (err) {

        console.log(err)
        res.json({ message: 'Error', result: err });

    }
}));


//Total sales from first usage of the App
router.get("/total-sales", [Authenticator.auth], asyncWrapper(async (req, res) => {

    //we will obtain a timestamp from the first sale 
    //then  sum up all the  sale from that date to current

    try {

        let salesArray = await crudService.findAll('Sale')
        let data = salesArray.map(sales => parseFloat(sales.grossTotal));

        data = data.reduce(function (sum, value) {
            return sum + value;
        });

        res.json({ message: 'Result', result: data });

    } catch (err) {
        console.log(err)
        res.json({ message: 'Error', result: err });

    }
}));


router.get("/products/shortage/list", [Authenticator.auth], asyncWrapper(async (req, res) => {

    //we will obtain a timestamp from the first sale 
    //check for the number of products whose left = restock limit

    try {

        let product = await crudService.findAll('Product');

        let shortage = product.map(product => product.left <= product.restock)
        let data = shortage
        res.json({ message: 'Result', result: data });

    } catch (err) {

        console.log(err)
        res.json({ message: 'Error', result: err });

    }



}));

module.exports = router;