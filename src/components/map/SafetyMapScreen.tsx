import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Shield,
  Users,
  Radio,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  PhoneCall,
  Clock,
  Video,
  XCircle,
  LocateFixed,
  Compass,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Incident, EmergencyContact } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { EmergencyCameraCapture } from '../emergency/EmergencyCameraCapture';

export type MapFilterCategory = 'all' | 'police' | 'volunteer' | 'medical' | 'hazard';

export interface SafetyMapEntity {
  id: string;
  type: 'user' | 'police' | 'volunteer' | 'medical' | 'hazard';
  title: string;
  categoryLabel: string;
  distance: string;
  rawDistanceMeters: number;
  status: string;
  verification: string;
  lat: number;
  lng: number;
  address: string;
  contact?: string;
  isSimulated?: boolean;
}

interface DemoCity {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

const DEMO_CITIES: DemoCity[] = [
  { name: 'Mumbai (Andheri West)', lat: 19.1136, lng: 72.8697, address: 'SV Road, Andheri West, Mumbai, MH' },
  { name: 'Delhi (Connaught Place)', lat: 28.6315, lng: 77.2167, address: 'Radial Rd 3, Connaught Place, New Delhi' },
  { name: 'Bengaluru (Koramangala)', lat: 12.9352, lng: 77.6245, address: '80 Feet Road, Koramangala 4th Block, Bengaluru' },
  { name: 'Hyderabad (Banjara Hills)', lat: 17.4156, lng: 78.4354, address: 'Road No. 12, Banjara Hills, Hyderabad, TS' },
];

interface SafetyMapScreenProps {
  isSosActive: boolean;
  activeIncident: Incident | null;
  onTriggerSos: (reason?: string) => void;
  onCancelSos: () => void;
  contacts: EmergencyContact[];
}

export const SafetyMapScreen: React.FC<SafetyMapScreenProps> = ({
  isSosActive,
  activeIncident,
  onCancelSos,
  contacts,
}) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // User location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string; isReal: boolean }>({
    lat: 19.1136,
    lng: 72.8697,
    address: 'SV Road, Andheri West, Mumbai, MH',
    isReal: false,
  });

  const [activeFilter, setActiveFilter] = useState<MapFilterCategory>('all');
  const [selectedEntity, setSelectedEntity] = useState<SafetyMapEntity | null>(null);
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'granted' | 'denied' | 'requesting'>('prompt');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedCityName, setSelectedCityName] = useState<string>('Mumbai');

  // Emergency elapsed timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Request actual device location
  const requestDeviceLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      setLocationError('Geolocation API is not supported by your browser.');
      return;
    }

    setLocationStatus('requesting');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: `Your Device GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
          isReal: true,
        });
        setLocationStatus('granted');
        setSelectedCityName('Current Device Location');
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true });
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocationStatus('denied');
        setLocationError(t('map_location_denied'));
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    // Attempt location request on mount
    requestDeviceLocation();
  }, []);

  // Emergency timer
  useEffect(() => {
    let timer: any = null;
    if (isSosActive) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSosActive]);

  // Handle switching to a demo city
  const handleSelectDemoCity = (city: DemoCity) => {
    setUserLocation({
      lat: city.lat,
      lng: city.lng,
      address: city.address,
      isReal: false,
    });
    setSelectedCityName(city.name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([city.lat, city.lng], 15, { animate: true });
    }
  };

  // Generate dynamic nearby responders around current user location
  const nearbyEntities: SafetyMapEntity[] = [
    {
      id: 'entity-user',
      type: 'user',
      title: t('map_current_location'),
      categoryLabel: t('map_current_location'),
      distance: '0 m (You)',
      rawDistanceMeters: 0,
      status: isSosActive ? 'Emergency Active' : 'Safe / Active Protection',
      verification: 'Authenticated Citizen Session',
      lat: userLocation.lat,
      lng: userLocation.lng,
      address: userLocation.address,
      isSimulated: !userLocation.isReal,
    },
    {
      id: 'entity-police-1',
      type: 'police',
      title: 'PCR-18 Patrol Cruiser (Area Beat 4)',
      categoryLabel: t('map_police'),
      distance: '0.7 km away',
      rawDistanceMeters: 700,
      status: isSosActive ? 'Dispatched & En Route (~2 mins ETA)' : 'Active Mobile Beat Patrol',
      verification: 'Official 112 Police Dispatch',
      lat: userLocation.lat + (isSosActive ? 0.0022 : 0.0045),
      lng: userLocation.lng - (isSosActive ? 0.0018 : 0.0038),
      address: 'Near Sector Junction, Patrol Beat 4',
      contact: '112 / PCR Dispatch',
      isSimulated: true,
    },
    {
      id: 'entity-police-2',
      type: 'police',
      title: 'Local Police Station (Women Help Desk)',
      categoryLabel: t('map_police'),
      distance: '1.4 km away',
      rawDistanceMeters: 1400,
      status: 'Open 24/7 · Women Help Desk Active',
      verification: 'Sub-Divisional Police Headquarters',
      lat: userLocation.lat - 0.0085,
      lng: userLocation.lng + 0.0062,
      address: 'Police Station Complex, Station Road',
      contact: '022-2620-1122',
      isSimulated: true,
    },
    {
      id: 'entity-vol-1',
      type: 'volunteer',
      title: 'Verified Volunteer (Community Escort)',
      categoryLabel: t('map_volunteers'),
      distance: 'Approx. 320 m away',
      rawDistanceMeters: 320,
      status: isSosActive ? 'Alerted & Standing By' : 'Available for Safe Walk Escort',
      verification: '✓ Identity Verified (Govt ID + Safety Training)',
      lat: userLocation.lat - 0.0019,
      lng: userLocation.lng + 0.0017,
      address: 'Approximate Location (Protected for Volunteer Safety)',
      isSimulated: true,
    },
    {
      id: 'entity-vol-2',
      type: 'volunteer',
      title: 'Verified Volunteer',
      categoryLabel: t('map_volunteers'),
      distance: 'Approx. 850 m away',
      rawDistanceMeters: 850,
      status: 'Available',
      verification: '✓ Identity Verified (Aadhaar + Background Clearance)',
      lat: userLocation.lat + 0.0054,
      lng: userLocation.lng + 0.0041,
      address: 'Approximate Location (Protected)',
      isSimulated: true,
    },
    {
      id: 'entity-med-1',
      type: 'medical',
      title: 'District Civil Hospital & Sakhi One Stop Centre',
      categoryLabel: t('map_medical'),
      distance: '1.1 km away',
      rawDistanceMeters: 1100,
      status: '24/7 Trauma & Women Emergency Care',
      verification: 'Govt. Accredited Health Facility',
      lat: userLocation.lat + 0.0068,
      lng: userLocation.lng - 0.0052,
      address: 'Civil Hospital Enclave, Emergency Gate 2',
      contact: '108 / 181',
      isSimulated: true,
    },
    {
      id: 'entity-hazard-1',
      type: 'hazard',
      title: 'Civic Safety Alert: Non-functional Streetlights',
      categoryLabel: t('map_safety_alerts'),
      distance: '450 m away',
      rawDistanceMeters: 450,
      status: 'Active Alert · Beat Marshal Stationed',
      verification: 'Verified by Municipal Beat & Citizen Reports',
      lat: userLocation.lat + 0.0028,
      lng: userLocation.lng + 0.0032,
      address: 'West Alley Transit Walkway',
      isSimulated: true,
    },
  ];

  // Filter entities according to active tab
  const filteredEntities = nearbyEntities.filter((entity) => {
    if (activeFilter === 'all') return true;
    if (entity.type === 'user') return true;
    if (activeFilter === 'police') return entity.type === 'police';
    if (activeFilter === 'volunteer') return entity.type === 'volunteer';
    if (activeFilter === 'medical') return entity.type === 'medical';
    if (activeFilter === 'hazard') return entity.type === 'hazard';
    return true;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Attribution control at bottom right
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
  }, [userLocation.lat, userLocation.lng]);

  // Render markers whenever filters, location or emergency state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // Circle radius around user (400m emergency / safe aura)
    L.circle([userLocation.lat, userLocation.lng], {
      color: isSosActive ? '#e11d48' : '#3b82f6',
      fillColor: isSosActive ? '#f43f5e' : '#60a5fa',
      fillOpacity: isSosActive ? 0.16 : 0.08,
      radius: 400,
      weight: 1.5,
      dashArray: '5, 8',
    }).addTo(markersLayer);

    filteredEntities.forEach((item) => {
      let iconHtml = '';
      if (item.type === 'user') {
        iconHtml = `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-9 w-9 animate-ping rounded-full bg-rose-500 opacity-75"></span>
            <div class="relative flex items-center justify-center w-8 h-8 bg-rose-600 border-2 border-white rounded-full shadow-lg text-white font-black text-[10px]">
              YOU
            </div>
          </div>
        `;
      } else if (item.type === 'police') {
        iconHtml = `
          <div class="flex items-center justify-center w-8 h-8 bg-blue-600 border-2 border-white rounded-full shadow-md text-white text-sm font-bold ring-2 ring-blue-300">
            👮
          </div>
        `;
      } else if (item.type === 'volunteer') {
        iconHtml = `
          <div class="flex items-center justify-center w-8 h-8 bg-emerald-600 border-2 border-white rounded-full shadow-md text-white text-sm font-bold ring-2 ring-emerald-300">
            🟢
          </div>
        `;
      } else if (item.type === 'medical') {
        iconHtml = `
          <div class="flex items-center justify-center w-8 h-8 bg-rose-700 border-2 border-white rounded-full shadow-md text-white text-sm font-bold ring-2 ring-rose-200">
            🏥
          </div>
        `;
      } else {
        iconHtml = `
          <div class="flex items-center justify-center w-8 h-8 bg-amber-500 border-2 border-white rounded-full shadow-md text-white text-sm font-bold ring-2 ring-amber-200">
            ⚠️
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-safety-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 180px; line-height: 1.45; padding: 2px;">
          <div style="font-size: 10px; font-weight: 700; color: #78716c; text-transform: uppercase;">${item.categoryLabel}</div>
          <div style="font-weight: 700; color: #1c1917; margin-bottom: 2px; font-size: 13px;">${item.title}</div>
          <div style="color: #44403c; margin-bottom: 4px;"><strong>Distance:</strong> ${item.distance}</div>
          <div style="color: #059669; font-weight: 600; margin-bottom: 2px;">${item.status}</div>
          <div style="font-size: 10px; color: #78716c;">${item.verification}</div>
          ${item.isSimulated ? '<div style="font-size: 9px; color: #ea580c; margin-top: 4px; font-weight: 600;">[DEMO / SIMULATED LOCATION]</div>' : ''}
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedEntity(item);
      });

      marker.addTo(markersLayer);
    });
  }, [filteredEntities, isSosActive, userLocation]);

  const handleCenterUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // Format timer
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER & INTRO (Permanent preventive safety tool) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>Proactive Safety Geographic View</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>Safety Map & Nearby Assistance</span>
          </h1>
          <p className="text-xs text-stone-500">
            See verified volunteers, nearby police patrols, emergency clinics, and civic notices around you.
          </p>
        </div>

        {/* Location permission & GPS status */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={requestDeviceLocation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              userLocation.isReal
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
            }`}
          >
            <LocateFixed className="w-3.5 h-3.5 text-rose-600" />
            <span>{userLocation.isReal ? 'Live GPS Active' : 'Acquire My GPS'}</span>
          </button>
        </div>
      </div>

      {/* LOCATION PERMISSION NOTICE / DEMO SELECTOR */}
      {locationStatus === 'denied' && (
        <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 block font-bold">
                {t('map_location_denied')}
              </strong>
              <span className="text-amber-800 text-[11px]">
                Showing nearby safety ecosystem in demo test zones. You can switch demo cities or re-enable device location.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-amber-800 font-bold uppercase">Demo Zones:</span>
            {DEMO_CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => handleSelectDemoCity(city)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors ${
                  selectedCityName === city.name
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-amber-100'
                }`}
              >
                {city.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. EMERGENCY ACTIVE BANNER (IF SOS TRIGGERED) */}
      {isSosActive && (
        <div className="bg-rose-600 text-white rounded-3xl p-5 shadow-lg space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-500/80 pb-3">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-white animate-ping" />
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-wide uppercase">
                  {t('emergency_title')}
                </h2>
                <p className="text-xs text-rose-100">
                  Help is being coordinated. Stay calm; emergency responders and nearby volunteers have your live position.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-black/25 rounded-xl font-mono text-xs font-bold">
                {t('time_elapsed')}: {formatTime(elapsedSeconds)}
              </div>
              <button
                onClick={onCancelSos}
                className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-xl font-black text-xs cursor-pointer shadow-sm transition-colors"
              >
                {t('sos_cancel_safe')}
              </button>
            </div>
          </div>

          {/* Quick Emergency Status Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-rose-50">
            <div className="p-2.5 bg-rose-700/50 rounded-xl border border-rose-400/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-rose-200 block uppercase font-bold">Nearest Help</span>
                <span className="font-bold text-white">Volunteer ~ 320 m · Police ~ 700 m</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>

            <div className="p-2.5 bg-rose-700/50 rounded-xl border border-rose-400/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-rose-200 block uppercase font-bold">Trusted Contacts</span>
                <span className="font-bold text-white">{contacts.length} Contacts Notified via SMS</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>

            <div className="p-2.5 bg-rose-700/50 rounded-xl border border-rose-400/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-rose-200 block uppercase font-bold">Police (112 / PCR)</span>
                <span className="font-bold text-white">PCR-18 Unit Dispatched</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            </div>
          </div>

          {/* Missing Location Warning During Emergency */}
          {!userLocation.isReal && (
            <div className="p-3 bg-black/35 rounded-2xl border border-rose-300/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white text-xs font-bold block">
                    Location permission is required to share your current location.
                  </strong>
                  <span className="text-rose-100 text-[11px]">
                    Emergency incident recorded and trusted contacts alerted. Enable location to transmit exact live GPS coordinates.
                  </span>
                </div>
              </div>
              <button
                onClick={requestDeviceLocation}
                className="px-3.5 py-1.5 bg-white text-rose-800 rounded-xl text-xs font-black self-start sm:self-auto cursor-pointer shadow-xs hover:bg-rose-50 transition-colors"
              >
                Allow Location
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. MAP FILTER PILLS & CATEGORY TOGGLES */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            {t('map_all')} ({nearbyEntities.length - 1})
          </button>

          <button
            onClick={() => setActiveFilter('police')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'police'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white hover:bg-blue-50 text-blue-700 border border-stone-200'
            }`}
          >
            <span>🔵 {t('map_police')}</span>
          </button>

          <button
            onClick={() => setActiveFilter('volunteer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'volunteer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-stone-200'
            }`}
          >
            <span>🟢 {t('map_volunteers')}</span>
          </button>

          <button
            onClick={() => setActiveFilter('medical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'medical'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white hover:bg-rose-50 text-rose-700 border border-stone-200'
            }`}
          >
            <span>🏥 {t('map_medical')}</span>
          </button>

          <button
            onClick={() => setActiveFilter('hazard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'hazard'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white hover:bg-amber-50 text-amber-700 border border-stone-200'
            }`}
          >
            <span>⚠️ {t('map_safety_alerts')}</span>
          </button>
        </div>

        {/* Legend quick helper */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-stone-500 font-medium">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span> You</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Police</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Volunteer</span>
        </div>
      </div>

      {/* 4. MAIN INTERACTIVE MAP CONTAINER */}
      <div className="relative bg-stone-100 rounded-3xl border border-stone-200 overflow-hidden shadow-sm h-[480px] sm:h-[540px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Map Floating Controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            onClick={handleCenterUser}
            title={t('map_recenter')}
            className="w-10 h-10 bg-white/95 backdrop-blur-sm hover:bg-white text-stone-800 rounded-2xl border border-stone-200 shadow-md flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
          >
            <Compass className="w-5 h-5 text-rose-600" />
          </button>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-stone-200 shadow-md overflow-hidden flex flex-col divide-y divide-stone-100">
            <button
              onClick={handleZoomIn}
              className="w-10 h-9 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              className="w-10 h-9 flex items-center justify-center font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
            >
              -
            </button>
          </div>
        </div>

        {/* Bottom Floating Details Card for Selected Entity */}
        {selectedEntity && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-stone-200/90 shadow-lg text-xs space-y-2 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-stone-400 block">
                  {selectedEntity.categoryLabel}
                </span>
                <strong className="text-sm font-bold text-stone-900 block">
                  {selectedEntity.title}
                </strong>
                <span className="text-[11px] text-stone-500">{selectedEntity.distance}</span>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-2 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
              <div className="text-emerald-700 font-semibold">{selectedEntity.status}</div>
              <div className="text-[11px] text-stone-500">{selectedEntity.verification}</div>
              {selectedEntity.isSimulated && (
                <div className="text-[10px] text-amber-700 font-medium">
                  [DEMO / SIMULATED DATA FOR PROTOTYPE]
                </div>
              )}
            </div>

            {selectedEntity.contact && (
              <div className="pt-1 flex items-center justify-between">
                <span className="text-stone-600 font-mono text-[11px] font-bold">
                  {selectedEntity.contact}
                </span>
                <a
                  href={`tel:${selectedEntity.contact.split(' ')[0]}`}
                  className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Call Dispatch</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. BACKGROUND EMERGENCY CAMERA STATUS (DURING SOS ONLY, NO VISIBLE GALLERY) */}
      {isSosActive && (
        <div className="space-y-2">
          <EmergencyCameraCapture
            incidentId={activeIncident?.id || 'ABH-2026-LIVE'}
            isSosActive={isSosActive}
          />
        </div>
      )}

      {/* 6. LIST OF NEARBY VERIFIED RESPONDERS (PREVENTIVE DIRECTORY) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              {t('nearby_safety_shortcut')}
            </h3>
          </div>
          <span className="text-[11px] text-stone-400 font-mono">
            {filteredEntities.length - 1} Responders Nearby
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {filteredEntities
            .filter((e) => e.type !== 'user')
            .map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedEntity(item);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([item.lat, item.lng], 16, { animate: true });
                  }
                }}
                className="p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/80 transition-all cursor-pointer space-y-1.5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {item.type === 'police' && '👮'}
                      {item.type === 'volunteer' && '🟢'}
                      {item.type === 'medical' && '🏥'}
                      {item.type === 'hazard' && '⚠️'}
                    </span>
                    <div>
                      <strong className="text-stone-900 group-hover:text-rose-700 block font-bold">
                        {item.title}
                      </strong>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {item.categoryLabel} · {item.distance}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 line-clamp-1">{item.status}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
