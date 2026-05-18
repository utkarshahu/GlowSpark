import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { FaHeart, FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setCart } from '../store/cartSlice';
import { updateWishlist } from '../store/userSlice';
import EmptyState from '../components/EmptyState';
import SmartImage from '../components/SmartImage';
import { socket } from '../api/socket';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(10000);
  const [wishlist, setWishlist] = useState([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const gridRef = useRef(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sortParam = searchParams.get('sort');
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 12,
        category: activeCategory,
        maxPrice: priceRange
      });
      if (searchQuery) queryParams.append('search', searchQuery);
      if (sortParam) queryParams.append('sort', sortParam);

      const res = await api.get(`/products?${queryParams.toString()}`);
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalPages(res.data.pagination.pages);
      }
      
      const authRes = await api.get('/auth/me');
      if (authRes.data.success && authRes.data.user?.wishlist) {
        setWishlist(authRes.data.user.wishlist);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300); // 300ms debounce

    socket.on('productUpdated', (updatedProduct) => {
      setProducts((prev) => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    });

    socket.on('productDeleted', (deletedProductId) => {
      setProducts((prev) => prev.filter(p => p._id !== deletedProductId));
    });

    return () => {
      clearTimeout(delayDebounceFn);
      socket.off('productUpdated');
      socket.off('productDeleted');
    };
  }, [page, activeCategory, searchQuery, priceRange, sortParam]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchQuery, priceRange, sortParam]);

  useEffect(() => {
    if (!loading && products.length > 0 && gridRef.current) {
      gsap.fromTo(gridRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }
      );
    }
  }, [loading, products]);

  // Lock scroll when filter drawer is open on mobile
  useEffect(() => {
    if (isFilterDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFilterDrawerOpen]);

  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    try {
      const res = await api.post('/cart/add', { productId: product._id });
      if (res.data.success) {
         dispatch(setCart(res.data.cart));
      }
      toast.success(`${product.title} added to your bag`, { theme: 'dark' });
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please login to add items to your cart", { theme: 'dark' });
        window.location.href = '/login';
      } else {
        toast.error("Failed to add to cart", { theme: 'dark' });
      }
    }
  };

  const handleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const isWished = wishlist.includes(productId);
      if (isWished) {
        const res = await api.delete(`/users/wishlist/${productId}`);
        setWishlist(wishlist.filter(id => id !== productId));
        if (res.data.success) {
           dispatch(updateWishlist(res.data.wishlist));
        }
        toast.info("Removed from wishlist", { theme: "dark" });
      } else {
        const res = await api.post(`/users/wishlist/${productId}`);
        setWishlist([...wishlist, productId]);
        if (res.data.success) {
           dispatch(updateWishlist(res.data.wishlist));
        }
        toast.success("Added to wishlist", { theme: "dark" });
      }
    } catch (err) {
      toast.error("Please login to use wishlist", { theme: "dark" });
    }
  };

  const categories = ['All', 'Skincare', 'Makeup', 'Haircare', 'Fragrance'];

  return (
    <div className="bg-brand-50 dark:bg-gray-900 min-h-screen pb-20 transition-colors duration-300">
      <Navbar />
      
      <div className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner Section */}
        <div className="text-center mb-10 mt-6">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-900 dark:text-white mb-2">The Collection</h1>
          <p className="text-[11px] lg:text-sm text-gray-500 dark:text-gray-400 font-light max-w-lg mx-auto leading-relaxed">
            Discover our full range of premium organic skincare and high-fidelity cosmetics, formulated to highlight your natural elegance.
          </p>
        </div>

        {/* Action Header: Search & Mobile Filter Toggle (ONLY visible on Mobile & Tablet screens) */}
        <div className="flex lg:hidden flex-row justify-between items-center gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-brand-100/50 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <div className="relative w-full max-w-xs">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-150 dark:border-gray-650 bg-transparent dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-xs transition-all"
            />
            <FaSearch className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 text-xs" />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-brand-200 dark:border-gray-600 rounded-xl text-xs font-semibold text-brand-900 dark:text-brand-350 hover:bg-brand-50 hover:border-brand-300 dark:hover:bg-gray-700 transition-all focus:outline-none"
            >
              <FaFilter className="text-[10px]" /> Filter
            </button>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Found {products.length} items</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters (EXACTLY original styling and includes Search Bar) */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm sticky top-32 transition-colors duration-300">
              
              {/* Original Search Input inside Desktop Sidebar */}
              <div className="mb-6 relative">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-transparent dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                />
                <FaSearch className="absolute left-4 top-4 text-gray-400 dark:text-gray-500" />
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FaFilter /> Categories
                </h3>
                <ul className="space-y-2">
                  {categories.map(cat => (
                    <li key={cat}>
                      <button 
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat ? 'bg-brand-900 text-white font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-700'}`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range Limit */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex justify-between">
                  Price Limit <span className="text-brand-600 dark:text-brand-400">&#8377; {priceRange}</span>
                </h3>
                <input 
                  type="range" 
                  className="w-full accent-brand-900" 
                  min="0" 
                  max="10000" 
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>&#8377;0</span>
                  <span>&#8377;10,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="w-full lg:w-3/4 flex flex-col min-h-[50vh]">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 mb-12">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-brand-100/50 dark:border-gray-700 p-6 flex flex-col h-full space-y-4">
                    {/* Image Skeleton */}
                    <div className="relative aspect-[4/5] rounded-xl bg-gray-100 dark:bg-gray-700/40 animate-pulse shadow-inner"></div>
                    
                    {/* Details Row */}
                    <div className="flex justify-between items-center mb-1">
                      <div className="h-3 w-16 bg-brand-100/70 dark:bg-brand-900/30 rounded-full animate-pulse"></div>
                      <div className="h-5 w-12 bg-gray-150 dark:bg-gray-700/60 rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* Title Skeleton */}
                    <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700/60 rounded-full animate-pulse"></div>
                    
                    {/* Button Skeleton */}
                    <div className="h-12 w-full bg-gray-200 dark:bg-gray-700/80 rounded-xl animate-pulse mt-auto"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState 
                icon={FaSearch}
                title="No Products Found"
                description="We couldn't find any products matching your current filters. Try adjusting your search or category."
                actionText="Clear Filters"
                onAction={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                  setPriceRange(10000);
                }}
              />
            ) : (
              <>
                {/* original desktop spacing gap-8 and original xl:grid-cols-3 columns */}
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 mb-12" ref={gridRef}>
                  {products.map(product => {
                    const thumbnailUrl = (product.images && product.images[product.thumbnailIndex || 0]?.url) || 
                      (product.images && product.images[0]?.url) || 
                      (product.image?.url || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400');

                    return (
                      <Link to={`/products/${product._id}`} key={product._id} className="group block bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-brand-100/50 dark:border-gray-700 flex flex-col h-full">
                        {/* Aspect image frame p-4 on desktop, p-3 on mobile */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-3 lg:p-4">
                          <SmartImage 
                            src={thumbnailUrl} 
                            alt={product.title} 
                            className="w-full h-full rounded-xl group-hover:scale-105 lg:group-hover:scale-110 transition-transform duration-700 ease-out drop-shadow-md lg:drop-shadow-xl"
                          />
                          <button 
                            onClick={(e) => handleWishlist(e, product._id)}
                            className={`absolute top-3 right-3 lg:top-4 lg:right-4 transition-colors p-2 rounded-full backdrop-blur-sm z-10 ${wishlist.includes(product._id) ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-500 bg-white/80'}`}
                          >
                            <FaHeart className="text-xs lg:text-sm" />
                          </button>
                        {product.isNewArrival && (
                          <div className="absolute top-3 left-3 lg:top-4 lg:left-4 bg-brand-600 text-white text-[8px] lg:text-[10px] font-bold px-2 py-0.5 lg:px-3 lg:py-1 rounded-md lg:rounded-full uppercase tracking-wider z-10">
                              New Arrival
                          </div>
                        )}
                        {product.stock < 10 && product.stock > 0 && (
                          <div className={`absolute ${product.isNewArrival ? 'top-8 lg:top-12' : 'top-3 lg:top-4'} left-3 lg:left-4 bg-brand-900 text-white text-[8px] lg:text-[10px] font-bold px-2 py-0.5 lg:px-3 lg:py-1 rounded-md lg:rounded-full uppercase tracking-wider z-10`}>
                              Low Stock
                          </div>
                        )}
                      </div>
                      
                      {/* Details card p-6 on desktop, p-3 on mobile */}
                      <div className="p-3 lg:p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-1 lg:mb-2 gap-2">
                          <p className="text-[10px] lg:text-xs font-bold text-brand-500 dark:text-brand-400 uppercase tracking-widest truncate">{product.brand}</p>
                          <p className="font-serif font-black lg:font-bold text-gray-900 dark:text-white text-xs lg:text-lg shrink-0">&#8377; {product.price.toLocaleString("en-IN")}</p>
                        </div>
                        {/* Text sizes remain large (text-lg) on desktop, compact (text-xs) on mobile */}
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3 lg:mb-4 text-xs lg:text-lg leading-snug lg:leading-normal truncate group-hover:text-brand-600 transition-colors">{product.title}</h3>
                        
                        <div className="mt-auto">
                          {/* Button py-3, text-sm, normal-case Add to Cart on desktop. Mobile uses compact py-2.5, text-[10px], uppercase Add to Bag */}
                          <button 
                            onClick={(e) => handleAddToCart(product, e)}
                            className="w-full py-2.5 lg:py-3 bg-white dark:bg-gray-800 border border-brand-200 dark:border-gray-600 text-brand-800 dark:text-gray-200 text-[10px] lg:text-sm font-bold lg:font-medium uppercase lg:normal-case tracking-widest lg:tracking-normal rounded-xl group-hover:bg-brand-900 group-hover:text-white dark:group-hover:bg-brand-500 dark:group-hover:text-white dark:group-hover:border-brand-500 transition-all duration-300 shadow-sm"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-auto pt-8 border-t border-brand-100 dark:border-gray-700">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs lg:text-sm text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center text-xs lg:text-sm font-semibold lg:font-medium transition-colors ${page === i + 1 ? 'bg-brand-900 text-white dark:bg-brand-500' : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs lg:text-sm text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Slide-out Mobile/Tablet Filter Drawer */}
      {isFilterDrawerOpen && (
        <>
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-40 lg:hidden" 
            onClick={() => setIsFilterDrawerOpen(false)} 
          />
          
          {/* Drawer Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-white dark:bg-gray-900 border-r border-gray-150 dark:border-gray-800 z-50 p-6 shadow-2xl overflow-y-auto lg:hidden flex flex-col transition-transform duration-300 ease-out">
            <div className="flex justify-between items-center pb-4 border-b border-gray-150 dark:border-gray-800 mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                <FaFilter className="text-[10px] text-brand-500" /> Filter Options
              </h3>
              <button 
                onClick={() => setIsFilterDrawerOpen(false)} 
                className="text-gray-400 hover:text-black dark:hover:text-white focus:outline-none"
                aria-label="Close Filters"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
            
            {/* Category Select */}
            <div className="mb-8">
              <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-3">Categories</h4>
              <ul className="space-y-1">
                {categories.map(cat => (
                  <li key={cat}>
                    <button 
                      onClick={() => {
                        setActiveCategory(cat);
                        setIsFilterDrawerOpen(false); // auto-close drawer on select for better mobile flow
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-lg text-xs transition-colors ${activeCategory === cat ? 'bg-brand-900 text-white font-medium dark:bg-brand-500' : 'text-gray-605 dark:text-gray-305 hover:bg-brand-50 dark:hover:bg-gray-800'}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Limit Slider */}
            <div className="border-t border-gray-150 dark:border-gray-800 pt-6 mt-auto">
              <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-3 flex justify-between items-center">
                Price Limit <span className="text-brand-600 dark:text-brand-400 font-serif font-black">&#8377; {priceRange}</span>
              </h4>
              <input 
                type="range" 
                className="w-full accent-brand-900 dark:accent-brand-500" 
                min="0" 
                max="10000" 
                step="100"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
              />
              <div className="flex justify-between text-[9px] text-gray-400 mt-2 font-medium">
                <span>&#8377;0</span>
                <span>&#8377;10,000</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
