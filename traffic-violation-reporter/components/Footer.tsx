
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 mt-12 bg-slate-900/50 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} stranger_strings. All rights reserved.</p>
        <p className="mt-1">A demonstration of citizen-led traffic monitoring powered by AI.</p>
      </div>
    </footer>
  );
};