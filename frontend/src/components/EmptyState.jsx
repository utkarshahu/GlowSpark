import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon, title, description, actionText, actionLink, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-800 rounded-3xl border border-brand-100 dark:border-gray-700 shadow-sm animate-fade-in-up flex-grow">
      {Icon && (
        <div className="w-20 h-20 bg-brand-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-brand-500 dark:text-brand-400 mb-6">
          <Icon className="text-4xl" />
        </div>
      )}
      <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">{description}</p>
      
      {actionText && (
        actionLink ? (
          <Link 
            to={actionLink} 
            className="px-8 py-3 bg-brand-900 dark:bg-brand-500 text-white rounded-xl font-medium hover:bg-black dark:hover:bg-brand-600 transition-colors shadow-sm"
          >
            {actionText}
          </Link>
        ) : onAction ? (
          <button 
            onClick={onAction}
            className="px-8 py-3 bg-brand-900 dark:bg-brand-500 text-white rounded-xl font-medium hover:bg-black dark:hover:bg-brand-600 transition-colors shadow-sm"
          >
            {actionText}
          </button>
        ) : null
      )}
    </div>
  );
};

export default EmptyState;
