import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Activity, Flame, Wind, Waves, Mountain, Info } from 'lucide-react';

export default function DisasterIntelligenceView() {
  const [disasters, setDisasters] = useState([]);

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      const res = await fetch('/api/disasters');
      const json = await res.json();
      setDisasters(json.disasters || []);
    } catch (err) {
      console.error('Failed to fetch disasters:', err);
    }
  };

  const getHazardIcon = (type) => {
    switch (type) {
      case 'FLOOD': return Waves;
      case 'LANDSLIDE': return Mountain;
      case 'EARTHQUAKE': return Activity;
      case 'CYCLONE': return Wind;
      case 'WILDFIRE': return Flame;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase">
            EARTH CONTEXT INTELLIGENCE
          </span>
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase">
            MULTI-HAZARD TRACKER
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-heading">
          Regional Multi-Hazard Intelligence Layer
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Contextual monitoring of floods, landslides, seismic activity, cyclones, and environmental hazards across the region.
        </p>
      </div>

      {/* Scientific Honesty Disclaimer Banner */}
      <div className="bg-amber-950/60 border border-amber-700/60 p-4 rounded-xl flex items-start gap-3 text-xs">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300">SCIENTIFIC HONESTY NOTICE:</span>
          <p className="text-slate-300 text-[11px] mt-0.5">
            Earthquake functionality provides seismic event monitoring, magnitude, epicenter location, and historical risk maps. The system does NOT claim to predict earthquakes. AI predictions are strictly applied to urban flood nowcasting.
          </p>
        </div>
      </div>

      {/* Disaster Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {disasters.map((ev) => {
          const Icon = getHazardIcon(ev.hazard_type);
          return (
            <div key={ev.event_id} className="glass-card p-5 rounded-2xl space-y-3 relative">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{ev.hazard_type}</span>
                    <h3 className="text-sm font-bold text-white font-heading">{ev.title}</h3>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                  ev.status === 'PREDICTED' ? 'bg-red-950 text-red-300 border border-red-800'
                  : ev.status === 'OBSERVED' ? 'bg-blue-950 text-blue-300 border border-blue-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {ev.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {ev.description}
              </p>

              {ev.magnitude > 0 && (
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Seismic Magnitude: <strong className="text-amber-400">{ev.magnitude} M_w</strong></span>
                  <span className="text-slate-400">Depth: <strong className="text-cyan-300">{ev.depth_km} km</strong></span>
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                <span>Location: {ev.lat.toFixed(2)}°N, {ev.lng.toFixed(2)}°E</span>
                <span>Severity: <strong className="text-slate-300">{ev.severity}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
