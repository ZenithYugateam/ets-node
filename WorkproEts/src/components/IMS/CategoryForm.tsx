import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

// Define Types
interface Category {
  category_name: string;
}

interface UserQuestion {
  [key: string]: string | number | boolean | string[];
}

interface FormDetails {
  total_count: number;
  user_questions: UserQuestion[];
  actual_values: UserQuestion[];
}

interface CategoryFormProps {
  categoryName: string;
  onClose: () => void;
}

// Component
const CategoryForm: React.FC<CategoryFormProps> = ({ categoryName, onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryName);
  const [questions, setQuestions] = useState<UserQuestion[]>([]);
  const [currentTotalCount, setCurrentTotalCount] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<Category[]>('https://ets-node-1.onrender.com/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch category details
  useEffect(() => {
    if (selectedCategory) {
      const fetchCategoryDetails = async () => {
        try {
          const response = await axios.get<FormDetails>(`https://ets-node-1.onrender.com/api/categories/${selectedCategory}`);
          const { total_count, user_questions, actual_values } = response.data;

          setCurrentTotalCount(total_count);
          setQuestions(user_questions);

          // Map `actual_values` to pre-fill answers
          const prefilledAnswers: Record<string, any> = {};
          actual_values.forEach((value, index) => {
            const key = `question${index + 1}`;
            prefilledAnswers[key] = Object.values(value)[0];
          });

          setAnswers(prefilledAnswers);
        } catch (error) {
          console.error('Error fetching category details:', error);
        }
      };

      fetchCategoryDetails();
    }
  }, [selectedCategory]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const updatedData = {
      actual_values: Object.entries(answers).map(([key, value]) => ({
        [key]: value,
      })),
      total_count: currentTotalCount,
    };

    try {
      setIsLoading(true);
      await axios.post(`https://ets-node-1.onrender.com/api/categories/${selectedCategory}/update`, updatedData);
      alert('Data updated successfully!');
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating category:', error);
      setIsLoading(false);
    }
  };

  // Render a question field dynamically
  const renderQuestion = (question: UserQuestion, index: number) => {
    const key = `question${index + 1}`;
    const questionType = Object.values(question)[0]; // Get the question type
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = questionType === 'Number' ? Number(e.target.value) : e.target.value;
      setAnswers((prev) => ({ ...prev, [key]: value }));
    };

    const prefilledValue = answers[key] || ''; // Prefill value if it exists

    if (Array.isArray(questionType)) {
      return (
        <div key={key}>
          <label>{key}</label>
          <select value={prefilledValue} onChange={handleChange}>
            <option value="">Select an option</option>
            {questionType.map((option, i) => (
              <option key={i} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    } else if (questionType === 'Boolean') {
      return (
        <div key={key}>
          <label>{key}</label>
          <input
            type="checkbox"
            checked={!!prefilledValue}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [key]: e.target.checked }))}
          />
        </div>
      );
    } else {
      return (
        <div key={key}>
          <label>{key}</label>
          <input
            type={questionType === 'Number' ? 'number' : 'text'}
            value={prefilledValue}
            onChange={handleChange}
          />
        </div>
      );
    }
  };

  return (
    <div>
      <h1>Category Form</h1>
      <div>
        <label>Select Category</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.category_name} value={category.category_name}>
              {category.category_name}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div>
          <h3>Current Total Count: {currentTotalCount}</h3>
          <div>
            <label>Update Total Count</label>
            <input
              type="number"
              value={currentTotalCount}
              onChange={(e) => setCurrentTotalCount(Number(e.target.value))}
            />
          </div>

          <form onSubmit={handleSubmit}>
            {questions.map((question, index) => renderQuestion(question, index))}
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CategoryForm;
