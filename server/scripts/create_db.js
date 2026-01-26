const { Client } = require('pg')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')

// Загрузка переменных окружения
dotenv.config()

// Конфигурация для подключения к PostgreSQL (без указания базы данных)
const clientConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
}

// Имя базы данных из переменных окружения
const dbName = process.env.DB_NAME || 'med_qa_db'

async function dropAndCreateDatabase() {
  let client

  try {
    // Подключение к PostgreSQL без указания базы данных
    client = new Client(clientConfig)
    await client.connect()
    console.log('Подключение к PostgreSQL успешно установлено.')

    // Удаление базы данных, если она существует
    await client.query(`DROP DATABASE IF EXISTS "${dbName}"`)
    console.log(`База данных "${dbName}" удалена.`)

    // Создание базы данных
    await client.query(`CREATE DATABASE "${dbName}"`)
    console.log(`База данных "${dbName}" успешно создана.`)
  } catch (error) {
    console.error('Ошибка при работе с базой данных:', error.message)
  } finally {
    // Закрытие подключения
    if (client) {
      await client.end()
      console.log('Подключение к PostgreSQL закрыто.')
    }
  }
}

// Функция для создания суперпользователя
async function createSuperAdmin() {
  let client

  try {
    // Подключение к базе данных
    client = new Client({
      ...clientConfig,
      database: dbName
    })
    
    await client.connect()
    console.log(`Подключение к базе данных "${dbName}" успешно установлено.`)

    // Создание таблицы пользователей
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL
      )
    `)
    
    console.log('Таблица пользователей создана.')

    // Создание суперпользователя
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash('superadmin123', salt)
    
    await client.query(
      `INSERT INTO "Users" (username, email, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      ['superadmin', 'superadmin@example.com', hashedPassword, 'superadmin']
    )
    
    console.log('Суперпользователь успешно создан.')
  } catch (error) {
    console.error('Ошибка при создании суперпользователя:', error.message)
  } finally {
    // Закрытие подключения
    if (client) {
      await client.end()
      console.log('Подключение к базе данных закрыто.')
    }
  }
}

// Запуск скрипта
async function run() {
  await dropAndCreateDatabase()
  await createSuperAdmin()
}

run()