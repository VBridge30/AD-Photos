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
