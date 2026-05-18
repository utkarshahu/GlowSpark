import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FaStar, FaCheckCircle, FaTruck, FaThumbsUp, FaThumbsDown, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../store/cartSlice';
import { socket } from '../api/socket';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.user?.currentUser);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSort, setReviewSort] = useState('newest'); // newest, highest, lowest

  // Interactive Tabs State
  const [activeTab, setActiveTab] = useState('reviews'); // description, ingredients, reviews

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
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    socket.on('productUpdated', (updatedProduct) => {
      if (updatedProduct._id === id) {
        setProduct((prev) => ({
          ...updatedProduct,
          reviews: prev ? prev.reviews : []
        }));
        toast.info("ℹ️ Product details updated in real-time by admin", { theme: "colored" });
      }
    });

    socket.on('productDeleted', (deletedId) => {
      if (deletedId === id) {
        toast.error("⚠️ This product is no longer available.", { theme: "colored" });
        navigate('/products');
      }
    });

    return () => {
      socket.off('productUpdated');
      socket.off('productDeleted');
    };
  }, [id, navigate]);

  const handleAddToCart = async () => {
    try {
      const res = await api.post('/cart/add', { productId: product._id });
      if (res.data.success) {
         dispatch(setCart(res.data.cart));
      }
      toast.success(`${product.title} added to your bag`, { theme: 'dark' });
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please login to add items to your cart", { theme: 'dark' });
        navigate('/login');
      } else {
        toast.error("Failed to add to cart", { theme: 'dark' });
      }
    }
  };

  const handleProceedToBuy = () => {
    if (!currentUser) {
      toast.error("Please login to proceed to checkout", { theme: "dark" });
      navigate('/login');
      return;
    }
    navigate("/checkout", {
      state: {
        checkoutItems: [
          {
            product: product,
            quantity: 1
          }
        ],
        finalTotal: product.price
      }
    });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const res = await api.post(`/products/${id}/reviews`, { review: { rating, comment } });
      if (res.data.success) {
        toast.success("Review added successfully", { theme: 'dark' });
        setProduct({ ...product, reviews: [...product.reviews, res.data.review] });
        setComment('');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please login to leave a review", { theme: 'dark' });
      } else {
        toast.error(err.response?.data?.message || "Failed to submit review", { theme: 'dark' });
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      const res = await api.put(`/products/${id}/reviews/${reviewId}/helpful`);
      if (res.data.success) {
        setProduct({
          ...product,
          reviews: product.reviews.map(r => r._id === reviewId ? { ...r, likes: res.data.review.likes, dislikes: res.data.review.dislikes } : r)
        });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please login to vote", { theme: 'dark' });
      } else {
        toast.error("Failed to vote", { theme: 'dark' });
      }
    }
  };

  const handleNotHelpful = async (reviewId) => {
    try {
      const res = await api.put(`/products/${id}/reviews/${reviewId}/not-helpful`);
      if (res.data.success) {
        setProduct({
          ...product,
          reviews: product.reviews.map(r => r._id === reviewId ? { ...r, likes: res.data.review.likes, dislikes: res.data.review.dislikes } : r)
        });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please login to vote", { theme: 'dark' });
      } else {
        toast.error("Failed to vote", { theme: 'dark' });
      }
    }
  };

  // Date Formatter Helper
  const formatDate = (dateString) => {
    if (!dateString) return '1 month ago';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Dynamic reviews metrics calculations
  const averageRating = product?.reviews?.length 
    ? (product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / product.reviews.length).toFixed(1)
    : 0;

  const totalReviews = product?.reviews?.length || 0;

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (product?.reviews) {
    product.reviews.forEach(rev => {
      const r = Math.round(rev.rating);
      if (starCounts[r] !== undefined) {
        starCounts[r]++;
      }
    });
  }

  const getPercentage = (stars) => {
    if (totalReviews === 0) return 0;
    return Math.round((starCounts[stars] / totalReviews) * 100);
  };

  if (loading) {
    return (
      <div className="bg-brand-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <Navbar />
        <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-brand-100 dark:border-gray-700 p-8 md:p-12 transition-colors duration-300">
            <div className="w-full md:w-1/2">
              <div className="w-full aspect-[4/5] rounded-2xl bg-gray-200 dark:bg-gray-700/60 animate-pulse shadow-inner"></div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <div className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-8 space-y-4">
                <div className="h-4 w-24 bg-brand-200 dark:bg-brand-900/40 rounded-full animate-pulse"></div>
                <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-700/80 rounded-xl animate-pulse"></div>
                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700/60 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="min-h-screen bg-brand-50 dark:bg-gray-900 pt-32 text-center text-red-500 text-xs">Product not found</div>;

  return (
    <div className="bg-brand-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <Navbar />
      <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <button 
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-brand-850 dark:text-brand-300 hover:text-brand-600 transition-colors text-[10px] uppercase font-bold tracking-widest mb-6 focus:outline-none"
        >
          <FaArrowLeft /> Back to Shop
        </button>

        {/* Product Details Section */}
        <div className="flex flex-col md:flex-row gap-12 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-brand-100 dark:border-gray-700 p-6 sm:p-10 transition-colors duration-300">
          
          {/* Left Column: Image Swiper Gallery */}
          <div className="w-full md:w-1/2">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-brand-100/50 dark:border-gray-700 shadow-inner"
            >
              {product.images && product.images.length > 0 ? (
                product.images.map((img, idx) => (
                  <SwiperSlide key={idx} className="flex items-center justify-center p-6">
                    <img src={img.url} alt={`${product.title} Angle ${idx + 1}`} className="w-full h-full object-cover rounded-xl shadow-lg" />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide className="flex items-center justify-center p-6">
                  <img src={product.image?.url || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600'} alt={product.title} className="w-full h-full object-cover rounded-xl shadow-lg" />
                </SwiperSlide>
              )}
            </Swiper>
          </div>

          {/* Right Column: Key Details */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="mb-6 border-b border-gray-100 dark:border-gray-750 pb-6">
              <p className="text-brand-500 dark:text-brand-400 font-bold tracking-widest uppercase text-[10px] mb-2">{product.brand}</p>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white mb-3 leading-snug">{product.title}</h1>
              <p className="text-2xl font-serif font-black text-brand-850 dark:text-brand-300 mb-4">&#8377; {product.price.toLocaleString("en-IN")}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-light leading-relaxed">{product.description}</p>
            </div>

            <div className="space-y-4 mb-8">
              {/* Stars Overview */}
              <div 
                className="flex items-center gap-1.5 cursor-pointer"
                onClick={() => {
                  setActiveTab('reviews');
                  document.getElementById('tabs-container')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="flex text-amber-400 text-xs">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar key={star} className={star <= averageRating ? "text-yellow-400" : "text-gray-250 dark:text-gray-600"} />
                  ))}
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-[11px] font-semibold">({totalReviews} Reviews)</span>
              </div>
              
              {/* Stock status */}
              <div className="flex justify-between items-center bg-brand-50/50 dark:bg-gray-750 p-3 rounded-xl border border-brand-100/30 dark:border-gray-700 text-xs">
                <span className="text-gray-500 dark:text-gray-350 font-medium">Availability Status</span>
                <span className={`font-bold flex items-center gap-1.5 ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {product.stock > 0 ? <><FaCheckCircle className="text-[10px]" /> {product.stock} In Stock</> : 'Out of Stock'}
                </span>
              </div>

              {/* Express delivery note */}
              <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700/80 shadow-sm">
                <FaTruck className="text-brand-650 dark:text-brand-400 text-base" />
                <span>Free express delivery on orders over &#8377;2000. Fast dispatch.</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-brand-900 hover:bg-black disabled:bg-gray-300 dark:bg-brand-100 dark:text-brand-900 dark:hover:bg-white text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm focus:outline-none"
              >
                Add to Bag
              </button>
              <button 
                onClick={handleProceedToBuy}
                disabled={product.stock === 0}
                className="w-full bg-transparent hover:bg-brand-900 text-brand-900 hover:text-white dark:text-brand-100 dark:hover:bg-brand-100 dark:hover:text-brand-900 border border-brand-900 dark:border-brand-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-100 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all focus:outline-none"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selection Area */}
        <div id="tabs-container" className="mt-16 border-b border-brand-150 dark:border-gray-800 flex justify-center gap-8 text-xs font-bold uppercase tracking-wider mb-8">
          <button 
            onClick={() => setActiveTab('description')}
            className={`pb-3 focus:outline-none transition-all ${activeTab === 'description' ? 'border-b-2 border-brand-900 dark:border-brand-400 text-brand-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Description
          </button>
          <button 
            onClick={() => setActiveTab('ingredients')}
            className={`pb-3 focus:outline-none transition-all ${activeTab === 'ingredients' ? 'border-b-2 border-brand-900 dark:border-brand-400 text-brand-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Ingredients
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 focus:outline-none transition-all ${activeTab === 'reviews' ? 'border-b-2 border-brand-900 dark:border-brand-400 text-brand-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Reviews ({totalReviews})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="transition-all duration-300">
          
          {/* Tab 1: Description */}
          {activeTab === 'description' && (
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-brand-100 dark:border-gray-700 space-y-4">
              <h3 className="font-serif font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2"><FaInfoCircle className="text-brand-500 text-sm" /> Product Description</h3>
              <p className="text-xs text-gray-605 dark:text-gray-305 leading-relaxed font-light">{product.description || 'No description available for this luxury product.'}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Key Highlights</h4>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 list-disc list-inside">
                    <li>100% Certified Organic components</li>
                    <li>Sermatologically & Hypoallergenically certified</li>
                    <li>Paraben, Cruelty & Sulphate free</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">How to Use</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                    Apply a small pea-sized portion onto cleansed skin morning and evening. Massage gently in upward circular motions until absorbed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Ingredients */}
          {activeTab === 'ingredients' && (
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-brand-100 dark:border-gray-700 space-y-4">
              <h3 className="font-serif font-bold text-gray-900 dark:text-white text-lg">Formulation & Key Ingredients</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-light mb-4">
                Formulated using the highest quality natural components selected for their visual effectiveness and safety profiles.
              </p>
              <div className="p-4 bg-brand-50/50 dark:bg-gray-750 border border-brand-100/50 dark:border-gray-700 rounded-xl">
                <p className="text-xs text-gray-750 dark:text-gray-300 font-semibold leading-relaxed">
                  {product.ingredients || 'Proprietary Organic Skincare Blend, Botanical Essences, Hyaluronic Acids, Pure Vitamin Extracts.'}
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Reviews Panel (Dynamic Star Breakdown Progress Bars & High-Fidelity Reviews Cards) */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              
              {/* Dynamic Review Breakdown Panel */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-brand-100 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Side: Score Overview */}
                  <div className="md:col-span-4 text-center md:border-r border-gray-150 dark:border-gray-700 md:pr-8 py-4 space-y-2">
                    <h3 className="text-4xl sm:text-5xl font-serif font-black text-brand-900 dark:text-white">{averageRating}</h3>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">out of 5</p>
                    <div className="flex justify-center text-yellow-400 text-sm py-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar key={s} className={s <= Math.round(averageRating) ? "text-yellow-400" : "text-gray-200 dark:text-gray-600"} />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">{totalReviews} Customer Reviews</span>
                  </div>
                  
                  {/* Right Side: Horizontal breakdown bars */}
                  <div className="md:col-span-8 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const percent = getPercentage(stars);
                      return (
                        <div key={stars} className="flex items-center text-xs font-semibold text-gray-600 dark:text-gray-400 gap-3">
                          <span className="w-12 shrink-0 font-serif font-bold text-right">{stars} Star</span>
                          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden shadow-inner border border-gray-150/40 dark:border-gray-650/40">
                            <div 
                              className="h-full bg-yellow-400 dark:bg-yellow-500 rounded-full transition-all duration-500" 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-12 shrink-0 text-gray-400 dark:text-gray-500 font-medium text-left">({starCounts[stars]})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Review Portal: Write & List Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Submit New Review Form */}
                <div className="lg:col-span-4">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-brand-100 dark:border-gray-700 p-6 shadow-sm sticky top-28">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b pb-3 font-serif">Write a Review</h4>
                    <form onSubmit={submitReview} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Product Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(num => (
                            <FaStar 
                              key={num} 
                              className={`cursor-pointer text-xl transition-colors ${rating >= num ? 'text-yellow-400' : 'text-gray-250 dark:text-gray-600 hover:text-yellow-250'}`}
                              onClick={() => setRating(num)}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Your Review</label>
                        <textarea 
                          required
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows="4" 
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-650 bg-transparent dark:text-white text-xs focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors resize-none font-light"
                          placeholder="What did you like or dislike about this cosmetic?"
                        ></textarea>
                      </div>
                      <button 
                        disabled={isSubmittingReview}
                        type="submit" 
                        className="w-full bg-brand-900 hover:bg-black disabled:bg-gray-300 text-white dark:bg-brand-100 dark:text-brand-900 py-3 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-colors focus:outline-none"
                      >
                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                </div>
                
                {/* Reviews List */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Reviews Sort Bar */}
                  {totalReviews > 0 && (
                    <div className="flex justify-between items-center bg-white dark:bg-gray-800 px-5 py-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300 text-xs">
                      <span className="font-semibold text-gray-500 dark:text-gray-400">Sort reviews:</span>
                      <select
                        value={reviewSort}
                        onChange={(e) => setReviewSort(e.target.value)}
                        className="bg-transparent font-bold text-brand-900 dark:text-white outline-none cursor-pointer border-b border-brand-500 pb-0.5"
                      >
                        <option value="newest" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Newest First</option>
                        <option value="highest" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Highest Rated</option>
                        <option value="lowest" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Lowest Rated</option>
                      </select>
                    </div>
                  )}

                  {/* Reviews Cards List */}
                  {sortedReviews.length > 0 ? (
                    sortedReviews.map((rev, idx) => (
                      <div key={rev._id || idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                             {rev.author?.profilePhoto?.url ? (
                                <img src={rev.author.profilePhoto.url} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-brand-200" />
                              ) : (
                                <img src={`https://ui-avatars.com/api/?name=${(rev.author?.username || rev.author?.email || 'A').charAt(0).toUpperCase()}&background=473129&color=fff`} alt="Avatar" className="w-9 h-9 rounded-full border border-brand-200" />
                              )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-gray-900 dark:text-white text-xs">{rev.author?.username || rev.author?.email?.split('@')[0] || 'Anonymous'}</p>
                                <span className="text-[9px] text-green-600 dark:text-green-400 flex items-center gap-0.5 font-bold uppercase tracking-wider bg-green-50 dark:bg-green-950/20 border border-green-150/30 dark:border-green-800/20 px-1.5 py-0.5 rounded-md">
                                  <FaCheckCircle className="text-[7px]" /> Verified
                                </span>
                              </div>
                              <div className="flex text-yellow-400 text-[10px] mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar key={i} className={i < rev.rating ? "text-yellow-400" : "text-gray-200 dark:text-gray-650"} />
                                ))}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold shrink-0">
                            {formatDate(rev.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-650 dark:text-gray-300 font-light leading-relaxed">{rev.comment}</p>
                        
                        {/* High-Fidelity Cosmetic Review Media Attachment Mock Gallery */}
                        <div className="flex gap-2 pt-1.5 overflow-x-auto pb-1">
                          <img 
                            src="https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&w=150&q=80" 
                            alt="Cosmetic Detail" 
                            className="w-14 h-14 object-cover rounded-lg border border-brand-100/50 dark:border-gray-700 shadow-sm cursor-pointer hover:opacity-90 hover:scale-102 transition-all"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <img 
                            src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=150&q=80" 
                            alt="Serum swatch" 
                            className="w-14 h-14 object-cover rounded-lg border border-brand-100/50 dark:border-gray-700 shadow-sm cursor-pointer hover:opacity-90 hover:scale-102 transition-all"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>

                        {/* Admin reply segment */}
                        {rev.adminReply && (
                          <div className="bg-brand-50 dark:bg-gray-750 p-3.5 rounded-xl border-l-2 border-brand-500 border border-brand-100/30 dark:border-gray-700 text-xs">
                            <p className="text-[9px] font-bold text-brand-900 dark:text-brand-350 mb-1 uppercase tracking-widest">GlowSpark Response</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300 font-light">{rev.adminReply}</p>
                          </div>
                        )}

                        {/* Helpful voting */}
                        <div className="flex items-center gap-4 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider pt-2 border-t border-gray-50 dark:border-gray-750">
                          <button onClick={() => handleHelpful(rev._id)} className="flex items-center gap-1 hover:text-brand-600 transition-colors focus:outline-none">
                            <FaThumbsUp /> Helpful ({rev.likes?.length || 0})
                          </button>
                          <button onClick={() => handleNotHelpful(rev._id)} className="flex items-center gap-1 hover:text-brand-600 transition-colors focus:outline-none">
                            <FaThumbsDown /> Not Helpful ({rev.dislikes?.length || 0})
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-brand-100 dark:border-gray-700 p-8 text-center text-gray-400 dark:text-gray-500 text-xs font-light">
                      No customer reviews yet. Be the first to review this organic formulation!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
