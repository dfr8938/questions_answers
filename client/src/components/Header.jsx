import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const handleLogout = () => {
    // Удаление токена и информации о пользователе из localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Удаление токена из заголовков API
    delete api.defaults.headers.common['Authorization']
    
    // Перенаправление на главную страницу
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <i className="fas fa-heartbeat"></i>
        </div>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Главная</Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">Админ-панель</Link>
              )}
              {user.role === 'superadmin' && (
                <>
                  <Link to="/admin" className="nav-link">Админ-панель</Link>
                  <Link to="/superadmin" className="nav-link">Суперадмин-панель</Link>
                </>
              )}
              <button onClick={handleLogout} className="nav-link logout-btn">
                Выйти ({user.username})
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">Вход</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header