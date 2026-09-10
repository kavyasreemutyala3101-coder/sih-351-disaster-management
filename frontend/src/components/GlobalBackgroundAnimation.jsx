import React, { useEffect, useMemo, useState } from 'react';

const scenes = [
  { id: 'rain', image: '/backgrounds/rain_background.png', label: 'Rain storm', tone: 'rain' },
  { id: 'flood', image: '/backgrounds/flood_background.png', label: 'Flooded town', tone: 'flood' },
  { id: 'glacier', image: '/backgrounds/glacier_background.png', label: 'Glacier / ice', tone: 'glacier' },
  { id: 'earthquake', image: '/backgrounds/earthquake_background.png', label: 'Earthquake', tone: 'earthquake' },
];

export default function GlobalBackgroundAnimation({ theme, activeTab }) {
  const [autoIndex, setAutoIndex] = useState(0);

  const autoOrder = useMemo(() => {
    if (['hazards', 'nowcast', 'climate'].includes(activeTab)) return ['rain', 'glacier', 'flood', 'earthquake'];
    if (['map', 'drainage', 'simulator', 'command'].includes(activeTab)) return ['flood', 'rain', 'earthquake', 'glacier'];
    return ['rain', 'flood', 'glacier', 'earthquake'];
  }, [activeTab]);

  useEffect(() => {
    setAutoIndex(0);
  }, [activeTab]);

  useEffect(() => {
    if (theme !== 'auto') return undefined;
    const timer = window.setInterval(() => setAutoIndex((i) => (i + 1) % autoOrder.length), 6500);
    return () => window.clearInterval(timer);
  }, [theme, autoOrder]);

  const activeId = theme === 'auto' ? autoOrder[autoIndex] : theme;
  const activeSceneIndex = Math.max(0, scenes.findIndex((scene) => scene.id === activeId));

  return (
    <div className="global-bg" aria-hidden="true">
      {scenes.map((scene, index) => (
        <div
          key={scene.id}
          className={`bg-scene ${index === activeSceneIndex ? 'visible' : ''} bg-${scene.tone}`}
          style={{ backgroundImage: `url(${scene.image})` }}
        />
      ))}
      <div className="bg-vignette" />
      <div className="bg-grid" />
      <div className="bg-noise" />
      <div className="bg-scanline" />
    </div>
  );
}
