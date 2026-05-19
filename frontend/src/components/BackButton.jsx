import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide floating back button on admin panel routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <button 
      onClick={() => navigate(-1)}
      className="fixed bottom-8 left-8 z-50 w-12 h-12 bg-white dark:bg-gray-800 text-brand-900 dark:text-white rounded-full shadow-lg border border-brand-100 dark:border-gray-700 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 group"
    >
      <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
    </button>
  );
};

export default BackButton;
