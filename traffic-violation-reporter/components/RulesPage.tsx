import React from 'react';
import { RulesIcon } from './Icons';

interface RuleProps {
  title: string;
  children: React.ReactNode;
}

const Rule: React.FC<RuleProps> = ({ title, children }) => (
  <div className="mb-8 p-6 bg-slate-800 rounded-xl shadow-lg border border-slate-700 transition-all duration-300 hover:shadow-xl hover:border-brand-orange-500/30">
    <h3 className="flex items-center text-2xl font-bold text-brand-orange-400 mb-3">
        <span className="flex items-center justify-center w-10 h-10 mr-4 bg-brand-orange-500/20 rounded-full">
            <RulesIcon className="w-6 h-6 text-brand-orange-400" />
        </span>
        {title}
    </h3>
    <div className="pl-14 text-slate-300 leading-relaxed">
        {children}
    </div>
  </div>
);


export const RulesPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-slate-800/50 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-700">
        <h2 className="text-4xl font-bold text-center text-brand-orange-300 mb-10">
          Traffic Rules & Regulations
        </h2>
        
        <Rule title="Red Light Violation">
          This violation occurs when a vehicle enters an intersection after the traffic signal has turned red. Drivers must stop at the marked stop line or before the crosswalk and remain stopped until the light turns green. Proceeding through a red light is a serious offense that can lead to severe accidents.
        </Rule>

        <Rule title="No Helmet Violation">
          All riders and passengers on motorcycles, scooters, and other two-wheeled motor vehicles are required to wear a standards-compliant safety helmet. The helmet must be properly fastened. This rule is crucial for preventing head injuries in the event of a crash.
        </Rule>

        <Rule title="Wrong Way Violation">
          Driving a vehicle against the direction of traffic on a one-way street or a divided highway is strictly prohibited. Traffic signs and road markings clearly indicate the correct direction of travel. Driving the wrong way can cause head-on collisions, which are often fatal.
        </Rule>

         <p className="text-center text-sm text-slate-400 mt-10 p-4 bg-slate-900/50 rounded-lg">
          <strong>Disclaimer:</strong> This information is for general awareness and is not a substitute for official traffic laws. Always refer to your local traffic authority for complete and up-to-date information.
        </p>
      </div>
    </div>
  );
};