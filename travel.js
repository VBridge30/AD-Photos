/* Travel scenes: a minimalist traveller (backpack, trolley bag) links one chapter to the next.
   Each scene is scroll-driven. Scroll to make him walk, or to make the plane / train go step by step.
   Photographs from the next chapter appear as he passes, then the chapter itself follows.
   To change which scene sits before which chapter, edit PLAN. Kinds: walkR, walkL, flight, train. */
(function(){
'use strict';
if(typeof GALLERY==='undefined'||typeof CHAPTERS==='undefined')return;
const main=document.getElementById('gallery');
if(!main)return;
const reduce=matchMedia('(prefers-reduced-motion:reduce)');

const PLAN={monochrome:'walkR',light:'flight',unforced:'walkL',macro:'walkR',story:'walkL',street:'train',architecture:'walkR',abstract:'train',landscape:'flight'};
const TEXT={
  monochrome:'He packs light. Colour stays in the bag.',
  light:'Window seat. Morning light below.',
  unforced:'No itinerary, no grid, no centre.',
  macro:'He kneels, and the small worlds open.',
  story:'Every bag carries a story.',
  street:'The train stops, and the street begins.',
  architecture:'Past the old gates, to stone and glass.',
  abstract:'The map dissolves into line and colour.',
  landscape:'Cloud, then ground, then the long light.'
};
const pad=n=>String(n).padStart(2,'0');
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=(a,b,x)=>{x=clamp((x-a)/(b-a));return x*x*(3-2*x)};
/* holds on a step, then drops to the next one */
const stepU=t=>{const f=Math.floor(t);return f+smooth(.4,1,t-f)};

/* ---------- drawing ---------- */
const tube=(d,w,c)=>`<path class="${c||'ink'}" d="${d}" stroke-width="${w}"/><path class="bgs" d="${d}" stroke-width="${w-4.4}"/>`;
const leg=c=>`${tube('M60 108V148',10,c)}<g class="kn">${tube('M60 148V186',9,c)}<path class="${c}" d="M60 187.5H73" stroke-width="6"/></g>`;
const HEAD=(x,y)=>`<g transform="translate(${x} ${y})">
<path class="ink" d="M56.5 42V50M65 43V50"/>
<ellipse class="ink fillbg" cx="61" cy="29" rx="11.5" ry="14"/>
<path class="ink" d="M50 25C50 14 58 10.5 66 12.5C71 14 73 18 72.5 22"/>
<path class="ink" d="M52 20C58 13 66 13 71 18" stroke-width="1.5"/>
<path class="ink" d="M50.2 28C48.8 33 50 37 52.5 39"/>
<path class="ink" d="M51.5 29.5C48.5 29 48 34 51 35.5" stroke-width="1.6"/>
<circle class="ink" cx="67" cy="28.5" r="4.4" stroke-width="1.6"/>
<path class="ink" d="M62.6 28L51.5 29" stroke-width="1.4"/>
<circle class="fink" cx="67.4" cy="28.5" r="1.2"/>
<path class="ink" d="M63.5 22.5Q67 20.5 71 22" stroke-width="1.6"/>
<path class="ink" d="M72.2 28.5Q75.8 32.5 72.6 34.5" stroke-width="1.6"/>
<path class="ink" d="M65.5 38Q69.5 41.5 73.5 37.5" stroke-width="1.7"/>
<path class="ink" d="M52.5 35C54 44.5 62 45.5 70 42.5" stroke-width="3" stroke-dasharray=".1 3.4"/>
</g>`;
const TORSO=(x,y)=>`<g transform="translate(${x} ${y})"><path class="ink fillbg" d="M49 56Q50 47 60 46Q70 47 72 56L73 82L71 112H49L50 82Z"/><path class="ink" d="M55 48L60.5 60L66 48"/><path class="ink" d="M60.5 60V111"/></g>`;

const WALKER=`<svg class="man" viewBox="-48 0 190 196" focusable="false"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2">
<g class="trol"><path class="ink" d="M47 100L14 106"/>
<g transform="rotate(10 14 178)"><rect class="ink fillbg" x="-30" y="104" width="44" height="74" rx="7"/><path class="ink" d="M-21 116V166M-8 116V166M5 116V166"/><rect class="ink" x="-28" y="108" width="7" height="10" rx="1.5"/></g>
<g class="wh"><circle class="ink fillbg" cx="9" cy="184" r="6"/><path class="ink sp" d="M9 178.5V189.5M3.5 184H14.5"/></g></g>
<g class="bob">
<g class="lgF">${leg('mute')}</g>
<g class="lgN">${leg('ink')}</g>
<g class="arF">${tube('M60 56V80',6.5,'mute')}<g class="fa">${tube('M60 80V102',6,'mute')}</g></g>
<g class="pack"><rect class="ink fillbg" x="29" y="45" width="26" height="58" rx="11"/><path class="ink" d="M29 63Q42 70 55 63"/><rect class="ink" x="32" y="76" width="20" height="21" rx="6"/><path class="ink" d="M37 68v5M47 68v5M35 49Q42 41 49 49"/></g>
${TORSO(0,0)}
<path class="ink" d="M57 48C60 66 58 86 51 97" stroke-width="3.2"/>
${HEAD(0,0)}
<g transform="rotate(12 60 56)">${tube('M60 56V80',6.5)}<g transform="rotate(10 60 80)">${tube('M60 80V102',6)}<circle class="ink fillbg" cx="60" cy="103.5" r="3.4"/></g></g>
</g></g></svg>`;

const SEAT=`<svg class="seatman" viewBox="0 0 240 300" focusable="false"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2">
<path class="ink fillbg" d="M70 300V122Q70 62 118 62Q158 62 158 102V300Z"/>
<path class="ink" d="M92 62Q92 40 118 40"/>
${tube('M126 204H224',11)}${tube('M224 204V300',10)}
${TORSO(100,70)}
${HEAD(100,70)}
${tube('M161 134L158 176L188 190',6.5)}
<circle class="ink fillbg" cx="190" cy="191" r="3.6"/>
<path class="ink fillbg" d="M150 206H222Q230 206 230 213V222H150Z"/>
</g></svg>`;

const CLOUD='M0 22C-12 22-14 6-3 3C0-9 20-11 25-1C34-6 46 2 42 12C52 13 52 22 42 22Z';
const FLIGHT=`<g class="clouds" fill="none" stroke-linejoin="round" stroke-width="1.6">${[0,1,2,3].map(()=>`<path class="ink fillbg" d="${CLOUD}"/>`).join('')}</g>
<g class="gr" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8">
<path class="ink fillbg" d="M-20 146Q60 132 130 142T260 138T420 144V560H-20Z"/>
<path class="mute" d="M-20 176Q100 164 200 174T420 170M-20 208Q100 194 200 206T420 202M-20 250Q100 232 200 246T420 240" stroke-width="1.2"/>
<path class="ink fillbg" d="M191 143L209 143L252 340L148 340Z"/>
<path class="mute" d="M200 152V338" stroke-dasharray="7 11"/><path class="mute" d="M166 300H234M158 330H242" stroke-width="1.4"/>
<path class="ink" d="M70 168a4 4 0 1 0 .1 0M96 190a5 5 0 1 0 .1 0M318 176a4 4 0 1 0 .1 0M336 200a5 5 0 1 0 .1 0"/>
<path class="ink" d="M286 168h16v-9l8-7 8 7v9z"/>
</g>
<g fill="none" stroke-linejoin="round" stroke-width="2"><path class="ink fillbg" d="M-20 330V262L215 236Q238 233 232 243L110 330Z"/>
<g class="flap"><path class="ink fillbg" d="M112 326L228 246L232 256L146 326Z"/></g></g>`;

const TRAIN_S=5;
function trainLayers(){
  const S=TRAIN_S,W=400*(S+3);
  const hill=(base,a,b,x0)=>{let d='M0 '+(base+a*Math.sin(0)+b);for(let x=0;x<=W;x+=14)d+=`L${x} ${(base+a*Math.sin((x+x0)/70)+b*Math.sin((x+x0)/27)).toFixed(1)}`;return d+`V300H0Z`};
  let poles='',wire='M0 150',signs='',fence='';
  for(let x=0;x<=W;x+=100){poles+=`M${x} 140V246M${x-13} 152H${x+13}`;if(x)wire+=`Q${x-50} 172 ${x} 150`}
  for(let k=1;k<=S;k++){const x=400*k+200;signs+=`<path class="ink" d="M${x} 246V196"/><rect class="ink fillbg" x="${x-40}" y="168" width="80" height="30" rx="3"/><text class="sg" x="${x}" y="188" text-anchor="middle">Stop ${k}</text>`}
  for(let x=0;x<=400+S*640+40;x+=40)fence+=`M${x} 262V236`;
  return `<circle class="ink" cx="312" cy="62" r="20" fill="none" stroke-width="1.6"/>
<g class="tf" fill="none" stroke-linejoin="round" stroke-width="1.6"><path class="mute fillbg" d="${hill(186,16,9,0)}"/></g>
<g class="tm" fill="none" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.8"><path class="ink fillbg" d="${hill(222,6,4,300)}" stroke-width="1.4"/><path class="ink" d="${poles}"/><path class="mute" d="${wire}" stroke-width="1.2"/>${signs}</g>
<g class="tn" fill="none" stroke-linecap="round" stroke-width="2"><path class="ink" d="M0 262H${400+S*640+40}M0 244H${400+S*640+40}"/><path class="ink" d="${fence}"/></g>`;
}

/* ---------- build ---------- */
const scenes=[];
const ROT=[-2.2,1.6,-1.2,2.4,-1.8];
CHAPTERS.forEach((c,i)=>{
  const kind=PLAN[c.k],host=document.getElementById(c.k);
  if(!kind||!host||!GALLERY[c.k])return;
  const list=GALLERY[c.k].slice(0,5);
  const el=document.createElement('div');
  el.className='scene sc-'+kind;el.setAttribute('aria-hidden','true');el.dataset.cat=c.k;
  const figs=list.map((p,j)=>`<figure class="ph" style="--r:${ROT[j]}deg"><div class="pi"><img src="thumbs/${p.id}.jpg" alt="" width="${p.w}" height="${p.h}" loading="lazy" decoding="async" draggable="false"></div></figure>`).join('');
  const cap=`<div class="sc-cap"><span class="eyebrow">Next stop · ${pad(i+1)}</span><h3>${c.t}</h3><p>${TEXT[c.k]||''}</p></div>`;
  if(kind==='walkR'||kind==='walkL'){
    el.innerHTML=`<div class="sc-stage walk ${kind==='walkL'?'dl':'dr'}"><div class="string"></div>${figs}<div class="gline"></div><div class="trail"></div><div class="mwrap">${WALKER}</div>${cap}</div>`;
  }else{
    const view=kind==='flight'?FLIGHT:trainLayers();
    el.innerHTML=`<div class="sc-stage winst"><div class="sc-main">${SEAT}<div class="win"><svg class="view" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" focusable="false">${view}</svg><span class="alt"></span></div></div><div class="row">${figs}</div>${cap}</div>`;
  }
  main.insertBefore(el,host);
  scenes.push(kind==='flight'||kind==='train'?winScene(el,kind):walkScene(el,kind==='walkL'?-1:1));
});

/* ---------- walking scene ---------- */
function walkScene(el,dir){
  const stage=el.querySelector('.sc-stage'),mw=el.querySelector('.mwrap'),svg=mw.querySelector('svg');
  const trail=el.querySelector('.trail'),figs=[...el.querySelectorAll('.ph')];
  const q=s=>svg.querySelector(s);
  const r={lgN:q('.lgN'),knN:q('.lgN .kn'),lgF:q('.lgF'),knF:q('.lgF .kn'),arF:q('.arF'),faF:q('.arF .fa'),bob:q('.bob'),sp:q('.sp')};
  if(dir<0)svg.style.transform='scaleX(-1)';
  let L=0,H=0,n=5,pw=100,wm=300,s=1.5,D=[];
  function layout(){
    L=stage.clientWidth;H=stage.clientHeight;
    n=L<560?3:L<900?4:5;
    const mh=Math.min(H*.42,L*.52,400);wm=mh*190/196;s=wm/190;
    mw.style.width=wm+'px';mw.style.height=mh+'px';stage.style.setProperty('--mh',mh+'px');
    pw=Math.min(L/(n+1.2),H*.256);
    const dmin=Math.max(pw*.62,L*.1),dmax=L-wm*.43;
    D=[];
    figs.forEach((f,i)=>{
      f.classList.toggle('x',i>=n);
      if(i>=n)return;
      const d=dmin+(dmax-dmin)*(n>1?i/(n-1):0);D[i]=d;
      f.style.width=pw+'px';f.style.height=pw*1.25+'px';
      f.style.left=((dir>0?d:L-d)-pw/2)+'px';
    });
  }
  function update(p){
    if(!L)layout();
    const e=reduce.matches?1:clamp(p/.85);
    const x0=-wm*.75,x1=L-wm,x=x0+(x1-x0)*e,dist=x-x0;
    mw.style.transform=`translate3d(${dir>0?x:L-x-wm}px,0,0)`;
    const ph=Math.PI*2*dist/(96*s),A=18,sn=Math.sin(ph),cs=Math.cos(ph),ex=v=>v.toFixed(1);
    r.lgN.setAttribute('transform',`rotate(${ex(-A*sn)} 60 108)`);
    r.knN.setAttribute('transform',`rotate(${ex(4+36*Math.max(0,cs))} 60 148)`);
    r.lgF.setAttribute('transform',`rotate(${ex(A*sn)} 60 108)`);
    r.knF.setAttribute('transform',`rotate(${ex(4+36*Math.max(0,-cs))} 60 148)`);
    r.arF.setAttribute('transform',`rotate(${ex(-22*sn)} 60 56)`);
    r.faF.setAttribute('transform',`rotate(${ex(-(10+14*Math.max(0,sn)))} 60 80)`);
    r.bob.setAttribute('transform',`translate(0 ${(78*(1-Math.cos(A*sn*Math.PI/180))).toFixed(2)})`);
    r.sp.setAttribute('transform',`rotate(${ex(dist/s/6*57.3)} 9 184)`);
    trail.style.width=clamp(x+wm*.3,0,L)+'px';
    const hp=x+wm*.57;
    figs.forEach((f,i)=>f.classList.toggle('on',i<n&&hp>=D[i]));
  }
  return{el,stage,layout,update};
}

/* ---------- window scene: flight or train, step by step ---------- */
function winScene(el,kind){
  const stage=el.querySelector('.sc-stage'),figs=[...el.querySelectorAll('.ph')],alt=el.querySelector('.alt'),view=el.querySelector('.view');
  const flight=kind==='flight';
  const cl=flight?[...view.querySelectorAll('.clouds path')]:[],gr=view.querySelector('.gr'),flap=view.querySelector('.flap');
  const tf=view.querySelector('.tf'),tm=view.querySelector('.tm'),tn=view.querySelector('.tn');
  const CX=[30,240,130,312],CY=[250,190,300,140],CS=[-330,-300,-390,-250],CK=[1.4,1,1.8,.9];
  let n=5;
  function layout(){
    const L=stage.clientWidth;n=L<560?3:L<900?4:5;
    figs.forEach((f,i)=>f.classList.toggle('x',i>=n));
  }
  function update(p){
    if(!stage.clientWidth)return;
    const t=reduce.matches?n:clamp(p/.88)*n,u=stepU(t),qq=u/n;
    if(flight){
      cl.forEach((c,i)=>c.setAttribute('transform',`translate(${(CX[i]+qq*24).toFixed(1)} ${(CY[i]+qq*CS[i]).toFixed(1)}) scale(${CK[i]})`));
      gr.setAttribute('transform',`translate(0 ${((1-qq)*205).toFixed(1)})`);
      flap.setAttribute('transform',`rotate(${(qq*26).toFixed(1)} 232 250)`);
      const ft=Math.round(30000*(1-qq)/100)*100;
      alt.textContent=ft?`Altitude ${ft.toLocaleString('en-US')} ft`:'Landed';
    }else{
      tf.setAttribute('transform',`translate(${(-u*100).toFixed(1)} 0)`);
      tm.setAttribute('transform',`translate(${(-u*400).toFixed(1)} 0)`);
      tn.setAttribute('transform',`translate(${(-u*640).toFixed(1)} 0)`);
      alt.textContent=u>=n-.001?'Arrived':(Math.abs(u-Math.round(u))<.02&&u>.5?`Stop ${Math.round(u)} of ${n}`:'Moving');
    }
    figs.forEach((f,i)=>f.classList.toggle('on',i<n&&t>=i+.7));
  }
  return{el,stage,layout,update};
}

/* ---------- scroll driver ---------- */
const navh=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navh'))||58;
function progress(sc){
  const r=sc.el.getBoundingClientRect(),vh=innerHeight,nh=navh(),total=r.height-sc.stage.offsetHeight;
  return clamp((vh*.55-r.top)/(vh*.55-nh+Math.max(1,total)));
}
let queued=false;
function tick(){
  queued=false;
  scenes.forEach(sc=>{if(sc.vis&&sc.el.offsetParent!==null)sc.update(progress(sc))});
}
const ask=()=>{if(!queued){queued=true;requestAnimationFrame(tick)}};
const io=new IntersectionObserver(es=>{es.forEach(e=>{const sc=scenes.find(x=>x.el===e.target);if(sc)sc.vis=e.isIntersecting});ask()},{rootMargin:'120px 0px'});
scenes.forEach(sc=>io.observe(sc.el));
function relayout(){scenes.forEach(sc=>{if(sc.el.offsetParent!==null)sc.layout()});ask()}
addEventListener('scroll',ask,{passive:true});
addEventListener('resize',relayout);
addEventListener('load',relayout);
reduce.addEventListener&&reduce.addEventListener('change',ask);
relayout();
})();
