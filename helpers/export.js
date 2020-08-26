const models = require("../models")
const xl = require('excel4node');

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
                horizontal: 'center'
            }
        });

        let headerStyle =  wb.createStyle({
            font: {
              color: '#134f5c',
              size: 14,
              bold: true
            },
        });

        ws.cell (1, 1, 2, data.title.length, true)
        .string(data.business.name)
        .style(businessStyle);

        ws.cell (3, 1, 4, data.title.length, true)
        .string(data.name+' from '+ data.from +' to ' +data.to)
        .style(titleStyle);

        let keys =  Object.keys(data.title);

        console.log(keys)
        keys.forEach(async (key, i) => {
            await ws.cell(5, i+1)
            .string(data.title[key])
            .style(headerStyle);
            // ws.column(i+1).setWidth(data.title[key].length)
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

        wb.write(data.name.trim()+'.xlsx')
    }

    async pdfExport(){

    }
}