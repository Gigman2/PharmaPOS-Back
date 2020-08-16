const Sequelize   =  require('sequelize');
const Op  = Sequelize.Op
const Printer = require('printer')

const scanner = require('../helpers/barcode')
const printer = require('../helpers/printer')
const DatabaseFunctions = require('../helpers/crud')
const Validation = require('../helpers/validation')
const models = require('../models')
const config = require('../config')

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
        printer.print("SLUXIPOS");   
        printer.drawLine(); 
        
        printer.newLine();  
        printer.newLine();  
        printer.print(data.grossTotal);  
        printer.drawLine(); 

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
