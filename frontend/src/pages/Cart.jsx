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
  const [selectedItems, setSelectedItems] = useState(new Set());
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        if (res.data.success) {
          setCart(res.data.cart);
          dispatch(setReduxCart(res.data.cart));
          
          // Auto-select all items by default on load
          const activeItems = res.data.cart.filter(item => item && item.product);
          setSelectedItems(new Set(activeItems.map(item => item.product._id)));
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

  const toggleSelectItem = (productId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    const validItems = cart.filter(item => item && item.product);
    if (selectedItems.size === validItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(validItems.map(item => item.product._id)));
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const res = await api.post('/cart/update', { productId, quantity: newQuantity });
      if (res.data.success) {
        setCart(res.data.cart);
        dispatch(setReduxCart(res.data.cart));
      }
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

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
  const selectedCartItems = validCart.filter(item => selectedItems.has(item.product._id));
  const totalAmount = selectedCartItems.reduce((total, item) => total + ((item.product.price || 0) * item.quantity), 0);
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
      <div className="bg-brand-50 dark:bg-gray-900 min-h-screen pb-20 transition-colors duration-300">
        <div className="fixed w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 h-20"></div>
        <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 w-1/4 rounded-lg mb-10"></div>
          
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="w-full lg:w-2/3 space-y-6">
              <div className="h-14 bg-white dark:bg-gray-800 p-4 rounded-xl border border-brand-100 dark:border-gray-700 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-32 rounded"></div>
              </div>

              {[1, 2].map((n) => (
                <div key={n} className="flex gap-4 sm:gap-6 items-center bg-white dark:bg-gray-800 p-6 rounded-2xl border border-brand-100 dark:border-gray-700">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0"></div>
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 w-1/6 rounded"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 w-2/3 rounded"></div>
                    <div className="flex justify-between items-center pt-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 w-12 rounded"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 w-24 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-1/3">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-brand-100 dark:border-gray-700 space-y-6">
                <div className="h-7 bg-gray-200 dark:bg-gray-700 w-1/2 rounded-md pb-4 border-b border-brand-100 dark:border-gray-700"></div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 w-16 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 w-20 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-50 dark:bg-gray-900 min-h-screen pb-28 transition-colors duration-300">
      <Navbar />
      <div className="pt-32 max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Premium Shopping Bag Header */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/products" className="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm text-gray-800 dark:text-gray-200 hover:bg-brand-50/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">Shopping Bag</h1>
          <div className="relative p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm text-gray-850 dark:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {validCart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">{validCart.length}</span>
            )}
          </div>
        </div>

        {validCart.length === 0 ? (
          <EmptyState 
            icon={FaTrash}
            title="Your bag is empty"
            description="Looks like you haven't added anything to your cart yet. Discover our premium collection and find your next favorite product."
            actionText="Continue Shopping"
            actionLink="/products"
          />
        ) : (
          <div className="space-y-6">
            
            {/* Select All Row */}
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 px-5 py-3.5 rounded-2xl shadow-sm border border-brand-100/60 dark:border-gray-700">
              <button 
                onClick={toggleSelectAll} 
                className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-gray-300 hover:text-brand-900 transition-colors"
              >
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  selectedItems.size === validCart.length 
                    ? "bg-black border-black text-white" 
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {selectedItems.size === validCart.length && (
                    <svg className="w-3 h-3 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </span>
                <span>Select All ({selectedItems.size} / {validCart.length})</span>
              </button>
            </div>

            {/* Shopping Bag Items list */}
            <div className="space-y-4">
              {validCart.map((item) => (
                <div key={item.product._id} className="relative flex gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-brand-100/40 dark:border-gray-700/80 transition-all">
                  
                  {/* Select Item Checkbox */}
                  <button 
                    onClick={() => toggleSelectItem(item.product._id)} 
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      selectedItems.has(item.product._id) 
                        ? "bg-black border-black text-white" 
                        : "border-gray-300 dark:border-gray-600 hover:border-black"
                    }`}
                  >
                    {selectedItems.has(item.product._id) && (
                      <svg className="w-3 h-3 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>

                  {/* Product Rounded Thumbnail */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shrink-0">
                    <SmartImage 
                      src={
                        (item.product.images && item.product.images[item.product.thumbnailIndex || 0]?.url) || 
                        (item.product.images && item.product.images[0]?.url) || 
                        (item.product.image?.url || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400')
                      } 
                      alt={item.product.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  {/* Item Description and Controls */}
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest truncate">{item.product.brand || 'GlowSpark'}</p>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 leading-snug">{item.product.title}</h3>
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="font-serif font-extrabold text-brand-900 dark:text-brand-400 text-sm">&#8377; {item.product.price.toLocaleString("en-IN")}</div>
                      
                      {/* Premium Minus/Plus Quantity Controls */}
                      <div className="flex items-center bg-gray-50 dark:bg-gray-900 border border-brand-100/60 dark:border-gray-800 rounded-full px-2.5 py-1 gap-3">
                        <button 
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                          className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white font-bold text-xs"
                        >
                          —
                        </button>
                        <span className="text-xs font-bold font-mono text-gray-800 dark:text-white">
                          {String(item.quantity).padStart(2, '0')}
                        </span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                          className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white font-bold text-xs"
                        >
                          ＋
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button (Top Right Close Icon) */}
                  <button 
                    onClick={() => handleRemove(item.product._id)} 
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                </div>
              ))}
            </div>

            {/* Promo Code Apply Section (Image 3 exact design) */}
            <div className="flex gap-2 items-center bg-white dark:bg-gray-800 p-2.5 rounded-2xl border border-brand-100/60 dark:border-gray-700 shadow-sm mt-6">
              <input 
                type="text" 
                placeholder="Promo Code" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 pl-4 py-2 text-xs bg-transparent dark:text-white outline-none placeholder-gray-400 focus:outline-none"
              />
              <button 
                onClick={applyCoupon}
                disabled={isApplyingCoupon}
                className="px-5 py-2.5 bg-black hover:bg-brand-900 text-white font-bold text-xs rounded-xl tracking-wider transition-all disabled:opacity-50"
              >
                {isApplyingCoupon ? '...' : 'Apply'}
              </button>
            </div>

            {/* Subtotals & Final Summary Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-brand-100/60 dark:border-gray-700 shadow-sm space-y-3.5 mt-6">
              <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="text-gray-800 dark:text-gray-200">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-xs font-bold text-green-600">
                  <span>Discount</span>
                  <span>- ₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400">
                <span>Shipping</span>
                <span className="text-gray-800 dark:text-gray-200">₹0.00</span>
              </div>
              <div className="border-t border-gray-150 dark:border-gray-750 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900 dark:text-white">Bag Total</span>
                <span className="text-lg font-bold text-brand-900 dark:text-brand-400">₹{finalTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <div className="pt-4">
              <Link 
                to={selectedCartItems.length > 0 ? "/checkout" : "#"} 
                state={{ checkoutItems: selectedCartItems, appliedCouponId, discountAmount, finalTotal }} 
                onClick={(e) => {
                  if (selectedCartItems.length === 0) {
                    e.preventDefault();
                    toast.error("Please select at least one item to proceed to checkout", { theme: "dark" });
                  }
                }}
                className={`block w-full text-center py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-xl hover:shadow-2xl ${
                  selectedCartItems.length > 0 
                    ? "bg-black hover:bg-brand-900 text-white hover:-translate-y-1" 
                    : "bg-gray-300 dark:bg-gray-700 text-gray-505 cursor-not-allowed"
                }`}
              >
                Proceed to Checkout
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
