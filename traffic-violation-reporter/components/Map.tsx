import React, { useEffect, useRef, useState } from 'react';
import { ViolationReportData, PoliceStation } from '../types';
import { getCurrentLocation } from '../services/locationService';

declare const L: any;

interface MapProps {
  reports: ViolationReportData[];
  policeStations: PoliceStation[];
}

export const Map: React.FC<MapProps> = ({ reports, policeStations }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const violationMarkersRef = useRef<any[]>([]);
  const policeMarkersRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Check if Leaflet is loaded
  const checkLeafletLoaded = (): boolean => {
    return typeof window !== 'undefined' && typeof (window as any).L !== 'undefined';
  };

  useEffect(() => {
    let isMounted = true;
    
    // Wait for Leaflet to be available
    const initMap = () => {
      if (!checkLeafletLoaded()) {
        // Retry after a short delay
        setTimeout(initMap, 100);
        return;
      }

      if (mapContainerRef.current && !mapRef.current) {
        try {
          const map = (window as any).L.map(mapContainerRef.current, {
            zoomControl: true,
            attributionControl: true
          });
          mapRef.current = map;
          
          (window as any).L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
          }).addTo(map);
          
          const setInitialView = async () => {
            let center: { lat: number, lng: number } = { lat: 12.9254, lng: 77.5151 };
            let zoom = 12;
            try {
              const location = await getCurrentLocation();
              center = { lat: location.latitude, lng: location.longitude };
              zoom = 13;
            } catch (error: any) {
              console.warn(`Could not get user location for map centering: ${error.message}.`);
            }
            if (isMounted && mapRef.current) {
              map.setView([center.lat, center.lng], zoom);
              // Invalidate size to ensure map renders properly
              setTimeout(() => {
                if (mapRef.current) {
                  mapRef.current.invalidateSize();
                  setIsMapReady(true);
                }
              }, 100);
            }
          };
          setInitialView();
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      }
    };

    initMap();

    return () => { 
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady || !checkLeafletLoaded()) return;

    try {
      violationMarkersRef.current.forEach(marker => map.removeLayer(marker));
      violationMarkersRef.current = [];

      const reportsWithLocation = reports.filter(r => r.location);
      
      const L = (window as any).L;
      const bounds: [number, number][] = [];

      reportsWithLocation.forEach(report => {
        if (report.location) {
          const { latitude, longitude } = report.location;
          bounds.push([latitude, longitude]);
          const violationTypes = report.violations.map(v => v.violationType).join(', ');
          const firstVehicle = report.violations[0]?.vehicleDetails;
          const popupContent = `
              <div style="font-family: sans-serif; width: 220px; color: #333;">
                  <img src="${report.imageUrl}" alt="Violation" style="width: 100%; height: 110px; object-fit: cover; border-radius: 4px;" />
                  <div style="padding: 8px 0 2px;">
                      <h4 style="font-weight: bold; margin: 0 0 4px 0; color: #111; font-size: 15px;">${report.violations.length > 0 ? violationTypes : 'No Violation'}</h4>
                      ${firstVehicle ? `<p style="font-size: 13px; color: #555; margin: 0;">${firstVehicle.type} - ${firstVehicle.licensePlate}</p>` : ''}
                  </div>
              </div>`;
          const marker = L.marker([latitude, longitude]).addTo(map).bindPopup(popupContent);
          violationMarkersRef.current.push(marker);
        }
      });

      // Add police stations to bounds if they exist
      policeStations.forEach(station => {
        bounds.push([station.lat, station.lng]);
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else if (reportsWithLocation.length === 0 && policeStations.length === 0) {
        // If no markers, ensure map is visible
        map.invalidateSize();
      }
    } catch (error) {
      console.error('Error adding violation markers:', error);
    }
  }, [reports, isMapReady, policeStations]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady || !checkLeafletLoaded()) return;

    try {
      policeMarkersRef.current.forEach(marker => map.removeLayer(marker));
      policeMarkersRef.current = [];
      
      if (policeStations.length === 0) return;

      const L = (window as any).L;
      const policeIconHTML = `
          <div style="background-color: #1e40af; padding: 6px; border-radius: 8px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" style="width: 20px; height: 20px;">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
          </div>`;
      
      const policeIcon = L.divIcon({
          html: policeIconHTML,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
      });

      const bounds: [number, number][] = [];
      
      policeStations.forEach(station => {
        if (station.lat && station.lng && !isNaN(station.lat) && !isNaN(station.lng)) {
          bounds.push([station.lat, station.lng]);
          const marker = L.marker([station.lat, station.lng], { icon: policeIcon })
              .addTo(map)
              .bindPopup(`<b style="color: #333; font-size: 14px;">${station.name}</b><br/><span style="color: #666; font-size: 12px;">Police Station</span>`);
          policeMarkersRef.current.push(marker);
        }
      });

      // Update bounds to include police stations if there are no violation reports
      if (bounds.length > 0 && reports.filter(r => r.location).length === 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else if (bounds.length > 0) {
        // If we have both reports and stations, refit bounds to include all
        const allBounds: [number, number][] = [...bounds];
        reports.filter(r => r.location).forEach(report => {
          if (report.location) {
            allBounds.push([report.location.latitude, report.location.longitude]);
          }
        });
        if (allBounds.length > 0) {
          map.fitBounds(allBounds, { padding: [50, 50], maxZoom: 15 });
        }
      }

      // Invalidate size to ensure markers are visible
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);
    } catch (error) {
      console.error('Error adding police station markers:', error);
    }
  }, [policeStations, isMapReady, reports]);

  // Add a resize observer to invalidate map size when container changes
  useEffect(() => {
    if (!mapContainerRef.current || !mapRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 100);
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isMapReady]);

  if (!checkLeafletLoaded()) {
    return (
      <div className="h-[600px] w-full rounded-xl shadow-lg border border-slate-700 flex items-center justify-center bg-slate-800">
        <div className="text-center">
          <p className="text-slate-400 mb-2">Loading map...</p>
          <div className="animate-spin h-8 w-8 border-4 border-brand-orange-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
      <div ref={mapContainerRef} className="h-[600px] w-full rounded-xl shadow-lg border border-slate-700 bg-slate-800" style={{ minHeight: '600px' }} />
  );
};