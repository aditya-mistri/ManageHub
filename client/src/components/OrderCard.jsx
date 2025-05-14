import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, DollarSign, CheckCircle, XCircle } from 'lucide-react';

const OrderCard = ({ order }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/orders/${order._id}`);
  };

  const StatusBadge = ({ status, type = 'order' }) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1';

    const statusMap = {
      order: {
        delivered: ['bg-green-900 text-green-300', <CheckCircle size={14} />],
        pending: ['bg-yellow-900 text-yellow-300', <ShoppingBag size={14} />],
        cancelled: ['bg-red-900 text-red-300', <XCircle size={14} />]
      },
      payment: {
        paid: ['bg-green-900 text-green-300', <CheckCircle size={14} />],
        failed: ['bg-red-900 text-red-300', <XCircle size={14} />],
        pending: ['bg-yellow-900 text-yellow-300', <ShoppingBag size={14} />]
      }
    };

    const [classes, icon] = statusMap[type]?.[status.toLowerCase()] || ['bg-gray-700 text-gray-300', null];

    return (
      <span className={`${baseClasses} ${classes}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div
      className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex justify-between items-start">
        {/* Left: Order Info */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
            Order #{order.orderNumber}
          </h2>
          <p className="text-gray-400">
            <span className="font-medium text-gray-300">Customer:</span> {order.user?.name} ({order.user?.email})
          </p>
          <p className="text-gray-400">
            <span className="font-medium text-gray-300">Phone:</span> {order.user?.phone || 'N/A'}
          </p>
          <div className="flex gap-2 mt-2">
            <StatusBadge status={order.status} type="order" />
            <StatusBadge status={order.paymentStatus} type="payment" />
          </div>
        </div>

        {/* Right: Stats */}
        <div className="text-right flex flex-col items-end gap-2">
          <div>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <DollarSign size={14} /> Total
            </p>
            <p className="text-lg font-bold text-white">${order.totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <ShoppingBag size={14} /> Items
            </p>
            <p className="text-lg font-bold text-white">{order.items.length}</p>
          </div>
        </div>
      </div>

      {/* Item list */}
      <ul className="mt-4 pt-4 border-t border-gray-700 text-sm list-disc list-inside text-gray-300">
        {order.items.map((item, idx) => (
          <li key={idx}>
            {item.name} – {item.quantity} × ${item.price.toFixed(2)}
          </li>
        ))}
      </ul>

      {/* Timestamp */}
      <div className="mt-4 flex justify-between items-center text-gray-400 text-xs">
        <p>
          Created: {new Date(order.createdAt).toLocaleDateString()} @{' '}
          {new Date(order.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default OrderCard;
