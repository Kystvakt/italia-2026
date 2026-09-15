let romeFocus='day';
const ROME_STOPS={
  2:[['capitol','09:30',-30,48],['campidoglio','11:00',22,-26],['navona','13:00',-30,-20],['ignazio','14:00',-25,50],['trevi','15:20',28,24],['sordi','16:00',-35,-30],['rinascente','17:05 · 18:30 저녁',25,-26]],
  3:[['doria','09:30',-20,65],['basilica','14:15',25,-60],['sanpietro','15:30',25,85],['castello','16:25~17:00',25,-65],['bridge','16:25~17:00',25,130],['luigi','17:40',25,-30]]
};
const ROME_EVENT_KEYS={
  '카피톨리니 박물관':'capitol','캄피돌리오 광장':'campidoglio','나보나 광장':'navona','산 이냐시오 성당':'ignazio','트레비 분수':'trevi','알베르토 소르디 아케이드':'sordi','리나셴테 트리토네점':'rinascente','도리아 팜필리 갤러리':'doria','산 루이지 데이 프란체시 성당':'luigi','바르베리니 미술관':'barberini','성 베드로 대성당':'basilica','성 베드로 광장':'sanpietro','콜라 디 리엔초 상가':'cola','보르고 피오':'borgo'
};
function romeEventBadges(d,e){const keys=e[1]==='산탄젤로성 외관·산탄젤로 다리'?['castello','bridge']:[ROME_EVENT_KEYS[e[1]]||(e[1]==='저녁'&&d===2?'rinascente':null)];return keys.map(key=>{const i=(ROME_STOPS[d]||[]).findIndex(s=>s[0]===key);return i<0?'':'<span class="event-map-number">'+(i+1)+'</span>';}).join('');}
function romeProjection(bounds){
  const [west,south,east,north]=bounds,W=1100,H=620,lat=(south+north)/2,lon=(west+east)/2;
  const mx=111320*Math.cos(lat*Math.PI/180),my=111320;
  const scale=Math.min((W-100)/((east-west)*mx),(H-100)/((north-south)*my));
  return {W,H,scale,project:xy=>[W/2+(xy[0]-lon)*mx*scale,H/2-(xy[1]-lat)*my*scale]};
}
function mapPath(coords,project){return coords.map((xy,i)=>{const p=project(xy);return (i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' ');}
function mapExternal(p){return 'https://www.openstreetmap.org/'+p.osm;}
function renderRomeRoads(project,wide=false){
  const rank=k=>/^(motorway|trunk)/.test(k)?3:/^(primary|secondary)/.test(k)?2:/^(tertiary)/.test(k)?1:0;
  return [...ROME_MAP.roads].filter(r=>!wide||rank(r.kind)>=2).sort((a,b)=>rank(a.kind)-rank(b.kind)).map(r=>{const level=rank(r.kind),foot=['footway','path','steps','pedestrian'].includes(r.kind);const width=wide?(level===3?2.6:1.2):(level>=2?3.4:level===1?2.5:foot?1.1:1.6);return '<path d="'+mapPath(r.xy,project)+'" fill="none" stroke="'+(level>=2?'#aeb7c0':foot?'#d0d5d9':'#c3cbd1')+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round"/>';}).join('');
}
function renderRomeMap(d){
  if(d===1)return renderRomeArrival();
  const detail=d===3&&romeFocus==='afternoon';
  const bounds=d===2?[12.470,41.891,12.490,41.905]:detail?[12.448,41.897,12.480,41.907]:[12.448,41.894,12.487,41.907];
  const {W,H,project,scale}=romeProjection(bounds),all=ROME_STOPS[d],stops=detail?all.filter(s=>s[0]!=='doria'):all;
  let drawing=`<defs><clipPath id="rome-clip"><rect width="${W}" height="${H}"/></clipPath></defs><rect width="${W}" height="${H}" fill="#f7f7f7"/><g clip-path="url(#rome-clip)">`;
  drawing+=`<path d="${ROME_MAP.river.map(r=>mapPath(r,project)+' Z').join(' ')}" fill="#bcd5da" fill-rule="evenodd"/>`;
  drawing+=renderRomeRoads(project);
  const roadLabels=d===2?[
    ['Via del Corso',[12.4799,41.9044],-79],['Via del Tritone',[12.4876,41.9024],-24],['Corso Vittorio Emanuele II',[12.4754,41.8961],0],['Tevere · 테베레강',[12.4655,41.8978],-65]
  ]:[['Via della Conciliazione',[12.4603,41.9021],0],['Tevere · 테베레강',[12.466,41.898],-65]];
  for(const [name,xy,angle] of roadLabels){const [x,y]=project(xy);drawing+=`<text class="map-road-label" x="${x}" y="${y}" text-anchor="middle" transform="rotate(${angle} ${x} ${y})">${esc(name)}</text>`;}
  const refs=['pantheon'];
  for(const key of refs){const p=ROME_MAP.places[key],[x,y]=project(p.xy);drawing+=`<circle cx="${x}" cy="${y}" r="3" fill="#9aa69d"/><text class="map-ref" x="${x+8}" y="${y+(key==='castello'?42:5)}">${esc(p.ko)}</text>`;}
  drawing+='</g>';
  const routePlaces=Object.fromEntries(stops.map(s=>[s[0],ROME_MAP.places[s[0]]]));
  drawing+=renderMapRoutes('rome-'+d,routePlaces,project,routeObstacles(stops,ROME_MAP.places,project,true,detail));
  for(const stop of stops){
    const [key,time,ox,oy]=stop,p=ROME_MAP.places[key],n=all.findIndex(s=>s[0]===key)+1,[x,y]=project(p.xy);
    let dx=ox,dy=oy;
    if(detail){const offsets={basilica:[25,-60],sanpietro:[25,85],castello:[25,-65],bridge:[25,100],luigi:[-25,70]};[dx,dy]=offsets[key];}
    const lx=x+dx,ly=y+dy,anchor=dx<0?'end':'start';
    drawing+=`<a class="map-pin-link" href="${mapExternal(p)}" target="_blank" rel="noopener" aria-label="${esc(p.ko)} 일반 지도에서 보기"><title>${esc(p.ko+' · '+p.name+' · '+time)}</title><path d="M${x},${y} L${lx},${ly}" stroke="#789187" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="3" fill="#236658"/><circle class="map-pin" cx="${lx}" cy="${ly}" r="12" fill="#236658" stroke="white" stroke-width="2"/><text x="${lx}" y="${ly+4}" fill="white" font-size="12" font-weight="bold" text-anchor="middle">${n}</text><text class="map-place-title" x="${lx+(dx<0?-18:18)}" y="${ly+5}" text-anchor="${anchor}">${esc(p.ko)}</text><text class="map-place-sub" x="${lx+(dx<0?-18:18)}" y="${ly+22}" text-anchor="${anchor}">${esc(p.name)}</text></a>`;
  }
  const meters=detail?250:500,bar=meters*scale;
  drawing+=`<g transform="translate(32 573)"><rect x="-12" y="-23" width="${bar+50}" height="58" rx="7" fill="white" opacity=".9"/><path d="M0 -5 V5 H${bar} V-5" fill="none" stroke="#304e45" stroke-width="2"/><text x="0" y="24" font-size="12" fill="#304e45">0</text><text x="${bar}" y="24" text-anchor="end" font-size="12" fill="#304e45">${meters} m</text></g><g transform="translate(1050 48)"><path d="M0 18 L0 -10 M-5 -2 L0 -10 L5 -2" fill="none" stroke="#304e45" stroke-width="2"/><text y="-20" text-anchor="middle" font-size="14" fill="#304e45">N</text></g>`;
  const buttons=d===3?`<div class="map-toggle"><button type="button" data-rome-focus="day" aria-pressed="${!detail}">하루 전체</button><button type="button" data-rome-focus="afternoon" aria-pressed="${detail}">오후 동선 확대</button></div>`:'';
  return `<section class="rome-map" aria-label="로마 일정 위치 지도"><div class="map-header"><div><h3>로마 · ${d===2?'9월 27일':'9월 28일'} 위치 지도</h3><p>번호는 시간표와 연결됩니다 · 장소를 누르면 일반 지도에서 열립니다</p></div>${buttons}</div><div class="map-scroll"><svg class="map-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="실제 좌표와 주요 도로, 테베레강으로 표시한 로마 일정 지도"><title>로마 일정의 실제 위치와 거리</title>${drawing}</svg></div><div class="map-foot"><span>● 일정 장소　<span style="color:#84918a">● 위치 비교용 명소</span>　</span><span>북쪽이 위 · 눈금으로 거리 비교 · 모바일에서는 지도를 좌우로 밀어 보기</span></div><div class="map-places">${all.map(([key,time],i)=>{const p=ROME_MAP.places[key];return `<div class="map-place-item"><span class="map-number">${i+1}</span><div><a href="${mapExternal(p)}" target="_blank" rel="noopener">${esc(p.ko)}</a><small>${esc(time)}</small></div></div>`}).join('')}</div>${routeNotes('rome-'+d,routePlaces)}<div class="map-note">시설·광장 대표 위치와 실제 도로·강 형상을 사용했습니다. 숙소와 미선정 식당은 위치가 정해진 뒤 표시합니다. <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors · ODbL</a> · 2026-09-13 조회</div></section>`;
}
function renderRomeArrival(){
  const airport=ROME_MAP.places.airport,center=ROME_MAP.places.campidoglio;
  const {project,scale}=romeProjection([12.22,41.79,12.51,41.92]);
  const a=project(airport.xy),c=project(center.xy),bar=5000*scale;
  const background='<defs><clipPath id="arrival-clip"><rect width="1100" height="620"/></clipPath></defs><g clip-path="url(#arrival-clip)"><path d="'+ROME_MAP.river.map(r=>mapPath(r,project)+' Z').join(' ')+'" fill="#bcd5da" fill-rule="evenodd"/>'+(ROME_MAP.waterways||[]).map(r=>'<path d="'+mapPath(r,project)+'" fill="none" stroke="#8ebcc9" stroke-width="3"/>').join('')+renderRomeRoads(project,true)+'</g>';

  return `<section class="rome-map"><div class="map-header"><div><h3>9월 26일 · 도착 공항과 로마</h3><p>로마 중심부는 캄피돌리오 광장을 기준으로 표시했습니다.</p></div></div><div class="map-scroll"><svg class="map-svg" viewBox="0 0 1100 620" role="img" aria-label="피우미치노 공항과 로마 중심부의 실제 상대 위치"><rect width="1100" height="620" fill="#f7f7f7"/>${background}${renderMapRoutes('rome-1',ROME_MAP.places,project,[[a[0],a[1]-20,280,60],[c[0]-260,c[1]-20,280,60]])}<g transform="translate(${a[0]} ${a[1]})"><circle r="10" fill="#236658"/><text x="20" y="5" class="map-place-title">피우미치노 공항 · FCO</text><text x="20" y="25" class="map-place-sub">19:35 도착</text></g><g transform="translate(${c[0]} ${c[1]})"><circle r="10" fill="#236658"/><text x="-20" y="5" text-anchor="end" class="map-place-title">로마 중심부</text><text x="-20" y="25" text-anchor="end" class="map-place-sub">Roma · 숙소 위치 미정</text></g><g transform="translate(50 565)"><path d="M0 -5 V5 H${bar} V-5" fill="none" stroke="#304e45" stroke-width="2"/><text x="${bar}" y="28" text-anchor="end" font-size="14">5 km</text></g><text x="1040" y="48" font-size="16">↑ N</text></svg></div>${routeNotes('rome-1',ROME_MAP.places)}<div class="map-arrival"><a href="${mapExternal(airport)}" target="_blank" rel="noopener">피우미치노 공항을 일반 지도에서 보기</a> · 공항에서 숙소까지의 이동은 숙소 선정 후 정합니다.</div><div class="map-note"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors · ODbL</a> · 2026-09-13 조회</div></section>`;
}
