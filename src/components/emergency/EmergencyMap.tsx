import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Shield, Users, Radio, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

export interface MapMarkerEntity {
  id: string;
  type: 'user' | 'police' | 'volunteer' | 'medical';
  title: string;
  distance: string;
  status: string;
  verification: string;
  lat: number;
  lng: number;
  isSimulated?: boolean;
}

interface EmergencyMapProps {
  userLocation: { lat: number; lng: number; address: string };
  isSosActive: boolean;
  onSelectEntity?: (entity: MapMarkerEntity) => void;
}

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  userLocation,
  isSosActive,
  onSelectEntity,
}) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedEntity, setSelectedEntity] = useState<MapMarkerEntity | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<string>('Live (4.8m high precision)');

  // Nearby responders & verified volunteers generated relative to user location
  const responders: MapMarkerEntity[] = [
    {
      id: 'entity-user',
      type: 'user',
      title: 'Current Citizen Location',
      distance: '0 m (You)',
      status: isSosActive ? 'Emergency Active' : 'Safe',
      verification: 'Authenticated Citizen',
      lat: userLocation.lat,
      lng: userLocation.lng,
    },
    {
      id: 'entity-police-1',
      type: 'police',
      title: 'PCR-18 Patrol Cruiser (Andheri West)',
      distance: '0.7 km away',
      status: 'Responding (ETA: ~3 mins)',
      verification: 'Official 112 Police Dispatch',
      lat: userLocation.lat + 0.0042,
      lng: userLocation.lng - 0.0035,
      isSimulated: true,
    },
    {
      id: 'entity-vol-1',
      type: 'volunteer',
      title: 'Verified Volunteer (Escort Unit)',
      distance: '320 m away',
      status: 'Available & Alerted',
      verification: 'Background & Aadhaar Verified',
      lat: userLocation.lat - 0.0021,
      lng: userLocation.lng + 0.0019,
      isSimulated: true,
    },
    {
      id: 'entity-vol-2',
      type: 'volunteer',
      title: 'Verified Volunteer',
      distance: '850 m away',
      status: 'Available',
      verification: 'Identity Protected & Verified',
      lat: userLocation.lat + 0.0051,
      lng: userLocation.lng + 0.0042,
      isSimulated: true,
    },
    {
      id: 'entity-med-1',
      type: 'medical',
      title: 'Emergency Medical First Responder',
      distance: '1.2 km away',
      status: 'Standby / On Call',
      verification: 'Civil Emergency Unit',
      lat: userLocation.lat - 0.0062,
      lng: userLocation.lng - 0.0055,
      isSimulated: true,
    },
  ];

  // Initialize interactive Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Attribution small text at corner
      L.control
        .attribution({ position: 'bottomright', prefix: '© OpenStreetMap contributors' })
        .addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (map) {
      map.setView([userLocation.lat, userLocation.lng], 15);
    }

    return () => {
      // Map cleanup on unmount
    };
  }, []);

  // Update map markers when userLocation or responders change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // Add safe radius circle around user
    L.circle([userLocation.lat, userLocation.lng], {
      color: '#e11d48',
      fillColor: '#f43f5e',
      fillOpacity: 0.12,
      radius: 400,
      weight: 1.5,
      dashArray: '4, 6',
    }).addTo(markersLayer);

    responders.forEach((item) => {
      let iconHtml = '';
      if (item.type === 'user') {
        iconHtml = `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-9 w-9 animate-ping rounded-full bg-rose-500 opacity-75"></span>
            <div class="relative flex items-center justify-center w-7 h-7 bg-rose-600 border-2 border-white rounded-full shadow-lg text-white font-bold text-[10px]">
              YOU
            </div>
          </div>
        `;
      } else if (item.type === 'police') {
        iconHtml = `
          <div class="flex items-center justify-center w-8 h-8 bg-blue-600 border-2 border-white rounded-full shadow-md text-white text-xs font-bold ring-2 ring-blue-300">
            👮
          </div>
        `;
      } else if (item.type === 'volunteer') {
        iconHtml = `
          <div class="flex items-center justify-center w-8 h-8 bg-emerald-600 border-2 border-white rounded-full shadow-md text-white text-xs font-bold ring-2 ring-emerald-300">
            🤝
          </div>
        `;
      } else {
        iconHtml = `
          <div class="flex items-center justify-center w-8 h-8 bg-amber-600 border-2 border-white rounded-full shadow-md text-white text-xs font-bold ring-2 ring-amber-300">
            🚑
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-emergency-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 170px; line-height: 1.4;">
          <div style="font-weight: 700; color: #1c1917; margin-bottom: 2px;">${item.title}</div>
          <div style="color: #44403c; margin-bottom: 4px;"><strong>Distance:</strong> ${item.distance}</div>
          <div style="color: #059669; font-weight: 600; margin-bottom: 2px;">${item.status}</div>
          <div style="font-size: 10px; color: #78716c;">${item.verification}</div>
          ${item.isSimulated ? '<div style="font-size: 9px; color: #ea580c; margin-top: 4px;">[DEMO / SIMULATED LOCATION]</div>' : ''}
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedEntity(item);
        if (onSelectEntity) onSelectEntity(item);
      });

      marker.addTo(markersLayer);
    });
  }, [userLocation, isSosActive]);

  const handleCenterUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
    }
  };

  const handleSelectResponder = (item: MapMarkerEntity) => {
    setSelectedEntity(item);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([item.lat, item.lng], 16, { animate: true });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col">
      {/* Top Map Header */}
      <div className="p-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              {t('interactive_map_title')}
              <span className="text-[10px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Live OpenStreetMap
              </span>
            </h3>
            <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
              <span>{userLocation.address}</span>
              <span>·</span>
              <span className="text-emerald-700 font-medium">GPS: {gpsAccuracy}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCenterUser}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-rose-600" />
            <span>Center on Me</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Box */}
      <div className="relative w-full h-[380px] sm:h-[440px] bg-stone-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Legend Overlay on Map */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-stone-200/90 shadow-md text-xs space-y-1.5 max-w-[240px]">
          <div className="text-[11px] font-bold text-stone-800 uppercase tracking-wider mb-1">
            Map Legend
          </div>
          <div className="flex items-center gap-2 text-stone-700">
            <span className="w-3 h-3 rounded-full bg-rose-600 border border-white shrink-0"></span>
            <span>🔴 You (Current Live Location)</span>
          </div>
          <div className="flex items-center gap-2 text-stone-700">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shrink-0"></span>
            <span>🔵 Police Station / PCR Cruiser</span>
          </div>
          <div className="flex items-center gap-2 text-stone-700">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shrink-0"></span>
            <span>🟢 Verified Volunteer (Privacy Protected)</span>
          </div>
        </div>
      </div>

      {/* Responders & Volunteers Distance List */}
      <div className="p-4 bg-stone-50 border-t border-stone-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            {t('nearest_help_title')}
          </h4>
          <span className="text-[11px] text-stone-400">
            Tap a responder to inspect on map
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {responders.filter((r) => r.type !== 'user').map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectResponder(item)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedEntity?.id === item.id
                  ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                  : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-stone-900 truncate">
                  {item.title}
                </span>
                <span className="text-[10px] font-extrabold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded shrink-0">
                  {item.distance}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span className="truncate">{item.status}</span>
              </div>
              <div className="text-[10px] text-stone-500 mt-1 truncate">
                {item.verification}
              </div>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-stone-500 mt-3 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>{t('volunteer_privacy_notice')}</span>
          <span className="text-orange-600 font-semibold">[SIMULATED DISPATCH FOR PROTOTYPE]</span>
        </p>
      </div>
    </div>
  );
};
