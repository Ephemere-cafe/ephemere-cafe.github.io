(function(){
  'use strict';
  var actions = document.querySelector('.mobile-quick-actions');
  if(!actions) return;

  var mobile = window.matchMedia('(max-width: 860px)');
  var lastY = Math.max(0, window.scrollY || 0);
  var settleTimer = 0;

  function setReading(reading){
    actions.classList.toggle('is-reading', mobile.matches && reading);
  }

  function settle(){
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(function(){ setReading(false); }, 900);
  }

  function onScroll(){
    if(!mobile.matches){ setReading(false); return; }
    var currentY = Math.max(0, window.scrollY || 0);
    var delta = currentY - lastY;
    if(currentY < 96 || delta < -6){
      setReading(false);
    }else if(delta > 6){
      setReading(true);
    }
    lastY = currentY;
    settle();
  }

  window.addEventListener('scroll', onScroll, {passive:true});
  actions.addEventListener('focusin', function(){ setReading(false); });
  actions.addEventListener('pointerenter', function(){ setReading(false); });
  mobile.addEventListener('change', function(){
    lastY = Math.max(0, window.scrollY || 0);
    setReading(false);
  });
})();
