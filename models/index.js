'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};
const chalk = require('chalk');

let sequelize;
if (config.connection_uri) {
  sequelize = new Sequelize(config.connection_uri, { ...config, logging: customLogging });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, { ...config, logging: customLogging });
}

function customLogging(query, parameters) {
  console.log(`💾 ${chalk.yellow.inverse(`${new Date().toLocaleString()}`)}`);
  console.log(chalk.green(query));
  if(parameters.bind) { console.log(`(${parameters.bind.map((param, index) => `${chalk.green.inverse(`$${index+1}`)}: ${param}`).join(', ')})`) }
    console.log(chalk.yellow('================'));
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
