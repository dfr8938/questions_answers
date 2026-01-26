'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ActionLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Определяем связь с моделью User
      ActionLog.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  ActionLog.init({
    userId: DataTypes.INTEGER,
    actionType: DataTypes.STRING,
    description: DataTypes.TEXT,
    entityId: DataTypes.INTEGER,
    entityType: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ActionLog',
  });
  return ActionLog;
};