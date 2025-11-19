import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ErrorIcon, XIcon } from './Icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 300); // Allow time for exit animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 300);
  };

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-brand-teal-500' : 'bg-red-500';
  const Icon = isSuccess ? CheckCircleIcon : ErrorIcon;

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-center p-4 w-full max-w-xs text-white ${bgColor} rounded-lg shadow-2xl transition-all duration-300 ease-in-out transform ${exiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
      role="alert"
    >
      <div className={`inline-flex flex-shrink-0 justify-center items-center w-8 h-8 rounded-lg ${isSuccess ? 'bg-brand-teal-600' : 'bg-red-600'}`}>
        <Icon className="w-5 h-5" />
        <span className="sr-only">{isSuccess ? 'Success' : 'Error'} icon</span>
      </div>
      <div className="ml-3 text-sm font-medium">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 p-1.5 inline-flex h-8 w-8 rounded-lg hover:bg-white/20 focus:ring-2 focus:ring-gray-300"
        onClick={handleClose}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
