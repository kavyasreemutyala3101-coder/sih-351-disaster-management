import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, AlertTriangle, ArrowRight, Activity, CloudRain, Clock, ShieldAlert } from 'lucide-react';

export default function WhatIfSimulatorView() {
  const [rainIntensity, setRainIntensity] = useState(70);
  const [durationHrs, setDurationHrs] = useState(2.0);
  const [blockagePct, setBlockagePct] = useState(40);
  const [drainCapacity, setDrainCapacity] = useState(950);
  const [elevation, setElevation] = useState(14);
  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runSimulation();
  }, [rainIntensity, durationHrs, blockagePct, drainCapacity, elevation]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rainfall_intensity: rainIntensity,
          rainfall_duration_hrs: durationHrs,
          blockage_pct: blockagePct,
          drainage_capacity_lps: drainCapacity,
          elevation_m: elevation
        })
      });
      const json = await res.json();
      setSimResult(json);
    } catch (err) {
      console.error('Simulation calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const pred = simResult?.prediction || { flood_probability: 86.4, severity: 'HIGH', estimated_depth_m: 0.42 };
  const timeEst = simResult?.time_to_flood || { time_to_flood_min: 31 };
  const hydrology = simResult?.hydrology || { utilization_pct: 91.2 };
  const affectedKm2 = simResult?.affected_area_km2 || 3.5;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
            AI WHAT-IF SCENARIO SIMULATOR
          </span>
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase">
            HYDRAULIC RE-CALCULATION
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white font-heading">
          "What-If?" Interactive Climate & Infrastructure Simulator
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Modify rainfall intensity, duration, silt blockage %, and drain design capacity to simulate urban flooding impact in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Panel */}
        <div className="glass-panel p-6 rounded-2xl border-cyan-900/40 lg:col-span-5 space-y-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            SIMULATION PARAMETER SLIDERS
          </h3>

          {/* Rain Intensity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Rainfall Intensity</span>
              <span className="text-cyan-400">{rainIntensity} mm/hr</span>
            </div>
            <input
              type="range" min="10" max="120" value={rainIntensity}
              onChange={(e) => setRainIntensity(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer bg-slate-900"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>10 mm/hr (Light)</span>
              <span>60 mm/hr (Heavy)</span>
              <span>120 mm/hr (Extreme)</span>
            </div>
          </div>

          {/* Duration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Rainfall Duration</span>
              <span className="text-cyan-400">{durationHrs} Hours</span>
            </div>
            <input
              type="range" min="0.5" max="6.0" step="0.5" value={durationHrs}
              onChange={(e) => setDurationHrs(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer bg-slate-900"
            />
          </div>

          {/* Blockage Pct Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Drainage Silt & Debris Blockage</span>
              <span className="text-purple-400">{blockagePct}% Blocked</span>
            </div>
            <input
              type="range" min="0" max="90" value={blockagePct}
              onChange={(e) => setBlockagePct(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer bg-slate-900"
            />
          </div>

          {/* Drainage Capacity Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Drainage Pipe Capacity</span>
              <span className="text-emerald-400">{drainCapacity} L/s</span>
            </div>
            <input
              type="range" min="500" max="2000" step="50" value={drainCapacity}
              onChange={(e) => setDrainCapacity(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer bg-slate-900"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-400 font-semibold uppercase block">Quick Scenario Presets:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => { setRainIntensity(45); setBlockagePct(20); }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              >
                Moderate Rain + Clear Drain
              </button>
              <button
                onClick={() => { setRainIntensity(85); setBlockagePct(65); }}
                className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900/80 text-red-300 border border-red-800"
              >
                Heavy Cloudburst + Blocked Drain
              </button>
            </div>
          </div>
        </div>

        {/* Live Simulation Output Cards */}
        <div className="glass-panel p-6 rounded-2xl border-cyan-900/40 lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              SIMULATED HYDRAULIC & ML OUTCOME
            </h3>
            {loading && <span className="text-xs text-cyan-400 animate-pulse">Recalculating ML model...</span>}
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-5 rounded-2xl border-l-4 border-l-purple-500">
              <span className="text-xs text-slate-400 uppercase font-semibold">Simulated Flood Risk</span>
              <div className="text-4xl font-extrabold text-purple-400 font-heading mt-2">
                {pred.flood_probability}%
              </div>
              <span className="text-xs font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-950 border border-purple-800 inline-block mt-1">
                SEVERITY: {pred.severity}
              </span>
            </div>

            <div className="glass-card p-5 rounded-2xl border-l-4 border-l-amber-500">
              <span className="text-xs text-slate-400 uppercase font-semibold">Simulated Time-To-Flood</span>
              <div className="text-4xl font-extrabold text-amber-400 font-heading mt-2">
                {timeEst.time_to_flood_min} <span className="text-base font-medium">MINS</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Calculated onset lead time</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border-l-4 border-l-blue-500">
              <span className="text-xs text-slate-400 uppercase font-semibold">Simulated Water Depth</span>
              <div className="text-4xl font-extrabold text-blue-400 font-heading mt-2">
                {pred.estimated_depth_m} <span className="text-base font-medium">METERS</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Maximum surface accumulation</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border-l-4 border-l-red-500">
              <span className="text-xs text-slate-400 uppercase font-semibold">Drain Capacity Stress</span>
              <div className="text-4xl font-extrabold text-red-400 font-heading mt-2">
                {hydrology.utilization_pct}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Flow vs Effective Capacity</p>
            </div>
          </div>

          {/* Affected Area Summary */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-200">Total Inundation Impact Area:</span>
              <span className="text-cyan-300 font-bold text-sm">~{affectedKm2} km²</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Increasing rainfall by {rainIntensity} mm/hr with {blockagePct}% blockage expands low-lying water logging into Ward 12 & Ward 8 residential corridors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
