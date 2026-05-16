import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaMoon, FaSun, FaHeart } from 'react-icons/fa';
import { logout } from '../store/userSlice';
import api from '../api/axios';

const Navbar = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { totalQuantity } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Theme Toggle State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="font-serif text-3xl font-bold tracking-tight text-brand-900 dark:text-brand-100">
            Glow<span className="text-brand-500">Spark</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <div className="group py-6">
              <Link to="/products" className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">Shop</Link>
              
              {/* Mega Menu Dropdown */}
              <div className="absolute left-0 top-[100%] w-full bg-white dark:bg-gray-900 border-t border-brand-100 dark:border-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                  <div className="grid grid-cols-4 gap-8">
                    <div>
                      <h3 className="text-brand-900 dark:text-white font-serif font-bold text-lg mb-4">Categories</h3>
                      <ul className="space-y-3">
                        <li><Link to="/products?category=Skincare" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">Premium Skincare</Link></li>
                        <li><Link to="/products?category=Makeup" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">Cosmetics & Makeup</Link></li>
                        <li><Link to="/products?category=Haircare" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">Luxury Haircare</Link></li>
                        <li><Link to="/products?category=Fragrance" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">Signature Fragrances</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-brand-900 dark:text-white font-serif font-bold text-lg mb-4">Featured Brands</h3>
                      <ul className="space-y-3">
                        <li><span className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer">Lumière</span></li>
                        <li><span className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer">Aura Botanicals</span></li>
                        <li><span className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer">Velvet Touch</span></li>
                      </ul>
                    </div>
                    <div className="col-span-2">
                      <div className="bg-brand-50 dark:bg-gray-800 rounded-2xl p-6 flex items-center justify-between h-full border border-brand-100 dark:border-gray-700">
                        <div>
                          <h3 className="text-2xl font-serif font-bold text-brand-900 dark:text-white mb-2">New Arrivals</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">Discover the latest additions to our premium collection.</p>
                          <Link to="/products?sort=new" className="inline-block border-b-2 border-brand-900 dark:border-white text-brand-900 dark:text-white font-bold pb-1 hover:text-brand-600 transition-colors">Shop Now</Link>
                        </div>
                        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-inner">
                          <img src="https://images.unsplash.com/photo-1596462502278-27bf85033e5a?auto=format&fit=crop&w=400&q=80" alt="New Arrival" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Link to="/products?sort=bestseller" className="py-6 text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">Bestsellers</Link>
            <Link to="/about" className="py-6 text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">About Us</Link>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={toggleTheme} 
              className="text-gray-600 dark:text-gray-300 hover:text-brand-900 dark:hover:text-white transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            </button>

            <Link to="/wishlist" className="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 relative transition-colors">
              <FaHeart className="text-2xl" />
              {currentUser?.wishlist?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {currentUser.wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 relative transition-colors">
              <FaShoppingCart className="text-2xl" />
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalQuantity}
                </span>
              )}
            </Link>
            
            {currentUser ? (
              <div className="group relative">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-brand-600">
                  {currentUser.profilePhoto?.url ? (
                    <img src={currentUser.profilePhoto.url} alt="Profile" className="h-8 w-8 rounded-full object-cover border border-brand-200" />
                  ) : (
                    <img src={`https://ui-avatars.com/api/?name=${currentUser.email?.charAt(0).toUpperCase()}&background=473129&color=fff`} alt="Default Avatar" className="h-8 w-8 rounded-full border border-brand-200" />
                  )}
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentUser.username || currentUser.email}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors">My Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors">My Orders</Link>
                  <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors">My Wishlist</Link>
                  
                  {currentUser.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors">Admin Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors">
                    <FaSignOutAlt className="mr-2" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 bg-brand-900 dark:bg-brand-100 text-white dark:text-brand-900 px-5 py-2 rounded-full hover:bg-black dark:hover:bg-white transition-colors font-medium">
                <FaUser /> <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
