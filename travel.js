/* Travel scenes: a kind Indian uncle (painted, Ghibli-style) links one chapter to the next.
   Every scene is scroll-driven: scroll to make him walk, or to make the plane / train move.
   Photographs of the next chapter appear along the way, then the chapter itself follows.
   Edit PLAN to change which scene sits before which chapter.
   Kinds: walkR, walkL, camR (walks right and clicks photos with a Fujifilm camera), flight, train. */
(function(){
'use strict';
if(typeof GALLERY==='undefined'||typeof CHAPTERS==='undefined')return;
const main=document.getElementById('gallery');
if(!main)return;
const reduce=matchMedia('(prefers-reduced-motion:reduce)');

const PLAN={monochrome:'walkR',light:'flight',unforced:'walkL',macro:'camR',story:'walkL',street:'train',architecture:'walkR',abstract:'train',landscape:'flight'};
const MOOD={monochrome:'dawn',light:'gold',unforced:'day',macro:'mint',story:'dusk',street:'day',architecture:'gold',abstract:'dawn',landscape:'gold'};
const TEXT={
  monochrome:'He packs light. Colour stays in the bag.',
  light:'Window seat, wings level, morning light below.',
  unforced:'No itinerary, no grid, no centre.',
  macro:'Camera up. He stops for every small world.',
  story:'Every bag carries a story.',
  street:'The train stops, and the street begins.',
  architecture:'Past the old gates, to stone and glass.',
  abstract:'The map dissolves into line and colour.',
  landscape:'Cloud, then ground, then the long light.'
};
/* sky top, sky middle, horizon, far hills, middle hills, near hills, ground top, ground bottom, cloud, sun */
const PAL={
  dawn:{sky:['#26345f','#b4707f','#f6b98b'],far:'#7b6a93',mid:'#5a5380',near:'#3a3a62',gr:['#566b4c','#33473a'],cl:'#ffe3d0',sun:'#ffd9a0'},
  day:{sky:['#3f7cc0','#88bfe6','#f4ead0'],far:'#8db0c4',mid:'#5f9096',near:'#3e6e68',gr:['#5d8a4f','#35603f'],cl:'#ffffff',sun:'#fff3c4'},
  gold:{sky:['#34396b','#d9805c','#f9cd7f'],far:'#8a617a',mid:'#68466a',near:'#463354',gr:['#5a6a45','#38472f'],cl:'#ffd8b0',sun:'#ffe2a0'},
  dusk:{sky:['#1d2a4b','#3f6a8a','#eab98c'],far:'#4e6b87',mid:'#385570',near:'#26405a',gr:['#3f5b4b','#27402f'],cl:'#cfe0ee',sun:'#ffd9b0'},
  mint:{sky:['#2c6e8a','#8ed0c9','#f2f0c8'],far:'#6fa7a6',mid:'#4a8586',near:'#33696a',gr:['#5f8a58','#3a6446'],cl:'#ffffff',sun:'#fff6c8'}
};
const pad=n=>String(n).padStart(2,'0');
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=(a,b,x)=>{x=clamp((x-a)/(b-a));return x*x*(3-2*x)};
const lerp=(a,b,t)=>a+(b-a)*t;
const stepU=t=>{const f=Math.floor(t);return f+smooth(.4,1,t-f)};
const rng=seed=>{let a=seed;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const f1=v=>v.toFixed(1);

/* ---------- the uncle: simple 2D line sketch ---------- */
const K={ink:'#2a2730',inkL:'#5b5762',skin:'#f3d3b5',shirt:'#fffdf6',paper:'#fffdf6',grey:'#e4e4e8',pack:'#e3eeee',tr:'#f6dcd3',W:2.4};
const leg=(cls)=>`<g class="${cls}"><g class="kn"><path d="M90 196H106L105 237H92Z" fill="${K.paper}" stroke="${K.ink}" stroke-width="${K.W}"/><path d="M91 238H105C112 239 119 243 123 247H89C88 244 90 241 91 238Z" fill="${K.paper}" stroke="${K.ink}" stroke-width="${K.W}"/></g><path d="M88 148H108L107 199H89Z" fill="${K.paper}" stroke="${K.ink}" stroke-width="${K.W}"/></g>`;
const HAND=`<circle cx="98" cy="158" r="5.5" fill="${K.paper}" stroke="${K.ink}" stroke-width="${K.W}"/>`;
const arm=(cls)=>`<g class="${cls}"><g class="up"><path d="M98 86V121" stroke="${K.ink}" stroke-width="12.4"/><path d="M98 86V121" stroke="${K.paper}" stroke-width="8"/><g class="fo"><path d="M98 120V153" stroke="${K.ink}" stroke-width="11.4"/><path d="M98 120V153" stroke="${K.paper}" stroke-width="7"/>${HAND}</g></g></g>`;
const HEADSVG=`<g class="head"><g transform="translate(100 68) scale(1.12) translate(-100 -68)">
<path d="M92 71C80 66 73 54 74 40C75 20 88 9 104 9C120 9 130 20 130 34L131 42C131 46 133 49 136 53C137 55 135 57 132 57L131 61C132.5 63 131.5 65 130 67C130 71 127 74 122 75C112 76 100 75 92 71Z" fill="${K.skin}" stroke="${K.ink}" stroke-width="${K.W}"/>
<path d="M74 42C71 20 88 6 106 7C122 8 130 18 130 32C122 24 112 22 102 24C94 26 90 32 89 42C84 46 78 46 74 42Z" fill="${K.grey}" stroke="${K.ink}" stroke-width="${K.W}"/>
<ellipse cx="92" cy="48" rx="4" ry="6.5" fill="${K.skin}" stroke="${K.ink}" stroke-width="2"/>
<circle cx="120" cy="42" r="7.6" stroke="${K.ink}" stroke-width="1.7"/><path d="M112.4 41L94 44" stroke="${K.ink}" stroke-width="1.7"/>
<circle cx="122.4" cy="42.4" r="1.9" fill="${K.ink}" stroke="none"/>
<path d="M130 62Q125 67 120 63.6" stroke="${K.ink}" stroke-width="2"/>
</g></g>`;
const CAMSVG=`<g class="cam">
<rect x="-18" y="-10" width="36" height="21" rx="3.5" fill="#222226" stroke="#0b0b0d" stroke-width="1.4"/>
<path d="M-18 -7V-12Q-18 -14 -16 -14H16Q18 -14 18 -12V-5H-18Z" fill="#d8d8d2" stroke="#8d8d88" stroke-width="1.2"/>
<path d="M-16 -12.5H16" stroke="#fff" stroke-width="1" opacity=".7"/>
<rect x="-16" y="-18" width="10" height="5" rx="1.3" fill="#2d2d32" stroke="#0b0b0d" stroke-width="1"/>
<rect x="3" y="-18" width="7" height="4" rx="1" fill="#bcbcb5" stroke="#85857f" stroke-width=".8"/>
<rect x="-9" y="-17" width="6" height="3.5" rx="1" fill="#bcbcb5" stroke="#85857f" stroke-width=".8"/>
<rect x="-14" y="2" width="9" height="7" rx="1.5" fill="#34343a"/>
<rect x="18" y="-8" width="11" height="16" rx="2" fill="#2c2c31" stroke="#0b0b0d" stroke-width="1.3"/>
<rect x="27" y="-9.5" width="4.5" height="19" rx="1.6" fill="#cfcfca" stroke="#85857f" stroke-width="1"/>
<circle cx="-12" cy="-4" r="1.4" fill="#e8553b"/>
<g class="fl" opacity="0"><path d="M34 0L44 -3L38 0L44 3Z M34 0L40 -10L36 -1Z M34 0L40 10L36 1Z" fill="#fff6c8"/><circle cx="35" cy="0" r="5" fill="#fff"/></g>
</g>`;

function uncle(withCam){
  const W=K.W,ink=K.ink;
  const pk=`<g class="pack"><rect x="48" y="70" width="38" height="74" rx="14" fill="${K.pack}" stroke="${ink}" stroke-width="${W}"/><rect x="54" y="108" width="26" height="26" rx="8" fill="none" stroke="${ink}" stroke-width="1.8"/></g>`;
  const tro=`<g class="trol"><path d="M41 168L84 153" stroke="${ink}" stroke-width="2.4"/>
<g transform="rotate(9 30 240)"><rect x="-16" y="168" width="46" height="72" rx="9" fill="${K.tr}" stroke="${ink}" stroke-width="${W}"/><path d="M-4 178V230M14 178V230" stroke="${ink}" stroke-width="1.8"/></g>
<g class="wh"><circle cx="24" cy="242" r="6" fill="${K.paper}" stroke="${ink}" stroke-width="1.8"/><path class="sp" d="M24 237V247M19 242H29" stroke="${ink}" stroke-width="1.5"/></g></g>`;
  return `<svg class="man" viewBox="-30 -6 220 262" focusable="false"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="M46 249H150" stroke="${ink}" stroke-width="1.6" opacity=".35"/>
${withCam?'':tro}
<g class="bob">
${leg('lgF')}${leg('lgN')}
${arm('arF')}
${pk}
<path d="M80 80Q98 70 116 80Q122 96 119 112Q132 130 122 152L82 154Q74 120 80 80Z" fill="${K.paper}" stroke="${ink}" stroke-width="${W}"/>
<path d="M82 146H123" stroke="${ink}" stroke-width="2.4"/>
<path d="M90 64L91 80H113L113.5 64Z" fill="${K.paper}" stroke="${ink}" stroke-width="${W}"/>
${withCam?`<path class="strap" d="" stroke="${ink}" stroke-width="2.6"/>`:''}
${HEADSVG}
${withCam?CAMSVG:''}
${arm('arN')}
</g></g></svg>`;
}

/* two-bone arm: the shoulder is fixed, the hand goes to (tx,ty) */
const SH=[98,86],L1=34,L2=34;
function ik(tx,ty){
  const dx=tx-SH[0],dy=ty-SH[1],d=clamp(Math.hypot(dx,dy),8,L1+L2-.5),phi=Math.atan2(dy,dx);
  const A=Math.acos(clamp((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1));
  let best=null;
  [phi-A,phi+A].forEach(a=>{const ex=SH[0]+L1*Math.cos(a),ey=SH[1]+L1*Math.sin(a);if(!best||ey>best.ey)best={a,ex,ey}});
  const hx=SH[0]+dx*d/Math.hypot(dx,dy||1e-6),hy=SH[1]+dy*d/Math.hypot(dx||1e-6,dy);
  const t1=Math.atan2(-(best.ex-SH[0]),best.ey-SH[1]);
  const t2=Math.atan2(-(tx-best.ex),ty-best.ey);
  return[t1*57.2958,(t2-t1)*57.2958];
}
const rot=(a,x,y)=>`rotate(${f1(a)} ${x} ${y})`;

/* ---------- scenery ---------- */
let UID=0;
function hill(seed,base,amp,w=2400,h=300){
  const r=rng(seed),a=r()*6,b=r()*6,c=r()*6,ys=[];
  let d=`M0 ${h}`;
  for(let x=0;x<=w;x+=20){const y=base+amp*(Math.sin(x/260+a)*.55+Math.sin(x/110+b)*.3+Math.sin(x/47+c)*.15);ys.push(y);d+=`L${x} ${y.toFixed(1)}`}
  return{d:d+`L${w} ${h}Z`,ys};
}
function pines(seed,ys,fill){
  const r=rng(seed);let d='';
  for(let i=2;i<ys.length-2;i+=2+Math.floor(r()*3)){const x=i*20,y=ys[i]+4,s=14+r()*16;d+=`M${x} ${y-s*2.1}L${x+s*.55} ${y-s*.7}L${x+s*.3} ${y-s*.7}L${x+s*.8} ${y}L${x-s*.8} ${y}L${x-s*.3} ${y-s*.7}L${x-s*.55} ${y-s*.7}Z`}
  return`<path d="${d}" fill="${fill}"/>`;
}
function layer(id,sp,seed,base,amp,fill,vh,bottom,trees){
  const h=hill(seed,base,amp);
  return`<svg class="ly" data-sp="${sp}" viewBox="0 0 2400 300" preserveAspectRatio="none" style="height:${vh};bottom:${bottom}"><defs><linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fill}"/><stop offset="1" stop-color="${fill}" stop-opacity=".78"/></linearGradient></defs><path d="${h.d}" fill="url(#g${id})"/>${trees?pines(seed+9,h.ys,trees):''}</svg>`;
}
const CLD=(fill)=>`<svg viewBox="0 0 240 90" aria-hidden="true"><g fill="${fill}"><circle cx="62" cy="58" r="28"/><circle cx="104" cy="44" r="38"/><circle cx="150" cy="52" r="32"/><circle cx="188" cy="62" r="24"/><rect x="40" y="58" width="170" height="26" rx="13"/></g><ellipse cx="124" cy="80" rx="88" ry="8" fill="#5a6a90" opacity=".14"/></svg>`;
function sky(p,id,opts){
  const o=opts||{};
  let h=`<div class="sun" style="--sun:${p.sun}"></div>`;
  h+=`<div class="clouds">${[0,1,2,3,4].map(i=>`<div class="cld" data-i="${i}">${CLD(p.cl)}</div>`).join('')}</div>`;
  const bottom=o.hz?`calc(100% - ${o.hz})`:'var(--gb)';
  h+=layer(id+'a',.1,11+id.length,150,70,p.far,o.hz?'30%':'44%',bottom);
  h+=layer(id+'b',.24,23+id.length,160,60,p.mid,o.hz?'24%':'36%',bottom,p.near);
  if(!o.hz)h+=layer(id+'c',.46,37+id.length,190,40,p.near,'24%',bottom,'rgba(0,0,0,.25)');
  return h;
}
const CL=[[.05,.12,1.1,.06],[.32,.2,.8,.09],[.55,.08,1.3,.05],[.78,.26,.7,.1],[.95,.14,1]];

/* ---------- build ---------- */
const scenes=[];
const ROT=[-2.2,1.6,-1.2,2.4,-1.8];
const FACE=`<g><circle r="9.5" fill="${K.skin}" stroke="${K.ink}" stroke-width="1.1"/><path d="M-9.3 -1C-10 -6 -5 -10 .4 -9.8C6 -9.6 10 -6 9.2 -1C6 -4.6 1 -6.4 -3 -5.6C-6.6 -4.8 -8.4 -3 -9.3 -1Z" fill="${K.grey}" stroke="${K.ink}" stroke-width=".8"/><circle cx="-3.6" cy=".4" r="3.2" fill="none" stroke="${K.ink}" stroke-width=".7"/><circle cx="4.4" cy=".4" r="3.2" fill="none" stroke="${K.ink}" stroke-width=".7"/><circle cx="-3.6" cy=".4" r=".9" fill="${K.ink}"/><circle cx="4.4" cy=".4" r=".9" fill="${K.ink}"/><path d="M-2.6 5.6Q1 7.6 4.8 5.4" stroke="${K.ink}" stroke-width=".9" fill="none"/></g>`;
const PLANE=(uid)=>`<svg class="plane" viewBox="0 0 440 180" focusable="false"><defs><linearGradient id="pf${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdf6e4"/><stop offset="1" stop-color="#e2d3b0"/></linearGradient><clipPath id="pw${uid}"><circle cx="210" cy="80" r="11"/></clipPath></defs>
<g stroke-linejoin="round" stroke-linecap="round">
<path d="M52 78L30 20Q38 14 66 18L100 66Z" fill="#d8604a" stroke="#9c3f2e" stroke-width="2"/>
<path d="M44 84L10 86Q6 90 12 94L72 94Z" fill="#e8775f" stroke="#9c3f2e" stroke-width="2"/>
<path class="wing" d="M246 108L150 152L170 157L304 114Z" fill="#2f7773" stroke="#1d4d4a" stroke-width="2"/>
<path d="M36 82C36 56 84 46 170 44L330 46C382 50 410 68 410 88C410 108 382 124 330 126L170 126C84 124 36 108 36 82Z" fill="url(#pf${uid})" stroke="#8a7b5c" stroke-width="2.2"/>
<path d="M40 93C62 101 92 103 170 104L330 105C375 104 400 97 407 91L408 99C395 112 372 120 330 121L170 122C90 120 60 112 42 101Z" fill="#3f8f8a"/>
<path d="M340 62C362 62 380 70 386 82L342 84Z" fill="#bfe3f2" stroke="#8a7b5c" stroke-width="2"/>
${[130,170,250,290].map(x=>`<circle cx="${x}" cy="80" r="11" fill="#cfeaf5" stroke="#8a7b5c" stroke-width="2"/>`).join('')}
<circle cx="210" cy="80" r="11" fill="#cfeaf5"/><g clip-path="url(#pw${uid})"><g transform="translate(210 82) scale(1.05)"><path d="M-14 14C-10 6 10 6 14 14Z" fill="${K.shirt}"/>${FACE}</g></g><circle cx="210" cy="80" r="11" fill="none" stroke="#8a7b5c" stroke-width="2"/>
<g class="gear"><path d="M200 126L197 152M356 126L354 150" stroke="#55555c" stroke-width="5"/><circle cx="196" cy="158" r="14" fill="#2b2b30" stroke="#111" stroke-width="2"/><circle cx="196" cy="158" r="5" fill="#8a8a92"/><circle cx="354" cy="159" r="12" fill="#2b2b30" stroke="#111" stroke-width="2"/><circle cx="354" cy="159" r="4.5" fill="#8a8a92"/></g>
<ellipse cx="414" cy="88" rx="7" ry="10" fill="#d8604a" stroke="#9c3f2e" stroke-width="2"/>
<ellipse class="disc" cx="419" cy="88" rx="6" ry="46" fill="#fff" opacity=".22"/>
<path class="blade" d="M419 42V134" stroke="#3a3a42" stroke-width="4"/>
</g></svg>`;
const TRAIN=(uid)=>{
  const win=(x,face)=>`<rect x="${x}" y="40" width="34" height="30" rx="6" fill="#cfeaf5" stroke="#243b57" stroke-width="2"/>${face?`<g clip-path="url(#tw${uid})"><g transform="translate(${x+17} 58) scale(1.35)"><path d="M-14 14C-10 6 10 6 14 14Z" fill="${K.shirt}"/>${FACE}</g></g><rect x="${x+20}" y="60" width="16" height="11" rx="2" fill="#222226" stroke="#0b0b0d" stroke-width="1"/><rect x="${x+20}" y="60" width="16" height="4" fill="#d8d8d2"/><circle cx="${x+34}" cy="66" r="3" fill="#2c2c31" stroke="#cfcfca" stroke-width="1.2"/>`:''}`;
  const coach=(x,faceAt)=>`<rect x="${x}" y="22" width="190" height="78" rx="10" fill="#3a6f9e" stroke="#1c3552" stroke-width="2.2"/><rect x="${x}" y="64" width="190" height="14" fill="#f2e6c4"/><rect x="${x}" y="22" width="190" height="9" rx="4" fill="#2c557c"/>${[0,1,2,3].map(i=>win(x+14+i*44,faceAt===i)).join('')}<rect x="${x}" y="100" width="190" height="8" fill="#2a2d3a"/>`;
  return`<svg class="trainsvg" viewBox="0 0 700 150" focusable="false"><defs><clipPath id="tw${uid}"><rect x="268" y="40" width="34" height="30" rx="6"/></clipPath></defs><g stroke-linejoin="round" stroke-linecap="round">
${coach(10,-1)}${coach(210,1)}
<path d="M404 100V40H440V24H470V64H500L530 64V100Z" fill="#c9503e" stroke="#7a2c20" stroke-width="2.2"/><rect x="404" y="40" width="64" height="26" rx="4" fill="#cfeaf5" stroke="#7a2c20" stroke-width="2"/><rect x="470" y="46" width="112" height="54" rx="26" fill="#e46a50" stroke="#7a2c20" stroke-width="2.2"/><rect x="560" y="34" width="22" height="20" rx="3" fill="#2a2d3a"/><path d="M582 74H604L616 100H582Z" fill="#2a2d3a"/>
<rect x="404" y="100" width="212" height="8" fill="#2a2d3a"/>
<g class="puff"><circle cx="571" cy="22" r="8" fill="#fff" opacity=".85"/><circle cx="582" cy="8" r="11" fill="#fff" opacity=".6"/></g>
${[46,100,250,304,436,494,552].map((x,i)=>`<g class="tw" data-i="${i}"><circle cx="${x}" cy="118" r="${i>3?14:11}" fill="#2a2d3a" stroke="#111" stroke-width="2"/><path class="tsp" data-cx="${x}" d="M${x-(i>3?10:8)} 118H${x+(i>3?10:8)}M${x} ${118-(i>3?10:8)}V${118+(i>3?10:8)}" stroke="#9a9aa4" stroke-width="2"/></g>`).join('')}
</g></svg>`;
};

CHAPTERS.forEach((c,i)=>{
  const kind=PLAN[c.k],host=document.getElementById(c.k);
  if(!kind||!host||!GALLERY[c.k])return;
  const list=GALLERY[c.k].slice(0,5),pal=PAL[MOOD[c.k]||'day'],uid=++UID;
  const el=document.createElement('div');
  el.className='scene sc-'+kind;el.setAttribute('aria-hidden','true');el.dataset.cat=c.k;
  const figs=list.map((p,j)=>`<figure class="ph" style="--r:${ROT[j]}deg"><div class="pi"><img src="thumbs/${p.id}.jpg" alt="" width="${p.w}" height="${p.h}" loading="lazy" decoding="async" draggable="false"></div></figure>`).join('');
  const cap=`<div class="sc-cap"><span class="eyebrow">Next stop · ${pad(i+1)}</span><h3>${c.t}</h3><p>${TEXT[c.k]||''}</p></div>`;
  const sty=`--s1:${pal.sky[0]};--s2:${pal.sky[1]};--s3:${pal.sky[2]};--g1:${pal.gr[0]};--g2:${pal.gr[1]}`;
  let sc;
  if(kind==='flight'||kind==='train'){
    const inner=kind==='flight'
      ?`<div class="rw"></div>${PLANE(uid)}<svg class="fx" aria-hidden="true">${Array.from({length:16},()=>'<circle r="0" fill="#fff"/>').join('')}</svg><svg class="birds" viewBox="0 0 90 30" aria-hidden="true">${[[8,8],[34,16],[58,6]].map(([x,y],k)=>`<path class="bd" style="animation-delay:${k*.3}s" d="M${x} ${y}q4 -5 8 0q4 -5 8 0" fill="none" stroke="rgba(30,30,50,.55)" stroke-width="1.4" stroke-linecap="round"/>`).join('')}</svg>`
      :`<div class="trk"></div><div class="stns">${[1,2,3,4,5].map(k=>`<div class="stn"><b>Stop ${k}</b><i></i></div>`).join('')}</div>${TRAIN(uid)}`;
    el.innerHTML=`<div class="sc-stage winst" style="${sty}">${sky(pal,'s'+uid,{hz:'57%'})}<div class="fgh"></div>${inner}<div class="row">${figs}</div>${cap}<div class="alt"></div></div>`;
    sc=winScene(el,kind,pal,uid);
  }else{
    const cam=kind==='camR',dir=kind==='walkL'?-1:1;
    el.innerHTML=`<div class="sc-stage walk ${dir<0?'dl':'dr'}" style="${sty}">${sky(pal,'s'+uid)}<div class="gnd"></div><div class="string"></div>${figs}<div class="trail"></div><div class="mwrap">${uncle(cam)}</div>${cap}</div>`;
    sc=walkScene(el,dir,cam);
  }
  main.insertBefore(el,host);
  scenes.push(sc);
});

/* ---------- shared: sky layers ---------- */
function skyUpdate(stage,sc,p){
  const L=sc.L;
  stage.querySelectorAll('.ly').forEach(l=>{l.style.transform=`translate3d(${(-p*parseFloat(l.dataset.sp)*L).toFixed(1)}px,0,0)`});
  stage.querySelectorAll('.cld').forEach((c,i)=>{
    const d=CL[i],w=parseFloat(c.dataset.w)||200,span=L+w*2;
    const x=((((d[0]*span-p*d[3]*L*2)%span)+span)%span)-w;
    c.style.transform=`translate3d(${x.toFixed(1)}px,0,0) scale(${d[2]})`;
  });
}
function skyLayout(stage,sc){
  const L=sc.L=stage.clientWidth,H=sc.H=stage.clientHeight;
  stage.style.setProperty('--lw',(L*2.2)+'px');
  stage.querySelectorAll('.cld').forEach((c,i)=>{const w=Math.min(300,Math.max(150,L*.18));c.dataset.w=w;c.style.width=w+'px';c.style.top=(CL[i][1]*100)+'%'});
}

/* ---------- walking scenes (with optional Fujifilm camera) ---------- */
function walkScene(el,dir,cam){
  const stage=el.querySelector('.sc-stage'),mw=el.querySelector('.mwrap'),svg=mw.querySelector('svg');
  const trail=el.querySelector('.trail'),figs=[...el.querySelectorAll('.ph')];
  const q=s=>svg.querySelector(s);
  const r={lgN:q('.lgN'),knN:q('.lgN .kn'),lgF:q('.lgF'),knF:q('.lgF .kn'),bob:q('.bob'),sp:q('.sp'),cam:q('.cam'),fl:q('.fl'),strap:q('.strap'),head:q('.head'),
    nu:q('.arN .up'),nf:q('.arN .fo'),fu:q('.arF .up'),ff:q('.arF .fo')};
  if(dir<0)svg.style.transform='scaleX(-1)';
  const sc={el,stage,L:0,H:0};
  let wm=300,s=1.4,n=5,pw=100,D=[],mk=[],zs=[];
  const PW=cam?.14:0;
  function layout(){
    skyLayout(stage,sc);const L=sc.L,H=sc.H;
    n=L<560?3:L<900?4:5;
    const mh=Math.min(H*.52,L*.66,480);wm=mh*220/262;s=wm/220;
    mw.style.width=wm+'px';mw.style.height=mh+'px';stage.style.setProperty('--mh',mh+'px');
    pw=Math.min(L/(n+1.2),H*.25);
    const x0=-wm*.8,x1=L-wm*1.02,hp0=x0+wm*.55,hp1=x1+wm*.55;
    const dmin=Math.max(pw*.62,L*.1),dmax=hp1;
    D=[];mk=[];zs=[];
    figs.forEach((f,i)=>{
      f.classList.toggle('x',i>=n);if(i>=n)return;
      const d=dmin+(dmax-dmin)*(n>1?i/(n-1):0);D[i]=d;mk[i]=clamp((d-hp0)/(hp1-hp0));zs[i]=mk[i]+i*PW;
      f.style.width=pw+'px';f.style.height=pw*1.25+'px';f.style.left=((dir>0?d:L-d)-pw/2)+'px';
    });
    sc.x0=x0;sc.x1=x1;
  }
  /* path position f (0..1) for scroll fraction ss, with a pause at every photo when he shoots */
  function warp(ss){
    const T=1+n*PW,sp=ss*T;
    let pos=0,cur=0;
    for(let i=0;i<n;i++){
      const seg=mk[i]-pos;
      if(sp<cur+seg)return pos+(sp-cur);
      cur+=seg;pos=mk[i];
      if(sp<cur+PW)return pos;
      cur+=PW;
    }
    return clamp(pos+(sp-cur));
  }
  function update(p){
    if(!sc.L)layout();
    const L=sc.L,ss=reduce.matches?1:clamp(p/.86);
    const f=warp(ss),dd=.002,fa=warp(clamp(ss-dd)),fb=warp(clamp(ss+dd));
    const amt=smooth(0,.5,Math.abs(fb-fa)/(2*dd)/(1+n*PW));
    const x=sc.x0+(sc.x1-sc.x0)*f,dist=x-sc.x0;
    mw.style.transform=`translate3d(${f1(dir>0?x:L-x-wm)}px,0,0)`;
    const A=20*Math.PI/180*amt,cyc=4*98*Math.sin(20*Math.PI/180);
    const ph=Math.PI*2*(dist/s)/cyc,sn=Math.sin(ph),cs=Math.cos(ph);
    r.lgN.setAttribute('transform',rot(-20*amt*sn,98,150));
    r.knN.setAttribute('transform',rot(amt*(4+38*Math.max(0,cs)),98,198));
    r.lgF.setAttribute('transform',rot(20*amt*sn,98,150));
    r.knF.setAttribute('transform',rot(amt*(4+38*Math.max(0,-cs)),98,198));
    r.bob.setAttribute('transform',`translate(0 ${f1(98*(1-Math.cos(A*sn)))})`);
    r.head&&r.head.setAttribute('transform',`translate(0 ${f1(-1.2*Math.abs(cs)*amt)})`);
    if(r.sp)r.sp.setAttribute('transform',rot(dist/s/6*57.3,24,242));
    let k=0,fl=0;
    if(cam){
      const sp=ss*(1+n*PW);
      zs.forEach(z=>{const t=(sp-z)/PW;if(t>=0&&t<=1){k=Math.max(k,smooth(0,.25,t)*(1-smooth(.72,1,t)));if(t>.28&&t<.62)fl=Math.max(fl,Math.sin((t-.28)/.34*Math.PI))}});
      const cx=lerp(124,128,k),cy=lerp(104,43,k);
      r.cam.setAttribute('transform',`translate(${f1(cx)} ${f1(cy)})`);
      r.fl.setAttribute('opacity',f1(fl));
      const a=ik(cx+5,cy+11),b=ik(cx+16,cy+12);
      r.nu.setAttribute('transform',rot(a[0],98,86));r.nf.setAttribute('transform',rot(a[1],98,120));
      r.fu.setAttribute('transform',rot(b[0],98,86));r.ff.setAttribute('transform',rot(b[1],98,120));
      r.strap.setAttribute('d',`M${f1(cx-17)} ${f1(cy-8)}Q${f1(cx-34)} ${f1(cy-6)} 92 72`);
      r.head.setAttribute('transform',`translate(0 ${f1(-1.2*Math.abs(cs)*amt)}) rotate(${f1(-6*k)} 100 60)`);
      sc.k=k;
    }else{
      const a=ik(82,150);
      r.nu.setAttribute('transform',rot(a[0],98,86));r.nf.setAttribute('transform',rot(a[1],98,120));
      r.fu.setAttribute('transform',rot(-24*amt*sn,98,86));r.ff.setAttribute('transform',rot(-(8+16*amt*Math.max(0,sn)),98,120));
    }
    trail.style.width=clamp(x+wm*.34,0,L)+'px';
    const hp=x+wm*.55;
    if(cam){const sp=ss*(1+n*PW);figs.forEach((fg,i)=>fg.classList.toggle('on',i<n&&sp>=zs[i]+.4*PW))}
    else figs.forEach((fg,i)=>fg.classList.toggle('on',i<n&&f>=mk[i]-.0005));
    skyUpdate(stage,sc,clamp(p));
  }
  return Object.assign(sc,{layout,update});
}

/* ---------- flight and train, step by step ---------- */
function winScene(el,kind,pal,uid){
  const stage=el.querySelector('.sc-stage'),figs=[...el.querySelectorAll('.ph')],alt=el.querySelector('.alt');
  const flight=kind==='flight';
  const sc={el,stage,L:0,H:0};
  let n=5;
  const rw=el.querySelector('.rw'),plane=el.querySelector('.plane'),fx=el.querySelector('.fx'),gear=el.querySelector('.gear'),blade=el.querySelector('.blade'),disc=el.querySelector('.disc'),birds=el.querySelector('.birds');
  const tr=el.querySelector('.trainsvg'),stns=[...el.querySelectorAll('.stn')],trk=el.querySelector('.trk');
  let Wp=400,Hp=160,Wt=700,Ht=150;
  function layout(){
    skyLayout(stage,sc);const L=sc.L,H=sc.H;n=L<560?3:L<900?4:5;
    figs.forEach((f,i)=>f.classList.toggle('x',i>=n));
    if(flight){Wp=Math.min(L*.46,H*.62,620);Hp=Wp*180/440;plane.style.width=Wp+'px';plane.style.height=Hp+'px';
      fx.setAttribute('viewBox',`0 0 ${L} ${H}`);birds.style.width=Math.min(220,L*.18)+'px';
      rw.style.height=Math.max(8,H*.02)+'px';rw.style.width=(L*.95)+'px';}
    else{Wt=Math.min(L*.72,H*1.25,820);Ht=Wt*150/700;tr.style.width=Wt+'px';tr.style.height=Ht+'px';}
  }
  function planeAt(pp){
    const L=sc.L,H=sc.H,t=pp*n,u=stepU(t),q=u/n;
    const y0=H*.07,yg=H*.57-Hp*(172/180)+Hp*.02;
    const xs=-Wp*.45,xe=L*.6-Wp/2;
    const dU=(stepU(t+.02)-stepU(Math.max(0,t-.02)))/.04;
    return{x:lerp(xs,xe,pp)+0,y:lerp(y0,yg,q)+4*Math.sin(pp*38)*(1-q*.8),q,u,ang:clamp(dU,0,3)*3.2-(q>.97?4:0)};
  }
  function update(p){
    if(!sc.L)layout();
    const L=sc.L,H=sc.H,pp=reduce.matches?1:clamp(p/.88),t=pp*n,u=stepU(t);
    skyUpdate(stage,sc,pp);
    if(flight){
      const a=planeAt(pp);
      plane.style.transform=`translate3d(${f1(a.x)}px,${f1(a.y)}px,0) rotate(${f1(a.ang)}deg)`;
      const gk=smooth(.52,.68,a.q);
      gear.setAttribute('transform',`translate(0 ${f1(-40*(1-gk))})`);gear.setAttribute('opacity',f1(gk));
      const bl=Math.cos(pp*900);blade.setAttribute('transform',`translate(419 88) scale(1 ${f1(bl)}) translate(-419 -88)`);
      rw.style.transform=`translate3d(${f1(lerp(L*1.02,L*.14,smooth(.05,1,pp)))}px,0,0)`;
      const cs=fx.children;
      for(let k=0;k<cs.length;k++){
        const b=planeAt(Math.max(0,pp-(k+1)*.011));
        cs[k].setAttribute('cx',f1(b.x+Wp*.06));cs[k].setAttribute('cy',f1(b.y+Hp*.5));
        cs[k].setAttribute('r',f1(3+k*1.7));cs[k].setAttribute('opacity',f1(.5*(1-k/cs.length)*(1-smooth(.85,1,a.q))));
      }
      birds.style.transform=`translate3d(${f1(L*.7-pp*L*.25)}px,${f1(H*.14+Math.sin(pp*6)*10)}px,0)`;
      alt.textContent=u>=n-.001?'Landed':`Altitude ${(Math.round(30000*(1-u/n)/100)*100).toLocaleString('en-US')} ft`;
    }else{
      const D=L*.8,yTr=H*.57-Ht*(124/150)+Ht*.03;
      tr.style.transform=`translate3d(${f1(L*.5-Wt*.5)}px,${f1(yTr)}px,0)`;
      trk.style.top=(H*.57+Ht*.035)+'px';
      trk.style.backgroundPositionX=f1(-u*D)+'px';
      const wa=u*D/12*57.3;
      tr.querySelectorAll('.tsp').forEach(e=>e.setAttribute('transform',rot(wa,e.dataset.cx,118)));
      tr.querySelector('.puff').style.transform=`translateY(${f1(-Math.abs(Math.sin(u*12))*4)}px)`;
      stns.forEach((s,k)=>{const x=L*.5+(k+1-u)*D;s.style.transform=`translate3d(${f1(x-30)}px,0,0)`;s.style.top=(H*.57-62)+'px'});
      const near=Math.abs(u-Math.round(u))<.03&&u>.5;
      alt.textContent=u>=n-.001?'Arrived':near?`Stop ${Math.round(u)} of ${n}`:'On the way';
    }
    figs.forEach((f,i)=>f.classList.toggle('on',i<n&&t>=i+.7));
  }
  return Object.assign(sc,{layout,update});
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
