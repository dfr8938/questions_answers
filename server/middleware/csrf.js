const csrf = require('csurf');

// Создаем middleware для CSRF защиты с настройками для cookie
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Используем secure cookies в production
    sameSite: 'strict'
  }
});

// Middleware для добавления CSRF токена в ответ
const csrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

module.exports = {
  csrfProtection,
  csrfToken
};