/* =========================================================
   CONFIG — os botões de ajuste da cena
   ========================================================= */
const CFG = {
  deskW: 4800, deskH: 2800, // mesa (px). Pequena de propósito: camadas 3D gigantes re-rasterizam e piscam
  hx: 2400, hy: 1400,       // dobradiça dentro da mesa (px) = origem da câmera
  tileW: 1200, tileH: 700,  // ladrilhos da mesa (4×4): camadas pequenas, com culling por frame
  deskRaster: .5,           // resolução de raster da mesa (ver build dos ladrilhos e --k no CSS)
  lidW: 1000, lidH: 708,    // tampa (px) — MacBook Pro 14" a 3.2 px/mm
  baseT: 32, lidT: 14,      // espessuras (px)
  baseSlabs: 7, lidSlabs: 3,// fatias de espessura (planos paralelos, nunca cruzados)
  tiltEnd: 70,              // inclinação final da câmera (0 = de cima, 90 = frontal)
  lidOpen: 110,             // ângulo final da tampa (tilt + lidOpen = 180 → tela de frente)
  perspective: 2000,        // igual ao CSS de .stage
  slideVH: 85,              // scroll (vh) por slide da galeria
  paginaVH: 80,             // scroll (vh) por página do caderno
  slideSettle: .65,         // quanto de cada slide "assenta" com easing (0 = linear)
  smooth: 0.09,             // suavização por frame @60Hz (menor = mais "cinema")
  parallax: 2.2,            // graus de parallax do mouse
  // segmentos de scroll, nessa ordem. Duração em vh (número ou função de {N: slides, P: páginas}).
  segs: [
    { nome: 'aproximacao',   vh: 460 },
    { nome: 'cortina',       vh: 200 },
    { nome: 'galeria',       vh: ({ N }) => (N - 1) * CFG.slideVH },
    { nome: 'fecharNote',    vh: 140 },
    { nome: 'irCaderno',     vh: 160 },
    { nome: 'paginas',       vh: ({ P }) => P * CFG.paginaVH },
    { nome: 'fecharCaderno', vh: 90 },
    { nome: 'irCelular',     vh: 160 },
    { nome: 'chat',          vh: 120 },
    { nome: 'apagar',        vh: 100 },
  ],
  map: {                    // faixas (0→1) dentro de cada segmento
    aproximacao: {
      objsOut:     [0.00, 0.45],
      objsFade:    [0.16, 0.44],
      parallaxOff: [0.00, 0.12],
      camera:      [0.10, 0.74],
      lid:         [0.40, 0.80],
      flash:       [0.66, 0.78],
      boot:        [0.70, 0.90],
    },
    cortina: {               // abertura da cortina, puxada pelo scroll (sem clique)
      texto:       [0.00, 0.12], // texto some assim que o scroll começa a puxar o pano
      palco:       [0.00, 0.55], // chão/luz/vinheta do palco somem
      gather:      [0.00, 0.68], // pano empilha nas laterais (trilho)
      exit:        [0.68, 1.00], // pilha sai do quadro; bandô sobe
    },
    fecharNote: {           // tudo da aproximação, ao contrário
      boot:        [0.00, 0.22],
      lid:         [0.06, 0.58],
      camera:      [0.22, 0.92],
      objsBack:    [0.50, 1.00],
      objsFade:    [0.55, 0.88],
    },
    irCaderno: {
      chegar:      [0.00, 0.60], // câmera até o caderno fechado
      alinhar:     [0.05, 0.60], // caderno endireita (−7° → 0°)
      abrir:       [0.60, 1.00], // capa abre; câmera vai pro centro do spread
    },
    fecharCaderno: {
      fechar:      [0.05, 0.85], // capa e todas as páginas fecham juntas de uma só vez
    },
    irCelular: {
      camera:      [0.00, 0.85],
      alinhar:     [0.10, 0.70], // celular endireita (9° → 0°)
      acender:     [0.35, 0.60], // tela acende
      notif:       0.60,         // notificação aparece (com um pulso)
    },
    chat: {
      lock:        [0.00, 0.18], // tela de bloqueio some
      bolha1:      [0.12, 0.38],
      bolha2:      [0.38, 0.64],
      campo:       [0.64, 0.90],
    },
    apagar: {
      noite:       [0.00, 0.70], // overlay escurece
      tela:        [0.70, 1.00], // tela do celular apaga por último
    },
  },
};

(() => {
  const $ = s => document.querySelector(s);
  const stage = $('#stage'), world = $('#world'), desk = $('#desk'), lid = $('#lid'), strip = $('#strip'), display = $('#display'),
        flash = $('#flash'), progress = $('#progress'), scroller = $('#scroller'),
        intro = $('#intro'), curtainL = $('.curtain-l'), curtainR = $('.curtain-r'),
        stageFloor = $('.stage-floor'), stageLight = $('.stage-light'), introVignette = $('.intro-vignette'),
        valance = $('.valance'), introTxt = $('.intro-txt'),
        base = $('#base'), baseShade = $('#baseShade'), screenGlow = $('#screenGlow'),
        lidSheen = $('#lidSheen'), glass = $('#glass'), reflection = $('#reflection'),
        miolo = $('#miolo'), capa = $('#capa'), elastico = $('#elastico'), phone = $('#phone'),
        telaOn = $('#telaOn'), lock = $('#lock'), notif = $('#notif'), chat = $('#chat'),
        bolha1 = $('#bolha1'), bolha2 = $('#bolha2'), campo = $('#campo'), msg = $('#msg'),
        night = $('#night'), lockHora = $('#lockHora'), lockData = $('#lockData');

  /* =====================================================
     BUILD — mesa em ladrilhos, espessuras do MacBook, teclado
     ===================================================== */
  const tiles = [];
  {
    /* Dentro de um contexto preserve-3d o Chrome rasteriza cada camada em 1:1 do px CSS —
       o transform 3D pode mudar a qualquer frame, então ele não adapta a escala de raster.
       A mesa (4800×2800) custaria 9600×5600 de textura em DPR 2 (~215MB) mesmo aparecendo
       a ~46% na tela. Pintamos então cada ladrilho em `k` da resolução e devolvemos o
       tamanho com scale(1/k): mesma geometria, 1/k² da textura. Em k=.5 sobra resolução
       (a mesa nunca passa de ~1× device px na tela) e o orçamento de GPU deixa de estourar,
       que é o que fazia o Chrome descartar tiles e mostrar o fundo em blocos. */
    const k = CFG.deskRaster;
    document.documentElement.style.setProperty('--k', k);
    const frag = document.createDocumentFragment();
    for (let y = 0; y < CFG.deskH; y += CFG.tileH) for (let x = 0; x < CFG.deskW; x += CFG.tileW) {
      const t = document.createElement('div');
      const w = Math.min(CFG.tileW, CFG.deskW - x) + 2, h = Math.min(CFG.tileH, CFG.deskH - y) + 2; // +2px: sem seam entre ladrilhos
      t.className = 'tile';
      const bp = `${-x * k}px ${-y * k}px`;
      t.style.cssText = `left:${x}px;top:${y}px;width:${w * k}px;height:${h * k}px;transform:scale(${1 / k});background-position:${bp},${bp},${bp}`;
      frag.appendChild(t);
      tiles.push({ el: t, x0: x - CFG.hx, y0: y - CFG.hy, x1: x + w - CFG.hx, y1: y + h - CFG.hy, shown: true });
    }
    desk.insertBefore(frag, desk.firstChild);
  }

  function slabs(parent, thickness, count, before, topClass) {
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= count; i++) {
      const s = document.createElement('div');
      s.className = 'slab' + (i === count && topClass ? ' ' + topClass : '');
      s.style.transform = `translateZ(${(thickness * i / (count + 1)).toFixed(2)}px)`;
      frag.appendChild(s);
    }
    parent.insertBefore(frag, before);
  }
  slabs(base, CFG.baseT, CFG.baseSlabs, base.firstChild, 'slab-top');
  slabs(lid, CFG.lidT, CFG.lidSlabs, lid.firstChild);
  slabs(phone, 26, 3, phone.firstChild);
  phone.querySelector('.slab').classList.add('slab-base');   // a de baixo carrega a sombra no chão

  function buildKeyboard(root) {
    const U = 59, K = 50, PAD = 7;                 // pitch, keycap, padding do poço
    const k = (t, w = 1, kind = 'ch', top = '') => ({ t, w, kind, top });
    const ch = s => s.split(' ').map(t => k(t, 1, 'ch'));
    const rows = [
      [k('esc', 1.5, 'lbl'), ...'F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12'.split(' ').map(t => k(t, 1, 'fn')), k('', 1, 'touch')],
      [k('`', 1, 'ch', '~'), k('1', 1, 'ch', '!'), k('2', 1, 'ch', '@'), k('3', 1, 'ch', '#'), k('4', 1, 'ch', '$'), k('5', 1, 'ch', '%'),
       k('6', 1, 'ch', '¨'), k('7', 1, 'ch', '&'), k('8', 1, 'ch', '*'), k('9', 1, 'ch', '('), k('0', 1, 'ch', ')'), k('-', 1, 'ch', '_'),
       k('=', 1, 'ch', '+'), k('delete', 1.5, 'lbl')],
      [k('tab', 1.5, 'lbl'), ...ch('Q W E R T Y U I O P'), k('´', 1, 'ch', '`'), k('[', 1, 'ch', '{'), k('', 1, 'enter-top')],
      [k('caps lock', 1.75, 'lbl'), ...ch('A S D F G H J K L Ç'), k('~', 1, 'ch', '^'), k(']', 1, 'ch', '}'), k('return', .75, 'enter-bot')],
      [k('shift', 1.25, 'lbl', '⇧'), k('\\', 1, 'ch', '|'), ...ch('Z X C V B N M'), k(',', 1, 'ch', '<'), k('.', 1, 'ch', '>'), k(';', 1, 'ch', ':'), k('shift', 1.25, 'lbl', '⇧')],
      [k('fn', 1, 'lbl'), k('control', 1, 'lbl', '⌃'), k('option', 1, 'lbl', '⌥'), k('command', 1.25, 'lbl', '⌘'), k('', 5, 'space'),
       k('command', 1.25, 'lbl', '⌘'), k('option', 1, 'lbl', '⌥'), k('◀', 1, 'arrow'), k('', 1, 'updown'), k('▶', 1, 'arrow')],
    ];
    const html = [];
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    rows.forEach((row, r) => {
      let x = PAD;
      const y = PAD + r * U;
      for (const key of row) {
        const w = key.w * U - (U - K);
        const box = (extra) => `<div class="key ${extra}" style="left:${x}px;top:${y}px;width:${w}px;height:${K}px">`;
        switch (key.kind) {
          case 'ch':
            html.push(box(key.top ? 'has-top' : '') + (key.top ? `<span class="key-top">${esc(key.top)}</span>` : '') + esc(key.t) + '</div>');
            break;
          case 'lbl':
            html.push(box('') + (key.top ? `<span class="key-sym">${esc(key.top)}</span>` : '') + `<span class="key-lbl">${esc(key.t)}</span></div>`);
            break;
          case 'fn':
            html.push(box('key-fn') + esc(key.t) + '</div>');
            break;
          case 'touch':
            html.push(box('key-touch') + '</div>');
            break;
          case 'space':
            html.push(box('') + '</div>');
            break;
          case 'enter-top':
            html.push(`<div class="key key-enter-top" style="left:${x}px;top:${y}px;width:${w}px;height:${K + (U - K)}px"></div>`);
            break;
          case 'enter-bot': {
            const bw = key.w * U - (U - K), bx = x + (1 - key.w) * U;
            html.push(`<div class="key key-enter-bot" style="left:${bx}px;top:${y}px;width:${bw}px;height:${K}px"><span class="key-lbl">return</span></div>`);
            break;
          }
          case 'arrow':
            html.push(`<div class="key key-arrow key-half" style="left:${x}px;top:${y + K - 22}px;width:${w}px;height:22px">${esc(key.t)}</div>`);
            break;
          case 'updown':
            html.push(`<div class="key key-arrow key-half" style="left:${x}px;top:${y}px;width:${w}px;height:22px">▲</div>`);
            html.push(`<div class="key key-arrow key-half" style="left:${x}px;top:${y + K - 22}px;width:${w}px;height:22px">▼</div>`);
            break;
        }
        x += key.w * U;
      }
    });
    root.innerHTML = html.join('');
  }
  buildKeyboard($('#kb'));

  /* =====================================================
     SLIDES
     ===================================================== */
  const N = PROJETOS.length;
  const NP = typeof HISTORIA !== 'undefined' ? HISTORIA.length : 6;   // páginas do caderno
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  strip.innerHTML = PROJETOS.map((p, i) => {
    const vars = `--bg:${p.bg};--fg:${p.fg};--capa:${p.capa || p.bg}`;
    return `
      <article class="slide" style="${vars}" data-i="${i}">
        <div class="slide-txt">
          <span class="num">${String(i + 1).padStart(2, '0')}</span>
          <h2><a href="${esc(p.href || '#')}">${esc(p.titulo)}</a></h2>
          <p>${esc(p.desc)}</p>
          <span class="meta">${esc(p.meta)}</span>
        </div>
        <div class="slide-capa" aria-hidden="true"><span>${esc(p.titulo[0])}</span></div>
      </article>`;
  }).join('');
  const slides = [...strip.children];

  /* =====================================================
     CADERNO — páginas geradas a partir de HISTORIA (content.js)
     ===================================================== */
  const itemHTML = it => {
    const st = `left:${it.x}px;top:${it.y}px;transform:rotate(${it.rot || 0}deg)`;
    const fita = (it.fita || []).map(p => `<i class="fita fita-${p}"></i>`).join('');
    switch (it.tipo) {
      case 'nota':     return `<div class="colado nota${it.tam ? ' nota-' + it.tam : ''}" style="${st}">${esc(it.texto).replace(/\n/g, '<br>')}</div>`;
      case 'polaroid': { // img: caminho da foto (cover); sem img fica o cinza. wide: formato paisagem
        const foto = it.img ? ` style="background-image:url(${esc(it.img)})"` : '';
        return `<div class="colado polaroid${it.wide ? ' polaroid-wide' : ''}" style="${st}">${fita}<div class="foto"${foto}></div><span>${esc(it.legenda || '')}</span></div>`;
      }
      case 'cracha': { // empresa (uma) ou empresas (lista)
        const emp = it.empresas ? `<em class="lista">${it.empresas.map(e => `<i>${esc(e)}</i>`).join('')}</em>` : `<em>${esc(it.empresa || '')}</em>`;
        return `<div class="colado cracha${it.empresas ? ' cracha-multi' : ''}" style="${st}"><i class="cordao"></i><div class="cracha-card"><i class="furo"></i><b>${esc(it.nome)}</b><span>${esc(it.cargo)}</span>${emp}</div></div>`;
      }
      case 'rabisco': { // linha à mão, de cima pra baixo (h = altura), com seta na ponta
        const h = it.h || 200, w = 40;
        // traço "tremido": senoide leve em x, dois passes deslocados pra parecer caneta
        const pts = n => Array.from({ length: n + 1 }, (_, k) => { const t = k / n; return `${(w / 2 + Math.sin(t * 9.3 + n) * 6 + Math.sin(t * 23 + 1) * 1.6).toFixed(1)},${(t * (h - 14)).toFixed(1)}`; }).join(' L');
        const seta = `M${w / 2 - 9},${h - 26} L${w / 2 + 1},${h - 6} L${w / 2 + 10},${h - 27}`;
        return `<svg class="colado rabisco" style="${st}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="M${pts(24)}"/><path d="M${pts(19)}" opacity=".55"/><path d="${seta}"/></svg>`;
      }
      case 'cartao':   return `<div class="colado cartao" style="${st}">${fita}<b>${esc(it.nome)}</b><span>${esc(it.cargo)}</span><em>${esc(it.empresa)}</em></div>`;
      case 'ingresso': return `<div class="colado ingresso" style="${st}">${fita}<b>${esc(it.evento)}</b><span>${esc(it.data)} · ${esc(it.local)}</span><i class="picote"></i></div>`;
      case 'adesivo':  return `<div class="colado adesivo adesivo-${it.forma || 'pill'}" style="${st};--cor:${esc(it.cor || '#2743E0')}">${esc(it.texto)}</div>`;
      case 'recorte':  return `<div class="colado recorte" style="${st}">${fita}<i class="grampo"></i><b>${esc(it.titulo)}</b><p>${esc(it.texto)}</p></div>`;
    }
    return '';
  };
  miolo.innerHTML = HISTORIA.map((pg, i) => `
    <div class="pagina" data-i="${i}">
      <div class="face recto">${(pg.recto || []).map(itemHTML).join('')}</div>
      <div class="face verso">${(pg.verso || []).map(itemHTML).join('')}</div>
    </div>`).join('');
  const paginas = [...miolo.children];
  // pilha: 0.5px por página, a partir da contracapa. Página i (0 = de cima) fechada em (P−i)·t, virada em (i+1)·t
  const CAD = { t: .5, base: .6 };
  const zTopo = CAD.base + (NP + 1) * CAD.t + .8;   // capa fechada, acima do miolo
  const setT = (el, v) => { if (el._t !== v) { el._t = v; el.style.transform = v; } };   // sem style dirty à toa

  /* --- objetos que deslizam pra fora --- */
  const objs = [...document.querySelectorAll('.obj')].map(el => ({
    el, dx: +el.dataset.dx || 0, dy: +el.dataset.dy || 0, r0: +el.dataset.rot || 0, dr: +el.dataset.drot || 0,
    volta: el.dataset.volta !== 'nao',                        // volta pra mesa quando o note fecha
    alinha: el.dataset.alinha || '',                          // segmento em que endireita (rotação → 0)
  }));
  const objCaderno = $('.obj-caderno'), objCelular = $('.obj-celular');

  /* =====================================================
     LAYOUT dependente do viewport
     ===================================================== */
  let vw, vh, S0, SE, ty0, tyEnd, totalPx = 0;
  const K = {};            // keyframes da câmera {x, y, s, tilt, ty}: alvo em px da mesa, escala, tilt, ty extra
  const segs = [];         // segmentos em px: {nome, px, y0}
  const P = {};            // progresso local (0→1) de cada segmento, recalculado no render
  const box = el => ({ cx: el.offsetLeft + el.offsetWidth / 2, cy: el.offsetTop + el.offsetHeight / 2, w: el.offsetWidth, h: el.offsetHeight });
  function layout() {
    // altura estável (.stage usa 100lvh): a barra de endereço do Safari/Chrome mobile não mexe na cena
    vw = innerWidth; vh = stage.clientHeight || innerHeight;
    const portrait = vh > vw;
    // escala inicial: "contain" da caixa de conteúdo da mesa, sem deixar a mesa (4800×2800) sair do quadro
    S0 = portrait
      ? Math.max(Math.min(vw / 1400, vh / 2780), vh / CFG.deskH)
      : Math.max(Math.min(vw / 3000, vh / 1950), vw / CFG.deskW, vh / (CFG.deskH - 250));
    // escala final: tampa ocupando ~80% da altura (ou 92% da largura, o que bater antes)
    SE = Math.min(0.92 * vw / CFG.lidW, 0.80 * vh / CFG.lidH);
    const lidPx = CFG.lidH * SE;
    // dobradiça termina embaixo da tela, deixando a linha do teclado aparecer
    tyEnd = portrait
      ? (lidPx - 0.45 * CFG.lidH * SE) / 2                       // note centralizado na tela em pé
      : Math.min(0.06 * vh + lidPx, (vh + lidPx) / 2) - vh / 2;
    ty0 = portrait ? 0 : -300 * S0;
    world.style.left = (vw / 2 - CFG.hx) + 'px';
    world.style.top = (vh / 2 - CFG.hy) + 'px';
    world.style.transformOrigin = `${CFG.hx}px ${CFG.hy}px`;

    // keyframes da câmera
    const cad = box(objCaderno), cel = box(objCelular);
    const sCad = Math.min(0.88 * vw / (2 * cad.w), 0.80 * vh / cad.h);
    K.inicio     = { x: CFG.hx, y: CFG.hy, s: S0, tilt: 0, ty: ty0 };
    K.note       = { x: CFG.hx, y: CFG.hy, s: SE, tilt: CFG.tiltEnd, ty: tyEnd };
    K.cadFechado = { x: cad.cx, y: cad.cy, s: sCad, tilt: 0, ty: 0 };
    K.spread     = { x: cad.cx - cad.w / 2, y: cad.cy, s: sCad, tilt: 0, ty: 0 }; // capa abre pra esquerda: spread = 2× largura
    K.celular    = { x: cel.cx, y: cel.cy, s: 0.80 * vh / cel.h, tilt: 0, ty: 0 };

    // segmentos em px (não muda quando a barra do browser some)
    segs.length = 0;
    let y0 = 0;
    for (const s of CFG.segs) {
      const px = Math.round((typeof s.vh === 'function' ? s.vh({ N, P: NP }) : s.vh) / 100 * vh);
      segs.push({ nome: s.nome, px, y0 }); y0 += px;
    }
    totalPx = y0;
    scroller.style.height = (totalPx + vh) + 'px';
  }
  const segOf = nome => segs.find(s => s.nome === nome);

  /* --- utilitários --- */
  const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const seg = (p, [a, b]) => clamp((p - a) / (b - a));
  const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const ein = t => t * t * t;
  const eout = t => 1 - Math.pow(1 - t, 3);
  const lerp = (a, b, t) => a + (b - a) * t;
  const M = CFG.map, RAD = Math.PI / 180;
  const camLerp = (A, B, t) => ({ x: lerp(A.x, B.x, t), y: lerp(A.y, B.y, t), s: lerp(A.s, B.s, t), tilt: lerp(A.tilt, B.tilt, t), ty: lerp(A.ty, B.ty, t) });
  // trilha da câmera: em ordem cronológica, cada trecho leva de um keyframe a outro numa faixa do segmento
  const TRACK = [
    { seg: 'aproximacao', faixa: M.aproximacao.camera, de: 'inicio',     para: 'note' },
    { seg: 'fecharNote',  faixa: M.fecharNote.camera,  de: 'note',       para: 'inicio' },
    { seg: 'irCaderno',   faixa: M.irCaderno.chegar,   de: 'inicio',     para: 'cadFechado' },
    { seg: 'irCaderno',   faixa: M.irCaderno.abrir,    de: 'cadFechado', para: 'spread' },
    { seg: 'irCelular',   faixa: M.irCelular.camera,   de: 'spread',     para: 'celular' },
  ];
  function camera() {
    let c = K.inicio;
    for (const t of TRACK) {
      const u = seg(P[t.seg], t.faixa);
      if (u <= 0) break;
      c = u >= 1 ? K[t.para] : camLerp(K[t.de], K[t.para], eio(u));
    }
    return c;
  }

  /* --- culling dos ladrilhos: projeta os 4 cantos com a mesma câmera e esconde o que está fora
         do quadro ou atrás da câmera (camadas invisíveis não custam raster nem compositing) --- */
  function cullTiles(s, tilt, tx, ty) {
    const c = Math.cos(tilt * RAD), sn = Math.sin(tilt * RAD), P = CFG.perspective;
    const mx = vw * 0.15, my = vh * 0.15;
    for (const t of tiles) {
      let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, behind = false;
      for (const [x, y] of [[t.x0, t.y0], [t.x1, t.y0], [t.x0, t.y1], [t.x1, t.y1]]) {
        const X = x * s + tx, Y = y * s * c + ty, Z = y * s * sn;          // rotateX: z' = y·sin (y>0 vem pra frente)
        if (Z > P * 0.97) { behind = true; break; }
        const f = P / (P - Z);
        const sx = vw / 2 + X * f, sy = vh / 2 + Y * f;
        if (sx < minX) minX = sx; if (sx > maxX) maxX = sx; if (sy < minY) minY = sy; if (sy > maxY) maxY = sy;
      }
      const show = !behind && maxX > -mx && minX < vw + mx && maxY > -my && minY < vh + my;
      if (show !== t.shown) { t.shown = show; t.el.style.visibility = show ? '' : 'hidden'; }
    }
  }

  /* =====================================================
     RENDER — resolve o progresso de cada segmento e desenha tudo a partir deles
     ===================================================== */
  let lastSlide = -1, notifShown = false;
  function render(y) {
    for (const s of segs) P[s.nome] = clamp((y - s.y0) / s.px);   // passados = 1, futuros = 0
    const pa = P.aproximacao, pf = P.fecharNote, pi = P.irCaderno, pc = P.irCelular;
    const Ma = M.aproximacao, Mf = M.fecharNote;

    // câmera: keyframes interpolados; alvo (x,y) fica no centro do viewport com tilt 0
    const c = camera();
    const tx = -c.s * (c.x - CFG.hx), ty = -c.s * (c.y - CFG.hy) + c.ty;
    const k = 1 - seg(pa, Ma.parallaxOff);
    world.style.transform =
      `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) rotateX(${(c.tilt + px * k).toFixed(3)}deg) rotateY(${(py * k).toFixed(3)}deg) scale3d(${c.s.toFixed(4)},${c.s.toFixed(4)},${c.s.toFixed(4)})`;
    cullTiles(c.s, c.tilt, tx, ty);

    // tampa abrindo (pivô na borda de trás, em cima da base; +0.5px evita plano coincidente com o topo da base)
    let la = eio(seg(pa, Ma.lid));
    if (pf > 0) la = 1 - eio(seg(pf, Mf.lid));                    // fechando
    const a = CFG.lidOpen * la;
    lid.style.transform = `translateZ(${CFG.baseT + 0.5}px) rotateX(${a.toFixed(3)}deg)`;

    // luz na tampa: o alumínio ganha brilho conforme vira pra câmera; a base ganha a sombra da tampa
    lidSheen.style.opacity = (Math.sin(la * Math.PI) * .9).toFixed(3);
    baseShade.style.opacity = (la > 0 ? lerp(.85, .3, la) : 0).toFixed(3);

    // objetos saindo de cena (e voltando quando o note fecha, mesmo caminho ao contrário)
    let to = ein(seg(pa, Ma.objsOut)), op = 1 - seg(pa, Ma.objsFade);
    if (pf > 0) { to = ein(1 - seg(pf, Mf.objsBack)); op = seg(pf, Mf.objsFade); }
    for (const o of objs) {
      const t = o.volta || pf <= 0 ? to : 1, p = o.volta || pf <= 0 ? op : 0;
      let rot = o.r0 + o.dr * t;
      if (o.alinha) rot *= 1 - eio(seg(P[o.alinha], M[o.alinha].alinhar));   // endireita pra leitura
      o.el.style.transform = `translate3d(${(o.dx * t).toFixed(1)}px,${(o.dy * t).toFixed(1)}px,1px) rotate(${rot.toFixed(2)}deg)`;
      o.el.style.opacity = p;
      o.el.style.visibility = p <= 0 ? 'hidden' : 'visible';
    }

    // tela ligando (e desligando no fecharNote)
    let boot = eout(seg(pa, Ma.boot)), fl = Math.sin(seg(pa, Ma.flash) * Math.PI) * .85;
    if (pf > 0) { boot = 1 - eout(seg(pf, Mf.boot)); fl = 0; }
    strip.style.opacity = boot;
    intro.style.opacity = boot;
    flash.style.opacity = fl.toFixed(3);
    // vidro: reflexo da mesa enquanto a tela está apagada, some quando liga
    reflection.style.opacity = ((1 - boot) * Math.sin(clamp(la * 1.15) * Math.PI)).toFixed(3);
    glass.style.opacity = (1 - boot * .55).toFixed(3);
    screenGlow.style.opacity = (boot * .32).toFixed(3);

    // cortina: abre puxada pelo scroll (sem clique) — curtain.js lê --g/--x pra animar o pano em WebGL
    const pk = P.cortina, Mk = M.cortina;
    const g = seg(pk, Mk.gather), exitX = seg(pk, Mk.exit), kGather = eio(g);
    curtainL.style.transform = `translate3d(${(-104 * kGather).toFixed(2)}%,0,0)`;
    curtainR.style.transform = `translate3d(${(104 * kGather).toFixed(2)}%,0,0)`;
    const palco = (1 - seg(pk, Mk.palco)).toFixed(3);
    stageFloor.style.opacity = stageLight.style.opacity = introVignette.style.opacity = palco;
    const flicker = seg(pk, Mk.palco) <= 0;                     // o keyframe de flicker venceria a opacity inline: desliga ao abrir
    if (stageLight._flicker !== flicker) { stageLight._flicker = flicker; stageLight.style.animation = flicker ? '' : 'none'; }
    valance.style.transform = `translate3d(0,${(-140 * eio(exitX)).toFixed(2)}%,0)`;
    const txt = eio(seg(pk, Mk.texto));
    introTxt.style.opacity = (1 - txt).toFixed(3);
    introTxt.style.transform = `translate3d(0,${(-18 * txt).toFixed(1)}px,0)`;
    strip.inert = pk < 1;                                        // teclado não fura o pano antes de sair do quadro
    intro.style.setProperty('--g', g.toFixed(4));
    intro.style.setProperty('--x', exitX.toFixed(4));

    // galeria horizontal (scroll vertical → translateX, com leve "assentar" por slide)
    const q = P.galeria;
    const t = q * (N - 1), i = Math.floor(t), f = t - i, x = i + (1 - CFG.slideSettle) * f + CFG.slideSettle * eio(f);
    strip.style.transform = `translate3d(${(-x * display.clientWidth).toFixed(1)}px,0,0)`;
    const cur = Math.min(N, Math.round(t) + 1);
    progress.style.transform = `scaleX(${q.toFixed(4)})`;
    if (cur !== lastSlide) {
      lastSlide = cur;
      screenGlow.style.setProperty('--glow', PROJETOS[cur - 1].bg);
      // só o slide atual e os vizinhos ficam rasterizados
      slides.forEach((el, j) => { el.style.visibility = Math.abs(j - (cur - 1)) <= 1 ? '' : 'hidden'; });
    }

    /* ---- caderno: capa e páginas viram em rotateY(0 → −180) com a dobradiça na lombada.
       translateZ fica FORA do rotateY (é altura de verdade): a folha muda de pilha na segunda metade da virada. ---- */
    const pfc = P.fecharCaderno, Mi = M.irCaderno, Mfc = M.fecharCaderno;
    const uClose = pfc > 0 ? seg(pfc, Mfc.fechar || [0.05, 0.85]) : 0;
    let ca = eio(seg(pi, Mi.abrir));
    if (pfc > 0) ca = 1 - eio(uClose);
    const zCapa = lerp(zTopo, .3, ca < .5 ? 0 : (ca - .5) * 2);
    setT(capa, `translateZ(${zCapa.toFixed(2)}px) rotateY(${(-180 * ca).toFixed(3)}deg)`);
    elastico.style.opacity = (1 - seg(ca, [0, .12])).toFixed(3);
    const pp = P.paginas;
    for (let i = 0; i < NP; i++) {
      let v = eio(seg(pp, [i / NP, (i + 1) / NP]));                       // vira no seu trecho do segmento
      if (pfc > 0) {
        // Fecha todas as páginas anteriores de uma só vez junto com a capa (bloco único com leve fanning natural)
        const d = (NP - 1 - i) * 0.02;
        v = 1 - eio(clamp((uClose - d) / (1 - (NP - 1) * 0.02)));
      }
      const z = CAD.base + lerp((NP - i) * CAD.t, (i + 1) * CAD.t, v < .5 ? 0 : (v - .5) * 2);
      setT(paginas[i], `translateZ(${z.toFixed(2)}px) rotateY(${(-180 * v).toFixed(3)}deg)`);
    }

    /* ---- celular: tela acende, notificação, chat, e apaga por último ---- */
    const Mc = M.irCelular, Mch = M.chat, Map_ = M.apagar, pch = P.chat, pn = P.apagar;
    let on = eout(seg(pc, Mc.acender));
    on *= 1 - seg(pn, Map_.tela);
    telaOn.style.opacity = on.toFixed(3);
    telaOn.style.pointerEvents = on < .5 ? 'none' : '';
    const nv = eout(seg(pc, [Mc.notif, Mc.notif + .1]));
    notif.style.opacity = nv.toFixed(3);
    notif.style.translate = `0 ${((1 - nv) * -10).toFixed(1)}px`;
    const notifOn = pc >= Mc.notif;
    if (notifOn !== notifShown) { notifShown = notifOn; notif.classList.toggle('pulsa', notifOn && !reduce); }   // pulsa uma vez
    const lk = seg(pch, Mch.lock);
    lock.style.opacity = (1 - lk).toFixed(3); chat.style.opacity = lk.toFixed(3);
    lock.style.visibility = lk >= 1 ? 'hidden' : ''; chat.style.visibility = lk <= 0 ? 'hidden' : '';
    for (const [el, faixa] of [[bolha1, Mch.bolha1], [bolha2, Mch.bolha2], [campo, Mch.campo]]) {
      const v = eout(seg(pch, faixa));
      el.style.opacity = v.toFixed(3);
      setT(el, `translate3d(0,${((1 - v) * 14).toFixed(1)}px,0)`);
    }

    /* ---- noite ---- */
    const noiteV = seg(pn, Map_.noite) * .9;
    night.style.opacity = noiteV.toFixed(3);
    night.style.visibility = noiteV > .001 ? 'visible' : 'hidden';   // invisível não vira camada composta
  }

  /* =====================================================
     LOOP com suavização (independente de frame rate)
     ===================================================== */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = scrollY, px = 0, py = 0, tpx = 0, tpy = 0, last = performance.now(), dirty = true, rendered = NaN;
  function loop(now) {
    const dt = Math.min(64, now - last); last = now;
    const target = scrollY;
    if (reduce) cur = target;
    else {
      const k = 1 - Math.pow(1 - CFG.smooth, dt / 16.667);
      cur += (target - cur) * k;
      if (Math.abs(target - cur) < .05) cur = target;
    }
    const kp = 1 - Math.pow(1 - .06, dt / 16.667);
    const npx = px + (tpx - px) * kp, npy = py + (tpy - py) * kp;
    if (dirty || Math.abs(npx - px) > 1e-4 || Math.abs(npy - py) > 1e-4 || cur !== rendered) {
      px = npx; py = npy; rendered = cur; dirty = false;
      render(cur);
    }
    requestAnimationFrame(loop);
  }
  addEventListener('pointermove', e => {
    if (reduce || e.pointerType === 'touch') return;
    tpx = (0.5 - e.clientY / vh) * CFG.parallax;
    tpy = (e.clientX / vw - 0.5) * CFG.parallax;
  }, { passive: true });
  // relayout só quando a largura muda ou a altura muda muito (rotação). Mudanças pequenas de innerHeight
  // (barra de endereço do mobile) não podem fazer a cena inteira pular a cada rolada.
  addEventListener('resize', () => {
    const h = stage.clientHeight || innerHeight;
    if (innerWidth === vw && Math.abs(h - vh) < vh * 0.25) return;
    layout(); dirty = true;
  });

  // foco por teclado: leva a galeria até o slide do link focado
  strip.addEventListener('focusin', e => {
    const art = e.target.closest('.slide'); if (!art) return;
    const i = +art.dataset.i;
    const g = segOf('galeria');
    scrollTo({ top: g.y0 + (i / (N - 1)) * g.px, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* --- enviar: abre o CONTATO (wa.me ou mailto) com o texto digitado --- */
  campo.addEventListener('submit', e => {
    e.preventDefault();
    const texto = msg.value.trim(); if (!texto) { msg.focus(); return; }
    const mail = CONTATO.startsWith('mailto:');
    const url = CONTATO + (CONTATO.includes('?') ? '&' : '?') + (mail ? 'body=' : 'text=') + encodeURIComponent(texto);
    const a = document.createElement('a'); a.href = url; a.rel = 'noopener'; if (!mail) a.target = '_blank';
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* --- relógio da tela de bloqueio do celular --- */
  const tick = () => {
    const d = new Date();
    lockHora.textContent = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    lockData.textContent = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };
  tick(); setInterval(tick, 15000);

  layout(); cur = scrollY; requestAnimationFrame(loop);

  // gancho pra testes/auditoria visual: posiciona a cena num scroll exato, sem suavização
  window.__scene = { seek(y) { scrollTo(0, y); cur = y; tpx = tpy = px = py = 0; render(y); rendered = y; }, CFG, layout, segs, P, K };
})();
