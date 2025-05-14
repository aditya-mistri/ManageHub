import { useEffect, useState } from 'react';
import axios from 'axios';
import CreateOrderModal from '../components/CreateOrderModal';
import OrderCard from '../components/OrderCard';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
      setFilteredOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderCreated = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    // Filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    if (paymentFilter !== 'all') {
      result = result.filter(order => order.paymentStatus === paymentFilter);
    }

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(order =>
        order.orderNumber.toLowerCase().includes(lower) ||
        order.user?.name?.toLowerCase().includes(lower)
      );
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle nested fields and missing values
        if (sortConfig.key === 'totalAmount') {
          aVal = a.totalAmount || 0;
          bVal = b.totalAmount || 0;
        } else if (sortConfig.key === 'createdAt') {
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
        }

        if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, paymentFilter, sortConfig]);

  return (
    <div className="p-4 text-white bg-black min-h-screen pt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded"
          onClick={() => setModalOpen(true)}
        >
          + New Order
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
        {/* Search */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by order number or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>

        {/* Order Status Filter */}
        <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg border border-gray-600">
          <Filter size={18} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-black"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg border border-gray-600">
          <Filter size={18} className="text-gray-400" />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-transparent text-black"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg border border-gray-600">
          <ArrowUpDown size={18} className="text-gray-400" />
          <select
            value={`${sortConfig.key}-${sortConfig.direction}`}
            onChange={(e) => {
              const [key, direction] = e.target.value.split('-');
              setSortConfig({ key, direction });
            }}
            className="bg-transparent text-black"
          >
            <option value="createdAt-descending">Newest First</option>
            <option value="createdAt-ascending">Oldest First</option>
            <option value="totalAmount-descending">Amount: High to Low</option>
            <option value="totalAmount-ascending">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Order List */}
      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}

      <CreateOrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onOrderCreated={handleOrderCreated}
        customerId=""
      />
    </div>
  );
}

export default Orders;
