const jwt = require('jsonwebtoken')
const { User } = require('../models')
require('dotenv').config()

// Проверка токена аутентификации
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Токен аутентификации отсутствует' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    })

    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Ошибка аутентификации:', error)
    return res.status(403).json({ message: 'Недействительный токен' })
  }
}

// Проверка роли администратора
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Требуется аутентификация' })
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Требуются права администратора' })
  }

  next()
}

// Проверка роли суперадминистратора
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Требуется аутентификация' })
  }

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Требуются права суперадминистратора' })
  }

  next()
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin
}