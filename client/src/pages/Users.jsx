import { useState, useEffect } from 'react';
import axios from 'axios';
import UserCard from '../components/UserCard';
import Card from '../components/Card';
import Alert from '../components/Alert';
import CreateUserModal from '../components/CreateUserModal';
import { Search, Filter, ArrowUpDown, Users } from 'lucide-react';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending'
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/customers');
      console.log(res.data);
      setCustomers(res.data);
      setFilteredCustomers(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (customerData) => {
    try {
      console.log('Creating customer:', customerData);
      await axios.post('/api/customers', customerData);
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      console.log('Error creating customer:', err);
      console.error('Failed to create customer', err);
      setError('Failed to create customer');
      setIsModalOpen(false);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await axios.delete(`/api/customers/${customerId}`);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to delete customer', err);
      setError('Failed to delete customer');
    }
  };

  // Sorting function
  const requestSort = (key) => {
    let direction = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...customers];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(customer => customer.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        customer => 
          customer.name.toLowerCase().includes(lowercasedSearch) || 
          customer.email.toLowerCase().includes(lowercasedSearch) ||
          (customer.phone && customer.phone.includes(searchTerm))
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Handle missing values
        if (a[sortConfig.key] === undefined || a[sortConfig.key] === null) return 1;
        if (b[sortConfig.key] === undefined || b[sortConfig.key] === null) return -1;
        
        // Get the values to compare based on the sort key
        let aValue, bValue;
        
        // Special case for totalSpend and campaigns - numbers and arrays
        if (sortConfig.key === 'totalSpend') {
          aValue = a.totalSpend || 0;
          bValue = b.totalSpend || 0;
        } else if (sortConfig.key === 'campaigns') {
          aValue = a.campaigns.length;
          bValue = b.campaigns.length;
        } else {
          aValue = typeof a[sortConfig.key] === 'string' ? a[sortConfig.key].toLowerCase() : a[sortConfig.key];
          bValue = typeof b[sortConfig.key] === 'string' ? b[sortConfig.key].toLowerCase() : b[sortConfig.key];
        }
        
        // Compare the values
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredCustomers(result);
  }, [customers, searchTerm, statusFilter, sortConfig]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Render sort indicator
  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={16} className="ml-1 text-gray-500" />;
    }
    
    return sortConfig.direction === 'ascending' 
      ? <ArrowUpDown size={16} className="ml-1 text-blue-500" /> 
      : <ArrowUpDown size={16} className="ml-1 text-blue-500 transform rotate-180" />;
  };

  return (
    <div className="pt-16 pb-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Users size={24} />
          Customer Management
        </h1>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition"
          onClick={() => setIsModalOpen(true)}
        >
          <span>+ Create Customer</span>
        </button>
      </div>

      {error && <Alert type="error" message={error} />}

      <Card>
        {/* Filter and Search Bar */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Filter by Status */}
          <div className="flex items-center">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg border border-gray-600">
              <Filter size={18} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-black border-none focus:outline-none focus:ring-0"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="new">New</option>
              </select>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="flex items-center">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded-lg border border-gray-600">
              <ArrowUpDown size={18} className="text-gray-400" />
              <select
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-');
                  setSortConfig({ key, direction });
                }}
                className="bg-transparent text-black border-none focus:outline-none focus:ring-0"
              >
                <option value="name-ascending">Name (A-Z)</option>
                <option value="name-descending">Name (Z-A)</option>
                <option value="totalSpend-descending">Highest Spend</option>
                <option value="totalSpend-ascending">Lowest Spend</option>
                <option value="campaigns-descending">Most Campaigns</option>
                <option value="campaigns-ascending">Fewest Campaigns</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400">Loading customers...</p>
          </div>
        ) : (
          <div>
            <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700 flex justify-between items-center">
              <span className="text-white font-medium flex items-center gap-2">
                <Users size={18} />
                Total customers: <span className="text-blue-400">{filteredCustomers.length}</span>
                {filteredCustomers.length !== customers.length && (
                  <span className="text-gray-400 text-sm">(filtered from {customers.length})</span>
                )}
              </span>
            </div>

            <div className="space-y-4">
              {filteredCustomers.map(customer => (
                <UserCard
                  key={customer._id}
                  user={customer}
                  onDelete={() => handleDeleteCustomer(customer._id)}
                  onUpdate={fetchCustomers}
                />
              ))}
              {filteredCustomers.length === 0 && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                  <p className="text-gray-400 mb-2">No customers found</p>
                  {searchTerm || statusFilter !== 'all' ? (
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                      className="text-blue-500 hover:text-blue-400"
                    >
                      Clear filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="text-blue-500 hover:text-blue-400"
                    >
                      Create your first customer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCustomer}
      />
    </div>
  );
}

export default Customers;