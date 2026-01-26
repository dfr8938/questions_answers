const express = require('express')
const router = express.Router()
const { Question } = require('../models')
const { authenticateToken, requireAdmin } = require('../middleware/auth')
const { Op } = require('sequelize')
const sequelize = require('../config/database')
const NodeCache = require('node-cache')


// Создаем экземпляр кэша с TTL 5 минут
const cache = new NodeCache({ stdTTL: 300 })

// Получение всех вопросов (публичный маршрут) с кэшированием
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC' } = req.query
    
    // Создаем ключ кэша на основе параметров запроса
    const cacheKey = `questions_${search || 'all'}_${page}_${limit}_${sortBy}_${order}`
    
    // Проверяем наличие данных в кэше
    const cachedData = cache.get(cacheKey)
    if (cachedData) {
      return res.json(cachedData)
    }
    
    let whereClause = {}
    const offset = (page - 1) * limit
    
    // Если передан поисковый запрос, добавляем условие поиска
    if (search) {
      whereClause = {
        [Op.or]: [
          { question: { [Op.iLike]: `%${search}%` } },
          { answer: { [Op.iLike]: `%${search}%` } }
        ]
      }
    }
    
    // Улучшенная сортировка с поддержкой регистронезависимой сортировки по вопросу
    let orderClause = [['createdAt', 'DESC']]
    if (sortBy && order) {
      // Для сортировки по вопросу используем регистронезависимую сортировку
      if (sortBy === 'question') {
        orderClause = [[sequelize.fn('LOWER', sequelize.col('question')), order]]
      } else {
        orderClause = [[sortBy, order]]
      }
    }
    
    const { count, rows } = await Question.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
    
    // Получаем статистику по категориям
    const categoryStats = await Question.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('category')), 'count']
      ],
      group: ['category']
    })
    
    // Получаем статистику по датам создания
    const dateStats = await Question.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('createdAt')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    })
    
    const result = {
      questions: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalQuestions: count,
      categoryStats,
      dateStats
    }
    
    // Сохраняем результат в кэш
    cache.set(cacheKey, result)
    
    res.json(result)
  } catch (error) {
    console.error('Ошибка при получении вопросов:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// Создание нового вопроса (только для админов)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { question, answer, category } = req.body
    
    // Проверка обязательных полей
    if (!question || !answer) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения' })
    }
    
    // Проверка на дубликаты вопросов
    const existingQuestion = await Question.findOne({
      where: {
        question: question
      }
    });
    
    if (existingQuestion) {
      return res.status(400).json({ message: 'Вопрос с таким текстом уже существует' });
    }
    
    const newQuestion = await Question.create({ question, answer, category })
    
    // Очищаем кэш при создании нового вопроса
    cache.flushAll()
    
    res.status(201).json(newQuestion)
  } catch (error) {
    console.error('Ошибка при создании вопроса:', error)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message })
    }
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// Обновление вопроса (только для админов)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { question, answer, category } = req.body
    
    // Проверка обязательных полей
    if (!question || !answer) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения' })
    }
    
    // Проверка на дубликаты вопросов (исключая текущий вопрос)
    const existingQuestion = await Question.findOne({
      where: {
        question: question,
        id: {
          [Op.ne]: id
        }
      }
    });
    
    if (existingQuestion) {
      return res.status(400).json({ message: 'Вопрос с таким текстом уже существует' });
    }
    
    const updatedQuestion = await Question.update(
      { question, answer, category },
      { where: { id } }
    )
    
    if (updatedQuestion[0] === 0) {
      return res.status(404).json({ message: 'Вопрос не найден' })
    }
    
    const questionData = await Question.findByPk(id)
    
    // Очищаем кэш при обновлении вопроса
    cache.flushAll()
    
    res.json(questionData)
  } catch (error) {
    console.error('Ошибка при обновлении вопроса:', error)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message })
    }
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// Удаление вопроса (только для админов)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Question.destroy({ where: { id } })
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Вопрос не найден' })
    }
    
    // Очищаем кэш при удалении вопроса
    cache.flushAll()
    
    res.json({ message: 'Вопрос успешно удален' })
  } catch (error) {
    console.error('Ошибка при удалении вопроса:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

module.exports = router