import React from 'react'
import QuestionItem from './QuestionItem'
import './QuestionList.css'

function QuestionList({ questions, onEdit, onDelete }) {
  if (questions.length === 0) {
    return <div className="no-questions">Вопросы не найдены</div>
  }

  return (
    <div className="question-list">
      {questions.map(question => (
        <QuestionItem 
          key={question.id} 
          question={question} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  )
}

export default QuestionList