import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUndo, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { socket } from '../../api/socket';

const AdminReturns = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReturnRequests();

    socket.on('returnRequested', (newReturn) => {
      setOrders((prev) => {
        const exists = prev.find(o => o._id === newReturn._id);
        if (exists) return prev.map(o => o._id === newReturn._id ? newReturn : o);
        return [newReturn, ...prev];
      });
      toast.info(`New Return Request: #${newReturn._id.substring(newReturn._id.length - 6)}`, {
        icon: "🔄"
      });
    });

    socket.on('orderStatusUpdated', (updatedOrder) => {
      if (updatedOrder.returnStatus !== 'None') {
        setOrders((prev) => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      } else {
        setOrders((prev) => prev.filter(o => o._id !== updatedOrder._id));
      }
    });

    return () => {
      socket.off('returnRequested');
      socket.off('orderStatusUpdated');
    };
  }, []);

  const fetchReturnRequests = async () => {
    try {
      const res = await api.get('/admin/orders');
      if (res.data.success) {
        // Filter only orders that have some return status other than 'None'
        const returnOrders = res.data.orders.filter(o => o.returnStatus !== 'None');
        setOrders(returnOrders);
      }
    } catch (err) {
      toast.error("Failed to fetch returns");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/return-status`, { returnStatus: newStatus });
      if (res.data.success) {
        toast.success(`Return marked as ${newStatus}`);
        fetchReturnRequests();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.user?.email || 'Guest').toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.returnReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.returnStatus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Return Requests</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage customer return and refund requests</p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search return requests..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all"
          />
          <FaSearch className="absolute left-3.5 top-4 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-brand-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-brand-50 dark:bg-gray-700 h-14 border-b border-brand-100 dark:border-gray-600"></div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="p-5 flex justify-between items-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-24 rounded-md"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-48 rounded-md"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-32 rounded-md"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-16 rounded-md"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 w-20 rounded-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-16 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-brand-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-brand-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredOrders.map(order => (
                <tr 
                  key={order._id} 
                  onClick={() => navigate(`/admin/orders/${order._id}`)}
                  className="hover:bg-brand-50/50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm font-mono text-brand-600 dark:text-brand-400">
                    #{order._id.substring(order._id.length - 6)}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-300 text-sm">{order.user?.email || 'Guest'}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-300 text-sm max-w-xs truncate">{order.returnReason}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-300">₹{order.totalAmount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.returnStatus === 'Requested' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      order.returnStatus === 'Approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      order.returnStatus === 'Refunded' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {order.returnStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.returnStatus === 'Requested' && (
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, 'Approved'); }} className="text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 p-2" title="Approve">
                          <FaCheck />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, 'Rejected'); }} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2" title="Reject">
                          <FaTimes />
                        </button>
                      </div>
                    )}
                    {order.returnStatus === 'Approved' && (
                      <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, 'Refunded'); }} className="text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 text-sm font-medium">
                        Mark Refunded
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No active return requests.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReturns;
