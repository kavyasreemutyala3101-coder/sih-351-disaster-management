import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Search, MapPin, Eye, CloudRain, ShieldAlert, ArrowRight, Activity, Globe as GlobeIcon } from 'lucide-react';

export default function DigitalEarthView({ onSelectCity, onNavigateToNowcast }) {
  const mountRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState('Vijayawada');
  const [zoomLevel, setZoomLevel] = useState('GLOBAL');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // OrbitControls for 360 rotation & zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 110;
    controls.maxDistance = 400;

    // Globe Sphere
    const geometry = new THREE.SphereGeometry(70, 64, 64);
    
    // Create procedurally shaded Earth material with glowing continents & ocean blues
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Gradient ocean background
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#040b17');
    grad.addColorStop(0.5, '#0b1d3a');
    grad.addColorStop(1, '#030812');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);
    
    // Draw simplified continents & land masses
    ctx.fillStyle = '#0e3a47';
    ctx.beginPath();
    // India region highlight
    ctx.arc(720, 220, 45, 0, Math.PI * 2);
    // Eurasia
    ctx.arc(650, 180, 90, 0, Math.PI * 2);
    // Americas
    ctx.arc(280, 240, 110, 0, Math.PI * 2);
    // Africa
    ctx.arc(540, 270, 65, 0, Math.PI * 2);
    ctx.fill();

    // High resolution grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    for (let y = 0; y < 512; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 30,
      specular: new THREE.Color(0x1e3a8a)
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Atmospheric Glow Shell
    const atmosphereGeo = new THREE.SphereGeometry(73, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphere);

    // Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(72, 64, 64);
    const cloudMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      wireframe: true
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(cloudMesh);

    // 3D Pin Markers Group over Earth Surface
    const pinsGroup = new THREE.Group();
    const cityCoords = [
      { name: "Vijayawada", lat: 16.5, lng: 80.6, color: 0xef4444 },
      { name: "Amaravati", lat: 16.51, lng: 80.51, color: 0x38bdf8 },
      { name: "Hyderabad", lat: 17.38, lng: 78.48, color: 0xf59e0b },
      { name: "Visakhapatnam", lat: 17.68, lng: 83.21, color: 0xa855f7 }
    ];

    cityCoords.forEach(c => {
      // Convert lat/lng to 3D sphere coordinate
      const phi = (90 - c.lat) * (Math.PI / 180);
      const theta = (c.lng + 180) * (Math.PI / 180);
      const radius = 71.5;

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = (radius * Math.sin(phi) * Math.sin(theta));
      const y = (radius * Math.cos(phi));

      const pinGeo = new THREE.SphereGeometry(2.2, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: c.color });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.set(x, y, z);
      pinsGroup.add(pinMesh);

      // Pulsing Ring Beacon around city pin
      const ringGeo = new THREE.RingGeometry(2.5, 4.0, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: c.color, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(x * 1.01, y * 1.01, z * 1.01);
      ringMesh.lookAt(0, 0, 0);
      pinsGroup.add(ringMesh);
    });

    scene.add(pinsGroup);

    // Rain Particles over target area
    const particleCount = 600;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 80 + 35;
      positions[i+1] = (Math.random() - 0.5) * 80 + 15;
      positions[i+2] = Math.random() * 40 + 60;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 1.2,
      transparent: true,
      opacity: 0.7
    });
    const rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight.position.set(200, 100, 150);
    scene.add(dirLight);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      cloudMesh.rotation.y += 0.0015;

      // Animate rain particles falling
      const pos = rainParticles.geometry.attributes.position.array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        pos[i] -= 0.6;
        if (pos[i] < -40) pos[i] = 40;
      }
      rainParticles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-110px)] overflow-hidden bg-slate-950 flex flex-col justify-between">
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Floating Header Controls */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-start justify-between gap-4 pointer-events-none">
        <div className="glass-panel p-5 rounded-2xl max-w-lg pointer-events-auto border-cyan-500/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase tracking-wider">
              3D EARTH INTELLIGENCE
            </span>
            <span className="text-xs text-slate-400">Live Satellite Feeds</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Urban Flood Nowcasting
          </h1>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            NEXUS-FLOOD couples real-time satellite precipitation, local rain gauges, terrain slopes, and city drainage capacities to forecast street-level flood risk minutes to hours in advance.
          </p>

          {/* Place Name Search Input Box */}
          <div className="mt-4 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                placeholder="Enter place name (e.g. Bhadrachalam)"
                className="flex-1 bg-slate-900 border border-cyan-800/60 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
              />
              <button
                onClick={() => onNavigateToNowcast(selectedLocation)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all shrink-0"
              >
                <span>EXPLORE {selectedLocation.toUpperCase()} NOWCAST</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Hazard Quick Stats Widget */}
        <div className="glass-panel p-4 rounded-xl w-full md:w-72 pointer-events-auto border-cyan-800/40 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              GLOBAL HAZARD MONITOR
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ACTIVE
            </span>
          </div>
          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg">
              <span className="flex items-center gap-1.5 text-red-400">
                <CloudRain className="w-3.5 h-3.5" /> Flood Warnings
              </span>
              <span className="font-bold text-white">4 Active</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg">
              <span className="flex items-center gap-1.5 text-amber-400">
                <ShieldAlert className="w-3.5 h-3.5" /> Stressed Drains
              </span>
              <span className="font-bold text-white">2 Critical</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg">
              <span className="flex items-center gap-1.5 text-blue-400">
                <MapPin className="w-3.5 h-3.5" /> Target Pilot Ward
              </span>
              <span className="font-semibold text-cyan-300">Ward 12, AP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Earth Controls Bottom Bar */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto w-full flex items-center justify-between pointer-events-none">
        <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 text-xs text-slate-300 pointer-events-auto">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Orbiting Sentinel-1 / GPM IMERG</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">FPS: 60</span>
        </div>

        <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 text-xs pointer-events-auto">
          <span className="text-slate-400 font-medium">Visualization Layer:</span>
          <button className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">Rainfall Particles</button>
          <button className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200">Satellite Water Extent</button>
          <button className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200">Seismic Rings</button>
        </div>
      </div>
    </div>
  );
}
