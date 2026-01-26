'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Проверяем, существуют ли уже пользователи в базе данных
    const existingUsers = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM "Users"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    // Если пользователи уже существуют, пропускаем создание
    if (existingUsers[0].count > 0) {
      console.log('Пользователи уже существуют в базе данных. Пропускаем создание сидов.');
      return;
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('superadmin123', salt);
    
    // Создаем массив для 7 дополнительных администраторов
    const adminUsers = [];
    
    // Добавляем суперадмина и админа
    adminUsers.push(
      {
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: hashedPassword,
        role: 'superadmin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', salt),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );
    
    // Добавляем 7 дополнительных администраторов
    for (let i = 1; i <= 7; i++) {
      adminUsers.push({
        username: `admin${i}`,
        email: `admin${i}@example.com`,
        password: await bcrypt.hash(`admin${i}123`, salt),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await queryInterface.bulkInsert('Users', adminUsers, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
