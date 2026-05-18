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
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FaStar, FaCheckCircle, FaTruck, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
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
      toast.success(`${product.title} added to your bag`);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please login to add items to your cart");
        navigate('/login');
      } else {
        toast.error("Failed to add to cart");
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
        toast.success("Review added successfully");
        setProduct({ ...product, reviews: [...product.reviews, res.data.review] });
        setComment('');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please login to leave a review");
      } else {
        toast.error(err.response?.data?.message || "Failed to submit review");
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
        toast.error("Please login to vote");
      } else {
        toast.error("Failed to vote");
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
        toast.error("Please login to vote");
      } else {
        toast.error("Failed to vote");
      }
    }
  };

  const averageRating = product?.reviews?.length 
    ? (product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / product.reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="bg-brand-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        <Navbar />
        <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-brand-100 dark:border-gray-700 p-8 md:p-12 transition-colors duration-300">
            
            {/* Left Column: Image Skeleton */}
            <div className="w-full md:w-1/2">
              <div className="w-full aspect-[4/5] rounded-2xl bg-gray-200 dark:bg-gray-700/60 animate-pulse shadow-inner"></div>
              <div className="flex gap-4 mt-6">
                <div className="w-20 h-20 rounded-xl bg-gray-200 dark:bg-gray-700/60 animate-pulse"></div>
                <div className="w-20 h-20 rounded-xl bg-gray-200 dark:bg-gray-700/60 animate-pulse"></div>
                <div className="w-20 h-20 rounded-xl bg-gray-200 dark:bg-gray-700/60 animate-pulse"></div>
              </div>
            </div>

            {/* Right Column: Text & Info Skeletons */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <div className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-8">
                <div className="h-4 w-24 bg-brand-200 dark:bg-brand-900/40 rounded-full animate-pulse mb-4"></div>
                <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-700/80 rounded-xl animate-pulse mb-6"></div>
                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700/60 rounded-xl animate-pulse mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700/50 rounded-full animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700/50 rounded-full animate-pulse"></div>
                  <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700/50 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700/60 rounded-full animate-pulse"></div>
                <div className="h-14 w-full bg-gray-100 dark:bg-gray-700/30 rounded-xl animate-pulse"></div>
                <div className="h-24 w-full bg-gray-100 dark:bg-gray-700/30 rounded-xl animate-pulse"></div>
                <div className="h-14 w-full bg-gray-100 dark:bg-gray-700/30 rounded-xl animate-pulse"></div>
              </div>

              <div className="h-14 w-full bg-gray-300 dark:bg-gray-600 rounded-xl animate-pulse"></div>
            </div>
            
          </div>
        </div>
      </div>
    );
  }
  if (!product) return <div className="min-h-screen bg-brand-50 dark:bg-gray-900 pt-32 text-center text-red-500">Product not found</div>;

  return (
    <div className="bg-brand-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <Navbar />
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-12 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-brand-100 dark:border-gray-700 p-8 md:p-12 transition-colors duration-300">
          
          {/* Image Gallery */}
          <div className="w-full md:w-1/2">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-brand-100/50 dark:border-gray-700 shadow-inner"
            >
              {product.images && product.images.length > 0 ? (
                product.images.map((img, idx) => (
                  <SwiperSlide key={idx} className="flex items-center justify-center p-8">
                    <img src={img.url} alt={`${product.title} Angle ${idx + 1}`} className="w-full h-full object-cover rounded-xl shadow-2xl" />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide className="flex items-center justify-center p-8">
                  <img src={product.image?.url || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600'} alt={product.title} className="w-full h-full object-cover rounded-xl shadow-2xl" />
                </SwiperSlide>
              )}
            </Swiper>
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-8">
              <p className="text-brand-600 dark:text-brand-400 font-bold tracking-widest uppercase text-sm mb-3">{product.brand}</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-6 leading-tight">{product.title}</h1>
              <p className="text-3xl font-light text-brand-800 dark:text-brand-300 mb-6">&#8377; {product.price.toLocaleString("en-IN")}</p>
              <p className="text-gray-600 dark:text-gray-300 font-light leading-relaxed text-lg">{product.description}</p>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} className={star <= averageRating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} />
                ))}
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2 font-medium">({product.reviews?.length || 0} Reviews)</span>
              </div>
              
              <div className="flex justify-between items-center bg-brand-50 dark:bg-gray-700 p-4 rounded-xl border border-brand-100/50 dark:border-gray-600">
                <span className="text-gray-600 dark:text-gray-200 font-medium">Availability</span>
                <span className={`font-bold flex items-center gap-2 ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {product.stock > 0 ? <><FaCheckCircle /> {product.stock} In Stock</> : 'Out of Stock'}
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-xl border border-gray-100 dark:border-gray-600">
                <h4 className="font-bold text-gray-800 dark:text-white mb-3 text-sm uppercase tracking-wider">Key Ingredients</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{product.ingredients || 'Proprietary Blend'}</p>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <FaTruck className="text-brand-600 dark:text-brand-400 text-xl" />
                <span>Free express delivery on orders over &#8377;2000. Ships within 24 hours.</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-brand-900 hover:bg-black disabled:bg-gray-400 text-white py-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-base uppercase tracking-wider"
              >
                Add to Cart
              </button>
              <button 
                onClick={handleProceedToBuy}
                disabled={product.stock === 0}
                className="w-full bg-transparent hover:bg-brand-900 text-brand-900 hover:text-white border border-brand-900 disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200 py-4 rounded-xl font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 text-base uppercase tracking-wider"
              >
                Proceed to Buy
              </button>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together & Reviews Placeholder */}
        <div className="mt-20">
          <h3 className="text-3xl font-serif font-bold text-brand-900 dark:text-white mb-8 border-b border-brand-100 dark:border-gray-700 pb-4">Customer Reviews</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-brand-100 dark:border-gray-700 p-8 shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Write a Review</h4>
                <form onSubmit={submitReview}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <FaStar 
                          key={num} 
                          className={`cursor-pointer text-2xl transition-colors ${rating >= num ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-200'}`}
                          onClick={() => setRating(num)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Review</label>
                    <textarea 
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="4" 
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors resize-none"
                      placeholder="What did you like about this product?"
                    ></textarea>
                  </div>
                  <button 
                    disabled={isSubmittingReview}
                    type="submit" 
                    className="w-full bg-brand-900 hover:bg-black disabled:bg-gray-400 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev, idx) => (
                  <div key={rev._id || idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         {rev.author?.profilePhoto?.url ? (
                            <img src={rev.author.profilePhoto.url} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-brand-200" />
                          ) : (
                            <img src={`https://ui-avatars.com/api/?name=${(rev.author?.username || rev.author?.email || 'A').charAt(0).toUpperCase()}&background=473129&color=fff`} alt="Avatar" className="w-10 h-10 rounded-full border border-brand-200" />
                          )}
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{rev.author?.username || rev.author?.email || 'Anonymous User'}</p>
                          <div className="flex text-yellow-400 text-xs mt-1">
                            {[...Array(rev.rating)].map((_, i) => <FaStar key={i} />)}
                          </div>
                        </div>
                      </div>
                      
                      {rev.verifiedPurchase && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                          <FaCheckCircle /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{rev.comment}</p>
                    
                    {/* Admin Reply */}
                    {rev.adminReply && (
                      <div className="bg-brand-50 dark:bg-gray-700 p-4 rounded-xl mb-4 border-l-4 border-brand-500">
                        <p className="text-xs font-bold text-brand-900 dark:text-white mb-1 uppercase tracking-wider">Response from GlowSpark</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{rev.adminReply}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-gray-400 text-xs">
                      <button onClick={() => handleHelpful(rev._id)} className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                        <FaThumbsUp /> Helpful ({rev.likes?.length || 0})
                      </button>
                      <button onClick={() => handleNotHelpful(rev._id)} className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                        <FaThumbsDown /> Not Helpful ({rev.dislikes?.length || 0})
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-brand-100 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400 font-light">
                  No reviews yet. Be the first to review this product!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
