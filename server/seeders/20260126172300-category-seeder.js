'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Проверяем, существуют ли уже категории в базе данных
    const existingCategories = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM "Categories"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    // Если категории уже существуют, пропускаем создание
    if (existingCategories[0].count > 0) {
      console.log('Категории уже существуют в базе данных. Пропускаем создание сидов.');
      return;
    }
    
    // Создаем начальные категории
    const categories = [
      {
        name: 'Профилактика',
        description: 'Вопросы о профилактике заболеваний и поддержании здоровья',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Вакцинация',
        description: 'Информация о вакцинах и прививках',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Питание',
        description: 'Вопросы о правильном питании и диетах',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Инфекционные болезни',
        description: 'Информация о вирусах, бактериях и инфекциях',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Кардиология',
        description: 'Вопросы о сердечно-сосудистой системе',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ортопедия',
        description: 'Информация о заболеваниях опорно-двигательного аппарата',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Онкология',
        description: 'Вопросы о онкологических заболеваниях',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Добавляем категории из массива категорий в сиде вопросов
    const additionalCategories = [
      'Эндокринология',
      'Пульмонология', 
      'Гастроэнтерология',
      'Неврология',
      'Урология',
      'Гинекология',
      'Ортопедия', 
      'Онкология',
      'Терапия'
    ];
    
    additionalCategories.forEach((categoryName, index) => {
      categories.push({
        name: categoryName,
        description: `Вопросы по категории ${categoryName}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
    
    await queryInterface.bulkInsert('Categories', categories, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};