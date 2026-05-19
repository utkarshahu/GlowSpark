import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Important for sending session cookies
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirect loops when session hydration or public pages return 401
      const isAuthMe = error.config?.url?.includes('/auth/me');
      
      // Define routes where a 401 should NOT trigger a hard redirect to login
      const publicRoutes = ['/', '/login', '/products', '/about'];
      const isPublicRoute = publicRoutes.includes(window.location.pathname) || window.location.pathname.startsWith('/products/');

      if (!isAuthMe && !isPublicRoute && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
