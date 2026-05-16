import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaHeartBroken } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      await api.delete(`/users/wishlist/${productId}`);
      setWishlistItems(wishlistItems.filter(item => item._id !== productId));
      toast.info("Removed from wishlist", { theme: "dark" });
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const moveToCart = async (product) => {
    try {
      await api.post('/cart/add', { productId: product._id });
      // Optionally remove from wishlist after moving
      await api.delete(`/users/wishlist/${product._id}`);
      setWishlistItems(wishlistItems.filter(item => item._id !== product._id));
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
          <div className="flex justify-center items-center h-64">
             <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-16 text-center shadow-sm border border-brand-100 dark:border-gray-700 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-brand-50 dark:bg-gray-700 text-brand-300 dark:text-gray-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              <FaHeartBroken />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-4">Your wishlist is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Save items you love here to easily find them later or move them to your bag.</p>
            <Link to="/products" className="inline-block bg-brand-900 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div key={product._id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-100 dark:border-gray-700 flex flex-col group">
                <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
                  <img src={product.image.url} alt={product.title} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" />
                  <button 
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 rounded-full text-red-500 hover:text-red-700 transition-colors shadow-sm"
                    title="Remove"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-1">{product.brand}</p>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-1">{product.title}</h3>
                  <p className="font-serif font-bold text-gray-900 dark:text-white mb-4">&#8377; {product.price.toLocaleString("en-IN")}</p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button 
                      onClick={() => moveToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-brand-50 dark:bg-gray-700 text-brand-900 dark:text-white font-medium rounded-xl hover:bg-brand-900 hover:text-white dark:hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaShoppingCart />
                      {product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
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
