/* Independent physical stops on the desk; no dependency on project placeholders. */
(() => {
  const desk = document.querySelector('#desk');
  const objects = document.createElement('div');
  objects.className = 'discoveries-world';
  objects.setAttribute('aria-hidden', 'true');
  objects.innerHTML = `<div class="desk-card-station"><div class="card-holder"></div><div class="desk-business-card"><div class="business-face business-front"><span class="business-mark">lp.</span><div><strong>Lucas Petry</strong><span>DESIGNER & EDUCADOR</span></div><small>IDEIAS FORA DA TELA. ↗</small></div><div class="business-face business-back"><small>TRÊS FRENTES. UM OLHAR CURIOSO.</small><strong>Design.<br>Educação.<br>Inteligência artificial.</strong><span>Da ideia à experiência.<br>Da descoberta ao aprendizado.</span></div><div class="business-edge"></div></div><div class="desk-object-label">01 / PRAZER, LUCAS.</div></div>
  <div class="desk-model-station"><div class="model-plinth"><span>ESTUDO Nº 01 · ESTA MESA</span></div><div class="desk-model"><div class="model-layer model-surface"><span class="model-layer-label">01 / SUPERFÍCIE</span></div><div class="model-layer model-objects"><div class="model-laptop"><div class="model-screen"><span>lp.</span></div><div class="model-keyboard"></div></div><div class="model-book"></div><div class="model-phone"></div><div class="model-cup"></div><div class="model-plant">✳</div><span class="model-layer-label">02 / OBJETOS</span></div><div class="model-layer model-interface"><span class="model-title">Ideias<br>fora da tela.</span><div class="model-dock">MESA · PROJETOS · HISTÓRIA</div><span class="model-layer-label">03 / INTERFACE</span></div></div><div class="desk-object-label">02 / UMA MESA DENTRO DA MESA.</div></div>`;
  desk.append(objects);
  const panel = document.createElement('aside');
  panel.id = 'discoveryPanel'; panel.hidden = true; panel.setAttribute('aria-label', 'Explorar objetos da mesa');
  panel.innerHTML = `<span class="discovery-kicker" id="discoveryKicker"></span><h2 id="discoveryTitle"></h2><p id="discoveryDescription"></p><div class="discovery-card-controls"><button id="turnBusinessCard" type="button" aria-pressed="false">Virar o cartão ↗</button><p class="discovery-detail">Design para dar forma às ideias. Educação para compartilhar o processo. IA para explorar possibilidades.</p></div><div class="discovery-model-controls" hidden><label for="modelSeparation">Separar as camadas <output id="separationValue">0%</output></label><input id="modelSeparation" type="range" min="0" max="100" value="0"><label for="modelRotation">Girar a miniatura</label><input id="modelRotation" type="range" min="-45" max="45" value="-18"><div class="discovery-layer-buttons" aria-label="Examinar uma camada"><button data-layer="0" aria-pressed="true">Superfície</button><button data-layer="1" aria-pressed="false">Objetos</button><button data-layer="2" aria-pressed="false">Interface</button></div><p id="layerExplanation" class="discovery-detail"></p></div><div class="discovery-footer"><button id="discoveryNext" type="button"></button><span>Ou continue rolando ↓</span></div>`;
  document.body.append(panel);
  const $ = s => panel.querySelector(s);
  const business = objects.querySelector('.desk-business-card');
  const model = objects.querySelector('.desk-model');
  let active = '', flipped = false, separation = 0;
  const descriptions = [
    'A madeira dá continuidade à cena. A superfície é dividida em pequenos blocos, e os que ficam fora da câmera deixam de ser desenhados.',
    'Notebook, caderno e celular combinam imagens e planos em CSS 3D. Posição, rotação e altura fazem cada peça ocupar um lugar na mesa.',
    'Texto e controles continuam sendo elementos HTML. O scroll conduz a câmera; o modo leitura oferece outro caminho para o mesmo conteúdo.'
  ];
  function selectLayer(index) {
    $('#layerExplanation').textContent = descriptions[index];
    panel.querySelectorAll('[data-layer]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.layer === index)));
    model.dataset.layer = index;
  }
  function separate(value) {
    separation = +value; objects.style.setProperty('--separation', separation / 100);
    $('#modelSeparation').value = separation; $('#separationValue').value = `${separation}%`;
  }
  $('#turnBusinessCard').addEventListener('click', () => {
    flipped = !flipped; business.classList.toggle('is-flipped', flipped);
    $('#turnBusinessCard').setAttribute('aria-pressed', String(flipped));
    $('#turnBusinessCard').textContent = flipped ? 'Ver a frente ↗' : 'Virar o cartão ↗';
  });
  $('#modelSeparation').addEventListener('input', e => separate(e.target.value));
  $('#modelRotation').addEventListener('input', e => model.style.setProperty('--model-turn', `${e.target.value}deg`));
  panel.querySelectorAll('[data-layer]').forEach(b => b.addEventListener('click', () => { selectLayer(+b.dataset.layer); separate(100); }));
  $('#discoveryNext').addEventListener('click', e => {
    window.dispatchEvent(new CustomEvent('portfoliochapter', {detail:{chapter:active === 'card' ? 'miniatura' : 'contato', instant:e.detail === 0}}));
  });
  selectLayer(0);
  window.deskDiscoveries = {
    layout(vw, vh) {
      const card = objects.querySelector('.desk-card-station'), mini = objects.querySelector('.desk-model-station');
      function key(el, width, height, tilt) {
        const mobile = vw <= 760;
        const scale = Math.min((mobile ? .84 : .48) * vw / width, (mobile ? .35 : .60) * vh / height, 1.4);
        return {x:el.offsetLeft + el.offsetWidth / 2 - (mobile ? 0 : vw * .13 / scale), y:el.offsetTop + el.offsetHeight / 2, s:scale, tilt, ty:mobile ? -vh * .18 : vh * .035};
      }
      return {cartao:key(card,480,340,24), miniatura:key(mini,620,520,38)};
    },
    render(P, reduced) {
      const state = P.irCartao >= .92 && P.irMiniatura <= .03 ? 'card' : P.irMiniatura >= .92 && P.irCelular <= .03 ? 'model' : '';
      objects.style.visibility = P.aproximacao > .05 && P.fecharNote < .95 ? 'hidden' : 'visible';
      business.style.setProperty('--card-lift', `${(reduced ? 1 : Math.min(1, P.irCartao)) * 80}px`);
      if (state === active) return;
      active = state;
      document.documentElement.dataset.discovery = state;
      // Move focus before hiding the controls that currently own it.
      if (!state && panel.contains(document.activeElement)) document.querySelector('[data-chapter="atelie"]')?.focus({preventScroll:true});
      panel.hidden = !state;
      if (!state) return;
      panel.dataset.station = state;
      $('#discoveryKicker').textContent = state === 'card' ? '04 / UM CARTÃO, OUTRO ÂNGULO' : '05 / FEITO DE CAMADAS';
      $('#discoveryTitle').textContent = state === 'card' ? 'Prazer, Lucas.' : 'Esta mesa também é um projeto.';
      $('#discoveryDescription').textContent = state === 'card' ? 'Designer e instrutor de Vibe Design na Asimov Academy. Entre design, ensino e IA, exploro maneiras de transformar ideias em experiências.' : 'Uma miniatura do lugar onde você está. Gire a base e afaste as camadas para descobrir o que dá profundidade à experiência.';
      $('.discovery-card-controls').hidden = state !== 'card';
      $('.discovery-model-controls').hidden = state !== 'model';
      $('#discoveryNext').textContent = state === 'card' ? 'Conhecer a miniatura →' : 'Vamos conversar →';
    },
    hide() { active = ''; panel.hidden = true; document.documentElement.dataset.discovery = ''; }
  };
  addEventListener('portfoliomode', e => { if (e.detail.plain) window.deskDiscoveries.hide(); });
})();
