import React, { useState, useEffect } from 'react'
import QuestionCard from '../components/QuestionCard'
import Notification from '../components/Notification'
import CategoryList from '../components/CategoryList'
import api from '../services/api'
import './Home.css'

function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [questions, setQuestions] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [notification, setNotification] = useState(null)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('DESC')
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    fetchQuestions()
  }, [])
  
  // Загрузка категорий при монтировании компонента
  useEffect(() => {
    fetchCategories()
  }, [])
  
  // Эффект для отслеживания прокрутки
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Эффект для автоматического поиска при изменении параметров
  useEffect(() => {
    setCurrentPage(1) // Сброс на первую страницу при изменении параметров
  }, [searchTerm, sortBy, sortOrder])

  // Эффект для загрузки вопросов при изменении параметров
  useEffect(() => {
    fetchQuestions()
  }, [searchTerm, sortBy, sortOrder, currentPage, selectedCategory])

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/questions', {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: 10,
          sortBy: sortBy,
          order: sortOrder,
          type: activeFilter !== 'all' ? activeFilter : undefined,
          categoryId: selectedCategory ? selectedCategory.id : undefined
        }
      })
      setQuestions(response.data.questions)
      setTotalPages(response.data.totalPages)
      // Устанавливаем минимальное время отображения загрузчика в 1.5 секунды
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Ошибка при загрузке вопросов:', error)
      showNotification('Ошибка при загрузке вопросов: ' + error.message, 'error')
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
      showNotification('Ошибка при загрузке категорий: ' + error.message, 'error');
    }
  };

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
        <p>Загрузка вопросов...</p>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Индикатор прогресса прокрутки */}
      <div className="scroll-progress-container">
        <div
          className="scroll-progress-bar"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Поиск по вопросам и ответам..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="filter-buttons">
          <button
            className={`filter-button ${sortBy === 'createdAt' ? 'active' : ''}`}
            onClick={() => {
              setSortBy('createdAt');
              setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC');
            }}
            title="Сортировать по дате создания"
          >
            <i className="fas fa-calendar"></i>
          </button>
          <button
            className={`filter-button ${sortBy === 'question' ? 'active' : ''}`}
            onClick={() => {
              setSortBy('question');
              setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC');
            }}
            title="Сортировать по вопросу"
          >
            <i className="fas fa-question-circle"></i>
          </button>
          <button
            className="filter-button"
            onClick={() => {
              setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC');
            }}
            title={sortOrder === 'DESC' ? 'Сортировать по убыванию' : 'Сортировать по возрастанию'}
          >
            {sortOrder === 'DESC' ? <i className="fas fa-arrow-down"></i> : <i className="fas fa-arrow-up"></i>}
          </button>
        </div>
      </div>
      
      {/* Фильтры по типу вопроса */}
      <div className="type-filters">
        <button
          className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          Все вопросы
        </button>
        <button
          className={`filter-button ${activeFilter === 'popular' ? 'active' : ''}`}
          onClick={() => setActiveFilter('popular')}
        >
          Популярные
        </button>
        <button
          className={`filter-button ${activeFilter === 'new' ? 'active' : ''}`}
          onClick={() => setActiveFilter('new')}
        >
          Новые
        </button>
      </div>
      
      <div className="home-content">
        <div className="categories-sidebar">
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(category) => {
              setSelectedCategory(category);
              setCurrentPage(1); // Сброс на первую страницу при выборе категории
            }}
          />
        </div>
        
        <div className="questions-content">
          {questions.length === 0 ? (
            <div className="no-questions-message">
              <p>По выбранной категории вопросы отсутствуют.</p>
            </div>
          ) : (
            <div className="card-container">
              {questions.map(question => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          )}
          {/* Пагинация */}
          {totalPages > 1 && (
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
          )}
        </div>
      </div>
    </div>
  )
}

export default Home