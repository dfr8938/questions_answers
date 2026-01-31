import React from 'react';


function ConfirmDeleteQuestionModal({ isOpen, onClose, onConfirm, questionText }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Подтверждение удаления вопроса</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p>Вы уверены, что хотите удалить вопрос:</p>
          <p className="question-text"><strong>{questionText}</strong>?</p>
          <p className="warning-text">
            Это действие невозможно отменить.
          </p>
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn btn-danger" onClick={handleConfirm}>
            Удалить вопрос
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteQuestionModal;