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
            var query = `SELECT * FROM stocks WHERE productId = "${item.id}"`;
            if(body.to && body.from){
                query = query+` AND (createdAT BETWEEN '${body.from}' AND '${body.to}')`;
            }
            query = query + ` ORDER BY createdAt asc`;
    
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
        console.log(body)
        var query = "SELECT * FROM users WHERE (role = 'admin' OR role = 'employee') ";
        if(body.name){
            query = query+"AND (firstname LIKE '%"+body.name+"%' OR lastname LIKE '%"+body.name+"%')";
        } 
        let data = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
        
        await Promise.all(data.map(async item => {
            let totalSales = 0;
            var query = `SELECT * FROM sales WHERE userId = "${item.id}"`;
            if(body.to && body.from){
                query = query+`createdAT BETWEEN '${body.from}' AND '${body.to}'`;
            }
            let sales = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
            sales.forEach(sale => {
                totalSales = totalSales + parseFloat(sale.grossTotal);
            })
            item.totalSales = totalSales;


            var query = `SELECT *, time(checkin) as c_in, time(checkout) as c_out FROM usersessions WHERE userId = "${item.id}"`;
            if(body.to && body.from){
                query = query+`createdAT BETWEEN '${body.from}' AND '${body.to}'`;
            }
            let allTime = [0, 0];
            let averageTime = [0, 0]
            let accountSessions = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
            accountSessions.forEach(session => {
                let sessions = [session.c_in, session.c_out];
                sessions.forEach((i, e) => {
                    if(sessions[e]){
                        let time = sessions[e].split(':')
                        let timeSum = (parseInt(time[0]) * 3600)+(parseInt(time[1]) * 60)+parseInt(time[2])
                        allTime[e] = allTime[e] + timeSum
                    }
                })
            })

            allTime.forEach((i, index) => {
                if(!isNaN((allTime[index] * 1000) / accountSessions.length)){
                    averageTime[index] = parseInt((allTime[index] * 1000) / accountSessions.length)   
                }

                let actualTime = '', s, m, h;

                h = parseInt(averageTime[index]/ 3600000);
                if(isNaN(h)){
                    h = 0
                }
                actualTime = actualTime + h

                averageTime[index] = averageTime[index] - (h * 3600000)
                if(averageTime[index] >= 60000){
                    m = parseInt(averageTime[index] / 60000)
                    if(String(m).length == 1){
                        m = '0'+m
                    }
                    averageTime[index] = averageTime[index] - (m * 60000)
                    actualTime = actualTime +':'+m
                }

                if(averageTime[index] >= 1000){
                    s = parseInt(averageTime[index]/ 1000)
                    if(String(s).length == 1){
                        s = '0'+s
                    }
                    averageTime[index] = averageTime[index] - (s * 1000)
                    actualTime = actualTime +':'+s
                }
                if(index == 0){
                    item.averageCheckin = actualTime
                }else if(index == 1){
                    item.averageCheckout = actualTime
                }


            })



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
            let discount = 0;
            var query = `SELECT * FROM sales WHERE customerId = ${item.id}`;
            let sales = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
            sales.forEach(sale => {
                totalSales = totalSales + parseFloat(sale.grossTotal);
                if(sale.discount == null || sale.discount === undefined || sale.discount == ''){
                    sale.discount = 0
                }
                discount = discount + parseFloat(sale.discount)
            })
            item.totalSales = totalSales;
            item.discount = discount
        }))
        return data
    }

    async supplierReport(body){
        var query = "SELECT * FROM suppliers";
        let data = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
        await Promise.all(data.map(async item => {
            var query = `SELECT * FROM products WHERE supplierId = ${item.id}`;
            let products = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
            item.products = products.length

            var query = `SELECT * FROM stocks WHERE supplierId = ${item.id}`;
            if(body.to && body.from){
                query = query+` AND (createdAT BETWEEN '${body.from}' AND '${body.to}')`;
            }
            query = query + ` ORDER BY id DESC`
            let stocks = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
            if(stocks.length > 0){
                item.entry = stocks[0].createdAt
            }
        }))
        return data
    }

}
