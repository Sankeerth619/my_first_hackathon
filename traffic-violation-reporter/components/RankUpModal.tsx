import React, { useEffect } from 'react';
import { XIcon } from './Icons';
import { Rank, RANKS } from '../types';

interface RankUpModalProps {
  newRank: Rank;
  pointsAwarded: number;
  onClose: () => void;
}

export const RankUpModal: React.FC<RankUpModalProps> = ({ newRank, pointsAwarded, onClose }) => {
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const rankInfo = RANKS[newRank];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 text-center relative transform transition-all animate-fade-in-up" 
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors">
          <XIcon className="w-6 h-6" />
        </button>
        <div 
          className="mx-auto flex items-center justify-center h-24 w-24 rounded-full shadow-lg animate-bounce-in mb-4"
          style={{ backgroundColor: rankInfo.color }}
        >
          <span className="text-4xl font-bold text-white">{rankInfo.name.charAt(0)}</span>
        </div>
        <h2 className="text-3xl font-bold mt-5 text-slate-100">Rank Up!</h2>
        <p className="mt-2 text-slate-400">Congratulations on reaching</p>
        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <p 
            className="text-3xl font-bold"
            style={{ color: rankInfo.color }}
          >
            {rankInfo.name} Rank
          </p>
          <p className="text-sm text-slate-400 mt-2">{rankInfo.description}</p>
        </div>
        {pointsAwarded > 0 && (
          <div className="mt-4 p-3 bg-brand-orange-500/20 rounded-lg border border-brand-orange-500/30">
            <p className="text-sm text-slate-300">Bonus Reward:</p>
            <p className="text-2xl font-bold text-brand-orange-400 mt-1">
              +{pointsAwarded} Points
            </p>
          </div>
        )}
        <button 
          onClick={onClose} 
          className="mt-6 w-full py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-brand-orange-500 hover:bg-brand-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange-500 transition-transform hover:scale-105"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};

