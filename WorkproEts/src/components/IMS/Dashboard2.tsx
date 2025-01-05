import React, { useState } from 'react';
import FormCreator from './FormCreator';
import CategoryList from './CategoryList';

function Dashboard2() {
  const [currentComponent, setCurrentComponent] = useState('CategoryList'); // Default to CategoryList
  const [selectedCategoryName, setSelectedCategoryName] = useState(''); // Manage category name state

  const handleButtonClick = (componentName, categoryName = '') => {
    setSelectedCategoryName(categoryName);
    setCurrentComponent(componentName);
  };

  const handleFormClose = () => {
    // Reset to CategoryList when FormCreator closes
    setCurrentComponent('CategoryList');
    setSelectedCategoryName('');
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {currentComponent === 'CategoryList' ? (
        <>
          <button onClick={() => handleButtonClick('FormCreator')}>
            Create New Form
          </button>
          <CategoryList
            onSelectCategory={(categoryName) =>
              handleButtonClick('FormCreator', categoryName)
            }
          />
        </>
      ) : (
        <>
          <FormCreator
            categoryName2={selectedCategoryName}
            onClose={handleFormClose}
          />
          <button onClick={handleFormClose}>Back to Dashboard</button>
        </>
      )}
    </div>
  );
}

export default Dashboard2;
