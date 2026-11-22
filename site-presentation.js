'use strict';
(() => {
  const schema=window.EphemereSitePresentation;if(!schema)return;
  let settings={};const originals=new Map();
  const text=(tag,value,className)=>{const n=document.createElement(tag);n.textContent=value;if(className)n.className=className;return n;};
  function cache(key,node){if(!originals.has(key))originals.set(key,new WeakMap());const map=originals.get(key);if(!map.has(node))map.set(node,{children:[...node.childNodes].map(n=>n.cloneNode(true)),src:node.getAttribute('src'),href:node.getAttribute('href'),whiteSpace:node.style.whiteSpace});return map.get(node);}
  function cards(node,rows){node.replaceChildren();for(const row of rows){const article=document.createElement('article');article.append(text('h3',row.title),text('p',row.body));if(row.note)article.append(text('p',row.note,'muted'));if(row.url&&row.label){const a=text('a',row.label,'text-link');a.href=row.url;a.target='_blank';a.rel='noopener';article.append(a);}node.append(article);}}
  function rules(node,rows){node.replaceChildren();for(const row of rows){const article=document.createElement('article');article.append(text('h3',row.title),text('p',row.body));node.append(article);}}
  function faqs(node,rows){node.replaceChildren();for(const row of rows){const details=document.createElement('details');details.append(text('summary',row.title),text('p',row.body));node.append(details);}}
  function apply(){
    for(const group of schema.groups){const record=settings[group.key],v=schema.values(group,record);
      for(const field of group.fields){if(!field.selector)continue;
        const key=group.key+'.'+field.key;
        for(const node of document.querySelectorAll(field.selector)){
          const original=cache(key,node),custom=record?.values&&Object.hasOwn(record.values,field.key),value=v[field.key];
          const defaultValue=JSON.stringify(value)===JSON.stringify(schema.clean(field,field.default));
          if(!custom||defaultValue){
            if(node.dataset.siteEdited===key){if(field.type==='image'){if(original.src)node.setAttribute('src',original.src);}else if(field.type==='url'){if(original.href)node.setAttribute('href',original.href);}else node.replaceChildren(...original.children.map(n=>n.cloneNode(true)));node.style.whiteSpace=original.whiteSpace;delete node.dataset.siteEdited;}
            continue;
          }
          node.dataset.siteEdited=key;
          if(field.type==='image'){node.src=value||original.src;}
          else if(field.type==='url'){if(value)node.href=value;else node.removeAttribute('href');}
          else if(field.type==='cards')cards(node,value);
          else if(field.type==='rules')rules(node,value);
          else if(field.type==='faqs')faqs(node,value);
          else{node.textContent=value;if(field.type==='textarea')node.style.whiteSpace='pre-line';}
        }
      }
      if(group.key==='event'){
        const entry=document.querySelector('.g-event');if(entry){entry.hidden=!v.enabled;entry.setAttribute('aria-label','查看'+v.title.replace(/\s+/g,'')+'活動');}
        const schoolText=v.schoolA+' × '+v.schoolB;
        const schools=document.querySelector('.g-event .photo-school');if(schools){schools.textContent=v.schoolA+'\n× '+v.schoolB;schools.style.whiteSpace='pre-line';}
        document.querySelector('#eventTitle').textContent=v.title.replace(/\n/g,'');document.querySelector('#eventDialog .event-schools').textContent=schoolText;
        const paragraphs=document.querySelectorAll('#eventDialog>p:not(.event-schools)');if(paragraphs[0])paragraphs[0].textContent=schoolText+'，邀請主人一同參與。';
        const link=document.querySelector('#eventDialog>a');if(v.link){link.href=v.link;link.hidden=false;}else link.hidden=true;
      }
    }
    const visitGroup=schema.groups.find(g=>g.key==='visit');document.dispatchEvent(new CustomEvent('ephemere:presentation-updated',{detail:{visit:schema.values(visitGroup,settings.visit)}}));
  }
  window.EphemereSitePresentationUI=Object.freeze({apply(value){settings=value&&typeof value==='object'?value:{};apply();}});
  document.addEventListener('ephemere:home-rendered',apply);apply();
  function subscribe(){if(!window.firebase?.apps?.length)return;firebase.database().ref(schema.path).on('value',snap=>{settings=snap.val()||{};apply();},()=>{console.warn('官網文字設定暫時無法讀取，保留現有內容。');});}
  // The official Firebase initializer runs later in the same deferred-script sequence.
  if(window.firebase?.apps?.length)subscribe();else document.addEventListener('DOMContentLoaded',subscribe,{once:true});
})();
