import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import { StarIcon, XIcon, ErrorIcon } from './Icons';

export const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login, signup } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (activeTab === 'login') {
                await login(username, password);
            } else {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match.");
                }
                if (password.length < 6) {
                    throw new Error("Password must be at least 6 characters long.");
                }
                await signup(username, password);
            }
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderForm = () => {
        const commonButtonClasses = "w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-brand-orange-500 hover:bg-brand-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange-500 disabled:bg-slate-600 dark-hover";
        
        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-300">Username</label>
                    <input id="username" name="username" type="text" required value={username} onChange={e => setUsername(e.target.value)} className="mt-1 block w-full px-4 py-2 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-orange-500 focus:border-brand-orange-500 sm:text-sm transition bg-slate-700 text-slate-200" />
                </div>
                <div>
                    <label htmlFor="password-modal" className="block text-sm font-medium text-slate-300">Password</label>
                    <input id="password-modal" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-4 py-2 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-orange-500 focus:border-brand-orange-500 sm:text-sm transition bg-slate-700 text-slate-200" />
                </div>
                {activeTab === 'signup' && (
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300">Confirm Password</label>
                        <input id="confirm-password" name="confirmPassword" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-4 py-2 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-orange-500 focus:border-brand-orange-500 sm:text-sm transition bg-slate-700 text-slate-200" />
                    </div>
                )}
                <button type="submit" disabled={isLoading} className={commonButtonClasses}>
                    {isLoading ? 'Processing...' : (activeTab === 'login' ? 'Log In' : 'Sign Up')}
                </button>
            </form>
        );
    };

    const modalContent = (
        <div 
            className="fixed inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900 z-[9999] flex justify-center items-center p-4 animate-fade-in-up" 
            onClick={onClose}
            style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}
        >
            <div 
                className="bg-slate-800/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-fade-in-up overflow-hidden border border-slate-700" 
                onClick={e => e.stopPropagation()}
                style={{ 
                    margin: 'auto',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
            >
                <div className="relative p-8 sm:p-10">
                     <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-200 transition-colors z-10">
                        <XIcon className="w-7 h-7" />
                    </button>
                    
                    {/* Logo Section */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-orange-500 to-brand-teal-500 rounded-full blur-xl opacity-50"></div>
                                <div className="relative bg-gradient-to-br from-brand-orange-500 to-brand-teal-500 p-4 rounded-full">
                                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-400 to-brand-teal-400 mb-2">
                            TrafficAI
                        </h1>
                         <h2 className="text-2xl font-bold text-brand-orange-400 mt-2">
                            {activeTab === 'login' ? 'Welcome Back!' : 'Create an Account'}
                         </h2>
                        <p className="mt-2 text-sm text-slate-400">{activeTab === 'login' ? 'Log in to your account to continue' : 'Join our community of road safety advocates'}</p>
                    </div>
                    
                    <div className="flex justify-center mb-6">
                      <div className="bg-slate-900 p-1 rounded-full flex space-x-1">
                          <button onClick={() => { setActiveTab('login'); setError(null); }} className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${activeTab === 'login' ? 'bg-slate-700 shadow-md text-brand-orange-300' : 'text-slate-400 hover:text-slate-200'}`}>
                              Log In
                          </button>
                          <button onClick={() => { setActiveTab('signup'); setError(null); }} className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${activeTab === 'signup' ? 'bg-slate-700 shadow-md text-brand-orange-300' : 'text-slate-400 hover:text-slate-200'}`}>
                              Sign Up
                          </button>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-900/50 border border-red-500/30 rounded-lg flex items-center">
                          <ErrorIcon className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
                          <p className="text-sm text-red-200">{error}</p>
                      </div>
                    )}
                    {renderForm()}
                </div>
            </div>
        </div>
    );

    if (!mounted) return null;
    
    return createPortal(modalContent, document.body);
};


export const Auth: React.FC = () => {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    // Cleanup on component unmount
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isModalOpen]);

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-200">Welcome, {user.username}!</p>
            <div className="flex items-center justify-end text-brand-orange-400">
                <StarIcon className="w-4 h-4 mr-1 text-brand-orange-400" />
                <span className="text-sm font-bold">{user.points} Points</span>
            </div>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-semibold text-white bg-brand-orange-500 rounded-full shadow-sm dark-hover"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-5 py-2 text-sm font-bold text-white bg-brand-orange-500 hover:bg-brand-orange-600 rounded-full shadow-md dark-hover"
      >
        Login / Sign Up
      </button>
      {isModalOpen && <AuthModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
};