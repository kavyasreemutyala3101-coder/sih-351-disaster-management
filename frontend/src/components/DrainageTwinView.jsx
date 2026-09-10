import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, CheckCircle, AlertOctagon, Wrench, RefreshCw, Cpu } from 'lucide-react';

export default function DrainageTwinView() {
  const [drains, setDrains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrains();
  }, []);

  const fetchDrains = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/drains');
      const json = await res.json();
      setDrains(json.drains || []);
    } catch (err) {
      console.error('Failed to fetch drains:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase">
              MUNICIPAL DRAINAGE DIGITAL TWIN
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
              HYDRAULIC GRAPH TOPOLOGY
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading">
            Urban Drainage Network Graph & Stress Monitoring
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time telemetry tracking flow capacity, silt blockage %, water levels, and outfall discharge across Vijayawada trunk lines.
          </p>
        </div>

        <button
          onClick={fetchDrains}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-cyan-800/60 rounded-xl text-xs font-semibold text-cyan-300 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Visual Stress Legend & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatusCard label="NORMAL" count={1} color="#22c55e" bg="bg-emerald-950/60" border="border-emerald-800" />
        <StatusCard label="MODERATE" count={1} color="#eab308" bg="bg-amber-950/60" border="border-amber-800" />
        <StatusCard label="HIGH STRESS" count={1} color="#f97316" bg="bg-orange-950/60" border="border-orange-800" />
        <StatusCard label="OVERLOADED" count={1} color="#ef4444" bg="bg-red-950/60" border="border-red-800" />
        <StatusCard label="CRITICAL/BLOCKED" count={1} color="#a855f7" bg="bg-purple-950/60" border="border-purple-800" />
      </div>

      {/* Drain Nodes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drains.map((d) => (
          <div
            key={d.drain_id}
            className="glass-card p-5 rounded-2xl space-y-3 relative overflow-hidden transition-all hover:scale-[1.01]"
            style={{ borderLeft: `5px solid ${d.stress_color}` }}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  ID: {d.drain_id}
                </span>
                <h3 className="text-base font-bold text-white font-heading mt-1">{d.name}</h3>
              </div>
              <span
                className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider"
                style={{ backgroundColor: `${d.stress_color}22`, color: d.stress_color, border: `1px solid ${d.stress_color}44` }}
              >
                {d.status}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Capacity Utilization</span>
                <span className="text-sm font-extrabold text-cyan-300">{d.utilization_pct}%</span>
                <div className="w-full h-1.5 bg-slate-950 rounded-full mt-1 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, d.utilization_pct)}%`, backgroundColor: d.stress_color }} />
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Silt / Debris Blockage</span>
                <span className="text-sm font-extrabold text-purple-300">{d.blockage_pct}%</span>
                <div className="w-full h-1.5 bg-slate-950 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${d.blockage_pct}%` }} />
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 pt-1">
              <div className="flex justify-between">
                <span>Current Flow: <strong className="text-slate-200">{d.current_flow_lps} L/s</strong></span>
                <span>Design Cap: <strong className="text-slate-200">{d.capacity_lps} L/s</strong></span>
              </div>
              <div className="flex justify-between">
                <span>Upstream Catchment: <strong className="text-slate-200">{d.upstream_area_ha} ha</strong></span>
                <span>Discharge To: <strong className="text-cyan-400">{d.downstream_id || 'Main Outfall'}</strong></span>
              </div>
            </div>

            <button
              onClick={() => alert(`Maintenance team dispatched to ${d.name} (${d.drain_id})`)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all mt-2"
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dispatch Hydro-Jet Cleaner</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusCard({ label, count, color, bg, border }) {
  return (
    <div className={`${bg} ${border} p-3 rounded-xl border text-center`}>
      <span className="text-[10px] font-bold tracking-wider uppercase block text-slate-300">{label}</span>
      <span className="text-xl font-extrabold font-heading mt-0.5 block" style={{ color }}>{count} Node</span>
    </div>
  );
}
