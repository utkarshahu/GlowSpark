import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaTachometerAlt, FaBoxOpen, FaUsers, FaShoppingCart, FaSignOutAlt, FaStore, FaTag, FaUndo, FaChartBar, FaArrowLeft } from 'react-icons/fa';
import { logout, setMode } from '../store/userSlice';
import api from '../api/axios';

const AdminLayout = () => {
  const { currentUser, currentMode } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Strict role and active mode protection
  if (!currentUser || currentUser.role !== 'admin' || currentMode !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-50 dark:bg-gray-950 p-6 text-center space-y-4">
        <h2 className="text-2xl font-serif font-black text-brand-900 dark:text-white">Access Denied</h2>
        <p className="text-sm text-gray-500 max-w-sm">Admin mode is not active or you do not have permission to view this panel.</p>
        <button 
          onClick={() => {
            dispatch(setMode('user'));
            navigate('/');
          }} 
          className="px-5 py-2.5 bg-brand-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-md"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('sessionId');
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <FaTachometerAlt /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <FaChartBar /> },
    { name: 'Products', path: '/admin/products', icon: <FaBoxOpen /> },
    { name: 'Orders', path: '/admin/orders', icon: <FaShoppingCart /> },
    { name: 'Returns', path: '/admin/returns', icon: <FaUndo /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <FaTag /> },
    { name: 'Users', path: '/admin/users', icon: <FaUsers /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-brand-50 dark:bg-gray-950 font-sans transition-colors duration-300">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:flex w-64 bg-white dark:bg-gray-900 border-r border-brand-100 dark:border-gray-800 flex-col justify-between shadow-sm sticky top-0 h-screen transition-colors duration-300 shrink-0">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-brand-100 dark:border-gray-800">
            <h1 className="text-2xl font-serif font-bold text-brand-900 dark:text-white tracking-tight">
              Glow<span className="text-brand-500">Admin</span>
            </h1>
          </div>
          <nav className="p-4 space-y-2 mt-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive 
                      ? 'bg-brand-900 dark:bg-brand-600 text-white shadow-md' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-gray-800 hover:text-brand-900 dark:hover:text-white'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-brand-100 dark:border-gray-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Mobile Sticky Header & Horizontally Scrollable Ribbon */}
      <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-brand-100 dark:border-gray-800 transition-colors duration-300">
        {/* Mobile Title Bar */}
        <div className="h-16 flex items-center justify-between px-4">
          <h1 className="text-xl font-serif font-bold text-brand-900 dark:text-white tracking-tight">
            Glow<span className="text-brand-500">Admin</span>
          </h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleLogout}
              title="Logout"
              className="p-2.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-xl text-sm hover:bg-red-100 transition-colors"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>

        {/* Horizontally Scrollable Menu Ribbon */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 pb-3">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                  isActive 
                    ? 'bg-brand-900 dark:bg-brand-600 text-white' 
                    : 'bg-gray-150 dark:bg-gray-800 text-gray-650 dark:text-gray-300 border border-transparent'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#Fdf8f6] dark:bg-gray-950 transition-colors duration-300 min-w-0">
        <div className="p-4 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
