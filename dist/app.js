const pages=[...document.querySelectorAll('[data-page]')],menu=document.querySelector('#menu'),menuToggle=document.querySelector('.menu-toggle');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const motionEase='cubic-bezier(.4,0,.2,1)';
let routeAnimation,routeSequence=0;
const titles={home:'Rathenauplatz Kölle',essen:'Essen & Trinken',sport:'Sport & Spaß',sitzen:'Sitzen & Genießen',anreise:'Anreise',projekt:'Über das Projekt'};
let previousFocus,closeTimer,scene=0,lastWheel=0,wheelSum=0,touchStart=null;
const home=document.querySelector('.screen-home'),pill=document.querySelector('.topic-pill');
const topics=[null,{title:'Essen &<br>Trinken',page:'essen'},{title:'Sport &<br>Spaß',page:'sport'},{title:'Sitzen &<br>Genießen',page:'sitzen'}];
function sizeCanvas(){
 document.documentElement.style.setProperty('--scale',innerWidth/402);
 const height=home.clientHeight,width=home.clientWidth;
 if(!height||!width)return;
 // Both Figma outlines share a baseline with the breathing room of the reference.
 const bottom=height-Math.max(20,height*.052);
 home.style.setProperty('--image-bottom',(height-bottom)+'px');
 const scale=Math.min((bottom-height*.12)/1096,width*.28/153.393);
 const rwidth=153.393*scale,pwidth=157.313*scale;
 const landscape=height<=500&&width>=600;
 const desktop=width>=900&&!landscape;
 const left=desktop?Math.min(84,Math.max(32,width*.04)):width*(landscape?.03:.1134);
 const gap=desktop?Math.min(36,Math.max(18,width*.018)):Math.min(width*.0344,24);
 home.style.setProperty('--rscale',scale);
 home.style.setProperty('--pscale',scale);
 home.style.setProperty('--rwidth',rwidth+'px');
 home.style.setProperty('--pwidth',pwidth+'px');
 home.style.setProperty('--p-optical-offset',(2.537*scale)+'px');
 home.style.setProperty('--word-left',left+'px');
 home.style.setProperty('--word-top',(bottom-1096*scale)+'px');
 home.style.setProperty('--platz-top',(bottom-558.398*scale)+'px');
 home.style.setProperty('--image-left',(landscape?width*.4:left+rwidth+gap)+'px');
 const photo=home.querySelector('.screen-photo');
 home.style.setProperty('--photo-h',photo.clientHeight+'px');
 home.style.setProperty('--photo-w',photo.clientWidth+'px');
}
const topicArtwork=[null,'1-imgEssenTrinken.svg','1-imgSportSpass.svg','1-imgSitzenGeniessen.svg'];
topicArtwork.filter(Boolean).forEach(src=>{const img=new Image();img.src='assets/'+src;});
function transitionTopicLabel(next,direction){
 const holder=pill.querySelector('span'),old=[...holder.children];
 const label=document.createElement('img');label.src='assets/'+topicArtwork[next];label.alt=topics[next].title.replace('<br>',' ');
 pill.setAttribute('aria-label',label.alt);label.setAttribute('aria-hidden','true');
 holder.append(label);
 if(reduce.matches){old.forEach(el=>el.remove());return;}
 old.forEach(el=>{
  const current=getComputedStyle(el),opacity=current.opacity,transform=current.transform;
  el.getAnimations().forEach(a=>a.cancel());
  el.animate([{opacity,transform},{opacity:0,transform:'translateY('+(-direction*14)+'px)'}],{duration:340,easing:motionEase,fill:'forwards'}).onfinish=()=>el.remove();
 });
 label.animate([{opacity:0,transform:'translateY('+(direction*14)+'px)'},{opacity:0,transform:'translateY('+(direction*14)+'px)',offset:.2},{opacity:1,transform:'translateY(0)'}],{duration:720,easing:motionEase});
}
function setScene(next){
 const direction=next<scene?-1:1;
 next=scene===0?(next<0?3:1):((next-1+3)%3)+1;if(next===scene)return;
 scene=next;home.classList.add('has-topic');home.dataset.scene=scene;
 document.querySelectorAll('.scene').forEach((img,i)=>img.classList.toggle('active',i===scene));
 pill.setAttribute('aria-hidden','false');pill.tabIndex=0;pill.href='#'+topics[scene].page;
 transitionTopicLabel(scene,direction);
 document.querySelector('.scene-status').textContent=topics[scene].title.replace('<br>',' ');
 const photo=home.querySelector('.screen-photo');photo.href=pill.href;photo.setAttribute('aria-label',topics[scene].title.replace('<br>',' ')+' öffnen');
}
function onHome(){return document.body.classList.contains('is-home')&&!menu.open;}
home.addEventListener('wheel',e=>{if(!onHome()||e.ctrlKey)return;e.preventDefault();const now=performance.now(),gap=now-lastWheel;lastWheel=now;if(gap>180)wheelSum=0;else if(home.dataset.wheelLocked==='true')return;home.dataset.wheelLocked='false';wheelSum+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);if(Math.abs(wheelSum)>42){setScene(scene+Math.sign(wheelSum));wheelSum=0;home.dataset.wheelLocked='true';}},{passive:false});
home.addEventListener('touchstart',e=>{if(e.touches.length===1)touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
home.addEventListener('touchmove',e=>{if(onHome()&&e.touches.length===1)e.preventDefault();},{passive:false});
home.addEventListener('touchend',e=>{if(!touchStart||!onHome())return;const dy=touchStart.y-e.changedTouches[0].clientY,dx=touchStart.x-e.changedTouches[0].clientX;if(Math.abs(dy)>35&&Math.abs(dy)>Math.abs(dx)){e.preventDefault();setScene(scene+Math.sign(dy));}touchStart=null;});
document.addEventListener('keydown',e=>{if(!onHome()||e.target.closest('button,a'))return;if(['ArrowDown','PageDown',' ','ArrowUp','PageUp','Home','End'].includes(e.key)){e.preventDefault();setScene(e.key==='Home'?1:e.key==='End'?3:scene+(['ArrowUp','PageUp'].includes(e.key)?-1:1));}});
document.querySelector('.scene-next').addEventListener('click',()=>setScene(scene+1));document.querySelector('.scene-prev').addEventListener('click',()=>setScene(scene-1));
function positionMenuReveal(){
 const r=menuToggle.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
 const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
 menu.style.setProperty('--menu-x',x+'px');menu.style.setProperty('--menu-y',y+'px');
 menu.style.setProperty('--menu-start',(r.width/2)+'px');menu.style.setProperty('--menu-radius',(radius+2)+'px');
}
window.addEventListener('resize',()=>{if(menu.open)positionMenuReveal();});
function closeMenu(){if(!menu.open)return;menu.classList.remove('is-visible');clearTimeout(closeTimer);closeTimer=setTimeout(()=>menu.close(),reduce.matches?0:640);}
menuToggle.addEventListener('click',()=>{previousFocus=document.activeElement;clearTimeout(closeTimer);positionMenuReveal();menu.showModal();document.body.classList.add('menu-open');menuToggle.setAttribute('aria-expanded','true');requestAnimationFrame(()=>requestAnimationFrame(()=>menu.classList.add('is-visible')));});
menu.querySelector('.menu-close').addEventListener('click',closeMenu);menu.addEventListener('cancel',e=>{e.preventDefault();closeMenu();});menu.addEventListener('close',()=>{document.body.classList.remove('menu-open');menuToggle.setAttribute('aria-expanded','false');previousFocus?.focus({preventScroll:true});});menu.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',closeMenu));
// Keep existing, sourced content while turning each subtopic into a disclosure card.
function card(title,nodes,id){const d=document.createElement('details');d.className='topic-card';if(id)d.id=id;const s=document.createElement('summary');s.textContent=title;const panel=document.createElement('div');panel.className='card-panel';const inner=document.createElement('div');inner.className='card-inner';nodes.forEach(n=>inner.append(n));panel.append(inner);d.append(s,panel);return d;}
pages.filter(p=>p.dataset.page!=='home').forEach(page=>{page.querySelectorAll('.jump-links,.next-page').forEach(n=>n.remove());page.querySelectorAll('.editorial').forEach(section=>{const nested=[...section.querySelectorAll('details')];nested.forEach(d=>d.remove());const articles=[...section.querySelectorAll('.numbered-list article')];articles.forEach(a=>a.remove());section.querySelectorAll('.numbered-list').forEach(n=>n.remove());section.querySelectorAll('h2 br').forEach(br=>br.replaceWith(' '));const heading=section.querySelector('h2'),name=heading?.textContent||titles[page.dataset.page];heading?.remove();const labels={'Der Biergarten.':'Biergarten','Boule spielen & Kugeln ausleihen':'Boule','Kioske & Essen in der Nähe':'Kioske & Essen in der Nähe','Der offene Bücherschrank':'Bücherschrank','Wo ist eine Toilette?':'Toiletten','Bürgergemeinschaft & Flohmarkt':'Bürgergemeinschaft & Veranstaltungen'};const container=document.createElement('div');container.className='card-list';const parent=card(labels[name]||name,[...section.childNodes],section.id);if(parent.querySelector('.card-inner').children.length)container.append(parent);articles.forEach(a=>{const head=a.querySelector('h3');const name=head.textContent;head.remove();container.append(card(name,[...a.childNodes]));});nested.forEach(d=>{const summary=d.querySelector('summary'),name=summary.textContent;summary.remove();const labels={'Wie kann ich bezahlen?':'Bezahlung','Kann ich einen Tisch reservieren?':'Reservierungen','Gibt es WLAN?':'WLAN','Wie funktioniert Boule?':'Spielregeln','Kann ich einfach mitmachen?':'Mitspielen','Muss ich ein Buch tauschen?':'Bücher mitnehmen','Wohin mit meinen Büchern?':'Bücher abgeben','Wann ist der nächste Flohmarkt?':'Flohmarkt'};const heading=document.createElement('h3');heading.textContent=labels[name]||name;const body=parent.querySelector('.card-inner');body.append(heading,...d.childNodes);});section.replaceWith(container);});});
const sportPage=document.querySelector('[data-page="sport"] .content');
const sportCards=[...sportPage.querySelectorAll('.topic-card')];
const playground=sportCards.find(d=>d.querySelector('summary').textContent==='Spielplätze');
const overview=sportCards.find(d=>d.querySelector('summary').textContent==='Spielplätze & Sport');
if(playground&&overview){playground.querySelector('.card-inner').append(...overview.querySelector('.card-inner').childNodes);overview.remove();sportPage.insertBefore(playground,sportPage.querySelector('.card-list'));}
// Independent desktop columns; restore the original topic order on mobile.
const wideTopics=matchMedia('(min-width:900px)');
pages.filter(page=>page.dataset.page!=='home').forEach(page=>{
 const content=page.querySelector('.content'),cards=[...content.querySelectorAll('.topic-card')];
 if(!cards.length)return;
 const grid=document.createElement('div');
 grid.className='topic-grid';
 if(cards.length===1)grid.classList.add('single-topic');
 grid.append(...cards);
 content.querySelectorAll('.card-list').forEach(list=>list.remove());
 content.append(grid);
 content.classList.add('has-topics');
 const columns=Array.from({length:2},()=>{const column=document.createElement('div');column.className='topic-column';return column;});
 function arrangeCards(){
  const focus=document.activeElement,restoreFocus=grid.contains(focus);
  if(wideTopics.matches&&cards.length>1){
   cards.forEach((card,index)=>columns[index%2].append(card));
   grid.replaceChildren(...columns);
  }else grid.replaceChildren(...cards);
  if(restoreFocus)focus.focus({preventScroll:true});
 }
 wideTopics.addEventListener('change',arrangeCards);
 arrangeCards();
});
document.querySelectorAll('.topic-card').forEach(d=>{
 const summary=d.querySelector('summary'),panel=d.querySelector('.card-panel'),inner=panel.firstElementChild;
 const arrow=document.createElement('img');arrow.className='disclosure-arrow';arrow.src='assets/chevron.svg';arrow.alt='';summary.append(arrow);
 summary.setAttribute('aria-expanded',String(d.open));
 let heightAnimation,textAnimation;
 summary.addEventListener('click',e=>{
  e.preventDefault();
  const wasOpen=d.open,from=wasOpen?panel.getBoundingClientRect().height:0;
  const style=getComputedStyle(inner),opacity=wasOpen?style.opacity:'0',transform=wasOpen?style.transform:'translateY(-8px)';
  heightAnimation?.cancel();textAnimation?.cancel();
  const opening=!d.classList.contains('expanded');
  d.open=true;d.classList.toggle('expanded',opening);summary.setAttribute('aria-expanded',String(opening));
  if(reduce.matches){d.open=opening;return;}
  const to=opening?inner.getBoundingClientRect().height:0;
  heightAnimation=panel.animate([{height:from+'px'},{height:to+'px'}],{duration:700,easing:motionEase});
  textAnimation=inner.animate([{opacity,transform},{opacity:opening?1:0,transform:opening?'translateY(0)':'translateY(-8px)'}],{duration:opening?620:380,easing:motionEase,fill:'forwards'});
  heightAnimation.onfinish=()=>{d.open=opening;heightAnimation=null;textAnimation?.cancel();textAnimation=null;};
 });
});
async function route(){const sequence=++routeSequence;const departing=pages.find(p=>!p.hidden);let[page,anchor]=location.hash.slice(1).split('/');if(!Object.hasOwn(titles,page))page='home';closeMenu();if(departing&&departing.dataset.page!==page&&!reduce.matches){const opacity=getComputedStyle(departing).opacity;routeAnimation?.cancel();routeAnimation=departing.animate([{opacity},{opacity:0}],{duration:240,easing:motionEase,fill:'forwards'});await routeAnimation.finished.catch(()=>{});if(sequence!==routeSequence)return;}pages.forEach(p=>p.hidden=p.dataset.page!==page);document.body.classList.toggle('is-home',page==='home');document.title=titles[page]+(page==='home'?'':' · Rathenauplatz Kölle');document.querySelectorAll('.menu-item').forEach(a=>a.toggleAttribute('aria-current',a.hash==='#'+page));sizeCanvas();const entering=pages.find(p=>p.dataset.page===page);routeAnimation?.cancel();if(departing!==entering&&!reduce.matches){routeAnimation=entering.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:640,easing:motionEase});}requestAnimationFrame(()=>{window.scrollTo({top:0,behavior:'instant'});const target=anchor&&document.getElementById(anchor);if(target&&target.closest('[data-page]')?.dataset.page===page){if(target.matches('details')){target.open=true;target.classList.add('expanded');target.querySelector('summary').setAttribute('aria-expanded','true');}target.scrollIntoView({behavior:'smooth'});}else if(page!=='home'){const h=document.querySelector('[data-page="'+page+'"] h1');h.tabIndex=-1;h.focus({preventScroll:true});}});}
window.addEventListener('resize',sizeCanvas);window.addEventListener('hashchange',route);route();

// Optimized photographs supplied for each category.
const galleryImages={"essen":[{"src":"assets/photos/photo-0-1600.webp","srcset":"assets/photos/photo-0-800.webp 800w, assets/photos/photo-0-1600.webp 1600w","alt":"Gäste unter den Bäumen im Biergarten","tone":"summer"},{"src":"assets/photos/photo-3-1600.webp","srcset":"assets/photos/photo-3-800.webp 800w, assets/photos/photo-3-1600.webp 1600w","alt":"Ein Glas Kölsch auf einem Tisch im Biergarten","tone":"summer"},{"src":"assets/photos/photo-1-1600.webp","srcset":"assets/photos/photo-1-800.webp 800w, assets/photos/photo-1-1600.webp 1600w","alt":"Brot, Käse und Wein auf einem Biergartentisch","tone":"summer"},{"src":"assets/photos/photo-2-1600.webp","srcset":"assets/photos/photo-2-800.webp 800w, assets/photos/photo-2-1600.webp 1600w","alt":"Biergartentische unter grünen Bäumen","tone":"summer"}],"sport":[{"src":"assets/photos/photo-14-1600.webp","srcset":"assets/photos/photo-14-800.webp 800w, assets/photos/photo-14-1600.webp 1600w","alt":"Klettergerüst auf dem Spielplatz","tone":"autumn"},{"src":"assets/photos/photo-16-1600.webp","srcset":"assets/photos/photo-16-800.webp 800w, assets/photos/photo-16-1600.webp 1600w","alt":"Tischtennisplatte am Rathenauplatz","tone":"autumn"},{"src":"assets/photos/photo-17-1600.webp","srcset":"assets/photos/photo-17-800.webp 800w, assets/photos/photo-17-1600.webp 1600w","alt":"Eine Gruppe beim Boulespiel","tone":"summer"},{"src":"assets/photos/photo-12-1600.webp","srcset":"assets/photos/photo-12-800.webp 800w, assets/photos/photo-12-1600.webp 1600w","alt":"Spielfläche vor den Häusern am Rathenauplatz","tone":"autumn"},{"src":"assets/photos/photo-11-1600.webp","srcset":"assets/photos/photo-11-800.webp 800w, assets/photos/photo-11-1600.webp 1600w","alt":"Weg und Spielfläche unter den Bäumen","tone":"autumn"},{"src":"assets/photos/photo-13-1600.webp","srcset":"assets/photos/photo-13-800.webp 800w, assets/photos/photo-13-1600.webp 1600w","alt":"Weg am Rand des Spielplatzes","tone":"autumn"},{"src":"assets/photos/photo-15-1600.webp","srcset":"assets/photos/photo-15-800.webp 800w, assets/photos/photo-15-1600.webp 1600w","alt":"Freie Spielfläche unter Bäumen","tone":"autumn"}],"sitzen":[{"src":"assets/photos/photo-8-1600.webp","srcset":"assets/photos/photo-8-800.webp 800w, assets/photos/photo-8-1600.webp 1600w","alt":"Goldgelbes Laub an einem Baum am Platz","tone":"autumn"},{"src":"assets/photos/photo-9-1600.webp","srcset":"assets/photos/photo-9-800.webp 800w, assets/photos/photo-9-1600.webp 1600w","alt":"Bänke unter herbstlichen Bäumen","tone":"autumn"},{"src":"assets/photos/photo-10-1600.webp","srcset":"assets/photos/photo-10-800.webp 800w, assets/photos/photo-10-1600.webp 1600w","alt":"Grünfläche und Bäume im Herbst","tone":"autumn"},{"src":"assets/photos/photo-5-1600.webp","srcset":"assets/photos/photo-5-800.webp 800w, assets/photos/photo-5-1600.webp 1600w","alt":"Sonnenlicht zwischen den Bäumen am Platz","tone":"autumn"},{"src":"assets/photos/photo-6-1600.webp","srcset":"assets/photos/photo-6-800.webp 800w, assets/photos/photo-6-1600.webp 1600w","alt":"Herbstbäume und Wege am Rathenauplatz","tone":"autumn"},{"src":"assets/photos/photo-7-1600.webp","srcset":"assets/photos/photo-7-800.webp 800w, assets/photos/photo-7-1600.webp 1600w","alt":"Blick über den Platz im Herbst","tone":"autumn"},{"src":"assets/photos/photo-4-1600.webp","srcset":"assets/photos/photo-4-800.webp 800w, assets/photos/photo-4-1600.webp 1600w","alt":"Menschen auf Bänken und Grünflächen am Rathenauplatz","tone":"summer"}],"anreise":[],"projekt":[]};
pages.filter(p=>p.dataset.page!=='home').forEach(p=>{
 const photos=galleryImages[p.dataset.page],gallery=document.createElement('section');
 gallery.className='page-gallery';gallery.setAttribute('aria-label','Bildgalerie');
 gallery.innerHTML='<div class="gallery-stage"><p class="gallery-empty">Bilder folgen</p></div><div class="gallery-controls"><button type="button" aria-label="Vorheriges Bild"><img src="assets/arrow-back.svg" alt=""></button><button type="button" aria-label="Nächstes Bild"><img src="assets/arrow-forward.svg" alt=""></button></div>';
 const stage=gallery.querySelector('.gallery-stage');let current=0,requested=0,requestId=0,swipeStart=null;
 const slides=photos.map((photo,i)=>{const img=document.createElement('img');img.srcset=photo.srcset;img.sizes='(min-width:1200px) 64vw, 92vw';img.src=photo.src;img.alt=photo.alt;img.dataset.tone=photo.tone;img.setAttribute('aria-hidden',String(i!==0));img.loading='lazy';img.decoding='async';img.className='gallery-slide';img.classList.toggle('active',i===0);stage.append(img);return img;});
 if(photos.length)gallery.querySelector('.gallery-empty').remove();
 const buttons=gallery.querySelectorAll('button');buttons.forEach(b=>b.disabled=photos.length<2);
 async function show(delta){
  if(slides.length<2)return;
  requested=(requested+delta+slides.length)%slides.length;const next=requested,id=++requestId;
  slides[next].loading='eager';try{await slides[next].decode();}catch{return;}
  if(id!==requestId)return;
  stage.style.setProperty('--slide-direction',delta);current=next;
  slides.forEach((img,i)=>{img.classList.toggle('active',i===current);img.setAttribute('aria-hidden',String(i!==current));});
 }
 stage.addEventListener('touchstart',e=>{if(e.touches.length===1)swipeStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
 stage.addEventListener('touchend',e=>{if(!swipeStart)return;const x=e.changedTouches[0].clientX-swipeStart.x,y=e.changedTouches[0].clientY-swipeStart.y;if(Math.abs(x)>45&&Math.abs(x)>Math.abs(y))show(x<0?1:-1);swipeStart=null;},{passive:true});
 buttons[0].addEventListener('click',()=>show(-1));buttons[1].addEventListener('click',()=>show(1));
 p.querySelector('.content').append(gallery);
});
// Direction and shape distinguish navigation, external links and disclosure.
document.querySelectorAll('a .inline-arrow').forEach(img=>{const a=img.closest('a');img.src=a.classList.contains('back-link')?'assets/arrow-back.svg':a.target==='_blank'?'assets/arrow-external.svg':'assets/arrow-forward.svg';img.classList.add('action-arrow');});
