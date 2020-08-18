
const router = require("express").Router();
const Sequelize =  require('sequelize');
const Op = Sequelize.Op
const asyncWrapper = require("../helpers/async").AsyncWrapper;
const DatabaseFunc = require('../helpers/crud')
const Authenticator = require('../middlewares/auth-middleware')
const CustomError = require('../middlewares/error-handling')
const moment = require('moment');
const crudService = new DatabaseFunc; 

//sales
router.get("/sales-monthly", [Authenticator.auth], asyncWrapper(async (req, res) => {
    //get month begining to current month date
    //get the sales per month by getting their created at in the datbase
    // then display the total sales for the current month
    //  so calculate for all the sales for the curent month
    //add to an array then sum up

    try {

        let salesArray = await crudService.findAll('Sale', 
            { 
                createdAt: {
                    [Op.gte]: moment().add(-1, 'M').endOf('month').format('YYYY-MM-DD'),
                    [Op.lt]:  moment().add(1, 'M').startOf('month').format('YYYY-MM-DD')
                }
            }
        );
        
        console.log(salesArray)
        

        let salesData = []

        salesArray.map(item => {
            salesData.push(parseFloat(item.grossTotal));
        });
        
        salesData = salesData.reduce(function (sum, value) {
            return sum + value;
        });

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

        // let salesArray = await crudService.findAll('Sale', 
        //     { 
        //         createdAt: {
        //             [Op.gte]: moment().add(-1, 'M').endOf('month').format('YYYY-MM-DD'),
        //             [Op.lt]:  moment().add(1, 'M').startOf('month').format('YYYY-MM-DD')
        //         }
        //     }
        // );
        const TODAY_START = new Date().setHours(0, 0, 0, 0);
        const NOW = new Date();
        
        let salesArray = await crudService.findAll('Sale', 
            { 
                createdAt: {
                    [Op.gt]: TODAY_START,
                    [Op.lt]: NOW
                }
            }
        );
        
        console.log(salesArray)
        

        let salesData = {
            grossTotal: [],
            netTotal: []
        }

        salesArray.map(item => {
            salesData.grossTotal.push(parseFloat(item.grossTotal));
            salesData.netTotal.push(parseFloat(item.netTotal));
        });
        
        for (const [key, value] of Object.entries(salesData)) {
            console.log(salesData[key])
            if(salesData[key].length != 0){
                salesData[key] = salesData[key].reduce(function (sum, value) {
                    return sum + value;
                });
            }else{
                salesData[key] = salesData[key].length
            }
        }

        res.json({ message: 'Result', result: salesData });

    } catch (err) {
        console.log(err)
        res.json({ message: 'Error', result: err });
    }

}));


//stock worth 
router.get("/stock-worth", [Authenticator.auth], asyncWrapper(async (req, res) => {

    //obtain the number of products left
    //left is property in the products model(double)
    // by looping through all the left property and suming up the prices
    // we should obtain the stock worth

    try {
        //obtains the left propert
        let products = await crudService.findAll('Product');

        let stockWorthArray = products.map(product => product.left * product.price)

        //converting object to array
        let shortageList = products.filter(product => product.left <= product.restock)
        let shortage = shortageList.length
        
        let stockWorth = stockWorthArray.reduce(function (sum, value) {
            return sum + value;
        });

        let data = { shortage: shortage, stockWorth: stockWorth, products: shortageList }


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

        let employeeData = await crudService.listAll('User', { role: "employee" })
        let adminData = await crudService.listAll('User', { role: "admin" })

        employeeData = employeeData.map(user => user.role);
        adminData = adminData.map(user => user.role);

        let employees = employeeData.length
        let admins = adminData.length
        let data = { admins: admins, employees: employees }

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