import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDestructive = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700 shadow-2xl animate-fade-in-up">
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDestructive ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'}`}>
            <FaExclamationTriangle className="text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">{message}</p>
          
          <div className="flex w-full gap-4">
            <button 
              onClick={onClose} 
              className="flex-1 px-6 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }} 
              className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-colors ${
                isDestructive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-brand-900 hover:bg-brand-800 dark:bg-brand-600 dark:hover:bg-brand-500'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
