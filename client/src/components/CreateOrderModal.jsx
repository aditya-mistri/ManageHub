import React, { useEffect, useState } from 'react';
import axios from 'axios';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentOptions = ['pending', 'paid', 'failed', 'refunded'];

export default function CreateOrderModal({ isOpen, onClose, onSuccess, customerId='' }) {
  const [customers, setCustomers] = useState([]);
  const [userId, setUserId] = useState('');
  const [items, setItems] = useState([{ name: '', quantity: 1, price: 0 }]);
  const [status, setStatus] = useState('pending');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('/api/customers');
        setCustomers(res.data || []);
      } catch (err) {
        console.error('Failed to fetch customers', err);
      }
    };
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) : value;
    setItems(updated);
  };

  const addItem = () => setItems([...items, { name: '', quantity: 1, price: 0 }]);
  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!userId) {
      setError('Please select a customer.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/orders', {
        user: userId,
        items,
        totalAmount,
        status,
        paymentStatus,
        deliveryDate,
        notes,
      });

      onSuccess?.(res.data.order);
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-zinc-900 text-white rounded-2xl shadow-lg w-full max-w-3xl overflow-y-auto max-h-[90vh] p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Create New Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Select Customer</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
              required
            >
              <option value="">-- Select a customer --</option>
              {customers.map((cust) => (
                <option key={cust._id} value={cust._id}>
                  {cust.name} ({cust.email})
                </option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-medium text-gray-300 mb-2">Order Items</h3>
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-3 items-center mb-2">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                  className="col-span-2 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                  required
                />
                <input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                  required
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-red-400 text-sm hover:underline"
                  disabled={items.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="mt-2 text-sm text-blue-400 hover:underline"
            >
              + Add item
            </button>
          </div>

          {/* Total */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Total Amount</label>
            <input
              type="text"
              value={`$${totalAmount.toFixed(2)}`}
              disabled
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
            />
          </div>

          {/* Status + Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
              >
                {statusOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
              >
                {paymentOptions.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Delivery Date</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white"
              placeholder="Optional notes for the order"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-zinc-600 rounded-md text-gray-300 hover:bg-zinc-700"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
