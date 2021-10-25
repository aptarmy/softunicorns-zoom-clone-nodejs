'use strict';
const { v4: uuid } = require('uuid');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, { foreignKey: 'ownerId', as: 'owner' });
      this.belongsToMany(models.user, { through: models.room_user, as: 'participants' });
      this.hasMany(models.room_user);
    }
  };
  room.init({
    ownerId: DataTypes.INTEGER,
    slug: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'room',
  });
  room.beforeCreate((room, _) => {
    return room.slug = uuid();
  });
  return room;
};