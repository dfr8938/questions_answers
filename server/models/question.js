'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Определяем связи (если нужно)
      Question.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'categoryRef'
      });
    }
  }
  
  Question.init({
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Вопрос не может быть пустым'
        }
      }
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Ответ не может быть пустым'
        }
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Question',
  });
  
  return Question;
};