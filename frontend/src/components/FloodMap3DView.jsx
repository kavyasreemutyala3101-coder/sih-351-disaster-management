import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { 
  Layers, Play, Clock, AlertTriangle, Filter, Eye, CheckCircle, Search, 
  MapPin, Shield, Activity, Radio, Compass, ArrowRight, RefreshCw 
} from 'lucide-react';
import { geocodePlaceName, PRESET_SECTORS } from '../utils/geocoder';

export default function FloodMap3DView() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const drainMarkersRef = useRef([]);
  const pipeLinesRef = useRef([]);
  const radarOverlayRef = useRef(null);

  // Sector & Place Name state
  const [placeQuery, setPlaceQuery] = useState('Bhadrachalam');
  const [currentPlace, setCurrentPlace] = useState(PRESET_SECTORS[0]); // Bhadrachalam
  const [selectedBaseMap, setSelectedBaseMap] = useState('gis'); // 'gis', 'satellite', 'topo', 'osm'
  const [is3DTilt, setIs3DTilt] = useState(false);
  const [isDopplerRadar, setIsDopplerRadar] = useState(false);
  const [is3DDem, setIs3DDem] = useState(true);
  const [activeTimelineStep, setActiveTimelineStep] = useState(3); // 0: T-45m, 1: T-30m, 2: T-15m, 3: NOW
  const [isSearching, setIsSearching] = useState(false);

  const tileLayerRef = useRef(null);

  const timelineSteps = [
    { label: "T-45m", rain: 30, util: 52, prob: 18.5, color: "#22c55e" },
    { label: "T-30m", rain: 45, util: 68, prob: 48.0, color: "#eab308" },
    { label: "T-15m", rain: 60, util: 81, prob: 76.4, color: "#f97316" },
    { label: "NOW", rain: 75, util: 94, prob: 91.8, color: "#ef4444" }
  ];

  // Tile Layer URLs
  const TILE_URLS = {
    gis: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [currentPlace.lat, currentPlace.lng],
      zoom: 14,
      zoomControl: false
    });

    const tileLayer = L.tileLayer(TILE_URLS.gis, {
      attribution: '&copy; OpenStreetMap / CartoDB',
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    leafletMap.current = map;

    renderPlaceMarkers(map, currentPlace);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update Tile Layer on Base Map Switch
  useEffect(() => {
    if (!leafletMap.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(TILE_URLS[selectedBaseMap]);
  }, [selectedBaseMap]);

  // Handle Place Name Search / Geocoding
  const handleSearchPlace = async (queryName) => {
    const nameToSearch = queryName || placeQuery;
    if (!nameToSearch.trim()) return;

    setIsSearching(true);
    const placeData = await geocodePlaceName(nameToSearch);
    setCurrentPlace(placeData);
    setIsSearching(false);

    if (leafletMap.current) {
      leafletMap.current.flyTo([placeData.lat, placeData.lng], 14, { duration: 1.5 });
      renderPlaceMarkers(leafletMap.current, placeData);
    }
  };

  // Render Place Markers and Drainage Networks
  const renderPlaceMarkers = (map, place) => {
    // Clear old markers & polylines
    drainMarkersRef.current.forEach(m => map.removeLayer(m));
    pipeLinesRef.current.forEach(p => map.removeLayer(p));
    drainMarkersRef.current = [];
    pipeLinesRef.current = [];

    // Calculate drain markers around place lat/lng
    const drains = place.drains || [
      { id: "D1", name: `${place.name} Central Trunk`, offsetLat: 0.002, offsetLng: -0.002, color: "#f97316", status: "HIGH_STRESS" },
      { id: "D2", name: `${place.name} River Outfall`, offsetLat: -0.003, offsetLng: 0.003, color: "#ef4444", status: "OVERLOADED" },
      { id: "D3", name: `${place.name} North Bypass Sluice`, offsetLat: 0.005, offsetLng: 0.001, color: "#22c55e", status: "NORMAL" },
      { id: "D4", name: `${place.name} Market Collector (Blocked)`, offsetLat: -0.004, offsetLng: -0.005, color: "#a855f7", status: "CRITICAL_BLOCKED" }
    ];

    const drainCoords = [];

    drains.forEach(d => {
      const dLat = place.lat + (d.offsetLat || 0);
      const dLng = place.lng + (d.offsetLng || 0);
      drainCoords.push([dLat, dLng]);

      const marker = L.circleMarker([dLat, dLng], {
        radius: 10,
        fillColor: d.color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.95
      }).bindPopup(`
        <div style="color: #0f172a; padding: 4px;">
          <strong style="font-size: 13px; color: #0284c7;">${d.name} (${d.id})</strong><br/>
          <span style="font-size: 11px;">Sector: <strong>${place.name}</strong></span><br/>
          <span style="font-size: 11px;">Status: <strong style="color:${d.color}">${d.status}</strong></span>
        </div>
      `).addTo(map);

      drainMarkersRef.current.push(marker);
    });

    // Add main place center pin marker
    const placeMarker = L.marker([place.lat, place.lng], {
      title: place.name
    }).bindPopup(`
      <div style="color: #0f172a; padding: 4px;">
        <h4 style="margin: 0; font-size: 14px; color: #0369a1;">📍 ${place.name}</h4>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #334155;">${place.sector || place.name}</p>
        <span style="font-size: 10px; font-weight: bold; background: #e0f2fe; color: #0369a1; padding: 2px 6px; borderRadius: 4px;">ACTIVE MONITORING</span>
      </div>
    `).addTo(map);

    placeMarker.openPopup();
    drainMarkersRef.current.push(placeMarker);

    // Draw connecting drainage pipes polylines
    if (drainCoords.length >= 2) {
      for (let i = 0; i < drainCoords.length - 1; i++) {
        const poly = L.polyline([drainCoords[i], drainCoords[i + 1]], {
          color: '#f97316',
          weight: 4,
          opacity: 0.8,
          dashArray: '6, 6'
        }).addTo(map);
        pipeLinesRef.current.push(poly);
      }
    }

    // High Risk Road Warning Line near place
    const roadPoints = [
      [place.lat - 0.003, place.lng - 0.004],
      [place.lat + 0.001, place.lng + 0.002]
    ];
    const roadPoly = L.polyline(roadPoints, { color: '#ef4444', weight: 6, opacity: 0.9 })
      .bindPopup(`🚨 <strong>EVACUATION ADVISORY: ${place.name} Main Underpass</strong><br/>Risk: 91.5% | Depth: 48cm | Onset: 18 min`)
      .addTo(map);
    pipeLinesRef.current.push(roadPoly);
  };

  const currentStep = timelineSteps[activeTimelineStep];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Statutory DM Act Top Header Bar */}
      <div className="bg-slate-900 border-b border-cyan-900/50 px-4 py-2.5 flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-[10px] font-black rounded bg-red-600 text-white uppercase tracking-wider">
            STATUTORY DM ACT WORKFLOW
          </span>
          <span className="text-slate-300 font-semibold hidden md:inline">
            Decision Support Pipeline:
          </span>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1 font-bold text-red-400">
              <span className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-[10px]">1</span>
              Identify Red Zones
            </span>
            <span className="text-slate-600">→</span>
            <span className="flex items-center gap-1 font-bold text-cyan-400">
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-[10px]">2</span>
              Sphere Capacity Audit
            </span>
            <span className="text-slate-600">→</span>
            <span className="flex items-center gap-1 font-bold text-emerald-400">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[10px]">3</span>
              Zero-Overflow Relocation
            </span>
          </div>
        </div>

        {/* Relocation Horizon Badges */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium text-[11px]">Relocation Horizon:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold">
            🚨 Immediate (0-48h)
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold hidden sm:inline">
            ⏳ Short-Term (Pre-Monsoon)
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold hidden md:inline">
            🏕 Medium-Term (Permanent)
          </span>
        </div>
      </div>

      {/* Top 5 Command KPI Cards Header Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-slate-950 border-b border-slate-800">
        {/* Card 1: Hazard Red Zones */}
        <div className="glass-panel p-3 rounded-xl border-l-4 border-l-red-500 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">HAZARD RED ZONES</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-1">
            <span className="text-lg font-extrabold text-white">All Habitations Stable</span>
            <p className="text-[10px] text-slate-400 mt-0.5">2 Orange (Standby) • 0 Green (Safe)</p>
          </div>
        </div>

        {/* Card 2: At-Risk Population */}
        <div className="glass-panel p-3 rounded-xl border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AT-RISK POPULATION</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1">
            <span className="text-xl font-extrabold text-amber-400">0 <span className="text-xs font-semibold text-slate-300">Zero Threat Level</span></span>
            <p className="text-[10px] text-slate-400 mt-0.5">Continuous Telemetry Surveillance</p>
          </div>
        </div>

        {/* Card 3: Relief Camps Capacity */}
        <div className="glass-panel p-3 rounded-xl border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">RELIEF CAMPS CAPACITY</span>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-1">
            <span className="text-xl font-extrabold text-blue-400">5,300 <span className="text-xs font-semibold text-slate-300">Standby Buffer</span></span>
            <p className="text-[10px] text-slate-400 mt-0.5">Across 2 Sphere-Verified Relief Camps</p>
          </div>
        </div>

        {/* Card 4: Safe Permanent Townships */}
        <div className="glass-panel p-3 rounded-xl border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SAFE PERMANENT TOWNSHIPS</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1">
            <span className="text-xl font-extrabold text-emerald-400">6,500 <span className="text-xs font-semibold text-slate-300">Resettlement</span></span>
            <p className="text-[10px] text-slate-400 mt-0.5">1 Hazard-Free Tableland Parcels</p>
          </div>
        </div>

        {/* Card 5: Google OR-Tools Solver */}
        <div className="glass-panel p-3 rounded-xl border-l-4 border-l-purple-500 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">GOOGLE OR-TOOLS SOLVER</span>
            <Compass className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-1">
            <span className="text-xl font-extrabold text-purple-300">5.4 ms <span className="text-xs font-medium text-slate-400">MILP Opt</span></span>
            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">0% Shelter Overflow (Guaranteed)</p>
          </div>
        </div>
      </div>

      {/* Main Map Control Panel Header */}
      <div className="bg-slate-900/90 border-b border-cyan-900/40 p-3 px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* SECTOR / Place Search Input & Preset Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-bold text-slate-300 uppercase text-[11px] shrink-0">SECTOR:</span>
          
          {/* Place Search Text Input */}
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchPlace()}
              placeholder="Type place name (e.g. Bhadrachalam)"
              className="w-full bg-slate-950 border border-cyan-800/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
            />
            {isSearching && (
              <span className="absolute right-2 top-2 text-[10px] text-cyan-400 animate-pulse">Geocoding...</span>
            )}
          </div>

          <button
            onClick={() => handleSearchPlace()}
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-all shrink-0 flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Place</span>
          </button>

          {/* Quick Sector Dropdown Preset */}
          <select
            value={currentPlace.id}
            onChange={(e) => {
              const selected = PRESET_SECTORS.find(s => s.id === e.target.value);
              if (selected) {
                setPlaceQuery(selected.name);
                setCurrentPlace(selected);
                if (leafletMap.current) {
                  leafletMap.current.flyTo([selected.lat, selected.lng], 14);
                  renderPlaceMarkers(leafletMap.current, selected);
                }
              }
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 hidden lg:block"
          >
            {PRESET_SECTORS.map(s => (
              <option key={s.id} value={s.id}>{s.sector}</option>
            ))}
          </select>
        </div>

        {/* Map Mode Buttons Bar */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Base Tile Buttons */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-medium px-2">Base:</span>
            <button
              onClick={() => setSelectedBaseMap('gis')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedBaseMap === 'gis' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GIS Map
            </button>
            <button
              onClick={() => setSelectedBaseMap('satellite')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedBaseMap === 'satellite' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setSelectedBaseMap('topo')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedBaseMap === 'topo' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D Topo
            </button>
            <button
              onClick={() => setSelectedBaseMap('osm')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedBaseMap === 'osm' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              OSM
            </button>
          </div>

          {/* 3D Tilt Toggle */}
          <button
            onClick={() => setIs3DTilt(v => !v)}
            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] border transition-all flex items-center gap-1 ${
              is3DTilt ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3D Tilt</span>
          </button>

          {/* Doppler Radar Toggle */}
          <button
            onClick={() => setIsDopplerRadar(v => !v)}
            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] border transition-all ${
              isDopplerRadar ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            Doppler Radar: {isDopplerRadar ? 'ON' : 'OFF'}
          </button>

          {/* 3D Terrain DEM */}
          <button
            onClick={() => setIs3DDem(v => !v)}
            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] border transition-all ${
              is3DDem ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            ⛰ 3D Terrain DEM
          </button>
        </div>
      </div>

      {/* Main Map Visualizer Viewport */}
      <div className="relative flex-1 min-h-[540px] overflow-hidden bg-slate-950">
        {/* Leaflet GIS Map */}
        <div
          ref={mapRef}
          className={`absolute inset-0 z-0 transition-transform duration-500 ${
            is3DTilt ? 'scale-105 [transform:perspective(800px)_rotateX(25deg)]' : ''
          }`}
        />

        {/* Doppler Radar Overlay Effect */}
        {isDopplerRadar && (
          <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.18),transparent_60%)] animate-pulse" />
        )}

        {/* Floating Hazard Risk Legend */}
        <div className="absolute bottom-4 left-4 z-20 glass-panel p-3.5 rounded-xl border-cyan-900/40 space-y-2 text-xs w-60 pointer-events-auto">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">HAZARD RISK LEGEND</span>
            <span className="text-[10px] text-cyan-400 font-semibold">{currentPlace.name}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-300">LOW (&lt;30% Risk)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-slate-300">MODERATE (30-60% Risk)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-slate-300">HIGH (60-85% Risk)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-slate-300">CRITICAL (&gt;85% Risk)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-slate-300">BLOCKED OUTFALL</span>
            </div>
          </div>
        </div>

        {/* Floating Timeline Slider Panel */}
        <div className="absolute bottom-4 right-4 z-20 glass-panel p-4 rounded-2xl border-cyan-500/40 max-w-md w-full space-y-3 pointer-events-auto">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              NOWCAST TIMELINE: {currentPlace.name}
            </span>
            <span className="font-semibold px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-900">
              {currentStep.label} ({currentStep.rain} mm/hr Rain)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {timelineSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTimelineStep(idx)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeTimelineStep === idx
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
            <span>Drain Utilization: <strong className="text-amber-400">{currentStep.util}%</strong></span>
            <span>Flood Risk: <strong style={{ color: currentStep.color }}>{currentStep.prob}%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
