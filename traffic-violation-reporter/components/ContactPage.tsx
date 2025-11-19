import React from 'react';
import { InstagramIcon, TwitterIcon, WhatsappIcon, PhoneIcon } from './Icons';

const ContactItem: React.FC<{ icon: React.ReactNode; title: string; href: string; handle: string }> = ({ icon, title, href, handle }) => (
    <a 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center p-5 bg-slate-800 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out group border border-slate-700"
    >
        <div className="text-brand-orange-400 group-hover:text-brand-orange-300 transition-colors p-3 bg-slate-700/50 rounded-full">
            {icon}
        </div>
        <div className="ml-4">
            <p className="font-semibold text-slate-200 text-lg">{title}</p>
            <p className="text-sm text-brand-teal-400 font-medium">{handle}</p>
        </div>
    </a>
);

export const ContactPage: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="bg-slate-800/50 rounded-2xl shadow-xl p-6 sm:p-8 text-center border border-slate-700">
        <h2 className="text-4xl font-bold text-brand-orange-300 mb-4">Get In Touch</h2>
        <p className="text-slate-300 mb-10 text-lg">
          We're here to help. Reach out to us through any of the channels below.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <ContactItem 
                icon={<InstagramIcon className="w-7 h-7"/>}
                title="Instagram"
                handle="@stranger_strings"
                href="https://instagram.com"
            />
            <ContactItem 
                icon={<TwitterIcon className="w-7 h-7"/>}
                title="Twitter / X"
                handle="@stranger_strings"
                href="https://x.com"
            />
            <ContactItem 
                icon={<WhatsappIcon className="w-7 h-7"/>}
                title="WhatsApp"
                handle="+1 (555) 123-4567"
                href="https://wa.me/15551234567"
            />
            <ContactItem 
                icon={<PhoneIcon className="w-7 h-7"/>}
                title="Phone Support"
                handle="+1 (555) 765-4321"
                href="tel:+15557654321"
            />
        </div>

        <div className="mt-12 pt-8 border-t border-brand-orange-500/20">
            <h3 className="text-2xl font-bold text-brand-orange-300 mb-3">AI for Law Enforcement</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
                This application serves as a proof-of-concept demonstrating how citizen-reported data and AI analysis can assist law enforcement. All generated violation reports are for demonstration purposes and are forwarded to the nearest police station for official review and validation.
            </p>
        </div>
      </div>
    </div>
  );
};