# Portfólio "Mesa"

Portfólio pessoal do Lucas Petry. A pessoa chega olhando a mesa de trabalho de cima; o scroll senta a câmera, abre o MacBook (100% CSS 3D), folheia o caderno, passa pelo ateliê (cartão de visita e miniatura da mesa) e termina no celular, onde a conversa começa. Em `v3.html`, um avatar no canto oferece uma conversa guiada.

Site estático, sem framework nem etapa de build. Tudo local: fontes, imagens e Three.js.

## Versões

| URL | Versão | O que tem |
| --- | --- | --- |
| `/` | atual (v2) | mesa, ateliê, caderno, celular; sem avatar |
| `/v3.html` | v3 | a mesma cena com o avatar e a conversa guiada |
| `/v1/` | v1 | primeira versão: cortina de tecido em WebGL, final escuro, WhatsApp |

`/` e `/v3.html` compartilham `css/`, `js/` e `assets/`. A v1 tem código próprio em `v1/` e só compartilha `assets/`.

## Rodar

```sh
python3 -m http.server 8000      # ou: npx serve .
```

Abra `http://localhost:8000`. Precisa ser servido por HTTP: a importação de módulos do avatar não funciona via `file://`.

Atalhos por hash: `#mesa`, `#projetos`, `#historia`, `#atelie`, `#contato`, `#leitura` (modo leitura).

## Estrutura

```
index.html              atual: cena, navegação, modo leitura (sem avatar)
v3.html                 mesma cena com o avatar
v1/                     v1: código próprio (cortina WebGL), funcional
css/
  styles.css            tokens, materiais do MacBook, mesa, slides, caderno, celular, modo leitura
  desk-discoveries.css  ateliê (cartão de visita e miniatura da mesa)
  avatar-assistant.css  avatar e diálogo de conversa
js/
  content.js            PROJETOS, HISTORIA e CONTATO — o conteúdo edita aqui
  scene.js              CFG (segmentos e faixas do scroll), câmera, teclado gerado, caderno 3D, celular
  experience.js         artes dos projetos, diálogo, modos, relógio, navegação
  desk-discoveries.js   objetos, controles e enquadramentos do ateliê
  avatar-assistant.js   diálogo do avatar, transição, conversa e áudio
  avatar-brain.js       respostas locais por intenção (sem modelo de IA conectado)
  avatar-portrait.js    retrato em relevo com Three.js
assets/
  img/                  recortes com alpha em WebP
  fonts/                Bricolage Grotesque self-hosted
  avatar/               textura do retrato
  vendor/               Three.js 0.170 e licença
tests/                  suítes que rodam no navegador, sem instalar nada
docs/                   briefing, revisão da v2, notas do avatar e prompt de recriação
```

## Editar

- **Conteúdo**: `js/content.js` tem os slides, as páginas do caderno e o destino do botão de contato. Os cards estáticos do modo leitura ficam no próprio `index.html`.
- **Roteiro do scroll**: objeto `CFG` no topo de `js/scene.js`. `tiltEnd + lidOpen` precisa somar 180.
- **Avatar**: só existe em `v3.html`. Para levar à raiz, copie de lá o `<link>` de `avatar-assistant.css`, o bloco `#avatarLaunch` + `<dialog id="avatarDialog">` e os dois `<script>` de avatar.
- **Mesa**: `<html data-desk="wood">` usa a madeira; sem o atributo volta a mesa tangerina do briefing.

## Testar

Com o servidor rodando, abra no navegador:

- `tests/v2-checks.html` — `index.html`: cena, câmera em todos os segmentos, galeria, diálogo, modo leitura, fallback sem JS
- `tests/discoveries-checks.html` — `index.html`: ateliê
- `tests/avatar-checks.html` — `v3.html`: avatar, conversa, voz e microfone (com mocks)
- `tests/v2-mobile.html` e `tests/discoveries-mobile.html` — viewport 390 × 844 em iframe

## Fontes das imagens

Os PNGs originais (antes do recorte e da conversão para WebP) ficam em `_originais/`, fora do git. Os documentos em `docs/` são históricos e citam os nomes de arquivo anteriores à reorganização (`index-v3.html`, `scene-v2.js` etc.).
