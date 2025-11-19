import React, { useEffect } from 'react';
import { StarIcon, XIcon } from './Icons';

interface PointsAwardedModalProps {
  points: number;
  onClose: () => void;
}

export const PointsAwardedModal: React.FC<PointsAwardedModalProps> = ({ points, onClose }) => {
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-sm p-6 sm:p-8 text-center relative transform transition-all animate-fade-in-up" 
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors">
          <XIcon className="w-6 h-6" />
        </button>
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-brand-orange-500 shadow-lg animate-bounce-in">
            <StarIcon className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold mt-5 text-slate-100">Violation Confirmed!</h2>
        <p className="mt-2 text-slate-400">Thank you for your contribution to safer roads.</p>
        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400">You've been awarded:</p>
          <p className="text-4xl font-bold text-brand-orange-400 mt-1">
            {points} Points
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="mt-6 w-full py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-brand-orange-500 hover:bg-brand-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange-500 transition-transform hover:scale-105"
        >
          Great!
        </button>
      </div>
    </div>
  );
};