const Sequelize   =  require('sequelize');
const Op  = Sequelize.Op

const DatabaseFunctions = require('../helpers/crud')
const Validation = require('../helpers/validation')
const models = require('../models');
const { query } = require('express');

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


  async fetchCategories(){
    try {
      return models.Category.findAll({
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
      }) 
    } catch (error) {
      console.log(error)
    }
  }

  async fetchProducts(condition){
    try {
      return models.Product.findAll({
        where: condition,
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
  
  async fetchTransactions(){
    try {
      return models.Sale.findAll({
        where: {
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
    let sales = await crudService.findAll('ProductSale', {id: transactionId})
    sales.forEach(async item => {
      let product = await crudService.findOne('Product', {id: item.productId});

      crudService.update('Product', {left: product.left - (item.quantity)}, {id: product.id})
    })
  }
}
