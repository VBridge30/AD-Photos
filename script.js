const CHAPTERS=[
 {k:'monochrome',t:'Monochrome',d:'Colour removed, so light, shape and shadow can speak.'},
 {k:'unforced',t:'The Art of Not Forcing Frames',l:'Unforced Frames',d:'No grid, no thirds, no centring. The subject sits where it fell: pushed to an edge, cropped, half-hidden. The frame follows the moment, not the rules.',g:'c2'},
 {k:'macro',t:'Macro',d:'A closer look at petals, dewdrops and the small worlds in between.'},
 {k:'story',t:'Story',d:'Quiet moments that suggest more than they show.'},
 {k:'street',t:'Street',d:'People, fog and everyday journeys, caught as they pass.'},
 {k:'architecture',t:'Architecture',d:'Stone, iron and glass: buildings seen for their lines, light and age.'},
 {k:'abstract',t:'Abstract',d:'Where the subject dissolves into line, colour and feeling.'},
 {k:'landscape',t:'Landscape',d:'Mist, water, snow and the long light of the day.',g:'c2'}
];
const $=(s,r=document)=>r.querySelector(s);
const main=$('#gallery'),filters=$('#filters');
const pad=n=>String(n).padStart(2,'0');
let active='all';

function tile(p,cat,extra=''){
  const b=document.createElement('button');
  b.className='tile';b.dataset.cat=cat;b.dataset.id=p.id;b.setAttribute('aria-label','View '+p.title);
  b.innerHTML=`<img src="thumbs/${p.id}.jpg" width="${p.w}" height="${p.h}" alt="${p.title}" loading="lazy" decoding="async">${extra?'':`<span class="cap">${p.title}</span>`}`;
  const img=b.firstChild;img.addEventListener('load',()=>img.classList.add('in'));
  if(img.complete)img.classList.add('in');
  return b;
}

CHAPTERS.forEach((c,i)=>{
  const list=GALLERY[c.k];
  const s=document.createElement('section');
  s.className='chapter '+(c.cls||'');s.id=c.k;s.dataset.cat=c.k;
  s.innerHTML=`<div class="chapter-head"><span class="num">${pad(i+1)}</span><div><h2>${c.t}</h2><p>${c.d}</p></div><span class="count">${list.length} photographs</span></div>`;
  if(c.k==='story'){
    const w=document.createElement('div');w.className='story-list';
    list.forEach((p,n)=>{
      const st=document.createElement('div');st.className='step';
      st.appendChild(tile(p,c.k,1));
      const tx=document.createElement('div');tx.className='txt';
      tx.innerHTML=`<span class="n">${pad(n+1)}</span><h3>${p.title}</h3>`;
      st.appendChild(tx);w.appendChild(st);
    });
    s.appendChild(w);
  }else{
    const g=document.createElement('div');g.className='grid '+(c.g==='c2'?'c2':'');
    list.forEach(p=>g.appendChild(tile(p,c.k)));
    s.appendChild(g);
  }
  main.appendChild(s);
  const b=document.createElement('button');b.dataset.k=c.k;b.textContent=c.l||c.t;filters.appendChild(b);
});

/* featured: six favourites, one look at the range */
const FEATURED=[['landscape','Egret at Dusk'],['macro','Zinnia'],['architecture','The Clock at St Pancras'],['unforced','Fog and Wires'],['monochrome','Last Light, Still Water'],['landscape','Above the Clouds']];
const fs=document.createElement('section');fs.className='featured';fs.id='featured';
fs.innerHTML='<div class="chapter-head"><div><h2>Selected Works</h2><p>Six photographs to begin with.</p></div></div>';
const fg=document.createElement('div');fg.className='fgrid';
FEATURED.forEach(([c,t])=>{const p=GALLERY[c].find(x=>x.title===t);if(p)fg.appendChild(tile(p,c))});
fs.appendChild(fg);
$('#about').after(fs);
const all=document.createElement('button');all.dataset.k='all';all.textContent='All';filters.prepend(all);

function setFilter(k,scroll){
  active=k;
  filters.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.k===k));
  document.querySelectorAll('.chapter').forEach(s=>s.classList.toggle('hide',k!=='all'&&s.dataset.cat!==k));
  $('#featured')?.classList.toggle('hide',k!=='all');
  if(scroll)$('#gallery').scrollIntoView();
}
filters.addEventListener('click',e=>{const b=e.target.closest('button');if(b)setFilter(b.dataset.k,true)});
setFilter('all');
// highlight current chapter while scrolling in "All" view
const io=new IntersectionObserver(es=>{
  if(active!=='all'||scrollY<innerHeight*.6)return;
  es.forEach(e=>{if(e.isIntersecting)filters.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.k===e.target.dataset.cat))});
},{rootMargin:'-40% 0px -55% 0px'});
document.querySelectorAll('.chapter').forEach(s=>io.observe(s));

/* lightbox */
const lb=$('#lb'),lbImg=$('#lb-img');let set=[],idx=0;
function show(){
  const p=set[idx];lbImg.src='photos/'+p.dataset.id+'.jpg';lbImg.alt=p.getAttribute('aria-label');
  $('#lb-title').textContent=p.getAttribute('aria-label').replace('View ','');
  $('#lb-count').textContent=`${idx+1} / ${set.length}`;
  [idx+1,idx-1].forEach(i=>{const q=set[(i+set.length)%set.length];if(q)new Image().src='photos/'+q.dataset.id+'.jpg'});
}
function open(t){
  set=[...t.closest('.chapter,.featured').querySelectorAll('.tile')];idx=set.indexOf(t);
  lb.hidden=false;document.body.style.overflow='hidden';show();
}
function close(){lb.hidden=true;document.body.style.overflow='';lbImg.src=''}
const step=d=>{idx=(idx+d+set.length)%set.length;show()};
main.addEventListener('click',e=>{const t=e.target.closest('.tile');if(t)open(t)});
$('.lb-close').onclick=close;$('.lb-prev').onclick=()=>step(-1);$('.lb-next').onclick=()=>step(1);
lb.addEventListener('click',e=>{if(e.target===lb)close()});
document.addEventListener('keydown',e=>{if(lb.hidden)return;
  if(e.key==='Escape')close();if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1)});
let x0=null;
lb.addEventListener('touchstart',e=>x0=e.touches[0].clientX,{passive:true});
lb.addEventListener('touchend',e=>{if(x0===null)return;const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>50)step(d<0?1:-1);x0=null});
// light deterrent against casual saving
document.addEventListener('contextmenu',e=>{if(e.target.tagName==='IMG')e.preventDefault()});

/* black / white background switch, remembered between visits */
$('#theme').addEventListener('click',()=>{
  const r=document.documentElement,next=r.dataset.theme==='light'?'dark':'light';
  r.dataset.theme=next;
  try{localStorage.setItem('theme',next)}catch(e){}
});

/* hold the cursor on a photo for a moment: it floats up in the centre, the page blurs behind it */
(function(){
  if(!matchMedia('(hover:hover)').matches)return;
  const peek=document.createElement('div');peek.className='peek';peek.innerHTML='<figure><img alt=""><figcaption></figcaption></figure>';
  document.body.appendChild(peek);
  const pimg=peek.querySelector('img'),pcap=peek.querySelector('figcaption');
  let timer=null,cur=null;
  const hide=()=>{clearTimeout(timer);timer=null;cur=null;peek.classList.remove('on')};
  const start=t=>{
    cur=t;clearTimeout(timer);
    const src='photos/'+t.dataset.id+'.jpg',pre=new Image();pre.src=src;
    timer=setTimeout(()=>{
      if(cur!==t||!lb.hidden)return;
      const go=()=>{if(cur!==t)return;pimg.src=src;pcap.textContent=t.getAttribute('aria-label').replace('View ','');peek.classList.add('on')};
      pre.complete?go():(pre.onload=go);
    },900);
  };
  const over=e=>{const t=e.target.closest('.tile');if(t&&t!==cur)start(t)};
  const out=e=>{const t=e.target.closest('.tile');if(t&&!t.contains(e.relatedTarget))hide()};
  [main,$('#featured')].forEach(el=>{el.addEventListener('mouseover',over);el.addEventListener('mouseout',out)});
  addEventListener('scroll',hide,{passive:true});
  addEventListener('wheel',hide,{passive:true});
  addEventListener('mousedown',hide);
  addEventListener('keydown',hide);
})();

/* background music: plays music.mp3 if you add one next to index.html, otherwise a soft generated ambient pad */
(function(){
  const btn=$('#music');let on=false,file=null,ctx=null,master=null,timers=[];
  const probe=new Audio();probe.src='music.mp3';probe.loop=true;probe.volume=0;
  let hasFile=null;
  probe.addEventListener('canplaythrough',()=>hasFile=true,{once:true});
  probe.addEventListener('error',()=>hasFile=false,{once:true});
  const hz=m=>440*Math.pow(2,(m-69)/12);
  function ambient(){
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain();master.gain.value=0;
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1400;
    // simple generated reverb
    const len=ctx.sampleRate*3.5,ir=ctx.createBuffer(2,len,ctx.sampleRate);
    for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
    const rev=ctx.createConvolver();rev.buffer=ir;
    const wet=ctx.createGain();wet.gain.value=.55;
    lp.connect(master);lp.connect(rev);rev.connect(wet);wet.connect(master);master.connect(ctx.destination);
    const chords=[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,66]]; // Am7, Fmaj7, Cmaj7, G6
    const scale=[69,72,74,76,79,81];
    let n=0;
    function pad(){
      const t=ctx.currentTime,ch=chords[n++%chords.length],dur=9;
      ch.forEach((m,i)=>{
        [-6,6].forEach(det=>{
          const o=ctx.createOscillator(),g=ctx.createGain();
          o.type=i%2?'triangle':'sine';o.frequency.value=hz(m);o.detune.value=det;
          g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+3.5);g.gain.linearRampToValueAtTime(0,t+dur+1.5);
          o.connect(g);g.connect(lp);o.start(t);o.stop(t+dur+2);
        });
      });
    }
    function bell(){
      const t=ctx.currentTime,m=scale[Math.floor(Math.random()*scale.length)];
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type='sine';o.frequency.value=hz(m);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+.02);g.gain.exponentialRampToValueAtTime(.0005,t+3.5);
      o.connect(g);g.connect(lp);o.start(t);o.stop(t+3.6);
    }
    pad();timers.push(setInterval(pad,9000));
    (function next(){timers.push(setTimeout(()=>{if(on){bell();next()}},2500+Math.random()*4500))})();
  }
  function fade(to,sec,done){
    if(file){const s=file.volume,t0=performance.now();(function f(){const k=Math.min(1,(performance.now()-t0)/(sec*1000));file.volume=s+(to-s)*k;k<1?requestAnimationFrame(f):done&&done()})()}
    else if(master){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setValueAtTime(master.gain.value,ctx.currentTime);master.gain.linearRampToValueAtTime(to,ctx.currentTime+sec);if(done)setTimeout(done,sec*1000)}
  }
  function play(){
    on=true;btn.classList.add('on');btn.setAttribute('aria-pressed','true');
    if(hasFile){file=probe;file.volume=0;file.play().catch(()=>{});fade(.5,3)}
    else{if(!ctx)ambient();ctx.resume();fade(.9,4)}
  }
  function stop(){
    on=false;btn.classList.remove('on');btn.setAttribute('aria-pressed','false');
    fade(0,1.2,()=>{if(!on){if(file)file.pause();else if(ctx)ctx.suspend()}});
  }
  btn.addEventListener('click',()=>on?stop():play());
})();
