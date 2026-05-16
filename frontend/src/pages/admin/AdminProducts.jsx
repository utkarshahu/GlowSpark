import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '', brand: '', price: 0, stock: 0, description: '', category: 'Skincare'
  });

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
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await api.delete(`/products/${productId}`);
      if (res.data.success) {
        setProducts(products.filter(p => p._id !== productId));
        toast.success("Product deleted successfully");
      }
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product._id);
    setEditFormData({
      title: product.title,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      description: product.description,
      category: product.category || 'Skincare'
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/products/${editingProduct}`, { product: editFormData });
      if (res.data.success) {
        setProducts(products.map(p => p._id === editingProduct ? res.data.product : p));
        toast.success("Product updated successfully");
        setEditingProduct(null);
      }
    } catch (err) {
      toast.error("Failed to update product");
    }
  };

  if (loading) return <div className="text-gray-900 dark:text-white">Loading...</div>;

  return (
    <div className="transition-colors duration-300 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Product Management</h1>
        <Link to="/admin/products/new" className="bg-brand-900 dark:bg-brand-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-black dark:hover:bg-brand-600 transition-colors">
          + Add New Product
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300">
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
              <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{product.title}</td>
                <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{product.brand}</td>
                <td className="p-4 text-sm text-gray-800 dark:text-gray-300">&#8377; {product.price.toLocaleString("en-IN")}</td>
                <td className="p-4">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${product.stock > 0 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                    {product.stock} In Stock
                  </span>
                </td>
                <td className="p-4 space-x-4">
                  <button onClick={() => handleEditClick(product)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors">Edit</button>
                  <button onClick={() => handleDelete(product._id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium text-sm transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-2xl w-full border border-gray-100 dark:border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">Edit Product</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <input type="text" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:ring-brand-500 focus:border-brand-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</label>
                  <input type="text" value={editFormData.brand} onChange={e => setEditFormData({...editFormData, brand: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:ring-brand-500 focus:border-brand-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (&#8377;)</label>
                  <input type="number" value={editFormData.price} onChange={e => setEditFormData({...editFormData, price: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:ring-brand-500 focus:border-brand-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock</label>
                  <input type="number" value={editFormData.stock} onChange={e => setEditFormData({...editFormData, stock: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:ring-brand-500 focus:border-brand-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select 
                    value={editFormData.category} 
                    onChange={e => setEditFormData({...editFormData, category: e.target.value})} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:ring-brand-500 focus:border-brand-500 outline-none"
                    required
                  >
                    <option value="Skincare" className="dark:bg-gray-800">Skincare</option>
                    <option value="Makeup" className="dark:bg-gray-800">Makeup</option>
                    <option value="Haircare" className="dark:bg-gray-800">Haircare</option>
                    <option value="Fragrance" className="dark:bg-gray-800">Fragrance</option>
                    <option value="Bath & Body" className="dark:bg-gray-800">Bath & Body</option>
                  </select>
                </div>
              </div>
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea rows="3" value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:ring-brand-500 focus:border-brand-500 outline-none resize-none" required></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setEditingProduct(null)} className="px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 rounded-xl font-medium text-white bg-brand-900 hover:bg-black dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
