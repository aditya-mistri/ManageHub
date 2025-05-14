import React from 'react';
import RuleGroup from './RuleGroup';
import { useState } from 'react';
import { useEffect } from 'react';

    const RuleBuilder = ({ segments, setSegments }) => {

  
    const handleGroupChange = (index, newGroup) => {
      const updatedSegments = [...segments];
      updatedSegments[index] = newGroup;
      setSegments(updatedSegments);
    };
  
    const handleAddGroup = () => {
      setSegments([...segments, { operator: 'AND', rules: [{ field: 'spend', operator: '>', value: 0 }] }]);
    };
  
    const handleDeleteGroup = (index) => {
      const updatedSegments = segments.filter((_, i) => i !== index);
      setSegments(updatedSegments);
    };
  
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Segment Builder</h2>
          <p className="text-gray-600">Create segments based on user behavior and attributes</p>
        </div>
        
        <div className="mb-6">
          {segments.map((group, index) => (
            <RuleGroup
              key={index}
              group={group}
              onChange={(newGroup) => handleGroupChange(index, newGroup)}
              onDelete={() => handleDeleteGroup(index)}
            />
          ))}
        </div>
        
        <button 
          onClick={handleAddGroup}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 font-medium flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Group
        </button>
      </div>
    );
  };
  

export default RuleBuilder;
