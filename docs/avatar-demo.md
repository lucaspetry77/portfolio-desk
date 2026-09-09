# Avatar Lucas — demo local

Implementado em index-v3.html (a v2 ficou sem avatar). Execute com servidor HTTP local; a importação de módulos não funciona ao abrir por file://.

## Experiência

- Avatar no canto inferior esquerdo, inspirado na foto fornecida, com óculos, cabelo, barba e camiseta preservados na direção visual.
- Retrato volumétrico renderizado por Three.js 0.170.0 local: malha subdividida em relevo, profundidade facial, rotação limitada da cabeça e acompanhamento sutil dos olhos.
- O mesmo elemento viaja entre o canto e o centro em uma transição de posição e escala. O diálogo escurece a mesa, prende o foco e restaura o foco e o scroll ao fechar. Escape fecha imediatamente.
- Respostas guiadas sobre trabalho, projetos, história, ensino, IA e contato. Sugestões, contexto básico, histórico em memória, reinício e ações para visitar a galeria ou abrir um e-mail.
- Voz opcional via speechSynthesis; ditado opcional via SpeechRecognition, quando disponível. A transcrição fica no campo para revisão antes do envio.
- Não há modelo de IA conectado, backend, API de modelo, persistência de conversas ou envio de mensagens ao Lucas. Projetos continuam conceitos ilustrativos e o contato é lucas@asimov.academy.

## Limites da demo

O avatar é um **retrato em relevo 3D baseado em uma imagem**, não uma cabeça escaneada ou um personagem com rig anatômico de 360°. Rotação e deformações são limitadas para preservar a semelhança. A animação de fala é aproximada, sem sincronização por fonemas. Um personagem com gestos amplos e lip sync preciso exigiria um modelo GLB com rig e blendshapes de expressão.

A voz é uma voz sintética disponível no navegador, não uma clonagem da voz do Lucas. Reconhecimento e síntese variam conforme navegador, sistema e idioma instalado. Alguns navegadores processam o reconhecimento em serviço online; por isso existe uma explicação antes de ativar o microfone. A conversa guiada em texto funciona sem esse recurso. Fontes: [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) e [MDN SpeechSynthesisUtterance](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance).

## Movimento e desempenho

Mola criticamente amortecida (rigidez 100, amortecimento 20), integrada em passos de até 8 ms. FLIP de abertura 620 ms e fechamento 500 ms, interrompível. Foco por teclado e reduced-motion evitam a viagem espacial. Renderização pausa em repouso e em abas ocultas; a mesa pausa enquanto o diálogo está aberto. Piscar ocorre apenas com a conversa aberta. Resolução WebGL e pixel ratio limitados; Three.js importado após o primeiro carregamento, com textura WebP de aproximadamente 103 KB. Falha de WebGL mantém um retrato estático com fundo removido em canvas 2D. O microfone nunca é ativado na inicialização.

## Arquivos

- avatar-assistant.js: diálogo, transição, conversa e áudio.
- avatar-assistant.css: layout e estados responsivos, incluindo viewport com teclado.
- avatar-brain.js: respostas e roteamento local por intenção.
- avatar-portrait.js: geometria, shaders e agendador de renderização.
- assets/avatar/lucas-avatar.webp: textura carregada pelo site.
- assets/avatar/lucas-avatar-source.png: fonte gerada preservada para futuras edições (não carregada pelo site).
- assets/vendor/three.module.min.js e THREE-LICENSE.txt: biblioteca local e licença MIT.

## Geração da arte

Ferramenta: image_gen.imagegen, integrada, sem CLI e sem modelo substituto informado. Duas chamadas: geração a partir da foto e edição exclusiva do fundo. A primeira saída tinha um quadriculado incorporado em vez de alfa; a segunda usa fundo verde uniforme, removido no shader e no fallback 2D. A textura foi redimensionada e comprimida em WebP.

Referência original: /Users/lucaspetry/Downloads/foto-perfil (1).png.

Prompt inicial:

> Use case: stylized-concept. Asset type: professional 3D digital avatar portrait for a designer portfolio, transparent fallback and art direction reference for a realtime 3D character. Reference image: the supplied photo is the identity reference. Create a polished, premium, appealing stylized 3D bust of THIS man, recognizable facial proportions, short dark brown crew-cut hair, warm fair/tan skin, neat short reddish-brown beard and mustache, black rectangular eyeglasses, brown eyes, navy blue crewneck shirt. Calm approachable slight closed-mouth smile. Adult masculine proportions, subtly stylized sculptural features, not a child, no oversized cartoon eyes. Head, neck and upper shoulders with clean rounded bust cutoff; centered, symmetrical, straight-on camera at eye level. Subtle warm key light from upper left, soft cool rim light, physically based skin with subtle pores, finely textured hair, satin acetate glasses. Actual transparent alpha background, no environment, no text, no icons, no drop shadow rectangle. Square composition, all head and shoulders inside frame with 10% padding. Beautiful high-end product character render. Keep the person's likeness, glasses shape and hairstyle recognizable.

Prompt da edição:

> Edit target: this exact generated portrait. Preserve this man's identity, pose, expression, glasses, face, hair, shoulders, clothing, lighting, framing and every subject pixel as closely as possible. ONLY replace the white/light gray checkerboard background with a perfectly flat uniformly saturated chroma-key green background, exact sRGB #00FF00. No checkerboard at all. No green lighting on the subject, no green spill, no shadows cast on background. Clean crisp antialiased silhouette. Do not change any portrait features. This is a technical green-screen texture for realtime WebGL background removal.

## Verificação

- tests/avatar-checks.html: 43 verificações passando, cobrindo carregamento WebGL, repouso, foco, pausa da mesa, respostas, conteúdo HTML tratado como texto, voz e reconhecimento com mocks, interrupção de abertura, fechamento com resposta pendente, reinício, layout de 390 px, movimento reduzido e fallback sem WebGL.
- tests/v2-checks.html: 57 verificações de regressão passando.
- Inspeção visual no navegador, desktop e iframe mobile 390 × 844.
- Microfone físico e vozes reais do sistema não foram acionados nos testes; permissões e disponibilidade dependem do dispositivo.

