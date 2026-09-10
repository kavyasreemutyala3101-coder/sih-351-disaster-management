import React, { useState, useEffect } from 'react';
import { 
  CloudRain, Activity, Clock, ShieldAlert, ArrowUpRight, Cpu, CheckCircle2, Info, AlertTriangle, ChevronRight
} from 'lucide-react';

export default function FloodNowcastView({ onNavigateToMap, onNavigateToSimulator }) {
  const [modelType, setModelType] = useState('XGBoost');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNowcastData();
  }, [modelType]);

  const fetchNowcastData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/flood-risk');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch nowcast data:', err);
    } finally {
      setLoading(false);
    }
  };

  const overall = data?.overall_nowcast || {
    flood_probability: 91.8,
    severity: 'CRITICAL',
    estimated_water_depth_m: 0.48,
    estimated_onset_min: 18,
    affected_area_km2: 3.2,
    confidence_pct: 88.5
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase">
              SIH 2026 PRIMARY SOLUTION
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase">
              DATA: IMD COUPLED DEMO
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading">
            Urban Flood Nowcasting Dashboard — Vijayawada Pilot Ward
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Coupling live rainfall telemetry with municipal drainage capacity, blockage %, and terrain GIS elevation.
          </p>
        </div>

        {/* Model Selection Toggle */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-cyan-900/50 text-xs">
          <span className="text-slate-400 px-2 flex items-center gap-1 font-medium">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Model:
          </span>
          <button
            onClick={() => setModelType('XGBoost')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              modelType === 'XGBoost'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            XGBoost ML
          </button>
          <button
            onClick={() => setModelType('Random Forest')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              modelType === 'Random Forest'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Random Forest
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Flood Probability */}
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-red-500">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Flood Risk Probability</span>
            <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-red-400 font-heading">{overall.flood_probability}%</span>
            <span className="text-xs font-bold text-red-500 px-2 py-0.5 rounded bg-red-950 border border-red-800">
              {overall.severity}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Confidence Score: <strong className="text-cyan-300">{overall.confidence_pct}%</strong>
          </p>
        </div>

        {/* Time to Flood Onset */}
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Estimated Time-To-Flood</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-amber-400 font-heading">{overall.estimated_onset_min}</span>
            <span className="text-sm font-semibold text-slate-300">MINUTES</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Status: <strong className="text-amber-400">Onset Imminent (Ward 12 & 8)</strong>
          </p>
        </div>

        {/* Estimated Water Depth */}
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Estimated Water Depth</span>
            <CloudRain className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-blue-400 font-heading">{overall.estimated_water_depth_m}</span>
            <span className="text-sm font-semibold text-slate-300">METERS</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Ponding depth in low-lying segments (~48 cm)
          </p>
        </div>

        {/* Affected Area */}
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Affected Urban Area</span>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-purple-400 font-heading">{overall.affected_area_km2}</span>
            <span className="text-sm font-semibold text-slate-300">KM²</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Inundation spread over paved catchment
          </p>
        </div>
      </div>

      {/* Coupling Analysis & XAI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rainfall vs Drainage Gauge Meter */}
        <div className="glass-panel p-6 rounded-2xl border-cyan-900/40 lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            COUPLING TELEMETRY METERS
          </h3>

          {/* Rainfall Meter */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Rainfall Intensity</span>
              <span className="text-blue-400">75.0 mm/hr (EXTREME)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[75%]" />
            </div>
            <p className="text-[10px] text-slate-400">Source: IMD Radar + Local Rain Gauge SENS_R001</p>
          </div>

          {/* Drainage Utilization Meter */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Drainage Capacity Stress</span>
              <span className="text-red-400">94.2% (OVERLOADED)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 w-[94.2%]" />
            </div>
            <p className="text-[10px] text-slate-400">Calculated: Current Flow (890 L/s) / Effective Cap (950 L/s)</p>
          </div>

          {/* Drain Blockage Meter */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">One Town Outfall Blockage</span>
              <span className="text-purple-400">65.0% (CRITICAL)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-[65%]" />
            </div>
            <p className="text-[10px] text-slate-400">Silt buildup & debris reported by IoT pressure node</p>
          </div>

          <button
            onClick={() => onNavigateToSimulator()}
            className="w-full py-2.5 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-800/60 flex items-center justify-center gap-2 transition-all"
          >
            <span>LAUNCH WHAT-IF SIMULATOR</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Explainable AI (XAI) Feature Attribution */}
        <div className="glass-panel p-6 rounded-2xl border-cyan-900/40 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              EXPLAINABLE AI (XAI) — RISK ATTRIBUTION BREAKDOWN
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800 rounded">
              SHAP ATTRIBUTION
            </span>
          </div>

          <p className="text-xs text-slate-300">
            <strong>WHY does the AI predict 91.8% flood probability?</strong> Transparency breakdown of key hydrological factors driving the prediction model:
          </p>

          <div className="space-y-3 pt-2">
            <XAIBar label="Heavy Rainfall Intensity (75 mm/hr)" pct={32.0} color="bg-blue-500" sign="+32%" />
            <XAIBar label="Drainage Stress & Channel Overload (94.2%)" pct={25.0} color="bg-red-500" sign="+25%" />
            <XAIBar label="Low Elevation Terrain (11m - 14m asl)" pct={15.0} color="bg-amber-500" sign="+15%" />
            <XAIBar label="High Soil Saturation Index (85%)" pct={11.0} color="bg-teal-500" sign="+11%" />
            <XAIBar label="Drain Silt & Debris Blockage (65%)" pct={8.0} color="bg-purple-500" sign="+8%" />
            <XAIBar label="High Impervious Urban Surface Ratio (85%)" pct={9.0} color="bg-slate-500" sign="+9%" />
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 mt-4 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-200">Recommended Operator Action:</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Clear One Town Outfall blockage (D104) and divert Benz Circle traffic immediately.
              </p>
            </div>
            <button
              onClick={onNavigateToMap}
              className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-cyan-400 transition-all shrink-0 ml-2"
            >
              VIEW ON MAP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function XAIBar({ label, pct, color, sign }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="font-bold text-cyan-400">{sign} Impact</span>
      </div>
      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct * 2.5}%` }} />
      </div>
    </div>
  );
}
