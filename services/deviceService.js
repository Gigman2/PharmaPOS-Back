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
        let imagePath = path.resolve(__dirname, '..', 'uploads', data.business.logo);

        printer.alignCenter()
        printer.bold(true);
        printer.setTextSize(1,1);
        await printer.printImage(imagePath); 
        printer.newLine();
        printer.print(data.business.name); 
        printer.alignCenter()

        printer.newLine();
        printer.bold(false);
        printer.setTextNormal();
        printer.print('Addr: '+data.business.address + ' | '+'Email: '+ data.business.email+ ' | '+'Tele: '+ data.business.phone+' / 0203414477');  
        printer.newLine();

        printer.print("Date: "+ Moment().format('D-MM-YYYY h:mm a') );  
        printer.newLine();
        
        printer.print("Invoice No: #");
        printer.print(data.transaction.id)
        printer.print(" | Issuer: ")
        printer.print(data.issuer)

        printer.newLine();
        printer.drawLine();  

        printer.bold(true);
        printer.tableCustom([
            {text: 'NAME', align: "LEFT", width:0.4, bold: true},
            {text: 'RATE', align: "CENTER", width:0.2, bold: true},
            {text: 'QTY', align: "CENTER", width:0.1, bold: true},
            {text: 'AMT', align: "RIGHT", width:0.2, bold: true}
        ])
        
        printer.bold(false); 
        if(data.transaction){
            data.transaction.products.forEach(item => {
                let row = [
                    {text: item.product.name, align: "LEFT", width:0.4},
                    {text: item.price, align: "CENTER", width:0.2},
                    {text: item.quantity, align: "CENTER", width:0.1},
                    {text: item.total, align: "RIGHT", width:0.2}
                ]; 

                printer.newLine();
                printer.tableCustom(row)
            })
        }
        
        printer.drawLine();
        printer.tableCustom([
            {text: 'Total', align: "LEFT", width:0.5, bold: true},
            {text: data.transaction.grossTotal,bold: true, align: "RIGHT", width:0.5}
        ])

        printer.bold(false)
        printer.setTextNormal();

        printer.tableCustom([
            {text: 'cash', align: "LEFT", width:0.6},
            {text: data.transaction.cashAmount, align: "RIGHT", width:0.4}
        ])

        printer.tableCustom([
            {text: 'mobile money', align: "LEFT", width:0.6},
            {text: data.transaction.momoAmount, align: "RIGHT", width:0.4}
        ])

        printer.drawLine();
        printer.print('Thank You ')
        if(data.transaction.boughtBy){
            printer.print(data.transaction.boughtBy.firstname)
            printer.print(' ')
            printer.print(data.transaction.boughtBy.lastname)
        }
        printer.print('. Please call again');
        printer.newLine();

        printer.setTextNormal()
        printer.print('Software by Sluxify.com'+ '|' + '+233552375017')
        printer.newLine();
        printer.drawLine();

        printer.cut()
        if(data.openCash){
            printer.openCashDrawer()
        }
        
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
