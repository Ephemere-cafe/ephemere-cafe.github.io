(function(){
  'use strict';
  if(!window.firebase || !firebase.apps || !firebase.apps.length) return;
  var db=firebase.database();
  var form=document.getElementById('guestbookForm');
  var list=document.getElementById('guestbookPublicList');
  if(!form || !list) return;
  var recipient=document.getElementById('guestbookRecipient');
  var author=document.getElementById('guestbookAuthorName');
  var message=document.getElementById('guestbookMessage');
  var confirmBox=document.getElementById('guestbookConfirm');
  var submit=document.getElementById('guestbookSubmit');
  var status=document.getElementById('guestbookStatus');
  var lastSubmitAt=0;

  function setStatus(text,state){status.textContent=text||'';status.dataset.state=state||'';}
  function selectedConsent(){var input=form.querySelector('input[name="guestbookConsent"]:checked');return input?input.value:'private';}
  function clean(value,max){return String(value||'').trim().slice(0,max);}
  function renderRecipients(value){
    var current=recipient.value;
    var records=Object.keys(value||{}).map(function(id){return {id:id,data:value[id]||{}};})
      .filter(function(item){return item.data.name && item.data.websiteVisible!==false;})
      .sort(function(a,b){return Number(a.data.sortOrder||0)-Number(b.data.sortOrder||0)||String(a.data.name).localeCompare(String(b.data.name),'zh-Hant');});
    recipient.replaceChildren();
    var all=document.createElement('option');all.value='';all.textContent='曇時全體成員';recipient.appendChild(all);
    records.forEach(function(item){var option=document.createElement('option');option.value=item.id;option.textContent=clean(item.data.name,40);recipient.appendChild(option);});
    if(Array.prototype.some.call(recipient.options,function(option){return option.value===current;})) recipient.value=current;
  }
  function updateNameRequirement(){
    var named=selectedConsent()==='named';
    author.required=named;
    document.getElementById('guestbookNameHint').textContent=named?'（具名公開必填；官網只顯示名字）':'（不公開／匿名公開可留白）';
  }
  function renderPublic(value){
    var rows=Object.keys(value||{}).map(function(id){return Object.assign({id:id},value[id]||{});})
      .filter(function(item){return (item.displayMode==='anonymous'||item.displayMode==='named')&&clean(item.displayText,1000);})
      .sort(function(a,b){return Number(b.publishedAt||0)-Number(a.publishedAt||0)||Number(a.sortOrder||0)-Number(b.sortOrder||0);})
      .slice(0,24);
    list.replaceChildren();
    if(!rows.length){var empty=document.createElement('p');empty.className='guestbook-empty';empty.textContent='公開留言正在慢慢收集。也歡迎留下今晚的心情。';list.appendChild(empty);return;}
    rows.forEach(function(item){
      var card=document.createElement('article');card.className='guestbook-message';
      var quote=document.createElement('blockquote');quote.textContent='「'+clean(item.displayText,1000)+'」';
      var meta=document.createElement('div');meta.className='guestbook-message-meta';
      var name=document.createElement('span');name.textContent=item.displayMode==='named'&&clean(item.displayName,40)?'— '+clean(item.displayName,40):'匿名主人';
      var to=document.createElement('span');to.textContent='給 '+(clean(item.recipientLabel,40)||'曇時全體成員');
      meta.append(name,to);card.append(quote,meta);list.appendChild(card);
    });
  }

  form.addEventListener('change',function(event){if(event.target.name==='guestbookConsent') updateNameRequirement();});
  form.addEventListener('submit',function(event){
    event.preventDefault();
    var consent=selectedConsent();
    var authorName=clean(author.value,40);
    var messageText=clean(message.value,1000);
    var website=clean(document.getElementById('guestbookWebsite').value,200);
    if(website){setStatus('留言未能送出，請重新整理後再試。','error');return;}
    if(consent==='named'&&!authorName){author.focus();setStatus('選擇具名公開時，請填寫希望顯示的名字。','error');return;}
    if(messageText.length<2){message.focus();setStatus('請至少寫下兩個字的留言。','error');return;}
    if(!confirmBox.checked){confirmBox.focus();setStatus('請先確認已閱讀投稿須知。','error');return;}
    if(Date.now()-lastSubmitAt<20000){setStatus('留言正在送出或剛剛已送出，請稍候再試。','error');return;}
    var selected=recipient.options[recipient.selectedIndex];
    var record={
      recipientStaffId:clean(recipient.value,80),
      recipientNameSnapshot:clean(selected?selected.textContent:'曇時全體成員',40)||'曇時全體成員',
      authorName:authorName,
      messageOriginal:messageText,
      consentMode:consent,
      createdAt:firebase.database.ServerValue.TIMESTAMP,
      schemaVersion:1
    };
    submit.disabled=true;submit.textContent='正在送出…';setStatus('正在把留言送進曇時的信箱…','');lastSubmitAt=Date.now();
    db.ref('lephemere/guestbookSubmissions').push(record).then(function(){
      form.reset();updateNameRequirement();setStatus('留言已送達。投稿會先由店內閱讀，不會立即公開。','success');
    }).catch(function(error){
      lastSubmitAt=0;console.error('Guestbook submission failed',error);setStatus('留言未能送出，請確認連線後再試一次。','error');
    }).then(function(){submit.disabled=false;submit.textContent='確認須知並送出留言';});
  });

  updateNameRequirement();
  db.ref('lephemere/staffRoster').on('value',function(snapshot){renderRecipients(snapshot.val());},function(){renderRecipients({});});
  db.ref('lephemere/guestbookPublic').on('value',function(snapshot){renderPublic(snapshot.val());},function(){renderPublic({});});
})();
