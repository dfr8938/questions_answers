import React from 'react';
import './CategoryList.css';

const CategoryList = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="category-list">
      <h3>Категории</h3>
      <div className="category-items">
        <button
          className={`category-item ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          Все категории
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-item ${selectedCategory?.id === category.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;