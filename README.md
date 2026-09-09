# Portfólio "Mesa"

Site estático, sem build. Abre com qualquer servidor local:

```sh
python3 -m http.server 8000      # ou: npx serve .
```

- `index.html` — cena (mesa, objetos, MacBook em CSS 3D, tela)
- `styles.css` — tokens, materiais do MacBook, slides
- `scene.js` — `CFG` (segmentos + faixas do scroll), câmera por keyframes, teclado gerado, galeria, caderno 3D, celular
- `curtain.js` — cortina de teatro da intro da tela: tecido simulado (Verlet, pregas pinçadas no trilho, vento, abertura por cordão) renderizado com Three.js (via importmap/jsdelivr, material físico com sheen de veludo e sombra). Se o CDN não carregar, a cortina CSS de `styles.css` segue sozinha
- `content.js` — `PROJETOS` (slides), `HISTORIA` (páginas do caderno), `CONTATO` (wa.me ou mailto do botão enviar) — edita aqui
- `assets/img` — recortes com alpha (WebP) · `assets/fonts` — Bricolage Grotesque self-hosted

Superfície da mesa: `<html data-desk="wood">` usa a madeira (`assets/img/mesa.webp`); remove o atributo pra voltar à mesa tangerina do briefing.

Ajustes ficam no objeto `CFG` no topo de `scene.js`: `tiltEnd + lidOpen` precisa somar 180.

A tela liga numa cortina que abre puxada pelo scroll (sem botão): `scene.js` escreve o progresso do segmento `cortina` nas variáveis `--g`/`--x` do `#intro`, e `curtain.js` lê essas variáveis a cada frame pra animar o pano em WebGL — reversível, rolar pra cima fecha de novo.

Roteiro do scroll (`CFG.segs`, duração em vh): aproximação → cortina (abre puxada pelo scroll) → galeria → fecharNote (tampa fecha, objetos voltam) → irCaderno (câmera desce, capa abre) → paginas (uma por página de `HISTORIA`) → fecharCaderno → irCelular (tela acende, notificação) → chat (bolhas + campo real) → apagar (mesa escurece, tela apaga por último). As faixas dentro de cada segmento estão em `CFG.map`.

Placeholders entre [colchetes] em `content.js` são pra trocar (textos do caderno, número do `CONTATO`).

## Ateliê — versões 2 e 3

`index-v3.html#atelie` abre as duas novas paradas físicas entre o caderno e o celular: cartão de visita reversível e miniatura da mesa com rotação e separação de camadas. Também estão disponíveis na versão 2. Os projetos ilustrativos não foram alterados.

- `desk-discoveries.js`: objetos, conteúdo, controles e enquadramentos das novas paradas.
- `desk-discoveries.css`: materiais e layout responsivo. O cartão respeita movimento reduzido.
- `scene-v2.js`: segmentos `irCartao`, `cartao`, `irMiniatura` e `miniatura`; câmera com compensação de profundidade para inclinar longe do centro da mesa.
- `tests/discoveries-checks.html`: navegação, câmera, controles, retorno, repouso e mobile.
- `tests/discoveries-mobile.html`: visualização em iframe de 390 × 844.

O modo leitura inclui uma seção equivalente sobre atuação e construção do portfólio. Não há espera obrigatória: o visitante pode explorar os controles, seguir pelo scroll ou usar os atalhos.
