const Sequelize   =  require('sequelize');
const Op  = Sequelize.Op

const Validation = require('../helpers/validation')
const models = require('../models');
const sequelize = models.sequelize
const moment = require('moment')

const DatabaseFunctions = require('../helpers/crud')
const crudService = new DatabaseFunctions()

module.exports = class AnalyticsService{ 
  async salesMonthly(data, type){
    let salesArray = await crudService.findAll('Sale', 
        {   
            state: 'complete',
            createdAt: {
                [Op.gte]: moment().add(-1, 'M').endOf('month').format('YYYY-MM-DD'),
                [Op.lt]:  moment().add(1, 'M').startOf('month').format('YYYY-MM-DD')
            }
        }
    );

    let salesData = []

    await Promise.all(salesArray.map(item => {
        salesData.push(parseFloat(item.grossTotal));
    }));
    
    salesData = salesData.reduce(function (sum, value) {
        return sum + value;
    });
    return salesData
  }

  async sales(){
    const TODAY_START = new Date().setHours(0, 0, 0, 0);
    const NOW = new Date();
    
    let salesArray = await crudService.findAll('Sale', 
        { 
            state: 'complete',
            createdAt: {
                [Op.gt]: TODAY_START,
                [Op.lt]: NOW
            }
        }
    );

    let salesData = {
        grossTotal: [],
        netTotal: []
    }

    await Promise.all(salesArray.map(item => {
        salesData.grossTotal.push(parseFloat(item.grossTotal));
        salesData.netTotal.push(parseFloat(item.netTotal));
    }));
    
    for (const [key, value] of Object.entries(salesData)) {
        if(salesData[key].length != 0){
            salesData[key] = salesData[key].reduce(function (sum, value) {
                return sum + value;
            });
        }else{
            salesData[key] = salesData[key].length
        }
    }

    return salesData
  }

  async stockWorth(){
    let products = await crudService.findAll('Product');

    let stockWorthArray = await Promise.all(products.map(product => product.left * product.price))

    //converting object to array
    let shortageList = products.filter(product => product.left <= product.restock)
    let shortage = shortageList.length
    
    let stockWorth = stockWorthArray.reduce(function (sum, value) {
        return sum + value;
    });

    return { shortage: shortage, stockWorth: stockWorth, products: shortageList }
  }

  async totalAccounts(){
    let employeeData = await crudService.listAll('User', { role: "employee" })
    let adminData = await crudService.listAll('User', { role: "admin" })

    employeeData = employeeData.map(user => user.role);
    adminData = adminData.map(user => user.role);

    let employees = employeeData.length
    let admins = adminData.length
    return { admins: admins, employees: employees }
  }

  async salesGraph(){

        var sales_QUERY = `SELECT DAY(createdAt) as day, MONTH(createdAt) AS month, YEAR(createdAt) AS year, SUM(grossTotal) as total FROM sales WHERE state = 'complete'  GROUP BY DAY(createdAt)`
       
        let sales = await sequelize.query("SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))")
        .then(async () => {
            return await sequelize.query(sales_QUERY, { type: Sequelize.QueryTypes.SELECT })
        })
        
        return sales
    }
}
