# Revisão do portfólio — V2

A V2 preserva a mesa de madeira, o notebook que abre pelo scroll, o caderno com páginas e o celular como contato. A direção visual usa luz de janela, sombras de contato, metal escuro com logo da Apple, papel e tecido, com navegação mais curta e controles permanentes.

A versão original permanece em `index.html`. Abra `index-v2.html` pelo mesmo servidor local. Não há instalação de pacotes nem etapa de build.

## Revisão e mudanças

| Before (original) | After (V2) | Motivo |
| --- | --- | --- |
| `scene.js:498–513` mantém um `requestAnimationFrame` permanente, mesmo sem alterações visuais. | `scene-v2.js` agenda frames somente durante movimento e suspende ao ocultar a aba ou entrar no modo leitura. | Reduz trabalho ocioso e consumo de bateria. |
| Cortina: malhas 44 × 34, molas, normais, sombras e renderizador Three.js importado por CDN. | Cortina em CSS, sem simulação contínua ou download do Three.js. | O benefício do tecido simulado estava restrito a uma etapa curta; o orçamento fica disponível para a cena principal. |
| Mesa e planta somam 2.275.317 bytes. | Derivados WebP somam 332.854 bytes, redução de **85,4%** nesse par de imagens. | Resolução ajustada à apresentação; arquivos originais preservados. |
| Aproximação + cortina exigem 660 vh de scroll antes da galeria. | 235 vh, com acesso direto pelo menu. | A pessoa chega aos trabalhos mais rápido. |
| Percurso inteiro soma 2.175 vh com o conteúdo atual. | 1.250 vh, redução de 42,5%. | Mantém a narrativa com menos deslocamento obrigatório. |
| Objetos 3D recebem `opacity < 1` no ancestral durante transições (`scene.js:401`). | Caderno e celular mantêm ancestral opaco; visibilidade é desligada ao sair. | Evita achatar os contextos `preserve-3d` na transição. |
| `display.clientWidth` é lido no meio do render após escritas de estilo. | Largura é medida no layout, fora do percurso de animação. | Evita essa leitura potencialmente síncrona por frame. |
| Links dos projetos usam `href="#"`. | Botões abrem um diálogo com conceito, descrição e contato. | Elimina saltos falsos ao topo; placeholders continuam explicitamente ilustrativos. |
| Capas são iniciais grandes. | Seis estudos visuais próprios em HTML/CSS. | Mais personalidade sem baixar seis novas imagens. |
| Navegação depende integralmente de um longo scroll. | Menu Mesa / Projetos / História / Contato e controles anterior/próximo. | Permite explorar ou ir direto ao conteúdo. |
| Slides fora de uso e páginas fechadas podem permanecer na árvore acessível. | `inert` e `aria-hidden` acompanham a cena; teclado decorativo é ocultado da árvore acessível. | Reduz foco e leitura de conteúdo invisível. |
| Redução de movimento só remove suavização; câmera continua obrigatória. | Modo leitura por padrão para `prefers-reduced-motion` e telas de até 700 px. | Conteúdo legível sem a viagem de câmera; 3D continua opcional. |
| Cena é construída integralmente em qualquer tela. | Modo leitura só inicializa a cena ao optar pelo 3D. | Evita construir centenas de elementos e camadas no mobile por padrão. |
| Sem JavaScript, projetos e história não são construídos. | Documento HTML com projetos, apresentação e contato, com fallback `noscript`. | Conteúdo principal continua disponível. |
| WhatsApp contém um número provisório. | `mailto:lucas@asimov.academy`, conforme informado. | Contato válido; mensagem é codificada e abre o aplicativo de e-mail. |
| Etapa final escurece toda a cena e apaga a tela do celular. | Contato permanece aceso e operável. | A conclusão conduz à conversa. |
| Recarregar um link direto pode restaurar scroll incompatível com a câmera inicial. | Restauração manual no 3D e tratamento de capítulos por hash. | Enquadramento consistente ao abrir `#mesa` ou outro capítulo. |
| Fontes manuscritas dependem do Google Fonts. | Tipografia Bricolage já hospedada no projeto. | Sem conexão externa necessária para fontes ou execução. |

## Arquivos

- `index-v2.html`: entrada, objetos da cena, navegação, documento acessível e diálogo.
- `styles-v2.css`: materiais, iluminação, layout, arte dos conceitos e responsividade.
- `scene-v2.js`: câmera, segmentos de scroll, notebook, páginas, celular e agendamento sob demanda.
- `experience-v2.js`: estudos visuais, diálogo, modos, relógio e navegação.
- `content-v2.js`: conteúdo dos slides, páginas do caderno e destinatário do formulário.
- `assets/v2/desk.webp` e `assets/v2/plant.webp`: imagens otimizadas.
- `tests/v2-checks.html`: regressões executadas no navegador, sem instalar ferramentas.
- `tests/v2-mobile.html`: viewport isolado de 390 × 844 para inspeção visual.

O conteúdo dos seis projetos foi mantido provisório por solicitação. As artes da V2 são explorações visuais, não imagens de trabalhos entregues. Ao substituir os projetos, atualize `content-v2.js`, as artes em `experience-v2.js` e os cards estáticos de fallback em `index-v2.html`. O e-mail também aparece nos links estáticos desse HTML.

## Validação

**Resultado: 57 verificações passaram, nenhuma falhou.**

A suíte verifica inicialização, todos os dez segmentos de câmera em três posições, seis estados da galeria, diálogo e retorno do foco, mensagem codificada (interceptada no teste, sem abrir ou enviar e-mail), contato final, suspensão de frames, troca de modo, inicialização tardia, layout mobile, fallback sem JavaScript e recarga por link direto.

Foram feitas inspeções visuais no navegador Chromium integrado: abertura, galeria, modal, caderno, celular e leitura em viewport mobile de 390 × 844. A sintaxe dos três scripts foi verificada com `node --check`; as referências locais foram verificadas e os IDs do HTML não se repetem.

Os arquivos locais referenciados pela V2 totalizam aproximadamente **903 KB**, somando também fontes e fotografias de seções posteriores, antes de compressão HTTP. Isso é uma soma de arquivos, não uma medição de transferência inicial. Os 85,4% de redução se referem somente à mesa e à planta; não são uma estimativa de FPS ou uma nota de Lighthouse.

## Limites conhecidos

A cena usa CSS 3D e recortes fotográficos, não geometria completa de todos os objetos ou iluminação por path tracing. A visão mais natural continua sendo a trajetória de câmera definida. Não há certificação de desempenho em dispositivos físicos, auditoria WCAG completa, medição Lighthouse ou validação em Safari/Firefox nesta entrega. O envio por `mailto:` depende de um aplicativo de e-mail configurado; o site não envia mensagens por um servidor.

## Ajustes de 7 de setembro

Logo original da Apple restaurada; adesivos do notebook, legenda de capítulo no canto inferior esquerdo e indicação “role para explorar” removidos. O H1 agora é “Senta aí, vem conhecer meu portfólio.”, com quebra depois de “Senta aí,” e tipografia responsiva, tanto na cena quanto no modo leitura.

### Avatar interativo — setembro de 2026

A V2 agora inclui um avatar inspirado na foto do Lucas no canto inferior esquerdo. A renderização do retrato em relevo usa Three.js local, carregado após o conteúdo principal. O diálogo central pausa a mesa e oferece conversa guiada, síntese de voz opcional e ditado opcional com revisão do texto. Os limites da representação 3D, áudio e demo, prompts da arte e verificações estão em `AVATAR-DEMO.md`.
