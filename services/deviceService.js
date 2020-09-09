const Sequelize   =  require('sequelize');
const Op  = Sequelize.Op
const Printer = require('printer')
const path = require('path')
const Moment = require('moment');

const scanner = require('../helpers/barcode')
const printer = require('../helpers/printer')
const DatabaseFunctions = require('../helpers/crud')
const Validation = require('../helpers/validation')
const models = require('../models')
const config = require('../config');
const business = require('../models/business');

const crudService = new DatabaseFunctions()

module.exports = class DeviceService{ 
    async printerConnected(){
        return await printer.isPrinterConnected()
    }

    async printerInfo(){
        var info = await Printer.getPrinter(config.printer.name)
        return info
    }

    async printReceipt(data){
        printer.drawLine();
        printer.newLine();
        printer.newLine();
        printer.bold(true);
        printer.setTextSize(1,1);
        printer.print(data.business.name); 
        printer.alignCenter()

        printer.newLine();
        printer.bold(false);
        printer.setTextNormal();
        printer.print('Addr: '+data.business.address);  
        printer.newLine();
        printer.print('Email: '+ data.business.email); 
        printer.newLine();
        printer.print('Tele: '+ data.business.phone); 
        printer.newLine();
        printer.drawLine();

        printer.leftRight("Date: "+ Moment().format('D MMMM YYYY'), Moment().format('h:mm a'));  
        printer.leftRight("Issuer: ", data.issuer);
        printer.leftRight("Invoice No: ", '#'+data.transaction.id);  
        printer.drawLine();  

        printer.bold(true);
        printer.leftRight("Description", 'Price'); 
        
        printer.bold(false); 
        if(data.transaction){
            let table = [];
            data.transaction.products.forEach(item => {
                let row = [
                    {text: item.packBought+'.'+item.packBought+' x '+item.product.name, align: "LEFT", width:0.8},
                    {text: item.total, align: "RIGHT", width:0.2}
                ]; 

                printer.newLine();
                printer.tableCustom(row)
            })
        }

        // printer.drawLine();
        // printer.tableCustom([
        //     {text: 'Tax (1.5%)', align: "LEFT", width:0.5},
        //     {text: data.transaction.tax, align: "RIGHT", width:0.5}
        // ])
        
        printer.drawLine();
        printer.tableCustom([
            {text: 'Total', align: "LEFT", width:0.5, bold: true},
            {text: data.transaction.grossTotal,bold: true, align: "RIGHT", width:0.5}
        ])

        printer.bold(false)
        printer.setTextNormal();

        printer.tableCustom([
            {text: 'cash', align: "LEFT", width:0.7},
            {text: data.transaction.cashAmount, align: "RIGHT", width:0.3}
        ])

        printer.tableCustom([
            {text: 'mobile money', align: "LEFT", width:0.7},
            {text: data.transaction.momoAmount, align: "RIGHT", width:0.3}
        ])

        printer.drawLine();

        printer.setTextSize(1,1); 
        printer.print('Thank You'); 
        printer.newLine();

        printer.newLine();
        printer.setTextNormal()
        printer.print('Software by Sluxify.com')
        printer.newLine();
        printer.print('+233552375010')

        printer.alignCenter()
        printer.newLine();
        printer.drawLine();
        printer.newLine();
        printer.newLine();
        printer.newLine();


        // printer.cut()
        printer.openCashDrawer()
        
        await printer.execute();  

        printer.clear()
    }

    async scannersInfo(){
        let scanners = await scanner.devices()
        let activeScanners = scanners.find(item => item.product !== undefined)
        if(activeScanners instanceof Object){
            activeScanners = [activeScanners]
        }
        return activeScanners
    }
}
