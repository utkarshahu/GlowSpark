import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShoppingBag } from 'react-icons/fa';

const AdminUserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      toast.error("Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle-block`);
      if (res.data.success) {
        setUser({ ...user, isBlocked: !user.isBlocked });
        toast.success(`User ${!user.isBlocked ? 'blocked' : 'unblocked'} successfully`);
      }
    } catch (err) {
      toast.error("Failed to change user status");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse max-w-4xl mx-auto pb-12">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 w-48 rounded-lg"></div>
          </div>
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>

        {/* Profile Details Card Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-start gap-8 mb-8 border-b border-gray-100 dark:border-gray-700 pb-8">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0"></div>
            <div className="space-y-3 flex-1">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 w-1/3 rounded-md"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/4 rounded-md"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 w-1/4 rounded-md"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 w-3/4 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!user) return <div className="p-8 text-red-500">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/users" className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">User Profile</h1>
          </div>
        </div>
        <button 
          onClick={handleToggleBlock}
          className={`px-6 py-2 rounded-xl font-bold text-sm ${user.isBlocked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'} transition-colors`}
        >
          {user.isBlocked ? 'Unblock User' : 'Block User'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-start gap-8 mb-8 border-b border-gray-100 dark:border-gray-700 pb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-4 border-brand-50 dark:border-gray-700">
            {user.profilePhoto?.url ? (
               <img src={user.profilePhoto.url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <img src={`https://ui-avatars.com/api/?name=${(user.username || user.email || 'U').charAt(0)}&background=473129&color=fff`} alt="Default Avatar" className="w-full h-full" />
            )}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user.username || 'Anonymous'}</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{user.role.toUpperCase()}</p>
            <div className="mt-4 flex gap-3">
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                 {user.isBlocked ? 'Blocked' : 'Active'}
               </span>
               <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold">
                 Joined: {new Date(user.createdAt).toLocaleDateString()}
               </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contact Info</h3>
            
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
               <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                 <FaEnvelope />
               </div>
               <div>
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Address</p>
                 <p className="font-medium">{user.email}</p>
               </div>
            </div>

            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
               <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                 <FaPhone />
               </div>
               <div>
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Phone Number</p>
                 <p className="font-medium">{user.phoneNumber || 'Not provided'}</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
               <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                 <FaShoppingBag />
               </div>
               <div>
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Cart Items</p>
                 <p className="font-medium">{user.cart?.length || 0} items</p>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Addresses</h3>
            {user.addresses && user.addresses.length > 0 ? (
               user.addresses.map((addr, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                     <FaMapMarkerAlt className="text-gray-400 mt-1" />
                     <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        <p className="font-bold text-gray-900 dark:text-white mb-1">{addr.street}</p>
                        <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                        <p>{addr.country}</p>
                     </div>
                  </div>
               ))
            ) : (
               <p className="text-gray-500 dark:text-gray-400 italic">No addresses added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
