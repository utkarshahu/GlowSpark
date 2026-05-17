import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaStar, FaTrash, FaBox, FaShoppingCart, FaEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa';

const AdminProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.product);
        setEditForm({
          title: res.data.product.title,
          price: res.data.product.price,
          description: res.data.product.description,
          stock: res.data.product.stock,
          brand: res.data.product.brand,
          category: res.data.product.category
        });
      }
    } catch (err) {
      toast.error("Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await api.delete(`/products/${id}/reviews/${reviewId}`);
      if (res.data.success) {
        toast.success("Review deleted successfully");
        setProduct({
          ...product,
          reviews: product.reviews.filter(r => r._id !== reviewId)
        });
      }
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload;
      let headers = {};
      
      if (imageFile) {
        payload = new FormData();
        payload.append('product[title]', editForm.title);
        payload.append('product[price]', editForm.price);
        payload.append('product[description]', editForm.description);
        payload.append('product[stock]', editForm.stock);
        payload.append('product[brand]', editForm.brand);
        payload.append('product[category]', editForm.category);
        payload.append('product[image]', imageFile);
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        payload = { product: editForm };
      }

      const res = await api.put(`/products/${id}`, payload, { headers });
      if (res.data.success) {
        toast.success("Product updated successfully");
        setProduct(res.data.product);
        setIsEditing(false);
        setImageFile(null);
        setImagePreview(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update product");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        toast.success("Product deleted successfully");
        navigate('/admin/products');
      }
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading product details...</div>;
  if (!product) return <div className="p-8 text-red-500">Product not found</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Product Insights</h1>
            <p className="text-gray-500 mt-1">{product.title}</p>
          </div>
        </div>
        {!isEditing && (
          <div className="flex gap-3">
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 px-4 py-2 rounded-xl font-bold hover:bg-brand-200 dark:hover:bg-brand-900/50 transition-colors">
              <FaEdit /> Edit Product
            </button>
            <button onClick={handleDeleteProduct} className="flex items-center gap-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-4 py-2 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
              <FaTrash /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
             <div className="relative aspect-square bg-gray-100 dark:bg-gray-900 rounded-2xl mb-6 overflow-hidden group">
                <img src={imagePreview || product.image?.url} alt={product.title} className="w-full h-full object-cover" />
                {isEditing && (
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <div className="flex flex-col items-center text-white">
                      <FaCamera className="text-3xl mb-2" />
                      <span className="font-medium text-sm">Change Image</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
             </div>
             
             {isEditing ? (
               <form onSubmit={handleEditSubmit} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                   <input required type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 dark:text-white" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (&#8377;)</label>
                   <input required type="number" min="0" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 dark:text-white" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                   <input required type="number" min="0" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 dark:text-white" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                   <input type="text" value={editForm.brand} onChange={e => setEditForm({...editForm, brand: e.target.value})} className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 dark:text-white" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                   <select required value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 dark:text-white">
                      <option value="Skincare">Skincare</option>
                      <option value="Makeup">Makeup</option>
                      <option value="Haircare">Haircare</option>
                      <option value="Fragrance">Fragrance</option>
                      <option value="Bath & Body">Bath & Body</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                   <textarea rows="3" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 dark:text-white" />
                 </div>
                 <div className="flex gap-2 pt-2">
                   <button type="button" onClick={() => { setIsEditing(false); setImagePreview(null); setImageFile(null); }} className="flex-1 flex justify-center items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white p-2 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                     <FaTimes /> Cancel
                   </button>
                   <button type="submit" className="flex-1 flex justify-center items-center gap-2 bg-brand-600 text-white p-2 rounded-xl hover:bg-brand-700 transition-colors">
                     <FaSave /> Save
                   </button>
                 </div>
               </form>
             ) : (
               <>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{product.title}</h3>
                 <p className="text-brand-600 dark:text-brand-400 font-bold mb-4">&#8377; {product.price.toLocaleString("en-IN")}</p>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{product.description}</p>
                 
                 <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                       <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                         <FaBox className="text-brand-500 text-xl" />
                         <span className="font-medium">Current Stock</span>
                       </div>
                       <span className="font-bold text-gray-900 dark:text-white text-lg">{product.stock}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                       <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                         <FaShoppingCart className="text-brand-500 text-xl" />
                         <span className="font-medium">Units Sold</span>
                       </div>
                       <span className="font-bold text-gray-900 dark:text-white text-lg">{product.orderCount || 0}</span>
                    </div>
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Reviews Management */}
        <div className="lg:col-span-2">
           <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm h-full">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Customer Reviews ({product.reviews?.length || 0})</h2>
               <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-lg text-yellow-700 dark:text-yellow-500 font-bold">
                 <FaStar /> {(product.ratingAverage || 0).toFixed(1)} / 5.0
               </div>
             </div>
             
             <div className="space-y-4">
               {product.reviews && product.reviews.length > 0 ? (
                 product.reviews.map(review => (
                   <div key={review._id} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between md:items-start gap-4">
                     <div className="flex gap-4">
                        <img 
                          src={review.author?.profilePhoto?.url || `https://ui-avatars.com/api/?name=${(review.author?.username || 'U').charAt(0)}`} 
                          alt="Reviewer" 
                          className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600" 
                        />
                        <div>
                           <p className="font-bold text-gray-900 dark:text-white mb-1">{review.author?.username || review.author?.email || 'Anonymous User'}</p>
                           <div className="flex text-yellow-400 text-xs mb-2">
                             {[...Array(review.rating)].map((_, i) => <FaStar key={i} />)}
                           </div>
                           <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => handleDeleteReview(review._id)}
                       className="shrink-0 flex items-center gap-2 text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                     >
                       <FaTrash /> Delete
                     </button>
                   </div>
                 ))
               ) : (
                 <p className="text-gray-500 dark:text-gray-400 text-center py-10">No reviews found for this product.</p>
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductDetail;
