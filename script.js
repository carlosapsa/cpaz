const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Esfera neuronal: puntos en una esfera de Fibonacci unidos a sus vecinos, girando en 3D
(() => {
  const canvas = document.getElementById('neural');
  const ctx = canvas.getContext('2d');
  const N = 260;
  const points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    points.push([Math.cos(t) * r, y, Math.sin(t) * r]);
  }
  const links = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const [a, b, c] = points[i];
      const [d, e, f] = points[j];
      if ((a - d) ** 2 + (b - e) ** 2 + (c - f) ** 2 < 0.06) links.push([i, j]);
    }
  }
  // Pulsos que viajan por las conexiones
  const pulses = Array.from({ length: 18 }, () => ({ l: Math.floor(Math.random() * links.length), t: Math.random() }));

  let w, h, dpr, cx, cy, R;
  let mx = 0, my = 0, tx = 0, ty = 0;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const wide = w > 860;
    cx = wide ? w * 0.72 : w * 0.5;
    cy = wide ? h * 0.5 : h * 0.3;
    R = wide ? Math.min(w, h) * 0.36 : Math.min(w, h) * 0.42;
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / w - 0.5) * 0.6;
    ty = (e.clientY / h - 0.5) * 0.6;
  });

  const proj = new Array(N);
  function frame(time) {
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    const ay = time * 0.00012 + mx;
    const ax = 0.35 + my;
    const sy = Math.sin(ay), cyy = Math.cos(ay), sx = Math.sin(ax), cxx = Math.cos(ax);
    for (let i = 0; i < N; i++) {
      const [x, y, z] = points[i];
      const x1 = x * cyy + z * sy;
      const z1 = -x * sy + z * cyy;
      const y1 = y * cxx - z1 * sx;
      const z2 = y * sx + z1 * cxx;
      const s = 2.4 / (2.4 + z2);
      proj[i] = [cx + x1 * R * s, cy + y1 * R * s, z2];
    }
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 0.6;
    for (const [i, j] of links) {
      const a = proj[i], b = proj[j];
      const depth = (2 - (a[2] + b[2])) / 4; // 0 detrás, 1 delante
      ctx.strokeStyle = `rgba(167,139,250,${0.05 + depth * 0.28})`;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    for (let i = 0; i < N; i++) {
      const p = proj[i];
      const depth = (1 - p[2]) / 2;
      ctx.fillStyle = `rgba(226,232,255,${0.15 + depth * 0.75})`;
      ctx.beginPath(); ctx.arc(p[0], p[1], 0.6 + depth * 1.4, 0, Math.PI * 2); ctx.fill();
    }
    for (const pulse of pulses) {
      if (!reduceMotion) pulse.t += 0.012;
      if (pulse.t > 1) { pulse.t = 0; pulse.l = Math.floor(Math.random() * links.length); }
      const [i, j] = links[pulse.l];
      const a = proj[i], b = proj[j];
      const x = a[0] + (b[0] - a[0]) * pulse.t;
      const y = a[1] + (b[1] - a[1]) * pulse.t;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 8);
      g.addColorStop(0, 'rgba(34,211,238,.9)');
      g.addColorStop(1, 'rgba(34,211,238,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

// Aparición al hacer scroll
const targets = document.querySelectorAll('.section-head, .glass, .closing > *');
if ('IntersectionObserver' in window && !reduceMotion) {
  targets.forEach((el) => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  targets.forEach((el) => io.observe(el));
} else {
  targets.forEach((el) => el.classList.add('in'));
}

// Terminal que escribe lo que se está construyendo
(() => {
  const el = document.getElementById('typed');
  const lines = [
    'git commit -m "ahora sí funciona"',
    'npm run dev',
    'git revert HEAD  # mejor no',
    'python prueba_rapida.py',
  ];
  if (reduceMotion) { el.textContent = lines[0]; return; }
  let li = 0, ci = 0, deleting = false;
  function tick() {
    const line = lines[li];
    ci += deleting ? -1 : 1;
    el.textContent = line.slice(0, ci);
    let delay = deleting ? 25 : 55;
    if (!deleting && ci === line.length) { deleting = true; delay = 1800; }
    else if (deleting && ci === 0) { deleting = false; li = (li + 1) % lines.length; delay = 400; }
    setTimeout(tick, delay);
  }
  tick();
})();
