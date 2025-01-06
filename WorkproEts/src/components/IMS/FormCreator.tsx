import React, { useState } from 'react';
import axios from 'axios';

interface Question {
  question: string;
  type: 'String' | 'Number' | 'dropdown' | 'Boolean';
  options?: string[]; // Optional for dropdown
}

interface CategoryFormProps {
  categoryName2: string;
  onClose: () => void;
}

const FormCreator: React.FC<CategoryFormProps> = ({ categoryName2, onClose }) => {
  const [categoryName, setCategoryName] = useState<string>(categoryName2);
  const [questions, setQuestions] = useState<Question[]>([{ question: '', type: 'String' }]);

  // Handle input change for each question field
  const handleInputChange = (index: number, field: keyof Question, value: string | string[]) => {
    const updatedQuestions = [...questions];
    if (field === 'options' && Array.isArray(value)) {
      updatedQuestions[index][field] = value;
    } else if (field !== 'options') {
      updatedQuestions[index][field] = value as string;
    }
    setQuestions(updatedQuestions);
  };

  // Add a new question
  const addQuestion = () => {
    setQuestions([...questions, { question: '', type: 'String' }]);
  };

  // Delete a question by index
  const deleteQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userQuestions = questions.map((q) => ({
      [q.question]: q.type === 'dropdown' ? q.options : q.type,
    }));

    try {
      const response = await axios.post('https://ets-node-1.onrender.com/create-form', {
        category_name: categoryName,
        user_questions: userQuestions,
      });

      console.log(response.data);
      alert(response.data.message); // Display success message
    } catch (error) {
      console.error(error);
      alert('Error creating/updating form');
    }
  };

  return (
    <div>
      <h2>Create a New Form</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category Name:</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
        </div>
        <div>
          <h3>Questions</h3>
          {questions.map((q, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="Question"
                value={q.question}
                onChange={(e) => handleInputChange(index, 'question', e.target.value)}
                required
              />
              <select
                value={q.type}
                onChange={(e) =>
                  handleInputChange(index, 'type', e.target.value as Question['type'])
                }
              >
                <option value="String">String</option>
                <option value="Number">Number</option>
                <option value="dropdown">Dropdown</option>
                <option value="Boolean">Boolean</option>
              </select>
              {q.type === 'dropdown' && (
                <input
                  type="text"
                  placeholder="Comma-separated options"
                  onChange={(e) =>
                    handleInputChange(index, 'options', e.target.value.split(','))
                  }
                />
              )}
              <button type="button" onClick={() => deleteQuestion(index)}>
                Delete
              </button>
            </div>
          ))}
          <button type="button" onClick={addQuestion}>
            Add Question
          </button>
        </div>
        <button type="submit">Create Form</button>
      </form>
    </div>
  );
};

export default FormCreator;
