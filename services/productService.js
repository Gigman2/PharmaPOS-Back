const Sequelize   =  require('sequelize');
const Op  = Sequelize.Op

const DatabaseFunctions = require('../helpers/crud')
const Validation = require('../helpers/validation')
const models = require('../models');

const crudService = new DatabaseFunctions()

module.exports = class UserService{ 
  async authenticateData(data, type){
    let result = null;
    let errormessage;
    const validationResponse = Validation.product.validate(data)
    if(validationResponse.error !== undefined){
      errormessage = validationResponse.error.details[0].message.replace(/"/g, "")
      result = {
        code: 422,
        message: `${errormessage}`
      }
    }

    if(data.category){
      data.categoryId = data.category
      delete data.category
    }

    if(data.supplier){
      data.supplierId = data.supplier
      delete data.supplier
    }

    if(type == 'create'){
      var exist = await crudService.exists('Product', {name: data.name})
      if(exist){
        result = {
          code: 422,
          message: 'Products alreaday exist'
        }
      }
    }
    return result
  }

  async authenticateCategory(data, type){
    let result = null;
    let errormessage;
    const validationResponse = Validation.category.validate(data)
    if(validationResponse.error !== undefined){
      errormessage = validationResponse.error.details[0].message.replace(/"/g, "")
      result = {
        code: 422,
        message: `${errormessage}`
      }
    }

    if(type == 'create'){
      var userExist = await crudService.exists('Category', {name: data.name})
      if(userExist){
        result = {
          code: 422,
          message: 'Category with name already exist'
        }
      }
    }

    return result;
  }

  async authenticateSupplier(data, type){
    let result = null;
    let errormessage;
    const validationResponse = Validation.supplier.validate(data)
    if(validationResponse.error !== undefined){
      errormessage = validationResponse.error.details[0].message.replace(/"/g, "")
      result = {
        code: 422,
        message: `${errormessage}`
      }
    }
    return result;
  }

  async updateStock(data){
    try {
      return models.Stock.create(data)
    } catch (error) {
      console.log(error)
    }
  }

  async fetchSupplier(condition){
    try {
      let option = {
      }
      
      if(condition){
        option.where = condition
      }

      return models.Supplier.findAll(option) 
    } catch (error) {
      console.log(error)
    }
  }

  async fetchCategories(condition){
    try {
      let option = {
        include: [
          {
            model: models.User,
            as: 'addedby',
            required: false
          },
          {
            model: models.Product,
            as: 'products',
            required: false
          }
        ]
      }
      if(condition){
        option.where = condition
      }

      return models.Category.findAll(option) 
    } catch (error) {
      console.log(error)
    }
  }

  async fetchProducts(condition){
    try {
      return models.Product.findAll({
        where: condition,
        order: [['name', 'ASC']],
        include: [
          {
            model: models.Category,
            as: 'category',
            required: false
          },
        ]
      }) 
    } catch (error) {
      console.log(error)
    }
  }

  async fetchTopBestProduct(){
    try {
      let recentProducts = await models.ProductSale.findAll({
        attributes: [
          [Sequelize.fn('DISTINCT', Sequelize.col('productId')), 'productId'],
        ],
        limit: 20,
      })
      let recentProductsList = []
      if(recentProducts.length > 0){
        recentProductsList = await Promise.all(recentProducts.map(async item => {
          if(item.productId != null){
              let product = await models.Product.findOne({
                where: {id: item.productId}
              })
    
              if(product != null){
                return product
              }
          }
        }))
      }

      let products =await models.Product.findAll({
        order: Sequelize.literal('rand()'),
        limit: 100,
        include: [
          {
            model: models.Category,
            as: 'category',
            required: false
          },
        ]
      }) 

      return {
        recent: recentProductsList,
        products
      }
    } catch (error) {
      console.log(error)
    }
  }

  async fetchProduct(condition){
    try {
      return models.Product.findOne({
        where: condition,
        include: [
          {
            model: models.Category,
            as: 'category',
            required: false
          },
          {
            model: models.Supplier,
            as: 'supplier',
            required: false
          },
          {
            model: models.User,
            as: 'added',
            required: false
          },
          
          
        ]
      }) 
    } catch (error) {
      console.log(error)
    }
  }

  async fetchStock(){
    try {
      return models.Product.findAll({
        where: {
          quantity: {
            [Op.gt]: 0
          }
        },
        include: [
          {
            model: models.Category,
            as: 'category',
            required: false
          },
        ]
      }) 
    } catch (error) {
      console.log(error)
    }
  }
  
  async fetchTransactions(condition){
    try {
      return models.Sale.findAll({
        where: condition,
        order: [['updatedAt', 'DESC']],
        include: [
          {
            model: models.ProductSale,
            as: 'products',
            required: false,
            include: [
              {
                model: models.Product,
                as: 'product',
                required: false,
              }
            ]
          },
          {
            model: models.User,
            as: 'soldby',
            required: false,
          },
          {
            model: models.Customer,
            as: 'boughtBy',
            required: false,
          },
        ]
      }) 
    } catch (error) {
      console.log(error)
    }
  } 

  async fetchTransaction(id){
    try {
      return models.Sale.findOne({
        where: {
          id
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
                required: false,
              }
            ]
          },
        ]
      }) 
    } catch (error) {
      console.log(error)
    }
  }

  async fetchStockUpdated(){
    try {
      return models.Stock.findAll({
        where: {
        },
        include: [
          {
            model: models.Product,
            as: 'product',
            required: false,
          },
          {
            model: models.Supplier,
            as: 'supplier',
            required: false,
          }
        ]
      }) 
    } catch (error) {
      console.log(error)
    }
  }

  async updateStockAfterPurchase(transactionId){
    let sales = await crudService.findAll('ProductSale', {saleId: transactionId})
    sales.forEach(async item => {
      let product = await crudService.findOne('Product', {id: item.productId});
      let update = {}
      if(item.dispensation == 'single'){
        update.left = Number(product.left) - Number(item.quantity)
      }else if(item.dispensation == 'tab' || item.dispensation == 'strip'){
        update.pack_l =  Number(product.pack_l) - Number(item.quantity)
        while(update.pack_l <= 0){
          update.pack_l = parseInt(product.pack_q) + update.pack_l
          update.left = parseInt(product.left) - 1
        }
      }
      
      crudService.update('Product', update, {id: product.id})
    })
  }
}
