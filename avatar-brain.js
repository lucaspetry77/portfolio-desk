/* Intent-based demo. No model, API, storage or network requests. */
(() => {
  'use strict';
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const answers = {
    hello: { text: 'Oi! Que bom te ver por aqui. Sou a versão digital do Lucas. Quer conhecer meu trabalho, entender como uso IA ou conversar sobre uma ideia sua?', suggestions: ['O que você faz?', 'Quero criar um site', 'Como você usa IA?'] },
    work: { text: 'Meu trabalho conecta design, estratégia e tecnologia. Crio sites, identidades e experiências digitais, sempre com atenção à clareza, aos detalhes e ao que a pessoa sente ao usar. Também ensino Vibe Design na Asimov Academy.', suggestions: ['Me mostra os projetos', 'Como funciona seu processo?', 'Quero criar um site'] },
    projects: { text: 'Separei seis explorações no notebook: TORRA, FORME, Âmago, Visit New York, Trato e Tempus. Por enquanto são conceitos ilustrativos. Posso te levar até a galeria para você explorar cada um.', suggestions: ['Me conta sobre TORRA', 'Como funciona seu processo?'], action: { label: 'Explorar a galeria', chapter: 'projetos' } },
    story: { text: 'Comecei no marketing e fui encontrando no design a minha forma de conectar ideias e pessoas. Hoje sou designer e instrutor de Vibe Design na Asimov Academy, em Porto Alegre. O caderno na mesa conta um pouco desse caminho.', suggestions: ['Como você usa IA?', 'O que você ensina?'], action: { label: 'Abrir o caderno', chapter: 'historia' } },
    ai: { text: 'Vejo a IA como uma parceira para explorar possibilidades e tirar ideias do papel. Ela ajuda a prototipar e experimentar. As decisões de direção, clareza e acabamento continuam precisando de um olhar humano. Aqui, inclusive, a conversa é uma demo com respostas preparadas.', suggestions: ['O que é Vibe Design?', 'Como funciona seu processo?', 'Quero criar um site'] },
    teach: { text: 'Na Asimov Academy, ensino Vibe Design: transformar ideias em interfaces com a ajuda da IA, cuidando da intenção, da experiência e do acabamento. A ferramenta acelera a execução; aprender a avaliar o resultado faz a diferença.', suggestions: ['Como você usa IA?', 'Me conta sua história'] },
    process: { text: 'Eu começaria entendendo três coisas: para quem estamos criando, qual problema queremos resolver e o que precisa acontecer depois que alguém visita o site. A partir daí, organizamos conteúdo, direção visual, protótipo e refinamento. Qual é a ideia que você quer tirar do papel?', suggestions: ['Um portfólio', 'Um site para minha empresa', 'Uma landing page'] },
    website: { text: 'Vamos dar forma a isso. Você está pensando em um portfólio, um site para uma empresa ou uma página para apresentar um produto? Me conta também o que a pessoa deve fazer quando chegar nele.', suggestions: ['Um portfólio', 'Um site para minha empresa', 'Uma landing page'] },
    portfolio: { text: 'Para um portfólio, eu priorizaria uma apresentação clara, poucos projetos bem contados e um contato fácil de encontrar. A personalidade entra na forma de apresentar isso — esta mesa é um exemplo. Você já tem os projetos e os textos organizados?', suggestions: ['Já tenho o conteúdo', 'Ainda estou começando', 'Quero falar com o Lucas'] },
    company: { text: 'Para um site de empresa, eu começaria pela proposta de valor: o que vocês fazem, para quem e por que escolher vocês. Depois vêm os serviços, provas reais e um caminho simples para entrar em contato. Você já tem identidade visual e conteúdo?', suggestions: ['Já tenho o conteúdo', 'Ainda estou começando', 'Quero falar com o Lucas'] },
    landing: { text: 'Uma boa landing page tem um objetivo principal. Eu organizaria a promessa, os benefícios, as evidências reais e uma chamada para ação clara. Antes do visual, vale definir: a página precisa vender, captar contatos ou apresentar uma novidade?', suggestions: ['Quero captar contatos', 'Quero vender um produto', 'Quero falar com o Lucas'] },
    price: { text: 'Não tenho um valor ou prazo fechado para te passar. Isso depende do escopo, do conteúdo disponível e do nível de personalização. Posso te ajudar a organizar a ideia, mas a proposta e a disponibilidade precisam ser combinadas diretamente com o Lucas.', suggestions: ['Como funciona seu processo?', 'Quero falar com o Lucas'], action: { label: 'Conversar por e-mail', email: true } },
    contact: { text: 'Me chama em lucas@asimov.academy. Conta um pouco da ideia, do momento do projeto e do prazo que você tem em mente. Esta conversa é demonstrativa e não é enviada ao Lucas; o e-mail é o caminho para continuar de verdade.', suggestions: ['Como funciona seu processo?', 'Me mostra os projetos'], action: { label: 'Escrever para o Lucas', email: true } },
    thanks: { text: 'Eu que agradeço a visita! Fica à vontade para explorar a mesa. E, quando quiser transformar a ideia em conversa, o e-mail do Lucas está logo aqui.', suggestions: ['Me mostra os projetos', 'Quero falar com o Lucas'] },
    prepared: { text: 'Ótimo ponto de partida. Com o conteúdo em mãos, dá para organizar a estrutura e testar uma direção visual com mais clareza. Se quiser continuar, envie ao Lucas o objetivo, o material disponível e o prazo desejado.', suggestions: ['Quero falar com o Lucas', 'Me mostra os projetos'], action: { label: 'Continuar por e-mail', email: true } },
    starting: { text: 'Tudo bem começar pela ideia. O primeiro passo é definir o público, o objetivo e o que a pessoa precisa entender. A gente pode usar essas respostas para organizar um briefing simples antes de pensar no visual.', suggestions: ['Como funciona seu processo?', 'Quero falar com o Lucas'] },
    conversion: { text: 'Então o caminho principal precisa ficar muito claro: uma promessa específica, informações que ajudem a decidir e uma ação simples. Podemos partir desse objetivo para organizar o conteúdo e o fluxo da página.', suggestions: ['Como funciona seu processo?', 'Quero falar com o Lucas'] },
    demo: { text: 'Sou uma demonstração interativa do avatar do Lucas. Minhas respostas são preparadas, não uso um modelo de IA conectado e não sou o Lucas ao vivo. A voz é uma voz sintética do navegador. Posso conversar sobre trabalho, trajetória, design e IA.', suggestions: ['O que você faz?', 'Me conta sua história'] },
    fallback: { text: 'Esse assunto ainda não faz parte das respostas desta demo. Consigo te contar sobre o trabalho do Lucas, os projetos, a trajetória e o uso de IA no design. Para conversar sobre algo específico, você também pode escrever diretamente para ele.', suggestions: ['O que você faz?', 'Me mostra os projetos', 'Quero falar com o Lucas'] }
  };
  function respond(input, context = {}) {
    const q = normalize(String(input).slice(0,800));
    let intent = 'fallback';
    if (/\b(torra|forme|amago|visit new york|trato|tempus)\b/.test(q)) {
      const data = [
        ['torra','TORRA','Uma exploração de identidade, embalagem e site para café especial. A direção visual usa tons naturais e uma linguagem acolhedora.'],
        ['forme','FORME','Um conceito para um estúdio de mobiliário modular, explorando forma, matéria e uma experiência de produto em 3D.'],
        ['amago','Âmago','Um conceito para perfume de nicho, com foco em atmosfera, presença e uma navegação imersiva.'],
        ['visit new york','Visit New York','Uma exploração de landing page de viagem, usando a energia visual de Nova York como ponto de partida.'],
        ['trato','Trato','Um conceito de produto e site para produtividade, com uma direção visual que busca clareza e foco.'],
        ['tempus','Tempus','Uma exploração de branding e e-commerce para relojoaria, com atenção à precisão e aos materiais.']
      ].find(([key]) => new RegExp('\\b'+key+'\\b').test(q));
      return {intent:'project', text:`${data[1]} é um projeto ilustrativo. ${data[2]} Você pode ver o conceito na galeria.`, suggestions:['Me mostra os projetos','Quero falar com o Lucas'], action:{label:'Explorar a galeria',chapter:'projetos'}};
    }
    if (/preco|custo|custa|valor|orcamento|prazo|quanto tempo|disponib/.test(q)) intent='price';
    else if (/contato|email|e-mail|falar com|contratar|chamar|conversar com o lucas/.test(q)) intent='contact';
    else if (/quem e voce|voce e real|demo|modelo|chatgpt|robo|sua voz/.test(q)) intent='demo';
    else if (/comecando|nao tenho|ainda nao/.test(q)) intent='starting';
    else if (/ja tenho|organizado|pronto/.test(q)) intent='prepared';
    else if (/captar|vender|leads|vendas/.test(q)) intent='conversion';
    else if (/vibe design|ensina|curso|professor|formacao|asimov/.test(q)) intent='teach';
    else if (/\bia\b|inteligencia artificial/.test(q)) intent='ai';
    else if (/historia|trajetoria|comecou|sobre voce|quem e o lucas/.test(q)) intent='story';
    else if (/processo|briefing|como funciona/.test(q)) intent='process';
    else if (/mostra|projetos|galeria/.test(q)) intent='projects';
    else if (/portfolio/.test(q)) intent='portfolio';
    else if (/empresa|institucional/.test(q)) intent='company';
    else if (/landing|pagina de vendas|produto/.test(q)) intent='landing';
    else if (/site|criar|ideia/.test(q)) intent='website';
    else if (/trabalho|faz|servico|design/.test(q)) intent='work';
    else if (/obrigad|valeu|legal|gostei/.test(q)) intent='thanks';
    else if (/^(oi|ola|e ai|bom dia|boa tarde|boa noite|opa)[!. ]*$/.test(q)) intent='hello';
    else if (/^(sim|quero|pode|claro)[!. ]*$/.test(q)) intent=context.intent==='website'?'process':context.intent==='projects'?'projects':'contact';
    return {intent, ...answers[intent]};
  }
  window.PortfolioDemo = Object.freeze({respond});
})();
