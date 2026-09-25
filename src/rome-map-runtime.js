ROME_MAP.places.gianicolo={ko:'자니콜로',name:'Piazzale Giuseppe Garibaldi',xy:[12.4616,41.8914]};
ROME_MAP.places.stay={ko:'숙소 주변',name:'숙소 주변',xy:[12.503,41.903]};
ROME_MAP.places.vatican={"ko":"바티칸 박물관 입구","name":"Musei Vaticani","xy":[12.453317,41.906949],"source":"https://www.turismoroma.it/it/node/121"};
ROME_MAP.places.pinacoteca={"ko":"회화관 피나코테카","name":"Pinacoteca Vaticana","xy":[12.452769444444444,41.90573055555556],"source":"https://www.wikidata.org/wiki/Q774940"};
ROME_MAP.places.pigna={"ko":"솔방울 정원·본관","name":"Cortile della Pigna, Musei Vaticani","xy":[12.45459,41.90579],"source":"https://mapcarta.com/38468356"};
ROME_MAP.places.sistine={"ko":"시스티나 소성당","name":"Cappella Sistina","xy":[12.4544,41.90293],"source":"https://mapcarta.com/27903538"};
ROME_MAP.places.forum={"ko":"포로 로마노","name":"Foro Romano","xy":[12.485334,41.892283],"source":"https://gazetteer.dainst.org/doc/2093883.html"};
const ROME_DETAIL_OFFSETS={"vatican":[-40,-30],"pinacoteca":[-90,5],"pigna":[70,35],"sistine":[80,-25],"sanpietro":[80,45],"basilica":[-90,40]};
let romeFocus='day';
function romeCourseBadges(step){return (step[4]||[]).map(key=>{const i=ROME_STOPS[3].findIndex(s=>s[0]===key);return i<0?'':'<span class="event-map-number">'+(i+1)+'</span>';}).join('');}
const ROME_STOPS={
  2:[["colosseo","09:45 입장",25,45],["forum","11:15 관람",70,-25],["campidoglio","14:05",-25,45],["navona","15:05",-30,-20],["ignazio","16:05",-25,50],["trevi","17:25",28,24],["sordi","18:05",-35,-30],["rinascente","19:05 · 20:00 저녁",25,-26]],
  3:[["vatican","08:00–09:30",-60,-30],["pinacoteca","09:30–10:30",-50,25],["pigna","11:00–12:20",110,35],["sistine","12:20–12:30",-75,40],["sanpietro","12:30–14:00",100,70],["basilica","12:30–14:00",-50,95],["doria","옵션 1 · 14:00 입장",-20,65],["gianicolo","옵션 2 · 오후",25,30]]
};
const ROME_EVENT_KEYS={
  '바티칸 박물관':'vatican','회화관 피나코테카':'pinacoteca','솔방울 정원·박물관 본관':'pigna','시스티나 소성당':'sistine','콜로세움':'colosseo','포로 로마노':'forum','캄피돌리오 광장':'campidoglio','나보나 광장':'navona','산 이냐시오 성당':'ignazio','트레비 분수':'trevi','알베르토 소르디 아케이드':'sordi','리나셴테 트리토네점':'rinascente','도리아 팜필리 갤러리':'doria','자니콜로':'gianicolo','산 루이지 데이 프란체시 성당':'luigi','바르베리니 미술관':'barberini','성 베드로 대성당':'basilica','성 베드로 광장':'sanpietro','콜라 디 리엔초 상가':'cola','보르고 피오':'borgo'
};
function romeEventBadges(d,e){const keys=e[1]==='성 베드로 대성당·광장'?['sanpietro','basilica']:e[1]==='산탄젤로성 외관·산탄젤로 다리'?['castello','bridge']:[ROME_EVENT_KEYS[e[1]]||(e[1]==='저녁'&&d===2?'rinascente':null)];return keys.map(key=>{const i=(ROME_STOPS[d]||[]).findIndex(s=>s[0]===key);return i<0?'':'<span class="event-map-number">'+(i+1)+'</span>';}).join('');}
function romeProjection(bounds){
  const [west,south,east,north]=bounds,W=1100,H=620,lat=(south+north)/2,lon=(west+east)/2;
  const mx=111320*Math.cos(lat*Math.PI/180),my=111320;
  const scale=Math.min((W-100)/((east-west)*mx),(H-100)/((north-south)*my));
  return {W,H,scale,project:xy=>[W/2+(xy[0]-lon)*mx*scale,H/2-(xy[1]-lat)*my*scale]};
}
function mapPath(coords,project){return coords.map((xy,i)=>{const p=project(xy);return (i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' ');}
function mapExternal(p){const city=p.xy[1]>45?'Venezia':p.xy[1]>43?(p.xy[0]<11?'Pisa':'Firenze'):'Roma';return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.name.replace(/ · /g,', ')+', '+city+', Italy');}
function renderRomeRoads(project,wide=false){
  const rank=k=>/^(motorway|trunk)/.test(k)?3:/^(primary|secondary)/.test(k)?2:/^(tertiary)/.test(k)?1:0;
  return [...ROME_MAP.roads].filter(r=>!wide||rank(r.kind)>=2).sort((a,b)=>rank(a.kind)-rank(b.kind)).map(r=>{const level=rank(r.kind),foot=['footway','path','steps','pedestrian'].includes(r.kind);const width=wide?(level===3?2.6:1.2):(level>=2?3.4:level===1?2.5:foot?1.1:1.6);return '<path d="'+mapPath(r.xy,project)+'" fill="none" stroke="'+(level>=2?'#aeb7c0':foot?'#d0d5d9':'#c3cbd1')+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round"/>';}).join('');
}
function renderRomeMap(d){
  if(d===1)return renderRomeArrival();
  const detail=d===3&&romeFocus==='vatican';
  const bounds=d===2?[12.467,41.887,12.511,41.910]:detail?[12.448,41.901,12.4605,41.910]:[12.444,41.887,12.513,41.915];
  const {W,H,project,scale}=romeProjection(bounds),all=ROME_STOPS[d],stops=detail?all.filter(s=>!['doria','gianicolo'].includes(s[0])):all;
  let drawing=`<defs><clipPath id="rome-clip"><rect width="${W}" height="${H}"/></clipPath></defs><rect width="${W}" height="${H}" fill="#f7f7f7"/><g clip-path="url(#rome-clip)">`;
  drawing+=`<path d="${ROME_MAP.river.map(r=>mapPath(r,project)+' Z').join(' ')}" fill="#bcd5da" fill-rule="evenodd"/>`;
  drawing+=renderRomeRoads(project);
  const roadLabels=d===2?[
    ['Via del Corso',[12.4799,41.9044],-79],['Via del Tritone',[12.4876,41.9024],-24],['Corso Vittorio Emanuele II',[12.4754,41.8961],0],['Tevere · 테베레강',[12.4655,41.8978],-65]
  ]:[['Via della Conciliazione',[12.4603,41.9021],0],['Tevere · 테베레강',[12.466,41.898],-65]];
  for(const [name,xy,angle] of roadLabels){const [x,y]=project(xy);drawing+=`<text class="map-road-label" x="${x}" y="${y}" text-anchor="middle" transform="rotate(${angle} ${x} ${y})">${esc(name)}</text>`;}
  const refs=d===3?(detail?[]:['castello','luigi']):['pantheon'];
  for(const key of refs){const p=ROME_MAP.places[key],[x,y]=project(p.xy);drawing+=`<circle cx="${x}" cy="${y}" r="3" fill="#9aa69d"/><text class="map-ref" x="${x+8}" y="${y+(key==='castello'?42:5)}">${esc(p.ko)}</text>`;}
  drawing+='</g>';
  const routePlaces=Object.fromEntries(stops.map(s=>[s[0],ROME_MAP.places[s[0]]]));
  if(!detail)routePlaces.stay=ROME_MAP.places.stay;
  drawing+=renderMapRoutes('rome-'+d,routePlaces,project,routeObstacles(stops,ROME_MAP.places,project,true,detail));
  if(!detail)drawing+=renderStayReference(ROME_MAP.places.stay,project);
  for(const stop of stops){
    const [key,time,ox,oy]=stop,p=ROME_MAP.places[key],n=all.findIndex(s=>s[0]===key)+1,[x,y]=project(p.xy);
    let dx=ox,dy=oy;
    if(detail)[dx,dy]=ROME_DETAIL_OFFSETS[key]||[ox,oy];
    const lx=x+dx,ly=y+dy,anchor=dx<0?'end':'start';
    drawing+=`<a class="map-pin-link" href="${mapExternal(p)}" target="_blank" rel="noopener" aria-label="${esc(p.ko)} Google Maps에서 보기"><title>${esc(p.ko+' · '+p.name+' · '+time)}</title><path d="M${x},${y} L${lx},${ly}" stroke="#789187" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="3" fill="#236658"/><circle class="map-pin" cx="${lx}" cy="${ly}" r="12" fill="#236658" stroke="white" stroke-width="2"/><text x="${lx}" y="${ly+4}" fill="white" font-size="12" font-weight="bold" text-anchor="middle">${n}</text><text class="map-place-title" x="${lx+(dx<0?-18:18)}" y="${ly+5}" text-anchor="${anchor}">${esc(p.ko)}</text><text class="map-place-sub" x="${lx+(dx<0?-18:18)}" y="${ly+22}" text-anchor="${anchor}">${esc(d===3?time:p.name)}</text></a>`;
  }
  const meters=detail?100:500,bar=meters*scale;
  drawing+=`<g transform="translate(32 573)"><rect x="-12" y="-23" width="${bar+50}" height="58" rx="7" fill="white" opacity=".9"/><path d="M0 -5 V5 H${bar} V-5" fill="none" stroke="#304e45" stroke-width="2"/><text x="0" y="24" font-size="12" fill="#304e45">0</text><text x="${bar}" y="24" text-anchor="end" font-size="12" fill="#304e45">${meters} m</text></g><g transform="translate(1050 48)"><path d="M0 18 L0 -10 M-5 -2 L0 -10 L5 -2" fill="none" stroke="#304e45" stroke-width="2"/><text y="-20" text-anchor="middle" font-size="14" fill="#304e45">N</text></g>`;
  const buttons=d===3?`<div class="map-toggle"><button type="button" data-rome-focus="day" aria-pressed="${!detail}">하루 전체</button><button type="button" data-rome-focus="vatican" aria-pressed="${detail}">바티칸 코스</button></div>`:'';
  return `<section class="rome-map" aria-label="로마 일정 위치 지도"><div class="map-header"><div><h3>로마 · ${d===2?'9월 27일':'9월 28일'} 위치 지도</h3><p>번호는 시간표와 연결됩니다 · 장소를 누르면 Google Maps에서 열립니다</p></div>${buttons}</div><div class="map-scroll"><svg class="map-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="실제 좌표와 주요 도로, 테베레강으로 표시한 로마 일정 지도"><title>로마 일정의 실제 위치와 거리</title>${drawing}</svg></div><div class="map-foot"><span>● 일정 장소　<span style="color:#84918a">● 위치 비교용 명소</span>　</span><span>북쪽이 위 · 눈금으로 거리 비교 · 모바일에서는 지도를 좌우로 밀어 보기</span></div><div class="map-places">${stops.map(([key,time],i)=>{const p=ROME_MAP.places[key];return `<div class="map-place-item"><span class="map-number">${i+1}</span><div><a href="${mapExternal(p)}" target="_blank" rel="noopener">${esc(p.ko)}</a><small>${esc(time)}</small></div></div>`}).join('')}</div>${routeNotes('rome-'+d,routePlaces)}<div class="map-note">시설·광장 대표 위치와 실제 도로·강 형상을 사용했습니다. <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors · ODbL</a> · 2026-09-13 조회</div></section>`;
}
function renderRomeArrival(){
  const airport=ROME_MAP.places.airport,center=ROME_MAP.places.stay;
  const {project,scale}=romeProjection([12.22,41.79,12.51,41.92]);
  const a=project(airport.xy),c=project(center.xy),bar=5000*scale;
  const background='<defs><clipPath id="arrival-clip"><rect width="1100" height="620"/></clipPath></defs><g clip-path="url(#arrival-clip)"><path d="'+ROME_MAP.river.map(r=>mapPath(r,project)+' Z').join(' ')+'" fill="#bcd5da" fill-rule="evenodd"/>'+(ROME_MAP.waterways||[]).map(r=>'<path d="'+mapPath(r,project)+'" fill="none" stroke="#8ebcc9" stroke-width="3"/>').join('')+renderRomeRoads(project,true)+'</g>';

  return `<section class="rome-map"><div class="map-header"><div><h3>9월 26일 · 도착 공항과 로마</h3><p>공항과 숙소 주변의 위치</p></div></div><div class="map-scroll"><svg class="map-svg" viewBox="0 0 1100 620" role="img" aria-label="피우미치노 공항과 로마 중심부의 실제 상대 위치"><rect width="1100" height="620" fill="#f7f7f7"/>${background}${renderMapRoutes('rome-1',ROME_MAP.places,project,[[a[0],a[1]-20,280,60],[c[0]-260,c[1]-20,280,60]])}<g transform="translate(${a[0]} ${a[1]})"><circle r="10" fill="#236658"/><text x="20" y="5" class="map-place-title">피우미치노 공항 · FCO</text><text x="20" y="25" class="map-place-sub">19:15 도착</text></g><g transform="translate(${c[0]} ${c[1]})"><circle r="10" fill="#236658"/><text x="-20" y="5" text-anchor="end" class="map-place-title">숙소 주변</text><text x="-20" y="25" text-anchor="end" class="map-place-sub">S</text></g><g transform="translate(50 565)"><path d="M0 -5 V5 H${bar} V-5" fill="none" stroke="#304e45" stroke-width="2"/><text x="${bar}" y="28" text-anchor="end" font-size="14">5 km</text></g><text x="1040" y="48" font-size="16">↑ N</text></svg></div>${routeNotes('rome-1',ROME_MAP.places)}<div class="map-arrival"><a href="${mapExternal(airport)}" target="_blank" rel="noopener">피우미치노 공항을 Google Maps에서 보기</a> · 19:15 도착 후 입국·수하물 수령을 마치고 시내로 이동합니다.</div><div class="map-note"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors · ODbL</a> · 2026-09-13 조회</div></section>`;
}

function renderRomeDeparture(){
 const {W,H,project,scale}=romeProjection([12.22,41.79,12.53,41.93]);
 const stops=[['termini','1','14:25 도착',25,-30],['airport','2','21:15 출국',25,25]];
 let drawing='<defs><clipPath id="rome-return-clip"><rect width="1100" height="620"/></clipPath></defs><rect width="1100" height="620" fill="#f7f7f7"/><g clip-path="url(#rome-return-clip)"><path d="'+ROME_MAP.river.map(r=>mapPath(r,project)+' Z').join(' ')+'" fill="#bcd5da" fill-rule="evenodd"/>'+(ROME_MAP.waterways||[]).map(r=>'<path d="'+mapPath(r,project)+'" fill="none" stroke="#8ebcc9" stroke-width="3"/>').join('')+renderRomeRoads(project,true)+'</g>';
 drawing+=renderMapRoutes('rome-return',ROME_MAP.places,project,routeObstacles(stops,ROME_MAP.places,project));
 for(const [key,n,time,dx,dy] of stops){const p=ROME_MAP.places[key],[x,y]=project(p.xy),lx=x+dx,ly=y+dy;drawing+='<a href="'+mapExternal(p)+'" target="_blank" rel="noopener"><path d="M'+x+','+y+' L'+lx+','+ly+'" stroke="#789187"/><circle cx="'+lx+'" cy="'+ly+'" r="14" fill="#236658"/><text x="'+lx+'" y="'+(ly+4)+'" fill="white" text-anchor="middle" font-size="12">'+n+'</text><text x="'+(lx+22)+'" y="'+(ly+5)+'" class="map-place-title">'+esc(p.ko)+'</text><text x="'+(lx+22)+'" y="'+(ly+25)+'" class="map-place-sub">'+time+'</text></a>';}
 const bar=5000*scale;drawing+='<g transform="translate(35 570)"><path d="M0 -5 V5 H'+bar+' V-5" fill="none" stroke="#304e45" stroke-width="2"/><text x="'+bar+'" y="25" text-anchor="end" font-size="13">5 km</text></g><text x="1040" y="45" font-size="16">↑ N</text>';
 return '<section class="rome-map"><div class="map-header"><div><h3>10월 3일 · 로마 테르미니역과 피우미치노 공항</h3><p>역·공항의 실제 위치 · 북쪽이 위</p></div></div><div class="map-scroll"><svg class="map-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="로마 테르미니역에서 피우미치노 공항으로 이동하는 지도">'+drawing+'</svg></div><div class="map-places">'+stops.map(([key,n,time])=>{const p=ROME_MAP.places[key];return '<div class="map-place-item"><span class="map-number">'+n+'</span><div><a href="'+mapExternal(p)+'" target="_blank" rel="noopener">'+esc(p.ko)+'</a><small>'+time+'</small></div></div>';}).join('')+'</div>'+routeNotes('rome-return',ROME_MAP.places)+'<div class="map-note"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors · ODbL</a></div></section>';
}

function renderStayReference(p,project,dx=-25,dy=-28){
 const [x,y]=project(p.xy),lx=x+dx,ly=y+dy,anchor=dx<0?'end':'start';
 return `<g aria-label="숙소 주변"><title>숙소 주변</title><path d="M${x},${y} L${lx},${ly}" stroke="#596a90"/><circle cx="${x}" cy="${y}" r="4" fill="#596a90"/><rect x="${lx-11}" y="${ly-11}" width="22" height="22" rx="5" fill="#596a90" stroke="white" stroke-width="2"/><text x="${lx}" y="${ly+4}" text-anchor="middle" fill="white" font-size="12">S</text><text x="${lx+(dx<0?-18:18)}" y="${ly+5}" text-anchor="${anchor}" class="map-place-title" paint-order="stroke" stroke="white" stroke-width="4">숙소 주변</text></g>`;
}
