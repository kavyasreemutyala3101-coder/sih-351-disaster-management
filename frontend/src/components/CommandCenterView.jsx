import React, { useState, useEffect } from 'react';
import { Shield, AlertOctagon, CheckCircle2, Wrench, Siren, Radio, Activity, RefreshCw } from 'lucide-react';

export default function CommandCenterView() {
  const [alertsData, setAlertsData] = useState(null);
  const [sensorsData, setSensorsData] = useState([]);

  useEffect(() => {
    fetchCommandData();
  }, []);

  const fetchCommandData = async () => {
    try {
      const resA = await fetch('/api/alerts');
      const jsonA = await resA.json();
      setAlertsData(jsonA);

      const resS = await fetch('/api/sensors');
      const jsonS = await resS.json();
      setSensorsData(jsonS.sensors || []);
    } catch (err) {
      console.error('Command center data fetch error:', err);
    }
  };

  const queue = alertsData?.priority_response_queue || [
    { priority: 1, item: "Drain Node D104 - Silt Blockage (65%) & Outfall Overflow", action: "Deploy hydro-jetting truck immediately" },
    { priority: 2, item: "Road R12 Benz Circle Underpass Inundation (48cm)", action: "Activate automated barrier gates & diversion" },
    { priority: 3, item: "Ward 8 Low-Lying Citizen Evacuation Advisory", action: "Issue Broadcast Level 4 Warning SMS" }
  ];

  const alerts = alertsData?.alerts || [];

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/40 uppercase">
              AUTHORITY DECISION SUPPORT
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase">
              MUNICIPAL COMMAND CENTER
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading">
            Municipal Flood Command & Emergency Priority Center
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Converts ML risk nowcasts and hydraulic stress telemetry into prioritized emergency dispatch queues.
          </p>
        </div>

        <button
          onClick={fetchCommandData}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/40 transition-all"
        >
          <Siren className="w-4 h-4 animate-bounce" />
          <span>BROADCAST EMERGENCY ALERT</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority Response Queue */}
        <div className="glass-panel p-6 rounded-2xl border-cyan-900/40 lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Siren className="w-4 h-4 text-red-400" />
              PRIORITY EMERGENCY RESPONSE QUEUE
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-950 text-red-300 border border-red-800 rounded">
              ACTION REQUIRED
            </span>
          </div>

          <div className="space-y-3">
            {queue.map((item) => (
              <div key={item.priority} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                  #{item.priority}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">{item.item}</h4>
                  <p className="text-xs text-amber-300 font-semibold mt-1">
                    Recommended Action: {item.action}
                  </p>
                </div>
                <button
                  onClick={() => alert(`Executed Action: ${item.action}`)}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all shrink-0"
                >
                  DISPATCH NOW
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sensor Health & Telemetry Status */}
        <div className="glass-panel p-6 rounded-2xl border-cyan-900/40 lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Radio className="w-4 h-4 text-cyan-400" />
            IOT SENSOR HEALTH & TELEMETRY
          </h3>

          <div className="space-y-2 text-xs">
            {sensorsData.map((s) => (
              <div key={s.sensor_id} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">{s.name} ({s.sensor_id})</span>
                  <span className="text-[10px] text-slate-400">Type: {s.sensor_type}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-cyan-300 block text-sm">{s.current_value} {s.unit}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    s.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                  }`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
