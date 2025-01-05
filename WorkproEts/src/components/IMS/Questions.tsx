import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Form {
  _id: { $oid: string };
  category_name: string;
  total_count: number;
  user_questions: { [key: string]: string | string[] }[];
  actual_values: (string | number | boolean | null)[];
}

interface QuestionsProps {
  categoryName: string; // Accept categoryName as a prop
}

const Questions: React.FC<QuestionsProps> = ({ categoryName }) => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editableForm, setEditableForm] = useState<Form | null>(null);
  const [newQuestionKey, setNewQuestionKey] = useState<string>(''); // State for new question key
  const [newQuestionType, setNewQuestionType] = useState<string>('String'); // Default new question type
  const [newDropdownOptions, setNewDropdownOptions] = useState<string>(''); // State for dropdown options
  const [showAddQuestionForm, setShowAddQuestionForm] = useState<boolean>(false); // Show/hide add question form

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/forms');
        setForms(response.data);
        setLoading(false);

        // Find the form based on the provided categoryName prop
        const selectedForm = response.data.find((form) => form.category_name === categoryName);
        setEditableForm(selectedForm || null);
      } catch (error) {
        console.error('Error fetching forms:', error);
        setLoading(false);
      }
    };

    fetchForms();
  }, [categoryName]);

  if (loading) {
    return <p>Loading...</p>;
  }

  // Handle form value changes
  const handleInputChange = (index: number, key: string, value: any) => {
    if (!editableForm) return;

    const updatedQuestions = [...editableForm.user_questions];
    updatedQuestions[index] = { [key]: value };

    setEditableForm({
      ...editableForm,
      user_questions: updatedQuestions,
    });
  };

  const handleValueTypeChange = (index: number, value: string | string[]) => {
    if (!editableForm) return;

    const questionKey = Object.keys(editableForm.user_questions[index])[0];
    const updatedQuestions = [...editableForm.user_questions];

    if (value === 'Dropdown') {
      setNewDropdownOptions(''); // Reset dropdown options state
    }

    if (Array.isArray(value)) {
      updatedQuestions[index] = { [questionKey]: value };
    } else {
      updatedQuestions[index] = { [questionKey]: value };
    }

    setEditableForm({
      ...editableForm,
      user_questions: updatedQuestions,
    });
  };

  const handleAddQuestion = () => {
    if (!editableForm || !newQuestionKey) return;

    const newQuestion = { [newQuestionKey]: newQuestionType };
    if (newQuestionType === 'Dropdown' && newDropdownOptions.trim() !== '') {
      newQuestion[newQuestionKey] = newDropdownOptions.split(',').map((opt) => opt.trim());
    }

    setEditableForm({
      ...editableForm,
      user_questions: [...editableForm.user_questions, newQuestion],
      actual_values: [...editableForm.actual_values, null], // Add a corresponding empty value
    });

    // Reset input fields
    setNewQuestionKey('');
    setNewQuestionType('String');
    setNewDropdownOptions('');
    setShowAddQuestionForm(false);
  };

  const handleDeleteQuestion = (index: number) => {
    if (!editableForm) return;

    const updatedQuestions = [...editableForm.user_questions];
    updatedQuestions.splice(index, 1); // Remove the question at the given index

    setEditableForm({
      ...editableForm,
      user_questions: updatedQuestions,
      actual_values: editableForm.actual_values.filter((_, idx) => idx !== index), // Remove corresponding actual value
    });
  };

  const toggleAddQuestionForm = () => {
    setShowAddQuestionForm(!showAddQuestionForm);
  };

  const saveChanges = async () => {
    if (!editableForm) return;

    try {
      await axios.put('http://localhost:5001/api/forms', {
        category_name: editableForm.category_name,
        total_count: editableForm.total_count,
        user_questions: editableForm.user_questions,
        actual_values: editableForm.actual_values,
      });

      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes.');
    }
  };

  return (
    <div>
      <h1>User Questions</h1>

      {editableForm && (
        <div>
          <h2>{editableForm.category_name}</h2>
          <ul>
            {editableForm.user_questions.map((question, index) => {
              const questionKey = Object.keys(question)[0];
              const value = question[questionKey];

              return (
                <li key={index}>
                  {/* Editable question key */}
                  <input
                    type="text"
                    value={questionKey}
                    onChange={(e) => handleInputChange(index, e.target.value, value)}
                  />
                  :
                  {/* Input based on value type */}
                  {Array.isArray(value) ? (
                    <div>
                      <label>Options (comma-separated):</label>
                      <input
                        type="text"
                        value={value.join(', ')}
                        onChange={(e) =>
                          handleValueTypeChange(
                            index,
                            e.target.value.split(',').map((opt) => opt.trim())
                          )
                        }
                      />
                    </div>
                  ) : (
                    <select
                      value={value}
                      onChange={(e) => handleValueTypeChange(index, e.target.value)}
                    >
                      <option value="String">String</option>
                      <option value="Number">Number</option>
                      <option value="Boolean">Boolean</option>
                      <option value="Dropdown">Dropdown</option>
                    </select>
                  )}
                  <button onClick={() => handleDeleteQuestion(index)}>Delete</button>
                </li>
              );
            })}
          </ul>

          <button onClick={toggleAddQuestionForm}>
            {showAddQuestionForm ? 'Cancel' : 'Add Question'}
          </button>

          {showAddQuestionForm && (
            <div>
              <input
                type="text"
                placeholder="New question key"
                value={newQuestionKey}
                onChange={(e) => setNewQuestionKey(e.target.value)}
              />
              <select
                value={newQuestionType}
                onChange={(e) => {
                  setNewQuestionType(e.target.value);
                  if (e.target.value === 'Dropdown') {
                    setNewDropdownOptions('');
                  }
                }}
              >
                <option value="String">String</option>
                <option value="Number">Number</option>
                <option value="Boolean">Boolean</option>
                <option value="Dropdown">Dropdown</option>
              </select>
              {newQuestionType === 'Dropdown' && (
                <div>
                  <label>Dropdown Options (comma-separated):</label>
                  <input
                    type="text"
                    value={newDropdownOptions}
                    onChange={(e) => setNewDropdownOptions(e.target.value)}
                  />
                </div>
              )}
              <button onClick={handleAddQuestion}>Add</button>
            </div>
          )}

          <button onClick={saveChanges}>Save Changes</button>
        </div>
      )}
    </div>
  );
};

export default Questions;
