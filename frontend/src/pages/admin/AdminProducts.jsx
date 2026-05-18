import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import ConfirmModal from '../../components/ConfirmModal';
import { socket } from '../../api/socket';
import { FaSearch } from 'react-icons/fa';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products?limit=all');
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    socket.on('productUpdated', (updatedProduct) => {
      setProducts((prev) => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    });

    socket.on('productDeleted', (deletedProductId) => {
      setProducts((prev) => prev.filter(p => p._id !== deletedProductId));
    });

    return () => {
      socket.off('productUpdated');
      socket.off('productDeleted');
    };
  }, []);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const confirmDelete = (productId) => {
    setProductToDelete(productId);
    setIsConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      const res = await api.delete(`/products/${productToDelete}`);
      if (res.data.success) {
        setProducts(products.filter(p => p._id !== productToDelete));
        toast.success("Product deleted successfully");
      }
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setProductToDelete(null);
    }
  };

  const handleEditClick = (product) => {
    navigate(`/admin/products/${product._id}`);
  };

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-9 bg-gray-200 dark:bg-gray-700 w-1/4 rounded-lg"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 w-40 rounded-xl"></div>
        </div>
        
        {/* Search Bar Skeleton */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-md h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-brand-50 dark:bg-gray-700 h-14 border-b border-brand-100 dark:border-gray-600"></div>
          <div className="divide-y divide-brand-100 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="p-5 flex justify-between items-center">
                <div className="flex items-center gap-3 w-1/3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 w-24 rounded-md"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-24 rounded-md"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-16 rounded-md"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 w-20 rounded-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 w-24 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transition-colors duration-300 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Product Management</h1>
        <Link to="/admin/products/new" className="bg-brand-900 dark:bg-brand-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-black dark:hover:bg-brand-600 transition-colors text-center w-full sm:w-auto">
          + Add New Product
        </Link>
      </div>

      {/* Center Search Bar */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search products by name, brand, or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all"
          />
          <FaSearch className="absolute left-3.5 top-4 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm overflow-x-auto transition-colors duration-300">
        <table className="w-full text-left">
          <thead className="bg-brand-50 dark:bg-gray-700 border-b border-brand-100 dark:border-gray-600">
            <tr>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Product Name</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Brand</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Price</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Stock</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100 dark:divide-gray-700">
            {filteredProducts.map(product => {
              const thumbnailUrl = product.images && product.images[product.thumbnailIndex || 0] 
                ? product.images[product.thumbnailIndex || 0].url 
                : (product.image?.url || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=100');
              
              return (
                <tr 
                  key={product._id} 
                  onClick={() => navigate(`/admin/products/${product._id}`)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <td className="p-4 text-sm font-medium text-gray-900 dark:text-white flex items-center gap-3">
                    <img 
                      src={thumbnailUrl} 
                      alt={product.title} 
                      className="w-12 h-12 rounded-lg object-cover border border-brand-100 dark:border-gray-700 shadow-sm shrink-0" 
                    />
                    <span className="truncate">{product.title}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{product.brand}</td>
                  <td className="p-4 text-sm text-gray-800 dark:text-gray-300">&#8377; {product.price.toLocaleString("en-IN")}</td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${product.stock > 0 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                      {product.stock} In Stock
                    </span>
                  </td>
                  <td className="p-4 space-x-4">
                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(product); }} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); confirmDelete(product._id); }} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium text-sm transition-colors">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>



      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminProducts;
