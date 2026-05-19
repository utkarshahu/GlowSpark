import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { socket } from '../../api/socket';
import { FaSearch } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { clearUnreadOrders } from '../../store/userSlice';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearUnreadOrders());
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

    socket.on('newOrderPlaced', (newOrder) => {
      setOrders((prev) => {
        if (prev.find(o => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
      toast.success(`✨ New order received! Order #${newOrder._id.slice(-6)}`, { 
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
      });
    });

    return () => {
      socket.off('orderStatusUpdated');
      socket.off('newOrderPlaced');
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
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="h-9 bg-gray-200 dark:bg-gray-700 w-1/4 rounded-lg mb-4"></div>
        
        {/* Search Bar Skeleton */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-md h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-brand-50 dark:bg-gray-700 h-14 border-b border-brand-100 dark:border-gray-600"></div>
          <div className="divide-y divide-brand-100 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="p-5 flex justify-between items-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-24 rounded-md"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-48 rounded-md"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-24 rounded-md"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-16 rounded-md"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 w-20 rounded-full"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 w-32 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
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

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
                  className="hover:bg-brand-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <td className="p-4 text-sm text-gray-800 dark:text-gray-200">#{order._id.substring(order._id.length - 8).toUpperCase()}</td>
                  <td className="p-4 text-sm text-gray-800 dark:text-gray-200">{order.user?.email || 'Guest'}</td>
                  <td className="p-4 text-sm text-gray-800 dark:text-gray-200">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-sm font-medium text-gray-800 dark:text-gray-200">&#8377; {order.totalAmount?.toLocaleString("en-IN") || order.items?.reduce((t, i) => t + (i.product.price * i.quantity), 0).toLocaleString("en-IN")}</td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      order.status === 'Processing' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      order.status === 'Returned' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm p-1"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Returned">Returned</option>
                    </select>
                    <Link 
                      to={`/admin/orders/${order._id}`} 
                      className="ml-4 text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-medium text-sm transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Modern Card View (Image 3 inspired layout) */}
        <div className="md:hidden p-4 space-y-4 bg-gray-50/30 dark:bg-gray-900/10">
          {filteredOrders.map(order => (
            <div 
              key={order._id} 
              onClick={() => navigate(`/admin/orders/${order._id}`)}
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-brand-100/60 dark:border-gray-700/80 shadow-sm space-y-3 cursor-pointer hover:bg-brand-50/10 transition-all flex flex-col"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  order.status === 'Processing' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  order.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                  order.status === 'Returned' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500">Customer</p>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{order.user?.email || 'Guest'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500">Date</p>
                  <p className="font-bold text-gray-700 dark:text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500">Total amount</p>
                  <p className="font-extrabold text-brand-900 dark:text-brand-400">₹{order.totalAmount?.toLocaleString("en-IN") || order.items?.reduce((t, i) => t + (i.product.price * i.quantity), 0).toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 dark:border-gray-700/80" onClick={(e) => e.stopPropagation()}>
                <select 
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                  className="border border-brand-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-xs p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                </select>
                <Link 
                  to={`/admin/orders/${order._id}`} 
                  className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 text-brand-900 dark:text-brand-400 font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  View Order
                </Link>
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <p className="text-center py-6 text-gray-500">No orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
