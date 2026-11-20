const CHAPTERS=[
 {k:'monochrome',t:'Monochrome',d:'Colour removed, so light, shape and shadow can speak.'},
 {k:'light',t:'Light and Shadow',d:'Where the light falls, and what it leaves behind: rays through mist, a shadow on a wall, a silhouette against the glow.'},
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
const FEATURED=[['landscape','Egret at Dusk'],['macro','Zinnia'],['architecture','The Clock at St Pancras'],['street','Fog and Wires'],['monochrome','Last Light, Still Water'],['landscape','Above the Clouds']];
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
const lb=$('#lb'),lbImg=$('#lb-img');let set=[],idx=0,opener=null;
function show(){
  const p=set[idx];lbImg.src='photos/'+p.dataset.id+'.jpg';lbImg.alt=p.getAttribute('aria-label');
  $('#lb-title').textContent=p.getAttribute('aria-label').replace('View ','');
  $('#lb-count').textContent=`${idx+1} / ${set.length}`;
  [idx+1,idx-1].forEach(i=>{const q=set[(i+set.length)%set.length];if(q)new Image().src='photos/'+q.dataset.id+'.jpg'});
}
function open(t){
  set=[...t.closest('.chapter,.featured').querySelectorAll('.tile,.slide')].filter(e=>e.offsetParent!==null);idx=set.indexOf(t);
  opener=document.activeElement;lb.hidden=false;document.body.style.overflow='hidden';show();$('.lb-close').focus();
}
function close(){lb.hidden=true;document.body.style.overflow='';lbImg.src='';if(opener&&opener.focus)opener.focus()}
const step=d=>{idx=(idx+d+set.length)%set.length;show()};
main.addEventListener('click',e=>{const t=e.target.closest('.tile,.slide');if(t&&!window.__dragged)open(t)});
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

/* background music: plays music.mp3 if you add one next to index.html, otherwise a generated fingerpicked guitar */
(function(){
  const btn=$('#music');let on=false,file=null,ctx=null,master=null,timers=[],running=false,kick=null;
  const probe=new Audio();probe.src='music.mp3';probe.loop=true;probe.volume=0;
  let hasFile=null;
  probe.addEventListener('canplaythrough',()=>hasFile=true,{once:true});
  probe.addEventListener('error',()=>hasFile=false,{once:true});
  const hz=m=>440*Math.pow(2,(m-69)/12);
  function ambient(){
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=ctx.createGain();master.gain.value=0;
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2600;
    // simple generated reverb
    const len=ctx.sampleRate*3.5,ir=ctx.createBuffer(2,len,ctx.sampleRate);
    for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
    const rev=ctx.createConvolver();rev.buffer=ir;
    const wet=ctx.createGain();wet.gain.value=.55;
    lp.connect(master);lp.connect(rev);rev.connect(wet);wet.connect(master);master.connect(ctx.destination);
    // fingerpicked acoustic guitar: Am - F - C - G, eighth-note picking pattern
    const prog=[[45,57,60,64,69,64,60,57],[41,53,57,60,65,60,57,53],[48,55,60,64,67,64,60,55],[43,55,59,62,67,62,59,55]];
    const pick=[0,2,3,4,3,2,4,3]; // order of picking within a bar
    function pluck(m,vel){
      const t=ctx.currentTime+.03,f=hz(m);
      const flt=ctx.createBiquadFilter();flt.type='lowpass';flt.Q.value=1.2;
      flt.frequency.setValueAtTime(3800,t);flt.frequency.exponentialRampToValueAtTime(600,t+.9);
      const g=ctx.createGain();
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel*.2,t+.006);g.gain.exponentialRampToValueAtTime(.0004,t+2.4);
      [['triangle',1,1],['sawtooth',1.002,.35],['sine',2,.25]].forEach(([ty,k,a])=>{
        const o=ctx.createOscillator(),og=ctx.createGain();
        o.type=ty;o.frequency.value=f*k;og.gain.value=a;
        o.connect(og);og.connect(flt);o.start(t);o.stop(t+2.5);
      });
      flt.connect(g);g.connect(lp);
    }
    let bar=0,step=0;
    kick=()=>{if(!running)tick()};
    function tick(){
      if(!on){running=false;return}
      running=true;
      const c=prog[bar%prog.length];
      pluck(c[step===0?0:pick[step]],step===0?.95:.5+Math.random()*.3);
      step=(step+1)%8;if(step===0)bar++;
      timers.push(setTimeout(tick,430+Math.random()*30));
    }
    kick();
  }
  function fade(to,sec,done){
    if(file){const s=file.volume,t0=performance.now();(function f(){const k=Math.min(1,(performance.now()-t0)/(sec*1000));file.volume=s+(to-s)*k;k<1?requestAnimationFrame(f):done&&done()})()}
    else if(master){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setValueAtTime(master.gain.value,ctx.currentTime);master.gain.linearRampToValueAtTime(to,ctx.currentTime+sec);if(done)setTimeout(done,sec*1000)}
  }
  function play(){
    on=true;btn.classList.add('on');btn.setAttribute('aria-pressed','true');
    if(hasFile){file=probe;file.volume=0;file.play().catch(()=>{});fade(.5,3)}
    else{if(!ctx)ambient();ctx.resume();kick&&kick();fade(.9,4)}
  }
  function stop(){
    on=false;btn.classList.remove('on');btn.setAttribute('aria-pressed','false');
    fade(0,1.2,()=>{if(!on){if(file)file.pause();else if(ctx)ctx.suspend()}});
  }
  btn.addEventListener('click',()=>on?stop():play());
})();

/* Sway-style slider: each chapter can switch between the grid and a swipeable slider */
(function(){
  const SLIDER_FIRST=['landscape','architecture'];
  document.querySelectorAll('.chapter').forEach(ch=>{
    const k=ch.dataset.cat,list=GALLERY[k];if(!list||k==='unforced')return;
    // slider markup
    const wrap=document.createElement('div');wrap.className='slider';
    wrap.innerHTML='<button class="sl-btn sl-prev" aria-label="Previous photo">‹</button><div class="track" tabindex="0" aria-label="'+k+' slider"></div><button class="sl-btn sl-next" aria-label="Next photo">›</button><p class="sl-info"><span class="sl-title"></span><span class="sl-count"></span></p>';
    const track=wrap.querySelector('.track');
    list.forEach(p=>{
      const s=document.createElement('button');s.className='slide';s.dataset.id=p.id;s.dataset.cat=k;s.setAttribute('aria-label','View '+p.title);
      s.innerHTML='<img src="photos/'+p.id+'.jpg" width="'+p.w+'" height="'+p.h+'" alt="'+p.title+'" loading="lazy" decoding="async" draggable="false">';
      track.appendChild(s);
    });
    ch.appendChild(wrap);
    // view switch next to the photo count
    const head=ch.querySelector('.chapter-head'),count=head.querySelector('.count');
    const right=document.createElement('div');right.className='head-right';
    const view=document.createElement('div');view.className='view';
    view.innerHTML='<button data-v="grid">'+(k==='story'?'Story':'Grid')+'</button><button data-v="slider">Slider</button>';
    count.replaceWith(right);right.append(count,view);
    const slides=[...track.children],title=wrap.querySelector('.sl-title'),cnt=wrap.querySelector('.sl-count');
    let idx=0;
    const mark=()=>{
      const mid=track.scrollLeft+track.clientWidth/2;let best=0,bd=1e9;
      slides.forEach((s,i)=>{const d=Math.abs(s.offsetLeft+s.offsetWidth/2-mid);if(d<bd){bd=d;best=i}});
      idx=best;slides.forEach((s,i)=>s.classList.toggle('active',i===best));
      title.textContent=list[best].title;cnt.textContent=pad(best+1)+' / '+pad(list.length);
    };
    const go=i=>{i=Math.max(0,Math.min(slides.length-1,i));slides[i].scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})};
    let raf=0;track.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(mark)},{passive:true});
    wrap.querySelector('.sl-prev').onclick=()=>go(idx-1);
    wrap.querySelector('.sl-next').onclick=()=>go(idx+1);
    track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(idx+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(idx-1)}});
    // click slide that is off-centre: bring it to the centre first, open only when it is the centred one
    track.addEventListener('click',e=>{const s=e.target.closest('.slide');if(s&&!s.classList.contains('active')&&!window.__dragged){e.stopPropagation();go(slides.indexOf(s))}},true);
    // mouse drag
    let down=false,x0=0,sl0=0,moved=0;
    track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;down=true;x0=e.clientX;sl0=track.scrollLeft;moved=0});
    addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-x0;moved=Math.max(moved,Math.abs(dx));if(moved>5){track.classList.add('drag');track.scrollLeft=sl0-dx}});
    addEventListener('pointerup',()=>{if(!down)return;down=false;if(moved>5){window.__dragged=true;setTimeout(()=>window.__dragged=false,60);track.classList.remove('drag');go(idx)}});
    // switch
    const set=v=>{
      ch.dataset.view=v;view.querySelectorAll('button').forEach(b=>{b.classList.toggle('on',b.dataset.v===v);b.setAttribute('aria-pressed',b.dataset.v===v)});
      if(v==='slider')requestAnimationFrame(()=>{mark();go(idx)});
    };
    view.addEventListener('click',e=>{const b=e.target.closest('button');if(b)set(b.dataset.v)});
    set(SLIDER_FIRST.includes(k)?'slider':'grid');
  });
})();

/* back to top */
(function(){
  const b=$('#top');
  const upd=()=>b.classList.toggle('show',scrollY>innerHeight*1.2&&lb.hidden);
  addEventListener('scroll',upd,{passive:true});upd();
  b.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
})();

/* photo album: page-turning book */
(function(){
  const view=$('#album-view'),book=$('#book'),prev=$('#al-prev'),next=$('#al-next'),count=$('#al-count');
  const PER=7;
  const pages=[];
  pages.push({t:'cover'});
  pages.push({t:'note',text:'A collection of photographs'});
  CHAPTERS.forEach((c,i)=>{
    pages.push({t:'divider',n:pad(i+1),title:c.t,desc:c.d});
    GALLERY[c.k].slice(0,PER).forEach(p=>pages.push({t:'photo',p}));
  });
  pages.push({t:'note',text:'Thank you for looking.'});
  if(pages.length%2===0)pages.push({t:'note',text:''});
  pages.push({t:'backcover'});
  const N=pages.length/2;
  let cur=0,opened=false,albumOpener=null;

  function face(pg,idx,side){
    const f=document.createElement('div');f.className='face '+side;
    if(pg.t==='cover'||pg.t==='backcover'){
      f.classList.add('cover');
      if(pg.t==='cover')f.innerHTML='<div class="ct">A. Deshpande</div><div class="rule"></div><div class="cs">A minimalist’s eye</div>';
    }else if(pg.t==='note'){
      f.classList.add('paper-note');f.textContent=pg.text;
    }else if(pg.t==='divider'){
      f.classList.add('divider');
      f.innerHTML='<div class="dn">'+pg.n+'</div><div class="dt">'+pg.title+'</div><span class="pgnum">'+pad(idx-1)+'</span>';
    }else{
      f.innerHTML='<div class="pgphoto"><img data-src="photos/'+pg.p.id+'.jpg" alt="'+pg.p.title+'" draggable="false"></div><span class="pgnum">'+pad(idx-1)+'</span>';
    }
    f._pg=pg;return f;
  }
  const sheets=[];
  for(let i=0;i<N;i++){
    const s=document.createElement('div');s.className='sheet';s.style.setProperty('--i',i);
    s.appendChild(face(pages[2*i],2*i,'front'));
    s.appendChild(face(pages[2*i+1],2*i+1,'back'));
    book.appendChild(s);sheets.push(s);
  }
  function load(){
    for(let i=Math.max(0,cur-3);i<Math.min(N,cur+4);i++)sheets[i].querySelectorAll('img[data-src]').forEach(im=>{
      im.src=im.dataset.src;im.removeAttribute('data-src');
      im.addEventListener('load',()=>im.classList.add('ok'),{once:true});
    });
  }
  function z(){sheets.forEach((s,i)=>{s.style.zIndex=i<cur?i:N-i})}
  function render(animate){
    sheets.forEach((s,i)=>{
      const was=s.classList.contains('flipped'),now=i<cur;
      if(was!==now&&animate){
        s.style.zIndex=N+5;
        setTimeout(z,1000);
      }
      s.classList.toggle('flipped',now);
    });
    if(!animate)z();
    book.classList.toggle('at-start',cur===0);
    book.classList.toggle('at-end',cur===N);
    prev.disabled=cur===0;next.disabled=cur===N;
    count.textContent=cur===0?'Cover':cur===N?'The end':pad(cur)+' / '+pad(N-1);
    load();
  }
  function go(d){const n=Math.min(N,Math.max(0,cur+d));if(n!==cur){cur=n;render(true)}}
  function openAlbum(){
    view.hidden=false;document.body.classList.add('album-open');
    if(!opened){opened=true;cur=0;render(false)}
    requestAnimationFrame(()=>view.classList.add('show'));
    albumOpener=document.activeElement;view.querySelector('.al-close').focus();
  }
  function closeAlbum(){
    view.classList.remove('show');document.body.classList.remove('album-open');
    setTimeout(()=>{view.hidden=true},400);
    if(albumOpener&&albumOpener.focus)albumOpener.focus();
  }
  $('#album').addEventListener('click',openAlbum);
  view.querySelector('.al-close').addEventListener('click',closeAlbum);
  prev.addEventListener('click',()=>go(-1));next.addEventListener('click',()=>go(1));
  book.addEventListener('click',e=>{
    const f=e.target.closest('.face');if(!f)return;
    go(f.classList.contains('back')?-1:1);
  });
  addEventListener('keydown',e=>{
    if(view.hidden)return;
    if(e.key==='Escape')closeAlbum();
    else if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){e.preventDefault();go(1)}
    else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(-1)}
    else if(e.key==='Home'){cur=0;render(true)}
    else if(e.key==='End'){cur=N;render(true)}
  });
  let sx=null;
  view.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
  view.addEventListener('touchend',e=>{
    if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;
    if(Math.abs(dx)>50)go(dx<0?1:-1);
  },{passive:true});
})();

/* brand link: back to the home view (all chapters, top of page) */
$('.brand').addEventListener('click',e=>{
  e.preventDefault();
  if(typeof setFilter==='function'&&active!=='all')setFilter('all');
  scrollTo({top:0,behavior:'smooth'});
});


/* keep the calendar exactly one screen tall under the sticky menu */
(function(){const n=$('#nav'),f=()=>document.documentElement.style.setProperty('--navh',n.offsetHeight+'px');f();addEventListener('resize',f);addEventListener('load',f)})();

/* "The Calendar": the Art of Not Forcing Frames.
   Every photo is a full-screen leaf hinged at the top. Click and the leaf folds upward,
   like the pages of a wall calendar, and the next photograph is underneath. */
(function(){
  const ch=$('#unforced');if(!ch)return;
  const list=GALLERY.unforced;
  ch.classList.add('cal-ch');
  const pages=[{cover:true},...list.map((p,i)=>({p,i}))];
  const N=pages.length;
  const wrap=document.createElement('div');wrap.className='cal';
  wrap.innerHTML='<div class="cal-stage" tabindex="0" aria-label="Photographs as calendar pages. Click, or use the arrow keys, to turn the page."><div class="cal-bind" aria-hidden="true"></div><div class="cal-leaves"></div>'+
    '<div class="cal-ui"><span class="cal-hint">Click to turn the page</span><button class="cal-btn cal-prev" aria-label="Previous page">↓</button><button class="cal-btn cal-next" aria-label="Turn the page">↑</button></div></div>';
  const stage=wrap.querySelector('.cal-stage'),box=wrap.querySelector('.cal-leaves'),hint=wrap.querySelector('.cal-hint');
  const leaves=pages.map((o,n)=>{
    const L=document.createElement('div');L.className='leaf';
    let front;
    if(o.cover){
      front='<div class="fr fill cover"><img src="photos/unforced-cover.jpg" alt="A man photographing, pushed to the left edge of the frame" decoding="async" draggable="false">'+
        '<div class="cv-text"><span class="cv-eyebrow">Chapter</span><h3>The Art of<br>Not Forcing<br><em>Frames</em></h3><p>No grid. No thirds. No centre.</p></div></div>';
    }else{
      const p=o.p,side=o.i%2?'r':'l';
      front='<div class="fr split side-'+side+'" data-ar="'+(p.w/p.h).toFixed(4)+'"><img class="bd" data-src="photos/'+p.id+'.jpg" alt="" aria-hidden="true" draggable="false"><img class="ph" data-src="photos/'+p.id+'.jpg" alt="'+p.title+'" draggable="false">'+
        '<div class="lf-text"><span class="lf-num">'+pad(o.i+1)+'</span><span class="lf-title">'+p.title+'</span></div></div>';
    }
    L.innerHTML=front+'<div class="bk"><span>'+pad(n)+'</span></div><span class="shade"></span>';
    if(!o.cover){
      const t=tile(o.p,'unforced',1);t.classList.add('expand');t.setAttribute('aria-label','View '+o.p.title);t.querySelector('img').remove();
      L.querySelector('.fr').appendChild(t);
    }
    box.appendChild(L);return L;
  });
  ch.appendChild(wrap);

  // Calendar | Grid switch next to the photo count
  const head=ch.querySelector('.chapter-head'),count=head.querySelector('.count');
  const right=document.createElement('div');right.className='head-right';
  const sw=document.createElement('div');sw.className='view';
  sw.innerHTML='<button data-v="cal">Calendar</button><button data-v="grid">Grid</button>';
  count.replaceWith(right);right.append(count,sw);
  const setView=v=>{ch.dataset.view=v;sw.querySelectorAll('button').forEach(b=>{b.classList.toggle('on',b.dataset.v===v);b.setAttribute('aria-pressed',b.dataset.v===v)});if(v==='cal')requestAnimationFrame(layout)};
  sw.addEventListener('click',e=>{const b=e.target.closest('button');if(b)setView(b.dataset.v)});

  let cur=0,busy=false;
  const MS=1100;
  // decide, per photo, whether it fills the screen or sits flush to one side over a blurred copy
  function layout(){
    const r=box.getBoundingClientRect();if(!r.width)return;
    const sar=r.width/r.height;
    leaves.forEach(L=>{
      const fr=L.querySelector('.fr.split');if(!fr)return;
      const ar=parseFloat(fr.dataset.ar);
      fr.classList.toggle('fill',Math.abs(Math.log(ar/sar))<.3);
    });
  }
  function load(){
    for(let i=Math.max(0,cur-1);i<Math.min(N,cur+4);i++)leaves[i].querySelectorAll('img[data-src]').forEach(im=>{im.src=im.dataset.src;im.removeAttribute('data-src')});
  }
  function z(){leaves.forEach((L,i)=>{L.style.zIndex=i<cur?i:N-i})}
  function render(){
    leaves.forEach((L,i)=>L.classList.toggle('flipped',i<cur));
    wrap.querySelector('.cal-prev').disabled=cur===0;
    hint.classList.toggle('gone',cur>0);
    load();
  }
  function turn(i,up){
    const L=leaves[i];L.style.zIndex=N+5;
    setTimeout(z,MS);
    if(up&&leaves[i+1]){const nx=leaves[i+1];nx.classList.remove('rev');void nx.offsetWidth;nx.classList.add('rev')}
  }
  function next(){
    if(busy)return;
    if(cur>=N-1){ // last page: fold everything back down to the start
      busy=true;
      for(let i=cur-1;i>=0;i--){const k=i;setTimeout(()=>{leaves[k].style.zIndex=N+5+(N-k);leaves[k].classList.remove('flipped')},(cur-1-i)*70)}
      setTimeout(()=>{cur=0;z();render();busy=false},(cur)*70+MS);
      return;
    }
    busy=true;turn(cur,true);cur++;render();setTimeout(()=>{busy=false},MS*.7);
  }
  function prev(){
    if(busy||cur===0)return;
    busy=true;cur--;turn(cur,false);render();setTimeout(()=>{busy=false},MS*.7);
  }
  stage.addEventListener('click',e=>{
    if(e.target.closest('.cal-btn,.expand'))return;
    next();
  });
  wrap.querySelector('.cal-next').addEventListener('click',next);
  wrap.querySelector('.cal-prev').addEventListener('click',prev);
  stage.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key==='ArrowUp'||e.key===' '){e.preventDefault();next()}
    if(e.key==='ArrowLeft'||e.key==='ArrowDown'){e.preventDefault();prev()}
  });
  addEventListener('resize',layout);
  filters.addEventListener('click',()=>setTimeout(layout,60));
  setView('cal');z();render();layout();
})();
