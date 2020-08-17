const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const config = require('../config')

printer = new ThermalPrinter({ 
    type: PrinterTypes.EPSON,
    interface: 'printer:'+config.printer.name,
    driver: require('printer'),
    lineCharacter: "-",  
    width: config.printer.paperWidth
});


module.exports = printer