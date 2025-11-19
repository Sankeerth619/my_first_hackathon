import React from 'react';
import { PoliceStation } from '../types';
import { Map } from './Map';
import { ViolationReportData } from '../types';

interface PoliceStationsPageProps {
  policeStations: PoliceStation[];
  reports: ViolationReportData[];
}

export const PoliceStationsPage: React.FC<PoliceStationsPageProps> = ({ policeStations, reports }) => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-slate-800/50 rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-700">
        <h2 className="text-4xl font-bold text-center text-brand-orange-300 mb-4">
          Nearby Police Stations
        </h2>
        <p className="text-center text-slate-400 mb-8">
          View police stations near reported violations on the map below
        </p>

        {policeStations.length === 0 ? (
          <div className="text-center py-16 px-6 bg-slate-900/50 rounded-xl">
            <p className="text-xl font-semibold text-slate-200">No Police Stations Found</p>
            <p className="mt-2 text-md text-slate-400">
              Submit a violation report to see nearby police stations.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-slate-200 mb-4">
                Stations ({policeStations.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {policeStations.map((station, index) => (
                  <div
                    key={index}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-brand-orange-500/50 transition-colors"
                  >
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="white"
                          viewBox="0 0 24 24"
                          className="w-6 h-6"
                        >
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-100">{station.name}</h4>
                        <p className="text-sm text-slate-400 mt-1">
                          Lat: {station.lat.toFixed(4)}, Lng: {station.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8">
              <Map reports={reports} policeStations={policeStations} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

