import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import ConfirmModal from '../../components/ConfirmModal';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">User Management</h1>
      <div className="bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-brand-50 border-b border-brand-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">User ID</th>
              <th className="p-4 font-medium text-gray-600">Email</th>
              <th className="p-4 font-medium text-gray-600">Role</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {users.map(user => (
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
