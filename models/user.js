'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.room_user_socket);
      this.hasMany(models.room, { foreignKey: 'ownerId', as: 'created_rooms' });
      this.belongsToMany(models.room, { through: models.room_user, as: 'joined_rooms' });
      this.hasMany(models.room_user);
    }
  };
  user.init({
    fName: DataTypes.STRING,
    lName: DataTypes.STRING,
    email: DataTypes.STRING,
    imgUrl: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};