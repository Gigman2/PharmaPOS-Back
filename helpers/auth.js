const fs     = require('fs');
const path   = require('path');
const jwt    = require('jsonwebtoken');
const bcrypt   = require('bcryptjs')

const config = require(__basedir + '/config/index.js');

var secretkey  = config.jwt.secret

module.exports = { 
  sign: (payload, options) => {

    var signOptions = {
          issuer:  options.issuer,
          audience:  options.audience,
          expiresIn:  config.jwt.expiration,  
    };
    return jwt.sign(payload, secretkey, signOptions); 
  },
  verify: (token, $Option) => {
    
    var verifyOptions = {
          issuer:  $Option.issuer,
          audience:  $Option.audience,
          expiresIn:  config.jwt.expiration
    };
    try{
      return jwt.verify(token, secretkey, verifyOptions);
    }catch (err){
      return false;
    }
  },
  decode: (token) => {
      return jwt.decode(token, {complete: true});
  }, 
  save: (Model, data) => {
    var condition = {}
    condition = {userId: data.id}
    
    Model.findOne({where: condition})
    .then(result => {
      if(result != null){
        let new_obj = {
          token: data.token,
          last_used: new Date,
          account: data.account
        }
        new_obj.use_count = result.use_count + 1;
        Model.update(new_obj, {where: condition}).then(updated => {})
      }else{
        data.last_used = new Date,
        data.use_count = 1
        Model.create(data).then(created => {
        })
      }
    })
  },
  exist: async(Model, req_token) => {
    let err, result;
    [err, result] = await to(Model.findOne({where: {token: req_token}}))

    if(err) return false
    if(result == null) return false

    return true;
  },

  delete: async(Model, req_token) => {
      let err, result, deleted;
      [err, result] = await to(Model.findOne({where: {token: req_token}}))

      if(err) return false
      if(result == null){
        return false
      }else{
        deleted = result.destroy({ force: true });
      }

      if(err) {
        console.log(err)
        return false;
      }
      
      return true;
  },
  hash: async(data) => {
    let salt, hash;
    salt = await bcrypt.genSalt(10);

    hash = await bcrypt.hash(data.password, salt);
    data.password = hash;
    return data
  }
}
