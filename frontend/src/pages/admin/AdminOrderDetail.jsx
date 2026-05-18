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
      <div className="flex items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-900 dark:border-t-brand-200 rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!order) return <div className="p-8 text-red-500">Order not found</div>;

  const timelineSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = timelineSteps.indexOf(order.status) !== -1 ? timelineSteps.indexOf(order.status) : 0;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/orders" className="p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600">
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h1>
          <p className="text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Timeline */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Order Status</h2>
            {order.status === 'Cancelled' ? (
              <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                <FaTimesCircle className="text-2xl" />
                <span className="font-bold">This order has been cancelled.</span>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full z-0"></div>
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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${isCompleted ? 'bg-brand-500 border-white text-white shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}>
                          {index === 0 && <FaBox />}
                          {index === 1 && <div className="w-2 h-2 rounded-full bg-current"></div>}
                          {index === 2 && <FaTruck />}
                          {index === 3 && <FaCheckCircle />}
                        </div>
                        <span className={`text-sm font-medium ${isCurrent ? 'text-brand-900 font-bold' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {order.status !== 'Cancelled' && (
              <div className="mt-10 flex gap-4 border-t border-gray-100 pt-8">
                <p className="text-sm text-gray-500 font-medium self-center mr-4">Update Status:</p>
                {timelineSteps.map(step => (
                  <button 
                    key={step}
                    onClick={() => handleStatusUpdate(step)}
                    disabled={order.status === step}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      order.status === step 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 shadow-sm'
                    }`}
                  >
                    Mark as {step}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
            <div className="space-y-6">
              {order.products.map((item, idx) => (
                <div key={idx} className="flex gap-6 items-center p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><FaBox className="text-3xl" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                    <p className="text-gray-500 text-sm mt-1">Qty: {item.quantity} × &#8377;{item.price.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">&#8377;{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>&#8377;{order.totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-brand-900 pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span>&#8377;{order.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Customer Info */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><FaUser className="text-brand-500" /> Customer Details</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">{order.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Username</p>
                <p className="font-medium text-gray-900">{order.user?.username || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Phone Number</p>
                <p className="font-medium text-gray-900">{order.user?.phoneNumber || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Registration Date</p>
                <p className="font-medium text-gray-900">{order.user?.createdAt ? new Date(order.user.createdAt).toLocaleDateString() : 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><FaMapMarkerAlt className="text-brand-500" /> Shipping Address</h2>
            <p className="text-gray-700 leading-relaxed text-sm">
              {order.shippingAddress}
            </p>
          </div>

          {/* Return Request (If any) */}
          {order.returnStatus !== 'None' && (
            <div className="bg-orange-50 rounded-3xl p-8 border border-orange-100 shadow-sm">
              <h2 className="text-xl font-bold text-orange-900 mb-4">Return Status</h2>
              <span className="inline-block px-3 py-1 bg-white rounded-full text-orange-700 font-bold text-xs mb-4 border border-orange-200">
                {order.returnStatus}
              </span>
              <p className="text-sm text-orange-800 mb-4">
                <span className="font-bold block mb-1">Reason:</span>
                {order.returnReason || 'No reason provided'}
              </p>
              
              {order.returnImages && order.returnImages.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-orange-800 mb-2">Attached Photos:</p>
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                    {order.returnImages.map((img, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => { setPreviewIndex(idx); setIsPreviewOpen(true); }}
                        className="group relative shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-orange-200 snap-center"
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
              
              <div className="flex gap-3 border-t border-orange-200 pt-6">
                <button 
                  onClick={() => handleReturnStatusUpdate('Approved')}
                  disabled={order.returnStatus === 'Approved' || order.returnStatus === 'Refunded'}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-bold transition-colors"
                >
                  Approve Return
                </button>
                <button 
                  onClick={() => handleReturnStatusUpdate('Rejected')}
                  disabled={order.returnStatus === 'Rejected' || order.returnStatus === 'Refunded'}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-bold transition-colors"
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
