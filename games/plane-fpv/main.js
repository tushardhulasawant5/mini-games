// No imports; uses global THREE from three.min.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('c');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const hint = document.getElementById('hint');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const speedEl = document.getElementById('speed');

let renderer, scene, camera, world;
let last = 0, running = false;

// Game state
let score = 0;
let lives = 3;
let forwardSpeed = 300; // fake units/s
let boost = 0;

// Player “airframe” (carrier for the camera)
const airframe = new THREE.Object3D();
airframe.position.set(0, 10, 0);

// Input
const keys = Object.create(null);
let mouseLocked = false;
let mouseDX = 0, mouseDY = 0;
let supportsPointerLock = 'pointerLockElement' in document;

// Pools
const enemies = new Set(); // {mesh, radius}
const bullets = new Set(); // {mesh, vel, life, radius}

function init() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b1020, 0.002);

  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 5000);
  airframe.add(camera);
  camera.position.set(0, 0.8, 0.5);
  scene.add(airframe);

  // Lights
  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x0b1020, 0.7));
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(200, 300, 100);
  scene.add(dir);

  // Sky
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(4000, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0x121a34, side: THREE.BackSide })
  );
  scene.add(sky);

  // World group
  world = new THREE.Group();
  scene.add(world);

  // Ground grid
  const gridMat = new THREE.LineBasicMaterial({ color: 0x2244aa, transparent: true, opacity: 0.35 });
  const gridGeo = new THREE.BufferGeometry();
  const lines = [];
  const span = 1000, step = 50, depth = 4000;
  for (let x = -span; x <= span; x += step) lines.push(x, 0, -depth, x, 0, 0);
  for (let z = -depth; z <= 0; z += step) lines.push(-span, 0, z, span, 0, z);
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
  world.add(new THREE.LineSegments(gridGeo, gridMat));

  // Stars
  const starCount = 1000, starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPos[i*3+0] = (Math.random() - 0.5) * 2000;
    starPos[i*3+1] = Math.random() * 800 - 200;
    starPos[i*3+2] = -Math.random() * 4000;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  world.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 2, color: 0xdbe6ff, sizeAttenuation: true, transparent: true, opacity: 0.7 })));

  // Spawn some enemies
  for (let i = 0; i < 12; i++) spawnEnemy(true);

  // Events
  addEventListener('resize', onResize);
  addEventListener('keydown', e => {
    keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    if (e.code === 'Escape' && document.pointerLockElement) document.exitPointerLock();
  });
  addEventListener('keyup', e => { keys[e.code] = false; });

  document.addEventListener('pointerlockchange', () => mouseLocked = (document.pointerLockElement === canvas));
  document.addEventListener('pointerlockerror', () => hint.textContent = 'Pointer lock blocked — use mouse+keys without lock.');
  document.addEventListener('mousemove', e => {
    if (mouseLocked) { mouseDX += e.movementX || 0; mouseDY += e.movementY || 0; }
  }, { passive: true });

  startBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    hint.textContent = '';
    // Try to lock; if unsupported, we still run (keyboard works, mouse turn has fallback)
    if (supportsPointerLock) canvas.requestPointerLock();
    running = true;
    last = performance.now();
    requestAnimationFrame(loop);
  });

  // Mouse-look fallback (no pointer lock): small deltas from center
  canvas.addEventListener('mousemove', e => {
    if (!mouseLocked && running) {
      const cx = innerWidth / 2, cy = innerHeight / 2;
      mouseDX += (e.clientX - cx) * 0.01;
      mouseDY += (e.clientY - cy) * 0.01;
    }
  });

  updateHUD();
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

function spawnEnemy(initial=false) {
  const body = new THREE.Mesh(new THREE.ConeGeometry(6, 18, 12), new THREE.MeshStandardMaterial({ color: 0xff7a7a, metalness: 0.1, roughness: 0.6 }));
  body.rotation.x = Math.PI / 2;

  const wing = new THREE.Mesh(new THREE.BoxGeometry(20, 0.8, 4), new THREE.MeshStandardMaterial({ color: 0xff9c9c, metalness: 0.1, roughness: 0.7 }));
  wing.position.z = -2;

  const enemy = new THREE.Group();
  enemy.add(body); enemy.add(wing);
  const radius = 6.5;

  const xSpan = 200;
  enemy.position.set((Math.random() - 0.5) * xSpan, THREE.MathUtils.randFloat(2, 60), -THREE.MathUtils.randFloat(500, 1500));
  if (initial) enemy.position.z = -THREE.MathUtils.randFloat(100, 1500);

  world.add(enemy);
  enemies.add({ mesh: enemy, radius });
}

function fireBullet() {
  const geo = new THREE.SphereGeometry(0.6, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffe07a });
  const b = new THREE.Mesh(geo, mat);
  b.position.copy(airframe.getWorldPosition(new THREE.Vector3()));
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(airframe.quaternion).normalize();
  b.position.addScaledVector(dir, 2.0);
  world.add(b);
  bullets.add({ mesh: b, vel: dir.clone().multiplyScalar(800), life: 2.0, radius: 0.8 });
}

function resetRound() {
  enemies.forEach(e => world.remove(e.mesh)); enemies.clear();
  bullets.forEach(b => world.remove(b.mesh)); bullets.clear();
  score = 0; lives = 3; forwardSpeed = 300; boost = 0;
  airframe.position.set(0, 10, 0);
  airframe.quaternion.identity();
  for (let i = 0; i < 10; i++) spawnEnemy(true);
  updateHUD();
}

function loop(t) {
  if (!running) return;
  const dt = Math.min(0.033, (t - last) / 1000 || 0.016);
  last = t;

  // Mouse + keys -> orientation
  const mouseSens = 0.0018;
  const yawRate   = 1.1, pitchRate = 1.1, rollRate = 1.8;

  const yawDelta   = -mouseDX * mouseSens;
  const pitchDelta = -mouseDY * mouseSens;
  mouseDX = mouseDY = 0;

  const keyYaw   = (keys['KeyA'] ? 1 : 0) - (keys['KeyD'] ? 1 : 0);
  const keyPitch = (keys['KeyS'] ? 1 : 0) - (keys['KeyW'] ? 1 : 0);
  const keyRoll  = (keys['KeyQ'] ? 1 : 0) - (keys['KeyE'] ? 1 : 0);

  const q = new THREE.Quaternion();
  const dqYaw   = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), yawDelta + keyYaw * yawRate * dt);
  const dqPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), pitchDelta + keyPitch * pitchRate * dt);
  const dqRoll  = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), keyRoll * rollRate * dt);
  q.multiplyQuaternions(dqYaw, dqPitch); q.multiply(dqRoll);
  airframe.quaternion.multiply(q).normalize();

  // Speed / boost
  boost = (keys['ShiftLeft'] || keys['ShiftRight']) ? 250 : 0;
  const speed = forwardSpeed + boost;

  // Move world backwards to simulate forward motion
  world.position.addScaledVector(new THREE.Vector3(0,0,1).applyQuaternion(airframe.quaternion), speed * dt);

  // Fire
  if (keys['Space']) {
    if (!fireBullet.cooldown || (t - fireBullet.cooldown) > 120) {
      fireBullet();
      fireBullet.cooldown = t;
    }
  }

  // Bullets
  bullets.forEach(b => {
    b.mesh.position.addScaledVector(b.vel, dt);
    b.life -= dt;
    if (b.life <= 0) { world.remove(b.mesh); bullets.delete(b); }
  });

  // Spawn enemies
  if (!loop.spawnTimer) loop.spawnTimer = 0;
  loop.spawnTimer -= dt;
  if (loop.spawnTimer <= 0) {
    spawnEnemy(false);
    loop.spawnTimer = Math.max(0.25, 1.6 - score * 0.002);
  }

  // Move enemies forward
  const playerPos = airframe.getWorldPosition(new THREE.Vector3());
  enemies.forEach(e => {
    const dir = new THREE.Vector3(0,0,1).applyQuaternion(airframe.quaternion);
    e.mesh.position.addScaledVector(dir, speed * dt * 0.92);
    e.mesh.position.y += Math.sin(t * 0.002 + e.mesh.position.x * 0.02) * 3 * dt;

    // Despawn behind player
    const rel = e.mesh.position.clone().sub(playerPos).applyQuaternion(airframe.quaternion.clone().invert());
    if (rel.z > 50) { world.remove(e.mesh); enemies.delete(e); spawnEnemy(false); }
  });

  // Collisions
  bullets.forEach(b => {
    enemies.forEach(e => {
      if (b.mesh.position.distanceTo(e.mesh.position) < (b.radius + e.radius)) {
        score += 10; spawnExplosion(e.mesh.position);
        world.remove(e.mesh); enemies.delete(e);
        world.remove(b.mesh); bullets.delete(b);
      }
    });
  });

  const nose = playerPos.clone().add(new THREE.Vector3(0,0,-4).applyQuaternion(airframe.quaternion));
  enemies.forEach(e => {
    if (nose.distanceTo(e.mesh.position) < e.radius + 2) {
      lives -= 1; spawnExplosion(e.mesh.position);
      world.remove(e.mesh); enemies.delete(e);
      if (lives <= 0) {
        running = false;
        overlay.style.display = 'grid';
        startBtn.textContent = 'Restart';
        resetRound();
        return;
      }
    }
  });

  updateHUD();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

function spawnExplosion(p) {
  const geo = new THREE.SphereGeometry(0.5, 6, 6);
  for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffd4a3 }));
    m.position.copy(p);
    world.add(m);
    const v = new THREE.Vector3((Math.random()-0.5)*120, (Math.random()-0.5)*120, (Math.random()-0.5)*120);
    const life = 0.4 + Math.random()*0.5;
    const birth = performance.now();
    (function tick() {
      const t = (performance.now() - birth)/1000;
      m.position.addScaledVector(v, 0.016);
      m.material.opacity = THREE.MathUtils.clamp(1 - t / life, 0, 1);
      m.material.transparent = true;
      if (t < life) requestAnimationFrame(tick);
      else world.remove(m);
    })();
  }
}

function updateHUD() {
  scoreEl.textContent = `Score: ${score}`;
  livesEl.textContent = `Lives: ${lives}`;
  speedEl.textContent = `Speed: ${Math.round(forwardSpeed + (boost?250:0))}`;
}

init();
resetRound();
