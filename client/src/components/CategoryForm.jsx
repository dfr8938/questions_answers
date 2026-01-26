import React, { useState } from 'react'
import './CategoryForm.css'

function CategoryForm({ onSubmit, onCancel, initialData }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название категории обязательно для заполнения'
    }
    
    return newErrors
  }

  const handleSubmit = (e) => {
      e.preventDefault()
      const newErrors = validate()
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }
      
      onSubmit(formData)
      
      // Очищаем форму после добавления новой категории (если это не редактирование)
      if (!initialData) {
        setFormData({
          name: '',
          description: ''
        })
      }
    }

  return (
    <div className="category-form">
      <h3>{initialData ? 'Редактировать категорию' : 'Добавить новую категорию'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Название категории:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
            placeholder="Введите название категории"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Описание:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Введите описание категории (необязательно)"
            rows="3"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {initialData ? 'Сохранить' : 'Добавить'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}

export default CategoryForm