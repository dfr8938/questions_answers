const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const { authenticateToken } = require('../middleware/auth')
const rateLimit = require('express-rate-limit')
require('dotenv').config()


/**
 * Маршрут для регистрации нового пользователя
 * Доступен без аутентификации
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Проверка обязательных полей
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения' })
    }

    // Проверка существующего пользователя
    const existingUser = await User.findOne({
      where: {
        email: email
      }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' })
    }

    // Создание нового пользователя
    const user = await User.create({ username, email, password })

    // Генерация JWT токена
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Ошибка регистрации:', error)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors[0].message })
    }
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// // Лимит для попыток входа: 5 попыток за 15 минут
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 минут
//   max: 5, // Максимум 5 попыток
//   message: {
//     error: 'Слишком много попыток входа, попробуйте снова через 15 минут'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// })

/**
 * Маршрут для входа пользователя в систему
 * Доступен без аутентификации
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Проверка обязательных полей
    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны для заполнения' })
    }

    // Поиск пользователя по email
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль' })
    }

    // Проверка пароля
    const validPassword = await user.validPassword(password)

    if (!validPassword) {
      return res.status(400).json({ message: 'Неверный email или пароль' })
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Ошибка входа:', error)
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

/**
 * Маршрут для получения информации о текущем пользователе
 * Доступен только для аутентифицированных пользователей
 */
router.get('/me', authenticateToken, async (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role
  })
})

module.exports = router