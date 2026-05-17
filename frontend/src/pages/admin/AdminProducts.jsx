import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import ConfirmModal from '../../components/ConfirmModal';
import { socket } from '../../api/socket';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
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

  if (loading) return <div className="text-gray-900 dark:text-white">Loading...</div>;

  return (
    <div className="transition-colors duration-300 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Product Management</h1>
        <Link to="/admin/products/new" className="bg-brand-900 dark:bg-brand-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-black dark:hover:bg-brand-600 transition-colors text-center w-full sm:w-auto">
          + Add New Product
        </Link>
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
            {products.map(product => (
              <tr 
                key={product._id} 
                onClick={() => navigate(`/admin/products/${product._id}`)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{product.title}</td>
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
            ))}
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
