import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { socket } from '../../api/socket';
import { FaSearch } from 'react-icons/fa';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/admin/orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        toast.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders((prev) => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      socket.off('orderStatusUpdated');
    };
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}`, { status: newStatus });
      if (res.data.success) {
        setOrders(orders.map(o => o._id === orderId ? res.data.order : o));
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.user?.email || 'Guest').toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-900 dark:border-t-brand-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4">Order Management</h1>
      
      {/* Center Search Bar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search orders by ID, customer email, or status..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all"
          />
          <FaSearch className="absolute left-3.5 top-4 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-brand-50 dark:bg-gray-700 border-b border-brand-100 dark:border-gray-600">
            <tr>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Order ID</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Customer</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Date</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Total</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Status</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100 dark:divide-gray-700">
            {filteredOrders.map(order => (
              <tr 
                key={order._id} 
                onClick={() => navigate(`/admin/orders/${order._id}`)}
                className="hover:bg-brand-50 cursor-pointer transition-colors"
              >
                <td className="p-4 text-sm text-gray-800">#{order._id.substring(order._id.length - 8).toUpperCase()}</td>
                <td className="p-4 text-sm text-gray-800">{order.user?.email || 'Guest'}</td>
                <td className="p-4 text-sm text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-sm font-medium">&#8377; {order.totalAmount?.toLocaleString("en-IN") || order.items?.reduce((t, i) => t + (i.product.price * i.quantity), 0).toLocaleString("en-IN")}</td>
                <td className="p-4">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    className="border border-gray-300 rounded-md text-sm p-1"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <Link 
                    to={`/admin/orders/${order._id}`} 
                    className="ml-4 text-brand-600 hover:text-brand-800 font-medium text-sm transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
