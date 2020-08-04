const DatabaseFunctions = require('../helpers/crud')
const Validation = require('../helpers/validation')

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

    // if(type == 'create'){
    //   var userExist = await crudService.exists('Product', {email: data.email})
    //   if(userExist){
    //     result = {
    //       code: 422,
    //       message: 'User with email already exist'
    //     }
    //   }
    // }
    return result
  }

}
