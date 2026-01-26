const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const { Op } = require('sequelize');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Получение всех категорий (публичный маршрут)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создание новой категории (только для админов)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Проверка обязательных полей
    if (!name) {
      return res.status(400).json({ message: 'Название категории обязательно для заполнения' });
    }
    
    // Проверка существующей категории с таким именем
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Категория с таким названием уже существует' });
    }
    
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление категории (только для админов)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Проверка существующей категории с таким именем (исключая текущую)
    if (name) {
      const existingCategory = await Category.findOne({ 
        where: { 
          name,
          id: { [Op.ne]: id }
        } 
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Категория с таким названием уже существует' });
      }
    }
    
    const [updated] = await Category.update(
      { name, description },
      { where: { id } }
    );
    
    if (updated === 0) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    
    const category = await Category.findByPk(id);
    res.json(category);
  } catch (error) {
    console.error('Ошибка при обновлении категории:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удаление категории (только для админов)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем, есть ли вопросы в этой категории
    const { Question } = require('../models');
    const questionsCount = await Question.count({ where: { categoryId: id } });
    
    if (questionsCount > 0) {
      return res.status(400).json({ 
        message: `Невозможно удалить категорию, так как в ней содержится ${questionsCount} вопросов. Сначала удалите или переместите вопросы.` 
      });
    }
    
    const deleted = await Category.destroy({ where: { id } });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    
    res.json({ message: 'Категория успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;