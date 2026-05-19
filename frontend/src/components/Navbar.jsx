import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaMoon, FaSun, FaHeart, FaBars, FaTimes, FaChevronDown, FaUserShield, FaUserCog, FaChartLine, FaClipboardList } from 'react-icons/fa';
import { logout, setMode, incrementUnreadOrders, clearUnreadOrders } from '../store/userSlice';
import { socket } from '../api/socket';
import { toast } from 'react-toastify';
import api from '../api/axios';
import logo from '../assets/glow_spark_logo.png';

const Navbar = () => {
  const { currentUser, currentMode, unreadOrdersCount } = useSelector((state) => state.user || {});
  const { totalQuantity } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Theme Toggle State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Real-Time Socket Orders Listener for Admins
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      const handleNewOrder = (order) => {
        // Trigger real-time beautiful notification
        toast.info(
          <div className="flex flex-col gap-1.5 p-1 text-left">
            <span className="font-extrabold text-[10px] uppercase tracking-widest text-amber-500 flex items-center gap-1">
              🔔 Real-Time Order Alert!
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              New order placed by <span className="text-amber-600 dark:text-amber-400 font-extrabold">{order.user?.username || 'Customer'}</span>!
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              Total Amount: ₹{order.totalAmount?.toLocaleString("en-IN")}
            </span>
          </div>,
          {
            position: "top-right",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: isDarkMode ? "dark" : "light"
          }
        );
        
        // Dispatch to increment count
        dispatch(incrementUnreadOrders());
      };

      socket.on('newOrderPlaced', handleNewOrder);

      return () => {
        socket.off('newOrderPlaced', handleNewOrder);
      };
    }
  }, [currentUser, isDarkMode, dispatch]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('sessionId');
      dispatch(logout());
      setIsMobileMenuOpen(false);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Navbar Container */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center group transition-transform hover:scale-[1.02] z-50">
              <img 
                src={logo} 
                alt="GlowSpark Logo" 
                className="h-14 sm:h-18 md:h-22 w-auto object-contain transition-all duration-300"
              />
            </Link>
            
            {/* Desktop Nav Links */}
            <div className="hidden md:flex space-x-8">
              <div className="group py-6">
                <Link to="/products" className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">Shop</Link>
                
                {/* Mega Menu Dropdown */}
                <div className="absolute left-0 top-[100%] w-full bg-white dark:bg-gray-900 border-t border-brand-100 dark:border-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-4 gap-8">
                      <div>
                        <h3 className="text-brand-900 dark:text-white font-serif font-bold text-lg mb-4">Categories</h3>
                        <ul className="space-y-3 text-sm">
                          <li><Link to="/products?category=Skincare" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">Premium Skincare</Link></li>
                          <li><Link to="/products?category=Makeup" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">Cosmetics & Makeup</Link></li>
                          <li><Link to="/products?category=Haircare" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">Luxury Haircare</Link></li>
                          <li><Link to="/products?category=Fragrance" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">Signature Fragrances</Link></li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-brand-900 dark:text-white font-serif font-bold text-lg mb-4">Featured Brands</h3>
                        <ul className="space-y-3 text-sm">
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
                            <img 
                              src="https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=400&q=80" 
                              alt="New Arrival" 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=400&q=80";
                              }}
                            />
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

            {/* Icons Bar */}
            <div className="flex items-center space-x-3 sm:space-x-6">
               {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                className={`${currentMode === 'admin' ? 'text-black dark:text-white hover:text-amber-500' : 'text-gray-600 dark:text-gray-300 hover:text-brand-900 dark:hover:text-white'} transition-colors p-2`}
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <FaSun className="text-lg sm:text-xl" /> : <FaMoon className="text-lg sm:text-xl" />}
              </button>

              {/* Conditional Icons based on Mode */}
              {currentMode === 'admin' ? (
                <>
                  {/* Dashboard Icon option */}
                  <Link 
                    to="/admin" 
                    title="Dashboard" 
                    className="text-black dark:text-white hover:text-amber-500 relative transition-colors p-2 flex items-center"
                  >
                    <FaChartLine className="text-lg sm:text-xl" />
                  </Link>

                  {/* Orders Icon option with real-time notification badge */}
                  <Link 
                    to="/admin/orders" 
                    title="Manage Orders" 
                    onClick={() => dispatch(clearUnreadOrders())}
                    className="text-black dark:text-white hover:text-amber-500 relative transition-colors p-2 flex items-center"
                  >
                    <FaClipboardList className="text-lg sm:text-xl" />
                    {unreadOrdersCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold animate-bounce shadow-md">
                        {unreadOrdersCount}
                      </span>
                    )}
                  </Link>
                </>
              ) : (
                <>
                  {/* Wishlist */}
                  <Link to="/wishlist" className="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 relative transition-colors p-2 flex items-center">
                    <FaHeart className="text-lg sm:text-xl" />
                    {currentUser?.wishlist?.length > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                        {currentUser.wishlist.length}
                      </span>
                    )}
                  </Link>

                  {/* Cart */}
                  <Link to="/cart" className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 relative transition-colors p-2 flex items-center">
                    <FaShoppingCart className="text-lg sm:text-xl" />
                    {totalQuantity > 0 && (
                      <span className="absolute top-0 right-0 bg-brand-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                        {totalQuantity}
                      </span>
                    )}
                  </Link>
                </>
              )}
              
              {/* Desktop Mode Switcher */}
              {currentUser && currentUser.role === 'admin' && (
                <button
                  onClick={() => {
                    const nextMode = currentMode === 'admin' ? 'user' : 'admin';
                    dispatch(setMode(nextMode));
                    if (nextMode === 'admin') {
                      navigate('/admin');
                    } else {
                      navigate('/');
                    }
                  }}
                  className={`hidden md:inline-block px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-sm border ${
                    currentMode === 'admin'
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-900/50 hover:bg-amber-250'
                      : 'bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 border-brand-300 dark:border-brand-900/50 hover:bg-brand-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5 justify-center">
                    {currentMode === 'admin' ? <FaUserCog className="text-xs" /> : <FaUserShield className="text-xs" />}
                    <span>{currentMode === 'admin' ? 'Admin Mode' : 'User Mode'}</span>
                  </span>
                </button>
              )}
              
              {/* Desktop User Menu */}
              <div className="hidden md:block">
                {currentUser ? (
                  <div className="group relative">
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-brand-600 focus:outline-none">
                      {currentUser.profilePhoto?.url ? (
                        <img 
                          src={currentUser.profilePhoto.url} 
                          alt="Profile" 
                          className="h-8 w-8 rounded-full object-cover border border-brand-200" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${currentUser.email?.charAt(0).toUpperCase()}&background=473129&color=fff`;
                          }}
                        />
                      ) : (
                        <img src={`https://ui-avatars.com/api/?name=${currentUser.email?.charAt(0).toUpperCase()}&background=473129&color=fff`} alt="Default Avatar" className="h-8 w-8 rounded-full border border-brand-200" />
                      )}
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{currentUser.username || currentUser.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors">My Profile</Link>
                      <Link to="/orders" className="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors">My Orders</Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors">My Wishlist</Link>
                      
                      {currentUser.role === 'admin' && (
                        <Link to="/admin" className="block px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors">Admin Dashboard</Link>
                      )}
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors">
                        <FaSignOutAlt className="mr-2" /> Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link to="/login" className="flex items-center space-x-2 bg-brand-900 dark:bg-brand-100 text-white dark:text-brand-900 px-5 py-2 rounded-full hover:bg-black dark:hover:bg-white transition-colors text-xs font-semibold uppercase tracking-wider">
                    <FaUser /> <span>Sign In</span>
                  </Link>
                )}
              </div>

              {/* Mobile Hamburger Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className={`md:hidden ${currentMode === 'admin' ? 'text-black dark:text-white hover:text-amber-500' : 'text-gray-600 dark:text-gray-300 hover:text-brand-900 dark:hover:text-white'} transition-colors p-2 z-50 focus:outline-none`}
                aria-label="Toggle Mobile Menu"
              >
                {isMobileMenuOpen ? <FaTimes className="text-xl sm:text-2xl animate-spin-once" /> : <FaBars className="text-xl sm:text-2xl" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation Menu (Rendered OUTSIDE <nav> to prevent backdrop clipping) */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Slide-out Menu Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-gray-900 border-l border-gray-150 dark:border-gray-800 z-50 shadow-2xl p-6 flex flex-col md:hidden transition-transform duration-300 ease-out overflow-y-auto">
            {/* Header / Brand */}
            <div className="flex justify-between items-center pb-6 border-b border-gray-150 dark:border-gray-800 mb-6">
              <img 
                src={logo} 
                alt="GlowSpark Logo" 
                className="h-12 w-auto object-contain"
              />
            </div>

            {/* Mobile Nav Options */}
            <div className="flex-grow space-y-6">
              {/* Shop Categories Accordion */}
              <div>
                <button 
                  onClick={() => setIsMobileShopOpen(!isMobileShopOpen)}
                  className="w-full flex justify-between items-center text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider py-2 focus:outline-none"
                >
                  <span>Shop Collection</span>
                  <FaChevronDown className={`text-[10px] text-brand-500 transition-transform duration-200 ${isMobileShopOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMobileShopOpen && (
                  <div className="mt-3 pl-4 space-y-3 border-l-2 border-brand-100 dark:border-brand-900/50">
                    <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 hover:text-brand-600">All Products</Link>
                    <Link to="/products?category=Skincare" onClick={() => setIsMobileMenuOpen(false)} className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 hover:text-brand-600">Premium Skincare</Link>
                    <Link to="/products?category=Makeup" onClick={() => setIsMobileMenuOpen(false)} className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 hover:text-brand-600">Cosmetics & Makeup</Link>
                    <Link to="/products?category=Haircare" onClick={() => setIsMobileMenuOpen(false)} className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 hover:text-brand-600">Luxury Haircare</Link>
                    <Link to="/products?category=Fragrance" onClick={() => setIsMobileMenuOpen(false)} className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 hover:text-brand-600">Signature Fragrances</Link>
                  </div>
                )}
              </div>

              {/* Bestsellers Link */}
              <Link 
                to="/products?sort=bestseller" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider py-2 border-b border-gray-50 dark:border-gray-800"
              >
                Bestsellers
              </Link>

              {/* About Us Link */}
              <Link 
                to="/about" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider py-2 border-b border-gray-50 dark:border-gray-800"
              >
                About Us
              </Link>
            </div>

            {/* Footer / User Details */}
            <div className="border-t border-gray-150 dark:border-gray-800 pt-6 mt-auto">
              {currentUser ? (
                <div className="space-y-4">
                  {/* Account Name */}
                  <div className="flex items-center gap-3">
                    {currentUser.profilePhoto?.url ? (
                      <img src={currentUser.profilePhoto.url} alt="Profile" className="h-10 w-10 rounded-full object-cover border border-brand-200" />
                    ) : (
                      <img src={`https://ui-avatars.com/api/?name=${currentUser.email?.charAt(0).toUpperCase()}&background=473129&color=fff`} alt="Default" className="h-10 w-10 rounded-full border border-brand-200" />
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{currentUser.username || 'Account Member'}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>

                  {/* Profile Links */}
                  <div className="grid grid-cols-2 gap-2 text-center pt-2">
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 bg-brand-50 dark:bg-gray-800 text-[10px] uppercase font-bold tracking-wider rounded-xl text-brand-900 dark:text-brand-350">My Profile</Link>
                    <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2 bg-brand-50 dark:bg-gray-800 text-[10px] uppercase font-bold tracking-wider rounded-xl text-brand-900 dark:text-brand-350">My Orders</Link>
                    <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="col-span-2 px-3 py-2 bg-brand-50 dark:bg-gray-800 text-[10px] uppercase font-bold tracking-wider rounded-xl text-brand-900 dark:text-brand-350">My Wishlist</Link>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          const nextMode = currentMode === 'admin' ? 'user' : 'admin';
                          dispatch(setMode(nextMode));
                          setIsMobileMenuOpen(false);
                          if (nextMode === 'admin') {
                            navigate('/admin');
                          } else {
                            navigate('/');
                          }
                        }}
                        className={`col-span-2 px-3 py-2 text-[10px] uppercase font-bold tracking-wider rounded-xl border transition-all ${
                          currentMode === 'admin'
                            ? 'bg-amber-500/10 text-amber-750 dark:text-amber-450 border-amber-500/20'
                            : 'bg-brand-500/10 text-brand-750 dark:text-brand-400 border-brand-500/20'
                        }`}
                      >
                        <span className="flex items-center gap-2 justify-center">
                          {currentMode === 'admin' ? <FaUserShield className="text-xs" /> : <FaUserCog className="text-xs" />}
                          <span>{currentMode === 'admin' ? 'Switch to User Mode' : 'Switch to Admin Mode'}</span>
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Logout Button */}
                  <button 
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-500 hover:bg-red-650 text-white rounded-xl text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-2"
                  >
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 bg-brand-900 dark:bg-brand-100 text-white dark:text-brand-900 rounded-xl text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-2"
                >
                  <FaUser /> Sign In
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
