import React, { useState } from 'react'
import Notification from './Notification'
import api from '../services/api'
import './UserManagement.css'

function UserManagement({ users, onRoleChange, onDelete, onUpdateUsers }) {
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [notification, setNotification] = useState(null)

  const handleEditClick = (user) => {
    setEditingUser(user.id)
    setEditForm({
      username: user.username,
      email: user.email,
      password: ''
    })
  }

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    // Проверка авторизации
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Необходимо авторизоваться для выполнения этого действия', 'error');
      return;
    }
    
    try {
          const response = await api.put(`/users/${editingUser}`, editForm)

      // Axios автоматически выбрасывает ошибку для статусов >= 400
      // Поэтому дополнительная проверка response.ok не нужна

      const updatedUser = response.data
      
      // Обновляем пользователя в списке
      const updatedUsers = users.map(user =>
        user.id === editingUser ? updatedUser : user
      )
      
      // Вызываем функцию обновления пользователей из родительского компонента
      onUpdateUsers(updatedUsers)
      
      // Сбрасываем состояние редактирования
      setEditingUser(null)
      setEditForm({ username: '', email: '', password: '' })
      
      showNotification('Пользователь успешно обновлен!', 'success')
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error)
            showNotification('Ошибка при обновлении пользователя: ' + error.message, 'error')
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({ username: '', email: '', password: '' })
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

  return (
    <div className="user-management">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      <h3>Управление пользователями</h3>
      <div className="users-table">
        <div className="table-header">
          <div>Имя пользователя</div>
          <div>Email</div>
          <div>Роль</div>
          <div>Действия</div>
        </div>
        <div className="table-body">
          {users.map(user => (
            <div key={user.id} className="table-row">
              {editingUser === user.id ? (
                <div className="edit-form">
                  <h4>Редактирование пользователя</h4>
                  <form onSubmit={handleEditSubmit}>
                    <div className="form-group">
                      <input
                        type="text"
                        name="username"
                        value={editForm.username}
                        onChange={handleEditChange}
                        placeholder="Имя пользователя"
                        required
                        autoComplete="off"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        placeholder="Email"
                        required
                        autoComplete="off"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="password"
                        name="password"
                        value={editForm.password}
                        onChange={handleEditChange}
                        placeholder="Новый пароль (оставьте пустым, чтобы не менять)"
                        minLength="6"
                        autoComplete="new-password"
                      />
                      <div className="password-legend">
                        <small>Пароль должен содержать минимум 6 символов</small>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-success">Сохранить</button>
                      <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                        Отмена
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <div>{user.username}</div>
                  <div>{user.email}</div>
                  <div>
                    <select 
                      value={user.role} 
                      onChange={(e) => onRoleChange(user.id, e.target.value)}
                      className="role-select"
                      // Блокируем изменение роли для суперадмина (кроме самого себя)
                      disabled={user.role === 'superadmin' && user.id !== users.find(u => u.role === 'superadmin')?.id}
                    >
                      <option value="admin">Админ</option>
                      {user.role === 'superadmin' && <option value="superadmin">Суперадмин</option>}
                    </select>
                  </div>
                  <div className="actions">
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleEditClick(user)}
                      >
                        Редактировать
                      </button>
                    )}
                    <button 
                      className="btn btn-danger"
                      onClick={() => onDelete(user.id)}
                      // Блокируем удаление для суперадмина (кроме самого себя)
                      disabled={user.role === 'superadmin' && user.id !== users.find(u => u.role === 'superadmin')?.id}
                    >
                      Удалить
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserManagement