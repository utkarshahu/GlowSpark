import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import { socket } from '../../api/socket';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, productsRes, ordersRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/products'),
          api.get('/admin/orders')
        ]);
        
        if (dashboardRes.data.success) {
          setStats(dashboardRes.data.stats);
          setChartData([
            { name: 'Jan', revenue: 4000 },
            { name: 'Feb', revenue: 3000 },
            { name: 'Mar', revenue: 5000 },
            { name: 'Apr', revenue: 8000 },
            { name: 'May', revenue: dashboardRes.data.stats.totalRevenue }
          ]);
        }
        
        if (productsRes.data.success) {
          setLowStockProducts(productsRes.data.products.filter(p => p.stock < 10));
        }
 
        if (ordersRes.data.success) {
          setRecentOrders(ordersRes.data.orders.slice(0, 5)); // Last 5 orders
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
 
    fetchData(); // Initial fetch
    
    // Web socket real-time integrations
    socket.on('newOrderPlaced', (newOrder) => {
      setStats((prev) => ({
        ...prev,
        totalOrders: prev.totalOrders + 1,
        totalRevenue: prev.totalRevenue + newOrder.totalAmount
      }));
      setRecentOrders((prev) => [newOrder, ...prev].slice(0, 5));
    });

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setRecentOrders((prev) => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    // Polling every 10 seconds as backup
    const interval = setInterval(fetchData, 10000);
    return () => {
      socket.off('newOrderPlaced');
      socket.off('orderStatusUpdated');
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        {/* Header Title Skeleton */}
        <div className="h-9 bg-gray-200 dark:bg-gray-700 w-1/4 rounded-lg mb-8"></div>

        {/* Top 3 KPI Metric Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-brand-100 dark:border-gray-700">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/3 rounded-md mb-3"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 w-2/3 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Main Section Skeletons (Chart + Alerts) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-2xl border border-brand-100 dark:border-gray-700 h-96">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 w-1/4 rounded-md mb-6"></div>
            <div className="h-[75%] bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
          </div>
          {/* Low Stock card */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-brand-100 dark:border-gray-700 h-96">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 w-1/3 rounded-md mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/10 rounded-xl">
                  <div className="space-y-2 flex-1 mr-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 w-2/3 rounded-md"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 w-1/3 rounded-md"></div>
                  </div>
                  <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders table card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-brand-100 dark:border-gray-700">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 w-1/4 rounded-md mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
            {[1, 2, 3].map((n) => (
              <div key={n} className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transition-colors duration-300">
      <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">Total Revenue</p>
          <h2 className="text-4xl font-serif font-bold text-brand-900 dark:text-white">&#8377; {stats.totalRevenue.toLocaleString("en-IN")}</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">Total Orders</p>
          <h2 className="text-4xl font-serif font-bold text-brand-900 dark:text-white">{stats.totalOrders}</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">Active Users</p>
          <h2 className="text-4xl font-serif font-bold text-brand-900 dark:text-white">{stats.activeUsers}</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm h-96 transition-colors duration-300">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#473129" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#473129" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#473129" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm h-96 overflow-y-auto transition-colors duration-300">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">Low Stock Alerts</h3>
          {lowStockProducts.length === 0 ? (
             <p className="text-green-600 dark:text-green-400 font-medium">All products are well stocked.</p>
          ) : (
            <div className="space-y-4">
              {lowStockProducts.map(product => (
                <div key={product._id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{product.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.brand}</p>
                  </div>
                  <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-brand-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white">Recent Orders Feed</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-brand-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentOrders.map(order => (
                <tr key={order._id} className="hover:bg-brand-50/50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-500 dark:text-gray-400">#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">{order.user?.email || 'Guest'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-300">₹{order.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
