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

    async salesReport(body){
        var query = `SELECT SUM(grossTotal) as closing_cash, SUM(cashAmount) as cash, SUM(momoAmount) as momo,MIN(id) as firstID, MAX(id) as lastID  FROM sales WHERE createdAT BETWEEN '${body.from}' AND '${body.to}' GROUP BY DAY(createdAt)`
        let data = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })

        console.log(data)
        await Promise.all(data.map(async item => {
            let sales = await models.Sale.findAll({
                where: {
                    id: {
                        [Op.and]:{
                            [Op.gte]: item.firstID,
                            [Op.lte]: item.lastID,
                        }
                    }
                },
                include: [
                    {
                        model: models.ProductSale,
                        as: 'products',
                        required: false,
                        include: [
                            {
                                model: models.Product,
                                as: 'product',
                                required: false
                            }
                        ]
                    },
                    {
                        model: models.User,
                        as: 'soldby',
                        required: false
                    }
                ]
            })
            let customers = []
            sales.forEach(sale => {
                if(!customers.includes(sale.customerId) && sale.customerId != null){
                    customers.push(sale.customerId)
                }

                if(sale.id == item.lastID){
                    item.stockWorth = sale.stockWorth;
                    item.lastTransaction = sale.updatedAt;
                    if(sale.soldby){
                        item.employee = sale.soldby.firstname+' '+sale.soldby.lastname
                    }
                }
            })
            item.customers = customers.length;
        }))

        return data
    }

    async inventoryReport(body){
        var query = "SELECT * FROM products WHERE ";
        if(body.to && body.from){
            query = query+`createdAT BETWEEN '${body.from}' AND '${body.to}'`;
        }

        if(body.name){
            if(query != ''){
                query = query + ' AND '
            }
            query = query+" name LIKE '%"+body.name+"%'";
        }
        let data = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })

        await Promise.all(data.map(async item => {
            var query = `SELECT * FROM stocks WHERE productId = "${item.id}" ORDER BY createdAt asc`;
            let stock = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
            item.timesrestocked = stock.length
            item.firstStock = stock[0]
            item.lastStock = stock[stock.length-1]

            var query = `SELECT * FROM productSales WHERE productId = "${item.id}"`;
            let salesproducts = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
            let count = 0;
            salesproducts.forEach(product => {
                count = count + parseInt(product.quantity)
            })
            item.quantitysold = count

            var query = `SELECT * FROM suppliers WHERE id = "${item.supplierId}"`;
            let suppliers = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
            item.supplier = suppliers
        }))
        return data
    }

    async userReport(body){
        var query = "SELECT * FROM users WHERE (role = 'admin' OR role = 'employee') ";
        if(body.name != ''){
            query = query+"AND (firstname LIKE '%"+body.name+"%' OR lastname LIKE '%"+body.name+"%')";
        } 
        let data = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
        
        await Promise.all(data.map(async item => {
            let totalSales = 0;
            var query = `SELECT * FROM sales WHERE userId = "${item.id}"`;
            let sales = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
            sales.forEach(sale => {
                totalSales = totalSales + parseFloat(sale.grossTotal);
            })
            item.totalSales = totalSales;
        }))
        return data
    }

    async customerReport(body){
        var query = "SELECT * FROM customers";
        if(body.name){
            query = query+" WHERE (firstname LIKE '%"+body.name+"%' OR lastname LIKE '%"+body.name+"%')";
        }
        let data = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
        
        await Promise.all(data.map(async item => {
            let totalSales = 0;
            var query = `SELECT * FROM sales WHERE customerId = ${item.id}`;
            let sales = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
            sales.forEach(sale => {
                totalSales = totalSales + parseFloat(sale.grossTotal);
            })
            item.totalSales = totalSales;
        }))
        return data
    }

}
