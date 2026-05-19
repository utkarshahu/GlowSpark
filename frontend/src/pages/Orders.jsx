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
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders((prev) => {
        const existing = prev.find(o => o._id === updatedOrder._id);
        if (existing && existing.status !== updatedOrder.status) {
          toast.info(`📦 Order Status Updated! Your order #${updatedOrder._id.slice(-6)} is now: ${updatedOrder.status}`, {
            position: "top-right",
            autoClose: 5000,
            theme: "colored"
          });
        }
        return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
      });
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

  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });
  const [cancelForm, setCancelForm] = useState({ reason: '' });
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelRequest = (orderId) => {
    setCancelModal({ isOpen: true, orderId });
  };

  const submitCancel = async (e) => {
    e.preventDefault();
    if (!cancelForm.reason) return;
    
    setIsCancelling(true);
    try {
      const res = await api.post(`/orders/${cancelModal.orderId}/cancel`, { cancelReason: cancelForm.reason });
      if (res.data.success) {
        toast.success("Order cancelled successfully");
        setCancelModal({ isOpen: false, orderId: null });
        setCancelForm({ reason: '' });
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const steps = [
    { status: 'Pending', label: 'Order Placed', desc: 'Your order was successfully registered on our system.' },
    { status: 'Processing', label: 'Processing', desc: 'Your luxurious items are being carefully inspected and hand-packed.' },
    { status: 'Shipped', label: 'Shipped', desc: 'Your package is on its way to you via our express courier.' },
    { status: 'Delivered', label: 'Delivered', desc: 'Package delivered! We hope you love your new GlowSpark selection.' }
  ];

  const stepsCancelled = [
    { status: 'Pending', label: 'Order Placed', desc: 'Order request received.' },
    { status: 'Cancelled', label: 'Cancelled', desc: 'This order was cancelled.' }
  ];

  return (
    <div className="bg-brand-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <Navbar />
      <div className="pt-32 max-w-2xl mx-auto px-4 pb-20">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-8 text-center">My Orders</h1>
        
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-brand-100 dark:border-gray-700 space-y-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-100 dark:border-gray-700 pb-4 gap-4">
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="h-3.5 w-32 bg-gray-100 dark:bg-gray-700/60 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
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
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-brand-100/50 dark:border-gray-700">
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Order ID</p>
                    <p className="text-xs font-mono font-bold text-brand-700">#{order._id.substring(order._id.length - 8)}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif font-black text-brand-950 dark:text-white text-base">&#8377; {order.totalAmount.toLocaleString("en-IN")}</p>
                    <div className="flex gap-1.5 mt-2 justify-end">
                       <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-755'
                      }`}>
                        {order.status}
                      </span>
                      
                      {order.returnStatus !== 'None' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-105 text-purple-700">
                          Return: {order.returnStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.products.map((item) => {
                    const itemImageUrl = item.image || 
                      (item.product?.images && item.product.images[item.product.thumbnailIndex || 0]?.url) || 
                      (item.product?.images && item.product.images[0]?.url);
                    return (
                      <div key={item.product?._id || Math.random()} className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden border shrink-0">
                          {itemImageUrl ? (
                            <img src={itemImageUrl} alt={item.product?.title || item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 dark:text-white text-xs truncate">{item.product?.title || item.name || 'Product Unavailable'}</h4>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Qty: {item.quantity} × &#8377; {item.price.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Timeline and Actions Control Row */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <button 
                    onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                    className="text-[10px] font-black uppercase tracking-wider text-brand-900 hover:text-black dark:text-brand-400 dark:hover:text-white flex items-center gap-1"
                  >
                    {expandedOrderId === order._id ? 'Hide Tracker' : 'Track Order'}
                    <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${expandedOrderId === order._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  
                  <div className="flex gap-2">
                    {(order.status === 'Pending' || order.status === 'Processing') && (
                       <button 
                         onClick={() => handleCancelRequest(order._id)}
                         className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3.5 py-2 rounded-xl border border-red-100 hover:bg-red-100 transition-all"
                       >
                         Cancel
                       </button>
                    )}
                    {order.status === 'Delivered' && order.returnStatus === 'None' && (
                       <button 
                         onClick={() => handleReturnRequest(order._id)}
                         className="text-[10px] font-bold uppercase tracking-wider text-brand-900 hover:text-black bg-brand-50 px-3.5 py-2 rounded-xl border border-brand-100 hover:bg-brand-100 transition-all"
                       >
                         Return
                       </button>
                    )}
                  </div>
                </div>

                {/* Expanded Tracking Timeline (4th Image high-fidelity replica) */}
                {expandedOrderId === order._id && (
                  <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-brand-100/40 dark:border-gray-800 transition-all duration-300">
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-5">Order Progress</h4>
                    
                    <div className="relative pl-1">
                      {/* Vertical connector line */}
                      <div className="absolute left-[15px] top-1.5 bottom-1.5 w-[2px] bg-gray-200 dark:bg-gray-800 z-0"></div>
                      
                      {(order.status === 'Cancelled' ? stepsCancelled : steps).map((step, idx) => {
                        const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered'];
                        const currentIdx = statusOrder.indexOf(order.status);
                        const stepIdx = statusOrder.indexOf(step.status);
                        
                        const isCompleted = order.status === 'Cancelled' 
                          ? (step.status === 'Pending' || order.status === step.status)
                          : (stepIdx <= currentIdx);
                        
                        const isActive = order.status === step.status;
                        
                        return (
                          <div key={step.status} className="relative pl-10 pb-5 last:pb-1 flex flex-col z-10">
                            
                            {/* Milestone Dot Bubble */}
                            <div 
                              className={`absolute left-0 top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-all ${
                                isActive ? 'text-white animate-pulse font-extrabold shadow-sm' :
                                isCompleted ? 'text-white font-bold' :
                                'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                              }`}
                              style={(isActive || isCompleted) ? { backgroundColor: '#a37c6c', borderColor: '#a37c6c' } : {}}
                            >
                              {isCompleted ? (
                                <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              ) : (
                                <span>{idx + 1}</span>
                              )}
                            </div>
                            
                            {/* Text detail */}
                            <div>
                              <h5 className={`text-xs font-extrabold ${isActive ? 'text-black dark:text-white font-black' : 'text-gray-900 dark:text-gray-300'}`}>{step.label}</h5>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{step.desc}</p>
                            </div>
                            
                          </div>
                        );
                      })}
                    </div>
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

      {/* Cancel Modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-8 border border-brand-100 dark:border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">Cancel Order</h2>
            <form onSubmit={submitCancel} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for Cancellation</label>
                <textarea 
                  required
                  rows="4"
                  value={cancelForm.reason}
                  onChange={(e) => setCancelForm({...cancelForm, reason: e.target.value})}
                  placeholder="Please describe why you are cancelling this order..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setCancelModal({ isOpen: false, orderId: null })} className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-950 font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={isCancelling} className="bg-brand-900 text-white px-8 py-2 rounded-xl font-medium hover:bg-black disabled:bg-gray-400 transition-colors">
                  {isCancelling ? 'Submitting...' : 'Submit Cancellation'}
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
