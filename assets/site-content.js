(function(){
  'use strict';

  if(!window.firebase || !firebase.apps || !firebase.apps.length) return;
  var db = firebase.database();
  var heroImage = document.querySelector('.hero-photo img');
  var gallery = document.querySelector('.polaroid-gallery');
  var fallbackHero = heroImage ? heroImage.getAttribute('src') : '';
  var fallbackPolaroids = gallery ? Array.prototype.map.call(gallery.children, function(node){ return node.cloneNode(true); }) : [];
  var heroSettings = null;
  var contentReady = { hero: !heroImage, polaroids: !gallery };

  function safeUrl(value){
    var text = String(value || '').trim();
    if(!/^https:\/\//i.test(text)) return '';
    try { var url = new URL(text); return url.protocol === 'https:' ? url.href : ''; }
    catch(_error){ return ''; }
  }
  function clamp(value, min, max){ return Math.min(max, Math.max(min, Number(value) || 0)); }
  function markContentReady(key){
    contentReady[key] = true;
    if(contentReady.hero && contentReady.polaroids) document.documentElement.classList.remove('site-content-loading');
  }
  function useMobileHero(){ return window.matchMedia('(max-width: 860px)').matches; }
  function applyHero(data){
    if(!heroImage) return;
    heroSettings = data || null;
    var desktopUrl = heroSettings && safeUrl(heroSettings.desktopUrl);
    var mobileUrl = heroSettings && safeUrl(heroSettings.mobileUrl);
    var mobile = useMobileHero();
    var src = mobile ? (mobileUrl || desktopUrl || fallbackHero) : (desktopUrl || mobileUrl || fallbackHero);
    var x = mobile ? heroSettings && heroSettings.mobileFocalX : heroSettings && heroSettings.desktopFocalX;
    var y = mobile ? heroSettings && heroSettings.mobileFocalY : heroSettings && heroSettings.desktopFocalY;
    var zoom = mobile ? heroSettings && heroSettings.mobileZoom : heroSettings && heroSettings.desktopZoom;
    var reveal = function(){ markContentReady('hero'); };
    heroImage.addEventListener('load', reveal, { once: true });
    heroImage.addEventListener('error', reveal, { once: true });
    heroImage.src = src;
    heroImage.style.objectPosition = clamp(x == null ? 50 : x, 0, 100) + '% ' + clamp(y == null ? 50 : y, 0, 100) + '%';
    heroImage.style.transformOrigin = clamp(x == null ? 50 : x, 0, 100) + '% ' + clamp(y == null ? 50 : y, 0, 100) + '%';
    heroImage.style.transform = 'scale(' + (clamp(zoom == null ? 100 : zoom, 100, 180) / 100) + ')';
    if(heroImage.complete) reveal();
    if(heroSettings) heroImage.dataset.managedHero = 'true';
    else delete heroImage.dataset.managedHero;
  }
  function restoreFallbackPolaroids(){
    if(!gallery) return;
    gallery.classList.remove('is-managed');
    gallery.replaceChildren.apply(gallery, fallbackPolaroids.map(function(node){ return node.cloneNode(true); }));
    markContentReady('polaroids');
  }
  function renderPolaroids(value){
    if(!gallery) return;
    var records = Object.keys(value || {}).map(function(id){ return Object.assign({ id: id }, value[id] || {}); })
      .filter(function(item){ return item.visible !== false && safeUrl(item.imageUrl); })
      .sort(function(a,b){ return Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || Number(a.createdAt || 0) - Number(b.createdAt || 0); });
    if(!records.length){ restoreFallbackPolaroids(); return; }
    var fragment = document.createDocumentFragment();
    records.forEach(function(item, index){
      var url = safeUrl(item.imageUrl);
      var link = document.createElement('a');
      link.className = 'polaroid-print';
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', '查看' + (item.title || ('拍立得成品範例 ' + (index + 1))) + '大圖');
      var image = document.createElement('img');
      image.loading = 'lazy';
      image.decoding = 'async';
      image.src = url;
      image.alt = item.alt || '曇時 Cafe l’Éphémère 拍立得成品範例';
      var meta = document.createElement('span');
      meta.className = 'polaroid-meta';
      var label = document.createElement('small');
      label.textContent = 'PHOTO BY · 作品店員';
      var title = document.createElement('strong');
      title.textContent = item.title || ('拍立得作品 ' + String(index + 1).padStart(2,'0'));
      meta.append(label, title);
      link.append(image, meta);
      if(item.caption){
        var caption = document.createElement('span');
        caption.className = 'polaroid-caption';
        caption.textContent = item.caption;
        link.appendChild(caption);
      }
      fragment.appendChild(link);
    });
    gallery.classList.add('is-managed');
    gallery.replaceChildren(fragment);
    markContentReady('polaroids');
  }

  db.ref('lephemere/siteContent/homeHero').on('value', function(snapshot){ applyHero(snapshot.val()); }, function(){ applyHero(null); });
  db.ref('lephemere/siteContent/polaroids').on('value', function(snapshot){ renderPolaroids(snapshot.val()); }, function(){ restoreFallbackPolaroids(); });
  var heroMedia = window.matchMedia('(max-width: 860px)');
  var onHeroBreakpoint = function(){ applyHero(heroSettings); };
  if(heroMedia.addEventListener) heroMedia.addEventListener('change', onHeroBreakpoint);
  else if(heroMedia.addListener) heroMedia.addListener(onHeroBreakpoint);
})();
