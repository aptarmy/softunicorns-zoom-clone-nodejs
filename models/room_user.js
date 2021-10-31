'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class room_user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.room);
      this.belongsTo(models.user);
      this.hasMany(models.room_user_socket, { foreignKey: 'roomUserId', as: 'sockets' });
    }
  };
  room_user.init({
    roomId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    admitted: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'room_user',
  });
  return room_user;
};