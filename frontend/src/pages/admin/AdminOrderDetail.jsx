import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaUser, FaMapMarkerAlt, FaSearchPlus } from 'react-icons/fa';
import ImagePreviewModal from '../../components/ImagePreviewModal';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/admin/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        toast.error("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      const res = await api.put(`/admin/orders/${id}`, { status: newStatus });
      if (res.data.success) {
        setOrder(res.data.order);
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleReturnStatusUpdate = async (newReturnStatus) => {
    try {
      const res = await api.put(`/admin/orders/${id}/return-status`, { returnStatus: newReturnStatus });
      if (res.data.success) {
        setOrder(res.data.order);
        toast.success(`Return status updated to ${newReturnStatus}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update return status');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse max-w-6xl mx-auto pb-12">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 w-48 rounded-lg"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 w-32 rounded-md"></div>
          </div>
        </div>

        {/* 3-Column Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 w-1/4 rounded-md"></div>
              {[1, 2].map((n) => (
                <div key={n} className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 w-32 rounded-md"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 w-16 rounded-md"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 w-16 rounded-md"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 w-1/2 rounded-md"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-3/4 rounded-md"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/2 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!order) return <div className="p-8 text-red-500">Order not found</div>;

  const timelineSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = timelineSteps.indexOf(order.status) !== -1 ? timelineSteps.indexOf(order.status) : 0;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/orders" className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8">Order Status</h2>
            {order.status === 'Cancelled' ? (
              <div className="flex items-center gap-3 text-red-600 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                <FaTimesCircle className="text-2xl" />
                <span className="font-bold">This order has been cancelled.</span>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700 -translate-y-1/2 rounded-full z-0"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-brand-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500" 
                  style={{ width: `${(currentStepIndex / (timelineSteps.length - 1)) * 100}%` }}
                ></div>
                
                <div className="relative z-10 flex justify-between">
                  {timelineSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                      <div key={step} className="flex flex-col items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${
                          isCompleted 
                            ? 'bg-brand-500 border-white dark:border-gray-800 text-white shadow-md' 
                            : 'bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                        }`}>
                          {index === 0 && <FaBox />}
                          {index === 1 && <div className="w-2 h-2 rounded-full bg-current"></div>}
                          {index === 2 && <FaTruck />}
                          {index === 3 && <FaCheckCircle />}
                        </div>
                        <span className={`text-sm font-medium ${isCurrent ? 'text-brand-900 dark:text-brand-400 font-bold' : isCompleted ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {order.status !== 'Cancelled' && (
              <div className="mt-10 flex flex-wrap gap-4 border-t border-gray-100 dark:border-gray-700 pt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium self-center mr-4">Update Status:</p>
                {timelineSteps.map(step => (
                  <button 
                    key={step}
                    onClick={() => handleStatusUpdate(step)}
                    disabled={order.status === step}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      order.status === step 
                        ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed border-none' 
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-700 hover:text-brand-700 dark:hover:text-white hover:border-brand-200 dark:hover:border-gray-600 shadow-sm'
                    }`}
                  >
                    Mark as {step}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Items</h2>
            <div className="space-y-6">
              {order.products.map((item, idx) => {
                const itemImageUrl = item.image || 
                  (item.product?.images && item.product.images[item.product.thumbnailIndex || 0]?.url) || 
                  (item.product?.images && item.product.images[0]?.url);
                return (
                  <div key={idx} className="flex gap-6 items-center p-4 rounded-2xl border border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="w-20 h-20 bg-gray-105 dark:bg-gray-900 rounded-xl overflow-hidden shrink-0">
                      {itemImageUrl ? (
                        <img src={itemImageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><FaBox className="text-3xl" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white truncate">{item.name}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Qty: {item.quantity} × &#8377;{item.price.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900 dark:text-white">&#8377;{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>&#8377;{order.totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-brand-900 dark:text-brand-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span>Total</span>
                  <span>&#8377;{order.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Customer Info */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><FaUser className="text-brand-500" /> Customer Details</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <p className="font-medium text-gray-900 dark:text-gray-200">{order.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Username</p>
                <p className="font-medium text-gray-900 dark:text-gray-200">{order.user?.username || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Phone Number</p>
                <p className="font-medium text-gray-900 dark:text-gray-200">{order.user?.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Registration Date</p>
                <p className="font-medium text-gray-900 dark:text-gray-200">{order.user?.createdAt ? new Date(order.user.createdAt).toLocaleDateString() : 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><FaMapMarkerAlt className="text-brand-500" /> Shipping Address</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
              {order.shippingAddress}
            </p>
          </div>

          {/* Return Request (If any) */}
          {order.returnStatus !== 'None' && (
            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-3xl p-8 border border-orange-100 dark:border-orange-900/30 shadow-sm">
              <h2 className="text-xl font-bold text-orange-900 dark:text-orange-400 mb-4">Return Status</h2>
              <span className="inline-block px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-orange-700 dark:text-orange-400 font-bold text-xs mb-4 border border-orange-200 dark:border-orange-850">
                {order.returnStatus}
              </span>
              <p className="text-sm text-orange-800 dark:text-orange-300 mb-4">
                <span className="font-bold block mb-1">Reason:</span>
                {order.returnReason || 'No reason provided'}
              </p>
              
              {order.returnImages && order.returnImages.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-2">Attached Photos:</p>
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                    {order.returnImages.map((img, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => { setPreviewIndex(idx); setIsPreviewOpen(true); }}
                        className="group relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-orange-200 dark:border-orange-800 snap-center"
                      >
                        <img src={img.url} alt={`Return photo ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <FaSearchPlus className="text-white text-xl" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 border-t border-orange-200 dark:border-orange-900/30 pt-6">
                <button 
                  onClick={() => handleReturnStatusUpdate('Approved')}
                  disabled={order.returnStatus === 'Approved' || order.returnStatus === 'Refunded'}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-800 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  Approve Return
                </button>
                <button 
                  onClick={() => handleReturnStatusUpdate('Rejected')}
                  disabled={order.returnStatus === 'Rejected' || order.returnStatus === 'Refunded'}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 dark:disabled:bg-gray-800 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  Reject Return
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ImagePreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        images={order?.returnImages || []} 
        initialIndex={previewIndex} 
      />
    </div>
  );
};

export default AdminOrderDetail;
