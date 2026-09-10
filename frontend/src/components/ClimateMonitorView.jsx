import React, { useState, useEffect } from 'react';
import { Thermometer, Calendar, Layers, Info } from 'lucide-react';

export default function ClimateMonitorView() {
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    fetchGlaciers();
  }, []);

  const fetchGlaciers = async () => {
    try {
      const res = await fetch('/api/glaciers');
      const json = await res.json();
      setTimeline(json.timeline || []);
    } catch (err) {
      console.error('Failed to fetch glacier timeline:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase">
            SECONDARY CLIMATE MODULE
          </span>
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 uppercase">
            SATELLITE TIMELINE 2018 - 2026
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-heading">
          Climate & Glacier Environmental Change Monitor
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Long-term satellite observations tracking Himalayan glacier extent, snow line elevation shift, and retreat velocity.
        </p>
      </div>

      {/* Timeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {timeline.map((item) => (
          <div key={item.year} className="glass-card p-4 rounded-2xl border-l-4 border-l-cyan-500 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xl font-extrabold text-white font-heading">{item.year}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-cyan-900">
                {item.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-900/80 p-2 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Ice Extent</span>
                <span className="font-extrabold text-cyan-300">{item.ice_extent_km2} km²</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Snow Line Elevation</span>
                <span className="font-extrabold text-blue-300">{item.snow_line_m} m</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Retreat Rate</span>
                <span className="font-extrabold text-amber-400">{item.retreat_rate_m_yr} m/yr</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
