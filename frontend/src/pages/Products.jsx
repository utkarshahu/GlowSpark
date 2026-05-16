import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { FaHeart, FaFilter, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(10000);
  const [wishlist, setWishlist] = useState([]);
  const gridRef = useRef(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sortParam = searchParams.get('sort');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        if (res.data.success) {
          setProducts(res.data.products);
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
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!loading && products.length > 0) {
      gsap.fromTo(gridRef.current.children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [loading, products]);

  const handleAddToCart = async (product, e) => {
    e.preventDefault();
    try {
      await api.post('/cart/add', { productId: product._id });
      toast.success(`${product.title} added to your bag`);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please login to add items to your cart");
        window.location.href = '/login';
      } else {
        toast.error("Failed to add to cart");
      }
    }
  };

  const handleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const isWished = wishlist.includes(productId);
      if (isWished) {
        await api.delete(`/users/wishlist/${productId}`);
        setWishlist(wishlist.filter(id => id !== productId));
        toast.info("Removed from wishlist", { theme: "dark" });
      } else {
        await api.post(`/users/wishlist/${productId}`);
        setWishlist([...wishlist, productId]);
        toast.success("Added to wishlist", { theme: "dark" });
      }
    } catch (err) {
      toast.error("Please login to use wishlist", { theme: "dark" });
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesPrice = p.price <= priceRange;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  let sortedProducts = [...filteredProducts];
  if (sortParam === 'new') {
    sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortParam === 'bestseller') {
    // Mock bestseller by sorting by lower stock
    sortedProducts.sort((a, b) => a.stock - b.stock);
  }

  const categories = ['All', 'Skincare', 'Makeup', 'Haircare', 'Fragrance'];

  return (
    <div className="bg-brand-50 dark:bg-gray-900 min-h-screen pb-20 transition-colors duration-300">
      <Navbar />
      
      <div className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-900 dark:text-white mb-4">The Collection</h1>
          <p className="text-gray-600 dark:text-gray-400 font-light max-w-2xl mx-auto">Discover our full range of premium skincare and cosmetics, formulated to reveal your most radiant self.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm sticky top-32 transition-colors duration-300">
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

              <div className="mb-8">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FaFilter /> Categories</h3>
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

              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex justify-between">
                  Price Range <span className="text-brand-600 dark:text-brand-400">&#8377; {priceRange}</span>
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
          <div className="w-full lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-brand-100 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
                No products found matching your criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8" ref={gridRef}>
                {sortedProducts.map(product => (
                  <Link to={`/products/${product._id}`} key={product._id} className="group block bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-brand-100/50 dark:border-gray-700 flex flex-col h-full">
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                      <img 
                        src={product.image.url} 
                        alt={product.title} 
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out drop-shadow-xl rounded-xl"
                      />
                      <button 
                        onClick={(e) => handleWishlist(e, product._id)}
                        className={`absolute top-4 right-4 transition-colors p-2 rounded-full backdrop-blur-sm z-10 ${wishlist.includes(product._id) ? 'text-red-500 bg-red-50' : 'text-gray-300 hover:text-red-500 bg-white/80'}`}
                      >
                        <FaHeart />
                      </button>
                      {product.stock < 10 && product.stock > 0 && (
                        <div className="absolute top-4 left-4 bg-brand-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
                            Low Stock
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold text-brand-500 dark:text-brand-400 uppercase tracking-widest">{product.brand}</p>
                        <p className="font-serif font-bold text-gray-900 dark:text-white text-lg">&#8377; {product.price.toLocaleString("en-IN")}</p>
                      </div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-4 text-lg truncate group-hover:text-brand-600 transition-colors">{product.title}</h3>
                      
                      <div className="mt-auto">
                        <button 
                          onClick={(e) => handleAddToCart(product, e)}
                          className="w-full py-3 bg-white dark:bg-gray-800 border border-brand-200 dark:border-gray-600 text-brand-800 dark:text-gray-200 font-medium rounded-xl group-hover:bg-brand-900 group-hover:text-white dark:group-hover:bg-brand-500 dark:group-hover:text-white dark:group-hover:border-brand-500 transition-all duration-300 shadow-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
