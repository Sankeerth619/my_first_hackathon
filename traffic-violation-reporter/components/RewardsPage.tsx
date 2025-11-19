import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Reward } from '../types';
import { GiftIcon, StarIcon, ErrorIcon, XIcon, SwiggyLogo, MythraLogo } from './Icons';

// Zomato Logo Component
const ZomatoLogo: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#E23744"/>
    <path d="M50 25 L35 50 L50 75 L65 50 Z" fill="#FFFFFF" opacity="0.9"/>
    <circle cx="50" cy="50" r="8" fill="#FFFFFF"/>
  </svg>
);

// Myntra Logo Component
const MyntraLogo: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="15" fill="#FF3F6C"/>
    <path d="M30 30 L50 20 L70 30 L70 50 L50 70 L30 50 Z" fill="#FFFFFF" opacity="0.95"/>
    <path d="M40 40 L50 35 L60 40 L60 50 L50 60 L40 50 Z" fill="#FF3F6C"/>
  </svg>
);

const availableRewards: Reward[] = [
  {
    id: 'zomato-100',
    company: 'Zomato',
    description: '₹100 off on your next order above ₹299.',
    cost: 150,
    promoCode: 'TRAFFICAI-ZOM100',
    iconUrl: '', // Will use component instead
  },
  {
    id: 'swiggy-20',
    company: 'Swiggy',
    description: '20% off up to ₹120 on your next food order.',
    cost: 120,
    promoCode: 'TRAFFICAI-SWIG20',
    iconUrl: '', // Will use component instead
  },
  {
    id: 'myntra-500',
    company: 'Myntra',
    description: 'Flat ₹500 off on a minimum spend of ₹2499.',
    cost: 400,
    promoCode: 'TRAFFICAI-MYN500',
    iconUrl: '', // Will use component instead
  },
];

const RewardCard: React.FC<{ reward: Reward; onRedeem: (reward: Reward) => void; userPoints: number }> = ({ reward, onRedeem, userPoints }) => {
  const canAfford = userPoints >= reward.cost;

  const renderLogo = () => {
    switch (reward.company) {
      case 'Swiggy':
        return <SwiggyLogo className="w-24 h-28" />;
      case 'Zomato':
        return <ZomatoLogo className="w-24 h-24" />;
      case 'Myntra':
        return <MyntraLogo className="w-24 h-24" />;
      default:
        return <GiftIcon className="w-16 h-16 text-brand-orange-400" />;
    }
  };

  return (
    <div className={`bg-slate-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform border border-slate-700 ${!canAfford ? 'opacity-60 grayscale' : 'hover:shadow-2xl hover:-translate-y-2 hover:border-brand-teal-500/50'}`}>
      <div className="p-5 bg-slate-900/50 flex items-center justify-center h-36 border-b border-slate-700">
        {renderLogo()}
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-slate-100">{reward.company}</h3>
        <p className="mt-1 text-sm text-slate-400 h-10">{reward.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center text-brand-orange-400 font-bold text-lg">
            <StarIcon className="w-5 h-5 mr-1" />
            <span>{reward.cost}</span>
          </div>
          <button
            onClick={() => onRedeem(reward)}
            disabled={!canAfford}
            className="px-5 py-2 text-sm font-bold text-white bg-brand-teal-500 rounded-full disabled:bg-slate-600 disabled:cursor-not-allowed shadow-md dark-hover"
          >
            Redeem
          </button>
        </div>
      </div>
    </div>
  );
};

const RewardModal: React.FC<{ reward: Reward; onClose: () => void }> = ({ reward, onClose }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(reward.promoCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fade-in-up" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-md m-4 p-6 sm:p-8 text-center relative transform transition-all animate-fade-in-up border border-slate-700" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
                    <XIcon className="w-6 h-6" />
                </button>
                <GiftIcon className="w-20 h-20 mx-auto text-brand-teal-400 animate-bounce-in" />
                <h2 className="text-3xl font-bold mt-4 text-slate-100">Reward Redeemed!</h2>
                <p className="mt-2 text-slate-400">You've successfully redeemed the {reward.company} reward.</p>
                <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-400">Your Promo Code:</p>
                    <div className="flex items-center justify-center mt-2 space-x-4">
                        <p className="text-2xl font-mono font-bold text-brand-orange-400 tracking-widest">{reward.promoCode}</p>
                        <button onClick={handleCopy} className="px-3 py-1 text-xs font-semibold text-white bg-brand-orange-500 rounded hover:bg-brand-orange-600 w-20">
                           {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
                 <button onClick={onClose} className="mt-6 w-full py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-brand-orange-500 hover:bg-brand-orange-600 dark-hover">
                    Awesome!
                </button>
            </div>
        </div>
    );
};

export const RewardsPage = () => {
  const { user, updateUserPoints } = useAuth();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRedeem = async (reward: Reward) => {
    if (user && user.points >= reward.cost) {
      try {
        await updateUserPoints(-reward.cost);
        setSelectedReward(reward);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'An error occurred while redeeming.');
      }
    } else {
      setError("You don't have enough points to redeem this reward.");
      setTimeout(() => setError(null), 3000); // Clear error after 3s
    }
  };

  const userPoints = user ? user.points : 0;

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="bg-slate-800/50 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-700">
        <div className="text-center">
            <h2 className="text-4xl font-bold text-brand-orange-300">Redeem Your Points</h2>
            <p className="mt-2 text-slate-300 text-lg">Use your points to get exciting rewards from our partners.</p>
            {user && (
                 <div className="mt-6 inline-block p-1 bg-gradient-to-r from-brand-orange-400 to-brand-teal-400 rounded-full shadow-lg">
                    <div className="flex items-center px-6 py-3 bg-slate-800 rounded-full">
                        <StarIcon className="w-8 h-8 mr-3 text-yellow-400" />
                        <div>
                            <span className="text-2xl font-bold text-slate-100">{user.points.toLocaleString()}</span>
                            <span className="ml-2 text-sm font-medium text-slate-400">Points Available</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        {error && (
            <div className="mt-6 p-4 bg-red-900/50 border-l-4 border-red-500 rounded-r-lg flex items-center justify-center">
                <ErrorIcon className="w-6 h-6 text-red-400 mr-3" />
                <p className="text-sm text-red-200 font-medium">{error}</p>
            </div>
        )}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableRewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} onRedeem={handleRedeem} userPoints={userPoints} />
          ))}
        </div>
      </div>
      {selectedReward && <RewardModal reward={selectedReward} onClose={() => setSelectedReward(null)} />}
    </div>
  );
};