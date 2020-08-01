'use strict';

const config = require('../config');
const fs = require('fs');
const path =require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const db = {};
 
let sequelize;

const db_config = config.database
if(config.database.url != ''){
  sequelize = new Sequelize(config.database.url, config.database)
}else{
  sequelize = new Sequelize(config.database.name, config.database.username, config.database.password, config.database);
}

sequelize.authenticate()
  .then(() => {
    console.log('Database connected ...')
    // logger.info('✌ ================ Database connected =====================')
});


fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// console.log(sequelize)

db.sequelize = sequelize;
db.Sequelize = Sequelize;


module.exports = db;
