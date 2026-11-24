(() => {
  let cover = '';

  function updateCover() {
    const image = document.querySelector('.garden-quick-links img');
    if (!image || image.getAttribute('src') === cover) return;
    image.hidden = true;
    if (cover) image.src = cover;
    else image.removeAttribute('src');
  }

  function addQuickLinks() {
    const hero = document.querySelector('#homeHeroMount .concept-g');
    if (!hero || hero.querySelector('.garden-quick-links')) return;
    const links = document.createElement('nav');
    links.className = 'garden-quick-links';
    links.setAttribute('aria-label', '來店與成員');
    links.innerHTML = `
      <a href="#visit">
        <span><strong>第一次來曇時</strong><small>店址與來店資訊</small></span>
        <span aria-hidden="true">↗</span>
      </a>
      <a href="#members">
        <span><strong>認識曇時的成員</strong></span>
        <img width="54" height="66" alt="" hidden>
        <span aria-hidden="true">↗</span>
      </a>`;
    const image = links.querySelector('img');
    image.addEventListener('load', () => { image.hidden = false; });
    image.addEventListener('error', () => { image.hidden = true; });
    hero.append(links);
    updateCover();
  }

  document.addEventListener('ephemere:members-updated', event => {
    if (!window.ephemereStaffDirectory?.rosterReady || !Array.isArray(event.detail)) return;
    const photographed = event.detail.filter(member => /^(https:\/\/|assets\/)/i.test(member.homeCover || ''));
    cover = (photographed.find(member => member.name === '琥珀') || photographed[0])?.homeCover || '';
    updateCover();
  });
  document.addEventListener('ephemere:home-rendered', addQuickLinks);
  addQuickLinks();
  document.dispatchEvent(new Event('ephemere:request-members'));
})();
