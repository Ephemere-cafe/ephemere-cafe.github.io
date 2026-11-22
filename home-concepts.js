'use strict';
(() => {
  const page=document.getElementById('page-home');
  const mount=document.getElementById('homeHeroMount');
  const switches=[...document.querySelectorAll('[data-home-design]')];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let people=[],person='noi',scene=0,design='a',autoplay=!reduce.matches,surprisePending=false,welcomeStart=0,welcomeAuto=!reduce.matches;
  const featured=['noi','xiamu','miarica'];
  const scenes=[{src:'assets/hero.webp',name:'庭院入口'},{src:'assets/group.webp',name:'店內合照'},{src:'assets/studio-window.webp',name:'窗景攝影棚'}];
  const templates={
    a:`<section class="home-concept concept-a" aria-label="人物封面"><div class="a-title"><p class="a-little">Cafe l’Éphémère</p><h1>曇時</h1><p class="home-original-copy">時光如曇花般轉瞬即逝。<br>在這段短暫的停留裡，<br>願我們為你多留一點溫度。</p><div class="concept-actions"><a hidden data-reservation href="https://booking.ephemereffxiv.com/" target="_blank" rel="noopener">立即預約</a><a href="https://order.ephemereffxiv.com/" target="_blank" rel="noopener">線上點餐</a></div><span class="concept-operating">不定期營業 · 一般來店照常接待</span></div><div class="a-character"><div class="a-arch" aria-hidden="true"></div><img data-feature-photo alt=""><span class="a-character-name" data-feature-name aria-hidden="true"></span><span class="a-character-role" data-feature-role></span><button class="a-character-link" data-meet-person>認識這位成員</button></div><div class="a-garden"><img src="assets/hero.webp" alt="曇時庭院"><span>薰衣草苗圃 · 第 1 區 6 號</span></div><div class="home-person-controls"><span>在曇時遇見</span><div data-feature-selector></div><button class="home-play-toggle" data-auto-toggle>暫停輪播</button></div></section>`,
    b:`<section class="home-concept concept-b" aria-label="相片手帳"><div class="b-heading"><h1>曇時</h1><span>Cafe l’Éphémère</span></div><div class="b-copy"><p class="home-original-copy">時光如曇花般轉瞬即逝。<br>在這段短暫的停留裡，<br>願我們為你多留一點溫度。</p><a class="b-booking" href="https://booking.ephemereffxiv.com/" target="_blank" rel="noopener">查看預約時段</a></div><figure class="b-garden"><img src="assets/hero.webp" alt="曇時庭院與入口"><figcaption>薰衣草苗圃 · 第 1 區 6 號</figcaption></figure><figure class="b-group"><img src="assets/group.webp" alt="曇時成員在店內的合照"><figcaption>曇時的成員</figcaption></figure><figure class="b-person"><img data-feature-photo alt=""><figcaption><span data-feature-name></span><button data-meet-person>認識成員</button></figcaption></figure><div class="b-bottom"><span>不定期營業<br><small>一般來店照常接待</small></span><a href="https://order.ephemereffxiv.com/" target="_blank" rel="noopener">線上點餐</a><a href="#visit">第一次來曇時</a><div data-feature-selector></div></div></section>`,
    c:`<section class="home-concept concept-c" aria-label="迎賓全景"><div class="c-title"><span>Cafe l’Éphémère</span><h1>曇<br>時</h1><a href="#members">認識全部成員</a></div><div class="c-scene"><img data-scene-photo src="assets/hero.webp" alt="曇時庭院入口"><span class="c-scene-caption" data-scene-name>庭院入口</span><div class="c-scene-controls"><button data-scene-step="-1" aria-label="上一個場景">‹</button><span data-scene-count>1 / 3</span><button data-scene-step="1" aria-label="下一個場景">›</button><button class="home-play-toggle" data-auto-toggle>暫停輪播</button></div></div><div class="c-letter"><p>時光如曇花般轉瞬即逝。<br>在這段短暫的停留裡，願我們為你多留一點溫度。</p><div><a hidden data-reservation href="https://booking.ephemereffxiv.com/" target="_blank" rel="noopener">立即預約</a><a href="https://order.ephemereffxiv.com/" target="_blank" rel="noopener">線上點餐</a></div></div><div class="c-scene-strip"><span>不定期營業 · 一般來店照常接待</span><div data-scene-selector></div></div></section>`
  };
  templates.d=`<section class="home-concept concept-d" aria-label="迎賓舞台"><img class="d-garden" src="assets/hero.webp" alt=""><div class="d-heading"><h1>曇時</h1><p>Cafe l’Éphémère</p><span>時光如曇花般轉瞬即逝。<br>在這段短暫的停留裡，願我們為你多留一點溫度。</span></div><div class="d-people" data-welcome-people aria-label="選擇迎賓成員"></div><div class="d-welcome"><div><span>認識曇時的成員</span><strong data-feature-name></strong><small data-feature-role></small><p data-feature-quote hidden></p></div><button data-meet-person>查看個人介紹</button><a href="#members">全部成員</a></div><div class="d-actions"><a hidden data-reservation href="https://booking.ephemereffxiv.com/" target="_blank" rel="noopener">立即預約</a><a href="https://order.ephemereffxiv.com/" target="_blank" rel="noopener">線上點餐</a><a href="#visit">第一次來曇時</a></div></section>`;
  templates.e=`<section class="home-concept concept-e" aria-label="曇時櫥窗"><div class="e-heading"><h1>曇時</h1><span>Cafe l’Éphémère</span></div><div class="e-copy"><p>時光如曇花般轉瞬即逝。<br>在這段短暫的停留裡，<br>願我們為你多留一點溫度。</p></div><button class="e-window" data-view-window aria-label="放大曇時庭院照片"><img src="assets/hero.webp" alt="曇時庭院與店門"><span>在這裡找到我們</span></button><a class="e-memory" href="#menu-photo"><img src="assets/polaroid-sample-01.jpg" alt="曇時拍立得作品範例"><span>拍攝與紀念服務</span></a><button class="e-event" data-home-event><span>本月主題日</span><strong>曇時<br>學園祭</strong><small>曇華女子學院<br>× 曇光女子學院</small><span>查看活動</span></button><a class="e-members" href="#members"><img src="assets/chibi-cast/xiamu.png" alt=""><img src="assets/chibi-cast/noi.png" alt=""><span>認識曇時的成員</span></a><div class="e-bottom"><span>點選照片與活動，慢慢認識曇時。</span><a hidden data-reservation href="https://booking.ephemereffxiv.com/" target="_blank" rel="noopener">立即預約</a><a href="https://order.ephemereffxiv.com/" target="_blank" rel="noopener">線上點餐</a></div></section>`;
  templates.f=`<section class="home-concept concept-f" aria-label="相遇封面"><div class="f-brand"><h1>曇時</h1><span>Cafe l’Éphémère</span></div><div class="f-person"><div class="f-backdrop" aria-hidden="true"></div><img data-feature-photo alt=""><div class="f-avatar" data-surprise-avatar></div></div><div class="f-intro"><span>在曇時遇見</span><h2 data-feature-name></h2><small data-feature-role></small><blockquote data-feature-quote hidden></blockquote><button data-meet-person>認識這位成員</button></div><div class="f-letter"><p>時光如曇花般轉瞬即逝。<br>在這段短暫的停留裡，<br>願我們為你多留一點溫度。</p><button data-surprise-next>再遇見一位成員</button><span>每次開啟，換一位成員介紹。</span></div><div class="f-actions"><a hidden data-reservation href="https://booking.ephemereffxiv.com/" target="_blank" rel="noopener">立即預約</a><a href="https://order.ephemereffxiv.com/" target="_blank" rel="noopener">線上點餐</a><a href="#members">全部成員</a></div></section>`;
  templates.g=`<section class="home-concept concept-d concept-g" aria-label="迎賓舞台與主題日"><img class="d-garden" src="assets/hero.webp" alt=""><div class="d-heading"><h1>曇時</h1><p>Cafe l’Éphémère</p><span>時光如曇花般轉瞬即逝。<br>在這段短暫的停留裡，願我們為你多留一點溫度。</span></div><button class="g-event" data-home-event aria-label="查看曇時學園祭活動"><span>本月主題日</span><strong>曇時學園祭</strong><small><span>曇華女子學院</span><span aria-hidden="true">×</span><span>曇光女子學院</span></small><span>活動規則與雙校陣容</span></button><div class="d-people" data-welcome-people aria-label="選擇迎賓成員"></div><div class="d-welcome"><div><span>認識曇時的成員</span><strong data-feature-name></strong><small data-feature-role></small><p data-feature-quote hidden></p></div><button data-meet-person>查看個人介紹</button><a href="#members">全部成員</a></div><div class="d-actions"><a hidden data-reservation href="https://booking.ephemereffxiv.com/" target="_blank" rel="noopener">立即預約</a><a href="https://order.ephemereffxiv.com/" target="_blank" rel="noopener">線上點餐</a><a href="#visit">第一次來曇時</a></div></section>`;
  function personData(){return people.find(m=>m.id===person)||people.find(m=>featured.includes(m.id));}
  function nextSurprise(){
    const available=people.filter(m=>featured.includes(m.id));if(!available.length){surprisePending=true;return;}
    let last=person;try{last=sessionStorage.getItem('ephemere-cover-last-person')||person;}catch{}
    const pool=available.filter(m=>m.id!==last);person=(pool.length?pool:available)[Math.floor(Math.random()*(pool.length||available.length))].id;
    try{sessionStorage.setItem('ephemere-cover-last-person',person);}catch{}
    surprisePending=false;updatePerson();
  }
  function welcomePool(){return [...['xiamu','noi','miarica'].map(id=>people.find(m=>m.id===id)).filter(Boolean),...people.filter(m=>!['xiamu','noi','miarica'].includes(m.id))];}
  function advanceWelcome(direction){
    const pool=welcomePool();if(pool.length<=3)return;
    const focused=mount.querySelector('.welcome-rotation-controls')?.contains(document.activeElement)?document.activeElement.getAttribute('aria-label'):null;
    welcomeStart=(welcomeStart+direction*3+pool.length)%pool.length;renderWelcome();updatePerson();
    if(focused)[...mount.querySelectorAll('.welcome-rotation-controls button')].find(b=>b.getAttribute('aria-label')===focused)?.focus();
    const host=mount.querySelector('[data-welcome-people]');host.classList.remove('welcome-group-enter');requestAnimationFrame(()=>host.classList.add('welcome-group-enter'));
  }
  function renderWelcomeControls(){
    const actions=mount.querySelector('.concept-g .d-actions');if(!actions)return;actions.querySelector('.welcome-rotation-controls')?.remove();
    const pool=welcomePool(),controls=document.createElement('div');controls.className='welcome-rotation-controls';controls.setAttribute('aria-label','首頁成員輪替');
    for(const [direction,label]of [[-1,'上一組'],[1,'下一組']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-label',label+'成員');b.disabled=pool.length<=3;b.addEventListener('click',()=>advanceWelcome(direction));controls.append(b);}
    const label=document.createElement('span');label.textContent=`展示 ${Math.min(3,pool.length)} 位／共 ${pool.length} 位`;controls.append(label);
    const pause=document.createElement('button');pause.type='button';pause.className='rotation-pause';pause.dataset.welcomePause='';pause.disabled=reduce.matches||pool.length<=3;pause.textContent=reduce.matches?'手動切換':welcomeAuto?'暫停輪替':'自動輪替';pause.setAttribute('aria-label',reduce.matches?'已依減少動態效果設定停用自動輪替':welcomeAuto?'暫停首頁成員輪替':'啟用首頁成員輪替');pause.setAttribute('aria-pressed',String(welcomeAuto&&!reduce.matches));pause.addEventListener('click',()=>{welcomeAuto=!welcomeAuto;pause.textContent=welcomeAuto?'暫停輪替':'自動輪替';pause.setAttribute('aria-label',welcomeAuto?'暫停首頁成員輪替':'啟用首頁成員輪替');pause.setAttribute('aria-pressed',String(welcomeAuto));});controls.append(pause);actions.prepend(controls);
  }
  function renderWelcome(){
    const host=mount.querySelector('[data-welcome-people]');if(!host)return;host.replaceChildren();
    const pool=welcomePool();welcomeStart=pool.length?welcomeStart%pool.length:0;
    const ids=design==='g'?Array.from({length:Math.min(3,pool.length)},(_,i)=>pool[(welcomeStart+i)%pool.length].id):['xiamu','noi','miarica'];
    if(ids.length&&!ids.includes(person))person=ids[0];
    for(const [index,id]of ids.entries()){
      const m=people.find(p=>p.id===id);if(!m)continue;
      const b=document.createElement('button');b.type='button';b.dataset.welcomePerson=m.id;b.style.setProperty('--welcome-index',index);b.setAttribute('aria-pressed',String(m.id===person));b.setAttribute('aria-label',`顯示${m.name}的介紹`);
      const src=m.photos?.[0]||m.avatar;const img=document.createElement('img');if(src)img.src=src;else img.hidden=true;img.alt=m.photos?.length?m.name:`${m.name}的頭貼（介紹照片待補）`;img.style.objectFit=m.photos?.length&&m.fit==='cover'?'cover':'contain';img.style.objectPosition=`50% ${m.position??50}%`;b.append(img);
      const fallback=document.createElement('small');fallback.className='welcome-photo-fallback';fallback.textContent=src?'照片暫時無法顯示':`${m.name}・介紹照片待補`;fallback.hidden=!!src;b.append(fallback);
      let retried=false;img.addEventListener('error',()=>{if(!retried&&m.avatar&&img.getAttribute('src')!==m.avatar){retried=true;img.src=m.avatar;img.style.objectFit='contain';return;}img.hidden=true;fallback.hidden=false;});
      const name=document.createElement('span');name.textContent=m.name;b.append(name);
      const select=()=>{if(person===m.id)return;person=m.id;updatePerson();};b.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')select();});b.addEventListener('focus',select);b.addEventListener('click',select);host.append(b);
    }
    if(design==='g')renderWelcomeControls();
  }
  function updatePerson(){
    const m=personData();if(!m)return;
    const photo=mount.querySelector('[data-feature-photo]');
    if(photo){const src=m.photos?.[0]||m.avatar||'assets/logo.webp';photo.src=src;photo.alt=m.photos?.length?`${m.name}的介紹照片`:`${m.name}的頭貼（介紹照片待補）`;photo.style.objectFit=m.fit==='cover'?'cover':'contain';photo.style.objectPosition=`50% ${m.position??50}%`;}
    mount.querySelectorAll('[data-feature-name]').forEach(n=>{n.textContent=m.name;n.classList.toggle('long',m.name.length>4);});
    mount.querySelectorAll('[data-feature-role]').forEach(n=>n.textContent=m.role);
    mount.querySelectorAll('[data-feature-quote]').forEach(n=>{n.textContent=m.quote||'';n.hidden=!m.quote;});
    mount.querySelectorAll('[data-welcome-person]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.welcomePerson===person)));
    const avatar=mount.querySelector('[data-surprise-avatar]');if(avatar){avatar.replaceChildren();if(m.avatar){const img=document.createElement('img');img.src=m.avatar;img.alt='';avatar.append(img);}}
    mount.querySelectorAll('[data-meet-person]').forEach(b=>{b.setAttribute('aria-label',`認識${m.name}`);});
    mount.querySelectorAll('[data-person]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.person===person)));
    const frame=mount.querySelector('.a-character,.b-person,.f-person');if(frame){frame.classList.remove('home-person-change');requestAnimationFrame(()=>frame.classList.add('home-person-change'));}
  }
  function renderPersonSelectors(){
    mount.querySelectorAll('[data-feature-selector]').forEach(list=>{list.replaceChildren();for(const id of featured){const m=people.find(p=>p.id===id);if(!m)continue;const b=document.createElement('button');b.type='button';b.dataset.person=id;b.setAttribute('aria-pressed',String(id===person));b.setAttribute('aria-label',`顯示${m.name}`);if(m.avatar){const img=document.createElement('img');img.src=m.avatar;img.alt='';b.append(img);}const name=document.createElement('span');name.textContent=m.name;b.append(name);b.addEventListener('click',()=>{person=id;updatePerson();});list.append(b);}});
  }
  function updateScene(){
    const selected=scenes[scene];const img=mount.querySelector('[data-scene-photo]');if(!img)return;
    img.src=selected.src;img.alt=selected.name;mount.querySelector('[data-scene-name]').textContent=selected.name;mount.querySelector('[data-scene-count]').textContent=`${scene+1} / ${scenes.length}`;
    mount.querySelectorAll('[data-scene-choice]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.sceneChoice)===scene)));
    img.classList.remove('home-scene-change');requestAnimationFrame(()=>img.classList.add('home-scene-change'));
  }
  function autoplayLabels(){mount.querySelectorAll('[data-auto-toggle]').forEach(b=>{b.textContent=reduce.matches?'手動切換':autoplay?'暫停輪播':'自動輪播';b.disabled=reduce.matches;b.setAttribute('aria-label',reduce.matches?'系統已設定減少動態效果，請手動切換':autoplay?'暫停自動輪播':'啟用自動輪播');b.setAttribute('aria-pressed',String(autoplay&&!reduce.matches));});}
  function renderDesign(key,changeUrl=false){
    design=Object.hasOwn(templates,key)?key:'a';page.dataset.home=design;
    // Only fixed, authored markup enters this fragment. Editable member content uses textContent.
    mount.replaceChildren(document.createRange().createContextualFragment(templates[design]));
    switches.forEach(a=>{if(a.dataset.homeDesign===design)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
    renderPersonSelectors();renderWelcome();if(design==='f')nextSurprise();else updatePerson();
    mount.querySelectorAll('[data-meet-person]').forEach(b=>b.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('ephemere:select-member',{detail:person}))));
    mount.querySelectorAll('[data-surprise-next]').forEach(b=>b.addEventListener('click',nextSurprise));
    mount.querySelectorAll('[data-home-event]').forEach(b=>b.addEventListener('click',()=>document.getElementById('eventOpen').click()));
    mount.querySelectorAll('[data-view-window]').forEach(b=>b.addEventListener('click',()=>{const img=document.getElementById('largeImage');img.src='assets/hero.webp';img.alt='曇時庭院與店門';document.getElementById('imageDialog').showModal();}));
    const sceneSelector=mount.querySelector('[data-scene-selector]');
    if(sceneSelector){scenes.forEach((entry,index)=>{const b=document.createElement('button');b.type='button';b.dataset.sceneChoice=index;b.textContent=entry.name;b.setAttribute('aria-pressed',String(index===scene));b.addEventListener('click',()=>{scene=index;updateScene();});sceneSelector.append(b);});updateScene();}
    mount.querySelectorAll('[data-scene-step]').forEach(b=>b.addEventListener('click',()=>{scene=(scene+Number(b.dataset.sceneStep)+scenes.length)%scenes.length;updateScene();}));
    mount.querySelectorAll('[data-auto-toggle]').forEach(b=>b.addEventListener('click',()=>{autoplay=!autoplay;autoplayLabels();}));autoplayLabels();
    if(changeUrl){const url=new URL(location.href);url.searchParams.set('home',design);history.replaceState(null,'',url);}
    document.dispatchEvent(new Event('ephemere:home-rendered'));
  }
  switches.forEach(a=>a.addEventListener('click',event=>{event.preventDefault();renderDesign(a.dataset.homeDesign,true);}));
  document.addEventListener('ephemere:members-updated',event=>{if(!Array.isArray(event.detail))return;people=event.detail;renderPersonSelectors();renderWelcome();if(design==='f'&&surprisePending)nextSurprise();else updatePerson();});
  reduce.addEventListener('change',()=>{if(reduce.matches){autoplay=false;welcomeAuto=false;}autoplayLabels();if(design==='g')renderWelcomeControls();});
  setInterval(()=>{if(design!=='g'||!welcomeAuto||reduce.matches||document.hidden||page.hidden||mount.matches(':hover')||mount.contains(document.activeElement))return;advanceWelcome(1);},8000);
  setInterval(()=>{
    if(!autoplay||reduce.matches||document.hidden||page.hidden||mount.matches(':hover')||mount.contains(document.activeElement))return;
    if(design==='a'){const i=featured.indexOf(person);person=featured[(i+1)%featured.length];updatePerson();}
    else if(design==='c'){scene=(scene+1)%scenes.length;updateScene();}
  },6500);
  renderDesign(new URL(location.href).searchParams.get('home')||'g');
  document.dispatchEvent(new Event('ephemere:request-members'));
})();
