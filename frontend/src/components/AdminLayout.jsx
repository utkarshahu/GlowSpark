import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaTachometerAlt, FaBoxOpen, FaUsers, FaShoppingCart, FaSignOutAlt, FaStore, FaTag, FaUndo, FaChartBar } from 'react-icons/fa';
import { logout } from '../store/userSlice';
import api from '../api/axios';

const AdminLayout = () => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Basic role protection (should also be enforced by backend)
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50 text-brand-900 font-serif text-2xl">
        Access Denied. Admins Only.
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
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
    <div className="flex min-h-screen bg-brand-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-brand-100 flex flex-col justify-between shadow-sm sticky top-0 h-screen">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-brand-100">
            <h1 className="text-2xl font-serif font-bold text-brand-900 tracking-tight">
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
                      ? 'bg-brand-900 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-brand-100 hover:text-brand-900'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-brand-100">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors mb-2"
          >
            <FaStore /> View Store
          </NavLink>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#Fdf8f6]">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
