import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUndo, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { socket } from '../../api/socket';

const AdminReturns = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
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
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
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
                    onClick={() => setSelectedReturnOrder(order)}
                    className="hover:bg-brand-50/20 dark:hover:bg-gray-700/20 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-mono font-bold text-brand-600 dark:text-brand-400" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/admin/orders/${order._id}`} className="hover:underline hover:text-brand-800">
                        #{order._id.substring(order._id.length - 6)}
                      </Link>
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

          {/* Mobile Modern Card View (Image 3 inspired layout) */}
          <div className="md:hidden p-4 space-y-4 bg-gray-50/30 dark:bg-gray-900/10">
            {filteredOrders.map(order => (
              <div 
                key={order._id} 
                onClick={() => setSelectedReturnOrder(order)}
                className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-brand-100/60 dark:border-gray-700/80 shadow-sm space-y-3 transition-all flex flex-col cursor-pointer hover:border-brand-200 dark:hover:border-gray-650"
              >
                <div className="flex justify-between items-center">
                  <Link to={`/admin/orders/${order._id}`} onClick={(e) => e.stopPropagation()} className="font-mono text-xs font-bold text-brand-600 hover:underline">
                    #{order._id.substring(order._id.length - 6)}
                  </Link>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    order.returnStatus === 'Requested' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    order.returnStatus === 'Approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    order.returnStatus === 'Refunded' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {order.returnStatus}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500">Customer</p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-250 truncate">{order.user?.email || 'Guest'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500">Return Reason</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 italic line-clamp-2 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800">
                    "{order.returnReason}"
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-gray-100 dark:border-gray-700/80" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500">Amount</p>
                    <p className="text-sm font-extrabold text-brand-900 dark:text-brand-400">₹{order.totalAmount}</p>
                  </div>
                  <div className="flex gap-2">
                    {order.returnStatus === 'Requested' && (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(order._id, 'Approved')} 
                          className="px-3.5 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-950/20 text-green-600 dark:text-green-400 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm"
                        >
                          <FaCheck className="text-[10px]" /> Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(order._id, 'Rejected')} 
                          className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-500 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm"
                        >
                          <FaTimes className="text-[10px]" /> Reject
                        </button>
                      </>
                    )}
                    {order.returnStatus === 'Approved' && (
                      <button 
                        onClick={() => handleUpdateStatus(order._id, 'Refunded')} 
                        className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 text-brand-900 dark:text-brand-400 font-bold text-xs rounded-xl transition-all shadow-sm"
                      >
                        Mark Refunded
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <p className="text-center py-6 text-gray-500">No return requests found.</p>
            )}
          </div>
        </div>
      )}

      {/* Return Details Modal Overlay */}
      {selectedReturnOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 border border-brand-100 dark:border-gray-700 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Return Request Details</span>
                <h3 className="text-xl font-serif font-black text-gray-900 dark:text-white mt-1">Order #{selectedReturnOrder._id}</h3>
              </div>
              <button 
                onClick={() => setSelectedReturnOrder(null)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 bg-gray-50 dark:bg-gray-750 rounded-full transition-all"
              >
                <FaTimes className="text-base" />
              </button>
            </div>

            {/* Core Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-brand-50/50">
                <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1">Customer Profile</p>
                <p className="text-xs font-bold text-gray-900 dark:text-white">{selectedReturnOrder.user?.email || 'Guest User'}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">ID: {selectedReturnOrder.user?._id || 'N/A'}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-brand-50/50">
                <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 mb-1">Return Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedReturnOrder.returnStatus === 'Requested' ? 'bg-yellow-100 text-yellow-755' :
                    selectedReturnOrder.returnStatus === 'Approved' ? 'bg-blue-100 text-blue-700' :
                    selectedReturnOrder.returnStatus === 'Refunded' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedReturnOrder.returnStatus}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-brand-700">₹{selectedReturnOrder.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="space-y-3">
              <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">Items Requested for Return</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {selectedReturnOrder.products.map((item) => {
                  const itemImageUrl = item.image || 
                    (item.product?.images && item.product.images[item.product.thumbnailIndex || 0]?.url) || 
                    (item.product?.images && item.product.images[0]?.url);
                  return (
                    <div key={item.product?._id || Math.random()} className="flex items-center gap-3 bg-white dark:bg-gray-750 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden border shrink-0">
                        {itemImageUrl ? (
                          <img src={itemImageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200"></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.name || 'Product'}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Return Reason Statement */}
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">Reason Statement</h4>
              <div className="p-4 bg-brand-50/30 dark:bg-gray-900 border border-brand-100/30 dark:border-gray-800 rounded-2xl">
                <p className="text-xs text-gray-700 dark:text-gray-305 leading-relaxed font-medium italic">
                  "{selectedReturnOrder.returnReason || 'No reason specified by customer.'}"
                </p>
              </div>
            </div>

            {/* Images attached */}
            {selectedReturnOrder.returnImages && selectedReturnOrder.returnImages.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">Defect Image Attachments</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedReturnOrder.returnImages.map((img, idx) => (
                    <a key={idx} href={img.url} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-xl overflow-hidden border border-brand-100 hover:opacity-85 transition-opacity bg-gray-50 shrink-0">
                      <img src={img.url} alt={`Defect Attachment ${idx + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Panel */}
            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              {selectedReturnOrder.returnStatus === 'Requested' && (
                <>
                  <button 
                    onClick={() => {
                      handleUpdateStatus(selectedReturnOrder._id, 'Approved');
                      setSelectedReturnOrder(null);
                    }} 
                    className="flex-1 flex justify-center items-center gap-1.5 py-3 bg-green-650 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    <FaCheck className="text-[10px]" /> Approve Request
                  </button>
                  <button 
                    onClick={() => {
                      handleUpdateStatus(selectedReturnOrder._id, 'Rejected');
                      setSelectedReturnOrder(null);
                    }} 
                    className="flex-1 flex justify-center items-center gap-1.5 py-3 bg-red-650 hover:bg-red-750 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    <FaTimes className="text-[10px]" /> Reject Request
                  </button>
                </>
              )}
              {selectedReturnOrder.returnStatus === 'Approved' && (
                <button 
                  onClick={() => {
                    handleUpdateStatus(selectedReturnOrder._id, 'Refunded');
                    setSelectedReturnOrder(null);
                  }} 
                  className="w-full flex justify-center items-center gap-1.5 py-3 bg-black hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Confirm Refund Issued
                </button>
              )}
              <button 
                onClick={() => setSelectedReturnOrder(null)} 
                className={`py-3 px-6 bg-gray-100 hover:bg-gray-250 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-750 dark:text-white font-bold text-xs rounded-xl transition-all ${
                  selectedReturnOrder.returnStatus === 'Refunded' || selectedReturnOrder.returnStatus === 'Rejected' ? 'w-full' : ''
                }`}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturns;
