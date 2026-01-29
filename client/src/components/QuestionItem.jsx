import React from 'react'
import './QuestionItem.css'

function QuestionItem({ question, onEdit, onDelete }) {
  // Получаем название категории из объекта categoryRef если он существует
  const categoryName = question.categoryRef?.name || question.category;
  
  return (
    <div className="question-item">
      <div className="question-content">
        <h4>{question.question}</h4>
        <p>{question.answer}</p>
        <div className="question-meta">
          <span className="date">{new Date(question.createdAt).toLocaleDateString('ru-RU')}</span>
          {categoryName && (
            <span className="category">{categoryName}</span>
          )}
        </div>
      </div>
      <div className="question-actions">
        <button
          className="btn btn-edit"
          onClick={() => onEdit(question)}
        >
          Редактировать
        </button>
        <button
          className="btn btn-danger"
          onClick={() => onDelete(question.id)}
        >
          Удалить
        </button>
      </div>
    </div>
  )
}

export default QuestionItem