import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, ArrowRight, ShoppingBag, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import UpdateUserModal from './UpdateUserModal'; // Import the UpdateUserModal component

const UserCard = ({ user, onDelete, onUpdate }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // State to control the modal
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDelete(user._id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/customers/${user._id}`);
  };

  // Function to handle opening the update modal
  const handleOpenUpdateModal = (e) => {
    e.stopPropagation(); // Prevent card click event
    setIsUpdateModalOpen(true);
  };

  // Function to handle closing the update modal
  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const StatusBadge = ({ status }) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    if (status === 'active' || status === 'new') {
      return (
        <span className={`${baseClasses} bg-green-900 text-green-300 flex items-center gap-1`}>
          <CheckCircle size={14} /> Active
        </span>
      );
    }
    return (
      <span className={`${baseClasses} bg-red-900 text-red-300 flex items-center gap-1`}>
        <XCircle size={14} /> Inactive
      </span>
    );
  };

  return (
    <>
      <div
        className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 cursor-pointer group"
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start">
          {/* Left Side: User Info */}
          <div className="flex items-center gap-4">
            <div className="bg-blue-600/20 p-3 rounded-full">
              <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center text-2xl font-bold text-blue-300">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                {user.name}
              </h2>
              <p className="text-gray-400">{user.email}</p>
              <div className="mt-2 flex gap-2">
                <StatusBadge status={user.status} />
                <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <ShoppingBag size={14} /> {user.campaigns.length} campaigns
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Stats and Actions */}
          <div className="flex flex-col items-end">
            {/* Stats */}
            <div className="flex gap-4 mb-4">
              <div className="text-right">
                <p className="text-sm text-gray-400 flex items-center justify-end gap-1">
                  <DollarSign size={14} /> Total Spends
                </p>
                <p className="text-lg font-bold text-white">${user.totalSpend?.toLocaleString() || '0'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 flex items-center justify-end gap-1">
                  <ShoppingBag size={14} /> Orders
                </p>
                <p className="text-lg font-bold text-white">{user.orderCount || '0'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleOpenUpdateModal} // Update to use the modal instead of navigation
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-gray-300 hover:text-white"
                title="Edit user"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`p-2 rounded-lg bg-gray-700 hover:bg-red-900 transition-colors text-gray-300 hover:text-white ${
                  isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Delete user"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={handleCardClick}
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-white flex items-center gap-1"
                title="View details"
              >
                <span>Details</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Last Order Info (if available) */}
        {user.lastOrderDate && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Last order: {new Date(user.lastOrderDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>

      {/* Update User Modal */}
      <UpdateUserModal 
        isOpen={isUpdateModalOpen}
        onClose={handleCloseUpdateModal}
        user={user}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default UserCard;