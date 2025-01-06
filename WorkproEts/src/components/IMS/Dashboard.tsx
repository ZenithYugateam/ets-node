import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CategoryForm from './CategoryForm';

interface Form {
  _id: { $oid: string };
  category_name: string;
  total_count: number;
  actual_values: Record<string, string | number>[];
}

const Dashboard: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [filteredForms, setFilteredForms] = useState<Form[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [totalCountFilter, setTotalCountFilter] = useState<number | ''>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [uniqueKeys, setUniqueKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<Form | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await axios.get('https://ets-node-1.onrender.com/api/forms');
        setForms(response.data);
        setFilteredForms(response.data);
      } catch (error) {
        console.error('Error fetching forms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const applyFilters = () => {
    let filtered = [...forms];

    if (categoryFilter) {
      filtered = filtered.filter((form) =>
        form.category_name.toLowerCase().includes(categoryFilter)
      );
    }

    if (totalCountFilter !== '') {
      filtered = filtered.filter((form) => form.total_count === totalCountFilter);
    }

    setFilteredForms(filtered);
  };

  const clearFilters = () => {
    setCategoryFilter('');
    setTotalCountFilter('');
    setFilteredForms(forms);
  };

  const handleGenerateReport = (category: string) => {
    setCurrentCategory(category);

    const keysSet = new Set<string>();
    filteredForms
      .filter((form) => form.category_name === category)
      .forEach((form) => {
        form.actual_values.forEach((item) => {
          Object.keys(item).forEach((key) => keysSet.add(key));
        });
      });

    setUniqueKeys(Array.from(keysSet));
    setModalVisible(true);
  };

  const generateCSV = () => {
    const headers = ['Category Name', 'Total Count', ...selectedKeys];
    const reportData = filteredForms
      .filter((form) => form.category_name === currentCategory)
      .map((form) => {
        const dynamicValues = selectedKeys.map((key) =>
          form.actual_values
            .map((item) => item[key] || '')
            .filter((value) => value !== '')
            .join('; ')
        );

        return [form.category_name, form.total_count, ...dynamicValues];
      });

    const csvContent = [headers, ...reportData]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${currentCategory}_report.csv`);
    a.click();

    setModalVisible(false);
  };

  const toggleKeySelection = (key: string) => {
    setSelectedKeys((prevKeys) =>
      prevKeys.includes(key) ? prevKeys.filter((k) => k !== key) : [...prevKeys, key]
    );
  };

  const handleEditClick = (form: Form) => {
    setEditingCategory(form.category_name);
    setEditingForm(form);
  };

  const handleCloseEditForm = () => {
    setEditingCategory(null);
    setEditingForm(null);
    window.location.reload();

  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Category List</h1>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>
          Filter by Category:
          <input
            type="text"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value.toLowerCase())}
            placeholder="Enter category name"
            style={{ marginLeft: '5px' }}
          />
        </label>
        <label style={{ marginLeft: '20px', marginRight: '10px' }}>
          Filter by Total Count:
          <input
            type="number"
            value={totalCountFilter}
            onChange={(e) => setTotalCountFilter(Number(e.target.value) || '')}
            placeholder="Enter total count"
            style={{ marginLeft: '5px' }}
          />
        </label>
        <button onClick={applyFilters} style={{ marginLeft: '10px' }}>
          Apply Filters
        </button>
        <button onClick={clearFilters} style={{ marginLeft: '10px' }}>
          Clear Filters
        </button>
      </div>

      {filteredForms.length > 0 ? (
        [...new Set(forms.map((form) => form.category_name))].map((category) => {
          const categoryForms = filteredForms.filter(
            (form) => form.category_name === category
          );

          return categoryForms.length > 0 ? (
            <div key={category} style={{ marginBottom: '20px' }}>
              <h2>{category}</h2>
              <button onClick={() => handleGenerateReport(category)}>
                Generate Report
              </button>
              <ul>
                {categoryForms.map((form) => (
                  <li key={form._id.$oid}>
                    <strong>{form.category_name}</strong>: {form.total_count}
                    <button onClick={() => handleEditClick(form)}>Edit</button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null;
        })
      ) : (
        <p>No matching forms found.</p>
      )}

      {editingCategory && (
        <div>
          <button onClick={handleCloseEditForm} style={{ marginBottom: '10px' }}>
            Close Edit Form
          </button>
          <CategoryForm categoryName={editingCategory} form={editingForm} />
        </div>
      )}

      {modalVisible && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            border: '1px solid #ccc',
            zIndex: 1000,
          }}
        >
          <h3>Select Keys for CSV</h3>
          <div>
            {uniqueKeys.map((key) => (
              <div key={key}>
                <input
                  type="checkbox"
                  checked={selectedKeys.includes(key)}
                  onChange={() => toggleKeySelection(key)}
                />
                <label>{key}</label>
              </div>
            ))}
          </div>
          <button onClick={generateCSV} style={{ marginTop: '10px' }}>
            Download CSV
          </button>
          <button onClick={() => setModalVisible(false)} style={{ marginLeft: '10px' }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
