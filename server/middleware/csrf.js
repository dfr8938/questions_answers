const csrf = require('csurf');

/**
 * Middleware для CSRF защиты
 * Создает и проверяет CSRF токены для защиты от CSRF атак
 */
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Используем secure cookies в production
    sameSite: 'strict'
  }
});

/**
 * Middleware для добавления CSRF токена в локальные переменные ответа
 * Делает токен доступным в шаблонах
 * @param {Object} req - Объект запроса Express
 * @param {Object} res - Объект ответа Express
 * @param {Function} next - Функция для перехода к следующему middleware
 */
const csrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

module.exports = {
  csrfProtection,
  csrfToken
};