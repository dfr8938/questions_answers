import React, { useState } from 'react'
import Notification from './Notification'
import api from '../services/api'


function UserManagement({ users, onRoleChange, onDelete, onUpdateUsers, onEdit }) {
  const [notification, setNotification] = useState(null)

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
      <div className="users-list">
        {users.map(user => (
          <div key={user.id} className="user-item">
            <div className="user-content">
              <h4>{user.username}</h4>
              <p className="user-email">{user.email}</p>
            </div>
            <div className="user-footer">
              <div className="user-meta">
                <span className="role-tag">{user.role === 'superadmin' ? 'Суперадмин' : 'Админ'}</span>
              </div>
              <div className="user-actions">
                {(user.role === 'admin' || user.role === 'superadmin') && (
                  <button
                    className="btn btn-edit"
                    onClick={() => {
                      console.log('Пользователь передан в onEdit:', user);
                      onEdit(user);
                    }}
                    title="Редактировать"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                )}
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    console.log('Пользователь передан в onDelete:', user);
                    console.log('Тип пользователя:', typeof user);
                    onDelete(user);
                  }}
                  // Блокируем удаление для суперадмина (кроме самого себя)
                  disabled={user.role === 'superadmin' && user.id !== users.find(u => u.role === 'superadmin')?.id}
                  title="Удалить"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserManagement