/* =========================================================
   CONTEÚDO — edita aqui. Cada projeto vira um slide na tela.
   { titulo, desc, meta, bg, fg, capa, href } → projeto
   (o CTA de contato foi pro celular — ver o fluxo de chat mais abaixo na cena)
   ========================================================= */
const PROJETOS = [
  { titulo: 'TORRA',          desc: 'Marca de café especial. Identidade, embalagem e site.',           meta: 'Branding e site, 2026',  bg: '#5A6A2E', fg: '#EAC64A', capa: '#4A5826', href: '#' },
  { titulo: 'FORME',          desc: 'Estúdio de mobiliário modular. Homepage com exploded view 3D.',  meta: 'Web e 3D, 2026',         bg: '#F1E9DA', fg: '#17171B', capa: '#E2D6BE', href: '#' },
  { titulo: 'Âmago',          desc: 'Perfume de nicho. Um mundo navegável por scroll em Three.js.',  meta: 'Web imersiva, 2026',     bg: '#2A0E24', fg: '#FF7BC0', capa: '#3E1536', href: '#' },
  { titulo: 'Visit New York', desc: 'Landing de cia aérea com Nova York em 3D fotorrealista.',       meta: 'Web e 3D, 2026',         bg: '#2743E0', fg: '#FFF3DF', capa: '#1E35BF', href: '#' },
  { titulo: 'Trato',          desc: 'App de produtividade. Homepage e sistema de design.',           meta: 'Produto e web, 2026',    bg: '#FFD23F', fg: '#17171B', capa: '#F0BF24', href: '#' },
  { titulo: 'Tempus',         desc: 'Relojoaria de luxo. Branding e e-commerce.',                    meta: 'Branding e loja, 2026',  bg: '#17171B', fg: '#D6B36A', capa: '#232329', href: '#' },
];

/* =========================================================
   CONTATO — pra onde vai a mensagem digitada no celular.
   'https://wa.me/55DDDNUMERO' (WhatsApp) ou 'mailto:voce@email.com'
   ========================================================= */
const CONTATO = 'https://wa.me/[SEU NÚMERO COM DDI, ex: 5551999999999]';

/* =========================================================
   HISTORIA — o caderno. Um objeto por página, com recto (frente) e verso.
   O spread aberto mostra o verso da página anterior à esquerda e o recto da próxima à direita.
   Item: { tipo, x, y, rot, ...campos }. x/y em px da página (294×432).
   Tipos: nota{texto, tam:'p'|'g'} polaroid{legenda} cracha{nome,cargo,empresa}
          cartao{nome,cargo,empresa} ingresso{evento,data,local} adesivo{texto,cor,forma:'redondo'|'pill'}
          recorte{titulo,texto}. fita: lista de posições ['t','tl','tr','bl','br'].
   Tudo entre [colchetes] é placeholder.
   ========================================================= */
const HISTORIA = [
  { // folha 1 — frente: guarda / verso: como tudo começou
    recto: [
      { tipo: 'nota', x: 26, y: 28, rot: -2, tam: 'p', texto: 'este caderno pertence a' },
      { tipo: 'nota', x: 26, y: 48, rot: -1, tam: 'g', texto: 'Lucas' },
      { tipo: 'polaroid', x: 88, y: 122, rot: 5, img: 'assets/img/foto-perfil.webp', fita: ['t'] },
      { tipo: 'nota', x: 26, y: 356, rot: 1, texto: 'designer, em Porto Alegre.' },
    ],
    verso: [
      { tipo: 'nota', x: 26, y: 30, rot: -2, tam: 'g', texto: 'Como tudo\ncomeçou' },
      { tipo: 'polaroid', x: 22, y: 132, rot: -5, img: 'assets/img/foto-2019.webp', fita: ['tl'] },
      { tipo: 'adesivo', x: 116, y: 118, rot: 8, texto: '2019', cor: '#FFD23F', forma: 'pill' },
      { tipo: 'polaroid', x: 146, y: 236, rot: 4, img: 'assets/img/foto-2022.webp', fita: ['tr'] },
      { tipo: 'adesivo', x: 112, y: 372, rot: -7, texto: '2022', cor: '#F45A2E', forma: 'pill' },
    ],
  },
  { // folha 2 — frente: o que faço hoje / verso: crachá freelancer
    recto: [
      { tipo: 'nota', x: 26, y: 30, rot: -1, tam: 'g', texto: 'O que faço\nhoje' },
      { tipo: 'polaroid', x: 92, y: 128, rot: -4, img: 'assets/img/foto-2026.webp', fita: ['t'] },
      { tipo: 'adesivo', x: 190, y: 118, rot: 10, texto: '2026', cor: '#2743E0', forma: 'pill' },
      { tipo: 'nota', x: 26, y: 340, rot: 1, texto: 'Designer e Instrutor de Vibe Design\nna Asimov Academy' },
    ],
    verso: [
      { tipo: 'cracha', x: 84, y: 44, rot: 4, nome: 'Lucas', cargo: 'designer', empresas: ['Nortear Imóveis', 'Clínica Amaral', 'Casa Toda Cozinha', 'Studio Vértice'] },
      { tipo: 'adesivo', x: 150, y: 262, rot: -12, texto: 'freelancer', cor: '#FF4FA7', forma: 'pill' },
      { tipo: 'nota', x: 30, y: 350, rot: -1, tam: 'p', texto: '[período]' },
    ],
  },
  { // folha 3 — frente: o que fiz / o que aprendi. verso: Asimov + projeto
    recto: [
      { tipo: 'nota', x: 28, y: 36, rot: -1, tam: 'g', texto: 'o que fiz' },
      { tipo: 'nota', x: 28, y: 92, rot: 0, texto: 'sites institucionais,\npáginas de vendas,\nanúncios,\nestratégias de marketing.' },
      { tipo: 'nota', x: 28, y: 232, rot: -1, tam: 'g', texto: 'o que aprendi' },
      { tipo: 'nota', x: 28, y: 288, rot: 1, texto: 'agilidade,\nnegociação,\norganização.' },
      { tipo: 'adesivo', x: 206, y: 330, rot: 14, texto: '!', cor: '#FF4FA7', forma: 'redondo' },
    ],
    verso: [
      { tipo: 'adesivo', x: 40, y: 40, rot: -6, texto: 'Asimov Academy', cor: '#2743E0', forma: 'pill' },
      { tipo: 'polaroid', x: 44, y: 130, rot: -3, wide: true, img: 'assets/img/thumb-projeto.webp', legenda: '[legenda do projeto]', fita: ['tr'] },
    ],
  },
  { // folha 4 — frente: de onde vim, pra onde fui. verso: por enquanto é isso
    recto: [
      { tipo: 'nota', x: 28, y: 44, rot: -1, texto: 'Comecei no marketing' },
      { tipo: 'rabisco', x: 124, y: 82, rot: 3, h: 210 },
      { tipo: 'nota', x: 28, y: 312, rot: 1, texto: 'Agora sou professor da\nFormação AI Designer' },
    ],
    verso: [
      { tipo: 'nota', x: 30, y: 40, rot: -1, tam: 'g', texto: 'por enquanto\né isso.' },
      { tipo: 'nota', x: 30, y: 150, rot: 0, texto: 'E se quiser saber mais...' },
      { tipo: 'nota', x: 150, y: 360, rot: -3, texto: 'olha o celular →' },
    ],
  },
];
