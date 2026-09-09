/* =========================================================
   CORTINA — pano de teatro da intro, em WebGL (Three.js).

   Não é seno: é tecido simulado (Verlet). Cada pano é uma malha de partículas
   com molas (estrutura, cisalhamento, dobra), presa em cima num trilho por
   argolas em zigue-zague — a "pinça" da prega. O tecido tem 1,85× a largura
   que cobre, então as pregas são consequência, não desenho. Gravidade, vento
   com rajadas e o balanço da bainha saem da física.

   Abrir: o cordão puxa a argola da borda interna; ela vai empurrando as outras
   até empilhar tudo na lateral (como num trilho de verdade), o pano corre
   atrás com atraso e balança. Depois a pilha sai do quadro — os projetos
   ficam em tela cheia.

   Não é clique + relógio: quem abre é o scroll. scene.js escreve o progresso
   (0→1, linear) em duas variáveis CSS no #intro — --g (empilhar) e --x (pilha
   saindo do quadro) — e cada frame aqui só lê esses dois números. Reversível:
   rolar pra cima fecha de novo, porque não há estado de "já abriu" gravado.

   Script clássico (não módulo) de propósito: abrindo o index.html direto do
   Finder (file://) o browser bloqueia módulos locais, mas deixa importar o
   Three do CDN. Se o Three não vier, a cortina CSS de styles.css segue sozinha.
   ========================================================= */
let THREE;

const intro = document.getElementById('intro');
const W = 968, H = 629;                                     // .display, em px da cena
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- tecido ---------- */
const STEP = 1 / 90;                                        // passo fixo da física
const GRAV = 1500, DAMP = 0.988, WIND = 520;
const COLS = 44, ROWS = 34, FULL = 1.85;                    // argolas, linhas, fartura do tecido
const ITER = 5;

class Pano {
  constructor(side) {
    this.side = side;
    const xo = side * (W / 2 + 60), xi = -side * W * 0.035; // trilho: de fora (i=0, além do quadro) até passar do meio
    this.closedX = new Float32Array(COLS);
    for (let i = 0; i < COLS; i++) this.closedX[i] = xo + (xi - xo) * i / (COLS - 1);
    this.pinX = Float32Array.from(this.closedX);
    this.spacing = Math.abs(xi - xo) / (COLS - 1);
    this.restDx = this.spacing * FULL;                      // tecido sobrando entre argolas → prega
    this.restDy = (H + 110) / (ROWS - 1);                   // bainha 110px abaixo da tela: balançando pra trás, a perspectiva a sobe
    this.zig = new Float32Array(COLS);                      // sinal e variação de cada prega
    for (let i = 0; i < COLS; i++) this.zig[i] = (i % 2 ? -1 : 1) * (0.86 + 0.28 * Math.random());
    this.stack = 2.6;                                       // espessura de cada prega empilhada

    const n = COLS * ROWS;
    this.pos = new Float32Array(n * 3); this.prev = new Float32Array(n * 3);
    const depth = this.pleatDepth(this.spacing);
    for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
      const k = (j * COLS + i) * 3;
      this.pos[k] = this.closedX[i];
      this.pos[k + 1] = H / 2 - j * this.restDy;
      this.pos[k + 2] = this.zig[i] * depth * (1 - 0.15 * j / (ROWS - 1));
    }
    this.prev.set(this.pos);

    // molas: [a, b, comprimento, rigidez]
    const c = [];
    const at = (i, j) => j * COLS + i;
    for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
      if (i + 1 < COLS) c.push(at(i, j), at(i + 1, j), this.restDx, 1);
      if (j + 1 < ROWS) c.push(at(i, j), at(i, j + 1), this.restDy, 1);
      if (i + 1 < COLS && j + 1 < ROWS) {
        const d = Math.hypot(this.restDx, this.restDy);
        c.push(at(i, j), at(i + 1, j + 1), d, .6);
        c.push(at(i + 1, j), at(i, j + 1), d, .6);
      }
      if (i + 2 < COLS) c.push(at(i, j), at(i + 2, j), this.restDx * 2, .04);   // dobra horizontal: quase livre (pregas)
      if (j + 2 < ROWS) c.push(at(i, j), at(i, j + 2), this.restDy * 2, .45);   // dobra vertical: pano cai liso
    }
    this.cons = Float32Array.from(c);

    // geometria
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    const uv = new Float32Array(n * 2);
    for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) { uv[(j * COLS + i) * 2] = i / (COLS - 1) * FULL; uv[(j * COLS + i) * 2 + 1] = 1 - j / (ROWS - 1); }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    const idx = [];
    for (let j = 0; j < ROWS - 1; j++) for (let i = 0; i < COLS - 1; i++) {
      const a = at(i, j), b = at(i + 1, j), d = at(i, j + 1), e = at(i + 1, j + 1);
      idx.push(a, d, b, b, d, e);
    }
    geo.setIndex(idx);
    geo.computeVertexNormals();
    this.geo = geo;
  }

  // profundidade da prega pra que o tecido entre duas argolas caiba exato: corda = restDx
  pleatDepth(sp) { return 0.5 * Math.sqrt(Math.max(this.restDx * this.restDx - sp * sp, 1)); }

  // trilho: k = abertura (0 fechado → 1 empilhado na lateral), shift = pilha saindo do quadro
  track(k, shift) {
    const stackEnd = this.closedX[0] - this.side * (COLS - 1) * this.stack;    // onde a borda interna para quando tudo empilha
    const leadX = this.closedX[COLS - 1] + (stackEnd - this.closedX[COLS - 1]) * k;
    for (let i = 0; i < COLS; i++) {
      const pushed = leadX + this.side * (COLS - 1 - i) * this.stack;          // posição se já foi empurrada pela pilha
      // a argola só se mexe quando a pilha chega nela
      this.pinX[i] = this.side < 0 ? Math.min(this.closedX[i], pushed) : Math.max(this.closedX[i], pushed);
      this.pinX[i] += shift * this.side;
    }
  }

  step(t, gust, calm = 0, pull = 0) {                       // calm 0→1: abrindo, o vento some e o pano amortece mais; pull: cordão levando o pano pra fora
    const p = this.pos, q = this.prev, dt2 = STEP * STEP, damp = DAMP - 0.03 * calm, windK = 1 - calm;   // veludo pesado: o ar segura
    // argolas presas no trilho, profundidade da prega segue o espaçamento atual
    for (let i = 0; i < COLS; i++) {
      const sp = i < COLS - 1 ? Math.abs(this.pinX[i + 1] - this.pinX[i]) : Math.abs(this.pinX[i] - this.pinX[i - 1]);
      const k = i * 3;
      p[k] = this.pinX[i]; p[k + 1] = H / 2; p[k + 2] = this.zig[i] * this.pleatDepth(sp);
      q[k] = p[k]; q[k + 1] = p[k + 1]; q[k + 2] = p[k + 2];
    }
    // Verlet
    for (let j = 1; j < ROWS; j++) {
      const h = Math.pow(j / (ROWS - 1), 1.4);              // solto embaixo, preso em cima
      for (let i = 0; i < COLS; i++) {
        const k = (j * COLS + i) * 3, x = p[k], y = p[k + 1], z = p[k + 2];
        let fx = 0, fz = 0;
        if (!reduce) {
          const nz = Math.sin(t * 0.7 + x * 0.006) * Math.sin(t * 0.53 + y * 0.008 + 1.7) + 0.5 * Math.sin(t * 1.9 + x * 0.013 - y * 0.005);
          const nx = Math.sin(t * 0.45 + y * 0.007) * 0.6 + 0.4 * Math.sin(t * 1.3 + x * 0.01);
          fz = (nz * WIND + gust.z) * h * windK;
          fx = (nx * WIND * 0.35 + gust.x) * h * windK;
        }
        fx += pull * h;                                     // na saída, a bainha acompanha a pilha em vez de ficar pendurada no quadro
        const vx = (x - q[k]) * damp, vy = (y - q[k + 1]) * damp, vz = (z - q[k + 2]) * damp;
        q[k] = x; q[k + 1] = y; q[k + 2] = z;
        p[k] = x + vx + fx * dt2;
        p[k + 1] = y + vy - GRAV * dt2;
        p[k + 2] = z + vz + fz * dt2;
      }
    }
    // molas
    const c = this.cons;
    for (let it = 0; it < ITER; it++) {
      for (let n = 0; n < c.length; n += 4) {
        const a = c[n] * 3, b = c[n + 1] * 3, rest = c[n + 2], stiff = c[n + 3];
        const dx = p[b] - p[a], dy = p[b + 1] - p[a + 1], dz = p[b + 2] - p[a + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
        const s = (d - rest) / d * stiff;
        const pa = c[n] < COLS, pb = c[n + 1] < COLS;       // linha 0 = argolas: não se mexem
        if (pa && pb) continue;
        const wa = pa ? 0 : (pb ? 1 : .5), wb = pb ? 0 : (pa ? 1 : .5);
        p[a] += dx * s * wa; p[a + 1] += dy * s * wa; p[a + 2] += dz * s * wa;
        p[b] -= dx * s * wb; p[b + 1] -= dy * s * wb; p[b + 2] -= dz * s * wb;
      }
    }
  }

  upload() { this.geo.attributes.position.needsUpdate = true; this.geo.computeVertexNormals(); }
}

/* ---------- texturas procedurais ---------- */
function veludoBump(n = 256) {
  const c = document.createElement('canvas'); c.width = c.height = n;
  const ctx = c.getContext('2d'), img = ctx.createImageData(n, n), d = img.data;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const v = 128 + (Math.random() - .5) * 64 + Math.sin(x * 1.1 + Math.sin(y * .07) * 2) * 9 + Math.sin(y * .9) * 4;
    const k = (y * n + x) * 4; d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 3);
  return t;
}
function poeiraSprite() {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const g = c.getContext('2d').createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,235,200,1)'); g.addColorStop(.35, 'rgba(255,225,180,.55)'); g.addColorStop(1, 'rgba(255,220,170,0)');
  const ctx = c.getContext('2d'); ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

/* ---------- cena ---------- */
function init() {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const canvas = renderer.domElement; canvas.className = 'curtain-gl';

  const scene = new THREE.Scene();
  const fov = 26;
  const camera = new THREE.PerspectiveCamera(fov, W / H, 10, 8000);
  const camZ = (H / 2) / Math.tan(THREE.MathUtils.degToRad(fov / 2));   // z=0 enche a tela exato
  camera.position.set(0, 0, camZ);

  // luz de palco: spot quente de cima com sombra (as dobras se sombreiam), preenchimento frio, contraluz
  scene.add(new THREE.HemisphereLight(0xffd6a8, 0x140306, 0.7));
  const key = new THREE.SpotLight(0xffdfb8, 4.6, 0, 0.55, 0.6, 0);
  key.position.set(-W * 0.12, H * 1.15, camZ * 0.6);
  key.target.position.set(0, -H * 0.2, 0);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0006; key.shadow.radius = 5;
  key.shadow.camera.near = 200; key.shadow.camera.far = 4000;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xb9a6ff, 0.55); fill.position.set(W * 0.7, -H * 0.3, camZ * 0.8); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xff8a50, 0.8); rim.position.set(W * 0.3, H * 0.9, -500); scene.add(rim);

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x8a0f1f, roughness: 0.93, metalness: 0,
    sheen: 0.65, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xff5c66),  // veludo: brilha de raspão
    bumpMap: veludoBump(), bumpScale: 1.6,
    side: THREE.DoubleSide, shadowSide: THREE.DoubleSide,
  });
  const panos = [new Pano(-1), new Pano(1)];
  // pré-assenta o tecido (≈2,7 s de física, ~40 ms de JS): o primeiro frame já é pano pendurado, não pano caindo
  const PRE = 180, semVento = { x: 0, z: 0 };
  for (let i = 0; i < PRE; i++) for (const p of panos) { p.track(0, 0); p.step(i * STEP, semVento); }
  const meshes = panos.map(p => { const m = new THREE.Mesh(p.geo, mat); m.castShadow = m.receiveShadow = true; scene.add(m); return m; });

  // poeira na luz de palco
  const NP = 160, pp = new Float32Array(NP * 3), pv = new Float32Array(NP * 3);
  for (let i = 0; i < NP; i++) {
    pp[i * 3] = (Math.random() - .5) * W * 0.9; pp[i * 3 + 1] = (Math.random() - .5) * H; pp[i * 3 + 2] = 60 + Math.random() * 420;
    pv[i * 3] = (Math.random() - .5) * 6; pv[i * 3 + 1] = 2 + Math.random() * 6; pv[i * 3 + 2] = (Math.random() - .5) * 4;
  }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: poeiraSprite(), size: 7, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  scene.add(dust);

  renderer.compile(scene, camera);                          // shader com problema estoura aqui, antes de mexer no DOM
  intro.prepend(canvas);
  intro.classList.add('gl');

  // parallax com o mouse (a câmera espia as dobras)
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener('pointermove', e => { if (e.pointerType === 'touch' || reduce) return; tx = (e.clientX / innerWidth - .5) * 70; ty = (.5 - e.clientY / innerHeight) * 36; }, { passive: true });

  /* ---------- tempo ---------- */
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  let last = performance.now(), acc = 0, simT = PRE * STEP, nextGust = simT + 3, lastK = 0;
  const gust = { x: 0, z: 0, tx: 0, tz: 0 };
  const prop = n => parseFloat(intro.style.getPropertyValue(n)) || 0;   // --g/--x, escritos por scene.js a cada frame

  function simulate() {
    simT += STEP;
    // rajadas de vez em quando (ramp suave)
    if (simT > nextGust) { nextGust = simT + 4 + Math.random() * 6; gust.tx = (Math.random() - .5) * 600; gust.tz = (Math.random() - .5) * 1100; setTimeout(() => { gust.tx = 0; gust.tz = 0; }, 900 + Math.random() * 800); }
    gust.x += (gust.tx - gust.x) * 0.02; gust.z += (gust.tz - gust.z) * 0.02;
    const g = prop('--g'), x = prop('--x');                  // 0→1 lineares, puxados pelo scroll (não pelo relógio)
    const k = ease(g), e = ease(x);
    const shift = (COLS * 2.6 + 270) * e;                     // pilha sai bem pra fora do quadro
    const calm = Math.min(1, g * 5);                          // vento some assim que começa a puxar: recolhe sem virar bandeira
    const pull = 2600 * e;                                    // cordão: leva o pano junto com a pilha
    lastK = k;
    for (const p of panos) { p.track(k, shift); p.step(simT, gust, calm, pull * p.side); }
  }
  // nenhuma partícula projeta dentro do quadro (a bainha chega atrasada) — pode esconder o canvas
  function foraDoQuadro() {
    const lim = W / 2 + 24;
    for (const p of panos) for (let i = 0; i < p.pos.length; i += 3) {
      if (Math.abs(p.pos[i] * camZ / (camZ - p.pos[i + 2])) < lim) return false;
    }
    return true;
  }

  let raf = 0, fora = false;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    // tela apagada (antes de ligar / tampa fechando) ou pilha já fora do quadro: não gasta GPU à toa
    const opaca = parseFloat(intro.style.opacity || '0') > 0.001;
    if (!opaca || (fora && prop('--x') >= 1)) { last = now; return; }
    acc += Math.min(0.05, (now - last) / 1000); last = now;
    let steps = 0;
    while (acc >= STEP && steps < 4) { simulate(); acc -= STEP; steps++; }
    for (const p of panos) p.upload();
    fora = foraDoQuadro();
    canvas.style.display = fora ? 'none' : '';
    dust.material.opacity = 0.55 * (1 - lastK);             // poeira some com a cortina
    // poeira sobe devagar e deriva
    for (let i = 0; i < NP; i++) {
      pp[i * 3] += pv[i * 3] * STEP * steps + Math.sin(simT * .6 + i) * .15; pp[i * 3 + 1] += pv[i * 3 + 1] * STEP * steps;
      if (pp[i * 3 + 1] > H / 2) { pp[i * 3 + 1] = -H / 2; pp[i * 3] = (Math.random() - .5) * W * 0.9; }
    }
    dustGeo.attributes.position.needsUpdate = true;
    key.intensity = 4.6 * (1 + 0.035 * Math.sin(simT * 3.1) * Math.sin(simT * 0.7));   // flicker da luz
    cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
    camera.position.set(cx, cy, camZ); camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);
}

if (intro) {
  import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js')
    .then(m => { THREE = m; init(); })
    .catch(e => console.warn('cortina em WebGL indisponível, ficou a de CSS', e));
}
