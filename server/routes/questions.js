const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');

// Получение всех вопросов (публичный маршрут)
router.get('/', getAllQuestions);

// Создание нового вопроса (только для админов)
router.post('/', authenticateToken, requireAdmin, createQuestion);

// Обновление вопроса (только для админов)
router.put('/:id', authenticateToken, requireAdmin, updateQuestion);

// Удаление вопроса (только для админов)
router.delete('/:id', authenticateToken, requireAdmin, deleteQuestion);

module.exports = router;