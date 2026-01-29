import React from 'react'
import './QuestionCard.css'

function QuestionCard({ question }) {
  return (
    <div className="card">
      <h3>{question.question}</h3>
      <p>{question.answer}</p>
      <div className="card-footer">
        {question.categoryRef && (
          <span className="category-tag">{question.categoryRef.name}</span>
        )}
        <span className="date">{new Date(question.createdAt).toLocaleDateString('ru-RU')}</span>
      </div>
    </div>
  )
}

export default QuestionCard