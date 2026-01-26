import React, { useState, useEffect } from 'react'
import QuestionForm from '../components/QuestionForm'
import QuestionList from '../components/QuestionList'
import CategoryForm from '../components/CategoryForm'
import Notification from '../components/Notification'
import api from '../services/api'
import './AdminPanel.css'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function AdminPanel() {
  const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingQuestion, setEditingQuestion] = useState(null)
    const [editingCategory, setEditingCategory] = useState(null)
    const [notification, setNotification] = useState(null)
    const [categoryStats, setCategoryStats] = useState([])
    const [totalQuestions, setTotalQuestions] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [limit] = useState(10) // Количество вопросов на странице
    const [availableCategories, setAvailableCategories] = useState([])

  useEffect(() => {
    fetchQuestions()
    fetchStats()
    fetchCategories()
  }, [])

  // Эффект для загрузки вопросов при изменении страницы
  useEffect(() => {
    fetchQuestions()
  }, [currentPage])

  const fetchStats = async () => {
      try {
        const response = await api.get('/questions')
        const allQuestions = response.data.questions || response.data
        const questionsArray = Array.isArray(allQuestions) ? allQuestions : []
        
        // Подсчет общего количества вопросов
        setTotalQuestions(questionsArray.length)
        
        // Подсчет статистики по датам создания
        const dateCount = {}
        questionsArray.forEach(question => {
          // Извлекаем дату без времени из createdAt
          const date = new Date(question.createdAt).toLocaleDateString('ru-RU')
          dateCount[date] = (dateCount[date] || 0) + 1
        })
        
        // Преобразование в формат для графика (все даты, отсортированные по возрастанию)
        const stats = Object.keys(dateCount)
          .sort((a, b) => new Date(a.split('.').reverse().join('-')) - new Date(b.split('.').reverse().join('-')))
          .map(date => ({
            date,
            count: dateCount[date]
          }))
        
        setCategoryStats(stats)
      } catch (error) {
        console.error('Ошибка при загрузке статистики:', error)
        showNotification('Ошибка при загрузке статистики: ' + (error.response?.data?.message || error.message), 'error')
      }
    }

  const fetchCategories = async () => {
      try {
        const response = await api.get('/categories')
        const categories = response.data || []
        setAvailableCategories(categories)
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error)
      }
    }
    
    const handleCreateCategory = async (categoryData) => {
          try {
            const response = await api.post('/categories', categoryData)
            setAvailableCategories([...availableCategories, response.data])
            // Сбрасываем форму редактирования категории
            setEditingCategory(null)
            showNotification('Категория успешно создана!', 'success')
          } catch (error) {
            console.error('Ошибка при создании категории:', error)
            showNotification('Ошибка при создании категории: ' + (error.response?.data?.message || error.message), 'error')
          }
        }
    
    const handleEditCategory = (category) => {
      setEditingCategory(category)
    }
    
    const handleUpdateCategory = async (id, categoryData) => {
      try {
        const response = await api.put(`/categories/${id}`, categoryData)
        setAvailableCategories(availableCategories.map(cat =>
          cat.id === id ? response.data : cat
        ))
        setEditingCategory(null)
        showNotification('Категория успешно обновлена!', 'success')
      } catch (error) {
        console.error('Ошибка при обновлении категории:', error)
        showNotification('Ошибка при обновлении категории: ' + (error.response?.data?.message || error.message), 'error')
      }
    }
    
    const handleDeleteCategory = async (id) => {
      try {
        await api.delete(`/categories/${id}`)
        setAvailableCategories(availableCategories.filter(cat => cat.id !== id))
        showNotification('Категория успешно удалена!', 'success')
      } catch (error) {
        console.error('Ошибка при удалении категории:', error)
        showNotification('Ошибка при удалении категории: ' + (error.response?.data?.message || error.message), 'error')
      }
    }

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/questions', {
        params: {
          page: currentPage,
          limit: limit
        }
      })
      const allQuestions = response.data.questions || response.data
      setQuestions(Array.isArray(allQuestions) ? allQuestions : [])
      setTotalPages(response.data.totalPages || 1)
      // Обновляем общее количество вопросов
      setTotalQuestions(response.data.totalQuestions || 0)
      // Устанавливаем минимальное время отображения загрузчика в 1.5 секунды
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Ошибка при загрузке вопросов:', error)
      showNotification('Ошибка при загрузке вопросов: ' + (error.response?.data?.message || error.message), 'error')
      setQuestions([]) // Устанавливаем пустой массив в случае ошибки
      setLoading(false)
    }
  }

  const handleCreate = async (questionData) => {
    try {
      const response = await api.post('/questions', questionData)
      setQuestions([...questions, response.data])
      // Очищаем форму после создания вопроса
      setEditingQuestion(null)
      // Обновляем статистику после создания вопроса
      await fetchStats()
      showNotification('Вопрос успешно создан!', 'success')
    } catch (error) {
      console.error('Ошибка при создании вопроса:', error)
      showNotification('Ошибка при создании вопроса: ' + (error.response?.data?.message || error.message), 'error')
    }
  }

  const handleUpdate = async (id, questionData) => {
    try {
      const response = await api.put(`/questions/${id}`, questionData)
      setQuestions(questions.map(q => q.id === id ? response.data : q))
      setEditingQuestion(null)
      // Обновляем статистику после обновления вопроса
      await fetchStats()
      showNotification('Вопрос успешно обновлен!', 'success')
    } catch (error) {
      console.error('Ошибка при обновлении вопроса:', error)
      showNotification('Ошибка при обновлении вопроса: ' + (error.response?.data?.message || error.message), 'error')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/questions/${id}`)
      setQuestions(questions.filter(q => q.id !== id))
      // Обновляем статистику после удаления вопроса
      await fetchStats()
      showNotification('Вопрос успешно удален!', 'success')
    } catch (error) {
      console.error('Ошибка при удалении вопроса:', error)
      showNotification('Ошибка при удалении вопроса: ' + (error.response?.data?.message || error.message), 'error')
    }
  }

  const handleEdit = (question) => {
    setEditingQuestion(question)
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
      <h2>Админ-панель</h2>
      
      
      {/* Управление категориями */}
            <div className="category-management">
                    {!(editingCategory !== null && editingCategory.show) && (
                      <button
                        className="btn btn-primary add-category-btn"
                        onClick={() => setEditingCategory({ show: true })}
                      >
                        Добавить новую категорию
                      </button>
                    )}
                    {(editingCategory !== null && editingCategory.show) && (
                      <div className="category-form-container">
                        <CategoryForm
                          onSubmit={handleCreateCategory}
                          onCancel={() => setEditingCategory(null)}
                          initialData={null}
                        />
                      </div>
                    )}
                    {editingCategory !== null && editingCategory.id && (
                      <div className="category-form-container">
                        <CategoryForm
                          onSubmit={(data) => handleUpdateCategory(editingCategory.id, data)}
                          onCancel={() => setEditingCategory(null)}
                          initialData={editingCategory}
                        />
                      </div>
                    )}
                    <div className="category-list">
                      <h4>Существующие категории:</h4>
                      {availableCategories.length > 0 ? (
                        <div className="category-grid">
                          {availableCategories.map((category) => (
                            <div key={category.id} className="category-card">
                              <div className="category-card-header">
                                <h5 className="category-name">{category.name}</h5>
                                <div className="category-actions">
                                  <button
                                    className="btn btn-small btn-secondary"
                                    onClick={() => handleEditCategory(category)}
                                    title="Редактировать категорию"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-small btn-danger"
                                    onClick={() => handleDeleteCategory(category.id)}
                                    title="Удалить категорию"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </div>
                              {category.description && (
                                <p className="category-description">{category.description}</p>
                              )}
                              <div className="category-meta">
                                <span>ID: {category.id}</span>
                                <span>Создана: {new Date(category.createdAt).toLocaleDateString('ru-RU')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-categories">Категории не найдены. Добавьте новую категорию.</p>
                      )}
                    </div>
            </div>
      
      <div className="admin-content">
        <div className="form-section">
          <h3>{editingQuestion ? 'Редактировать вопрос' : 'Добавить новый вопрос'}</h3>
          <QuestionForm
            onSubmit={editingQuestion ? handleUpdate : handleCreate}
            initialData={editingQuestion}
            onCancel={() => setEditingQuestion(null)}
          />
        </div>
        <div className="list-section">
          <h3>Список вопросов</h3>
          <QuestionList
            questions={questions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {/* Пагинация */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-button"
              title="Предыдущая страница"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            {totalPages > 1 && (
              <div className="page-input-container">
                <label>Страница:</label>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className="page-input"
                />
                <span>из {totalPages}</span>
              </div>
            )}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-button"
              title="Следующая страница"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel