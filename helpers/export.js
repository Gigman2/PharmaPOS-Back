const models = require("../models")
const xl = require('excel4node');
const path = require("path")
const util = require('util');

module.exports = class DataExport {
    async setExcelTitle(data){
        var mergeCells = []

        data.title.forEach((item, j) => {
            mergeCells.push(1)
            mergeCells.push(j+1)
        }) 

        return mergeCells
    }

    async excelExport(data, res){
        var wb = new xl.Workbook();
        var ws = wb.addWorksheet('Sheet');
        
        let businessStyle =  wb.createStyle({
            font: {
              color: '#134f5c',
              size: 28,
              bold: true
            },
            alignment: {
                horizontal: 'center'
            }
        });

        let titleStyle =  wb.createStyle({
            font: {
              color: '#134f5c',
              size: 17,
              bold: true
            },
            alignment: {
                horizontal: 'center',
                vertical: 'center'
            }
        });

        let headerStyle =  wb.createStyle({
            font: {
              color: '#134f5c',
              size: 14,
              bold: true
            },
        });
        
        let keys =  Object.keys(data.title);


        ws.cell (1, 1, 2, keys.length, true)
        .string(data.business.name)
        .style(businessStyle);

        let title = data.name;
        if(data.from && data.to){
            title = title +' between '+data.from+' and '+data.to
        }
        ws.cell (3, 1, 4, keys.length, true)
        .string(title)
        .style(titleStyle);


        keys.forEach(async (key, i) => {
            console.log((key.length+7)*1.5)
            await ws.cell(5, i+1)
            .string(data.title[key])
            .style(headerStyle);
            ws.column(i+1).setWidth((key.length+5)*1.5)
        })


        let json = data.data
        let row = 6
        json.forEach(async(obj, i) => {
            let j = 1; 
            console.log('*******************************')
            keys.forEach(async (key, index) => {
                if(typeof obj[key] == 'number'){
                    ws.cell(row+i, j)
                    .number(obj[key])
                }

                if(typeof obj[key] == 'string'){
                    ws.cell(row+i, j)
                    .string(obj[key])
                }
                console.log('cell: ', row+i,',',j,'   ', obj[key])
                j++;
            })
        })

        wb.writeP = util.promisify(wb.write);
        
        let name = data.name.trim().replace(' ','_').toLowerCase()+'-'+Date.now()
        await wb.writeP(path.resolve(__dirname, '..', 'download', name+'.xlsx'))
        return name
    }

    async pdfExport(){

    }
}