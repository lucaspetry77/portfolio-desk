/* Portrait relief: real subdivided geometry and local texture, not a scanned/rigged head.
   Art-directed depth and bounded rotation preserve likeness from a single source view. */
import * as THREE from '../assets/vendor/three.module.min.js';
export function createPortrait(canvas, image) {
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'});
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32,1,.1,20);
  camera.position.set(0,0,6.4);
  const texture = new THREE.Texture(image);
  texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;
  const geometry = new THREE.PlaneGeometry(3.3,3.3,112,112);
  const p=geometry.attributes.position,uv=geometry.attributes.uv;
  const bell=(x,y,cx,cy,rx,ry)=>Math.exp(-(((x-cx)/rx)**2+((y-cy)/ry)**2));
  for(let i=0;i<p.count;i++) {
    const u=uv.getX(i),v=uv.getY(i);
    const head=Math.max(0,1-((u-.5)/.215)**2-((v-.67)/.29)**2);
    const torso=Math.max(0,1-((u-.5)/.46)**2-((v-.18)/.28)**2);
    const depth=.52*Math.sqrt(head)+.20*Math.sqrt(torso)+.18*bell(u,v,.503,.631,.035,.061)+.055*bell(u,v,.5,.49,.11,.07);
    p.setZ(i,depth);
  }
  geometry.computeVertexNormals();
  const uniforms={map:{value:texture},gaze:{value:new THREE.Vector2()},turn:{value:new THREE.Vector2()},mouth:{value:0},blink:{value:0}};
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:true,side:THREE.DoubleSide,uniforms,
    vertexShader:`
      uniform vec2 turn; uniform float mouth;
      varying vec2 vUv; varying vec3 vPosition;
      void main(){
        vUv=uv; vec3 p=position;
        float head=smoothstep(.32,.49,uv.y);
        float jaw=exp(-pow((uv.x-.50)/.070,2.)-pow((uv.y-.55)/.037,2.));
        p.y-=mouth*.024*jaw;
        vec3 pivot=vec3(0.,.26,.12); vec3 q=p-pivot;
        float yaw=turn.x*head, pitch=turn.y*head;
        q=vec3(cos(yaw)*q.x+sin(yaw)*q.z,q.y,-sin(yaw)*q.x+cos(yaw)*q.z);
        q=vec3(q.x,cos(pitch)*q.y-sin(pitch)*q.z,sin(pitch)*q.y+cos(pitch)*q.z);
        p=q+pivot; vPosition=p;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
      }`,
    fragmentShader:`
      uniform sampler2D map; uniform vec2 gaze; uniform float mouth; uniform float blink;
      varying vec2 vUv; varying vec3 vPosition;
      float eye(vec2 uv,vec2 c){return 1.-smoothstep(.35,1.,length((uv-c)/vec2(.032,.013)));}
      void main(){
        vec2 uv=vUv;
        float eyes=max(eye(uv,vec2(.438,.706)),eye(uv,vec2(.57,.711)));
        uv-=gaze*vec2(.006,.003)*eyes;
        float lip=exp(-pow((uv.x-.50)/.064,2.)-pow((uv.y-.558)/.025,2.));
        uv.y=.558+(uv.y-.558)/(1.+mouth*.13*lip);
        vec4 tex=texture2D(map,uv);
        // Remove only the authored green-screen background in the renderer.
        float green=tex.g-max(tex.r,tex.b);
        float alpha=1.-smoothstep(.08,.38,green);
        if(alpha<.015)discard;
        tex.g=mix(tex.g,min(tex.g,max(tex.r,tex.b)*1.05),smoothstep(.015,.15,green));
        vec3 eyelid=texture2D(map,uv+vec2(0.,.018)).rgb;
        tex.rgb=mix(tex.rgb,eyelid,blink*eyes*.92);
        vec3 normal=normalize(cross(dFdx(vPosition),dFdy(vPosition)));
        float light=.94+.06*max(dot(normal,normalize(vec3(-.6,.8,1.))),0.);
        gl_FragColor=vec4(tex.rgb*light,alpha);
        #include <colorspace_fragment>
      }`
  });
  const mesh=new THREE.Mesh(geometry,material);scene.add(mesh);
  let expanded=false, speaking=false, thinking=false, visible=true, reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let tx=0,ty=0,x=0,y=0,vx=0,vy=0,raf=0,last=0,blinkAt=0,blinkTimer=0,speechAt=0,disposed=false;
  function resize(){const size=expanded?420:192;renderer.setPixelRatio(Math.min(devicePixelRatio||1,expanded?1.6:1.3));renderer.setSize(size,size,false);wake();}
  function wake(){if(!raf&&visible&&!document.hidden&&!disposed){last=performance.now();raf=requestAnimationFrame(frame);}}
  function frame(now){
    raf=0;if(!visible||document.hidden||disposed)return;
    const dt=Math.min((now-last)/1000,.032)||.016;last=now;
    // Damped spring, no accumulated delta on tab restore.
    const steps=Math.max(1,Math.ceil(dt/.008)),h=dt/steps;
    for(let i=0;i<steps;i++){vx+=(100*(tx-x)-20*vx)*h;vy+=(100*(ty-y)-20*vy)*h;x+=vx*h;y+=vy*h;}
    if(Math.abs(x-tx)+Math.abs(vx)<.0002){x=tx;vx=0;}if(Math.abs(y-ty)+Math.abs(vy)<.0002){y=ty;vy=0;}
    const talk=speaking&&!reduced ? (.28+.45*Math.abs(Math.sin((now-speechAt)*.013))+.2*Math.abs(Math.sin(now*.023))) : 0;
    const blinkProgress=blinkAt?(now-blinkAt)/160:2;
    uniforms.blink.value=!reduced&&blinkProgress<1?Math.sin(blinkProgress*Math.PI):0;
    uniforms.mouth.value=talk;
    uniforms.turn.value.set(reduced?0:x*.18,reduced?0:-y*.11+(speaking?Math.sin(now*.004)*.008:0));
    uniforms.gaze.value.set(reduced?0:x,reduced?0:y);
    mesh.rotation.z=reduced?0:(thinking?-.014:x*-.012);
    renderer.render(scene,camera);
    if(Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(vx)+Math.abs(vy)>.0001||(speaking&&!reduced)||blinkProgress<1)raf=requestAnimationFrame(frame);
  }
  function scheduleBlink(){clearTimeout(blinkTimer);if(expanded&&!reduced&&visible){blinkTimer=setTimeout(()=>{blinkAt=performance.now();wake();scheduleBlink();},5200);}}
  function onVisibility(){if(document.hidden){cancelAnimationFrame(raf);raf=0;clearTimeout(blinkTimer);}else{wake();scheduleBlink();}}
  document.addEventListener('visibilitychange',onVisibility);
  resize();
  return {
    setTarget(a,b){tx=Math.max(-1,Math.min(1,a));ty=Math.max(-1,Math.min(1,b));wake();},
    setExpanded(value){expanded=value;resize();scheduleBlink();},
    setSpeaking(value){speaking=value;speechAt=performance.now();wake();},
    setThinking(value){thinking=value;wake();},
    setVisible(value){visible=value;if(!value){cancelAnimationFrame(raf);raf=0;}else wake();scheduleBlink();},
    setReduced(value){reduced=value;if(value){x=y=tx=ty=vx=vy=0;}wake();scheduleBlink();},
    dispose(){disposed=true;clearTimeout(blinkTimer);cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',onVisibility);geometry.dispose();material.dispose();texture.dispose();renderer.dispose();},
    get idle(){return !raf;}
  };
}
