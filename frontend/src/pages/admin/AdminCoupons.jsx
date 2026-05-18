import React, { useState, useEffect } from 'react';
import { FaTag, FaPlus, FaTrash, FaEdit, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountPercent: 0,
    flatDiscount: 0,
    minOrderValue: 0,
    expiresAt: '',
    usageLimit: '',
    active: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons);
      }
    } catch (err) {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null
      };
      
      const res = await api.post('/coupons', payload);
      if (res.data.success) {
        toast.success("Coupon created successfully");
        setIsModalOpen(false);
        fetchCoupons();
        setFormData({ code: '', discountPercent: 0, flatDiscount: 0, minOrderValue: 0, expiresAt: '', usageLimit: '', active: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to delete coupon");
    }
  };

  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Coupon Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Create and manage discount codes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          <FaPlus /> New Coupon
        </button>
      </div>

      {/* Center Search Bar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search coupons by code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all"
          />
          <FaSearch className="absolute left-3.5 top-4 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-brand-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-brand-50 dark:bg-gray-700 h-14 border-b border-brand-100 dark:border-gray-600"></div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="p-5 flex justify-between items-center">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 w-24 rounded-lg"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-16 rounded-md"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-16 rounded-md"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-16 rounded-md"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 w-20 rounded-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-12 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-brand-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-brand-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Discount</th>
                <th className="px-6 py-4 font-medium">Min Order</th>
                <th className="px-6 py-4 font-medium">Usage</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredCoupons.map(coupon => (
                <tr key={coupon._id} className="hover:bg-brand-50/50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold font-mono bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 px-3 py-1 rounded-lg">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-300">
                    {coupon.discountPercent > 0 ? `${coupon.discountPercent}%` : `₹${coupon.flatDiscount}`}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-300">₹{coupon.minOrderValue}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-300">
                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${coupon.active && new Date(coupon.expiresAt) > new Date() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {coupon.active && new Date(coupon.expiresAt) > new Date() ? 'Active' : 'Expired/Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(coupon._id)} className="text-red-500 hover:text-red-700 p-2">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No coupons found. Create one to offer discounts.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-xl p-8 border border-brand-100 dark:border-gray-700">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">Create New Coupon</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Code</label>
                <input required type="text" name="code" value={formData.code} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border-none uppercase" placeholder="SUMMER50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount %</label>
                  <input type="number" name="discountPercent" value={formData.discountPercent} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Or Flat Discount (₹)</label>
                  <input type="number" name="flatDiscount" value={formData.flatDiscount} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Order Value (₹)</label>
                  <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usage Limit</label>
                  <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border-none" placeholder="Leave empty for infinite" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                <input required type="date" name="expiresAt" value={formData.expiresAt} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-gray-900 dark:text-white" />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
                <button type="submit" className="bg-brand-900 text-white px-8 py-2 rounded-xl font-medium hover:bg-black">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
