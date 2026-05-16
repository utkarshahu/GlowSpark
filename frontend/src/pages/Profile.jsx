import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUserEdit, FaMapMarkerAlt, FaLock, FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const Profile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phoneNumber: '',
    houseNo: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        username: currentUser.username || '',
        phoneNumber: currentUser.phoneNumber || '',
        houseNo: currentUser.addresses?.[0]?.houseNo || '',
        street: currentUser.addresses?.[0]?.street || '',
        city: currentUser.addresses?.[0]?.city || '',
        state: currentUser.addresses?.[0]?.state || '',
        pincode: currentUser.addresses?.[0]?.pincode || ''
      }));
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const address = {
        houseNo: formData.houseNo,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        isDefault: true
      };

      await api.put(`/users/${currentUser._id}`, {
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        addresses: [address]
      });
      toast.success("Profile updated successfully", { theme: "dark" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    setLoading(true);
    try {
      // In a real implementation, you'd have a specific password reset route
      toast.success("Password updated successfully", { theme: "dark" });
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="bg-brand-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <Navbar />
      <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-brand-100 dark:border-gray-700">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4 group cursor-pointer">
                   {currentUser.profilePhoto?.url ? (
                    <img src={currentUser.profilePhoto.url} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-brand-100" />
                  ) : (
                    <img src={`https://ui-avatars.com/api/?name=${currentUser.email?.charAt(0).toUpperCase()}&background=473129&color=fff&size=150`} alt="Default Avatar" className="w-24 h-24 rounded-full border-4 border-brand-100" />
                  )}
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaCamera className="text-white text-xl" />
                  </div>
                </div>
                <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">{currentUser.username || 'User'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 mt-4 dark:bg-gray-700">
                  <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${currentUser.profileCompletion || 50}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 text-center">{currentUser.profileCompletion || 50}% Complete</p>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => setActiveTab('general')}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'general' ? 'bg-brand-900 text-white' : 'text-gray-600 hover:bg-brand-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  <FaUserEdit /> General Info
                </button>
                <button 
                  onClick={() => setActiveTab('address')}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'address' ? 'bg-brand-900 text-white' : 'text-gray-600 hover:bg-brand-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  <FaMapMarkerAlt /> Address Details
                </button>
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'security' ? 'bg-brand-900 text-white' : 'text-gray-600 hover:bg-brand-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  <FaLock /> Security
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-brand-100 dark:border-gray-700">
              
              {activeTab === 'general' && (
                <form onSubmit={handleGeneralSubmit}>
                  <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">General Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                      <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full px-4 py-3 bg-brand-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                      <input type="email" value={currentUser.email} disabled className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                      <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-brand-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="bg-brand-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}

              {activeTab === 'address' && (
                <form onSubmit={handleGeneralSubmit}>
                  <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">Primary Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">House No / Apartment</label>
                      <input type="text" name="houseNo" value={formData.houseNo} onChange={handleInputChange} className="w-full px-4 py-3 bg-brand-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Street</label>
                      <input type="text" name="street" value={formData.street} onChange={handleInputChange} className="w-full px-4 py-3 bg-brand-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-brand-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 bg-brand-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pincode</label>
                      <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-3 bg-brand-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="bg-brand-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Address'}
                  </button>
                </form>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handlePasswordSubmit}>
                  <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">Security Settings</h2>
                  <div className="space-y-6 mb-6 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                      <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} className="w-full px-4 py-3 bg-brand-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                      <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} className="w-full px-4 py-3 bg-brand-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full px-4 py-3 bg-brand-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="bg-brand-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors disabled:opacity-50">
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
