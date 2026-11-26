'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const defaults = [{"id":"xiamu","avatar":"","bio":"","dish":"","services":"","fit":"contain","position":50,"name":"夏沐","role":"店長","photo":"assets/staff-xiamu.jpg","quote":"能看到我穿女僕裝的主人……那一整天都會有好運喔～♥","threads":"https://www.threads.com/@xiayuening_","photos":["assets/staff-xiamu.jpg"]},{"id":"miarica","avatar":"","bio":"","dish":"","services":"","fit":"contain","position":50,"name":"彌亞璃卡","role":"副店長","photo":"assets/staff-miarica.webp","quote":"大家都在工作時，就看不到彌亞偷懶了對吧～","threads":"https://www.threads.com/@miiarica_3765","photos":["assets/staff-miarica.webp"]},{"id":"xiaoyan","avatar":"","bio":"","dish":"","services":"","fit":"contain","position":50,"name":"小顏","role":"女僕長","photo":"assets/staff-xiaoyan.webp","quote":"這副眼鏡，是為了更清晰地捕捉你的笑容。","threads":"https://www.threads.com/@kogao_ffxiv","photos":["assets/staff-xiaoyan.webp"]},{"id":"yuehongxue","avatar":"","bio":"","dish":"","services":"","fit":"contain","position":50,"name":"玥紅雪","role":"女僕","photo":"assets/staff-yuehongxue.webp","quote":"平時有點金魚腦，再麻煩大家多照顧一下～！","threads":"https://www.threads.com/@luo_enlei","photos":["assets/staff-yuehongxue.webp"]},{"id":"naipa","avatar":"","bio":"","dish":"","services":"","fit":"contain","position":50,"name":"Naipa","role":"女僕","photo":"assets/staff-naipa.webp","quote":"在跟大家打高難的時候，我家的龍會後跳後墜星衝喔；至於衝到哪……","threads":"https://www.threads.com/@na_.naipa._pa","photos":["assets/staff-naipa.webp"]},{"id":"cang","avatar":"","bio":"","dish":"","services":"","fit":"contain","position":50,"name":"蒼","role":"樂手","photo":"assets/staff-cang.jpg","quote":"比起一般的言語，我比較相信音樂更易打動人心，要賞面來聽一曲嗎？","threads":"https://www.threads.com/@ao_01092026","photos":["assets/staff-cang.jpg"]}];
  let overrides = {};
  let members = [];
  let rosterReady = false;
  let duty = [];
  let selected='xiamu', photoIndex=0, onlyDuty=false, currentPage='', editorId='noi', draft=null, dirty=false, uploading=false, toastTimer;
  function rebuild() { members=defaults.map(m=>({...m,...overrides[m.id],id:m.id})); }
  rebuild();
  function member(id) { return members.find(m=>m.id===id) || members[0]; }
  function safeUrl(url) { try {const u=new URL(url);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}}
  function toast(text) { $('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3500); }
  function image(src,alt) { const img=document.createElement('img');img.src=src;img.alt=alt;return img; }
  function labelText(tag,text) {const node=document.createElement(tag);node.textContent=text;return node;}
  function visibleMembers() { return members.filter(m=>!onlyDuty||duty.includes(m.id)); }
  function sharePreviewMembers(){document.dispatchEvent(new CustomEvent('ephemere:members-updated',{detail:members.map(m=>({id:m.id,name:m.name,role:m.role,avatar:m.avatar,photos:[...(m.photos||[])],homeCover:m.homeCover,fit:m.fit,position:m.position,quote:m.quote,bio:m.bio,dish:m.dish}))}));}
  document.addEventListener('ephemere:request-members',sharePreviewMembers);
  document.addEventListener('ephemere:select-member',event=>{if(!members.some(m=>m.id===event.detail))return;filter(false);selectMember(event.detail);location.hash='members';});
  function renderLists() {
    $('memberList').replaceChildren();
    for (const m of visibleMembers()) {
      const b=document.createElement('button');b.type='button';b.className='member-choice';b.dataset.member=m.id;b.style.setProperty('--choice-color',MemberColors.resolve(m.name,m.representativeColor));b.setAttribute('aria-pressed',String(m.id===selected));
      if (m.avatar) b.append(image(m.avatar,''));if (!m.avatar) b.append(labelText('i',m.name.slice(0,1)));b.append(labelText('span',m.name));b.addEventListener('click',()=>selectMember(m.id));$('memberList').append(b);
    }
    $('homeCast').replaceChildren();
    for (const id of duty) {
      const m=member(id);const b=document.createElement('button');b.type='button';b.className='cast-card';b.setAttribute('aria-label',`認識${m.name}`);
      if (m.avatar) b.append(image(m.avatar,''));const copy=document.createElement('span');copy.append(labelText('strong',m.name),labelText('small',m.role));b.append(copy);b.addEventListener('click',()=>{onlyDuty=false;selectMember(id);location.hash='members';});$('homeCast').append(b);
    }
    sharePreviewMembers();
  }
  function selectMember(id,animate=true) {
    const apply=(legacy=false)=>{
      selected=id;photoIndex=0;renderMember(legacy);
      document.querySelectorAll('.member-choice').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.member===id)));
    };
    if(animate && window.CafeMotion) window.CafeMotion.switchMember(member(id)?.photos?.[0],apply);
    else apply(animate);
  }
  function renderPhoto() {
    const m=member(selected);const photos=Array.isArray(m.photos)?m.photos:[];photoIndex=photos.length?((photoIndex%photos.length)+photos.length)%photos.length:0;
    if(m.photoMeta?.[photoIndex]?.compositionVersion!==2)PhotoCameraV152.clear($('portrait'));
    $('portrait').hidden=!photos.length;$('missingPhoto').hidden=!!photos.length;$('portraitOpen').disabled=!photos.length;
    $('portraitOpen').classList.toggle('has-managed-zoom',Number(m.profileZoom)>100);if(photos.length){$('portrait').src=photos[photoIndex];$('portrait').alt=`${m.name}的介紹照片 ${photoIndex+1}`;$('portrait').style.objectFit=m.fit==='cover'?'cover':'contain';$('portrait').style.objectPosition=`${Math.max(0,Math.min(100,(Number.isFinite(Number(m.profileX))?Number(m.profileX):50)))}% ${Number(m.position)||0}%`;$('portrait').style.transformOrigin=$('portrait').style.objectPosition;$('portrait').style.transform=`scale(${Math.max(100,Math.min(220,Number(m.profileZoom)||100))/100})`;}
    else $('portrait').removeAttribute('src');
    const meta=m.photoMeta?.[photoIndex];if(meta){const clamp=(v,a,b,d)=>Number.isFinite(Number(v))?Math.min(b,Math.max(a,Number(v))):d;const x=clamp(meta.x,0,100,50),y=clamp(meta.y,0,100,50),zoom=clamp(meta.zoom,1,2.5,1);$('portrait').style.objectFit=meta.fit==='contain'?'contain':'cover';$('portrait').style.objectPosition=x+'% '+y+'%';$('portrait').style.transformOrigin=x+'% '+y+'%';$('portrait').style.transform='scale('+zoom+') rotate('+clamp(meta.rotate,-30,30,0)+'deg)';$('portraitOpen').classList.toggle('has-managed-zoom',zoom>1);}
    if(meta?.compositionVersion===2)PhotoCameraV152.render($('portrait'),meta);
    $('photoCount').textContent=photos.length?`${photoIndex+1} / ${photos.length}`:'尚無照片';
    const pauseControl=$('memberGalleryPause');if(pauseControl)pauseControl.hidden=photos.length<2||m.galleryAuto===false;
    $('previousPhoto').disabled=$('nextPhoto').disabled=photos.length<2;$('morePhotos').hidden=!photos.length;
  }
  function renderMember(animate=false) {
    const active=member(selected);const accent=MemberColors.resolve(active.name,active.representativeColor);const stage=document.querySelector('#page-members .member-stage');stage.style.setProperty('--member-color',accent);stage.style.setProperty('--member-tint',MemberColors.tint(accent,document.documentElement.dataset.theme==='dark'));
    $('stageName').textContent=active.name;
    $('stageSmallName').textContent=active.name;
    $('stageRole').textContent=active.role;
    $('page-members').classList.toggle('long-name',active.name.length>4);
    $('page-members').classList.remove('stage-switch');
    if(animate)requestAnimationFrame(()=>$('page-members').classList.add('stage-switch'));
    const m=member(selected);$('portraitName').textContent=$('detailName').textContent=m.name;$('portraitRole').textContent=$('detailRole').textContent=m.role;
    $('detailBio').textContent=m.bio||'';$('detailBio').hidden=!m.bio;
    $('detailQuote').textContent=m.quote;$('detailQuote').hidden=!m.quote;
    $('detailDish').textContent=m.dish;$('recommendation').hidden=!m.dish;
    $('detailServices').textContent=m.services;$('serviceBlock').hidden=!m.services;
    const url=safeUrl(m.threads);$('detailThreads').hidden=!url;if(url)$('detailThreads').href=url;else $('detailThreads').removeAttribute('href');
    $('memberSource').hidden=true;
    renderPhoto();
    document.dispatchEvent(new CustomEvent('ephemere:member-selected',{detail:{id:m.id,name:m.name}}));
    if(animate){$('memberDetail').classList.remove('animate');requestAnimationFrame(()=>$('memberDetail').classList.add('animate'));}
  }
  function filter(value) {
    onlyDuty=value;if(!visibleMembers().some(m=>m.id===selected))selectMember(visibleMembers()[0].id);
    $('allMembers').setAttribute('aria-pressed',String(!value));$('dutyMembers').setAttribute('aria-pressed',String(value));$('filterNote').textContent=value?'本次出勤名單':'點選名字切換成員';renderLists();
  }
  $('allMembers').addEventListener('click',()=>filter(false));$('dutyMembers').addEventListener('click',()=>filter(true));
  $('previousPhoto').addEventListener('click',()=>{photoIndex--;renderPhoto();});$('nextPhoto').addEventListener('click',()=>{photoIndex++;renderPhoto();});
  function openImage(src,alt) { $('largeImage').src=src;$('largeImage').alt=alt||'照片大圖';if(!$('imageDialog').open)$('imageDialog').showModal(); }
  let galleryPaused=false;const pauseGallery=document.createElement('button');pauseGallery.type='button';pauseGallery.id='memberGalleryPause';pauseGallery.hidden=true;pauseGallery.textContent='暫停輪播';pauseGallery.setAttribute('aria-pressed','false');$('photoCount').after(pauseGallery);pauseGallery.onclick=()=>{galleryPaused=!galleryPaused;pauseGallery.textContent=galleryPaused?'播放輪播':'暫停輪播';pauseGallery.setAttribute('aria-pressed',String(galleryPaused));};
  setInterval(()=>{const m=member(selected);pauseGallery.hidden=m.photos.length<2||m.galleryAuto===false;if(!document.hidden&&location.hash==='#members'&&!galleryPaused&&m.galleryAuto!==false&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&m.photos.length>1&&!document.querySelector('dialog[open]')){photoIndex++;renderPhoto();}},6000);
  $('portraitOpen').addEventListener('click',()=>{const m=member(selected);if(m.photos.length)openImage(m.photos[photoIndex],`${m.name}的介紹照片`);});
  $('morePhotos').addEventListener('click',()=>$('portraitOpen').click());
  document.querySelectorAll('.sample-open:not(#studioOpen)').forEach(b=>b.addEventListener('click',()=>openImage(b.dataset.photo,b.querySelector('img').alt)));
  document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.dialog-close')?.addEventListener('click',()=>d.close());d.addEventListener('click',event=>{if(event.target!==d)return;const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)d.close('cancel');});});
  $('eventOpen').addEventListener('click',()=>$('eventDialog').showModal());
  $('copyAddress').addEventListener('click',async()=>{const address=[document.querySelector('.visit-letter>p').innerText,document.querySelector('.visit-letter h2').innerText].join(' ').replace(/\s+/g,' ').trim();try{await navigator.clipboard.writeText(address);toast('地址已複製');window.CafeMotion?.addressCopied();}catch{prompt('請複製以下地址：',address);}});
  async function route() {
    const aliases={top:'home',staff:'members',service:'menu-photo',polaroids:'menu-photo',location:'visit',reservation:'visit'};const hash=aliases[location.hash.slice(1)]||location.hash.slice(1);const page=hash==='menu-studio'?'studio':hash.startsWith('menu-')?'menu':['home','members','menu','visit','rules','guestbook','studio','about'].includes(hash)?(hash==='about'?'home':hash):'home';
    document.querySelectorAll('.page').forEach(p=>p.hidden=p.id!==`page-${page}`);document.querySelectorAll('[data-page]').forEach(a=>{a.classList.toggle('active',a.dataset.page===(page==='menu'&&['menu-photo','menu-studio'].includes(hash)?'services':page));if(a.dataset.page===(page==='menu'&&['menu-photo','menu-studio'].includes(hash)?'services':page))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    $('navigation').classList.remove('open');$('menuToggle').setAttribute('aria-expanded','false');
    if(currentPage!==page)window.scrollTo({top:0,behavior:'instant'});
    currentPage=page;document.title=page==='home' ? '曇時 Cafe l’Éphémère｜FFXIV 女僕咖啡廳' : `${{members:'成員介紹',menu:'菜單與服務',studio:'攝影棚',rules:'店內規則',guestbook:'留言',visit:'來店資訊'}[page]}｜曇時 Cafe l’Éphémère`;
    if(hash==='about')requestAnimationFrame(()=>$('officialAbout').scrollIntoView());
    if(hash.startsWith('menu-') && !$(hash)?.matches('[role=tabpanel]'))requestAnimationFrame(()=>$(hash)?.scrollIntoView());
  }
  window.addEventListener('hashchange',route);
  $('menuToggle').addEventListener('click',()=>{$('menuToggle').setAttribute('aria-expanded',String($('navigation').classList.toggle('open')));});
  function setTheme(dark){document.documentElement.dataset.theme=dark?'dark':'light';$('themeToggle').textContent=dark?'切換淺色':'切換深色';$('themeToggle').setAttribute('aria-pressed',String(dark));try{localStorage.setItem('lephemere-official-theme',dark?'dark':'light');}catch{}}
  new MutationObserver(()=>{const m=member(selected);document.querySelector('#page-members .member-stage').style.setProperty('--member-tint',MemberColors.tint(MemberColors.resolve(m.name,m.representativeColor),document.documentElement.dataset.theme==='dark'));}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});let initialDark=false;try{initialDark=localStorage.getItem('lephemere-official-theme')==='dark';}catch{}setTheme(initialDark);$('themeToggle').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme!=='dark'));
  window.ephemereStaffDirectory={
    get rosterReady(){return rosterReady;},
    syncRoster(roster){
      const rows=Object.entries(roster||{}).map(([id,entry],index)=>({id,entry,index})).filter(r=>r.entry.name&&r.entry.websiteVisible!==false).sort((a,b)=>Number(a.entry.sortOrder||(a.index+1))-Number(b.entry.sortOrder||(b.index+1)));
      rosterReady=true;
      if(!rows.length){sharePreviewMembers();return;}
      const previous=member(selected)?.name;
      members=rows.map(({id,entry})=>{const fallback=defaults.find(m=>m.name===entry.name)||{};const photo=String(entry.photo||fallback.photo||'');const layout=entry.photoLayout?.profile||{};const gallery=Array.isArray(entry.photos)?entry.photos.slice(0,8).map(p=>typeof p==='string'?{src:p}:p).filter(p=>p&&typeof p.src==='string'&&(/^https:\/\//i.test(p.src)||/^assets\/[\w./-]+\.(png|jpe?g|webp|avif)$/i.test(p.src))):[];return {id,name:entry.name,representativeColor:MemberColors.resolve(entry.name,entry.representativeColor),homeCover:gallery[0]?.src||entry.photo||'',role:entry.role||'駐店成員',avatar:/^https:\/\//i.test(entry.chibiPhoto||'')?entry.chibiPhoto:(window.ephemereChibiCast?.get(entry.name)||photo),photos:gallery.length?gallery.map(p=>p.src):(photo?[photo]:[]),photoMeta:gallery,galleryAuto:entry.galleryAuto!==false,bio:entry.bio||'',quote:entry.quote||fallback.quote||'',threads:entry.threads||fallback.threads||'',dish:entry.dish||'',services:entry.services||'',fit:entry.photoFit==='contain'?'contain':'cover',position:Number.isFinite(Number(layout.y))?Number(layout.y):50,profileX:Number.isFinite(Number(layout.x))?Number(layout.x):50,profileZoom:Number(layout.zoom)||100};});
      if(!members.some(m=>m.id===selected))selected=members.find(m=>m.name===previous)?.id||members[0].id;
      renderLists();renderMember();document.getElementById('integrationStatus').textContent='已接上官網成員資料';
    },
    openByName(name){const m=members.find(m=>m.name===name);if(!m)return false;filter(false);selectMember(m.id);location.hash='members';return true;}
  };
  const scheduleObserver=new MutationObserver(()=>{const names=[...document.querySelectorAll('#homeShiftList .home-shift-copy strong')].map(n=>n.textContent);duty=members.filter(m=>names.includes(m.name)).map(m=>m.id);$('dutyMembers').disabled=!duty.length;$('dutyMembers').textContent=duty.length?'本次出勤':'出勤尚未公布';if(onlyDuty&&!duty.length)onlyDuty=false;filter(onlyDuty);});
  scheduleObserver.observe($('homeShiftList'),{childList:true,subtree:true});$('dutyMembers').disabled=true;
  renderLists();renderMember();route();
})();

