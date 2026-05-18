import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { FaTag, FaCreditCard, FaLock } from 'react-icons/fa';

const Checkout = () => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.currentUser);
  const isBlocked = user?.isBlocked;

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        if (res.data.success) {
          if(res.data.cart.length === 0) {
            navigate('/products');
          }
          setCart(res.data.cart);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return toast.error("Please enter a coupon code");
    
    try {
      const currentSubtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      const res = await api.post('/coupons/apply', { code: couponCode, cartTotal: currentSubtotal });
      if (res.data.success) {
        setDiscountAmount(res.data.discountAmount);
        toast.success(res.data.message, { theme: "dark" });
      }
    } catch (err) {
      setDiscountAmount(0);
      toast.error(err.response?.data?.message || "Invalid coupon code");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate secure payment processing delay
    setTimeout(async () => {
      try {
        const res = await api.post('/orders', { shippingAddress });
        if (res.data.success) {
          toast.success("Payment successful! Order Confirmed!");
          
          // Clear backend cart
          await api.delete('/cart/clear');
          
          // Clear frontend redux cart
          dispatch(clearCart());

          navigate('/products');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Transaction failed. Please try again.');
        setError(err.response?.data?.message || 'Transaction failed.');
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  const subtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const totalAmount = Math.max(0, subtotal - discountAmount);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-900 dark:border-t-brand-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-brand-50 dark:bg-gray-900 min-h-screen pb-20 transition-colors duration-300">
      <Navbar />
      <div className="pt-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-brand-100 dark:border-gray-700 p-8 md:p-12 transition-colors duration-300">
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>
          
          {isBlocked && (
            <div className="bg-red-100 text-red-800 p-6 rounded-2xl mb-8 font-bold border border-red-200">
              Your account has been restricted from placing orders. Please contact customer support.
            </div>
          )}

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

          <div className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.product._id} className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>{item.quantity}x {item.product.title}</span>
                  <span>&#8377; {(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div className="flex justify-between text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                <span>Subtotal</span>
                <span>&#8377; {subtotal.toLocaleString("en-IN")}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount Applied</span>
                  <span>- &#8377; {discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-brand-800 dark:text-brand-400 pt-4 border-t border-brand-100 dark:border-gray-700 mt-2">
                <span>Total Amount to Pay</span>
                <span>&#8377; {totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><FaTag /> Apply Coupon</h2>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter GLOW20" 
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:ring-brand-500 focus:border-brand-500 outline-none uppercase"
              />
              <button onClick={handleApplyCoupon} type="button" className="bg-brand-100 text-brand-900 px-6 rounded-xl font-bold hover:bg-brand-200 transition-colors">
                Apply
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Shipping Details</h2>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Delivery Address</label>
              <textarea 
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows="4" 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors resize-none"
                placeholder="123 Beauty Lane, Glow City, 10001"
              ></textarea>
            </div>

            <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FaCreditCard /> Payment Method</h2>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 mb-2">
                <input type="radio" checked readOnly className="accent-brand-900 w-4 h-4" />
                <span>Credit/Debit Card (Simulated Secure Checkout)</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 ml-7"><FaLock /> 256-bit encryption</p>
            </div>

            <button disabled={isProcessing || isBlocked} type="submit" className="w-full flex items-center justify-center gap-3 bg-brand-900 hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg">
              {isProcessing ? 'Processing Securely...' : `Pay \u20B9 ${totalAmount.toLocaleString("en-IN")}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
