import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/userSlice';
import { toast } from 'react-toastify';
import api from '../api/axios';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    dispatch(loginStart());
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin ? { email, password } : { username, email, password };
      const response = await api.post(endpoint, payload);
      
      if (response.data.success) {
        if (response.data.sessionId) {
          localStorage.setItem('sessionId', response.data.sessionId);
        }
        dispatch(loginSuccess(response.data.user));
        toast.success(isLogin ? "Welcome back to Glow Spark!" : "Welcome to the Glow Spark family!");
        navigate('/products');
      }
    } catch (err) {
      dispatch(loginFailure());
      const errorMsg = err.response?.data?.message || 'An error occurred';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleFacebookLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    window.location.href = `${apiUrl}/auth/facebook`;
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brand-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-brand-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-brand-900 mb-2">Glow<span className="text-brand-500">Spark</span></h1>
          <p className="text-gray-500">{isLogin ? 'Welcome back, beautiful.' : 'Join the Glow Spark family.'}</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                placeholder="johndoe"
                required={!isLogin} 
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
              placeholder="you@example.com"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
              placeholder="••••••••"
              required 
            />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-brand-900 hover:bg-black disabled:bg-gray-400 text-white py-3 rounded-xl font-medium transition-colors shadow-md">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <span className="border-b border-gray-200 w-1/5 lg:w-1/4"></span>
          <span className="text-xs text-center text-gray-500 uppercase font-medium">Or continue with</span>
          <span className="border-b border-gray-200 w-1/5 lg:w-1/4"></span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button 
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white py-3 rounded-xl font-medium transition-colors shadow-md"
          >
            <FaFacebook className="text-xl" /> Facebook
          </button>
          
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition-colors shadow-md"
          >
            <FaGoogle className="text-xl text-[#DB4437]" /> Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-brand-600 font-bold hover:underline focus:outline-none">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
