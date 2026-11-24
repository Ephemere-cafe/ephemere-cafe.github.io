'use strict';
(() => {
  const $=id=>document.getElementById(id);
  const text=(tag,value,className)=>{const n=document.createElement(tag);n.textContent=value||'';if(className)n.className=className;return n;};
  const safeImage=value=>{const s=String(value||'');if(/^assets\/[a-z0-9._/-]+$/i.test(s))return s;try{const u=new URL(s);return u.protocol==='https:'?u.href:'';}catch{return '';}};
  if(['127.0.0.1','localhost'].includes(location.hostname))document.documentElement.dataset.localPreview='true';
  function openImage(src,alt){$('largeImage').src=src;$('largeImage').alt=alt;$('imageDialog').showModal();}
  function notes(){document.querySelector('.service-notes').hidden=!['#menu-photo','#service','#polaroids'].includes(location.hash);}
  window.addEventListener('hashchange',notes);notes();
  // The existing live loader owns the data and stock text; this only adds a category selector.
  let category='';
  let menuTurn=null;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  function turnMenu(direction){
    menuTurn?.cancel();
    if(reducedMotion.matches)return;
    const page=$('siteMenuGrid');
    menuTurn=page.animate([
      {transform:`perspective(1400px) rotateY(${direction<0?-45:45}deg)`,opacity:.25,filter:'brightness(.9)'},
      {transform:`perspective(1400px) rotateY(${direction<0?3:-3}deg)`,opacity:1,filter:'brightness(1)',offset:.72},
      {transform:'perspective(1400px) rotateY(0deg)',opacity:1,filter:'brightness(1)'}
    ],{duration:440,easing:'cubic-bezier(.18,.7,.25,1)'});
  }
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)menuTurn?.cancel();});
  function menuChoices(){
    const blocks=[...$('siteMenuGrid').children].filter(n=>n.matches('.menu-cat,.set-block'));
    const choices=$('menuCategoryChoices');choices.replaceChildren();if(!blocks.length)return;
    const labels=blocks.map(n=>n.querySelector('h3,.set-title')?.textContent||'其他');
    if(category!=='全部'&&!labels.includes(category))category=labels[0];
    function draw(){blocks.forEach((n,i)=>n.hidden=category!=='全部'&&labels[i]!==category);[...choices.children].forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===category)));}
    const unique=[...new Set(labels),'全部'];
    for(const label of unique){const b=text('button',label);b.type='button';b.addEventListener('click',()=>{if(category===label)return;const direction=unique.indexOf(label)-unique.indexOf(category);category=label;draw();turnMenu(direction);});choices.append(b);}draw();
  }
  new MutationObserver(menuChoices).observe($('siteMenuGrid'),{childList:true});menuChoices();
  // Member works are attributed only by the source record's staff ID or explicit name.
  let samples=[],selectedId=document.querySelector('#memberList [aria-pressed=true]')?.dataset.member||'',selectedName=$('detailName').textContent;
  const gallery=document.createElement('section');gallery.id='memberPortfolio';gallery.className='member-portfolio';gallery.setAttribute('aria-labelledby','portfolioTitle');
  const heading=document.createElement('div');heading.className='portfolio-heading';const titleWrap=document.createElement('div');titleWrap.append(text('span','作品','editorial-eyebrow'),text('h2','','portfolio-title'));titleWrap.querySelector('h2').id='portfolioTitle';heading.append(titleWrap,text('p','點選圖片，欣賞成員們的過往作品。'));
  const frames=document.createElement('div');frames.className='portfolio-frames';gallery.append(heading,frames);$('page-members').append(gallery);
  const portfolioButton=text('button','看作品','btn wine portfolio-trigger');portfolioButton.type='button';portfolioButton.setAttribute('aria-controls','memberPortfolio');portfolioButton.addEventListener('click',()=>gallery.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));$('memberDetail').querySelector('.actions').append(portfolioButton);
  function drawPortfolio(){
    $('portfolioTitle').textContent=selectedName+'的作品集';frames.replaceChildren();
    const owned=samples.filter(s=>safeImage(s.imageUrl)&&(s.staffId?s.staffId===selectedId:s.staffName===selectedName));
    if(!owned.length){frames.append(text('p','這位成員的作品正在準備中。','portfolio-empty'));return;}
    for(const record of owned){const figure=document.createElement('figure'),b=document.createElement('button'),img=document.createElement('img');b.type='button';b.className='portfolio-image';img.src=safeImage(record.imageUrl);img.alt=record.alt||selectedName+'的作品';img.loading='lazy';b.setAttribute('aria-label','放大'+(record.title||selectedName+'的作品'));b.append(img);b.addEventListener('click',()=>openImage(img.src,img.alt));figure.append(b,text('figcaption',record.title||'作品'));frames.append(figure);}
  }
  document.addEventListener('ephemere:member-selected',e=>{selectedId=e.detail.id;selectedName=e.detail.name;drawPortfolio();});
  document.addEventListener('ephemere:members-updated',e=>{$('memberList').style.setProperty('--member-count',Math.max(1,e.detail.length));});
  document.addEventListener('ephemere:polaroids-updated',e=>{samples=e.detail||[];drawPortfolio();});drawPortfolio();
  // Only guestbookPublic is rendered here. The current guestbook.js retains submission/consent handling.
  window.ephemereInlineGuestbook={render(rows){
    const list=$('guestbookPublicList');list.replaceChildren();
    if(!rows.length){list.append(text('p','公開來信正在陸續收錄，也歡迎留下你的感想。','public-letter-footnote'));return;}
    for(const item of rows){
      const article=document.createElement('article');article.className='public-letter';
      const author=item.displayMode==='named'&&String(item.displayName||'').trim()?String(item.displayName).slice(0,40):'一位旅人';
      const recipient=String(item.recipientLabel||'曇時全體成員').slice(0,40),body=String(item.displayText||'').slice(0,1000);
      article.append(text('span',item.displayMode==='named'?'主人來信':'匿名來信','public-letter-tag'),text('h3','給'+recipient),text('p',body));
      const bottom=document.createElement('div');bottom.className='public-letter-bottom';const b=text('button','展開這封信','text-link');b.type='button';b.addEventListener('click',()=>{$('publicLetterTitle').textContent='給'+recipient;$('publicLetterBody').textContent=body;$('publicLetterAuthor').textContent=author;$('publicLetterDialog').showModal();});bottom.append(text('span',author),b);article.append(bottom);list.append(article);
    }
  }};
  $('guestbookMessage').addEventListener('input',()=>$('letterCount').textContent=$('guestbookMessage').value.length+' / 1000');
  $('guestbookForm').addEventListener('reset',()=>requestAnimationFrame(()=>$('letterCount').textContent='0 / 1000'));
  // Existing studio-content.js still owns defaults, visibility, order and the full gallery dialog.
  let studios=[],kind='active',selectedStudio='',openStudio=null;
  function studioImages(entry){return Object.entries(entry.images||{}).map(([id,img])=>({id,...img})).filter(img=>safeImage(img.imageUrl)).sort((a,b)=>Number(a.sortOrder||0)-Number(b.sortOrder||0));}
  function studioCover(entry){const images=studioImages(entry);return images.find(img=>img.id===entry.coverImageId)||images[0];}
  function drawStudios(){
    const available=studios.filter(s=>kind==='active'?s.data.status==='active':s.data.status!=='active');
    if(!available.some(s=>s.id===selectedStudio))selectedStudio=available[0]?.id||'';
    $('studioActiveTab').setAttribute('aria-pressed',String(kind==='active'));$('studioMemoryTab').setAttribute('aria-pressed',String(kind==='memory'));
    const host=document.querySelector('.studio-selectors');host.replaceChildren();$('menu-studio').hidden=!available.length;$('studioEmpty').hidden=!!available.length;
    if(!available.length){$('studioEmpty').textContent=kind==='active'?'攝影棚資料準備中，請留意曇時最新公告。':'更多往日棚景，將陸續收錄。';return;}
    for(const record of available){const b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed',String(record.id===selectedStudio));const cover=studioCover(record.data);if(cover){const img=document.createElement('img');img.src=safeImage(cover.imageUrl);img.alt='';img.loading='lazy';b.append(img);}b.append(text('span',record.data.name));b.addEventListener('click',()=>{selectedStudio=record.id;drawStudios();});host.append(b);}
    const record=available.find(s=>s.id===selectedStudio),cover=studioCover(record.data);$('studioName').textContent=record.data.name;$('studioDescription').textContent=record.data.description||record.data.summary||'';
    $('studioImage').hidden=!cover;$('studioOpen').disabled=!cover;if(cover){$('studioImage').src=safeImage(cover.imageUrl);$('studioImage').alt=cover.alt||record.data.name;}
    $('studioEnlarge').hidden=!cover;
  }
  window.ephemereStudioUI={render(records,open){studios=records;openStudio=open;drawStudios();}};
  for(const [id,value]of [['studioActiveTab','active'],['studioMemoryTab','memory']])$(id).addEventListener('click',()=>{kind=value;drawStudios();});
  function enlargeStudio(){const record=studios.find(s=>s.id===selectedStudio);if(record&&openStudio)openStudio(record);}
  $('studioOpen').addEventListener('click',enlargeStudio);$('studioEnlarge').addEventListener('click',enlargeStudio);
})();
