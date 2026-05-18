import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCart as setReduxCart } from '../store/cartSlice';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import EmptyState from '../components/EmptyState';
import SmartImage from '../components/SmartImage';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        if (res.data.success) {
          setCart(res.data.cart);
          dispatch(setReduxCart(res.data.cart));
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
  }, [navigate, dispatch]);

  const handleRemove = async (productId) => {
    try {
      const res = await api.post(`/cart/remove/${productId}`);
      if (res.data.success) {
        setCart(res.data.cart);
        dispatch(setReduxCart(res.data.cart));
        toast.success("Item removed from cart");
      }
    } catch (err) {
      toast.error("Failed to remove item");
      console.error(err);
    }
  };

  const validCart = cart.filter(item => item && item.product);
  const totalAmount = validCart.reduce((total, item) => total + ((item.product.price || 0) * item.quantity), 0);
  const finalTotal = Math.max(0, totalAmount - discountAmount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Please enter a coupon code");
    setIsApplyingCoupon(true);
    try {
      const res = await api.post('/coupons/apply', { code: couponCode, cartTotal: totalAmount });
      if (res.data.success) {
        setDiscountAmount(res.data.discountAmount);
        setAppliedCouponId(res.data.couponId);
        toast.success(res.data.message, { theme: "dark" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply coupon");
      setDiscountAmount(0);
      setAppliedCouponId(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

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
      <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-10">Your Shopping Bag</h1>
        
        {validCart.length === 0 ? (
          <EmptyState 
            icon={FaTrash}
            title="Your bag is empty"
            description="Looks like you haven't added anything to your cart yet. Discover our premium collection and find your next favorite product."
            actionText="Continue Shopping"
            actionLink="/products"
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Cart Items */}
            <div className="w-full lg:w-2/3 space-y-6">
              {validCart.map((item) => (
                <div key={item.product._id} className="flex gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-brand-100 dark:border-gray-700 transition-colors duration-300">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                    <SmartImage src={item.product.image?.url || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400'} alt={item.product.title} className="w-full h-full" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-brand-500 dark:text-brand-400 uppercase tracking-widest mb-1">{item.product.brand || 'GlowSpark'}</p>
                        <h3 className="font-medium text-gray-900 dark:text-white text-lg sm:text-xl line-clamp-1">{item.product.title}</h3>
                      </div>
                      <button onClick={() => handleRemove(item.product._id)} className="text-gray-400 dark:text-gray-500 hover:text-red-500 p-2 transition-colors">
                        <FaTrash />
                      </button>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-gray-600 dark:text-gray-400">Qty: {item.quantity}</div>
                      <div className="font-serif font-bold text-xl text-brand-800">&#8377; {((item.product.price || 0) * item.quantity).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-brand-100 dark:border-gray-700 sticky top-32 transition-colors duration-300">
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6 border-b border-brand-100 dark:border-gray-700 pb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-6 text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>&#8377; {totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-500 font-medium">
                      <span>Discount (Coupon)</span>
                      <span>- &#8377; {discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>

                {/* Promo Code Input Removed as per user request */}
                
                <div className="border-t border-brand-100 dark:border-gray-700 pt-6 mb-8 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold font-serif text-brand-800">&#8377; {finalTotal.toLocaleString("en-IN")}</span>
                </div>
                
                {/* We can pass coupon data to Checkout page via state */}
                <Link to="/checkout" state={{ appliedCouponId, discountAmount, finalTotal }} className="block w-full text-center bg-brand-900 hover:bg-black text-white py-4 rounded-xl font-medium transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
