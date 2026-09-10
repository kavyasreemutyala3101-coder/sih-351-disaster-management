import React, { useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, Bot, CloudRain, Cpu, Globe, HelpCircle, Layers,
  Menu, Play, Search, Shield, Sparkles, Thermometer, User, X, Image
} from 'lucide-react';

const groups = [
  { title: 'EXPLORE', items: [
    ['earth', 'Digital Earth', Globe],
    ['hazards', '3D Hazard Lab', Sparkles, '3D'],
  ]},
  { title: 'PREDICT', items: [
    ['nowcast', 'Flood Nowcast', CloudRain, 'MAIN'],
    ['map', 'GIS Risk Map', Layers],
    ['drainage', 'Drainage Twin', Activity, '3D'],
    ['simulator', 'What-If Simulator', Cpu],
  ]},
  { title: 'MONITOR', items: [
    ['disaster', 'Multi-Hazard', AlertTriangle],
    ['climate', 'Climate Monitor', Thermometer],
  ]},
  { title: 'RESPOND', items: [
    ['command', 'Command Center', Shield],
    ['citizen', 'Citizen Mode', User],
    ['assistant', 'NEXUS AI', Bot, 'AI'],
  ]},
];

export default function Navbar({ activeTab, setActiveTab, onStartDemo, isDemoActive, bgTheme, setBgTheme, onOpenGuide }) {
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.map((group) => ({
      ...group,
      items: group.items.filter((item) => item[1].toLowerCase().includes(q)),
    })).filter((group) => group.items.length);
  }, [query]);

  const go = (tab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      <button className="mobile-nav-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle navigation">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`nexus-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="brand-block" onClick={() => go('earth')}>
          <div className="brand-mark"><Globe size={22} /></div>
          <div>
            <div className="brand-name">NEXUS<span>-FLOOD</span></div>
            <div className="brand-sub">AI URBAN FLOOD INTELLIGENCE</div>
          </div>
        </div>

        <div className="sidebar-status">
          <span className="status-dot" />
          <span>LIVE EARTH ENGINE</span>
          <span className="live-chip">ONLINE</span>
        </div>

        <div className="sidebar-search">
          <Search size={15} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a tool..." />
          {query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={13} /></button>}
        </div>

        <nav className="sidebar-nav" aria-label="NEXUS-FLOOD navigation">
          {visibleGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-group-title">{group.title}</div>
              {group.items.map(([id, label, Icon, badge]) => (
                <button
                  key={id}
                  className={`nav-item ${activeTab === id ? 'active' : ''}`}
                  onClick={() => go(id)}
                  title={label}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  {badge && <small>{badge}</small>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-card">
          <div className="sidebar-card-title"><Image size={14} /> BACKGROUND SCENE</div>
          <select value={bgTheme} onChange={(e) => setBgTheme(e.target.value)}>
            <option value="auto">⚡ Auto (recommended)</option>
            <option value="rain">🌧 Rain storm</option>
            <option value="flood">🌊 Flooded town</option>
            <option value="glacier">❄ Glacier / ice</option>
            <option value="earthquake">🏚 Earthquake</option>
          </select>
          <p>Animated scene stays behind the dashboard so data remains readable.</p>
        </div>

        <div className="sidebar-actions">
          <button className={`demo-btn ${isDemoActive ? 'running' : ''}`} onClick={onStartDemo} disabled={isDemoActive}>
            <Play size={15} fill="currentColor" />
            {isDemoActive ? 'Scenario running…' : 'Start flood scenario'}
          </button>
          <button className="guide-btn" onClick={onOpenGuide}>
            <HelpCircle size={15} /> Interface guide
          </button>
        </div>

        <div className="sidebar-footer">
          <span>SIH 2026</span>
          <span>TEAM-351</span>
        </div>
      </aside>
    </>
  );
}
