import React, { useState } from 'react';

function CreateCustomerModal({ isOpen, onClose, onSubmit }) {
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'new',
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Validate on blur
    validateField(name, customerData[name]);
  };

  const validateField = (name, value) => {
    let errorMessage = '';
    
    if (name === 'name' && !value.trim()) {
      errorMessage = 'Name is required';
    } else if (name === 'email') {
      if (!value.trim()) {
        errorMessage = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        errorMessage = 'Please enter a valid email address';
      }
    }
    
    setErrors((prev) => ({ ...prev, [name]: errorMessage }));
    return !errorMessage;
  };

  const validateForm = () => {
    const nameValid = validateField('name', customerData.name);
    const emailValid = validateField('email', customerData.email);
    
    // Mark fields as touched
    setTouched({
      name: true,
      email: true,
    });
    
    return nameValid && emailValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(customerData);
      setCustomerData({ name: '', email: '', phone: '', status: 'new' });
      setErrors({ name: '', email: '' });
      setTouched({ name: false, email: false });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Create New Customer
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={customerData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2 mt-1 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                touched.name && errors.name 
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
              aria-required="true"
            />
            {touched.name && errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={customerData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2 mt-1 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                touched.email && errors.email 
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
              aria-required="true"
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={customerData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              name="status"
              value={customerData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 mt-1 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="new">New</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCustomerModal;