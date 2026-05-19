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
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [reviewSort, setReviewSort] = useState('newest'); // newest, highest, lowest

  const sortedReviews = React.useMemo(() => {
    if (!product || !product.reviews) return [];
    const list = [...product.reviews];
    if (reviewSort === 'newest') {
      return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (reviewSort === 'highest') {
      return list.sort((a, b) => b.rating - a.rating);
    } else if (reviewSort === 'lowest') {
      return list.sort((a, b) => a.rating - b.rating);
    }
    return list;
  }, [product?.reviews, reviewSort]);

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
          category: res.data.product.category,
          images: res.data.product.images || [],
          thumbnailIndex: res.data.product.thumbnailIndex || 0,
          isNewArrival: res.data.product.isNewArrival || false
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
      const payload = new FormData();
      payload.append('product[title]', editForm.title);
      payload.append('product[price]', editForm.price);
      payload.append('product[description]', editForm.description);
      payload.append('product[stock]', editForm.stock);
      payload.append('product[brand]', editForm.brand);
      payload.append('product[category]', editForm.category);
      payload.append('product[images]', JSON.stringify(editForm.images));
      payload.append('product[thumbnailIndex]', editForm.thumbnailIndex);
      payload.append('product[isNewArrival]', editForm.isNewArrival);

      if (newImageFiles.length > 0) {
        newImageFiles.forEach((file) => {
          payload.append('images', file);
        });
      }

      const res = await api.put(`/products/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success("Product updated successfully");
        setProduct(res.data.product);
        setIsEditing(false);
        setNewImageFiles([]);
        setNewImagePreviews([]);
        fetchProduct(); // Refresh
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update product");
    }
  };

  const handleMultipleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const currentTotal = (editForm.images?.length || 0) + newImageFiles.length;
    
    if (currentTotal + files.length > 8) {
      toast.error("Maximum 8 images allowed per product");
      return;
    }

    const newFiles = [...newImageFiles, ...files];
    setNewImageFiles(newFiles);

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

  const handleDeleteImage = (index, isExisting) => {
    if (isExisting) {
      const updatedImages = editForm.images.filter((_, i) => i !== index);
      let newThumbnailIndex = editForm.thumbnailIndex;
      if (editForm.thumbnailIndex === index) {
        newThumbnailIndex = 0;
      } else if (editForm.thumbnailIndex > index) {
        newThumbnailIndex--;
      }
      setEditForm({ ...editForm, images: updatedImages, thumbnailIndex: newThumbnailIndex });
    } else {
      const updatedFiles = newImageFiles.filter((_, i) => i !== index);
      const updatedPreviews = newImagePreviews.filter((_, i) => i !== index);
      setNewImageFiles(updatedFiles);
      setNewImagePreviews(updatedPreviews);

      // Adjust thumbnail if needed
      const existingCount = editForm.images?.length || 0;
      const absoluteDeletedIndex = existingCount + index;
      let newThumbnailIndex = editForm.thumbnailIndex;
      if (editForm.thumbnailIndex === absoluteDeletedIndex) {
        newThumbnailIndex = 0;
      } else if (editForm.thumbnailIndex > absoluteDeletedIndex) {
        newThumbnailIndex--;
      }
      setEditForm({ ...editForm, thumbnailIndex: newThumbnailIndex });
    }
  };

  const handleSetThumbnail = (absoluteIndex) => {
    setEditForm({ ...editForm, thumbnailIndex: absoluteIndex });
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

  if (loading) {
    return (
      <div className="animate-pulse max-w-6xl mx-auto pb-12">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 w-48 rounded-lg"></div>
          </div>
          <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>

        {/* Product Details Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Left Column - Product Images Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-3xl w-full"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl w-full"></div>
              ))}
            </div>
          </div>

          {/* Right Column - Product Meta & Settings Skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 w-3/4 rounded-lg"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/3 rounded-md"></div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 w-1/4 rounded-md"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 w-full rounded-2xl"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!product) return <div className="p-8 text-red-500">Product not found</div>;

  // Final combined list of images for rendering/selection during editing
  const existingImages = editForm.images || [];
  const combinedImagePreviews = [
    ...existingImages.map(img => img.url),
    ...newImagePreviews
  ];

  const mainImageUrl = (product.images && product.images[product.thumbnailIndex || 0]?.url) || 
    (product.images && product.images[0]?.url) || 
    (product.image?.url || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600');

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3.5">
          <Link to="/admin/products" className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 shrink-0">
            <FaArrowLeft className="text-xs" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 dark:text-white truncate">Product Insights</h1>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{product.title}</p>
          </div>
        </div>
        {!isEditing && (
          <div className="flex gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-brand-200 dark:hover:bg-brand-900/50 transition-colors">
              <FaEdit className="text-[10px]" /> Edit Product
            </button>
            <button onClick={handleDeleteProduct} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
              <FaTrash className="text-[10px]" /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Media Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
             
             {isEditing ? (
               // Media Manager (Editing Mode)
               <div className="space-y-6">
                 <div className="flex justify-between items-center">
                   <h3 className="font-bold text-gray-900 dark:text-white">Product Gallery</h3>
                   <span className="text-xs text-gray-500">{combinedImagePreviews.length}/8 Photos</span>
                 </div>

                 {/* Photo Grid */}
                 <div className="grid grid-cols-2 gap-3">
                   {combinedImagePreviews.map((url, idx) => {
                     const isExisting = idx < existingImages.length;
                     const targetIdx = isExisting ? idx : idx - existingImages.length;
                     const isThumbnail = editForm.thumbnailIndex === idx;

                     return (
                       <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-gray-50 dark:bg-gray-900 transition-all ${isThumbnail ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-200 dark:border-gray-700'}`}>
                         <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                         
                         {/* Thumbnail Badge / Button */}
                         <button 
                           type="button" 
                           onClick={() => handleSetThumbnail(idx)} 
                           className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm transition-all ${isThumbnail ? 'bg-brand-500 text-white' : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white'}`}
                         >
                           {isThumbnail ? '★ Thumb' : 'Set Thumb'}
                         </button>

                         {/* Delete Button */}
                         <button 
                           type="button" 
                           onClick={() => handleDeleteImage(targetIdx, isExisting)} 
                           className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white shadow-sm transition-all text-xs"
                         >
                           <FaTimes />
                         </button>
                       </div>
                     );
                   })}

                   {/* Add Photo Box */}
                   {combinedImagePreviews.length < 8 && (
                     <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl aspect-square hover:bg-brand-50/30 dark:hover:bg-gray-900/30 cursor-pointer transition-colors">
                       <FaCamera className="text-gray-400 dark:text-gray-500 text-2xl mb-2" />
                       <span className="text-[10px] text-gray-500 font-medium">Add Photo(s)</span>
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
               </div>
             ) : (
               // Simple View Mode Gallery
               <div>
                 <div className="relative aspect-square bg-gray-100 dark:bg-gray-900 rounded-2xl mb-6 overflow-hidden">
                   <img src={mainImageUrl} alt={product.title} className="w-full h-full object-cover" />
                   {product.isNewArrival && (
                     <span className="absolute top-3 right-3 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">New Arrival</span>
                   )}
                 </div>
                 
                 {/* Mini thumbs list */}
                 {product.images && product.images.length > 1 && (
                   <div className="grid grid-cols-4 gap-2">
                     {product.images.map((img, i) => (
                       <div key={i} className={`aspect-square rounded-lg overflow-hidden border-2 bg-gray-50 ${product.thumbnailIndex === i ? 'border-brand-500' : 'border-gray-200'}`}>
                         <img src={img.url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>

        {/* Product Details Form/Details Column */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">Edit Product Details</h2>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Title</label>
                    <input required type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                    <input required type="text" value={editForm.brand} onChange={e => setEditForm({...editForm, brand: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (&#8377;)</label>
                    <input required type="number" min="0" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                    <input required type="number" min="0" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select required value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                      <option value="Skincare">Skincare</option>
                      <option value="Makeup">Makeup</option>
                      <option value="Haircare">Haircare</option>
                      <option value="Fragrance">Fragrance</option>
                      <option value="Bath & Body">Bath & Body</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea rows="4" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>

                {/* New Arrivals Toggle */}
                <div className="flex items-center gap-3 bg-brand-50/50 dark:bg-gray-900 p-4 rounded-xl border border-brand-100 dark:border-gray-700">
                  <input 
                    type="checkbox" 
                    id="isNewArrival" 
                    checked={editForm.isNewArrival} 
                    onChange={e => setEditForm({...editForm, isNewArrival: e.target.checked})} 
                    className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500" 
                  />
                  <label htmlFor="isNewArrival" className="font-bold text-gray-900 dark:text-white cursor-pointer select-none">Mark as "New Arrival"</label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="button" onClick={() => { setIsEditing(false); setNewImagePreviews([]); setNewImageFiles([]); }} className="w-full sm:flex-1 flex justify-center items-center gap-2 bg-gray-250 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-650 transition-colors text-xs font-black">
                    <FaTimes /> Cancel
                  </button>
                  <button type="submit" className="w-full sm:flex-1 flex justify-center items-center gap-2 bg-brand-900 hover:bg-black text-white py-3 rounded-xl transition-colors text-xs font-black shadow-lg">
                    <FaSave /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Stats / Info (View Mode)
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">{product.title}</h3>
                <p className="text-xl font-bold text-brand-600 dark:text-brand-400 mb-6">&#8377; {product.price.toLocaleString("en-IN")}</p>
                
                <h4 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs mb-2">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-8">{product.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <FaBox className="text-brand-500 text-xl" />
                      <span className="font-medium">Stock Available</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-lg">{product.stock}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <FaShoppingCart className="text-brand-500 text-xl" />
                      <span className="font-medium">Total Sales</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-lg">{product.soldCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reviews Management */}
        <div className="lg:col-span-2">
           <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm h-full">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
               <div>
                 <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Customer Reviews ({product.reviews?.length || 0})</h2>
                 {product.reviews && product.reviews.length > 0 && (
                   <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                     <span>Sort:</span>
                     <select
                       value={reviewSort}
                       onChange={(e) => setReviewSort(e.target.value)}
                       className="bg-transparent font-bold text-brand-600 dark:text-brand-400 outline-none cursor-pointer border-b border-brand-500/50 pb-0.5"
                     >
                       <option value="newest" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Newest First</option>
                       <option value="highest" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Highest Rating</option>
                       <option value="lowest" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Lowest Rating</option>
                     </select>
                   </div>
                 )}
               </div>
               <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-lg text-yellow-700 dark:text-yellow-500 font-bold shrink-0 self-start sm:self-auto">
                 <FaStar /> {(product.ratingAverage || 0).toFixed(1)} / 5.0
               </div>
             </div>
             
             <div className="space-y-4">
               {sortedReviews.length > 0 ? (
                 sortedReviews.map(review => (
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
