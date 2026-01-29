# Медицинский портал вопросов и ответов

## Описание проекта

Медицинский портал представляет собой веб-приложение для управления базой знаний медицинских вопросов и ответов. Приложение имеет три уровня доступа: публичный доступ к вопросам, админ-панель для управления контентом и суперадмин-панель для управления пользователями и системой в целом.

## Технический стек

### Фронтенд
- React
- Vite
- Axios
- React Router
- Recharts (для графиков)
- CSS (кастомная стилизация)

### Бэкенд
- Node.js
- Express
- PostgreSQL
- Sequelize ORM

### Аутентификация и безопасность
- JWT токены
- Cookie-based sessions

## Структура проекта

```
.
├── client/                 # Фронтенд приложение (React)
│   ├── src/
│   │   ├── components/   # Переиспользуемые компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── services/     # API сервисы
│   │   └── ...
│   └── ...
├── server/                # Бэкенд приложение (Node.js/Express)
│   ├── config/            # Конфигурация базы данных
│   ├── middleware/        # Промежуточное ПО
│   ├── migrations/        # Миграции базы данных
│   ├── models/            # Модели данных (Sequelize)
│   ├── routes/            # API маршруты
│   ├── seeders/           # Начальные данные
│   ├── public/            # Статические файлы
│   └── ...
└── README.md
```

## Основные функции

### Публичная часть
- Просмотр списка медицинских вопросов и ответов
- Поиск по вопросам
- Пагинация результатов
- Сортировка по дате создания

### Админ-панель
- Аутентификация администратора
- Создание, редактирование и удаление вопросов
- Создание, редактирование и удаление категорий
- Статистика по вопросам
- Графики активности

### Суперадмин-панель
- Управление пользователями (админами)
- Назначение ролей
- Просмотр истории действий админов
- Экспорт логов действий в CSV

## Быстрый старт

### Требования
- Node.js (v14 или выше)
- PostgreSQL (v12 или выше)
- Yarn или npm

### Установка

1. Клонируйте репозиторий:
   ```bash
   git clone <repository-url>
   cd med-qa-portal
   ```

2. Установите зависимости для бэкенда:
   ```bash
   cd server
   yarn install
   cd ..
   ```

3. Установите зависимости для фронтенда:
   ```bash
   cd client
   yarn install
   cd ..
   ```

### Настройка базы данных

1. Создайте базу данных PostgreSQL
2. Обновите файл `server/config/config.json` с вашими учетными данными
3. Создайте таблицы в базе данных:
   ```bash
   cd server
   yarn setup-db
   cd ..
   ```

### Переменные окружения

Создайте файл `.env` в папке `server` со следующими переменными:

```
PORT=5000
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=localhost
JWT_SECRET=your_jwt_secret_key
```

### Запуск приложения

Для запуска всего приложения в режиме разработки выполните:

```bash
npm run dev
```

Эта команда запустит и фронтенд, и бэкенд одновременно.

Для запуска только бэкенда:
```bash
cd server
yarn dev
```

Для запуска только фронтенда:
```bash
cd client
yarn dev
```

## Безопасность

- Пароли хэшируются с использованием bcrypt
- JWT токены с истечением срока действия (24 часа)
- Rate limiting для попыток входа (5 попыток за 15 минут)
- Проверка ролей на уровне middleware

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/me` - Получение информации о текущем пользователе
- `POST /api/auth/logout` - Выход из системы

### Вопросы
- `GET /api/questions` - Получение списка вопросов (публичный)
- `POST /api/questions` - Создание вопроса (админ)
- `PUT /api/questions/:id` - Обновление вопроса (админ)
- `DELETE /api/questions/:id` - Удаление вопроса (админ)

### Категории
- `GET /api/categories` - Получение списка категорий
- `POST /api/categories` - Создание категории (админ)
- `PUT /api/categories/:id` - Обновление категории (админ)
- `DELETE /api/categories/:id` - Удаление категории (админ)

### Пользователи
- `GET /api/users` - Получение списка пользователей (суперадмин)
- `POST /api/users/admin` - Создание админа (суперадмин)
- `PUT /api/users/:id` - Редактирование пользователя (суперадмин)
- `PUT /api/users/:id/role` - Изменение роли пользователя (суперадмин)
- `DELETE /api/users/:id` - Удаление пользователя (суперадмин)

## Роли пользователей

1. **Пользователь (user)** - Доступ только к публичной части
2. **Админ (admin)** - Доступ к админ-панели для управления вопросами и категориями
3. **Суперадмин (superadmin)** - Полный доступ ко всем функциям системы

## Разработка

### Структура базы данных

#### Таблица Users
- id (INTEGER, PRIMARY KEY)
- username (STRING)
- email (STRING, UNIQUE)
- password (STRING)
- role (ENUM: 'user', 'admin', 'superadmin')
- createdAt (DATE)
- updatedAt (DATE)

#### Таблица Questions
- id (INTEGER, PRIMARY KEY)
- question (TEXT)
- answer (TEXT)
- categoryId (INTEGER, FOREIGN KEY)
- createdAt (DATE)
- updatedAt (DATE)

#### Таблица Categories
- id (INTEGER, PRIMARY KEY)
- name (STRING)
- description (TEXT)
- createdAt (DATE)
- updatedAt (DATE)

#### Таблица ActionLogs
- id (INTEGER, PRIMARY KEY)
- userId (INTEGER, FOREIGN KEY)
- actionType (STRING)
- description (TEXT)
- entityId (INTEGER)
- entityType (STRING)
- createdAt (DATE)

## Лицензия

MIT