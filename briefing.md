# Portfólio "Mesa" — brief de construção

Portfólio pessoal do Lucas. A pessoa entra olhando a minha mesa de trabalho de cima, rola, a câmera senta na mesa, o notebook abre e os trabalhos aparecem na tela dele. No final, o notebook vira a moldura de uma galeria horizontal.

Existe um POC funcional em `portfolio-mesa-poc.html` (HTML único, sem dependências). Ele já resolve a mecânica inteira: câmera, tampa abrindo, objetos saindo, galeria dentro da tela. Este brief documenta o que o POC faz e o que falta pra virar o site final. **Começa pelo POC, não do zero.**

---

## 1. A experiência, em cinco atos

Tudo é dirigido pelo scroll. Nada acontece sozinho depois do load.

| Ato | O que a pessoa vê | Scroll (progresso da aproximação `p`) |
|---|---|---|
| 1. Mesa | Flat lay visto de cima: notebook fechado no centro, planta, fone, caderno e celular ao redor. Texto impresso na mesa: "Senta aí. Os trabalhos estão dentro do note." e a dica "role pra abrir". Parallax sutil de mouse. | `p = 0` |
| 2. Limpeza | Os quatro objetos deslizam pra fora do quadro (cada um numa direção, girando um pouco) e somem. O texto da mesa vai junto. | `p 0 → 0.45` |
| 3. Sentar | A câmera faz duas coisas ao mesmo tempo: aproxima (dolly) e tomba (tilt) — sai da visão zenital e vai pra visão frontal, como quem puxa a cadeira. | `p 0.10 → 0.74` |
| 4. Abrir | A tampa do notebook levanta de 0° a 110°. Quando chega perto do fim, a tela "liga": um flash cream e o primeiro slide aparece. | `p 0.40 → 0.86` |
| 5. Imersão | A tampa ocupa ~80% da altura do viewport, com o bezel e a linha do teclado aparecendo embaixo. O scroll vertical passa a mover a galeria horizontal dentro da tela. Menubar com nome, relógio real e contador. | galeria `q 0 → 1` |

O momento memorável é o 4. Todo o resto existe pra ele.

---

## 2. Arquitetura da cena

### Árvore 3D

```
.stage      position fixed, inset 0, perspective 2000px, overflow hidden — a câmera
└ .world    3600×5200px, preserve-3d, transform-origin na dobradiça — recebe dolly + tilt + scale
  └ .desk   plano da mesa (gradiente), preserve-3d
    ├ .obj  × N   recortes 2D (planta, fone, caderno, celular, textos) — leaf, com drop-shadow
    └ .laptop     1000×700px, preserve-3d
      ├ .laptop-shadow  sombra no chão (leaf com blur), z=0
      ├ .base     teclado (grid de .key) + trackpad + .hinge, translateZ(14px), .base-edge dá a espessura
      └ .lid      1000×640px, transform-origin 50% 0 (dobradiça na borda de cima), translateZ(22px), preserve-3d
        ├ .lid-edge   face fina da espessura da tampa
        ├ .lid-outer  tampa fechada com adesivos, backface-visibility hidden
        └ .lid-inner  transform: rotateX(180deg), backface hidden — bezel + .screen
          └ .screen   overflow hidden — .menubar, .strip (slides), .progress, .flash
```

O `.scroller` é um div vazio no fluxo normal cuja altura define quanto scroll a página tem. O `.stage` é fixo por cima. Sem pin, sem lib.

### A regra que faz tudo funcionar

**Tilt da câmera + ângulo da tampa = 180°.** No POC: `tiltEnd: 70` e `lidOpen: 110`. Quando somam 180, a face interna da tampa fica exatamente paralela ao viewport → o DOM da tela renderiza sem distorção, texto nítido, links clicáveis.

A face interna tem `transform: rotateX(180deg)` fixo. Sem isso, quando a tampa abre a tela aparece de cabeça pra baixo (rotateY(180) daria certo pra virar a face, mas somado ao rotateX da tampa vira rotateZ(180)). Com rotateX(180), o total no final é 360 = identidade, upright.

Coordenadas: no elemento `.lid`, `y = 0` é a dobradiça (borda mais longe da pessoa no flat lay). Depois de aberto, essa borda fica **embaixo** na tela. Por isso o `.lid-inner` tem cantos grandes em cima (`border-radius: 40px 40px 16px 16px`) e o `.lid-outer` tem cantos grandes embaixo.

### Câmera

`.world` recebe, a cada frame:

```
translate3d(0, ty, 0) rotateX(tilt + parallaxX) rotateY(parallaxY) scale3d(s, s, s)
```

- `transform-origin` é a dobradiça (`hx: 1800, hy: 3700` em px da mesa). Ela fica no centro do viewport e não se move com tilt/scale — só com `ty`.
- `S0` (escala inicial) = "cover" de uma janela de enquadramento (3200×2000 em landscape, 1600×3000 em portrait).
- `SE` (escala final) = `min(0.92·vw / lidW, 0.80·vh / lidH)`.
- `tyEnd` empurra a dobradiça pra ~86% da altura do viewport → tampa entre 6% e 86%, teclado aparecendo embaixo.
- `scale3d` com os três eixos iguais — se o z ficar 1, a tampa estica quando gira.
- Perspective 2000px. Menor que isso, a base do notebook (que vem pra frente da câmera) explode de tamanho.

Efeito colateral bonito: a mesa é muito mais funda que o viewport (5200px). Quando tomba a 70°, a parte de cima recua até um horizonte a ~34% da altura da tela e a "parede" (`--wall`) aparece atrás. Não corrigir, isso é o cinema.

### O que quebra o 3D (nunca fazer em `.world`, `.desk`, `.laptop`, `.lid`)

- `overflow` diferente de `visible`
- `filter`
- `opacity < 1`
- `clip-path`, `mask`, `mix-blend-mode`, `isolation`

Qualquer um desses força `transform-style: flat` e achata os filhos. Sombras: `box-shadow` na base (não achata) e `drop-shadow` só nos `.obj-in` (leaf). Grão de filme: overlay `position: fixed` fora da árvore 3D.

### Mapa do scroll (o que o POC faz hoje)

`p` = progresso da aproximação (0→1 ao longo de `approachVH` = 460vh). `q` = progresso da galeria.

| Faixa de `p` | O quê | Easing |
|---|---|---|
| 0 → 0.45 | objetos deslizam pra fora (`data-dx`, `data-dy`, `data-drot`) | ease-in cúbico (aceleram saindo) |
| 0.16 → 0.44 | objetos apagam (opacity) | linear |
| 0 → 0.12 | parallax de mouse desliga | linear |
| 0.10 → 0.74 | tilt 0→70°, scale S0→SE, ty ty0→tyEnd | ease-in-out cúbico |
| 0.40 → 0.80 | tampa 0→110° | ease-in-out cúbico |
| 0.58 → 0.72 | flash cream na tela (seno) | — |
| 0.62 → 0.86 | tela liga (strip + menubar opacity) | ease-out |

Galeria: `t = q·(N−1)`, `x = floor(t) + 0.35·frac + 0.65·easeInOut(frac)` → `translateX(−x · larguraDaTela)`. O 65% de easing faz cada slide "assentar" sem travar o scroll.

Suavização: `cur += (scrollY − cur) · 0.09` por frame. É o scrub. Com `prefers-reduced-motion`, vira 1 (sem lag) e o parallax desliga.

### Botões de ajuste (objeto `CFG` no POC)

`tiltEnd`, `lidOpen`, `approachVH`, `slideVH`, `smooth`, `hx/hy`, `lidW/lidH`. As faixas do mapa de scroll estão hardcoded no `render()` — vale extrair pra `CFG` também.

---

## 3. Design

### Tokens

| Nome | Hex | Uso |
|---|---|---|
| `--desk` | `#F45A2E` | superfície da mesa (tangerina); gradiente com `--desk-hi #FF7C50` e `--desk-lo #D9491F`, escurecendo pro fundo em `--desk-far #7A2510` |
| `--wall` | `#2A0E1F` | parede/fundo além do horizonte, com `--wall-hi #4A1428` |
| `--cream` | `#FFF3DF` | texto na mesa, adesivo principal, vaso, páginas |
| `--cobalt` | `#2743E0` | caderno, adesivo "faz com IA" |
| `--butter` | `#FFD23F` | fone, elástico do caderno, adesivo "design operator" |
| `--pink` | `#FF4FA7` | só o adesivo "POA" |
| `--leaf` / `-2` / `-3` | `#1F8F4E` `#35A862` `#146B39` | planta |
| `--graphite` | `#17171B` | notebook; teclas `--key #2A2A31`; bezel `--bezel #0B0B0E` |

Lógica: a mesa é a cor dominante; planta, fone e caderno são pontos de cor pura; notebook e celular são grafite (mesmo material, pra tela roubar a cena). Sombras tingidas de vermelho-queimado (`rgba(80,18,0,.38)`), nunca preto puro.

### Tipografia

Uma família só: **Bricolage Grotesque** (Google Fonts, variável, eixos `opsz` e `wght`). Display em 800 com tracking negativo (−.04em), corpo em 500. `font-optical-sizing: auto` — o eixo opsz muda o desenho conforme o tamanho.

- Headline na mesa: 212px / .88 (em px da mesa; na tela vira ~95px)
- Adesivo "Lucas": 150px
- Título de slide: 68px / .92
- Contato: 92px

### Motion

- Load: uma única sequência — os objetos "assentam" na mesa com stagger de 90ms (`@keyframes settle`). Só isso.
- Depois do load, todo movimento responde ao scroll ou ao mouse. Nenhum loop decorativo, exceto o chevron da dica de scroll.
- Sem hover em tudo. Títulos de slide sublinham no hover e pronto.

### Copy

- Mesa: "Senta aí." / "Os trabalhos estão dentro do note." / "role pra abrir"
- Adesivos na tampa: Lucas · design operator · POA · faz com IA
- Menubar: "Lucas portfólio" · relógio real · "3 / 7"
- Último slide: "Curtiu? Me chama." + email, Instagram, LinkedIn

---

## 4. Assets

O POC usa ilustrações vetoriais como placeholder. A versão final troca cada `.obj-in` por um PNG recortado com fundo transparente. Regras pro conjunto ficar coeso:

- **Câmera idêntica em todos:** zenital estrita (90°), sem perspectiva.
- **Luz idêntica em todos:** difusa, vinda do canto superior esquerdo, sombras curtas e suaves.
- **Gerar sobre fundo branco liso** e remover o fundo depois (Magnific/remove background). A sombra de contato vai embora — a sombra volta via `drop-shadow` no CSS, no ângulo certo.
- Resolução: cada objeto ocupa 400–550px na mesa em escala 1, e a mesa aparece em até ~0.6 de escala em 4K → gerar em 2048px de lado e exportar em 2×.
- **O notebook é 100% CSS, não vira imagem.** Alumínio via gradientes (`.alu`), teclado em grid de divs com bisel, espessura da base e da tampa como faces rotacionadas (`.base-edge`, `.lid-edge`), dobradiça, trackpad de vidro e sombra no chão em elemento próprio (`.laptop-shadow`). Imagem gerada de notebook não convence nesse ângulo e quebra quando a tampa gira.

| Asset | Tamanho na mesa | Cor | Observação |
|---|---|---|---|
| Planta em vaso | 540×540 | folhas verdes, vaso cream | vista de cima, folhas irradiando |
| Fone over-ear | 470×470 | butter, conchas grafite | arco + duas conchas |
| Caderno fechado | 380×520 | capa cobalt, elástico butter | páginas cream visíveis na borda |
| Celular (costas) | 190×390 | grafite | módulo de câmera visível |
| Superfície da mesa | 3600×5200, tileável | tangerina fosca | opcional — o gradiente CSS já funciona |

Os prompts de geração estão em documento separado.

---

## 5. Conteúdo dos slides

Cada slide é um objeto no array `PROJETOS`:

```js
{ titulo, desc, meta, bg, fg, capa }   // projeto
{ contato: true, titulo, desc, links: [[label, href]], bg, fg }   // último
```

Layout: duas colunas — texto à esquerda (título, uma linha de descrição, meta discreta no rodapé), "capa" à direita (painel com a inicial gigante como placeholder). Na versão final, a capa vira imagem ou vídeo do projeto e o título vira link pra página do case.

Cada slide tem cor própria de fundo. A tela do notebook muda de cor conforme a galeria anda — é a parte "com cores" do brief acontecendo dentro da moldura neutra.

---

## 6. Mobile

O POC funciona em portrait, mas não brilha: o notebook é landscape e fica pequeno numa tela em pé. A ideia certa: **no mobile, aproximar o celular da mesa em vez do notebook.** Mesma mecânica (tilt + dolly, "tampa" vira a tela do celular acendendo), moldura de smartphone, galeria vertical ou horizontal dentro dela. Fica pra segunda fase; até lá, o fallback do POC serve.

---

## 7. Performance e acessibilidade

- Só `transform` e `opacity` animam. Nunca `top/left/width/height`.
- `will-change: transform` em `.world`, `.lid`, `.obj`, `.strip`. Em mais nada.
- Texto na tela renderiza nítido porque a escala final fica perto de 1 (`SE ≈ 1.1` em 1440px). Se mudar `lidW`, revisar isso.
- Imagens: `loading="eager"` nos objetos da mesa (aparecem no primeiro frame), `decoding="async"`.
- `prefers-reduced-motion`: sem entrada animada, sem parallax, sem suavização. A cena continua dirigida pelo scroll (é movimento que a pessoa controla).
- Links da galeria são `<a>` reais. Foco visível. Os slides são `<article>`.
- Sem emoji, sem logo de marca no notebook.

---

## 8. Plano de build (Claude Code)

**Fase 0 — Ler o POC.** Abrir `portfolio-mesa-poc.html`, rodar, rolar. Entender o `render()` antes de mexer.

**Fase 1 — Projeto.** Vite + vanilla (ou manter HTML único, se preferir). Separar `styles.css`, `scene.js` (câmera/scroll), `content.js` (`PROJETOS`), `index.html`. Extrair as faixas do mapa de scroll pra `CFG`.

**Fase 2 — Assets reais.** Gerar os PNGs, remover fundo, trocar os placeholders. Ajustar `drop-shadow` e as posições (`left/top` de cada `.obj`). Mapear base e tampa do notebook.

**Fase 3 — Conteúdo real.** Popular `PROJETOS` com os projetos de verdade, capas em imagem/vídeo, links pros cases.

**Fase 4 — Polimento.** Ajustar as faixas do scroll sentindo no trackpad e no mouse. Checar o horizonte da mesa em ultrawide e 4:3. Testar Safari (backface-visibility às vezes precisa do prefixo, já está lá).

**Fase 5 — Mobile.** Variante "celular na mesa".

**Pronto quando:** a tampa abre e a tela fica nítida e clicável em 1366, 1440, 1920 e ultrawide; nenhum objeto reaparece depois de sair; o scroll da galeria não trava; reduced-motion funciona; Lighthouse sem alertas de layout shift.