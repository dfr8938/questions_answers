const express = require('express');
const router = express.Router();
const { Category, Question } = require('../models');
const { Op } = require('sequelize');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * Маршрут для получения всех категорий
 * Доступен без аутентификации (публичный маршрут)
 */
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

/**
 * Маршрут для получения всех вопросов в категории
 * Доступен только для администраторов
 */
router.get('/:id/questions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем существование категории
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    
    // Получаем все вопросы в категории
    const questions = await Question.findAll({
      where: { categoryId: id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(questions);
  } catch (error) {
    console.error('Ошибка при получении вопросов категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/**
 * Маршрут для создания новой категории
 * Доступен только для администраторов
 */
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

/**
 * Маршрут для обновления категории
 * Доступен только для администраторов
 */
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

/**
 * Маршрут для удаления всех вопросов в категории
 * Доступен только для администраторов
 */
router.delete('/:id/questions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем существование категории
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    
    // Удаляем все вопросы в категории
    const deletedCount = await Question.destroy({ where: { categoryId: id } });
    
    // Очищаем кэш после удаления вопросов
    const { cache } = require('../controllers/questionController');
    if (cache) {
      cache.flushAll();
    }
    
    res.json({ message: `Удалено ${deletedCount} вопросов из категории` });
  } catch (error) {
    console.error('Ошибка при удалении вопросов категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

/**
 * Маршрут для удаления категории
 * Доступен только для администраторов
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем существование категории
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    
    // Сначала удаляем все вопросы в категории
    await Question.destroy({ where: { categoryId: id } });
    
    // Затем удаляем саму категорию
    await Category.destroy({ where: { id } });
    
    res.json({ message: 'Категория и все вопросы в ней успешно удалены' });
    
    // Очищаем кэш после удаления категории
    const { cache } = require('../controllers/questionController');
    if (cache) {
      cache.flushAll();
    }
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;