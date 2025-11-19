import React, { useState } from 'react';
import { ViolationReportData, ViolationInstance } from '../types';
import { CarIcon, MotorcycleIcon, LicensePlateIcon, PaletteIcon, SunIcon, MoonIcon, CloudIcon, RoadIcon, GaugeIcon, TrashIcon, XIcon } from './Icons';

interface ViolationReportProps {
  report: ViolationReportData;
  onDelete?: (reportId: string) => void;
}

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string | undefined }> = ({ icon, label, value }) => (
    <div className="flex items-start p-3 bg-slate-900/70 rounded-xl">
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-brand-orange-500/20 text-brand-orange-400">
            {icon}
        </div>
        <div className="ml-3">
            <dt className="text-sm font-medium text-slate-400">{label}</dt>
            <dd className="text-sm text-slate-100 font-semibold">{value || 'N/A'}</dd>
        </div>
    </div>
);

const VehicleIcon: React.FC<{ type: string }> = ({ type }) => {
    const className = "w-6 h-6";
    switch(type.toLowerCase()){
        case 'car':
        case 'suv':
        case 'truck':
             return <CarIcon className={className} />;
        case 'motorcycle':
        case 'scooter':
             return <MotorcycleIcon className={className} />;
        default:
             return <CarIcon className={className} />;
    }
}

const SeverityPill: React.FC<{ severity: 'Low' | 'Medium' | 'High' }> = ({ severity }) => {
  const severityStyles = {
    Low: { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400' },
    Medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', dot: 'bg-yellow-400' },
    High: { bg: 'bg-red-500/20', text: 'text-red-300', dot: 'bg-red-400' },
  };
  const styles = severityStyles[severity];

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles.bg} ${styles.text}`}>
      <span className={`w-2.5 h-2.5 mr-2 rounded-full ${styles.dot}`}></span>
      {severity}
    </div>
  );
};

const ConfidenceMeter: React.FC<{ score: number }> = ({ score }) => {
  const percentage = Math.round(score * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-slate-300">Confidence</span>
        <span className="text-sm font-bold text-brand-teal-300">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div className="bg-gradient-to-r from-brand-teal-500 to-brand-teal-400 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const ViolationDetail: React.FC<{ violation: ViolationInstance, index: number }> = ({ violation, index }) => {
  return (
    <div className="mt-6 border-t-2 border-dashed border-slate-700 pt-6">
      <h4 className="text-lg font-bold text-brand-orange-400 mb-3">Violation #{index + 1}: {violation.violationType}</h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-4">
        <div>
          <ConfidenceMeter score={violation.confidenceScore} />
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-sm font-medium text-slate-300 mb-1">Severity</span>
          <SeverityPill severity={violation.severity} />
        </div>
      </div>

      <p className="text-sm text-slate-300 bg-slate-700/50 p-3 rounded-md italic mb-4">"{violation.reasoning}"</p>

      <h5 className="font-semibold text-slate-200 mb-2">Evidence Details</h5>
      <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <DetailItem icon={<VehicleIcon type={violation.vehicleDetails.type}/>} label="Vehicle Type" value={violation.vehicleDetails.type} />
        <DetailItem icon={<PaletteIcon className="w-6 h-6"/>} label="Vehicle Color" value={violation.vehicleDetails.color} />
        <DetailItem icon={<LicensePlateIcon className="w-6 h-6"/>} label="License Plate" value={violation.vehicleDetails.licensePlate} />
      </dl>
    </div>
  );
};


export const ViolationReport: React.FC<ViolationReportProps> = ({ report, onDelete }) => {
  const { imageUrl, mediaType = 'image', videoUrl, isViolation, violations, summaryReasoning, location, reportId, environment } = report;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const headerBg = isViolation ? 'bg-gradient-to-r from-red-600 to-rose-700' : 'bg-gradient-to-r from-brand-teal-600 to-emerald-700';
  const headerText = isViolation ? 'Violation(s) Detected' : 'No Violation Detected';
  const headerSubtext = isViolation ? `${violations.length} issue(s) identified` : 'All Clear';

  const TimeIcon = environment.timeOfDay === 'Night' ? MoonIcon : SunIcon;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(reportId);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-slate-800 shadow-xl rounded-2xl overflow-hidden my-4 animate-fade-in-up transition-all duration-300 ease-in-out hover:shadow-2xl border border-slate-700 hover:border-brand-orange-500/50 relative">
      {onDelete && (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="absolute top-4 right-4 z-10 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
          title="Delete this report"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      )}
      
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center rounded-2xl">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md mx-4 border border-slate-700">
            <h3 className="text-xl font-bold text-slate-100 mb-2">Delete Report?</h3>
            <p className="text-slate-400 mb-4">Are you sure you want to delete this violation report? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="md:flex">
        <div className="md:w-1/3 overflow-hidden">
          {mediaType === 'video' && videoUrl ? (
            <video 
              className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-110" 
              src={videoUrl} 
              controls
              poster={imageUrl}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-110" src={imageUrl} alt="Traffic violation scene" />
          )}
        </div>
        <div className="p-6 md:w-2/3 flex flex-col">
          <div className={`${headerBg} text-white p-4 rounded-lg -mt-10 mx-4 shadow-lg`}>
              <span className="text-xs uppercase font-bold tracking-wider">{headerText}</span>
              <p className="text-2xl font-bold">{headerSubtext}</p>
          </div>

          <div className="mt-6">
             <h4 className="font-semibold text-slate-200">Analyst's Summary:</h4>
             <p className="mt-1 text-sm text-slate-300 bg-slate-700/50 p-3 rounded-md italic">"{summaryReasoning}"</p>
          </div>

          {isViolation && violations.map((violation, index) => (
            <ViolationDetail key={index} violation={violation} index={index} />
          ))}
          
          <div className="mt-6 border-t border-slate-700 pt-6">
             <h4 className="font-semibold text-slate-200 mb-3">Environmental Context</h4>
             <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DetailItem icon={<TimeIcon className="w-6 h-6"/>} label="Time of Day" value={environment.timeOfDay} />
                <DetailItem icon={<CloudIcon className="w-6 h-6"/>} label="Weather" value={environment.weather} />
                <DetailItem icon={<RoadIcon className="w-6 h-6"/>} label="Road Type" value={environment.roadType} />
             </dl>
          </div>

          <div className="mt-6 text-xs text-slate-500 border-t border-slate-700 pt-4">
             <p>Location: {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'Not available'}</p>
             <p>Report ID: {reportId}</p>
             <p>Media Type: {mediaType === 'video' ? 'Video' : 'Image'}</p>
             {report.username && <p>Reported by: {report.username}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};