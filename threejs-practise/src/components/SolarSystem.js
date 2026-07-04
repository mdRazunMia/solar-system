import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const PLANETS = [
  {
    name: 'Mercury', radius: 0.4, distance: 8, speed: 4.15, rotationSpeed: 0.005,
    info: {
      type: 'Terrestrial',
      diameter: '4,879 km',
      distanceFromSun: '57.9 million km',
      orbitalPeriod: '88 days',
      dayLength: '59 Earth days',
      moons: '0',
      temperature: '-173°C to 427°C',
      description: 'The smallest planet and closest to the Sun. Mercury has virtually no atmosphere and its surface is covered with craters, resembling Earth\'s Moon.',
    },
  },
  {
    name: 'Venus', radius: 0.9, distance: 12, speed: 1.62, rotationSpeed: 0.003,
    info: {
      type: 'Terrestrial',
      diameter: '12,104 km',
      distanceFromSun: '108.2 million km',
      orbitalPeriod: '225 days',
      dayLength: '243 Earth days',
      moons: '0',
      temperature: '462°C (average)',
      description: 'The hottest planet in our solar system due to a runaway greenhouse effect. Venus rotates backwards compared to most planets and is often called Earth\'s "sister planet".',
    },
  },
  {
    name: 'Earth', radius: 1.0, distance: 17, speed: 1.0, rotationSpeed: 0.01,
    info: {
      type: 'Terrestrial',
      diameter: '12,742 km',
      distanceFromSun: '149.6 million km',
      orbitalPeriod: '365.25 days',
      dayLength: '24 hours',
      moons: '1 (The Moon)',
      temperature: '15°C (average)',
      description: 'Our home planet and the only known world to harbor life. About 71% of Earth\'s surface is covered by water, and it has a protective magnetic field and thick atmosphere.',
    },
  },
  {
    name: 'Mars', radius: 0.5, distance: 22, speed: 0.53, rotationSpeed: 0.009,
    info: {
      type: 'Terrestrial',
      diameter: '6,779 km',
      distanceFromSun: '227.9 million km',
      orbitalPeriod: '687 days',
      dayLength: '24.6 hours',
      moons: '2 (Phobos, Deimos)',
      temperature: '-63°C (average)',
      description: 'The Red Planet, colored by iron oxide dust. Mars hosts Olympus Mons, the tallest volcano in the solar system, and Valles Marineris, a canyon stretching 4,000 km.',
    },
  },
  {
    name: 'Jupiter', radius: 2.5, distance: 32, speed: 0.084, rotationSpeed: 0.02,
    info: {
      type: 'Gas Giant',
      diameter: '139,820 km',
      distanceFromSun: '778.5 million km',
      orbitalPeriod: '11.9 years',
      dayLength: '9.9 hours',
      moons: '95 known',
      temperature: '-110°C (cloud top)',
      description: 'The largest planet in our solar system. Jupiter\'s Great Red Spot is a storm larger than Earth that has raged for centuries. It acts as a cosmic shield, deflecting asteroids.',
    },
  },
  {
    name: 'Saturn', radius: 2.0, distance: 42, speed: 0.034, rotationSpeed: 0.018, ring: true,
    info: {
      type: 'Gas Giant',
      diameter: '116,460 km',
      distanceFromSun: '1.43 billion km',
      orbitalPeriod: '29.5 years',
      dayLength: '10.7 hours',
      moons: '146 known',
      temperature: '-140°C (cloud top)',
      description: 'Famous for its spectacular ring system made of ice and rock particles. Saturn is the least dense planet — it would float in a giant bathtub of water.',
    },
  },
  {
    name: 'Uranus', radius: 1.5, distance: 52, speed: 0.012, rotationSpeed: 0.015,
    info: {
      type: 'Ice Giant',
      diameter: '50,724 km',
      distanceFromSun: '2.87 billion km',
      orbitalPeriod: '84 years',
      dayLength: '17.2 hours',
      moons: '27 known',
      temperature: '-195°C (cloud top)',
      description: 'Uranus rotates on its side with an axial tilt of 98°, likely from an ancient collision. Its blue-green color comes from methane in the atmosphere.',
    },
  },
  {
    name: 'Neptune', radius: 1.4, distance: 60, speed: 0.006, rotationSpeed: 0.012,
    info: {
      type: 'Ice Giant',
      diameter: '49,244 km',
      distanceFromSun: '4.5 billion km',
      orbitalPeriod: '165 years',
      dayLength: '16.1 hours',
      moons: '14 known',
      temperature: '-200°C (cloud top)',
      description: 'The windiest planet, with gusts reaching 2,100 km/h. Neptune was the first planet located through mathematical prediction rather than direct observation.',
    },
  },
];

const PLANET_TEXTURES = {
  Mercury: { base: '#b5b5b5', spots: ['#8a8a8a', '#9e9e9e', '#777777'], type: 'rocky' },
  Venus: { base: '#e8cda0', bands: ['#d4b896', '#c9a87c', '#f0dbb8'], type: 'cloudy' },
  Earth: { base: '#2255aa', spots: ['#33aa44', '#2d8a3e', '#55bb55'], type: 'earth' },
  Mars: { base: '#cc4422', spots: ['#aa3311', '#dd6644', '#994433'], type: 'rocky' },
  Jupiter: { bands: ['#d4a96a', '#c48a4a', '#e8c88a', '#b07040', '#ddb87a', '#a06830', '#ccaa66'], type: 'banded' },
  Saturn: { bands: ['#e8d5a3', '#d4c090', '#c8b07a', '#f0e0b8', '#b8a070', '#dcc898'], type: 'banded' },
  Uranus: { base: '#88ccdd', bands: ['#77bbcc', '#99ddee', '#66aabb'], type: 'smooth' },
  Neptune: { base: '#3344aa', bands: ['#2233aa', '#4455bb', '#2244cc', '#5566cc'], type: 'smooth' },
};

function generateTexture(name, size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cfg = PLANET_TEXTURES[name];

  if (cfg.type === 'banded') {
    const bandCount = cfg.bands.length * 3;
    for (let i = 0; i < bandCount; i++) {
      const y = (i / bandCount) * size;
      const h = size / bandCount + Math.random() * 4;
      ctx.fillStyle = cfg.bands[i % cfg.bands.length];
      ctx.fillRect(0, y, size, h);
    }
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const w = Math.random() * 40 + 5;
      ctx.fillStyle = cfg.bands[Math.floor(Math.random() * cfg.bands.length)];
      ctx.globalAlpha = 0.3;
      ctx.fillRect(x, y, w, 2);
    }
    ctx.globalAlpha = 1;
  } else if (cfg.type === 'earth') {
    ctx.fillStyle = cfg.base;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 40 + 10;
      ctx.fillStyle = cfg.spots[Math.floor(Math.random() * cfg.spots.length)];
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 30 + 10, Math.random() * 10 + 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (cfg.type === 'rocky') {
    ctx.fillStyle = cfg.base;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 15 + 2;
      ctx.fillStyle = cfg.spots[Math.floor(Math.random() * cfg.spots.length)];
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (cfg.type === 'smooth') {
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    cfg.bands.forEach((c, i) => grad.addColorStop(i / (cfg.bands.length - 1), c));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 50 + 20, Math.random() * 10 + 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (cfg.type === 'cloudy') {
    ctx.fillStyle = cfg.base;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.fillStyle = cfg.bands[Math.floor(Math.random() * cfg.bands.length)];
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 60 + 20, Math.random() * 30 + 10, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  return new THREE.CanvasTexture(canvas);
}

function generateSunTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, '#ffffaa');
  grad.addColorStop(0.3, '#ffdd33');
  grad.addColorStop(0.7, '#ffaa00');
  grad.addColorStop(1, '#ff6600');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 20 + 5;
    ctx.fillStyle = Math.random() > 0.5 ? '#ffee44' : '#ff8800';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  return new THREE.CanvasTexture(canvas);
}

function generateRingTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const colors = ['#c8b07a', '#d4c090', '#a89060', '#e0d0a0', '#b09870', '#c0a878'];
  for (let x = 0; x < size; x++) {
    const c = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.4 + Math.random() * 0.5;
    ctx.fillRect(x, 0, 1, 64);
  }
  ctx.globalAlpha = 1;
  return new THREE.CanvasTexture(canvas);
}

function createStarfield(scene) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i < 8000; i++) {
    const x = (Math.random() - 0.5) * 600;
    const y = (Math.random() - 0.5) * 600;
    const z = (Math.random() - 0.5) * 600;
    vertices.push(x, y, z);
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, sizeAttenuation: true });
  scene.add(new THREE.Points(geometry, material));
}

function createSun(scene) {
  const texture = generateSunTexture();
  const geometry = new THREE.SphereGeometry(4, 64, 64);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const sun = new THREE.Mesh(geometry, material);
  scene.add(sun);

  const glowGeometry = new THREE.SphereGeometry(4.5, 64, 64);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(glowGeometry, glowMaterial));

  const light = new THREE.PointLight(0xffffff, 2, 300);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x555555));

  return sun;
}

function createOrbitLine(scene, distance) {
  const curve = new THREE.EllipseCurve(0, 0, distance, distance, 0, 2 * Math.PI, false, 0);
  const points = curve.getPoints(128);
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map((p) => new THREE.Vector3(p.x, 0, p.y))
  );
  const material = new THREE.LineBasicMaterial({ color: 0x444466, transparent: true, opacity: 0.4 });
  scene.add(new THREE.Line(geometry, material));
}

function createPlanet(scene, config) {
  const pivot = new THREE.Object3D();
  scene.add(pivot);

  const geometry = new THREE.SphereGeometry(config.radius, 32, 32);
  const texture = generateTexture(config.name);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.7,
    metalness: 0.1,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = config.distance;
  pivot.add(mesh);

  if (config.ring) {
    const ringTex = generateRingTexture();
    const ringGeo = new THREE.RingGeometry(config.radius * 1.4, config.radius * 2.2, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2.5;
    mesh.add(ring);
  }

  createOrbitLine(scene, config.distance);
  return { pivot, mesh, config };
}

function InfoPanel({ data, onClose }) {
  if (!data) return null;
  return (
    <div style={{
      position: 'absolute',
      top: 20,
      right: 20,
      width: 320,
      padding: 20,
      background: 'rgba(10, 15, 35, 0.85)',
      color: '#fff',
      borderRadius: 12,
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(100, 150, 255, 0.3)',
      fontFamily: 'system-ui, sans-serif',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: 26, color: '#88bbff', letterSpacing: 1 }}>{data.name}</h2>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 2 }}>{data.info.type}</div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          color: '#aaa',
          fontSize: 18,
          cursor: 'pointer',
          borderRadius: 4,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>x</button>
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 13, lineHeight: 1.5, color: '#ddd' }}>{data.info.description}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', fontSize: 12 }}>
        <Stat label="Diameter" value={data.info.diameter} />
        <Stat label="Moons" value={data.info.moons} />
        <Stat label="Day Length" value={data.info.dayLength} />
        <Stat label="Year Length" value={data.info.orbitalPeriod} />
        <Stat label="From Sun" value={data.info.distanceFromSun} />
        <Stat label="Temperature" value={data.info.temperature} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ color: '#889', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ color: '#fff', fontSize: 13 }}>{value}</div>
    </div>
  );
}

export default function SolarSystem() {
  const mountRef = useRef(null);
  const planetsRef = useRef([]);
  const cameraRef = useRef(null);
  const clickedRef = useRef(null);
  const labelsRef = useRef([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(30, 50, 80);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 200;

    createStarfield(scene);
    const sun = createSun(scene);
    planetsRef.current = PLANETS.map((p) => createPlanet(scene, p));

    const clock = new THREE.Clock();
    let frameId;

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      sun.rotation.y += 0.002;
      planetsRef.current.forEach(({ pivot, mesh, config }) => {
        pivot.rotation.y = elapsed * config.speed * 0.2;
        mesh.rotation.y += config.rotationSpeed;
      });

      if (!clickedRef.current) {
        let closest = null;
        let minDist = Infinity;
        planetsRef.current.forEach(({ mesh, config }) => {
          const worldPos = new THREE.Vector3();
          mesh.getWorldPosition(worldPos);
          const d = camera.position.distanceTo(worldPos);
          const threshold = config.radius * 6 + 3;
          if (d < threshold && d < minDist) {
            minDist = d;
            closest = config;
          }
        });
        setActive(closest);
      }

      planetsRef.current.forEach(({ mesh, config }, i) => {
        const worldPos = new THREE.Vector3();
        mesh.getWorldPosition(worldPos);
        const labelPos = worldPos.clone();
        labelPos.y += config.radius + 0.8;
        const projected = labelPos.project(camera);
        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;
        const label = labelsRef.current[i];
        if (label) {
          label.style.left = `${x}px`;
          label.style.top = `${y}px`;
          label.style.transform = 'translate(-50%, -50%)';
          const dist = camera.position.distanceTo(worldPos);
          label.style.opacity = projected.z > 1 ? '0' : Math.min(1, Math.max(0.3, 1 - dist / 150));
        }
      });

      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const meshes = planetsRef.current.map((p) => p.mesh);
      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        const hit = planetsRef.current.find((p) => p.mesh === intersects[0].object);
        if (hit) {
          const worldPos = new THREE.Vector3();
          hit.mesh.getWorldPosition(worldPos);
          controls.target.copy(worldPos);
          clickedRef.current = hit.config;
          setActive(hit.config);
        }
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  const handleClose = () => {
    clickedRef.current = null;
    setActive(null);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {PLANETS.map((p, i) => (
        <div
          key={p.name}
          ref={(el) => (labelsRef.current[i] = el)}
          style={{
            position: 'absolute',
            color: '#fff',
            fontSize: 11,
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 600,
            textShadow: '0 0 6px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            letterSpacing: 1,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {p.name}
        </div>
      ))}
      <InfoPanel data={active} onClose={handleClose} />
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        color: '#889',
        fontSize: 12,
        fontFamily: 'system-ui, sans-serif',
        pointerEvents: 'none',
      }}>
        Drag to rotate · Scroll to zoom · Click a planet to focus · Zoom in to see details
      </div>
    </div>
  );
}
