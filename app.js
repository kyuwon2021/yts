'use strict';
function initReferences(){
 const records=(data.cases||[]).filter(c=>!c.id?.startsWith('ex-'));
 const cats=[['all','전체'],['hvac','시스템에어컨'],['led','디스플레이·TV'],['mobile','모바일'],['plan','구성·제안 자료']];
 let filter='all',page=1,query='';const size=9;
 const matches=(c,k)=>k==='all'||(k==='plan'?c.kind==='plan':c.kind!=='plan'&&(k==='led'?['led','lcd','tv'].includes(c.cat):c.cat===k));
 $('#filters').innerHTML=cats.map(([k,t])=>`<button class="filter${k==='all'?' active':''}" data-filter="${k}" aria-pressed="${k==='all'}">${t} <small>${records.filter(c=>matches(c,k)).length}</small></button>`).join('');
 function render(){const list=records.filter(c=>matches(c,filter)&&[c.title,c.place,c.note,...c.tags||[]].join(' ').toLowerCase().includes(query));const total=Math.ceil(list.length/size);page=Math.min(page,total||1);
 $('#case-count').textContent=query?`검색 결과 ${list.length}건`:`${cats.find(c=>c[0]===filter)[1]} ${list.length}건`;
 $('#case-list').innerHTML=list.slice((page-1)*size,page*size).map(c=>`<a class="case-card" href="case.html?id=${encodeURIComponent(c.id)}"><div class="project-art">${c.img?`<img src="${esc(safeUrl(c.img))}" alt="${esc(c.title)} ${c.kind==='plan'?'구성 자료':'현장'}" loading="lazy">`:icon(c.cat)}<span>${esc(c.year||'')} · ${c.kind==='plan'?'구성·제안':'시공사례'}</span></div><div class="case-copy"><h3>${esc(c.title)}</h3><p class="case-note">${esc(c.note)}</p><div class="tags">${(c.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div><span class="case-link">자세히 보기</span></div></a>`).join('')||'<div class="empty-cases"><h3>검색 결과가 없습니다.</h3><p>다른 현장명이나 솔루션으로 검색해 주세요.</p></div>';
 $('#case-pages').innerHTML=Array.from({length:total},(_,i)=>`<button data-page="${i+1}" aria-label="${i+1}페이지" ${page===i+1?'aria-current="page"':''}>${i+1}</button>`).join('');
 }
 $('#filters').onclick=e=>{const b=e.target.closest('[data-filter]');if(!b)return;filter=b.dataset.filter;page=1;$$('.filter').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});render();};
 $('#case-search').oninput=e=>{query=e.target.value.trim().toLowerCase();page=1;render();};
 $('#case-pages').onclick=e=>{const b=e.target.closest('[data-page]');if(!b)return;page=Number(b.dataset.page);render();$('#case-count').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('#case-pages [aria-current="page"]')?.focus({preventScroll:true});};render();
}
function initHero(){
 const hero=document.querySelector('.hero'), slides=data.hero, original=hero.querySelector('.hero-image');
 original.remove();
 const images=slides.map((s,i)=>{const img=document.createElement('img');img.className='hero-image'+(i===0?' is-active':'');img.src=safeUrl(s.image||data.config.heroPoster);img.alt=s.alt||s.title;img.style.setProperty('--desktop-position',s.position||'center');img.style.setProperty('--mobile-position',s.mobilePosition||'center');img.setAttribute('aria-hidden',String(i!==0));if(i===0)img.fetchPriority='high';hero.prepend(img);return img;});
 let current=0,timer,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,visible=true;
 const tabs=document.querySelector('#hero-tabs'),pause=document.querySelector('#slide-pause');
 tabs.innerHTML=slides.map((s,i)=>`<button data-slide="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${esc(s.label||'솔루션')}</button>`).join('');
 function schedule(){clearTimeout(timer);if(!paused&&visible&&!document.hidden&&!hero.matches(':hover')&&!hero.contains(document.activeElement))timer=setTimeout(()=>show(current+1),6500);}
 function show(n){current=(n+slides.length)%slides.length;const s=slides[current];images.forEach((im,i)=>{im.classList.toggle('is-active',i===current);im.setAttribute('aria-hidden',String(i!==current));});document.querySelector('#hero-eyebrow').textContent=s.eyebrow;document.querySelector('#hero-title').textContent=s.title;document.querySelector('#hero-desc').textContent=s.desc;const cta=document.querySelector('#hero-cta');cta.href=safeUrl(s.link)||'#biz';cta.textContent=(s.cta||'솔루션 알아보기');document.querySelector('#slide-number').textContent=String(current+1).padStart(2,'0');document.querySelector('.slide-total').textContent=String(slides.length).padStart(2,'0');document.querySelector('#slide-progress').style.width=((current+1)/slides.length*100)+'%';tabs.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));schedule();}
 document.querySelector('#slide-prev').onclick=()=>show(current-1);document.querySelector('#slide-next').onclick=()=>show(current+1);
 tabs.onclick=e=>{const b=e.target.closest('[data-slide]');if(b)show(Number(b.dataset.slide));};
 function pauseLabel(){pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'배너 자동 전환 재생':'배너 자동 전환 일시정지');}
 pause.onclick=()=>{paused=!paused;pauseLabel();schedule();};pauseLabel();
 ['mouseenter','mouseleave','focusin'].forEach(e=>hero.addEventListener(e,schedule));hero.addEventListener('focusout',()=>setTimeout(schedule,0));document.addEventListener('visibilitychange',schedule);
 hero.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1));}});
 let touch;hero.addEventListener('touchstart',e=>{touch={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};},{passive:true});hero.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy))show(current+(dx<0?1:-1));touch=null;},{passive:true});
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;schedule();}).observe(hero);
 document.querySelector('#hero-cta').addEventListener('click',()=>{const key=slides[current].key;if(key==='hvac'||key==='led')document.querySelector(`[data-filter="${key}"]`)?.click();});
 show(0);
}
function initFeatures(){
 const features=[['VXT Canvas로 손쉽게 제작','템플릿과 이미지, 텍스트를 활용해 우리 공간에 맞는 안내와 홍보 콘텐츠를 구성합니다.'],['필요한 화면에, 원하는 시간에','플레이리스트와 스케줄을 구성해 지점별·시간대별 메시지를 배포합니다. 반복되는 안내와 캠페인 운영을 체계적으로 준비하세요.'],['여러 장소의 화면을 한곳에서','원격으로 디스플레이를 관리하고 태그로 화면을 구분합니다. 현장 방문을 줄이고 여러 공간의 운영 상태를 효율적으로 살펴보세요.']];
 const buttons=$$('[data-vxt]');function select(i){buttons.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1;});$('#vxt-panel').setAttribute('aria-labelledby',buttons[i].id);$('#vxt-panel').innerHTML=`<h3>${features[i][0]}</h3><p>${features[i][1]}</p>`;}
 buttons.forEach((b,i)=>{b.onclick=()=>select(i);b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const j=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;select(j);buttons[j].focus();}};});
 $$('[data-inquiry]').forEach(a=>a.addEventListener('click',()=>$('#product-select').value=a.dataset.inquiry));
 $('#local-video-list').innerHTML=(data.localVideos||[]).map((v,i)=>`<button class="video-card" data-local-video="${i}" aria-label="${esc(v.title)} 영상 재생" aria-haspopup="dialog"><span class="video-thumb"><img src="${esc(safeUrl(v.poster))}" alt="${esc(v.category)} 참고 이미지" loading="lazy"><i></i></span><b>${esc(v.title)}</b><small>${esc(v.caption)}</small></button>`).join('');
 $('#local-video-list').onclick=e=>{const b=e.target.closest('[data-local-video]');if(!b)return;const v=data.localVideos[Number(b.dataset.localVideo)];$('.video-feature video').pause();$('#video-player').innerHTML=`<video controls autoplay playsinline aria-label="${esc(v.title)}"><source src="${esc(safeUrl(v.src))}" type="video/mp4"></video>`;$('#video-external').textContent='영상 파일 직접 열기 ↗';$('#video-external').href=safeUrl(v.src);$('#video-dialog').showModal();};
}
const $=(s,el=document)=>el.querySelector(s), $$=(s,el=document)=>[...el.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=v=>{try{const u=new URL(v,location.href);return ['http:','https:','file:'].includes(u.protocol)||/^data:image\/(png|jpeg|webp|gif);base64,/i.test(v)?v:'';}catch{return '';}};
const paths={hvac:'<rect x="4" y="5" width="32" height="19" rx="3"/><path d="M8 19h24M10 10h2M28 10h3M12 27c-4 4 4 4 0 8M20 27c-4 4 4 4 0 8M28 27c-4 4 4 4 0 8"/>',led:'<rect x="3" y="5" width="34" height="24" rx="2"/><path d="M13 35h14M20 29v6M8 10h24v14H8zM15 10v14M24 10v14M8 17h24"/>',lcd:'<rect x="3" y="6" width="34" height="25" rx="1"/><path d="M20 6v25M3 18h34M12 35h16"/>',tv:'<rect x="3" y="5" width="34" height="24" rx="2"/><path d="m13 34 2-5m12 5-2-5M8 24l8-8 6 5 5-6 6 9"/>',mobile:'<rect x="11" y="3" width="18" height="34" rx="3"/><path d="M17 7h6M18 32h4M15 12h10v15H15z"/>',solution:'<rect x="3" y="4" width="34" height="25" rx="2"/><path d="M3 10h34M13 35h14M20 29v6M8 15h8v9H8zM21 16h10M21 22h7"/>'};
const icon=k=>`<svg viewBox="0 0 40 40" aria-hidden="true">${paths[k]||paths.solution}</svg>`;
const info={
hvac:{en:'SYSTEM AIR CONDITIONER',body:'공간의 규모와 용도, 냉난방 부하를 고려해 쾌적한 실내 환경을 설계합니다. 신규 설치부터 기존 설비 교체까지 현장에 맞춰 상담해 드립니다.',items:['삼성 DVM S2 VRF 시스템에어컨','환기시스템 및 구역별 냉난방 구성','빌딩 IoT 연계 및 운영 상담']},
led:{en:'LED SIGNAGE',body:'로비, 쇼룸, 상업 공간의 시선을 모으는 대형 디스플레이. 설치 위치와 시청 거리에 맞춰 화면 크기와 구성을 제안합니다.',items:['The Wall IWC 시리즈','올인원 IAC / IEA','공간 맞춤 설치 및 콘텐츠 운영 상담']},
lcd:{en:'LCD SIGNAGE & VIDEO WALL',body:'매장의 안내 화면부터 여러 화면을 연결한 비디오월까지. 설치 환경과 운영 목적에 적합한 사이니지를 구성합니다.',items:['단독형 디지털 사이니지','멀티 디스플레이 비디오월','인도어 / 아웃도어 환경 상담']},
tv:{en:'BUSINESS DISPLAY',body:'호텔 객실과 비즈니스 공간에 어울리는 디스플레이를 제안합니다. 화면 크기와 설치 조건, 운영 방식에 따라 적합한 제품을 상담하세요.',items:['마이크로 RGB TV 도입 상담','호텔 TV / 비즈니스 TV','객실 및 사업장 일괄 납품 상담']},
mobile:{en:'MOBILE FOR BUSINESS',body:'기업과 임직원을 위한 모바일 제품 도입을 지원합니다. 필요한 수량과 사용 목적에 맞춰 제품과 공급 조건을 상담해 드립니다.',items:['갤럭시 스마트폰','태블릿 및 웨어러블','임직원 단체 특판 상담']},
solution:{en:'SAMSUNG VXT · CLOUD CMS',body:'여러 공간의 디스플레이와 콘텐츠를 효율적으로 관리하세요. 운영 환경에 맞는 콘텐츠 관리 구성을 함께 설계합니다.',items:['VXT Canvas 콘텐츠 제작','디바이스 통합 운영','콘텐츠 배포 및 운영 안내']}};
let data=window.YTS_CONTENT;
async function loadData(){if(location.protocol!=='file:'){try{const r=await fetch('content.json',{cache:'no-store'});if(r.ok){const j=await r.json();data={...data,...j,config:{...data.config,...j.config}};}}catch{console.warn('기본 콘텐츠로 표시합니다.');}}}
function shared(){
$('#year').textContent=new Date().getFullYear();$$('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));$$('[data-phone]').forEach(e=>{e.href='tel:'+data.config.phone.replace(/[^+\d]/g,'');e.textContent=data.config.phone;});$$('[data-email]').forEach(e=>{e.href='mailto:'+data.config.email;e.textContent=data.config.email;});$$('[data-youtube]').forEach(e=>e.href=safeUrl(data.config.youtubeChannel)||'https://www.youtube.com/');
const toggle=$('.menu-toggle'),nav=$('#mobile-nav');const close=()=>{nav.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','메뉴 열기');};toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';nav.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');});$$('a',nav).forEach(a=>a.addEventListener('click',close));document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});document.addEventListener('click',e=>{if(!$('#header').contains(e.target))close();});matchMedia('(min-width:801px)').addEventListener('change',e=>{if(e.matches)close();});
$$('dialog').forEach(d=>{$('.dialog-close',d)?.addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});}
function home(){
const mediaSource=safeUrl(data.config.heroVideo);if(mediaSource&&$('video source').getAttribute('src')!==mediaSource){$('video source').src=mediaSource;$('video').load();}
initHero();
const products=data.products||[];$('#products').innerHTML=products.map((p,i)=>`<button class="product-card" data-product="${esc(p.key)}" aria-haspopup="dialog"><span class="product-photo ${p.key==='tv'?'micro-rgb-photo':''}"><img src="${esc(safeUrl(p.image))}" alt="${esc(p.title)} ${['hvac','led','tv','mobile','solution'].includes(p.key)?'콘셉트':'참고 이미지'}" loading="lazy"></span><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p><span class="product-more">자세히 보기</span></button>`).join('');$('#product-select').insertAdjacentHTML('beforeend',products.map(p=>`<option value="${esc(p.key)}">${esc(p.title)}</option>`).join(''));
function openProduct(key){const p=products.find(p=>p.key===key);if(!p)return;const i=p.detail||info[key]||{en:'BUSINESS SOLUTION',body:p.desc,items:[]};$('#product-detail').innerHTML=`${key==='tv'?`<figure class="product-detail-image"><img src="${esc(safeUrl(p.image))}" alt="Micro RGB TV 대화면 공간 콘셉트"><figcaption>AI 제품 연출 이미지 · 실제 제품 외관과 다를 수 있습니다.</figcaption></figure>`:`<div class="dialog-icon">${icon(key)}</div>`}<p class="eyebrow">${esc(i.en)}</p><h2 id="product-title">${esc(p.title)}</h2><p>${esc(i.body)}</p><ul>${i.items.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>${i.note?`<p class="product-detail-note">${esc(i.note)}</p>`:''}`;$('#product-inquiry').dataset.product=key;$('#product-cases').dataset.product=key;$('#product-dialog').setAttribute('aria-labelledby','product-title');$('#product-dialog').showModal();}
$('#products').addEventListener('click',e=>{const b=e.target.closest('[data-product]');if(b)openProduct(b.dataset.product);});$$('[data-select]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openProduct(a.dataset.select);}));$('#product-inquiry').addEventListener('click',e=>{$('#product-select').value=e.currentTarget.dataset.product;$('#product-dialog').close();setTimeout(()=>$('#product-select').focus({preventScroll:true}),200);});const caseFilterFor={hvac:'hvac',led:'led',lcd:'led',tv:'led',solution:'led',mobile:'mobile'};$('#product-cases').addEventListener('click',e=>{const f=caseFilterFor[e.currentTarget.dataset.product]||'all';$('#product-dialog').close();document.querySelector(`[data-filter="${f}"]`)?.click();});
initReferences();
$('#history-list').innerHTML=(data.history||[]).map(h=>`<li class="${h.type==='회사 연혁'?'milestone':'field-record'}"><time>${esc(h.date)}</time><div><span class="history-type">${esc(h.type)}</span><h3>${esc(h.title)}</h3><p>${esc(h.body)}</p></div></li>`).join('');
$('#video-list').innerHTML=(data.videos||[]).filter(id=>/^[\w-]{11}$/.test(id)).map((id,i)=>`<button class="video-card" data-video="${esc(id)}" aria-label="유승 현장 이야기 ${i+1} 영상 재생" aria-haspopup="dialog"><span class="video-thumb"><img src="https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg" alt="(주)유승토탈솔루션 영상 썸네일" loading="lazy"><i></i></span><b>유승 현장 이야기 ${String(i+1).padStart(2,'0')} ↗</b><small>YTS · VIDEO STORY</small></button>`).join('');$$('#video-list img').forEach(img=>img.addEventListener('error',()=>{img.src='assets/hero-poster.jpg';},{once:true}));$('#video-list').addEventListener('click',e=>{const b=e.target.closest('[data-video]');if(!b)return;$('video').pause();$('#video-player').innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.video}?autoplay=1&rel=0" title="(주)유승토탈솔루션 현장 영상" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;$('#video-external').textContent='YouTube에서 보기 ↗';$('#video-external').href='https://www.youtube.com/watch?v='+b.dataset.video;$('#video-dialog').showModal();});$('#video-dialog').addEventListener('close',()=>$('#video-player').replaceChildren());
initFeatures();
const k=data.config.kakaoHomeId;if(k&&!k.includes('여기에')&&/^_[\w-]+$/.test(k)){$('#kakao-link').hidden=false;$('#kakao-link').href=`https://pf.kakao.com/${encodeURIComponent(k)}/chat`;}
const form=$('#contact-form');const inquiry=()=>{const d=new FormData(form);return `[홈페이지 프로젝트 상담]\n\n성함 / 업체명: ${d.get('name')}\n연락처: ${d.get('phone')}\n관심 솔루션: ${products.find(p=>p.key===d.get('product'))?.title||'상담 후 결정'}\n현장 / 업종: ${d.get('site')||'미정'}\n\n문의 내용\n${d.get('message')}`;};
form.elements.phone.removeAttribute('pattern');
function valid(){const phone=form.elements.phone;phone.setCustomValidity(/^[0-9+()\s-]{8,20}$/.test(phone.value)?'':'연락처를 숫자와 하이픈으로 8~20자 입력해 주세요.');return form.reportValidity();}form.elements.phone.addEventListener('input',()=>form.elements.phone.setCustomValidity(''));
const mailtoHref=()=>`mailto:${data.config.email}?subject=${encodeURIComponent('[프로젝트 상담] '+form.elements.name.value)}&body=${encodeURIComponent(inquiry())}`;
form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!valid())return;
  if(form.elements.botcheck&&form.elements.botcheck.checked)return;   /* 봇 차단용 숨은 칸 */
  const btn=form.querySelector('button[type=submit]'),st=$('#form-status'),label=btn.textContent;
  btn.disabled=true;btn.textContent='보내는 중…';st.textContent='';
  const payload={
    access_key:form.elements.access_key.value,
    subject:'[홈페이지 도입 상담] '+form.elements.name.value,
    from_name:'(주)유승토탈솔루션 홈페이지',
    '성함 / 업체명':form.elements.name.value,
    '연락처':form.elements.phone.value,
    '관심 솔루션':products.find(p=>p.key===form.elements.product.value)?.title||'상담 후 결정',
    '현장 / 업종':form.elements.site.value||'미정',
    '문의 내용':form.elements.message.value
  };
  try{
    const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)});
    const j=await r.json().catch(()=>({}));
    if(!r.ok||!j.success)throw new Error(j.message||'전송 실패');
    form.reset();
    st.textContent='상담 신청이 접수되었습니다. 영업일 기준 1일 안에 연락드리겠습니다.';
  }catch(err){
    st.replaceChildren();
    st.append('전송에 실패했습니다. ');
    const a=document.createElement('a');a.href=mailtoHref();a.textContent='메일 앱으로 보내기';a.className='text-link';
    st.append(a);st.append(' 를 이용하시거나 '+data.config.email+'로 보내주세요.');
  }finally{btn.disabled=false;btn.textContent=label;}
});
$('#copy-inquiry').addEventListener('click',async()=>{if(!valid())return;try{await navigator.clipboard.writeText(inquiry());$('#form-status').textContent='문의 내용을 복사했습니다. '+data.config.email+'로 보내주세요.';}catch{let t=$('#copy-fallback');if(!t){t=document.createElement('textarea');t.id='copy-fallback';t.readOnly=true;t.setAttribute('aria-label','복사할 문의 내용');form.append(t);}t.value=inquiry();t.select();$('#form-status').textContent='아래 내용을 선택한 뒤 복사해 이메일로 보내주세요.';}});
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)$$('.desktop-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}),{rootMargin:'-15% 0px -65% 0px'});$$('main section[id]').forEach(s=>observer.observe(s));}}
async function detail(){const id=new URLSearchParams(location.search).get('id')||'';const meta=(data.cases||[]).find(c=>c.id===id&&!c.id.startsWith('ex-'));let d=null;if(/^[a-zA-Z0-9_-]+$/.test(id)){if(location.protocol!=='file:'){try{const r=await fetch(`case-data/${encodeURIComponent(id)}.json`,{cache:'no-store'});if(r.ok)d=await r.json();}catch{}}else d=window.YTS_CASES?.[id]||(id==='jjang-arcade'?window.YTS_CASE:null);}
const root=$('#case-root');if(!meta&&!d){root.innerHTML='<div class="detail-empty"><p class="eyebrow">PROJECT REFERENCE</p><h1>사례를 찾을 수 없습니다.</h1><p>주소를 확인하거나 시공사례 목록에서 다시 선택해 주세요.</p><a class="button blue" href="index.html#cases">시공사례로 돌아가기 ↗</a></div>';return;}d=d||{};const title=d.title||meta?.title||'시공사례';document.title=title+' | (주)유승토탈솔루션';const tags=d.tags||meta?.tags||[],cover=d.cover||meta?.img;
root.innerHTML=`<p class="breadcrumb"><a href="index.html">홈</a> / <a href="index.html#cases">시공사례</a> / ${esc(title)}</p><div class="detail-heading"><p class="eyebrow">PROJECT REFERENCE</p><h1>${esc(title)}</h1><p class="case-place">${esc(d.place||meta?.place||'')}</p><p class="detail-record-type">${esc(meta?.badge||d.year||'현장 기록')}</p><div class="tags">${tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div></div>${cover?`<img class="detail-cover" src="${esc(safeUrl(cover))}" alt="${esc(title)} 현장">`:''}<p class="detail-summary">${esc(d.summary||meta?.note||'프로젝트 상세 내용을 준비하고 있습니다.')}</p>${(d.sections||[]).map(s=>`<section class="detail-section"><h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p>${s.img?`<img src="${esc(safeUrl(s.img))}" alt="${esc(s.heading)}" loading="lazy">`:''}</section>`).join('')}<div class="detail-gallery">${(d.gallery||[]).filter(u=>u!==cover&&!(d.sections||[]).some(s=>s.img===u)).map((u,i)=>`<button data-image="${esc(safeUrl(u))}" aria-label="현장 사진 ${i+1} 확대"><img src="${esc(safeUrl(u))}" alt="${esc(title)} 현장 ${i+1}" loading="lazy"></button>`).join('')}</div>${d.pdf?`<p><a class="button blue" href="${esc(safeUrl('case-data/'+d.pdf))}" target="_blank" rel="noopener">${esc(d.pdfLabel||'시공 완료보고서')} ↗</a></p>`:''}<div class="detail-bottom"><a class="text-link" href="index.html#cases">← 시공사례 목록으로</a><a class="button blue" href="index.html#contact">비슷한 현장 상담하기 ↗</a></div>`;root.addEventListener('click',e=>{const b=e.target.closest('[data-image]');if(b){$('#expanded-image').src=b.dataset.image;$('#expanded-image').alt=title+' 현장 사진';$('#image-dialog').showModal();}});}
loadData().then(()=>{shared();if($('#products'))home();else if($('#case-root'))detail();});
