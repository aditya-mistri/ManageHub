import React from 'react';

// Rule Item Component - Dark Theme
const RuleItem = ({ rule, onChange, onDelete }) => {
  const handleFieldChange = (e) => {
    onChange({ ...rule, field: e.target.value });
  };

  const handleOperatorChange = (e) => {
    onChange({ ...rule, operator: e.target.value });
  };

  const handleValueChange = (e) => {
    onChange({ ...rule, value: e.target.value });
  };

  return (
    <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg shadow-xl mb-2">
      <select 
        value={rule.field} 
        onChange={handleFieldChange}
        className="bg-gray-700 border border-gray-600 hover:cursor-pointer rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="spend">Spend</option>
        <option value="visits">Visits</option>
        <option value="lastActive">Last Active (days ago)</option>
      </select>
      
      <select 
        value={rule.operator} 
        onChange={handleOperatorChange}
        className="bg-gray-700 border hover:cursor-pointer border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value=">">{'>'}</option>
        <option value="<">{'<'}</option>
        <option value="=">{'='}</option>
      </select>
      
      <input 
        type="number" 
        value={rule.value} 
        onChange={handleValueChange}
        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      />
      
      <button 
        onClick={onDelete}
        className="bg-red-900 text-red-300 hover:bg-red-800 hover:cursor-pointer px-3 py-2 rounded-md transition-colors duration-200 font-medium"
      >
        Delete
      </button>
    </div>
  );
};

export default RuleItem;
