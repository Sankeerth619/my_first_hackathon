import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ErrorIcon } from './Icons';

interface LoginSignupPageProps {
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const LoginSignupPage: React.FC<LoginSignupPageProps> = ({ onShowToast }) => {
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
        onShowToast('Welcome back!', 'success');
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }
        await signup(username, password);
        onShowToast('Account created successfully!', 'success');
      }
      // Clear form
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex items-center justify-center min-h-[70vh]">
      <div className="bg-slate-800/50 rounded-2xl shadow-xl overflow-hidden border border-slate-700 w-full">
        <div className="p-8 bg-gradient-to-br from-brand-orange-600 to-brand-orange-700 text-white text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-orange-400 to-brand-teal-400 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-white/10 backdrop-blur-sm p-3 rounded-full border-2 border-white/20">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-orange-100 mb-2">
            TrafficAI
          </h1>
          <h2 className="text-2xl font-bold mt-2">Welcome</h2>
          <p className="mt-2 text-brand-orange-100">Sign in or create an account to get started</p>
        </div>
        
        <div className="p-6 sm:p-8">
          {/* Tab Switcher */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-900 p-1 rounded-full flex space-x-1">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                }}
                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  activeTab === 'login'
                    ? 'bg-brand-orange-500 shadow-md text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setActiveTab('signup');
                  setError(null);
                }}
                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  activeTab === 'signup'
                    ? 'bg-brand-orange-500 shadow-md text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="auth-username" className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                id="auth-username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-slate-600 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-brand-orange-500 sm:text-sm transition bg-slate-700 text-slate-200"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="auth-password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-600 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-brand-orange-500 sm:text-sm transition bg-slate-700 text-slate-200"
                placeholder="Enter your password"
              />
            </div>

            {activeTab === 'signup' && (
              <div>
                <label htmlFor="auth-confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <input
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-brand-orange-500 sm:text-sm transition bg-slate-700 text-slate-200"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-brand-orange-500 hover:bg-brand-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading
                ? 'Processing...'
                : activeTab === 'login'
                ? 'Log In'
                : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

