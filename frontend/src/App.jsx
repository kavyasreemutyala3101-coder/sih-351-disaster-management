import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import DigitalEarthView from './components/DigitalEarthView';
import FloodNowcastView from './components/FloodNowcastView';
import FloodMap3DView from './components/FloodMap3DView';
import DrainageTwinView from './components/DrainageTwinView';
import WhatIfSimulatorView from './components/WhatIfSimulatorView';
import DisasterIntelligenceView from './components/DisasterIntelligenceView';
import ClimateMonitorView from './components/ClimateMonitorView';
import CommandCenterView from './components/CommandCenterView';
import CitizenModeView from './components/CitizenModeView';
import NexusAiAssistant from './components/NexusAiAssistant';
import OpeningIntroModal from './components/OpeningIntroModal';
import InterfaceGuideModal from './components/InterfaceGuideModal';
import ThreeHazardVisualizer from './components/ThreeHazardVisualizer';
import GlobalBackgroundAnimation from './components/GlobalBackgroundAnimation';

const tabMeta = {
  earth: { label: 'Digital Earth', section: 'Explore' },
  hazards: { label: '3D Hazard Lab', section: 'Explore' },
  nowcast: { label: 'Flood Nowcast', section: 'Predict' },
  map: { label: 'GIS Risk Map', section: 'Predict' },
  drainage: { label: 'Drainage Twin', section: 'Predict' },
  simulator: { label: 'What-If Simulator', section: 'Predict' },
  disaster: { label: 'Multi-Hazard', section: 'Monitor' },
  climate: { label: 'Climate Monitor', section: 'Monitor' },
  command: { label: 'Command Center', section: 'Respond' },
  citizen: { label: 'Citizen Mode', section: 'Respond' },
  assistant: { label: 'NEXUS AI', section: 'Respond' },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('earth');
  const [showIntro, setShowIntro] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoStepIndex, setDemoStepIndex] = useState(0);
  const [liveTelemetry, setLiveTelemetry] = useState(null);
  const [bgTheme, setBgTheme] = useState('auto');

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;
    let ws;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'TELEMETRY_UPDATE') setLiveTelemetry(data);
        } catch {
          // Ignore malformed telemetry frames and keep the UI alive.
        }
      };
    } catch (e) {
      console.log('WebSocket fallback:', e);
    }
    return () => ws?.close();
  }, []);

  const handleStartDemo = async () => {
    setIsDemoActive(true);
    setActiveTab('nowcast');
    for (let i = 0; i < 4; i += 1) {
      setDemoStepIndex(i);
      await new Promise((resolve) => setTimeout(resolve, 1800));
    }
    setIsDemoActive(false);
  };

  const navigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="nexus-app min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      <GlobalBackgroundAnimation theme={bgTheme} activeTab={activeTab} />

      {showIntro && <OpeningIntroModal onClose={() => setShowIntro(false)} />}
      {showGuide && (
        <InterfaceGuideModal
          onClose={() => setShowGuide(false)}
          onSelectTab={navigate}
          onChangeTheme={setBgTheme}
        />
      )}

      <div className="nexus-shell relative z-10">
        <Navbar
          activeTab={activeTab}
          setActiveTab={navigate}
          onStartDemo={handleStartDemo}
          isDemoActive={isDemoActive}
          liveTelemetry={liveTelemetry}
          bgTheme={bgTheme}
          setBgTheme={setBgTheme}
          onOpenGuide={() => setShowGuide(true)}
        />

        <div className="nexus-main-column">
          <div className="nexus-mobile-title">
            <div>
              <span className="eyebrow">NEXUS-FLOOD / {tabMeta[activeTab]?.section}</span>
              <h1>{tabMeta[activeTab]?.label}</h1>
            </div>
            <button className="quick-guide-btn" onClick={() => setShowGuide(true)}>How to use</button>
          </div>

          <main className="nexus-content">
            {activeTab === 'earth' && <DigitalEarthView onNavigateToNowcast={() => navigate('nowcast')} />}
            {activeTab === 'hazards' && <ThreeHazardVisualizer />}
            {activeTab === 'nowcast' && <FloodNowcastView onNavigateToMap={() => navigate('map')} onNavigateToSimulator={() => navigate('simulator')} />}
            {activeTab === 'map' && <FloodMap3DView />}
            {activeTab === 'drainage' && <DrainageTwinView />}
            {activeTab === 'simulator' && <WhatIfSimulatorView />}
            {activeTab === 'disaster' && <DisasterIntelligenceView />}
            {activeTab === 'climate' && <ClimateMonitorView />}
            {activeTab === 'command' && <CommandCenterView />}
            {activeTab === 'citizen' && <CitizenModeView />}
            {activeTab === 'assistant' && <NexusAiAssistant />}
          </main>

          <footer className="nexus-statusbar">
            <div className="status-live"><span className="status-dot" /> <strong>Earth Engine ONLINE</strong></div>
            <span>Target Sector: Bhadrachalam / Place Name GIS</span>
            <span className="status-separator">•</span>
            <span>ML: XGBoost + Random Forest</span>
            <span className="status-separator">•</span>
            <span>SIH 2026 · TEAM-351</span>
          </footer>
        </div>
      </div>

      {isDemoActive && (
        <div className="demo-ribbon" aria-live="polite">
          <span>LIVE DEMO</span>
          <strong>Flood scenario step {demoStepIndex + 1} / 4</strong>
          <span>Nowcast → Risk → Response</span>
        </div>
      )}
    </div>
  );
}
