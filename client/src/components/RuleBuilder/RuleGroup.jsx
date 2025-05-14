import React from 'react';
import RuleItem from './RuleItem';

const RuleGroup = ({ group, onChange, onDelete }) => {
  const handleRuleChange = (index, newRule) => {
    const updatedRules = [...group.rules];
    updatedRules[index] = newRule;
    onChange({ ...group, rules: updatedRules });
  };

  const handleAddRule = () => {
    onChange({ ...group, rules: [...group.rules, { field: 'spend', operator: '>', value: 0 }] });
  };

  const handleDeleteRule = (index) => {
    const updatedRules = group.rules.filter((_, i) => i !== index);
    onChange({ ...group, rules: updatedRules });
  };

  const handleOperatorChange = (e) => {
    onChange({ ...group, operator: e.target.value });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-blue-950 dark:bg-gray-800 shadow-sm">
      <div className="mb-3 flex items-center">
        <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Group Logic:</span>
        <select
          value={group.operator}
          onChange={handleOperatorChange}
          className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      </div>

      <div className="mb-4">
        {group.rules.map((rule, index) => (
          <RuleItem
            key={index}
            rule={rule}
            onChange={(newRule) => handleRuleChange(index, newRule)}
            onDelete={() => handleDeleteRule(index)}
          />
        ))}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleAddRule}
          className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 px-3 py-2 rounded-md transition-colors duration-200 font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Rule
        </button>

        <button
          onClick={onDelete}
          className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 px-3 py-2 rounded-md transition-colors duration-200 font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Group
        </button>
      </div>
    </div>
  );
};

export default RuleGroup;
