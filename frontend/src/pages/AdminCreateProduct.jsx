import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';

const AdminCreateProduct = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    category: '',
    ingredients: '',
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const data = new FormData();
    data.append('product[title]', formData.title);
    data.append('product[description]', formData.description);
    data.append('product[price]', formData.price);
    data.append('product[stock]', formData.stock);
    data.append('product[brand]', formData.brand);
    data.append('product[category]', formData.category);
    data.append('product[ingredients]', formData.ingredients);
    
    if (image) {
      data.append('product[image]', image);
    }

    try {
      const res = await api.post('/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        toast.success("Product Created Successfully!");
        navigate('/admin/products');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-3xl">
        <div className="bg-white rounded-3xl shadow-sm border border-brand-100 p-8 md:p-12">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Create New Product</h1>
          <p className="text-gray-500 mb-8">Add a new beauty product to the Glow Spark catalog.</p>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input required type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (&#8377;)</label>
                <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select required name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors bg-white">
                  <option value="" disabled>Select a category</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Haircare">Haircare</option>
                  <option value="Fragrance">Fragrance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image (Cloudinary)</label>
                <input required type="file" onChange={handleImageChange} accept="image/*" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 mb-4" />
                {imagePreview && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Ingredients</label>
              <input required type="text" name="ingredients" value={formData.ingredients} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors" placeholder="e.g. Vitamin C, Hyaluronic Acid" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors resize-none"></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-brand-900 hover:bg-black disabled:bg-gray-400 text-white py-4 rounded-xl font-medium transition-colors shadow-lg text-lg">
              {loading ? 'Uploading...' : 'Publish Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateProduct;
