import React, { useState, useMemo, useRef } from 'react';
import { ViolationReportData, PoliceStation } from '../types';
import { ViolationReport } from './ViolationReport';
import { DashboardIcon, MapIcon, ListIcon, SortIcon, ChevronUpDownIcon } from './Icons';
import { Map } from './Map';

interface DashboardPageProps {
  reports: ViolationReportData[];
  policeStations: PoliceStation[];
  onDeleteReport: (reportId: string) => void;
}

interface ViewToggleButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ViewToggleButton: React.FC<ViewToggleButtonProps> = ({ label, icon, isActive, onClick, onMouseEnter }) => {
  const activeClasses = "text-brand-orange-300";
  const inactiveClasses = "text-slate-400";
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`relative z-10 flex items-center justify-center w-full sm:w-auto px-6 py-2.5 text-sm font-bold rounded-full focus:outline-none transition-colors duration-300 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );
}

const severityOrder: { [key in 'High' | 'Medium' | 'Low']: number } = { 'High': 3, 'Medium': 2, 'Low': 1 };

const getMaxSeverity = (report: ViolationReportData): number => {
    if (!report.isViolation || report.violations.length === 0) {
        return 0;
    }
    const severities = report.violations.map(v => severityOrder[v.severity]);
    return Math.max(...severities);
}

// FIX: Define the SortOption type to resolve 'Cannot find name' errors.
type SortOption = 'newest' | 'oldest' | 'severity';

export const DashboardPage: React.FC<DashboardPageProps> = ({ reports, policeStations, onDeleteReport }) => {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  
  const morphRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleViewToggleHover = (e: React.MouseEvent<HTMLButtonElement>) => {
      const target = e.currentTarget;
      const container = containerRef.current;
      const morph = morphRef.current;
      if (!target || !container || !morph) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      morph.style.width = `${targetRect.width}px`;
      morph.style.height = `${targetRect.height}px`;
      morph.style.transform = `translate(${targetRect.left - containerRect.left}px, ${targetRect.top - containerRect.top}px)`;
  };
  
  const handleMouseLeave = () => {
    const container = containerRef.current;
    if (!container) return;
    const activeButton = container.querySelector(`button:nth-child(${view === 'list' ? 1 : 2})`);
    if(activeButton) {
      handleViewToggleHover({currentTarget: activeButton} as React.MouseEvent<HTMLButtonElement>);
    }
  };
  
  React.useEffect(() => {
    handleMouseLeave();
  }, [view]);


  const sortedReports = useMemo(() => {
    const sorted = [...reports];
    switch (sortOption) {
      case 'oldest':
        sorted.sort((a, b) => a.reportId.localeCompare(b.reportId));
        break;
      case 'severity':
        sorted.sort((a, b) => {
          const severityA = getMaxSeverity(a);
          const severityB = getMaxSeverity(b);
          if (severityB !== severityA) {
            return severityB - severityA;
          }
          return b.reportId.localeCompare(a.reportId); // Secondary sort by newest
        });
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => b.reportId.localeCompare(a.reportId));
        break;
    }
    return sorted;
  }, [reports, sortOption]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-slate-800/50 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-700">
        <h2 className="text-4xl font-bold text-center text-brand-orange-300 mb-4">
          Violation Reports Dashboard
        </h2>

        {reports.length > 0 && (
          <div className="flex justify-center my-8">
            <div ref={containerRef} onMouseLeave={handleMouseLeave} className="relative inline-flex items-center rounded-full bg-slate-900 p-1.5 space-x-2">
              <div ref={morphRef} className="morph-bg rounded-full"></div>
              <ViewToggleButton
                label="List View"
                icon={<ListIcon className="w-5 h-5" />}
                isActive={view === 'list'}
                onClick={() => setView('list')}
                onMouseEnter={handleViewToggleHover}
              />
              <ViewToggleButton
                label="Map View"
                icon={<MapIcon className="w-5 h-5" />}
                isActive={view === 'map'}
                onClick={() => setView('map')}
                onMouseEnter={handleViewToggleHover}
              />
            </div>
          </div>
        )}

        {reports.length === 0 ? (
          <div className="text-center py-16 px-6 bg-slate-900/50 rounded-xl mt-8">
            <DashboardIcon className="mx-auto h-20 w-20 text-slate-500" />
            <h3 className="mt-4 text-2xl font-semibold text-slate-200">Your Dashboard is Empty</h3>
            <p className="mt-2 text-md text-slate-400">
              Submit a violation from the Home page to see your reports here.
            </p>
          </div>
        ) : (
          <div>
            {view === 'list' ? (
              <>
                <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                    <h3 className="text-xl font-semibold text-slate-200">All Reports ({reports.length})</h3>
                    <div className="flex items-center space-x-2">
                        <label htmlFor="sort-select" className="text-sm font-medium text-slate-300">Sort by:</label>
                        <div className="relative">
                            <select
                                id="sort-select"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value as SortOption)}
                                className="appearance-none block w-full pl-3 pr-10 py-2 text-base border-slate-600 focus:outline-none focus:ring-brand-orange-500 focus:border-brand-orange-500 sm:text-sm rounded-md shadow-sm bg-slate-700 text-slate-200"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="severity">Severity (High to Low)</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                <ChevronUpDownIcon className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-8">
                  {sortedReports.map((report) => (
                    <ViolationReport key={report.reportId} report={report} onDelete={onDeleteReport} />
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-4">
                <Map reports={reports} policeStations={policeStations} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
