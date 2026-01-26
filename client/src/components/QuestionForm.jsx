import React, { useState, useEffect } from 'react'
import './QuestionForm.css'

function QuestionForm({ onSubmit, initialData, onCancel }) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        question: initialData.question,
        answer: initialData.answer,
        category: initialData.category
      })
    } else {
      // Очищаем форму при отсутствии initialData (например, после создания)
      setFormData({
        question: '',
        answer: '',
        category: ''
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    setFormData({
      ...formData,
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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.question.trim()) {
      newErrors.question = 'Вопрос обязателен для заполнения'
    }
    
    if (!formData.answer.trim()) {
      newErrors.answer = 'Ответ обязателен для заполнения'
    }
    
    return newErrors
  }
  
  const handleSubmit = (e) => {
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
    
    if (initialData) {
      onSubmit(initialData.id, formData)
    } else {
      onSubmit(formData)
      // Очищаем форму после отправки
      setFormData({
        question: '',
        answer: '',
        category: ''
      })
      // Очищаем ошибки
      setErrors({})
    }
  }

  return (
    <form onSubmit={handleSubmit} className="question-form">
      <div className="form-group">
        <label htmlFor="question">Вопрос:</label>
        <input
          type="text"
          id="question"
          name="question"
          value={formData.question}
          onChange={handleChange}
          required
          placeholder="Введите вопрос"
          autoComplete="off"
        />
        {errors.question && <span className="error">{errors.question}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="answer">Ответ:</label>
        <textarea
          id="answer"
          name="answer"
          value={formData.answer}
          onChange={handleChange}
          required
          placeholder="Введите ответ"
          autoComplete="off"
        />
        {errors.answer && <span className="error">{errors.answer}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="category">Категория:</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          autoComplete="off"
        >
          <option value="">Выберите категорию</option>
          <option value="Кардиология">Кардиология</option>
          <option value="Неврология">Неврология</option>
          <option value="Гастроэнтерология">Гастроэнтерология</option>
          <option value="Эндокринология">Эндокринология</option>
          <option value="Пульмонология">Пульмонология</option>
          <option value="Урология">Урология</option>
          <option value="Гинекология">Гинекология</option>
          <option value="Ортопедия">Ортопедия</option>
          <option value="Офтальмология">Офтальмология</option>
          <option value="Дерматология">Дерматология</option>
          <option value="Психиатрия">Психиатрия</option>
          <option value="Педиатрия">Педиатрия</option>
          <option value="Терапия">Терапия</option>
          <option value="Профилактика">Профилактика</option>
          <option value="Диагностика">Диагностика</option>
          <option value="Лечение">Лечение</option>
        </select>
      </div>
      
      {errors.form && <div className="error form-error">{errors.form}</div>}
      
      <div className="form-actions">
        <button type="submit" className="btn">
          {initialData ? 'Обновить' : 'Создать'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setFormData({
              question: '',
              answer: '',
              category: ''
            });
            setErrors({});
          }}
        >
          Очистить
        </button>
        {initialData && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Отмена
          </button>
        )}
      </div>
    </form>
  )
}

export default QuestionForm