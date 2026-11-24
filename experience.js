'use strict';
(() => {
  const $=id=>document.getElementById(id);
  const menuTabs=[...document.querySelectorAll('.experience-tabs [role=tab]')];
  const menuPanels=['menu-food','menu-photo'];
  function setMenuFromHash(){
    const hash=['service','polaroids'].includes(location.hash.slice(1))?'menu-photo':location.hash.slice(1);if(hash!=='menu'&&!menuPanels.includes(hash))return;
    const active=menuPanels.includes(hash)?hash:'menu-food';
    menuTabs.forEach(tab=>{const chosen=tab.getAttribute('aria-controls')===active;tab.setAttribute('aria-selected',String(chosen));tab.tabIndex=chosen?0:-1;});
    menuPanels.forEach(id=>{$(id).hidden=id!==active;});
  }
  function keyboardTabs(tabs,select){
    tabs.forEach((tab,index)=>tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(next);tabs[next].focus();}));
  }
  keyboardTabs(menuTabs,index=>{location.hash=menuPanels[index];});
  window.addEventListener('hashchange',setMenuFromHash);setMenuFromHash();
  const steps=[
    ['領取號碼牌','進入點餐頁面，依指示領取號碼牌。與朋友同行時，可使用共桌代碼加入同一桌。'],
    ['點餐與等候','領號後即可依頁面指示送出餐點，等待女僕通知。等待期間也歡迎自由參觀店內。'],
    ['接待與帶位','輪到您的號碼時，女僕將通知並引導您入座。'],
    ['追加與服務','入座後，仍可透過點餐網站追加餐點，也可於同一頁選購拍攝與紀念服務。']
  ];
  const arrivalTabs=[...document.querySelectorAll('[data-arrival]')];
  function selectArrival(index){const [title,text]=steps[index];$('arrivalTitle').textContent=title;$('arrivalText').textContent=text;$('arrivalDescription').setAttribute('aria-labelledby',arrivalTabs[index].id);arrivalTabs.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});}
  arrivalTabs.forEach((tab,i)=>tab.addEventListener('click',()=>selectArrival(i)));keyboardTabs(arrivalTabs,selectArrival);
  document.addEventListener('ephemere:presentation-updated',event=>{const v=event.detail.visit;steps.forEach((step,i)=>{step[0]=v['step'+i+'Title'];step[1]=v['step'+i+'Body'];arrivalTabs[i].textContent=step[0];});selectArrival(Math.max(0,arrivalTabs.findIndex(tab=>tab.getAttribute('aria-selected')==='true')));});
})();
