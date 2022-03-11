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

        let stockWorthArray = await Promise.all(products.map(product => 
        {   
            let worth = 0
            if(product.dispensation == 'single'){
                worth = product.left * product.price;
            }else if(product.dispensation == 'strip'|| product.dispensation == 'tab' ){
                worth = ((product.pack_q * product.left) + product.pack_l) * product.price;
            }
            if(worth != '' ){
                return parseFloat(worth);
            }
            return 0;
        }))

        let stockWorth = await stockWorthArray.reduce(function (sum, value) {
            if(isNaN(value)){
                return 0;
            }

            return sum + value;
        });

        //retrieving shortage list
        let shortageList = products.filter(product => product.quantity <= product.restock)
        let shortage = shortageList.length

        //retrieving shortage list
        let expiredList = await products.filter(product => {
            let now = moment().format('YYYY-MM-DD')
            let expired = moment().isAfter(product.expiry)
            if(expired){
                return product
            }else{
                var exirationDifference = moment(product.expiry).diff(now, 'days');
                if(exirationDifference <= 90){
                    return product
                }
            }
        })

        // console.log(expiredList)
        
        //return stock worth;

        return { shortage: shortage, stockWorth: stockWorth, products: shortageList, expiring: expiredList }
    }

    async totalAccounts(){
        let accounts = await crudService.findAll('User')

        let employee = 0;
        let admin = 0;
        let active = 0;

        accounts.forEach(item => {
            if(item.role == 'employee'){
                employee = employee + 1
            }

            if(item.role == 'admin'){
                admin = admin + 1
            }

            if(item.active == true){
                active = active + 1
            }
        })

        return { admins: admin, employees: employee, all:  accounts.length, active}
    }

    async salesGraph(){

        var sales_query = `SELECT DAY(createdAt) as day, MONTH(createdAt) AS month, YEAR(createdAt) AS year, SUM(grossTotal) as total FROM sales WHERE state = 'complete'  GROUP BY DAY(createdAt)`
       
        // let sales = await sequelize.query("SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))")
        .then(async () => {
            return await sequelize.query(sales_query, { type: Sequelize.QueryTypes.SELECT })
        })
        
        return sales
    }

    async salesReport(body){
        var query = `SELECT SUM(grossTotal) as closing_cash, SUM(cashAmount) as cash, SUM(momoAmount) as momo,MIN(id) as firstID, MAX(id) as lastID  FROM sales WHERE (createdAT BETWEEN '${body.from}' AND '${body.to}') GROUP BY DAY(createdAt)`
        // let data = await sequelize.query("SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))")
        .then(async () => {
            return await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
        })
       
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
            let quantity = 0;
            salesproducts.forEach(product => {
                quantity = quantity + parseInt(product.quantity);
            })
            let quantitysold = ''
            if(quantity != 0){
                quantitysold = quantity
            }

            if(quantitysold == ''){
                quantitysold = '--'
            }
            item.quantitysold = quantitysold

            var query = `SELECT * FROM suppliers WHERE id = "${item.supplierId}"`;
            let suppliers = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
            item.supplier = suppliers
        }))
        return data
    }

    async userReport(body){
        console.log(body)
        var query = "SELECT * FROM users";
        if(body.name){
            query = query+"AND (firstname LIKE '%"+body.name+"%' OR lastname LIKE '%"+body.name+"%')";
        } 
        let data = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })
        
        await Promise.all(data.map(async item => {

            let role = await crudService.findOne('Role', {id:  item.roleId});
            item.role = role.name;

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
