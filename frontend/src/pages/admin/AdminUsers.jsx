import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import ConfirmModal from '../../components/ConfirmModal';
import { FaSearch } from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (err) {
        toast.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const confirmToggleBlock = (userId) => {
    setUserToToggle(users.find(u => u._id === userId));
    setIsConfirmModalOpen(true);
  };

  const handleToggleBlock = async () => {
    if (!userToToggle) return;
    try {
      const res = await api.put(`/admin/users/${userToToggle._id}/toggle-block`);
      if (res.data.success) {
        setUsers(users.map(u => u._id === userToToggle._id ? res.data.user : u));
        toast.success(`User status updated`);
      }
    } catch (err) {
      toast.error('Failed to update user status');
    } finally {
      setUserToToggle(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="h-9 bg-gray-200 dark:bg-gray-700 w-1/4 rounded-lg mb-4"></div>
        
        {/* Search Bar Skeleton */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-md h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-brand-50 dark:bg-gray-700 h-14 border-b border-brand-100 dark:border-gray-600"></div>
          <div className="divide-y divide-brand-100 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="p-5 flex justify-between items-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-24 rounded-md"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-48 rounded-md"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-16 rounded-md"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 w-20 rounded-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-16 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4">User Management</h1>
      
      {/* Center Search Bar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search users by email, name, role..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all"
          />
          <FaSearch className="absolute left-3.5 top-4 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-brand-50 dark:bg-gray-700 border-b border-brand-100 dark:border-gray-600">
            <tr>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">User ID</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Email</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Role</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Status</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100 dark:divide-gray-700">
            {filteredUsers.map(user => (
              <tr 
                key={user._id} 
                onClick={() => navigate(`/admin/users/${user._id}`)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="p-4 text-sm text-gray-800">#{user._id.substring(user._id.length - 8).toUpperCase()}</td>
                <td className="p-4 text-sm text-gray-800">{user.email}</td>
                <td className="p-4 text-sm text-gray-800">{user.role}</td>
                <td className="p-4">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="p-4 space-x-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); confirmToggleBlock(user._id); }}
                    className={`${user.isBlocked ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'} font-medium text-sm`}
                  >
                    {user.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleToggleBlock}
        title={userToToggle?.isBlocked ? "Unblock User" : "Block User"}
        message={userToToggle?.isBlocked ? `Are you sure you want to unblock ${userToToggle?.email}? They will regain access to their account.` : `Are you sure you want to block ${userToToggle?.email}? They will lose access to their account.`}
        confirmText={userToToggle?.isBlocked ? "Unblock" : "Block"}
        cancelText="Cancel"
        isDestructive={!userToToggle?.isBlocked}
      />
    </div>
  );
};

export default AdminUsers;
