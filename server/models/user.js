'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Определяем связь с логами действий
      User.hasMany(models.ActionLog, {
        foreignKey: 'userId',
        as: 'actionLogs'
      });
    }
    
    // Метод для проверки пароля
    async validPassword(password) {
      return await bcrypt.compare(password, this.password);
    }
    
    // Метод для проверки, является ли пользователь суперадмином
    isSuperAdmin() {
      return this.role === 'superadmin';
    }
  }
  
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Имя пользователя не может быть пустым'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Некорректный формат email'
        },
        notEmpty: {
          msg: 'Email не может быть пустым'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Пароль не может быть пустым'
        },
        len: {
          args: [6, 100],
          msg: 'Пароль должен содержать минимум 6 символов'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'superadmin'),
      defaultValue: 'admin'
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  
  return User;
};