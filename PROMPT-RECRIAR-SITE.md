# Prompt para recriar o portfólio “Mesa” do zero

## Como usar

Cole primeiro o **Prompt mestre** em um agente de código com acesso a uma pasta vazia. Se o agente não concluir tudo em uma única execução, use os prompts de continuação, na ordem, sem pedir que ele recomece.

---

## Prompt mestre

Quero que você projete e implemente do zero um portfólio pessoal web cinematográfico, responsivo e acessível. A experiência principal deve acontecer sobre uma mesa de trabalho vista de cima e ser totalmente dirigida pelo scroll. Não copie um template genérico de portfólio e não transforme a ideia em uma sequência convencional de seções empilhadas. O próprio ambiente da mesa deve ser a interface e conduzir a narrativa.

Use HTML, CSS e JavaScript vanilla, sem framework e sem etapa de build. O projeto deve abrir com um servidor estático simples. Organize o código em arquivos separados, no mínimo `index.html`, `styles.css`, `content.js` e `scene.js`. Se uma biblioteca 3D for realmente necessária, mantenha-a local ou forneça um fallback funcional sem rede. A maior parte da cena, inclusive o notebook, deve ser construída com HTML/CSS 3D; não use uma imagem pronta de notebook.

### Regra fundamental sobre imagens

Não use, gere, procure nem invente fotografias pessoais. Toda imagem de pessoa, retrato, foto histórica, capa de projeto ou objeto fotografado deve aparecer como um placeholder elegante e facilmente substituível. Use blocos com proporção correta, cor, textura abstrata, ícone discreto e rótulos como `[FOTO DE PERFIL]`, `[FOTO 2019]`, `[CAPA DO PROJETO]`, `[PLANTA — IMAGEM COM FUNDO TRANSPARENTE]`. Não use serviços externos de placeholder nem URLs remotas. Centralize os caminhos futuros em `content.js` ou em variáveis fáceis de localizar. O layout não pode quebrar quando os placeholders forem substituídos por PNG/WebP com transparência.

Não implemente avatar, assistente virtual, chatbot flutuante, retrato flutuante nem o CTA inferior associado a esse recurso. Esses elementos estão explicitamente fora do escopo.

### Conceito visual

A primeira tela mostra uma mesa de madeira quente em visão zenital. No centro há um notebook grafite fechado. Ao redor, componha um flat lay crível com placeholders de planta, xícara de café, fone, caderno, caneta, celular, pequeno objeto pessoal e um post-it. O enquadramento deve parecer editorial e cuidadosamente iluminado, com luz difusa vinda do alto à esquerda, sombras de contato macias e uma vinheta discreta.

Sobre a mesa, acima do notebook, exiba:

- eyebrow: `[DESIGN, CAFÉ E UM POUCO DE IA.]`;
- título grande: `[VEM CONHECER MEU TRABALHO]`;
- apoio: `[Boas ideias começam com uma conversa. As minhas estão aqui, em cima da mesa.]`.

No topo fixo, coloque um wordmark circular `xx.` ao lado de `[SEU NOME]` e `[CARGO / ESPECIALIDADE]`. À direita, mostre `[CIDADE, PAÍS]`, horário local opcional e um link de contato `[CONTATO ↗]`. O cabeçalho deve ser discreto, cream sobre a mesa, e permanecer legível durante toda a experiência.

Use uma direção visual editorial, humana e tátil: madeira em tons de nogueira, cream `#FFF3DF`, grafite `#17171B`, azul-cobalto `#2743E0`, amarelo `#FFD23F`, rosa `#FF4FA7` e acentos terrosos. A tipografia deve ser Bricolage Grotesque variável, preferencialmente self-hosted, com fallback para sans-serif de sistema. Use títulos pesados, tracking negativo e textos pequenos em caixa alta com tracking amplo. Acrescente grão de filme muito sutil e vinheta, ambos fora da árvore 3D.

### Experiência principal dirigida pelo scroll

Crie uma `.stage` fixa ocupando o viewport, com `perspective: 2000px`, e uma `.world` maior que a tela usando `transform-style: preserve-3d`. Uma `.scroller` vazia no fluxo define a duração total. Atualize a cena com `requestAnimationFrame`, interpolação suave e apenas `transform`/`opacity` nas animações críticas.

A narrativa deve acontecer nesta ordem e funcionar também ao rolar para cima, de modo reversível:

1. **Mesa / chegada:** flat lay completo, notebook fechado, textos visíveis e parallax muito sutil pelo ponteiro. Os objetos assentam uma única vez no carregamento, com pequeno stagger; não crie loops decorativos.
2. **Aproximação:** ao rolar, os objetos periféricos deslizam e giram para fora do quadro; o texto desaparece; a câmera aproxima e inclina, como alguém puxando uma cadeira e sentando diante do notebook.
3. **Abertura do notebook:** a tampa se abre em CSS 3D enquanto a câmera inclina. Preserve a regra geométrica `inclinação final da câmera + abertura final da tampa = 180°`, por exemplo 70° + 110°, para que a tela termine paralela ao viewport, nítida e clicável. Faça um breve flash cream quando a tela liga.
4. **Cortina de introdução:** dentro da tela do notebook, mostre um pequeno palco com cortinas de veludo vinho, bandô, luz central e o texto `[BEM-VINDO AO MEU UNIVERSO]`, `[IDEIAS FORA DA TELA.]`, `[Design que dá vontade de ver de perto.]`. O scroll abre as duas cortinas lateralmente; não use botão e não reproduza a animação automaticamente.
5. **Galeria de projetos:** com o notebook aberto ocupando a maior parte da tela, o scroll vertical move uma galeria horizontal dentro do display. Cada projeto ocupa exatamente uma tela e “assenta” suavemente no snap lógico, sem travar o scroll. Use de quatro a seis projetos fictícios editáveis em `content.js`, cada um com eyebrow, título, descrição, meta, cor de fundo, cor de texto e `[CAPA DO PROJETO]`. Inclua controles anterior/próximo, contador `01 / 06` e botão `[VER PROJETO ↗]`. Os controles precisam ser clicáveis e acessíveis por teclado. Um clique abre um `<dialog>` com arte placeholder, descrição e CTA editável.
6. **Fechar notebook:** depois do último projeto, feche a tampa, afaste a câmera e faça os objetos retornarem para a mesa.
7. **Caderno / história:** a câmera viaja até o caderno. Ele se alinha, abre em 3D e suas folhas viram conforme o scroll. Monte de três a quatro folhas com frente e verso. Cada página pode conter notas manuscritas, etiquetas, crachás e polaroids, mas toda fotografia deve ser placeholder. Use conteúdo editável como `[COMO TUDO COMEÇOU]`, `[O QUE FAÇO HOJE]`, `[EXPERIÊNCIA]`, `[APRENDIZADOS]` e `[POR ENQUANTO É ISSO]`. Ao rolar para cima, as páginas devem voltar corretamente.
8. **Celular / contato:** feche o caderno e mova a câmera até o celular. Alinhe-o, acenda a tela, apresente uma notificação e revele duas bolhas curtas de conversa. Termine com um campo real para digitar uma mensagem e um botão que abra `mailto:` ou WhatsApp, configurável em `content.js`. Esse celular é o contato final da narrativa; não é um chatbot.
9. **Encerramento:** a mesa escurece progressivamente e a tela do celular apaga por último.

Modele o notebook com materiais em gradientes, base com espessura, teclado gerado em grid, trackpad, dobradiça, bezel, notch/câmera, reflexo de vidro, tampa externa e sombras separadas. Evite propriedades que achatam a árvore 3D (`overflow` não visível, `filter`, `opacity < 1`, `clip-path`, `mask`, `mix-blend-mode` ou `isolation`) em `.world`, `.desk`, `.laptop` e `.lid`. Filtros e opacidade podem existir apenas em folhas que não contenham outros elementos 3D.

### Navegação e controles

Crie um dock fixo centralizado na base com quatro capítulos: `01 Mesa`, `02 Projetos`, `03 História`, `04 Contato`. O item ativo acompanha o progresso. Clicar em um capítulo deve levar ao ponto correspondente da linha do tempo, sem saltos visuais incoerentes. Não coloque foto, avatar ou CTA separado ao lado desse dock.

Inclua um botão discreto `Modo leitura ≡` no canto inferior direito e, em telas grandes, um botão opcional `Luz ☼` que alterna entre iluminação diurna e noturna da mesa. Guarde a preferência de modo na sessão.

### Modo leitura e fallback responsivo

Implemente uma segunda apresentação completa e sem 3D, acessível pelo botão `Modo leitura` e usada automaticamente quando `prefers-reduced-motion: reduce` estiver ativo. Em telas estreitas, ela também pode ser o padrão, mas deve existir um botão `Explorar em 3D ↗` para quem quiser entrar na experiência.

O modo leitura deve ter:

1. hero com eyebrow, título, introdução e uma composição simplificada da mesa feita com placeholders;
2. grade responsiva dos projetos, com cards coloridos e abertura do mesmo `<dialog>`;
3. seção sobre/história em duas colunas no desktop e uma coluna no mobile, com `[FOTO DE PERFIL]`;
4. seção final de contato com um título grande `[COMEÇA COM UM OI.]`, email editável e rodapé.

O conteúdo do modo leitura deve ser semanticamente equivalente ao da experiência 3D, e não uma página vazia de fallback.

### Conteúdo configurável

Em `content.js`, concentre:

- dados pessoais (`nome`, `cargo`, `cidade`, `email`, links);
- lista de projetos;
- páginas do caderno;
- textos do celular;
- caminhos de todos os placeholders/futuros assets.

Use valores claramente fictícios ou entre colchetes. Não inclua nomes, fotos, empresas, emails ou biografia de uma pessoa real.

### Acessibilidade, qualidade e desempenho

- Use HTML semântico, `lang="pt-BR"`, links reais, `<article>` para projetos, `<dialog>` para detalhes e labels em todos os controles.
- Adicione link “Pular para o conteúdo”, foco visível e `aria-current` no capítulo ativo.
- Toda imagem pessoal placeholder deve ter texto alternativo apropriado; elementos puramente decorativos devem usar `alt=""`.
- `prefers-reduced-motion` deve remover entrada animada, parallax e suavização residual e ativar o modo leitura, sem esconder conteúdo.
- Nenhuma animação autônoma contínua, exceto um indicador de scroll muito discreto se necessário.
- Evite layout shift, não faça chamadas de rede em runtime e não dependa de imagens remotas.
- Otimize para 1366×768, 1440×900, 1920×1080, ultrawide e mobile a partir de 360px.
- Garanta que os placeholders preservem `aspect-ratio`, `object-fit` e dimensões explícitas para futura substituição.
- Respeite teclado, Escape no diálogo, retorno de foco e bloqueio de scroll enquanto o diálogo estiver aberto.

### Critérios de aceite

Considere pronto somente quando:

- o scroll percorre toda a narrativa nos dois sentidos sem objetos saltando ou reaparecendo fora de hora;
- a tela aberta do notebook termina frontal, nítida e com botões clicáveis;
- a galeria muda de projeto com scroll, botões e teclado;
- caderno e páginas abrem/fecham corretamente em ambos os sentidos;
- o celular acende, revela a conversa e o campo de mensagem funciona;
- dock, capítulos, modo leitura e reduced motion funcionam;
- não existe avatar, assistente virtual, chatbot flutuante, foto flutuante ou CTA inferior ligado a avatar;
- nenhuma foto pessoal real foi criada ou incorporada;
- não há erros no console;
- a implementação permanece legível, comentada apenas onde a matemática 3D ou o mapa de scroll exigirem explicação.

Antes de encerrar, execute o site localmente, teste desktop e mobile, percorra toda a rolagem, teste o modo leitura e corrija os problemas encontrados. Entregue também um `README.md` curto explicando como rodar, onde editar o conteúdo e como trocar cada placeholder por imagens reais.

---

## Prompt de continuação 1 — concluir a mecânica

Continue a implementação existente sem recomeçar e sem trocar a arquitetura. Compare o estado atual com todos os critérios do prompt mestre. Priorize a linha do tempo reversível do scroll, a geometria da câmera e da tampa, a galeria horizontal, o caderno paginado e a transição até o celular. Teste cada segmento rolando para baixo e para cima. Corrija primeiro erros funcionais e de composição; depois refine easing, sombras e acabamento. Preserve todos os placeholders e não adicione avatar, chatbot ou CTA flutuante.

---

## Prompt de continuação 2 — responsividade e acessibilidade

Agora faça uma revisão completa de responsividade, acessibilidade e fallback. Teste 1366×768, 1440×900, 1920×1080, ultrawide, tablet e 360×800. Garanta que o modo leitura seja uma experiência completa, que reduced motion não esconda conteúdo e que todos os controles funcionem por teclado. Verifique foco, Escape e retorno de foco do dialog, skip link, `aria-current`, contraste, textos alternativos, labels, layout shift e ausência de overflow horizontal. Não altere a direção visual nem introduza fotos reais, avatar ou chatbot.

---

## Prompt de continuação 3 — polimento final

Faça a última passagem de design e performance sem mudar o conceito. O objetivo é uma sensação editorial, tátil e cinematográfica: madeira convincente, notebook grafite construído em CSS 3D, sombras curtas e quentes, tipografia expressiva, transições controladas pelo usuário e uma interface muito discreta. Remova qualquer movimento gratuito ou efeito que prejudique a leitura. Confirme que apenas transform e opacity animam nas partes críticas, que não há propriedades achatando a árvore preserve-3d e que não existem erros no console. Atualize o README e entregue uma lista objetiva do que foi implementado e de todos os placeholders que o usuário precisará substituir.
