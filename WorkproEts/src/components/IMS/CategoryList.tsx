import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Questions from './Questions'; // Assuming Questions is the form component for editing

interface Category {
  category_name: string;
  total_count: number;
  user_questions: any[]; // Adjust type as needed
  actual_values: any[]; // Adjust type as needed
}

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<Category[]>('http://localhost:5001/api/forms'); // Adjust the API endpoint as needed
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Handle category deletion
  const handleDelete = async (categoryName: string) => {
    try {
      await axios.delete(`http://localhost:5001/api/forms/${categoryName}`); // Adjust the API endpoint as needed
      setCategories(categories.filter(category => category.category_name !== categoryName));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Handle category edit
  const handleEdit = (categoryName: string) => {
    setEditingCategory(categoryName);
  };

  // Close edit form
  const closeEditForm = () => {
    setEditingCategory(null);
  };

  return (
    <div className="category-list-container">
      <h1>Category List</h1>
      <ul className="category-list">
        {categories.map((category) => (
          <li key={category.category_name} className="category-item">
            <span>{category.category_name}</span>
            <button onClick={() => handleEdit(category.category_name)} className="edit-button">
              Edit
            </button>
            <button onClick={() => handleDelete(category.category_name)} className="delete-button">
              Delete
            </button>
          </li>
        ))}
      </ul>

      {editingCategory && (
        <div className="edit-form-container">
          <Questions categoryName={editingCategory} onClose={closeEditForm} />
          <button onClick={closeEditForm} className="exit-editing-button">
            Exit Editing
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
