const DatabaseFunctions = require('../helpers/crud')
const Validation = require('../helpers/validation')

const crudService = new DatabaseFunctions()

module.exports = class UserService{ 
  async authenticateData(data, type){
    let result = null;
    let errormessage;
    const validationResponse = Validation.createUser.validate(data)
    if(validationResponse.error !== undefined){
      console.log(validationResponse.error)
      errormessage = validationResponse.error.details[0].message.replace(/"/g, "")
      result = {
        code: 422,
        message: `${errormessage}`
      }
    }

    if(type == 'create'){
      var userExist = await crudService.exists('User', {email: data.email})
      if(userExist){
        result = {
          code: 422,
          message: 'User with email already exist'
        }
      }
    }
    return result
  }

  async signinUserCheck(data) {
    let result = null;
    let errormessage;
    const validationResponse = Validation.loginUser.validate(data)
    if(validationResponse.error !== undefined){
      errormessage = validationResponse.error.details[0].message.replace(/"/g, "")
      result = {
        code: 422,
        message: `${errormessage}`
      }
    }

    return result
  }
  
  async signinUser(requestBody){
    let user = await crudService.findOne('User', {email: requestBody.email, active: true})
    if(user){
        var result = await user.comparePassword(requestBody.password)
        if(result == null){
          return {
            error:{
              code: 422,
              message: 'Account does not exist'
            }, 
            data: null
          }
        }
    }else{
      return {
        error:{
          code: 422,
          message: 'Account does not exist'
        }, 
      data: null
      }
    }

    crudService.update('User', {lastLogin: new Date}, {id: user.id})
    let serialized = user.toWeb()
    
    delete serialized.password
    delete serialized.id

    return {
      error:null,
      data: serialized,
      user: user
    }
  }

  
}
