(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const dialog=$('avatarDialog'),launch=$('avatarLaunch'),portrait=$('avatarPortrait'),home=$('avatarHome'),seat=$('avatarSeat');
  const input=$('avatarInput'),messages=$('avatarMessages'),suggestions=$('avatarSuggestions'),status=$('avatarStatus'),notice=$('avatarNotice');
  launch.hidden=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),synth=window.speechSynthesis;
  let renderer=null,phase='closed',flight=null,transition=0,overflow='',context={},pending=null,voice=false,utterance=null,recognition=null,micConsent=false,speechToken=0;
  let targetRect=launch.getBoundingClientRect();
  const welcome=()=>window.PortfolioDemo.respond('oi');
  const sayStatus=text=>{status.textContent=text;};
  function moveTo(parent,from,instant){
    flight?.cancel(); parent.append(portrait);
    const to=portrait.getBoundingClientRect();targetRect=to;
    if(instant)return Promise.resolve();
    flight=portrait.animate([{transform:`translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/to.width},${from.height/to.height})`},{transform:'translate(0,0) scale(1)'}],{duration:620,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
    const current=flight;
    return current.finished.catch(()=>{}).then(()=>{if(flight===current){current.cancel();flight=null;}});
  }
  async function open(instant=false){
    if(phase!=='closed')return;
    const token=++transition,from=portrait.getBoundingClientRect();phase='opening';
    overflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';
    dialog.showModal();fitVisualViewport();launch.style.visibility='hidden';
    dispatchEvent(new CustomEvent('avatarfocus',{detail:{open:true}}));
    renderer?.setExpanded(true);renderer?.setTarget(0,0);
    if(!messages.children.length)addAnswer(welcome(),false);
    $('avatarClose').focus({preventScroll:true});
    requestAnimationFrame(()=>{if(token===transition)dialog.classList.add('is-visible');});
    await moveTo(seat,from,instant||reduced.matches);
    if(token===transition)phase='open';
  }
  async function close(instant=false){
    if(phase==='closed'||phase==='closing')return;
    const token=++transition;phase='closing';stopSpeech();stopMic();finishPending(false);
    $('avatarMicConsent').hidden=true;dialog.classList.remove('is-visible');
    // Keep the portrait in the top layer until its trip back has finished.
    const from=portrait.getBoundingClientRect(),to=home.getBoundingClientRect();
    flight?.cancel();
    const base=portrait.getBoundingClientRect();
    const duration=instant||reduced.matches?0:500;
    flight=portrait.animate([{transform:`translate(${from.left-base.left}px,${from.top-base.top}px) scale(${from.width/base.width},${from.height/base.height})`},{transform:`translate(${to.left-base.left}px,${to.top-base.top}px) scale(${to.width/base.width},${to.height/base.height})`}],{duration,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
    await flight.finished.catch(()=>{});
    if(token!==transition)return;
    flight?.cancel();flight=null;home.append(portrait);dialog.close();phase='closed';
    document.documentElement.style.overflow=overflow;launch.style.visibility='';renderer?.setExpanded(false);renderer?.setTarget(0,0);targetRect=home.getBoundingClientRect();
    dispatchEvent(new CustomEvent('avatarfocus',{detail:{open:false}}));launch.focus({preventScroll:true});
  }
  launch.addEventListener('click',e=>open(e.detail===0));
  $('avatarClose').addEventListener('click',e=>close(e.detail===0));
  dialog.addEventListener('cancel',e=>{e.preventDefault();close(true);});
  function stopSpeech(){speechToken++;if(synth&&utterance)synth.cancel();utterance=null;renderer?.setSpeaking(false);document.querySelectorAll('.avatar-listen').forEach(b=>{b.textContent='Ouvir resposta';b.setAttribute('aria-pressed','false');});if(phase!=='closed')sayStatus('PODE FALAR. ESTOU POR AQUI.');}
  function speak(text,button){
    if(!synth||!window.SpeechSynthesisUtterance){notice.textContent='Este navegador não oferece leitura em voz. A conversa em texto continua disponível.';return;}
    if(button?.getAttribute('aria-pressed')==='true'){stopSpeech();return;}
    stopSpeech();const token=speechToken;
    utterance=new SpeechSynthesisUtterance(text);utterance.lang='pt-BR';utterance.rate=1;utterance.pitch=1;
    const voices=synth.getVoices().filter(v=>/^pt(-|_)/i.test(v.lang));
    utterance.voice=voices.find(v=>v.lang==='pt-BR'&&v.localService)||voices.find(v=>v.lang==='pt-BR')||voices[0]||null;
    utterance.onstart=()=>{if(token!==speechToken)return;renderer?.setSpeaking(true);sayStatus('TE CONTANDO UM POUCO MAIS…');if(button){button.textContent='Parar áudio';button.setAttribute('aria-pressed','true');}};
    utterance.onend=()=>{if(token===speechToken)stopSpeech();};
    utterance.onerror=e=>{if(token!==speechToken)return;stopSpeech();if(e.error!=='interrupted'&&e.error!=='canceled')notice.textContent='Não foi possível reproduzir a voz. Você pode ler a resposta acima.';};
    synth.speak(utterance);
  }
  function addMessage(text,role){
    const item=document.createElement('div');item.className=`avatar-message ${role}`;const p=document.createElement('p');p.textContent=text;item.append(p);messages.append(item);
    while(messages.children.length>40)messages.firstElementChild.remove();
    if(!reduced.matches)item.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'});
    messages.scrollTop=messages.scrollHeight;return item;
  }
  function addAnswer(answer,read=voice){
    context={intent:answer.intent};const item=addMessage(answer.text,'assistant');let listen;
    if(synth&&window.SpeechSynthesisUtterance){listen=document.createElement('button');listen.type='button';listen.className='avatar-listen';listen.textContent='Ouvir resposta';listen.setAttribute('aria-pressed','false');listen.addEventListener('click',()=>speak(answer.text,listen));item.append(listen);}
    if(answer.action){const action=answer.action;const link=document.createElement(action.email?'a':'button');link.textContent=action.label+' ↗';if(action.email)link.href='mailto:lucas@asimov.academy';else{link.type='button';link.addEventListener('click',async()=>{await close();if(document.documentElement.classList.contains('is-plain'))document.getElementById(action.chapter)?.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});else dispatchEvent(new CustomEvent('portfoliochapter',{detail:{chapter:action.chapter,instant:reduced.matches}}));});}item.append(link);}
    suggestions.replaceChildren();for(const text of answer.suggestions||[]){const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',()=>send(text));suggestions.append(b);}
    messages.scrollTop=messages.scrollHeight;if(read&&dialog.open&&phase!=='closing')speak(answer.text,listen);
  }
  function finishPending(read){if(!pending)return;clearTimeout(pending.timer);const answer=pending.answer;pending.node.remove();pending=null;renderer?.setThinking(false);$('avatarSend').disabled=false;addAnswer(answer,read);sayStatus('PODE FALAR. ESTOU POR AQUI.');}
  function send(text){
    text=String(text).trim().slice(0,800);if(!text||pending||phase==='closing'||phase==='closed')return;
    stopSpeech();stopMic();notice.textContent='';addMessage(text,'user');input.value='';input.style.height='';suggestions.replaceChildren();$('avatarSend').disabled=true;
    const node=addMessage('Um instante…','thinking');node.setAttribute('aria-label','Preparando resposta');renderer?.setThinking(true);sayStatus('PENSANDO NA SUA IDEIA…');
    pending={node,answer:window.PortfolioDemo.respond(text,context),timer:setTimeout(()=>finishPending(voice),550)};
  }
  $('avatarForm').addEventListener('submit',e=>{e.preventDefault();send(input.value);});
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send(input.value);}});
  input.addEventListener('input',()=>{input.style.height='auto';input.style.height=Math.min(input.scrollHeight,85)+'px';});
  $('avatarVoice').addEventListener('click',()=>{voice=!voice;$('avatarVoice').setAttribute('aria-pressed',String(voice));$('avatarVoice').textContent=voice?'Voz ligada':'Voz desligada';if(!voice)stopSpeech();});
  if(!synth||!window.SpeechSynthesisUtterance){$('avatarVoice').disabled=true;$('avatarVoice').textContent='Voz indisponível';}
  $('avatarReset').addEventListener('click',()=>{stopSpeech();stopMic();if(pending){clearTimeout(pending.timer);pending=null;}renderer?.setThinking(false);context={};messages.replaceChildren();input.value='';notice.textContent='';$('avatarSend').disabled=false;addAnswer(welcome(),false);});
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  function stopMic(){if(recognition){const r=recognition;recognition=null;r.abort();sayStatus('PODE FALAR. ESTOU POR AQUI.');if(notice.textContent.startsWith('Ouvindo'))notice.textContent='';}$('avatarMic').setAttribute('aria-pressed','false');}
  function startMic(){
    if(!Recognition){notice.textContent='A transcrição não está disponível neste navegador. Você pode digitar sua pergunta.';return;}
    stopSpeech();stopMic();const r=new Recognition();recognition=r;r.lang='pt-BR';r.interimResults=false;r.continuous=false;
    r.onstart=()=>{if(recognition!==r)return;$('avatarMic').setAttribute('aria-pressed','true');notice.textContent='Ouvindo… fale sua pergunta. Clique no microfone para parar.';sayStatus('ESTOU OUVINDO…');};
    r.onresult=e=>{if(recognition!==r)return;input.value=(input.value+' '+Array.from(e.results).map(result=>result[0].transcript).join(' ')).trim().slice(0,800);input.dispatchEvent(new Event('input'));notice.textContent='Revise a transcrição e envie quando estiver pronto.';input.focus();};
    r.onerror=e=>{if(recognition!==r)return;notice.textContent=e.error==='not-allowed'?'O acesso ao microfone não foi autorizado. Você pode continuar digitando.':e.error==='no-speech'?'Não ouvi uma fala. Tente novamente ou digite sua mensagem.':'Não foi possível transcrever. Tente novamente ou use o texto.';};
    r.onend=()=>{if(recognition!==r)return;recognition=null;$('avatarMic').setAttribute('aria-pressed','false');sayStatus('PODE FALAR. ESTOU POR AQUI.');};
    try{r.start();}catch{recognition=null;notice.textContent='Não foi possível iniciar o microfone. Continue em texto.';}
  }
  $('avatarMic').addEventListener('click',()=>{if(recognition){stopMic();notice.textContent='Escuta encerrada.';return;}if(!Recognition){startMic();return;}if(!micConsent){$('avatarMicConsent').hidden=false;return;}startMic();});
  $('avatarMicConfirm').addEventListener('click',()=>{micConsent=true;$('avatarMicConsent').hidden=true;startMic();});
  $('avatarMicCancel').addEventListener('click',()=>{$('avatarMicConsent').hidden=true;$('avatarMic').focus();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopSpeech();stopMic();}});
  function fitVisualViewport(){const v=window.visualViewport;if(!v||!dialog.open||v.scale>1.05)return;dialog.style.height=v.height+'px';dialog.style.top=v.offsetTop+'px';dialog.classList.toggle('avatar-keyboard',v.height<540);targetRect=seat.getBoundingClientRect();}
  window.visualViewport?.addEventListener('resize',fitVisualViewport);
  addEventListener('resize',()=>{fitVisualViewport();targetRect=(dialog.open?seat:home).getBoundingClientRect();});
  addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reduced.matches||phase==='opening'||phase==='closing')return;renderer?.setTarget((e.clientX-targetRect.left-targetRect.width/2)/(innerWidth*.45),-(e.clientY-targetRect.top-targetRect.height*.38)/(innerHeight*.5));},{passive:true});
  document.addEventListener('pointerleave',()=>renderer?.setTarget(0,0));
  reduced.addEventListener('change',e=>renderer?.setReduced(e.matches));
  async function loadPortrait(){
    const img=new Image();img.src='assets/avatar/lucas-avatar.webp';
    try{await img.decode();const ctx=$('avatarFallback').getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,512,512);const pixels=ctx.getImageData(0,0,512,512),d=pixels.data;for(let i=0;i<d.length;i+=4){const green=d[i+1]-Math.max(d[i],d[i+2]);d[i+3]=Math.round(255*(1-Math.max(0,Math.min(1,(green-20)/77))));if(green>5)d[i+1]=Math.min(d[i+1],Math.max(d[i],d[i+2])*1.05);}ctx.putImageData(pixels,0,0);
      const {createPortrait}=await import('./avatar-portrait.js');renderer=createPortrait($('avatarCanvas'),img);renderer.setExpanded(dialog.open);portrait.classList.add('ready');
      $('avatarCanvas').addEventListener('webglcontextlost',e=>{e.preventDefault();portrait.classList.remove('ready');renderer?.setVisible(false);});
      $('avatarCanvas').addEventListener('webglcontextrestored',()=>{renderer?.setVisible(true);portrait.classList.add('ready');});
    }catch(error){console.warn('Avatar: usando retrato estático.',error);}
  }
  if('requestIdleCallback'in window)requestIdleCallback(loadPortrait,{timeout:1200});else setTimeout(loadPortrait,250);
  window.__avatar={get phase(){return phase;},get rendererIdle(){return renderer?.idle??true;},get ready(){return !!renderer;}};
})();
