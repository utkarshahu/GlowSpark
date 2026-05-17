import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaUndo } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { socket } from '../api/socket';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders((prev) => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      socket.off('orderStatusUpdated');
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const [returnModal, setReturnModal] = useState({ isOpen: false, orderId: null });
  const [returnForm, setReturnForm] = useState({ reason: '', images: null });
  const [isReturning, setIsReturning] = useState(false);

  const handleReturnRequest = (orderId) => {
    setReturnModal({ isOpen: true, orderId });
  };

  const submitReturn = async (e) => {
    e.preventDefault();
    if (!returnForm.reason) return;
    
    setIsReturning(true);
    const formData = new FormData();
    formData.append('returnReason', returnForm.reason);
    
    if (returnForm.images) {
      for (let i = 0; i < returnForm.images.length; i++) {
        formData.append('images', returnForm.images[i]);
      }
    }

    try {
      const res = await api.post(`/orders/${returnModal.orderId}/return`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success("Return requested successfully");
        setReturnModal({ isOpen: false, orderId: null });
        setReturnForm({ reason: '', images: null });
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request return");
    } finally {
      setIsReturning(false);
    }
  };

  return (
    <div className="bg-brand-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <Navbar />
      <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
             <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
           <div className="bg-white dark:bg-gray-800 rounded-3xl p-16 text-center shadow-sm border border-brand-100 dark:border-gray-700 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-brand-50 dark:bg-gray-700 text-brand-300 dark:text-gray-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              <FaBox />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-4">No orders yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Looks like you haven't made your first purchase yet.</p>
            <Link to="/products" className="inline-block bg-brand-900 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-brand-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Order #{order._id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <p className="font-serif font-bold text-xl text-gray-900 dark:text-white">&#8377; {order.totalAmount.toLocaleString("en-IN")}</p>
                    <div className="flex gap-2 mt-2">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                      
                      {order.returnStatus !== 'None' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                          Return: {order.returnStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.products.map((item) => (
                     <div key={item.product?._id || Math.random()} className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                         {item.product?.image?.url || item.image ? (
                           <img src={item.product?.image?.url || item.image} alt={item.product?.title || item.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full bg-gray-200"></div>
                         )}
                       </div>
                       <div className="flex-1">
                         <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.product?.title || item.name || 'Product Unavailable'}</h4>
                         <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity} × &#8377; {item.price.toLocaleString("en-IN")}</p>
                       </div>
                     </div>
                  ))}
                </div>

                {order.status === 'Delivered' && order.returnStatus === 'None' && (
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                     <button 
                       onClick={() => handleReturnRequest(order._id)}
                       className="flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-800 transition-colors"
                     >
                       <FaUndo /> Request Return
                     </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Modal */}
      {returnModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-8 border border-brand-100 dark:border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">Request Return</h2>
            <form onSubmit={submitReturn} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Return</label>
                <textarea 
                  required
                  rows="4"
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({...returnForm, reason: e.target.value})}
                  placeholder="Please describe why you are returning this item..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Defect Images (Optional, Max 5)</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => setReturnForm({...returnForm, images: e.target.files})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brand-50 file:text-brand-900 hover:file:bg-brand-100"
                />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setReturnModal({ isOpen: false, orderId: null })} className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={isReturning} className="bg-brand-900 text-white px-8 py-2 rounded-xl font-medium hover:bg-black disabled:bg-gray-400 transition-colors">
                  {isReturning ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
