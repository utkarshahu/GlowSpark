import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from './store/userSlice';
import api from './api/axios';
import Lenis from 'lenis';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import BackButton from './components/BackButton';

// Lazy Loaded Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Orders = lazy(() => import('./pages/Orders'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy Loaded Admin Pages
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCreateProduct = lazy(() => import('./pages/AdminCreateProduct'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminReturns = lazy(() => import('./pages/admin/AdminReturns'));
const AdminProductInsights = lazy(() => import('./pages/admin/AdminProductInsights'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminProductDetail = lazy(() => import('./pages/admin/AdminProductDetail'));
const AdminUserDetail = lazy(() => import('./pages/admin/AdminUserDetail'));

import ErrorBoundary from './components/ErrorBoundary';

// StorefrontGuard: Strict role-based isolation blocking storefront access while in Admin Mode
const StorefrontGuard = ({ children }) => {
  const { currentUser, currentMode } = useSelector((state) => state.user || {});
  if (currentUser && currentUser.role === 'admin' && currentMode === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

// Suspense Fallback Component
const PageSkeleton = () => (
  <div className="min-h-screen bg-brand-50 flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-900 rounded-full animate-spin"></div>
  </div>
);

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    // Session Hydration
    const hydrateSession = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          dispatch(loginSuccess(res.data.user));
        }
      } catch (err) {
        console.log("No active session found.");
      }
    };
    hydrateSession();

    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <CustomCursor />
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <div className={loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'}>
        <ErrorBoundary>
          <Router>
            <BackButton />
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<StorefrontGuard><ProductDetail /></StorefrontGuard>} />
              <Route path="/cart" element={<StorefrontGuard><Cart /></StorefrontGuard>} />
              <Route path="/checkout" element={<StorefrontGuard><Checkout /></StorefrontGuard>} />
              <Route path="/profile" element={<StorefrontGuard><Profile /></StorefrontGuard>} />
              <Route path="/wishlist" element={<StorefrontGuard><Wishlist /></StorefrontGuard>} />
              <Route path="/orders" element={<StorefrontGuard><Orders /></StorefrontGuard>} />
              <Route path="/about" element={<StorefrontGuard><AboutUs /></StorefrontGuard>} />
              <Route path="*" element={<NotFound />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminCreateProduct />} />
                <Route path="products/:id" element={<AdminProductDetail />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:id" element={<AdminOrderDetail />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="users/:id" element={<AdminUserDetail />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="returns" element={<AdminReturns />} />
                <Route path="analytics" element={<AdminProductInsights />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
        </ErrorBoundary>
      </div>
    </>
  );
}

export default App;
