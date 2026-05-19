import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaHeartBroken } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useDispatch } from 'react-redux';
import { updateWishlist } from '../store/userSlice';
import { setCart } from '../store/cartSlice';
import EmptyState from '../components/EmptyState';
import SmartImage from '../components/SmartImage';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        // We need to fetch the populated wishlist products
        // Since /auth/me might only have ObjectIds, let's fetch full products
        const productsRes = await api.get('/products');
        if (productsRes.data.success) {
          const allProducts = productsRes.data.products;
          const populatedWishlist = allProducts.filter(p => res.data.user.wishlist.includes(p._id));
          setWishlistItems(populatedWishlist);
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await api.delete(`/users/wishlist/${productId}`);
      setWishlistItems(wishlistItems.filter(item => item._id !== productId));
      if (res.data.success) {
         dispatch(updateWishlist(res.data.wishlist));
      }
      toast.info("Removed from wishlist", { theme: "dark" });
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const moveToCart = async (product) => {
    try {
      const cartRes = await api.post('/cart/add', { productId: product._id });
      if (cartRes.data.success) {
          dispatch(setCart(cartRes.data.cart));
      }
      // Optionally remove from wishlist after moving
      const wishRes = await api.delete(`/users/wishlist/${product._id}`);
      setWishlistItems(wishlistItems.filter(item => item._id !== product._id));
      if (wishRes.data.success) {
          dispatch(updateWishlist(wishRes.data.wishlist));
      }
      toast.success(`${product.title} moved to cart`, { theme: "dark" });
    } catch (err) {
      toast.error("Failed to move to cart");
    }
  };

  return (
    <div className="bg-brand-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <Navbar />
      <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-8 text-center">Your Wishlist</h1>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-brand-100 dark:border-gray-700 p-5 flex flex-col space-y-4">
                {/* Image Aspect Square Skeleton */}
                <div className="relative aspect-square rounded-xl bg-gray-100 dark:bg-gray-700/40 animate-pulse shadow-inner"></div>
                {/* Brand */}
                <div className="h-3 w-16 bg-brand-100/70 dark:bg-brand-900/30 rounded-full animate-pulse"></div>
                {/* Title */}
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700/60 rounded-full animate-pulse"></div>
                {/* Price */}
                <div className="h-5 w-1/3 bg-gray-250 dark:bg-gray-700/40 rounded-full animate-pulse"></div>
                {/* Action button */}
                <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mt-auto"></div>
              </div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <EmptyState 
            icon={FaHeartBroken}
            title="Your wishlist is empty"
            description="Save items you love here to easily find them later or move them to your bag."
            actionText="Continue Shopping"
            actionLink="/products"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {wishlistItems.map((product) => (
              <div key={product._id} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-100/55 dark:border-gray-700 flex flex-col group relative">
                
                {/* Product Image Frame */}
                <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900 p-3 sm:p-4">
                  <SmartImage 
                    src={
                      (product.images && product.images[product.thumbnailIndex || 0]?.url) || 
                      (product.images && product.images[0]?.url) || 
                      (product.image?.url || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400')
                    } 
                    alt={product.title} 
                    className="w-full h-full rounded-2xl group-hover:scale-105 transition-transform duration-500 object-cover" 
                  />
                  
                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-4 right-4 bg-white/95 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full text-red-500 hover:text-red-750 transition-colors shadow-sm z-10"
                    title="Remove"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>

                {/* Details Content */}
                <div className="p-3 sm:p-5 flex flex-col flex-grow">
                  <p className="text-[9px] sm:text-xs font-bold text-brand-500 uppercase tracking-widest mb-1 truncate">{product.brand}</p>
                  <h3 className="font-serif font-bold text-gray-900 dark:text-white mb-2 text-xs sm:text-sm line-clamp-1 group-hover:text-brand-900 transition-colors">{product.title}</h3>
                  <p className="font-serif font-extrabold text-brand-950 dark:text-brand-400 text-xs sm:text-lg mb-4">₹{product.price.toLocaleString("en-IN")}</p>
                  
                  {/* Move to Cart Pill Button */}
                  <div className="mt-auto">
                    <button 
                      onClick={() => moveToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-black text-white hover:bg-brand-900 font-bold text-[10px] sm:text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <FaShoppingCart size={11} />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
