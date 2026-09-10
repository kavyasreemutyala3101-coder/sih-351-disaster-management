import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CloudRain, Mountain, Activity, Thermometer, RotateCcw, Play, Pause, Satellite, MousePointer2, Search, MapPin } from 'lucide-react';
import { geocodePlaceName } from '../utils/geocoder';

const HAZARDS = [
  { id: 'rain', label: 'Rain + Runoff', icon: CloudRain, description: 'Rainfall particles and rising surface water' },
  { id: 'glacier', label: 'Glacier Retreat', icon: Thermometer, description: 'Ice mass, meltwater and retreat timeline' },
  { id: 'landslide', label: 'Landslide', icon: Mountain, description: 'Slope deformation and moving debris' },
  { id: 'earthquake', label: 'Earthquake', icon: Activity, description: 'Seismic field and expanding shockwaves' },
];

export default function ThreeHazardVisualizer() {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const [activeHazard, setActiveHazard] = useState('rain');
  const [glacierYear, setGlacierYear] = useState(2026);
  const [rainRate, setRainRate] = useState(85);
  const [seismicMag, setSeismicMag] = useState(6.4);
  const [autoRotate, setAutoRotate] = useState(true);
  const [satAiResult, setSatAiResult] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [placeNameInput, setPlaceNameInput] = useState('Bhadrachalam');
  const [activePlace, setActivePlace] = useState({ name: 'Bhadrachalam', lat: 17.6688, lng: 80.8936 });

  const fetchSatelliteForPlace = async (name) => {
    setLoadingAi(true);
    try {
      const geo = await geocodePlaceName(name);
      setActivePlace(geo);
      const res = await fetch('/api/predict/satellite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_name: geo.name,
          latitude: geo.lat,
          longitude: geo.lng
        })
      });
      if (!res.ok) throw new Error('Satellite API unavailable');
      const json = await res.json();
      setSatAiResult(json);
    } catch (e) {
      setSatAiResult({
        satellite_telemetry: { rainfall_intensity_mm_hr: rainRate, cloud_cover_pct: 72, provider: 'Local demo fallback', data_badge: 'DEMO DATA' },
        ai_summary: `Satellite telemetry for ${name} loaded. 3D hazard engine operational.`
      });
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchSatelliteForPlace('Bhadrachalam');
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 380);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x020617, 120, 340);
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 30, 105);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 55;
    controls.maxDistance = 220;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.8;
    controlsRef.current = controls;

    scene.add(new THREE.HemisphereLight(0xbfeaff, 0x0b1020, 1.5));
    const key = new THREE.DirectionalLight(0x67e8f9, 2.0); key.position.set(50, 90, 40); scene.add(key);
    const fill = new THREE.PointLight(0x8b5cf6, 45, 180); fill.position.set(-70, 30, 70); scene.add(fill);

    const group = new THREE.Group();
    scene.add(group);
    const animated = [];

    const addGround = (color = 0x071526) => {
      const g = new THREE.CylinderGeometry(52, 58, 3, 64);
      const m = new THREE.MeshStandardMaterial({ color, roughness: .92, metalness: .08 });
      const mesh = new THREE.Mesh(g, m); mesh.position.y = -2; group.add(mesh);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(48, .25, 8, 96), new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: .45 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = -.2; group.add(ring);
    };

    if (activeHazard === 'rain') {
      addGround(0x071827);
      const water = new THREE.Mesh(new THREE.CylinderGeometry(48, 48, 1.2, 64), new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transparent: true, opacity: .58, roughness: .15, metalness: .15 }));
      water.position.y = 1.0 + (rainRate / 100) * 2.4; group.add(water); animated.push({ type: 'water', mesh: water });
      const rainCount = Math.floor(rainRate * 18);
      const geo = new THREE.BufferGeometry(); const pos = new Float32Array(rainCount * 3);
      for (let i = 0; i < rainCount; i++) { const j = i * 3; pos[j] = (Math.random()-.5)*105; pos[j+1] = Math.random()*95; pos[j+2]=(Math.random()-.5)*105; }
      geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
      const rain = new THREE.Points(geo, new THREE.PointsMaterial({ color:0x7dd3fc, size:1.35, transparent:true, opacity:.82 })); group.add(rain); animated.push({ type:'rain', mesh:rain });
      for (let i=0;i<9;i++) { const b=new THREE.Mesh(new THREE.BoxGeometry(7+Math.random()*6,7+Math.random()*12,7+Math.random()*6),new THREE.MeshStandardMaterial({color:0x334155,roughness:.9})); b.position.set((Math.random()-.5)*70,4,(Math.random()-.5)*70); group.add(b); }
    }

    if (activeHazard === 'glacier') {
      addGround(0x071a2a);
      const retreat = Math.max(.48, 1 - (2026-glacierYear)*.065);
      const mountain = new THREE.Mesh(new THREE.ConeGeometry(44, 55, 5), new THREE.MeshStandardMaterial({ color:0x263449, roughness:1 }));
      mountain.position.y = 23; mountain.rotation.y=.6; group.add(mountain);
      const ice = new THREE.Mesh(new THREE.IcosahedronGeometry(31,2), new THREE.MeshPhysicalMaterial({ color:0xbfe8ff, roughness:.18, transmission:.18, transparent:true, opacity:.9 }));
      ice.scale.set(retreat, .72, 1.02); ice.position.set(0,18,0); group.add(ice);
      for(let i=0;i<18;i++) { const s=new THREE.Mesh(new THREE.ConeGeometry(.9+Math.random()*1.8,5+Math.random()*11,5),new THREE.MeshPhysicalMaterial({color:0x93c5fd,transparent:true,opacity:.82})); s.position.set((Math.random()-.5)*42,2+Math.random()*13,(Math.random()-.5)*34); group.add(s); }
      const melt = new THREE.Mesh(new THREE.CylinderGeometry(4.5,8,42,20),new THREE.MeshPhysicalMaterial({color:0x38bdf8,transparent:true,opacity:.7})); melt.rotation.z=Math.PI/2.5; melt.position.set(5,3,15); group.add(melt); animated.push({type:'pulse',mesh:melt});
    }

    if (activeHazard === 'landslide') {
      addGround(0x20120d);
      const slopeGeo = new THREE.ConeGeometry(55, 65, 32, 8, true);
      const slope = new THREE.Mesh(slopeGeo, new THREE.MeshStandardMaterial({ color:0x713f12, roughness:1 })); slope.rotation.z=.72; slope.position.set(-7,26,0); group.add(slope);
      const slidePath = new THREE.Mesh(new THREE.BoxGeometry(20,2,55),new THREE.MeshStandardMaterial({color:0x92400e,roughness:1})); slidePath.rotation.z=.72; slidePath.position.set(19,6,0); group.add(slidePath);
      for(let i=0;i<80;i++){ const r=.7+Math.random()*1.8; const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(r,0),new THREE.MeshStandardMaterial({color:0xb45309,roughness:1})); rock.position.set(10+Math.random()*34,4+Math.random()*30,(Math.random()-.5)*35); group.add(rock); animated.push({type:'debris',mesh:rock,speed:.015+Math.random()*.03}); }
      const warning=new THREE.Mesh(new THREE.TorusGeometry(36,.45,8,64),new THREE.MeshBasicMaterial({color:0xf59e0b,transparent:true,opacity:.65})); warning.rotation.x=Math.PI/2; warning.position.y=.8; group.add(warning); animated.push({type:'pulse',mesh:warning});
    }

    if (activeHazard === 'earthquake') {
      addGround(0x080c15);
      for(let i=0;i<28;i++){ const h=8+Math.random()*28; const b=new THREE.Mesh(new THREE.BoxGeometry(5+Math.random()*5,h,5+Math.random()*5),new THREE.MeshStandardMaterial({color:i%4===0?0x475569:0x1e293b,roughness:.88})); b.position.set((Math.random()-.5)*76,h/2,(Math.random()-.5)*70); group.add(b); }
      for(let r=1;r<=Math.floor(seismicMag);r++){ const ring=new THREE.Mesh(new THREE.RingGeometry(r*8,r*8+.8,96),new THREE.MeshBasicMaterial({color:0xef4444,side:THREE.DoubleSide,transparent:true,opacity:.62/r})); ring.rotation.x=-Math.PI/2; ring.position.y=1; group.add(ring); animated.push({type:'shock',mesh:ring,delay:r*.16}); }
      const epicenter=new THREE.Mesh(new THREE.SphereGeometry(3.5,32,32),new THREE.MeshBasicMaterial({color:0xef4444})); epicenter.position.y=2; group.add(epicenter); animated.push({type:'pulse',mesh:epicenter});
    }

    let raf;
    const clock = new THREE.Clock();
    const animate = () => {
      raf=requestAnimationFrame(animate); controls.update();
      const t=clock.getElapsedTime();
      animated.forEach((a,idx)=>{
        if(a.type==='rain'){ const p=a.mesh.geometry.attributes.position.array; for(let i=1;i<p.length;i+=3){p[i]-=1.7;if(p[i]<0)p[i]=90;} a.mesh.geometry.attributes.position.needsUpdate=true; }
        if(a.type==='water'){ a.mesh.scale.x=1+Math.sin(t*1.7)*.012; a.mesh.scale.z=1+Math.cos(t*1.5)*.012; }
        if(a.type==='pulse'){ const s=1+Math.sin(t*2+idx)*.08; a.mesh.scale.set(s,s,s); }
        if(a.type==='shock'){ const s=1+((t+a.delay)%2)*.12; a.mesh.scale.set(s,s,s); }
        if(a.type==='debris'){ a.mesh.position.x += a.speed; if(a.mesh.position.x>48)a.mesh.position.x=8; }
      });
      if(activeHazard==='earthquake') group.position.x=Math.sin(t*22)*(seismicMag*.05); else group.position.x=0;
      renderer.render(scene,camera);
    };
    animate();

    const onResize=()=>{const w=Math.max(container.clientWidth,320),h=Math.max(container.clientHeight,380);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};
    window.addEventListener('resize',onResize);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); controlsRef.current=null; controls.dispose(); renderer.dispose(); container.removeChild(renderer.domElement); };
  }, [activeHazard, glacierYear, rainRate, seismicMag, autoRotate]);

  const current = HAZARDS.find((h)=>h.id===activeHazard);
  const telemetry = satAiResult?.satellite_telemetry;

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      <section className="glass-panel p-4 sm:p-6 rounded-2xl border-cyan-500/30">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-2.5 py-1 text-[9px] font-black rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">3D MODEL LAB</span>
              <span className="px-2.5 py-1 text-[9px] font-black rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 uppercase tracking-wider">INTERACTIVE · LIVE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">Multi-Hazard 3D Simulation</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">Every model is rendered in Three.js. Rotate, zoom and inspect the active hazard; controls on the right change the model in real time.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={()=>setAutoRotate(v=>!v)} className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 hover:border-cyan-700">
              {autoRotate?<Pause size={14}/>:<Play size={14}/>} {autoRotate?'Pause orbit':'Auto orbit'}
            </button>
            <button onClick={()=>{const c=controlsRef.current;if(c){c.reset();}}} className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 hover:border-cyan-700"><RotateCcw size={14}/> Reset view</button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-5">
          {HAZARDS.map((h)=><button key={h.id} onClick={()=>setActiveHazard(h.id)} className={`text-left p-3 rounded-xl border transition-all ${activeHazard===h.id?'bg-cyan-500/15 border-cyan-400/45 shadow-lg shadow-cyan-500/10':'bg-slate-950/55 border-slate-800 hover:border-slate-700'}`}>
            <div className="flex items-center gap-2"><h.icon size={16} className={activeHazard===h.id?'text-cyan-300':'text-slate-500'}/><span className="text-xs font-extrabold text-slate-200">{h.label}</span></div>
            <p className="text-[9px] leading-relaxed text-slate-500 mt-1 hidden sm:block">{h.description}</p>
          </button>)}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        <section className="glass-panel rounded-2xl overflow-hidden xl:col-span-8 border-cyan-900/40">
          <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border-b border-slate-800/80 bg-slate-950/35">
            <div><div className="text-[9px] font-black tracking-[.15em] text-cyan-400">ACTIVE MODEL</div><div className="text-sm font-bold text-white mt-1">{current.label}</div></div>
            <div className="flex items-center gap-2 text-[9px] text-slate-400"><MousePointer2 size={13} className="text-cyan-400"/> Drag · wheel/pinch · inspect</div>
          </div>
          <div ref={mountRef} className="h-[390px] sm:h-[520px] relative bg-[radial-gradient(circle_at_50%_45%,rgba(8,47,73,.34),transparent_52%)]" />
          <div className="px-4 py-3 text-[10px] text-slate-500 border-t border-slate-800/70">Tip: use Auto orbit for presentation mode, then pause to manually inspect the model.</div>
        </section>

        <aside className="glass-panel p-4 sm:p-5 rounded-2xl xl:col-span-4 space-y-4 border-cyan-900/40">
          <div className="flex items-center gap-2"><Satellite size={17} className="text-cyan-400"/><div><h3 className="text-sm font-bold text-slate-100">Model controls</h3><p className="text-[9px] text-slate-500">Live parameters update the 3D scene</p></div></div>

          {/* Place Name Search Input */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 p-3 space-y-2">
            <label className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Target Place Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={placeNameInput}
                onChange={(e) => setPlaceNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchSatelliteForPlace(placeNameInput)}
                placeholder="Enter place name (e.g. Bhadrachalam)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => fetchSatelliteForPlace(placeNameInput)}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
              >
                Analyze
              </button>
            </div>
            <div className="text-[10px] text-slate-400">
              Active Sector: <strong className="text-white">{activePlace.name}</strong>
            </div>
          </div>

          {activeHazard==='rain' && <Control label={`Rainfall intensity · ${rainRate} mm/hr`}><input type="range" min="20" max="150" value={rainRate} onChange={e=>setRainRate(Number(e.target.value))}/></Control>}
          {activeHazard==='glacier' && <Control label={`Simulation year · ${glacierYear}`}><input type="range" min="2018" max="2026" step="2" value={glacierYear} onChange={e=>setGlacierYear(Number(e.target.value))}/></Control>}
          {activeHazard==='earthquake' && <Control label={`Magnitude · ${seismicMag} Mw`}><input type="range" min="3" max="9" step="0.2" value={seismicMag} onChange={e=>setSeismicMag(Number(e.target.value))}/></Control>}
          {activeHazard==='landslide' && <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"><div className="text-xs font-bold text-amber-300">Slope movement model</div><p className="text-[10px] text-slate-400 mt-1">Debris continuously moves down the simulated slope. Switch to another hazard to compare model behaviour.</p></div>}

          <div className="grid grid-cols-2 gap-2">
            <Metric label="Rainfall" value={`${telemetry?.rainfall_intensity_mm_hr ?? rainRate} mm/h`} />
            <Metric label="Cloud cover" value={`${telemetry?.cloud_cover_pct ?? 72}%`} />
            <Metric label="Model status" value="RUNNING" good />
            <Metric label="Renderer" value="THREE.JS" />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="flex justify-between items-center"><span className="text-[9px] font-black tracking-wider text-cyan-300">SATELLITE AI</span><span className="text-[8px] text-emerald-400">{telemetry?.data_badge || 'LOADING'}</span></div>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-2">{loadingAi?'Fetching telemetry…':(satAiResult?.ai_summary || 'Waiting for model output…')}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Control({ label, children }) { return <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"><div className="text-[10px] font-bold text-slate-300 mb-2">{label}</div>{children}</div>; }
function Metric({ label, value, good }) { return <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-2.5"><div className="text-[8px] uppercase tracking-wider text-slate-500">{label}</div><div className={`text-xs font-extrabold mt-1 ${good?'text-emerald-400':'text-slate-200'}`}>{value}</div></div>; }
