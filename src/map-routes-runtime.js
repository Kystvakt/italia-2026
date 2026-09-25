// Endpoints are geographic POIs; curves illustrate order, not navigable paths.
const MAP_ROUTES={
 'rome-1':[['airport','stay','move','',-70,'숙소 주변으로 이동']],
 'rome-2':[["colosseo","forum","walk","15분",-35,"포로 로마노 입구 접근 포함"],["forum","campidoglio","walk","20분",35,"점심 후 광장으로 이동"],["campidoglio","navona",'move','',-55,"광장으로 이동"],["navona","ignazio","walk","15~20분",-35,"여유 포함 이동시간"],["ignazio","trevi","walk","15~20분",-35,"여유 포함 이동시간 · 출발 전 휴식 제외"],["trevi","sordi","walk","10분",35,"여유 포함 이동시간"],["sordi","rinascente","walk","20분",-35,"여유 포함 이동시간"]],
 'rome-3':[["vatican","pinacoteca","walk","",-20,"박물관 입장 후 회화관 관람"],["pinacoteca","pigna","walk","",25,"카페테리아 휴식 후 솔방울 정원·본관 관람"],["pigna","sistine","walk","",35,"본관 전시실을 관람하며 시스티나 소성당으로 이동"],["sistine","sanpietro","walk","",60,"박물관 퇴장 후 성 베드로 광장으로 이동"],["sanpietro","basilica","walk","",25,"광장에서 대성당 내부로 입장"],["basilica","doria",'move','',70,"옵션 1 · 도리아 팜필리"]],
 'florence':[['fsmn','fduomo','walk','직접 약 15~20분',-35,'역→두오모 직접 이동 참고 · 실제 일정은 숙소·점심 경유'],['fduomo','calz','walk','약 3~5분',30,'상가 북쪽 구간 · 구경 시간 제외 예상'],['calz','signoria','walk','약 3~5분',30,'상가 남쪽 구간 · 구경 시간 제외 예상'],['signoria','loggia','walk','약 1~3분',25,'광장 안 이동 예상'],['loggia','ponte','walk','15분',-25,'여유 포함 이동시간 · 휴식 제외'],['ponte','view','move','',-45,'광장으로 이동']],
 'florence-day2':[["bargello","uffizi","walk","약 10~15분",-35,"두 미술관 사이 직접 이동 · 중간 점심 별도"],["uffizi","pharmacy","walk","30분",40,"17:15 출발 · 17:45 도착"],["pharmacy","market","walk","30분",-35,"18:30 출발 · 19:00 도착"]],
 'pisa':[['psmn','tower','move','',-60,'왕복 이동',true]],
 'square':[['tower','pduomo','walk','약 3~5분',30,'건물 입구 사이 이동 예상 · 입장 대기 제외'],['pduomo','baptistery','walk','약 3~5분',-30,'건물 입구 사이 이동 예상'],['baptistery','campo','walk','약 3~5분',-30,'건물 입구 사이 이동 예상']],
 'return':[['fsmn','pharmacy','walk','약 15분',-35,'30분 편성 중 휴식 약 15분 제외'],['pharmacy','market','walk','30분',-35,'여유 포함 이동시간']],
 'arrival':[["bus","ducale","boat","승선 49분 + 도보",60,"13:33 출발 · 14:22 산차카리아 도착 후 궁전 입구로 이동"],["ducale","sanmarco","walk","약 5분",30,"궁전에서 광장으로 이동"]],
 'sights':[["rocco","frari","walk","약 5분",-40,"인접한 두 건물 사이 이동"],["frari","correr","walk","35분",-30,"산마르코 권역 이동 · 점심과 입장 준비 별도"]],
 'rome-return':[["termini","airport","train","약 32분",-70,"Leonardo Express 승차 시간 · 환승과 승차 대기 별도"]]
};
MAP_ROUTES['rome-2'].unshift(['stay','colosseo','move','',-25,'숙소 주변에서 출발']);
MAP_ROUTES['rome-2'].push(['rinascente','stay','move','',30,'숙소 주변으로 복귀']);
MAP_ROUTES['rome-3'].unshift(['stay','vatican','move','',-45,'숙소 주변에서 바티칸 박물관으로 이동']);
MAP_ROUTES['rome-3'].push(['doria','stay','move','',40,'옵션 1 · 숙소 주변으로 복귀']);
MAP_ROUTES.florence.splice(0,1,['fsmn','fstay','move','',25,'도착 후 숙소 주변으로 이동'],['fstay','fduomo','move','',-25,'숙소 주변에서 관광 시작']);
MAP_ROUTES.florence.push(['view','fstay','move','',40,'숙소 주변으로 복귀']);
MAP_ROUTES['florence-day2'].unshift(['fstay','bargello','move','',-30,'숙소 주변에서 출발']);
MAP_ROUTES['florence-day2'].push(['market','fstay','move','',30,'숙소 주변으로 복귀']);
const ROUTE_COLORS={walk:'#b26a28',move:'#925989',bus:'#925989',boat:'#227d9c',train:'#5e6487'};
const ROUTE_MODES={walk:'도보',move:'이동',bus:'버스',boat:'수상버스',train:'철도'};
function routeTextWidth(s,size=13){return [...s].reduce((n,c)=>n+(/[\u1100-\uffff]/.test(c)?size:size*.58),0);}
function routeObstacles(stops,places,project,rome=false,detail=false){return stops.flatMap(s=>{const key=s[0],p=places[key],[x,y]=project(p.xy);let [dx,dy]=rome?s.slice(2):s.slice(3);if(detail)[dx,dy]=ROME_DETAIL_OFFSETS[key]||[dx,dy];const width=Math.max(routeTextWidth(p.ko,16),rome?routeTextWidth(p.name,11):0)+28,lx=x+dx,ly=y+dy;return [[lx+(dx<0?-width-18:-18),ly-22,width+36,rome?60:44],[x-9,y-9,18,18]];});}
function renderMapRoutes(key,places,project,obstacles=[]){
 const routes=(MAP_ROUTES[key]||[]).filter(r=>places[r[0]]&&places[r[1]]),uid='route-'+key;
 let paths='',labels='';const occupied=[...obstacles,[15,535,250,80],[1010,5,80,70]];
 const overlap=(a,b)=>a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1];
 for(const [from,to,mode,time,bend,note,both] of routes){const a=project(places[from].xy),b=project(places[to].xy),dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy)||1,c=[(a[0]+b[0])/2-dy/length*bend,(a[1]+b[1])/2+dx/length*bend],mid=[(a[0]+2*c[0]+b[0])/4,(a[1]+2*c[1]+b[1])/4],color=ROUTE_COLORS[mode],path=`M${a} Q${c} ${b}`,text=ROUTE_MODES[mode]+(time?' '+time:'');
  paths+=`<g class="route-segment"><title>${esc(places[from].ko+(both?' ↔ ':' → ')+places[to].ko+' · '+text+' · '+note)}</title><path d="${path}" fill="none" stroke="white" stroke-width="6" opacity=".85"/><path d="${path}" fill="none" stroke="${color}" stroke-width="2.7" stroke-dasharray="${mode==='walk'?'none':'7 5'}" marker-end="url(#${uid}-${mode})" ${both?`marker-start="url(#${uid}-${mode})"`:''}/></g>`;
  if(!time)continue;
  const width=routeTextWidth(text)+18,height=25;let box=null;
  for(const radius of [18,40,65,95,135,180,230,290]){for(const angle of [-Math.PI/2,Math.PI/2,0,Math.PI,-Math.PI/4,Math.PI/4,-3*Math.PI/4,3*Math.PI/4]){const r=[mid[0]+Math.cos(angle)*radius-width/2,mid[1]+Math.sin(angle)*radius-height/2,width,height];if(r[0]>=12&&r[1]>=12&&r[0]+width<=1088&&r[1]+height<=608&&!occupied.some(o=>overlap([r[0]-5,r[1]-5,width+10,height+10],o))){box=r;break;}}if(box)break;}
  if(!box)box=[Math.max(12,Math.min(1088-width,mid[0]-width/2)),Math.max(12,Math.min(580,mid[1]+20)),width,height];occupied.push(box);
  const [x,y,w,h]=box;labels+=`<g class="route-time"><title>${esc(note)}</title><path d="M${mid} L${x+w/2},${y+h/2}" fill="none" stroke="${color}" stroke-width=".8" opacity=".75"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="white" stroke="${color}" stroke-width=".8"/><text x="${x+w/2}" y="${y+17}" text-anchor="middle" font-size="13" font-weight="600" fill="${color}">${esc(text)}</text></g>`;
 }
 return `<defs>${Object.entries(ROUTE_COLORS).map(([mode,color])=>`<marker id="${uid}-${mode}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 L9 5 L1 9 Z" fill="${color}"/></marker>`).join('')}</defs>${paths}${labels}`;
}
function routeNotes(key,places){const rs=(MAP_ROUTES[key]||[]).filter(r=>places[r[0]]&&places[r[1]]);return `<div class="map-note" style="padding-top:12px"><b>동선 화살표 · <span style="color:#b26a28">도보</span> / <span style="color:#925989">이동·버스</span> / <span style="color:#227d9c">수상버스</span> / <span style="color:#5e6487">철도</span></b><br>연결선은 방문 순서 표시입니다. ${rs.map(([a,b,mode,time,,note,both])=>`<div style="margin-top:5px">${esc(places[a].ko+(both?' ↔ ':' → ')+places[b].ko)}: <b>${ROUTE_MODES[mode]} ${esc(time)}</b> · ${esc(note)}</div>`).join('')}${key==='arrival'?' <a href="https://actv.avmspa.it/sites/default/files/avm/navigazione/Actv_nav_linea_1.pdf" target="_blank" rel="noopener">ACTV 1번 시간표</a>':key==='airport'?' <a href="https://www.veneziaairport.it/media/wysiwyg/VCE/Societa-trasparente/altri-contenuti/Carta-servizi-VCE-2026-web.pdf" target="_blank" rel="noopener">베네치아 공항 교통 안내</a>':''}</div>`;}

MAP_ROUTES['rome-3'].push(['basilica','gianicolo','move','',-35,'옵션 2 · 자니콜로'],['gianicolo','stay','move','',-45,'옵션 2 · 숙소 주변으로 복귀']);
