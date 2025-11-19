import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { StarIcon, UserIcon } from './Icons';
import { RANKS } from '../types';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 text-center">
         <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-slate-100">Access Denied</h2>
            <p className="mt-2 text-slate-400">You must be logged in to view your profile page.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
        <div className="p-8 bg-brand-orange-600 relative">
            <div className="flex justify-center">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/80 shadow-lg">
                    <UserIcon className="w-20 h-20 text-white" />
                </div>
            </div>
        </div>
        <div className="p-8 text-center">
            <h2 className="text-4xl font-extrabold text-slate-100 -mt-16 bg-slate-800 inline-block px-4 rounded-full shadow-md">{user.username}</h2>
            <p className="mt-4 text-slate-400 text-lg">TrafficAI Community Member</p>
            
            {/* Rank Display */}
            <div className="mt-6">
                <div 
                    className="inline-flex items-center px-6 py-3 rounded-full shadow-lg border-2"
                    style={{ 
                        backgroundColor: `${RANKS[user.rank].color}20`,
                        borderColor: RANKS[user.rank].color,
                        color: RANKS[user.rank].color
                    }}
                >
                    <span className="text-2xl font-bold mr-2">{RANKS[user.rank].name}</span>
                    <span className="text-sm font-medium">Rank</span>
                </div>
                <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto">
                    {RANKS[user.rank].description}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                    {user.violationCount} violation{user.violationCount !== 1 ? 's' : ''} submitted
                </p>
            </div>
            
            <div className="mt-8 border-t border-slate-700 pt-8">
                <h3 className="text-xl font-bold text-slate-200">Your Stats</h3>
                <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
                     <div className="inline-block p-1 bg-brand-orange-500 rounded-full shadow-lg">
                        <div className="flex items-center px-8 py-4 bg-slate-800 rounded-full">
                            <StarIcon className="w-10 h-10 mr-4 text-yellow-400" />
                            <div>
                                <span className="text-4xl font-bold text-slate-100">{user.points.toLocaleString()}</span>
                                <p className="text-sm font-medium text-slate-400">Total Points</p>
                            </div>
                        </div>
                    </div>
                    <div className="inline-block p-1 bg-brand-orange-500 rounded-full shadow-lg">
                        <div className="flex items-center px-8 py-4 bg-slate-800 rounded-full">
                            <div className="w-10 h-10 mr-4 flex items-center justify-center rounded-full" style={{ backgroundColor: `${RANKS[user.rank].color}30` }}>
                                <span className="text-xl font-bold" style={{ color: RANKS[user.rank].color }}>{user.violationCount}</span>
                            </div>
                            <div>
                                <span className="text-4xl font-bold text-slate-100">{user.violationCount}</span>
                                <p className="text-sm font-medium text-slate-400">Violations</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rank Progress */}
            <div className="mt-8 border-t border-slate-700 pt-8">
                <h3 className="text-xl font-bold text-slate-200 mb-4">Rank Progress</h3>
                <div className="space-y-3">
                    {Object.entries(RANKS).map(([rankKey, rankInfo]) => {
                        const isCurrentRank = user.rank === rankKey;
                        const isUnlocked = user.violationCount >= rankInfo.violationsRequired;
                        const nextRank = Object.entries(RANKS).find(([_, info]) => info.violationsRequired > user.violationCount);
                        const progress = nextRank 
                            ? Math.min(100, (user.violationCount / nextRank[1].violationsRequired) * 100)
                            : 100;
                        
                        return (
                            <div 
                                key={rankKey}
                                className={`p-3 rounded-lg border-2 ${
                                    isCurrentRank 
                                        ? 'border-brand-orange-500 bg-brand-orange-500/10' 
                                        : isUnlocked 
                                        ? 'border-slate-600 bg-slate-700/50' 
                                        : 'border-slate-700 bg-slate-800/50 opacity-50'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <div 
                                            className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                                            style={{ backgroundColor: isCurrentRank ? rankInfo.color : rankInfo.color + '40' }}
                                        >
                                            <span className="text-xs font-bold text-white">{rankInfo.name.charAt(0)}</span>
                                        </div>
                                        <span 
                                            className="font-semibold"
                                            style={{ color: isCurrentRank ? rankInfo.color : 'inherit' }}
                                        >
                                            {rankInfo.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400">{rankInfo.violationsRequired} violations</span>
                                </div>
                                {isCurrentRank && nextRank && (
                                    <div className="mt-2">
                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                            <div 
                                                className="bg-brand-orange-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {nextRank[1].violationsRequired - user.violationCount} more to reach {nextRank[1].name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

             <div className="mt-8 text-sm text-slate-500">
                <p>Thank you for helping keep our roads safe!</p>
            </div>
        </div>
      </div>
    </div>
  );
};