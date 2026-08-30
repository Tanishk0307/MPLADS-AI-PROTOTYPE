import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Compass,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  IndianRupee,
  MapPin,
  X,
  Radio,
  ShieldCheck,
  Eye,
  ChevronRight,
  Star,
} from 'lucide-react';
import type { AnomalyResult, User } from '@/types/database';
import { formatLakhs } from '@/lib/format';
import { useLanguage } from '@/context/LanguageContext';

interface MapProject {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  coords: [number, number];
}

interface RiskMapProps {
  anomalies: AnomalyResult[];
  allProjects: MapProject[];
  onSelectProject: (projectId: string) => void;
  user?: User | null;
  cdoStarredIds?: string[];
  onToggleCdoStar?: (projectId: string) => void;
}

// Ghaziabad District Bounds & Center
const GHAZIABAD_CENTER: [number, number] = [77.445, 28.672]; // [lng, lat]
const GHAZIABAD_BOUNDS: [[number, number], [number, number]] = [
  [77.16, 28.52], // Southwest: Bordering East Delhi / Noida / Indirapuram
  [77.72, 28.92], // Northeast: Modinagar / Bhojpur / Meerut border
];

// District boundary polygon for visual geo-fence highlight
const GHAZIABAD_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Ghaziabad District Jurisdiction' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.26, 28.78],
            [77.30, 28.84],
            [77.56, 28.88],
            [77.67, 28.86],
            [77.69, 28.76],
            [77.62, 28.64],
            [77.52, 28.58],
            [77.40, 28.58],
            [77.32, 28.61],
            [77.28, 28.66],
            [77.24, 28.72],
            [77.26, 28.78],
          ],
        ],
      },
    },
  ],
};

// 4K Ultra-HD Photorealistic Satellite Style Specification (Zero API Key Required)
const SATELLITE_4K_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri World Imagery 4K Ultra-HD Satellite',
      maxzoom: 19,
    },
    'esri-labels': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 20,
    },
    {
      id: 'labels-layer',
      type: 'raster',
      source: 'esri-labels',
      minzoom: 0,
      maxzoom: 20,
      paint: {
        'raster-opacity': 0.88,
      },
    },
  ],
};

export function RiskMap({
  anomalies,
  allProjects,
  onSelectProject,
  user,
  cdoStarredIds = [],
  onToggleCdoStar,
}: RiskMapProps) {
  const { t, isHindi } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const orbitAnimRef = useRef<number | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [is3D, setIs3D] = useState(true); // 3D Perspective on 4K Satellite
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'MEDIUM' | 'NORMAL' | 'STARRED'>('ALL');
  const [selectedActiveProject, setSelectedActiveProject] = useState<MapProject | null>(null);

  const canPutStar =
    user?.role === 'MP' ||
    user?.role === 'SNA' ||
    user?.role === 'Ministry' ||
    user?.role === 'DM' ||
    user?.role === 'CDO';

  const anomalyMap = useMemo(() => new Map(anomalies.map((a) => [a.projectId, a])), [anomalies]);

  const activeAnomaly = useMemo(() => {
    if (!selectedActiveProject) return null;
    return anomalyMap.get(selectedActiveProject.id) ?? null;
  }, [selectedActiveProject, anomalyMap]);

  const isSelectedProjectStarred = useMemo(() => {
    if (!selectedActiveProject) return false;
    return cdoStarredIds.includes(selectedActiveProject.id);
  }, [selectedActiveProject, cdoStarredIds]);

  // Filter projects by severity or CDO Starred
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      const a = anomalyMap.get(p.id);
      const isStarred = cdoStarredIds.includes(p.id);

      if (filterSeverity === 'STARRED') return isStarred;
      if (filterSeverity === 'ALL') return true;
      if (filterSeverity === 'CRITICAL') return a?.severity === 'CRITICAL';
      if (filterSeverity === 'MEDIUM') return a?.severity === 'MEDIUM';
      if (filterSeverity === 'NORMAL') return !a;
      return true;
    });
  }, [allProjects, anomalyMap, filterSeverity, cdoStarredIds]);

  // Setup District Boundary layer
  const setupBoundary = (map: maplibregl.Map) => {
    if (!map.isStyleLoaded()) return;

    if (!map.getSource('ghaziabad-boundary')) {
      map.addSource('ghaziabad-boundary', {
        type: 'geojson',
        data: GHAZIABAD_GEOJSON,
      });

      map.addLayer({
        id: 'ghaziabad-fill',
        type: 'fill',
        source: 'ghaziabad-boundary',
        paint: {
          'fill-color': '#06b6d4',
          'fill-opacity': 0.07,
        },
      });

      map.addLayer({
        id: 'ghaziabad-line',
        type: 'line',
        source: 'ghaziabad-boundary',
        paint: {
          'line-color': '#22d3ee',
          'line-width': 2.5,
          'line-dasharray': [2, 1],
          'line-opacity': 0.95,
        },
      });
    }
  };

  // Helper to fit map bounds to given project cases
  const fitProjectCases = useCallback((map: maplibregl.Map, projects: MapProject[]) => {
    if (projects.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    projects.forEach((p) => {
      bounds.extend([p.longitude, p.latitude]);
    });

    map.fitBounds(bounds, {
      padding: { top: 70, bottom: 90, left: 60, right: 60 },
      pitch: is3D ? 48 : 0,
      bearing: is3D ? -15 : 0,
      maxZoom: 14.5,
      duration: 1000,
    });
  }, [is3D]);

  // Recenter and fit all cases
  const recenterMap = () => {
    const map = mapRef.current;
    if (!map) return;
    fitProjectCases(map, allProjects);
  };

  // Fly to specific project and open card
  const handleSelectCase = useCallback((p: MapProject) => {
    setSelectedActiveProject(p);
    const map = mapRef.current;
    if (map) {
      map.flyTo({
        center: [p.longitude, p.latitude],
        zoom: 15.5,
        pitch: is3D ? 52 : 0,
        bearing: is3D ? -15 : 0,
        speed: 1.2,
        curve: 1.42,
      });
    }
  }, [is3D]);

  // Handle filter selection
  const handleFilterChange = (type: 'ALL' | 'CRITICAL' | 'MEDIUM' | 'NORMAL' | 'STARRED') => {
    setFilterSeverity(type);
    setSelectedActiveProject(null);

    const map = mapRef.current;
    if (!map) return;

    const matchingProjects = allProjects.filter((p) => {
      const a = anomalyMap.get(p.id);
      const isStarred = cdoStarredIds.includes(p.id);
      if (type === 'STARRED') return isStarred;
      if (type === 'ALL') return true;
      if (type === 'CRITICAL') return a?.severity === 'CRITICAL';
      if (type === 'MEDIUM') return a?.severity === 'MEDIUM';
      if (type === 'NORMAL') return !a;
      return true;
    });

    if (matchingProjects.length > 0) {
      fitProjectCases(map, matchingProjects);
    }
  };

  // Render High-Visibility 4K Satellite Ground Markers
  const renderMarkersOnMap = useCallback((map: maplibregl.Map, projectsList: MapProject[]) => {
    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    projectsList.forEach((p, idx) => {
      const anomaly = anomalyMap.get(p.id);
      const isStarred = cdoStarredIds.includes(p.id);

      let isCritical = false;
      let isMedium = false;

      let dotBg = 'bg-emerald-500';
      let beaconClass = 'pulse-beacon-normal';
      let ringBorder = 'border-white';
      let ringOutline = 'ring-emerald-400';
      let badgeLabel = 'Normal';
      let riskScoreText = '0/100';
      let textColor = 'text-white font-bold';

      if (anomaly) {
        riskScoreText = `${anomaly.riskScore}/100`;
        if (anomaly.severity === 'CRITICAL') {
          isCritical = true;
          dotBg = 'bg-red-600'; // VIVID BRIGHT RED
          beaconClass = 'pulse-beacon-critical';
          ringBorder = 'border-white';
          ringOutline = 'ring-red-400 ring-offset-1 ring-offset-slate-900';
          badgeLabel = `Critical Risk (${riskScoreText})`;
          textColor = 'text-white font-bold';
        } else if (anomaly.severity === 'MEDIUM') {
          isMedium = true;
          dotBg = 'bg-yellow-400'; // BRIGHT YELLOW
          beaconClass = 'pulse-beacon-yellow';
          ringBorder = 'border-white';
          ringOutline = 'ring-yellow-300 ring-offset-1 ring-offset-slate-900';
          badgeLabel = `Medium Risk (${riskScoreText})`;
          textColor = 'text-slate-950 font-black';
        }
      }

      // Create Custom DOM Element for the Dot
      const el = document.createElement('div');
      el.className = 'maplibre-marker-wrap group relative flex items-center justify-center';
      el.style.width = '38px';
      el.style.height = '38px';

      // Inner container with centered anchor
      el.innerHTML = `
        <div class="maplibre-marker-inner relative flex items-center justify-center cursor-pointer">
          <!-- CDO Golden Star Badge Floating on Marker -->
          ${
            isStarred
              ? `<div class="absolute -top-2.5 -right-2 z-20 bg-amber-400 border border-slate-900 rounded-full p-0.5 shadow-lg animate-bounce" title="⭐ Flagged by CDO for Priority Vigilance">
                  <svg class="w-3.5 h-3.5 text-slate-950 fill-current" viewBox="0 0 24 24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>`
              : ''
          }

          <!-- Outer Pulsing Radar Ring & Disc -->
          <div class="w-8 h-8 rounded-full ${dotBg} ${beaconClass} border-2 ${ringBorder} shadow-2xl flex items-center justify-center ring-2 ${ringOutline} ${
            isStarred ? 'ring-amber-300' : ''
          }">
            <span class="${textColor} font-mono text-[12px] drop-shadow-sm">${idx + 1}</span>
          </div>

          <!-- Tooltip on Hover -->
          <div class="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 animate-fade-in-up">
            <div class="bg-slate-950/95 backdrop-blur-md text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap flex items-center gap-1.5">
              ${isStarred ? '<span class="text-amber-400 font-bold">⭐ ' + (isHindi ? 'सांसद द्वारा निरीक्षण' : 'Inspection from MP') + '</span> ·' : ''}
              <span class="w-2.5 h-2.5 rounded-full ${dotBg}"></span>
              <span>${p.name}</span>
              <span class="${isCritical ? 'text-red-400 font-bold' : isMedium ? 'text-yellow-400 font-bold' : 'text-emerald-400'} text-[10px]">
                · ${badgeLabel}
              </span>
            </div>
            <div class="w-2 h-2 bg-slate-950 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
          </div>
        </div>
      `;

      // Click Event
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSelectCase(p);
      });

      // Anchor = 'center' keeps the dot pinned exactly at [lng, lat]
      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([p.longitude, p.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [anomalyMap, cdoStarredIds, handleSelectCase]);

  // Synchronize Markers on filter changes or initial load
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    renderMarkersOnMap(map, filteredProjects);
  }, [mapReady, filteredProjects, renderMarkersOnMap]);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: SATELLITE_4K_STYLE,
      center: GHAZIABAD_CENTER,
      zoom: 11.2,
      pitch: 48, // 3D Perspective angle
      bearing: -15,
      maxBounds: GHAZIABAD_BOUNDS, // Strictly lock navigation within Ghaziabad District
      minZoom: 10.2, // Full district view
      maxZoom: 19.0, // 4K high resolution zoom
      maxPitch: 70,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showCompass: true }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      setupBoundary(map);
      fitProjectCases(map, allProjects);
      renderMarkersOnMap(map, allProjects);
      setMapReady(true);
    });

    map.on('style.load', () => {
      setupBoundary(map);
      renderMarkersOnMap(map, filteredProjects);
    });

    mapRef.current = map;

    return () => {
      if (orbitAnimRef.current) cancelAnimationFrame(orbitAnimRef.current);
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle 3D / 2D perspective toggle
  const toggle3D = () => {
    const map = mapRef.current;
    if (!map) return;
    const nextIs3D = !is3D;
    setIs3D(nextIs3D);

    map.easeTo({
      pitch: nextIs3D ? 48 : 0,
      bearing: nextIs3D ? -15 : 0,
      duration: 800,
    });
  };

  // 360° Cinematic Orbit Mode with Locked Center Coordinates
  const toggleOrbit = () => {
    const map = mapRef.current;
    if (!map) return;

    if (isOrbiting) {
      if (orbitAnimRef.current) cancelAnimationFrame(orbitAnimRef.current);
      setIsOrbiting(false);
    } else {
      setIsOrbiting(true);
      setIs3D(true);
      map.easeTo({ pitch: 48, duration: 400 });

      const center = map.getCenter();
      const fixedLng = center.lng;
      const fixedLat = center.lat;
      let bearing = map.getBearing();

      const rotateCamera = () => {
        if (!mapRef.current) return;
        bearing = (bearing + 0.15) % 360;
        mapRef.current.jumpTo({
          center: [fixedLng, fixedLat],
          bearing: bearing,
        });
        orbitAnimRef.current = requestAnimationFrame(rotateCamera);
      };
      orbitAnimRef.current = requestAnimationFrame(rotateCamera);
    }
  };

  // Stop orbit on manual drag/zoom
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const stopOrbit = () => {
      if (isOrbiting) {
        if (orbitAnimRef.current) cancelAnimationFrame(orbitAnimRef.current);
        setIsOrbiting(false);
      }
    };
    map.on('dragstart', stopOrbit);
    map.on('zoomstart', stopOrbit);
    return () => {
      map.off('dragstart', stopOrbit);
      map.off('zoomstart', stopOrbit);
    };
  }, [isOrbiting]);

  return (
    <div className="isolate relative z-10 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-center">
              <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <span className="text-emerald-400">4K Ultra-HD Satellite Surveillance</span> · Ghaziabad District
            </h3>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              <ShieldCheck className="h-3 w-3 text-cyan-400" /> All {allProjects.length} Cases Monitored
            </span>
            {cdoStarredIds.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/50 text-amber-300">
                <Star className="h-3 w-3 text-amber-400 fill-current" /> {cdoStarredIds.length} {isHindi ? 'सांसद निरीक्षण' : 'Inspection from MP'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>District Boundary: Modinagar · Loni · Sahibabad · Raj Nagar · Vijay Nagar · Kavi Nagar</span>
            <span className="text-cyan-400 font-mono text-[10px]">● Ghaziabad Only</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 3D Perspective Toggle Button */}
          <button
            onClick={toggle3D}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              is3D
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-cyan-900/20 shadow-md'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle 3D perspective pitch (48° / 0°)"
          >
            <Compass className={`h-3.5 w-3.5 ${is3D ? 'text-cyan-400 animate-spin-slow' : ''}`} />
            {is3D ? '3D Satellite (48°)' : '2D Top-Down'}
          </button>

          {/* 360° Cinematic Orbit Mode */}
          <button
            onClick={toggleOrbit}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isOrbiting
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Auto-rotate 360° surveillance camera"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isOrbiting ? 'animate-spin' : ''}`} />
            {isOrbiting ? 'Patrolling...' : 'Orbit Patrol'}
          </button>

          {/* Recenter & Fit All Cases */}
          <button
            onClick={recenterMap}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Fit all Ghaziabad cases in view"
          >
            <MapPin className="h-3.5 w-3.5 text-emerald-400" /> View All Cases
          </button>
        </div>
      </div>

      {/* Filter Ribbon with CDO Starred Filter */}
      <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 text-xs font-bold mr-1">Filter by Risk:</span>
          {(
            [
              {
                key: 'ALL',
                label: 'All Cases',
                count: allProjects.length,
                color: 'hover:border-slate-400',
                activeClass: 'bg-slate-800 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400 shadow-md',
                dotColor: 'bg-slate-400',
              },
              {
                key: 'CRITICAL',
                label: 'Critical (Red)',
                count: anomalies.filter((a) => a.severity === 'CRITICAL').length,
                color: 'hover:border-red-500 text-red-400',
                activeClass: 'bg-red-950/80 border-red-500 text-red-300 ring-2 ring-red-500 shadow-lg font-bold',
                dotColor: 'bg-red-600',
              },
              {
                key: 'MEDIUM',
                label: 'Medium (Yellow)',
                count: anomalies.filter((a) => a.severity === 'MEDIUM').length,
                color: 'hover:border-yellow-400 text-yellow-400',
                activeClass: 'bg-yellow-950/80 border-yellow-400 text-yellow-300 ring-2 ring-yellow-400 shadow-lg font-bold',
                dotColor: 'bg-yellow-400',
              },
              {
                key: 'NORMAL',
                label: 'Normal (Green)',
                count: allProjects.length - anomalies.length,
                color: 'hover:border-emerald-500 text-emerald-400',
                activeClass: 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500 shadow-lg font-bold',
                dotColor: 'bg-emerald-500',
              },
              {
                key: 'STARRED',
                label: isHindi ? '⭐ सांसद निरीक्षण' : '⭐ Inspection from MP',
                count: cdoStarredIds.length,
                color: 'hover:border-amber-400 text-amber-300',
                activeClass: 'bg-amber-950/80 border-amber-400 text-amber-300 ring-2 ring-amber-400 shadow-lg font-bold',
                dotColor: 'bg-amber-400',
              },
            ] as const
          ).map((tab) => {
            const isActive = filterSeverity === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleFilterChange(tab.key)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all border text-xs flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? tab.activeClass
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 ' + tab.color
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${tab.dotColor} ${isActive ? 'animate-pulse' : ''}`}></span>
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-[10px] font-mono border border-slate-800">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Showing {filteredProjects.length} of {allProjects.length} Cases
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">Lock: Ghaziabad Jurisdiction</span>
        </div>
      </div>

      {/* Case Navigator Pills */}
      <div className="px-4 py-2 bg-slate-950/95 border-b border-slate-800 overflow-x-auto flex items-center gap-2 scrollbar-thin">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap pl-1">
          {filterSeverity === 'ALL'
            ? 'All Cases:'
            : filterSeverity === 'CRITICAL'
            ? 'Critical (Red) Cases:'
            : filterSeverity === 'MEDIUM'
            ? 'Medium (Yellow) Cases:'
            : filterSeverity === 'STARRED'
            ? (isHindi ? '⭐ सांसद द्वारा निरीक्षण मामले:' : '⭐ Inspection from MP Cases:')
            : 'Normal (Green) Cases:'}
        </span>
        {filteredProjects.map((p, idx) => {
          const a = anomalyMap.get(p.id);
          const isStarred = cdoStarredIds.includes(p.id);
          const isCrit = a?.severity === 'CRITICAL';
          const isMed = a?.severity === 'MEDIUM';
          const isSelected = selectedActiveProject?.id === p.id;

          return (
            <button
              key={p.id}
              onClick={() => handleSelectCase(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400 shadow-md'
                  : isStarred
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300 hover:bg-amber-900/70 font-bold'
                  : isCrit
                  ? 'bg-red-950/50 border-red-700 text-red-300 hover:bg-red-900/60 font-bold'
                  : isMed
                  ? 'bg-yellow-950/50 border-yellow-600 text-yellow-300 hover:bg-yellow-900/60 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isStarred && <Star className="h-3 w-3 text-amber-400 fill-current -mr-0.5" />}
              <span
                className={`w-4 h-4 rounded-full text-[10px] font-mono flex items-center justify-center font-bold text-white shadow-sm ${
                  isCrit ? 'bg-red-600 ring-1 ring-red-400' : isMed ? 'bg-yellow-500 text-slate-950 font-black' : 'bg-emerald-600'
                }`}
              >
                {idx + 1}
              </span>
              <span className="max-w-[130px] truncate">{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Map Container Viewport */}
      <div className="relative w-full h-[480px] sm:h-[520px] bg-slate-950 overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />

        {/* Floating 3D HUD Project Card */}
        {selectedActiveProject && (
          <div className="absolute top-4 right-4 z-30 max-w-sm w-[calc(100%-2rem)] sm:w-88 bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl animate-fade-in-up text-white">
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      activeAnomaly?.severity === 'CRITICAL'
                        ? 'bg-red-900/80 border border-red-500 text-red-200'
                        : activeAnomaly?.severity === 'MEDIUM'
                        ? 'bg-yellow-900/80 border border-yellow-500 text-yellow-200'
                        : 'bg-emerald-900/70 border border-emerald-500/60 text-emerald-300'
                    }`}
                  >
                    {activeAnomaly?.severity === 'CRITICAL' ? (
                      <AlertTriangle className="h-3 w-3 text-red-400" />
                    ) : activeAnomaly?.severity === 'MEDIUM' ? (
                      <Info className="h-3 w-3 text-yellow-400" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    )}
                    {activeAnomaly
                      ? `${activeAnomaly.severity} RISK · ${activeAnomaly.riskScore}/100`
                      : 'NORMAL PARAMETERS'}
                  </span>

                  {/* MP Starred Badge */}
                  {isSelectedProjectStarred && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 border border-amber-400 text-amber-300">
                      <Star className="h-3 w-3 text-amber-400 fill-current" /> {isHindi ? 'सांसद द्वारा निरीक्षण' : 'Inspection from MP'}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-slate-100 mt-1.5 leading-snug line-clamp-2">
                  {selectedActiveProject.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedActiveProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close overlay"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Metrics */}
            <div className="space-y-2 text-xs my-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" /> Coordinates (Ghaziabad)
                </span>
                <span className="font-mono text-slate-200 font-semibold">
                  {selectedActiveProject.latitude.toFixed(4)}, {selectedActiveProject.longitude.toFixed(4)}
                </span>
              </div>

              {activeAnomaly && (
                <>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <IndianRupee className="h-3.5 w-3.5 text-emerald-400" /> Sanctioned / Spent
                    </span>
                    <span className="font-semibold text-slate-200">
                      {formatLakhs(activeAnomaly.sanctioned)} / {formatLakhs(activeAnomaly.spent)}
                    </span>
                  </div>

                  {activeAnomaly.reasons.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider mb-1">
                        AI Flag Trigger:
                      </p>
                      <p className="text-xs text-red-200/90 leading-relaxed line-clamp-2">
                        {activeAnomaly.reasons[0]}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Authority Star Action & Dossier Button */}
            <div className="space-y-2 mt-3">
              {/* Special Star Toggle */}
              {canPutStar && onToggleCdoStar && (
                <button
                  onClick={() => onToggleCdoStar(selectedActiveProject.id)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    isSelectedProjectStarred
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 hover:bg-amber-500/30'
                      : 'bg-slate-900 border-amber-500/60 text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  <Star className={`h-4 w-4 ${isSelectedProjectStarred ? 'fill-current text-amber-400' : 'text-amber-400'}`} />
                  {isSelectedProjectStarred
                    ? (isHindi ? 'सांसद निरीक्षण स्टार हटाएं' : 'Remove MP Inspection Star')
                    : (isHindi ? 'सांसद द्वारा निरीक्षण ⭐' : 'Inspection from MP ⭐')}
                </button>
              )}

              {!canPutStar && isSelectedProjectStarred && (
                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-current text-amber-400 flex-shrink-0" />
                  <span>{isHindi ? 'सांसद द्वारा निरीक्षण हेतु चिह्नित।' : 'Flagged for Inspection from MP.'}</span>
                </div>
              )}

              <button
                onClick={() => {
                  onSelectProject(selectedActiveProject.id);
                  setSelectedActiveProject(null);
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" /> Open Project Dossier <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-[11px] font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 border border-white shadow-red-500/50 shadow-md"></span> Critical (Red)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-400 border border-white shadow-yellow-500/50 shadow-md"></span> Medium (Yellow)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-emerald-500/50 shadow-md"></span> Normal (Green)
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-amber-300">
            <Star className="h-3 w-3 fill-current text-amber-400" /> {isHindi ? 'सांसद निरीक्षण' : 'Inspection from MP'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-mono text-[10px]">🛰️ 4K Satellite HD</span>
        </div>
      </div>
    </div>
  );
}
