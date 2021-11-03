'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class room_user_socket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user);
      this.belongsTo(models.room_user, { foreignKey: 'roomUserId' });
    }
  };
  room_user_socket.init({
    roomUserId: DataTypes.INTEGER,
    socketId: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    micMuted: DataTypes.BOOLEAN,
    cameraMuted: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'room_user_socket',
  });
  return room_user_socket;
};