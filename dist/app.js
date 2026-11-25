const pages=[...document.querySelectorAll('[data-page]')],menu=document.querySelector('#menu'),menuToggle=document.querySelector('.menu-toggle');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
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
 home.style.setProperty('--word-left',left+'px');
 home.style.setProperty('--word-top',(bottom-1096*scale)+'px');
 home.style.setProperty('--platz-top',(bottom-558.398*scale)+'px');
 home.style.setProperty('--image-left',(landscape?width*.4:left+rwidth+gap)+'px');
 const photo=home.querySelector('.screen-photo');
 home.style.setProperty('--photo-h',photo.clientHeight+'px');
 home.style.setProperty('--photo-w',photo.clientWidth+'px');
}
function setScene(next){next=scene===0?(next<0?3:1):((next-1+3)%3)+1;if(next===scene)return;scene=next;home.classList.toggle('has-topic',scene>0);home.dataset.scene=scene;document.querySelectorAll('.scene').forEach((img,i)=>img.classList.toggle('active',i===scene));pill.setAttribute('aria-hidden',String(scene===0));pill.tabIndex=scene?0:-1;if(scene){pill.href='#'+topics[scene].page;const label=document.createElement('img');label.src='assets/'+[null,'1-imgEssenTrinken.svg','1-imgSportSpass.svg','1-imgSitzenGeniessen.svg'][scene];label.alt=topics[scene].title.replace('<br>',' ');pill.querySelector('span').replaceChildren(label);if(!reduce.matches)pill.querySelector('span').animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'ease-out'});}document.querySelector('.scene-status').textContent=scene?topics[scene].title.replace('<br>',' '):'Rathenauplatz Kölle';const photo=home.querySelector('.screen-photo');photo.href='#'+topics[scene].page;photo.setAttribute('aria-label',topics[scene].title.replace('<br>',' ')+' öffnen');}
function onHome(){return document.body.classList.contains('is-home')&&!menu.open;}
home.addEventListener('wheel',e=>{if(!onHome()||e.ctrlKey)return;e.preventDefault();const now=performance.now(),gap=now-lastWheel;lastWheel=now;if(gap>180)wheelSum=0;else if(home.dataset.wheelLocked==='true')return;home.dataset.wheelLocked='false';wheelSum+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);if(Math.abs(wheelSum)>42){setScene(scene+Math.sign(wheelSum));wheelSum=0;home.dataset.wheelLocked='true';}},{passive:false});
home.addEventListener('touchstart',e=>{if(e.touches.length===1)touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
home.addEventListener('touchmove',e=>{if(onHome()&&e.touches.length===1)e.preventDefault();},{passive:false});
home.addEventListener('touchend',e=>{if(!touchStart||!onHome())return;const dy=touchStart.y-e.changedTouches[0].clientY,dx=touchStart.x-e.changedTouches[0].clientX;if(Math.abs(dy)>35&&Math.abs(dy)>Math.abs(dx)){e.preventDefault();setScene(scene+Math.sign(dy));}touchStart=null;});
document.addEventListener('keydown',e=>{if(!onHome()||e.target.closest('button,a'))return;if(['ArrowDown','PageDown',' ','ArrowUp','PageUp','Home','End'].includes(e.key)){e.preventDefault();setScene(e.key==='Home'?1:e.key==='End'?3:scene+(['ArrowUp','PageUp'].includes(e.key)?-1:1));}});
document.querySelector('.scene-next').addEventListener('click',()=>setScene(scene+1));document.querySelector('.scene-prev').addEventListener('click',()=>setScene(scene-1));
function closeMenu(){if(!menu.open)return;menu.classList.remove('is-visible');clearTimeout(closeTimer);closeTimer=setTimeout(()=>menu.close(),reduce.matches?0:520);}
menuToggle.addEventListener('click',()=>{previousFocus=document.activeElement;clearTimeout(closeTimer);menu.showModal();document.body.classList.add('menu-open');menuToggle.setAttribute('aria-expanded','true');requestAnimationFrame(()=>requestAnimationFrame(()=>menu.classList.add('is-visible')));});
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
document.querySelectorAll('.topic-card').forEach(d=>{const s=d.querySelector('summary'),panel=d.querySelector('.card-panel');let animation;s.addEventListener('click',e=>{e.preventDefault();const from=panel.getBoundingClientRect().height;const opacity=getComputedStyle(panel).opacity;animation?.cancel();const opening=!d.classList.contains('expanded');d.open=true;d.classList.toggle('expanded',opening);s.setAttribute('aria-expanded',String(opening));const to=opening?panel.firstElementChild.getBoundingClientRect().height:0;if(reduce.matches){d.open=opening;return;}animation=panel.animate([{height:from+'px',opacity:d.open&&from>0?opacity:0},{height:to+'px',opacity:opening?1:0}],{duration:360,easing:'cubic-bezier(.2,.7,.2,1)'});animation.onfinish=()=>{d.open=opening;animation=null;};});});
function route(){let[page,anchor]=location.hash.slice(1).split('/');if(!Object.hasOwn(titles,page))page='home';closeMenu();pages.forEach(p=>p.hidden=p.dataset.page!==page);document.body.classList.toggle('is-home',page==='home');document.title=titles[page]+(page==='home'?'':' · Rathenauplatz Kölle');document.querySelectorAll('.menu-item').forEach(a=>a.toggleAttribute('aria-current',a.hash==='#'+page));sizeCanvas();requestAnimationFrame(()=>{window.scrollTo({top:0,behavior:'instant'});const target=anchor&&document.getElementById(anchor);if(target&&target.closest('[data-page]')?.dataset.page===page){if(target.matches('details')){target.open=true;target.classList.add('expanded');target.querySelector('summary').setAttribute('aria-expanded','true');}target.scrollIntoView({behavior:'smooth'});}else if(page!=='home'){const h=document.querySelector('[data-page="'+page+'"] h1');h.tabIndex=-1;h.focus({preventScroll:true});}});}
window.addEventListener('resize',sizeCanvas);window.addEventListener('hashchange',route);route();

// Empty galleries are ready for the supplied photographs.
pages.filter(p=>p.dataset.page!=='home').forEach(p=>{
 const gallery=document.createElement('section');gallery.className='page-gallery';gallery.setAttribute('aria-label','Bildgalerie');
 gallery.innerHTML='<div class="gallery-slots" aria-hidden="true"><div></div><div></div><div></div></div><p>Bilder folgen</p>';
 p.querySelector('.content').append(gallery);
});
// Direction and shape distinguish navigation, external links and disclosure.
document.querySelectorAll('a .inline-arrow').forEach(img=>{const a=img.closest('a');img.src=a.classList.contains('back-link')?'assets/arrow-back.svg':a.target==='_blank'?'assets/arrow-external.svg':'assets/arrow-forward.svg';img.classList.add('action-arrow');});
