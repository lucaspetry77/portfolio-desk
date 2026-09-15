/* Shared content and controls. No dependencies, network calls or perpetual timers. */
(() => {
  'use strict';
  const html = document.documentElement;
  const $ = s => document.querySelector(s);
  const art = [
    '<div class="coffee-bag"><small>CAFÉ ESPECIAL / BRASIL</small><strong>TORRA</strong><div class="coffee-sun">✳</div><em>COM TEMPO. COM ALMA.</em><small style="margin-top:20px">250 G / TORRA MÉDIA</small></div>',
    '<div class="forme-object"><i></i><i></i><i></i><i></i></div>',
    '<div class="perfume"><div class="perfume-label"><strong>Âmago</strong><small>EAU DE PARFUM / 50 ML</small></div></div>',
    '<div class="ny-poster"><strong>NEW<br>YORK.</strong><div class="skyline"><i></i><i></i><i></i><i></i><i></i></div><small>A CITY. A THOUSAND STORIES.</small></div>',
    '<div class="trato-app"><small>TRATO / SEU ESPAÇO</small><strong>Menos ruído.<br>Mais foco.</strong><div class="task-row done"><b>✓</b>Tirar a ideia do papel</div><div class="task-row"><b></b>Criar algo com intenção</div><div class="task-row"><b></b>Uma pausa para o café</div><span class="app-plus">+</span></div>',
    '<div class="watch"><strong>T E M P U S</strong><i></i><i></i></div>'
  ];
  const labels = ['ORIGEM & IDENTIDADE', 'FORMA & MATÉRIA', 'ESSÊNCIA & PRESENÇA', 'LUGARES & HISTÓRIAS', 'CLAREZA & INTENÇÃO', 'TEMPO & PRECISÃO'];
  const artHTML = i => `<div class="concept-art">${art[i]}<span class="art-caption">${labels[i]}</span></div>`;
  window.portfolioArt = artHTML;
  document.querySelectorAll('[data-art]').forEach(el => { el.innerHTML = artHTML(+el.dataset.art); });

  const dialog = $('#projectDialog');
  let returnFocus = null;
  let savedOverflow = '';
  function showProject(i, trigger) {
    if (!PROJETOS[i] || dialog.open) return;
    const p = PROJETOS[i];
    returnFocus = trigger || document.activeElement;
    $('#dialogTitle').textContent = p.titulo;
    $('#dialogDescription').textContent = p.desc;
    $('.dialog-meta').textContent = p.meta;
    const visual = $('.dialog-art');
    visual.innerHTML = artHTML(i);
    visual.style.setProperty('--bg', p.bg);
    visual.style.setProperty('--fg', p.fg);
    savedOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    dialog.showModal();
  }
  window.openPortfolioProject = showProject;
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-project]');
    if (trigger) showProject(+trigger.dataset.project, trigger);
  });
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    html.style.overflow = savedOverflow;
    returnFocus?.focus({ preventScroll: true });
  });

  const mode = $('#modeToggle');
  mode.innerHTML = html.classList.contains('is-plain') ? 'Explorar em 3D <span aria-hidden="true">↗</span>' : 'Modo leitura <span aria-hidden="true">≡</span>';
  mode.addEventListener('click', () => {
    const plain = html.classList.toggle('is-plain');
    if ('scrollRestoration' in history) history.scrollRestoration = plain ? 'auto' : 'manual';
    try { sessionStorage.setItem('portfolio-mode', plain ? 'plain' : '3d'); } catch { /* Private browsing may disable storage. */ }
    mode.innerHTML = plain ? 'Explorar em 3D <span aria-hidden="true">↗</span>' : 'Modo leitura <span aria-hidden="true">≡</span>';
    window.dispatchEvent(new CustomEvent('portfoliomode', { detail: { plain } }));
    const section = plain ? '#projetos' : '#mesa';
    if (plain) $(section).scrollIntoView({ behavior: 'instant' });
    else window.dispatchEvent(new CustomEvent('portfoliochapter', { detail: { chapter: 'mesa', instant: true } }));
  });
  $('.skip-link').addEventListener('click', e => {
    e.preventDefault();
    if (!html.classList.contains('is-plain')) mode.click();
    $('#leitura').focus({ preventScroll: true });
    $('#projetos').scrollIntoView({ behavior: 'instant' });
  });
  $('#lightToggle').addEventListener('click', e => {
    const evening = html.dataset.light !== 'evening';
    html.dataset.light = evening ? 'evening' : 'day';
    e.currentTarget.setAttribute('aria-pressed', String(evening));
  });
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    if (link.classList.contains('skip-link')) return;
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      if (!['mesa', 'projetos', 'historia', 'contato'].includes(id)) return;
      if (html.classList.contains('is-plain')) return;
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('portfoliochapter', { detail: { chapter: id, instant: e.detail === 0 } }));
    });
  });
  const clock = () => {
    if (!document.hidden) $('#deskClock').textContent = new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  };
  clock();
  setInterval(clock, 60000);
  document.addEventListener('visibilitychange', clock);
  addEventListener('pageshow', clock);
  const sections = [...document.querySelectorAll('.reading>section')];
  const observer = new IntersectionObserver(entries => {
    if (!html.classList.contains('is-plain')) return;
    for (const entry of entries) if (entry.isIntersecting) {
      document.querySelectorAll('[data-chapter]').forEach(a => {
        if (a.dataset.chapter === entry.target.id) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
  sections.forEach(el => observer.observe(el));
  document.querySelectorAll('.project-card-info button').forEach(b => { b.hidden = false; });
})();
