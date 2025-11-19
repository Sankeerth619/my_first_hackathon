import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { Auth } from './Auth';
import { HomeIcon, DashboardIcon, RulesIcon, ContactIcon, GiftIcon, MenuIcon, XIcon, UserIcon, MapIcon } from './Icons';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const NavItem = forwardRef<HTMLLIElement, { page: string; label: string; icon: React.ReactNode; currentPage: string; onNavigate: (page: string) => void; onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => void; }> (({ page, label, icon, currentPage, onNavigate, onMouseEnter }, ref) => {
    const isActive = currentPage === page;
    const activeClasses = "text-white";
    const inactiveClasses = "text-slate-300 hover:text-white";
    return (
        <li ref={ref}>
            <a
                href={`#${page}`}
                onMouseEnter={onMouseEnter}
                onClick={(e) => {
                    e.preventDefault();
                    onNavigate(page);
                }}
                className={`relative z-10 flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${isActive ? activeClasses : inactiveClasses}`}
            >
                <span className="w-5 h-5 mr-2">{icon}</span>
                {label}
            </a>
        </li>
    );
});

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  
  const navRef = useRef<HTMLUListElement>(null);
  const [morphStyle, setMorphStyle] = useState({});
  
  const navItems = [
      { page: "home", label: "Report Violation", icon: <HomeIcon />, condition: true },
      { page: "profile", label: "Profile", icon: <UserIcon />, condition: !!user },
      { page: "dashboard", label: "Dashboard", icon: <DashboardIcon />, condition: true },
      { page: "police-stations", label: "Police Stations", icon: <MapIcon />, condition: true },
      { page: "rewards", label: "Rewards", icon: <GiftIcon />, condition: true },
      { page: "rules", label: "Rules", icon: <RulesIcon />, condition: true },
      { page: "contact", label: "Contact", icon: <ContactIcon />, condition: true },
  ];

  const visibleNavItems = navItems.filter(item => item.condition);

  const moveMorph = (target: HTMLElement | null) => {
      if(!target || !navRef.current) return;
      
      const navRect = navRef.current.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      
      setMorphStyle({
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
          transform: `translate(${targetRect.left - navRect.left}px, ${targetRect.top - navRect.top}px)`,
      });
  };

  useEffect(() => {
    setTimeout(() => {
        const activeItem = navRef.current?.querySelector(`a[href="#${currentPage}"]`)?.parentElement;
        moveMorph(activeItem as HTMLLIElement);
    }, 100);
  }, [currentPage, user]);
  

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      moveMorph(e.currentTarget.parentElement);
  };
  
  const handleMouseLeave = () => {
      const activeItem = navRef.current?.querySelector(`a[href="#${currentPage}"]`)?.parentElement;
      moveMorph(activeItem as HTMLLIElement);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isMobileMenuOpen]);

  const handleMobileNav = (page: string) => {
      onNavigate(page);
      setIsMobileMenuOpen(false);
  }

  return (
    <>
      <header className="w-full bg-slate-900/80 backdrop-blur-lg shadow-md sticky top-0 z-40 mb-8 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="flex-shrink-0 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-400 to-brand-teal-400">
                TrafficAI
              </a>
              <nav className="hidden md:block ml-10">
                <ul ref={navRef} onMouseLeave={handleMouseLeave} className="relative flex items-baseline space-x-2">
                  <div className="morph-bg rounded-full" style={morphStyle}></div>
                  {visibleNavItems.map(item => (
                    <NavItem 
                      key={item.page}
                      page={item.page} 
                      label={item.label} 
                      icon={item.icon} 
                      currentPage={currentPage} 
                      onNavigate={onNavigate} 
                      onMouseEnter={handleMouseEnter}
                    />
                  ))}
                </ul>
              </nav>
            </div>
            <div className="hidden md:block"> <Auth /> </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-brand-orange-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-orange-500"
                aria-controls="mobile-menu" aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div 
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        id="mobile-menu" role="dialog" aria-modal="true"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className={`relative flex flex-col w-4/5 max-w-sm h-full bg-slate-800 shadow-xl transform transition-transform ease-in-out duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                 <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-400 to-brand-teal-400">TrafficAI</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-md text-slate-400 hover:bg-slate-700">
                    <span className="sr-only">Close menu</span>
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
            <nav className="flex-grow p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {visibleNavItems.map(item => (
                        <li key={item.page}>
                            <a
                                href={`#${item.page}`}
                                onClick={(e) => { e.preventDefault(); handleMobileNav(item.page); }}
                                className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${currentPage === item.page ? 'bg-brand-orange-500/20 text-brand-orange-300' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                            >
                                <span className="w-6 h-6 mr-3">{item.icon}</span>
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex-shrink-0"> <Auth /> </div>
        </div>
      </div>
    </>
  );
};