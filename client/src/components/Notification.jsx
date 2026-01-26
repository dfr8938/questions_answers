import React from 'react'
import './Notification.css'

function Notification({ message, type, onClose }) {
  return (
    <div className={`notification notification-${type}`}>
      <span className="notification-message">{message}</span>
      <button className="notification-close" onClick={onClose}>×</button>
    </div>
  )
}

export default Notification