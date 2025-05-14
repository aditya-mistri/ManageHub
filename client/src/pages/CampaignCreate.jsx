import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, X, ChevronRight, Filter, Save, Eye, Users, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Constants
const fields = [
  { label: 'Total Spend', value: 'totalSpend', color: 'bg-emerald-500', icon: '$' },
  { label: 'Last Order Date', value: 'lastOrderDate', color: 'bg-indigo-500', icon: '📅' },
  { label: 'Total Orders', value: 'orderCount', color: 'bg-amber-500', icon: '#' },
];

const operators = [
  { symbol: '>', label: 'Greater than', color: 'bg-blue-500' },
  { symbol: '<', label: 'Less than', color: 'bg-blue-500' },
  { symbol: '==', label: 'Equal to', color: 'bg-blue-500' },
  { symbol: '>=', label: 'Greater than or equal to', color: 'bg-blue-500' },
  { symbol: '<=', label: 'Less than or equal to', color: 'bg-blue-500' },
  { symbol: '!=', label: 'Not equal to', color: 'bg-blue-500' },
];

const logicalOperators = [
  { symbol: 'AND', label: 'AND', color: 'bg-purple-500' },
  { symbol: 'OR', label: 'OR', color: 'bg-rose-500' }
];

// Function to get readable field name
const getFieldLabel = (value) => {
  const field = fields.find(f => f.value === value);
  return field ? field.label : value;
};

// Function to get field color
const getFieldColor = (value) => {
  const field = fields.find(f => f.value === value);
  return field ? field.color : 'bg-gray-500';
};

// Rule component
const Rule = ({ rule, onDelete, onChange, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex flex-wrap md:flex-nowrap items-center gap-2 mb-3 p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all group"
    >
      <div className="flex items-center gap-2 w-full md:w-auto">
        <span className="text-gray-400 text-sm hidden md:inline">If</span>
        
        <select
          value={rule.field}
          onChange={(e) => onChange({ ...rule, field: e.target.value })}
          className={`${rule.field ? getFieldColor(rule.field) : 'bg-gray-700'} text-white px-3 py-2 rounded-md border-none focus:ring-2 focus:ring-blue-500 transition-all min-w-[140px]`}
        >
          <option value="">Select Field</option>
          {fields.map(field => (
            <option key={field.value} value={field.value}>{field.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <select
          value={rule.operator}
          onChange={(e) => onChange({ ...rule, operator: e.target.value })}
          className={`${rule.operator ? 'bg-blue-600' : 'bg-gray-700'} text-white px-3 py-2 rounded-md border-none focus:ring-2 focus:ring-blue-500 transition-all min-w-[140px]`}
        >
          <option value="">Select Operator</option>
          {operators.map(op => (
            <option key={op.symbol} value={op.symbol}>{op.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 flex-grow">
        <input
          type="text"
          placeholder="Enter value"
          value={rule.value}
          onChange={(e) => onChange({ ...rule, value: e.target.value })}
          className="flex-grow px-3 py-2 bg-gray-900 rounded-md border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white transition-all"
        />
      </div>
      
      <button
        onClick={onDelete}
        className="p-1 rounded-full hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Delete rule"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

// Group component
const RuleGroup = ({ group, groupIdx, onUpdateGroup, onDeleteGroup }) => {
  const handleRuleChange = (ruleIdx, updatedRule) => {
    const updatedRules = [...group.rules];
    updatedRules[ruleIdx] = updatedRule;
    onUpdateGroup(groupIdx, { ...group, rules: updatedRules });
  };

  const handleDeleteRule = (ruleIdx) => {
    if (group.rules.length <= 1) return;
    const updatedRules = group.rules.filter((_, idx) => idx !== ruleIdx);
    onUpdateGroup(groupIdx, { ...group, rules: updatedRules });
  };

  const handleAddRule = () => {
    onUpdateGroup(groupIdx, { 
      ...group, 
      rules: [...group.rules, { field: '', operator: '', value: '' }] 
    });
  };

  const toggleOperator = () => {
    const newOperator = group.operator === 'AND' ? 'OR' : 'AND';
    onUpdateGroup(groupIdx, { ...group, operator: newOperator });
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6 border border-gray-700 p-5 rounded-xl bg-gray-800/70 backdrop-blur-sm shadow-lg overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-medium text-white">
            {groupIdx + 1}
          </span>
          <h3 className="text-white font-medium">Filter Group</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleOperator}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              group.operator === 'AND' 
                ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' 
                : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
            }`}
          >
            {group.operator}
          </button>
          
          <button
            onClick={() => onDeleteGroup(groupIdx)}
            className="p-1 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors"
            aria-label="Delete group"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {group.rules.map((rule, ruleIdx) => (
          <Rule
            key={ruleIdx}
            rule={rule}
            index={ruleIdx}
            onDelete={() => handleDeleteRule(ruleIdx)}
            onChange={(updatedRule) => handleRuleChange(ruleIdx, updatedRule)}
          />
        ))}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddRule}
        className="mt-3 px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
      >
        <Plus size={14} />
        Add Rule
      </motion.button>
    </motion.div>
  );
};

// Customer Preview Card
const CustomerPreviewCard = ({ customer }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date) ? 'N/A' : date.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const getName = (customer) => {
    if (customer.name) return customer.name;
    if (customer.firstName || customer.lastName) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    }
    return 'Unknown Customer';
  };

    return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-white font-medium">{customer.name}</h4>
        <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
          #{customer.id || 'N/A'}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-3">{customer.email}</p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 bg-gray-700 rounded">
          <span className="block text-gray-400">Spend</span>
          <span className="text-white font-medium">${customer.totalSpend.toFixed(2)}</span>
        </div>
        <div className="p-2 bg-gray-700 rounded">
          <span className="block text-gray-400">Orders</span>
          <span className="text-white font-medium">{customer.orderCount}</span>
        </div>
        <div className="p-2 bg-gray-700 rounded">
          <span className="block text-gray-400">Last Order</span>
          <span className="text-white font-medium">{formatDate(customer.lastOrderDate)}</span>
        </div>
      </div>
    </div>
  );
};

// Main component
const CampaignCreate = () => {
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState('');
  const [segments, setSegments] = useState([
    { operator: 'AND', rules: [{ field: '', operator: '', value: '' }] },
  ]);
  const [audienceSize, setAudienceSize] = useState(null);
  const [audiencePreview, setAudiencePreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [customers, setCustomers] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState(null);

  // Update the handlePreview function to match your backend response
const handlePreview = async () => {
  try {
    setPreviewLoading(true);
    const response = await axios.post('/api/campaigns/segments/preview', { segments });
    
    // Assuming your backend returns { size, userIds } where userIds is an array of user objects
    setAudienceSize(response.data.size);
    
    // Map the userIds array to our preview format
    if (response.data.userIds && response.data.userIds.length > 0) {
      const previewData = response.data.userIds.map(user => ({
        id: user._id,
        name: user.name || 'Unknown Customer',
        email: user.email || 'No email provided',
        totalSpend: user.totalSpend || 0,
        orderCount: user.orderCount || 0,
        lastOrderDate: user.lastOrderDate || new Date().toISOString()
      }));
      setAudiencePreview(previewData);
    } else {
      // Fallback to empty array if no users found
      setAudiencePreview([]);
    }
  } catch (error) {
    setError('Failed to preview audience size');
    console.error('Preview error:', error);
  } finally {
    setPreviewLoading(false);
  }
};


  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/campaigns', { 
        name: campaignName, 
        segments,
        audienceSize
      });

      if (response.data.campaign && response.data.campaign._id) {
        setSuccessMessage('Campaign created successfully!');
        setTimeout(() => {
          navigate('/campaigns/history');
        }, 1500);
      }
    } catch (error) {
      setError('Failed to create campaign');
      console.error('Create campaign error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = (groupIdx, updatedGroup) => {
    const newSegments = [...segments];
    newSegments[groupIdx] = updatedGroup;
    setSegments(newSegments);
  };

  const deleteGroup = (groupIdx) => {
    if (segments.length <= 1) return;
    const newSegments = segments.filter((_, idx) => idx !== groupIdx);
    setSegments(newSegments);
  };

  const addGroup = () => {
    setSegments([...segments, { operator: 'AND', rules: [{ field: '', operator: '', value: '' }] }]);
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/customers');
        setCustomers(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch customers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const steps = [
    { number: 1, title: "Campaign Details" },
    { number: 2, title: "Audience Selection" },
    { number: 3, title: "Preview & Launch" }
  ];

  const renderProgressSteps = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <React.Fragment key={step.number}>
              <button 
                onClick={() => setCurrentStep(step.number)}
                className={`flex flex-col items-center ${
                  i < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step.number 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  currentStep >= step.number 
                    ? 'text-white' 
                    : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </button>
              
              {i < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2">
                  <div className={`h-full ${
                    currentStep > i + 1 
                      ? 'bg-blue-600' 
                      : 'bg-gray-700'
                  }`}></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="mb-8 space-y-6">
            <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-lg p-6 rounded-xl border border-blue-800/50">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">Campaign Information</h2>
              
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-300">Campaign Name</label>
                <input
                  type="text"
                  placeholder="E.g., Spring Promotion 2025"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="flex justify-end mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(2)}
                  disabled={!campaignName.trim()}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all ${
                    campaignName.trim() 
                      ? 'bg-blue-600 text-white hover:bg-blue-500' 
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                  <ChevronRight size={18} />
                </motion.button>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="mb-8 space-y-6">
            <div className="p-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-lg rounded-xl border border-indigo-800/50 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-indigo-300">Define Audience Filters</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep(3)}
                    disabled={segments.some(group => 
                      group.rules.some(rule => !rule.field || !rule.operator || !rule.value)
                    )}
                    className={`flex items-center gap-2 px-4 py-1 rounded-lg text-sm font-medium transition-all ${
                      segments.some(group => 
                        group.rules.some(rule => !rule.field || !rule.operator || !rule.value)
                      ) 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    Continue
                    <ChevronRight size={14} />
                  </motion.button>
                </div>
              </div>
              
              <AnimatePresence>
                {segments.map((group, groupIdx) => (
                  <RuleGroup
                    key={groupIdx}
                    group={group}
                    groupIdx={groupIdx}
                    onUpdateGroup={updateGroup}
                    onDeleteGroup={deleteGroup}
                  />
                ))}
              </AnimatePresence>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addGroup}
                className="mt-4 px-4 py-2 bg-indigo-600/80 text-white rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add Filter Group
              </motion.button>
              
              <div className="mt-8 flex items-center gap-2 p-3 bg-blue-900/30 border border-blue-800/50 rounded-lg">
                <Filter size={18} className="text-blue-400" />
                <p className="text-sm text-blue-300">
                  Groups are combined with <strong>OR</strong> logic, while rules within a group use the logic you specify (<strong>AND</strong>/<strong>OR</strong>).
                </p>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="mb-8 space-y-6">
            <div className="p-6 bg-gradient-to-br from-emerald-900/50 to-blue-900/50 backdrop-blur-lg rounded-xl border border-emerald-800/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-emerald-300">Campaign Preview</h2>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Back
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">Campaign Details</h3>
                <div className="p-4 bg-gray-800/80 rounded-lg border border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-sm text-gray-400">Campaign Name</span>
                      <span className="text-white">{campaignName}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-400">Total Filter Groups</span>
                      <span className="text-white">{segments.length}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-400">Total Rules</span>
                      <span className="text-white">
                        {segments.reduce((sum, group) => sum + group.rules.length, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-white">Audience Preview</h3>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePreview}
                    className="px-4 py-1 bg-emerald-600/80 text-white rounded-lg text-sm hover:bg-emerald-500 transition-colors flex items-center gap-2"
                    disabled={previewLoading}
                  >
                    {previewLoading ? (
                      "Loading..."
                    ) : (
                      <>
                        <Eye size={14} />
                        Preview Audience
                      </>
                    )}
                  </motion.button>
                </div>
                
                {audienceSize !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <div className="p-4 bg-gray-800/80 rounded-lg border border-gray-700 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-sm text-gray-400">Estimated Audience Size</span>
                        <span className="text-2xl font-semibold text-white">{audienceSize} customers</span>
                      </div>
                      <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Users size={24} className="text-emerald-400" />
                      </div>
                    </div>
                  </div>
                  
                  {audiencePreview.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Matching Customers</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {audiencePreview.slice(0, 4).map(customer => (
                          <CustomerPreviewCard key={customer.id} customer={customer} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center text-gray-400">
                      No matching customers found with these filters
                    </div>
                  )}
                </motion.div>
              )}

              </div>
              
              <div className="flex justify-end mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={loading || !campaignName || audienceSize === null || audiencePreview.length <= 0 }
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all ${
                    loading || !campaignName || audienceSize === null
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {loading ? "Creating..." : "Launch Campaign"}
                  <ArrowRight size={18} />
                </motion.button>
              </div>
              
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-emerald-900/50 border border-emerald-600 rounded-lg text-emerald-300 flex items-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  {successMessage}
                </motion.div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading customer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Create Campaign
            </span>
          </h1>
          <p className="text-gray-400">Build targeted customer segments for your marketing campaign</p>
        </header>

        {renderProgressSteps()}
        {renderStepContent()}
        
        {error && (
          <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 mt-6">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignCreate;