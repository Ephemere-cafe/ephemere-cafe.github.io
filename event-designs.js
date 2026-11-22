'use strict';
(() => {
  const page=document.getElementById('page-home');
  const choices=[...document.querySelectorAll('[data-event-design]')];
  const bar=document.getElementById('eventDesignSwitcher');
  const styles={
    twin:`<span class="activity-kicker">曇時・本月主題日</span><strong class="activity-title">學園祭</strong><span class="activity-schools"><span><small>曇華</small><span>女子學院</span></span><i aria-hidden="true">×</i><span><small>曇光</small><span>女子學院</span></span></span><span class="activity-cast" aria-hidden="true"><img src="assets/chibi-cast/miarica.png" alt=""><img src="assets/chibi-cast/ruko.png" alt=""><span>雙校陣容・活動規則</span><img src="assets/chibi-cast/noi.png" alt=""><img src="assets/chibi-cast/naipa.png" alt=""></span>`,
    poster:`<span class="poster-big" aria-hidden="true">祭</span><span class="activity-kicker">本月主題日</span><strong class="activity-title">曇時<br><span>學園祭</span></strong><span class="poster-school">曇華女子學院<br>× 曇光女子學院</span><span class="poster-entry">查看雙校陣容與活動規則</span>`,
    photo:`<img class="activity-photo" src="assets/noi.png" alt="諾依的學園祭造型"><span class="activity-photo-mat" aria-hidden="true"></span><span class="activity-kicker">本月主題日</span><strong class="activity-title">曇時<br>學園祭</strong><span class="photo-school">曇華女子學院<br>× 曇光女子學院</span><span class="photo-entry">查看活動</span>`
  };
  function apply(style,updateUrl=false){
    const key=Object.hasOwn(styles,style)?style:'photo';const button=page.querySelector('.g-event');bar.hidden=!button;
    if(!button)return;
    page.dataset.eventStyle=key;
    button.replaceChildren(document.createRange().createContextualFragment(styles[key]));
    button.setAttribute('aria-label','查看曇時學園祭：雙校陣容與活動規則');
    choices.forEach(a=>{if(a.dataset.eventDesign===key)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
    if(updateUrl){const url=new URL(location.href);url.searchParams.set('event',key);history.replaceState(null,'',url);}
  }
  choices.forEach(a=>a.addEventListener('click',event=>{event.preventDefault();apply(a.dataset.eventDesign,true);}));
  document.addEventListener('ephemere:home-rendered',()=>apply(new URL(location.href).searchParams.get('event')));
  apply(new URL(location.href).searchParams.get('event'));
})();
