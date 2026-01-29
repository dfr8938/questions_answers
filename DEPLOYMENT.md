# Руководство по развертыванию Medical Q&A Portal на VPS сервере REG.RU

## Системные требования

- Ubuntu 20.04 или выше
- 2 CPU, 4GB RAM (минимум)
- 40GB SSD диск
- Доступ по SSH

## Подготовка сервера

### 1. Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Установка Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Установка PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
```

### 4. Установка Nginx
```bash
sudo apt install nginx -y
```

## Настройка базы данных

### 1. Создание базы данных и пользователя
```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE med_qa_db;
CREATE USER med_qa_user WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE med_qa_db TO med_qa_user;
\q
```

## Развертывание приложения

### 1. Клонирование репозитория
```bash
sudo mkdir -p /opt/med-qa-portal
sudo chown $USER:$USER /opt/med-qa-portal
cd /opt/med-qa-portal
git clone https://github.com/your-repo/med-qa-portal.git .
```

### 2. Установка зависимостей
```bash
# Сервер
cd server
npm install --production

# Клиент
cd ../client
npm install --production
```

### 3. Настройка переменных окружения
Создайте файл `server/.env.production`:
```env
JWT_SECRET=your_strong_secret_key_here
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=med_qa_db
DB_USER=med_qa_user
DB_PASSWORD=your_strong_db_password
```

### 4. Создание production сборки
```bash
cd /opt/med-qa-portal/client
npm run build
```

## Настройка systemd сервиса

Скопируйте файл `deployment/med-qa.service` в `/etc/systemd/system/`:
```bash
sudo cp deployment/med-qa.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable med-qa.service
```

## Настройка Nginx

Скопируйте файл `deployment/nginx.conf` в `/etc/nginx/sites-available/`:
```bash
sudo cp deployment/nginx.conf /etc/nginx/sites-available/med-qa
sudo ln -sf /etc/nginx/sites-available/med-qa /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Запуск приложения

```bash
sudo systemctl start med-qa.service
```

Проверка статуса:
```bash
sudo systemctl status med-qa.service
```

## Инициализация базы данных

```bash
cd /opt/med-qa-portal/server
npm run setup-db
```

## Обновление приложения

Для обновления приложения используйте скрипт `deploy.sh`:
```bash
./deploy.sh
```

## Безопасность

### Настройка SSL сертификата (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain.com
```

### Настройка Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Мониторинг и логирование

Логи приложения доступны через journalctl:
```bash
sudo journalctl -u med-qa.service -f
```

## Резервное копирование

Регулярное резервное копирование базы данных:
```bash
pg_dump med_qa_db > backup_$(date +"%Y%m%d").sql