import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaTimes, FaCamera, FaSave, FaPlus } from 'react-icons/fa';

const AdminCreateProduct = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    category: '',
    ingredients: '',
    isNewArrival: false,
    isBestseller: false,
  });
  
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleMultipleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (newImageFiles.length + files.length > 8) {
      toast.error("Maximum 8 images allowed per product");
      return;
    }

    const updatedFiles = [...newImageFiles, ...files];
    setNewImageFiles(updatedFiles);

    // Generate previews
    const filePreviews = [];
    let loadedCount = 0;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        filePreviews.push(reader.result);
        loadedCount++;
        if (loadedCount === files.length) {
          setNewImagePreviews([...newImagePreviews, ...filePreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteImage = (index) => {
    const updatedFiles = newImageFiles.filter((_, i) => i !== index);
    const updatedPreviews = newImagePreviews.filter((_, i) => i !== index);
    setNewImageFiles(updatedFiles);
    setNewImagePreviews(updatedPreviews);

    // Adjust thumbnail selection if deleted item was selected
    if (thumbnailIndex === index) {
      setThumbnailIndex(0);
    } else if (thumbnailIndex > index) {
      setThumbnailIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newImageFiles.length === 0) {
      toast.error("Please upload at least one product image.");
      return;
    }

    setLoading(true);

    const data = new FormData();
    data.append('product[title]', formData.title);
    data.append('product[description]', formData.description);
    data.append('product[price]', formData.price);
    data.append('product[stock]', formData.stock);
    data.append('product[brand]', formData.brand);
    data.append('product[category]', formData.category);
    data.append('product[ingredients]', formData.ingredients);
    data.append('product[thumbnailIndex]', thumbnailIndex);
    data.append('product[isNewArrival]', formData.isNewArrival);
    data.append('product[isBestseller]', formData.isBestseller);
    
    newImageFiles.forEach((file) => {
      data.append('images', file);
    });

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
    <div className="max-w-4xl mx-auto pb-12 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-3.5 mb-8">
        <Link to="/admin/products" className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-150 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-650 dark:text-gray-300 shrink-0">
          <FaArrowLeft className="text-xs" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-black text-gray-950 dark:text-white">Create New Product</h1>
          <p className="text-xs text-gray-500 mt-0.5">Publish a premium addition to the Glow Spark catalog.</p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-650 p-4 rounded-2xl mb-6 border border-red-100 text-xs font-bold text-center">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image Uploader Grid */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-150 dark:border-gray-700 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">Product Gallery</h3>
              <span className="text-[10px] font-bold text-gray-400">{newImagePreviews.length}/8 Photos</span>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-2 gap-3">
              {newImagePreviews.map((url, idx) => {
                const isThumbnail = thumbnailIndex === idx;
                return (
                  <div 
                    key={idx} 
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-gray-50 dark:bg-gray-900 transition-all ${
                      isThumbnail ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    
                    {/* Thumbnail Selection */}
                    <button 
                      type="button" 
                      onClick={() => setThumbnailIndex(idx)} 
                      className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shadow-sm transition-all ${
                        isThumbnail ? 'bg-brand-500 text-white' : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white'
                      }`}
                    >
                      {isThumbnail ? '★ Main' : 'Set Main'}
                    </button>

                    {/* Delete Box */}
                    <button 
                      type="button" 
                      onClick={() => handleDeleteImage(idx)} 
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-500 hover:bg-red-650 text-white shadow-sm transition-all text-[9px]"
                    >
                      <FaTimes />
                    </button>
                  </div>
                );
              })}

              {/* Upload Box Container */}
              {newImagePreviews.length < 8 && (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-250 dark:border-gray-700 rounded-xl aspect-square hover:bg-brand-50/20 dark:hover:bg-gray-900/20 cursor-pointer transition-all hover:border-brand-400 group shrink-0">
                  <FaCamera className="text-gray-400 dark:text-gray-500 text-xl group-hover:text-brand-500 transition-colors mb-1.5" />
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Add Photo</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden" 
                    onChange={handleMultipleImagesChange} 
                  />
                </label>
              )}
            </div>

            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed italic">
              * Upload up to 8 images. Choose one image as the main catalog thumbnail preview.
            </p>
          </div>
        </div>

        {/* Right Column: Premium Details Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-150 dark:border-gray-700 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-300 mb-1.5">Product Title</label>
                  <input 
                    required 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    placeholder="e.g. Vitamin C Radiance Serum"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-300 mb-1.5">Brand</label>
                  <input 
                    required 
                    type="text" 
                    name="brand" 
                    value={formData.brand} 
                    onChange={handleChange} 
                    placeholder="e.g. Minimalist"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm transition-all" 
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-300 mb-1.5">Price (₹)</label>
                  <input 
                    required 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    placeholder="2757"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm transition-all font-mono font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-300 mb-1.5">Initial Stock</label>
                  <input 
                    required 
                    type="number" 
                    name="stock" 
                    value={formData.stock} 
                    onChange={handleChange} 
                    placeholder="219"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm transition-all font-mono font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-300 mb-1.5">Category</label>
                  <select 
                    required 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select category</option>
                    <option value="Skincare">Skincare</option>
                    <option value="Makeup">Makeup</option>
                    <option value="Haircare">Haircare</option>
                    <option value="Fragrance">Fragrance</option>
                    <option value="Bath & Body">Bath & Body</option>
                  </select>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-300 mb-1.5">Key Ingredients</label>
                <input 
                  required 
                  type="text" 
                  name="ingredients" 
                  value={formData.ingredients} 
                  onChange={handleChange} 
                  placeholder="e.g. Vitamin C, Hyaluronic Acid, Centella Asiatica"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm transition-all" 
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-300 mb-1.5">Description Statement</label>
                <textarea 
                  required 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows="4" 
                  placeholder="Describe the texture, properties, and benefits of this luxury skincare..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm transition-all resize-none leading-relaxed" 
                />
              </div>

              {/* Checkboxes / Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-brand-50/20 dark:bg-gray-900 p-4 rounded-2xl border border-brand-100/40 dark:border-gray-750">
                  <input 
                    type="checkbox" 
                    id="isNewArrival" 
                    name="isNewArrival"
                    checked={formData.isNewArrival} 
                    onChange={handleChange} 
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer" 
                  />
                  <label htmlFor="isNewArrival" className="text-xs font-bold text-gray-850 dark:text-gray-200 cursor-pointer select-none">Mark as "New Arrival"</label>
                </div>

                <div className="flex items-center gap-3 bg-brand-50/20 dark:bg-gray-900 p-4 rounded-2xl border border-brand-100/40 dark:border-gray-750">
                  <input 
                    type="checkbox" 
                    id="isBestseller" 
                    name="isBestseller"
                    checked={formData.isBestseller} 
                    onChange={handleChange} 
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer" 
                  />
                  <label htmlFor="isBestseller" className="text-xs font-bold text-gray-855 dark:text-gray-200 cursor-pointer select-none">Mark as "Bestseller" Tag</label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link to="/admin/products" className="flex-1 flex justify-center items-center py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-white font-bold text-xs rounded-xl transition-all uppercase tracking-wider">
                  Discard
                </Link>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 flex justify-center items-center gap-2 py-3.5 bg-black hover:bg-brand-900 disabled:bg-gray-400 text-white font-bold text-xs rounded-xl transition-all uppercase tracking-wider shadow-lg hover:shadow-xl"
                >
                  <FaSave /> {loading ? 'Publishing...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateProduct;
