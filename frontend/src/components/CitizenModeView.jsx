import React, { useState } from 'react';
import { User, ShieldAlert, MapPin, Navigation, Camera, Send, CheckCircle2, Search } from 'lucide-react';
import { geocodePlaceName } from '../utils/geocoder';

export default function CitizenModeView() {
  const [locationName, setLocationName] = useState('Bhadrachalam Ghat');
  const [depthCm, setDepthCm] = useState(35);
  const [description, setDescription] = useState('Water ponding rapidly near river bank ghat underpass.');
  const [submitted, setSubmitted] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      setIsGeocoding(true);
      const geo = await geocodePlaceName(locationName);
      await fetch('/api/citizen-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: geo.lat,
          lng: geo.lng,
          location_name: geo.name,
          water_depth_cm: Number(depthCm),
          description: description
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/30 text-center space-y-2">
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase">
          CITIZEN PUBLIC SAFETY MODE
        </span>
        <h1 className="text-2xl font-extrabold text-white font-heading">
          Local Flood Safety & Divergent Guidance
        </h1>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          Simplified public warnings, real-time street risk alerts, and crowdsourced flood reporting for municipal model feedback.
        </p>
      </div>

      {/* Citizen Risk Status Card */}
      <div className="glass-card p-6 rounded-2xl border-l-4 border-l-red-500 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-400" />
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">YOUR CURRENT LOCATION</span>
              <h2 className="text-lg font-bold text-white font-heading">{locationName}</h2>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-bold bg-red-950 text-red-400 border border-red-800 rounded-full animate-pulse">
            HIGH RISK NOWCAST
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium block">Expected Flooding Onset</span>
            <span className="text-3xl font-extrabold text-amber-400 font-heading">18 MINUTES</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium block">Recommended Evacuation Route</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-1">
              <Navigation className="w-4 h-4" /> Alternate Route B via Ring Road
            </span>
          </div>
        </div>
      </div>

      {/* Report Flood Form */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-900/40 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <Camera className="w-4 h-4 text-cyan-400" />
          SUBMIT GROUND-TRUTH FLOOD REPORT (FEEDBACK LOOP)
        </h3>

        {submitted ? (
          <div className="bg-emerald-950/80 border border-emerald-700/60 p-4 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-300">Thank You! Report Submitted</h4>
            <p className="text-xs text-slate-300">
              Your observation has been logged as ground-truth data to evaluate and retrain the nowcasting ML model.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Location Name / Landmark</label>
              <input
                type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Estimated Water Depth (cm)</label>
              <input
                type="number" value={depthCm} onChange={(e) => setDepthCm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description / Observations</label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>SUBMIT CROWDSOURCED REPORT</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
