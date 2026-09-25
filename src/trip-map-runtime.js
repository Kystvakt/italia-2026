TRIP_MAP.places.fstay={ko:'숙소 주변',name:'숙소 주변',xy:[11.251,43.772]};
TRIP_MAP.places.vstay={ko:'숙소 주변',name:'숙소 주변',xy:[12.204,45.477]};
TRIP_MAP.places.mestre={ko:'메스트레역',name:'Venezia Mestre',xy:[12.231,45.482]};
TRIP_MAP.places.correr={"ko":"코레르 박물관","name":"Museo Correr","xy":[12.338,45.434],"source":"https://fr.wikipedia.org/wiki/Mus%C3%A9e_Correr"};
let tripFocus={};
const TRIP_PANELS={"4":[{"id":"florence","city":"florence","title":"9월 29일 · 피렌체","bounds":[11.239,43.759,11.273,43.78],"meters":500,"stops":[["fsmn","1","11:11 도착",-20,-20],["fduomo","2","14:15 내부",28,-22],["calz","3","15:20 상가",-35,5],["signoria","4","16:00 광장",25,-5],["loggia","5","16:00 함께 관람",30,36],["ponte","6","17:15 강변",-30,22],["view","7","18:15 전망",25,20]],"note":"두오모 → 상가 → 광장 → 베키오 다리는 도보 구간입니다. 베키오 다리 → 미켈란젤로 광장으로 이어집니다."}],"5":[{"id":"florence-day2","city":"florence","title":"9월 30일 · 바르젤로·우피치와 피렌체 도심","bounds":[11.241,43.7655,11.265,43.779],"meters":250,"stops":[["bargello","1","09:00 입장",25,-20],["uffizi","2","14:15 입장",25,30],["pharmacy","3","17:45 본점 방문",25,25],["market","4","19:30 식당가 · 20:15 저녁",25,-25]],"note":"오전 바르젤로 관람 후 점심을 먹고, 우피치 → 약국 본점 → 중앙시장 순서로 방문합니다."}],"6":[{"id":"arrival","city":"venice","title":"10월 1일 · 두칼레 궁전·산마르코","bounds":[12.311,45.428,12.349,45.446],"meters":500,"stops":[["bus","1","13:33 수상버스",25,40],["ducale","2","15:00 입장",-25,65],["sanmarco","3","17:00 광장·수변",-25,-45]],"refs":["rialto"],"note":"메스트레역 11:23 도착 후 짐 보관·점심. 로마 광장에서 수상버스로 산마르코에 이동해 두칼레 궁전과 광장을 관람하고 곤돌라를 탑니다."}],"7":[{"id":"sights","city":"venice","title":"10월 2일 · 산 로코·프라리·코레르","bounds":[12.32,45.43,12.347,45.441],"meters":250,"stops":[["rocco","1","09:30 관람",-20,55],["frari","2","10:50 관람",-20,-50],["correr","3","14:20 입장",-25,45]],"note":"산 로코와 프라리 관람 후 산마르코 권역으로 이동합니다. 코레르 박물관은 14:20 예약 입장입니다.","refs":[]}]};
const TRIP_EVENT_KEYS={4:{'피렌체 두오모':'fduomo','비아 데이 칼차이우올리':'calz','시뇨리아 광장·로자 데이 란치':'signoria','베키오 다리·아르노강':'ponte','미켈란젤로 광장 전망':'view'},5:{'바르젤로 조각박물관':'bargello','우피치 미술관':'uffizi','산타 마리아 노벨라 약국 본점':'pharmacy','중앙시장 상층 식음 공간':'market','중앙시장에서 저녁':'market'},6:{'두칼레 궁전':'ducale','산마르코 광장·수변':'sanmarco'},7:{'코레르 박물관·국립 고고학 박물관·마르차나 도서관 기념실':'correr','산 로코 대동신회관':'rocco','프라리 성당':'frari','리알토 다리·대운하':'rialto'}};
function tripEventBadges(d,e){
  const badge=n=>`<span class="event-map-number">${n}</span>`;
  if(d===8&&e[1]==='베네치아 메스트레 → 로마 테르미니')return badge('1');
  if(d===8&&['로마 테르미니 → 피우미치노 공항','로마 출발'].includes(e[1]))return badge('2');
  if(d===4&&e[1]==='시뇨리아 광장·로자 데이 란치')return badge('4')+badge('5');
  const extra={4:{'로마 → 피렌체 SMN역':'fsmn','산타 마리아 델 피오레 대성당 내부':'fduomo','두오모 광장':'fduomo'},5:{},6:{'피렌체 → 베네치아 산타 루치아':'vsmn','① 역 → 숙소·짐 보관':'vsmn'}};
  const key=TRIP_EVENT_KEYS[d]?.[e[1]]||extra[d]?.[e[1]],s=TRIP_PANELS[d]?.flatMap(p=>p.stops).find(s=>s[0]===key);
  return s?badge(s[1]):'';
}
function tripEventTitle(d,e){return tripEventBadges(d,e)?e[1].replace(/^[①②]\s*/,''):e[1];}
function renderTripMap(d){
  if(d===8)return renderVeniceStayOverview(d)+renderRomeDeparture();
  const panels=TRIP_PANELS[d];if(!panels)return '';const panel=panels.find(p=>p.id===tripFocus[d])||panels[0];
  const m=TRIP_MAP.maps[panel.city],{project,scale,W,H}=romeProjection(panel.bounds),clip='trip-clip-'+d;
  const polygon=rs=>rs.map(r=>mapPath(r,project)+' Z').join(' ');
  let drawing=`<defs><clipPath id="${clip}"><rect width="${W}" height="${H}"/></clipPath></defs><rect width="${W}" height="${H}" fill="${panel.city==='venice'&&d!==8?'#bdd7de':'#f7f7f7'}"/><g clip-path="url(#${clip})">`;
  for(const rs of m.land)drawing+=`<path d="${polygon(rs)}" fill="#f7f7f7" stroke="#a3b8b3" stroke-width="1" fill-rule="evenodd"/>`;
  for(const r of m.water)drawing+=`<path d="${polygon([r])}" fill="#bdd7de"/>`;
  for(const r of m.roads)drawing+=`<path d="${mapPath(r.xy,project)}" fill="none" stroke="${r.name==='Via dei Calzaiuoli'?'#c1a371':'#d0d0d0'}" stroke-width="${r.name==='Via dei Calzaiuoli'?6:2.3}" stroke-linejoin="round"/>`;
  for(const rs of m.buildings)drawing+=`<path d="${polygon(rs)}" fill="#e1e4e8" stroke="#a8adb5" stroke-width="1" fill-rule="evenodd"/>`;
  drawing+='</g>';
  const waterLabels=panel.city==='florence'?[['Arno · 아르노강',[11.263,43.7657]]]:panel.id==='pisa'?[['Arno · 아르노강',[10.391,43.7142]]]:d===6?[['Canal Grande · 대운하',[12.328,45.4341]]]:d===7?[['Canal Grande · 대운하',[12.3305,45.4355]]]:[];
  for(const [name,xy] of waterLabels){const [x,y]=project(xy);drawing+=`<text x="${x}" y="${y}" text-anchor="middle" font-size="13" fill="#436f7b" paint-order="stroke" stroke="#f7f7f7" stroke-width="3">${esc(name)}</text>`;}
  if(panel.city==='florence')drawing+=renderStayReference(TRIP_MAP.places.fstay,project,-30,-35);
  drawing+=renderMapRoutes(panel.id,TRIP_MAP.places,project,routeObstacles(panel.stops,TRIP_MAP.places,project).concat(waterLabels.map(([name,xy])=>{const [x,y]=project(xy),w=routeTextWidth(name);return [x-w/2,y-16,w,24];})).concat((panel.refs||[]).map(key=>{const p=TRIP_MAP.places[key],[x,y]=project(p.xy),w=routeTextWidth(p.ko,14)+20;return [key==='bus'?x-w:x,y-18,w,38];})));
  for(const key of panel.refs||[]){const p=TRIP_MAP.places[key],[x,y]=project(p.xy),left=key==='bus';drawing+=`<circle cx="${x}" cy="${y}" r="4" fill="#71897e"/><text x="${x+(left?-10:10)}" y="${y+4}" text-anchor="${left?'end':'start'}" font-size="14" fill="#506e64" paint-order="stroke" stroke="#f7f7f7" stroke-width="4">${esc(p.ko)}</text>`;}
  for(const [key,n,time,dx,dy] of panel.stops){const p=TRIP_MAP.places[key],[x,y]=project(p.xy),lx=x+dx,ly=y+dy,tx=lx+(dx<0?-21:21),anchor=dx<0?'end':'start';drawing+=`<a href="${mapExternal(p)}" target="_blank" rel="noopener"><title>${esc(p.ko+' · '+time)}</title><path d="M${x},${y} L${lx},${ly}" stroke="#236658" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="3" fill="#236658"/><circle cx="${lx}" cy="${ly}" r="15" fill="#236658" stroke="white" stroke-width="2"/><text x="${lx}" y="${ly+4}" font-size="12" font-weight="bold" fill="white" text-anchor="middle">${n}</text><text x="${tx}" y="${ly+5}" text-anchor="${anchor}" font-size="16" font-weight="bold" fill="#213d3a" paint-order="stroke" stroke="#f7f7f7" stroke-width="4">${esc(p.ko)}</text></a>`;}
  const bar=panel.meters*scale;
  drawing+=`<g transform="translate(35 570)"><rect x="-12" y="-20" width="${bar+38}" height="55" rx="6" fill="white" opacity=".92"/><path d="M0 -5 V5 H${bar} V-5" fill="none" stroke="#304e45" stroke-width="2"/><text x="0" y="25" font-size="12">0</text><text x="${bar}" y="25" text-anchor="end" font-size="12">${panel.meters>=1000?panel.meters/1000+' km':panel.meters+' m'}</text></g><text x="1040" y="45" font-size="16" fill="#304e45">↑ N</text>`;
  const toggles=panels.length>1?`<div class="map-toggle">${panels.map((p,i)=>`<button type="button" data-trip-focus="${p.id}" aria-pressed="${p.id===panel.id}">${['피사 전체','광장 확대','피렌체 복귀'][i]}</button>`).join('')}</div>`:'';
  return (panel.city==='venice'?renderVeniceStayOverview(d):'')+`<section class="rome-map" aria-label="${esc(panel.title)} 위치 지도"><div class="map-header"><div><h3>${panel.title}</h3><p>실제 좌표 · 북쪽이 위 · 번호와 시간표 연결</p></div>${toggles}</div><div class="map-scroll"><svg xmlns="http://www.w3.org/2000/svg" class="map-svg" viewBox="0 0 1100 620" role="img" aria-label="${esc(panel.title)} 실제 위치와 거리"><title>${esc(panel.title)}</title>${drawing}</svg></div><div class="map-foot"><span>● 일정 장소　<span style="color:#71897e">● 위치 비교·환승 지점</span></span><span>눈금은 직선거리 비교용 · 장소를 누르면 Google Maps에서 열립니다</span></div><div class="map-places">${panel.stops.map(([key,n,time])=>{const p=TRIP_MAP.places[key];return `<div class="map-place-item"><span class="map-number">${n}</span><div><a href="${mapExternal(p)}" target="_blank" rel="noopener">${esc(p.ko)}</a><small>${esc(p.name)}</small><small>${esc(time)}</small></div></div>`;}).join('')}</div><div class="map-note">${panel.note}</div>${routeNotes(panel.id,TRIP_MAP.places)}<div class="map-note">시설 대표 좌표와 주요 도로·강·운하 형상을 표시했습니다. <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors · ODbL</a> · 2026-09-13 조회</div></section>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-trip-focus]');if(b){tripFocus[day]=b.dataset.tripFocus;render();}});

function renderVeniceStayOverview(d){
 const places=TRIP_MAP.places,keys=d===8?['vstay','mestre']:['vstay','mestre','bus',d===6?'sanmarco':'rocco',...(d===7?['correr']:[])];
 const points=keys.map(k=>places[k].xy),west=Math.min(...points.map(p=>p[0]))-.007,east=Math.max(...points.map(p=>p[0]))+.025,south=Math.min(...points.map(p=>p[1]))-.01,north=Math.max(...points.map(p=>p[1]))+.012;
 const merc=p=>[6378137*p[0]*Math.PI/180,6378137*Math.log(Math.tan(Math.PI/4+p[1]*Math.PI/360))];
 const a=merc([west,south]),b=merc([east,north]),pixelScale=Math.min(850/(b[0]-a[0]),270/(b[1]-a[1])),cx=(a[0]+b[0])/2,cy=(a[1]+b[1])/2;
 const projectMerc=p=>[550+(p[0]-cx)*pixelScale,200-(p[1]-cy)*pixelScale],project=p=>projectMerc(merc(p));
 const scale=pixelScale/Math.cos((south+north)/2*Math.PI/180);
 const edges=d===8?[['vstay','mestre']]:d===6?[['mestre','vstay'],['vstay','bus'],['bus','sanmarco'],['sanmarco','vstay']]:[['vstay','bus'],['bus','rocco'],['rocco','correr'],['correr','vstay']];
 let drawing=`<defs><marker id="stay-arrow-${d}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1 L9 5 L1 9 Z" fill="#596a90"/></marker></defs><rect width="1100" height="400" fill="#f7f7f7"/>`;
 const bg=TRIP_MAP.overview;
 drawing+='<defs><clipPath id="stay-terrain-'+d+'"><rect width="1100" height="400"/></clipPath></defs><g clip-path="url(#stay-terrain-'+d+')">';
 for(const rs of bg.water)drawing+='<path d="'+rs.map(r=>mapPath(r,project)+' Z').join(' ')+'" fill="#bdd7de" stroke="#a3b8b3" stroke-width="0.7" fill-rule="evenodd"/>';
 for(const r of bg.waterways)drawing+='<path d="'+mapPath(r,project)+'" fill="none" stroke="#9ec8d2" stroke-width="1.3"/>';
 for(const r of bg.roads){const major=/^(motorway|trunk|primary)/.test(r.kind);drawing+='<path d="'+mapPath(r.xy,project)+'" fill="none" stroke="'+(major?'#aeb8c1':'#cdd3d8')+'" stroke-width="'+(major?2.2:1.2)+'" stroke-linecap="round"/>';}
 for(const r of bg.rails)drawing+='<path d="'+mapPath(r,project)+'" fill="none" stroke="#85929f" stroke-width="1" stroke-dasharray="4 2"/>';
 drawing+='</g>';
 edges.forEach(([a,b],i)=>{const x=project(places[a].xy),y=project(places[b].xy),dx=y[0]-x[0],dy=y[1]-x[1],len=Math.hypot(dx,dy)||1,bend=i===edges.length-1&&d!==8?55:-20,c=[(x[0]+y[0])/2-dy/len*bend,(x[1]+y[1])/2+dx/len*bend];drawing+=`<path d="M${x} Q${c} ${y}" fill="none" stroke="#596a90" stroke-width="2" stroke-dasharray="7 5" marker-end="url(#stay-arrow-${d})"><title>${esc(places[a].ko+' → '+places[b].ko)}</title></path>`;});
 for(const k of keys){const p=places[k];if(k==='vstay'){drawing+=renderStayReference(p,project,-15,30);continue;}const [x,y]=project(p.xy),dy=k==='mestre'?-20:k==='bus'?-45:k==='rocco'?-12:28,dx=k==='bus'?-30:20;drawing+=`<g><circle cx="${x}" cy="${y}" r="6" fill="#236658"/><path d="M${x},${y} l${dx},${dy}" stroke="#789187"/><text x="${x+dx}" y="${y+dy}" text-anchor="${dx<0?'end':'start'}" font-size="15" fill="#213d3a" paint-order="stroke" stroke="white" stroke-width="4">${esc(p.ko)}</text></g>`;}
 const meters=d===8?500:2000,bar=meters*scale;
 drawing+=`<g transform="translate(45 365)"><path d="M0 -5 V5 H${bar} V-5" fill="none" stroke="#304e45" stroke-width="2"/><text x="${bar}" y="23" text-anchor="end" font-size="12">${meters>=1000?meters/1000+' km':meters+' m'}</text></g><text x="1040" y="35" font-size="14">↑ N</text>`;
 return `<section class="rome-map"><div class="map-header"><div><h3>베네치아 · 숙소 주변과 ${d===8?'출발역':'본섬 동선'}</h3><p>대략적인 위치와 방문 순서 · S 숙소 주변</p></div></div><div class="map-scroll"><svg class="map-svg" viewBox="0 0 1100 400" role="img" aria-label="숙소 주변과 베네치아 이동 지점의 상대 위치">${drawing}</svg></div><div class="map-note"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors · ODbL</a></div></section>`;
}
