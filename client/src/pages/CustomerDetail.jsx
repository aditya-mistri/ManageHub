import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import CreateOrderModal from '../components/CreateOrderModal';
import { Plus } from 'lucide-react';

const TABS = ['Orders', 'Campaigns'];

const CustomerDetail = () => {

  
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('Orders');

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const [userRes, ordersRes] = await Promise.all([
          axios.get(`/api/customers/${id}`),
          axios.get(`/api/orders/customer/${id}`),
        ]);
        setUser(userRes.data);
        console.log('User:', userRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error('Error fetching customer data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id, refreshKey]);

  const handleOrderCreated = () => {
    setModalOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  if (loading) return <div className="p-8 text-gray-300 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-red-400 text-center">Customer not found</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Customer Details</h1>
          <p className="text-gray-400">Overview of customer profile, orders, and campaigns.</p>
        </div>

        {/* Info Card */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Info label="Name" value={user.name} />
          <Info label="Email" value={user.email} />
          <Info label="Phone" value={user.phone || '—'} />
          <Info label="Location" value={user.location || '—'} />
          <Info label="Age" value={user.age || '—'} />
          <Info label="Gender" value={user.gender || '—'} />
          <Info label="Status" value={user.status} />
          <Info label="Order Count" value={user.orderCount} />
          <Info label="Total Spend" value={`$${user.totalSpend?.toFixed(2)}`} />
          <Info label="Last Order" value={user.lastOrderDate ? new Date(user.lastOrderDate).toLocaleDateString() : '—'} />
          <Info label="Tags" value={user.tags?.join(', ') || '—'} />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 flex gap-8 text-sm font-medium">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 transition duration-200 ${
                activeTab === tab
                  ? 'border-b-2 border-indigo-500 text-indigo-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'Orders' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Order count : {orders.length}</h2>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow"
              >
                <Plus size={16} /> New Order
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-gray-500">No orders found for this customer.</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order._id} className="bg-gray-900 p-5 rounded-xl shadow-md">
                    <Info label="Order #" value={order.orderNumber} />
                    <Info label="Total" value={`$${order.totalAmount}`} />
                    <Info label="Status" value={order.status} />
                    <Info label="Date" value={new Date(order.createdAt).toLocaleDateString()} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'Campaigns' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Campaigns</h2>
            {user.campaigns?.length === 0 ? (
              <p className="text-gray-500">No campaigns associated with this customer.</p>
            ) : (
              <div className="space-y-4">
                {user.campaigns.map(camp => (
                  <div key={camp._id} className="bg-gray-900 p-5 rounded-xl shadow-md">
                    <Info label="Name" value={camp.name} />
                    {/* <Info label="Message" value={camp.message} /> */}
                    {/* <Info label="Channel" value={camp.channel} /> */}
                    {/* <Info label="Status" value={camp.status} /> */}
                    <Info label="Created At" value={new Date(camp.createdAt).toLocaleDateString()} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateOrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onOrderCreated={handleOrderCreated}
        customerId={id}
      />
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-white font-medium">{value}</p>
  </div>
);

export default CustomerDetail;
