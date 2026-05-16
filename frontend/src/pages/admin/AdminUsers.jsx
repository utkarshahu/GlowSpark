import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleToggleBlock = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/block`);
      if (res.data.success) {
        setUsers(users.map(u => u._id === userId ? res.data.user : u));
        toast.success(`User status updated`);
      }
    } catch (err) {
      toast.error('Failed to update user status');
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
              <tr key={user._id}>
                <td className="p-4 text-sm text-gray-800">#{user._id.substring(user._id.length - 8).toUpperCase()}</td>
                <td className="p-4 text-sm text-gray-800">{user.email}</td>
                <td className="p-4 text-sm text-gray-800">{user.role}</td>
                <td className="p-4">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isVerified ? 'Active' : 'Blocked'}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => handleToggleBlock(user._id)}
                    className={`${user.isVerified ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} font-medium text-sm`}
                  >
                    {user.isVerified ? 'Block User' : 'Unblock User'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
