import React, { useState, useEffect } from 'react'
import UserManagement from '../components/UserManagement'
import Notification from '../components/Notification'
import api from '../services/api'
import './SuperAdminPanel.css'

function SuperAdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddAdminForm, setShowAddAdminForm] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
      // Устанавливаем минимальное время отображения загрузчика в 1.5 секунды
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error)
      showNotification('Ошибка при загрузке пользователей: ' + error.message, 'error')
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await api.put(`/users/${userId}/role`, { role: newRole })
      setUsers(users.map(user => 
        user.id === userId ? response.data : user
      ))
      showNotification('Роль пользователя успешно изменена!', 'success')
    } catch (error) {
      console.error('Ошибка при изменении роли пользователя:', error)
      showNotification('Ошибка при изменении роли пользователя: ' + error.message, 'error')
    }
  }

  const handleUserDelete = async (userId) => {
    try {
      await api.delete(`/users/${userId}`)
      setUsers(users.filter(user => user.id !== userId))
      showNotification('Пользователь успешно удален!', 'success')
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error)
      showNotification('Ошибка при удалении пользователя: ' + error.message, 'error')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!newAdmin.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно'
    } else if (newAdmin.username.length < 3) {
      newErrors.username = 'Имя пользователя должно содержать минимум 3 символа'
    }
    
    if (!newAdmin.email.trim()) {
      newErrors.email = 'Email обязателен'
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      newErrors.email = 'Некорректный формат email'
    }
    
    if (!newAdmin.password) {
      newErrors.password = 'Пароль обязателен'
    } else if (newAdmin.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов'
    }
    
    return newErrors
  }
  
  const handleAddAdmin = async (e) => {
    e.preventDefault()
    
    // Проверка авторизации
    const token = localStorage.getItem('token');
    if (!token) {
      setErrors({ form: 'Необходимо авторизоваться для выполнения этого действия' });
      return;
    }
    
    // Валидация формы
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    try {
      const response = await api.post('/users/admin', newAdmin)
      setUsers([response.data, ...users])
      setNewAdmin({ username: '', email: '', password: '' })
      setShowAddAdminForm(false)
      // Очищаем ошибки
      setErrors({})
      showNotification('Админ успешно создан!', 'success')
    } catch (error) {
      console.error('Ошибка при создании админа:', error)
      showNotification('Ошибка при создании админа: ' + error.message, 'error')
    }
  }

  const handleInputChange = (e) => {
    setNewAdmin({
      ...newAdmin,
      [e.target.name]: e.target.value
    })
    
    // Очищаем ошибку при изменении поля
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const handleUpdateUsers = (updatedUsers) => {
    setUsers(updatedUsers)
  }

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const closeNotification = () => {
    setNotification(null)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="panel">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      <h2>Суперадмин-панель</h2>
      <div className="super-admin-content">
        <div className="admin-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddAdminForm(!showAddAdminForm)}
          >
            {showAddAdminForm ? 'Отмена' : 'Добавить нового админа'}
          </button>
          
          {showAddAdminForm && (
            <div className="add-admin-form">
              <h3>Создание нового админа</h3>
              <form onSubmit={handleAddAdmin}>
                <div className="form-group">
                  <label htmlFor="username">Имя пользователя:</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={newAdmin.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Введите имя пользователя (минимум 3 символа)"
                    autoComplete="off"
                  />
                  {errors.username && <span className="error">{errors.username}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newAdmin.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Введите email адрес"
                    autoComplete="off"
                  />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="password">Пароль:</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newAdmin.password}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                    placeholder="Введите пароль (минимум 6 символов)"
                    autoComplete="new-password"
                  />
                  <div className="password-legend">
                    <small>Пароль должен содержать минимум 6 символов</small>
                  </div>
                  {errors.password && <span className="error">{errors.password}</span>}
                </div>
                
                {errors.form && <div className="error form-error">{errors.form}</div>}
                
                <button type="submit" className="btn btn-success">
                  Создать админа
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setNewAdmin({
      username: '',
      email: '',
      password: ''
    });
    setErrors({});
                  }}
                >
                  Очистить
                </button>
              </form>
            </div>
          )}
        </div>
        
        <UserManagement 
          users={users}
          onRoleChange={handleRoleChange}
          onDelete={handleUserDelete}
          onUpdateUsers={handleUpdateUsers}
        />
        
      </div>
    </div>
  )
}

export default SuperAdminPanel