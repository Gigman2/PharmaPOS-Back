const Sequelize   =  require('sequelize');
const Op  = Sequelize.Op

const DatabaseFunctions = require('../helpers/crud')
const Validation = require('../helpers/validation')
const models = require('../models')

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

  async fetchProjects(){
    try {
      return models.Product.findAll({
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

}
