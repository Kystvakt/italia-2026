const path = require('path');
const projectPath = (...parts) => path.join(__dirname, '..', ...parts);
const fs=require('fs');
const raws=Object.fromEntries(['florence','pisa','venice'].map(c=>[c,JSON.parse(fs.readFileSync(projectPath('data', c+'-map-data.json'),'utf8')).elements]));
raws.venice.push(...JSON.parse(fs.readFileSync(projectPath('data', 'venice-map-land.json'),'utf8')).elements);
function source(c,t,id){const e=raws[c].find(e=>e.type===t&&e.id===id);if(!e)throw Error(`Missing ${c} ${t}/${id}`);return e;}
function xy(e){return e.lat!=null?[e.lon,e.lat]:[(e.bounds.minlon+e.bounds.maxlon)/2,(e.bounds.minlat+e.bounds.maxlat)/2];}
const places={};
function p(key,c,t,id,ko,name){const e=source(c,t,id);places[key]={ko,name:name||e.tags.name,xy:xy(e),osm:t+'/'+id};}
p('fsmn','florence','node',1835203780,'피렌체 SMN역');
p('fduomo','florence','way',43768260,'피렌체 두오모');
p('calz','florence','way',463282020,'칼차이우올리 상가');
p('signoria','florence','way',23298643,'시뇨리아 광장');
p('loggia','florence','way',43284457,'로자 데이 란치');
p('ponte','florence','way',24999532,'베키오 다리');
p('view','florence','way',233265215,'미켈란젤로 광장','Piazzale Michelangelo');
p('pharmacy','florence','node',5883143685,'산타 마리아 노벨라 약국 본점','Officina Profumo-Farmaceutica · Via della Scala 16');
places.bargello={ko:'바르젤로 조각박물관',name:'Museo Nazionale del Bargello',xy:[11.25835,43.7703722],osm:'#map=19/43.7703722/11.25835',source:'https://en.wikipedia.org/wiki/Bargello'};
places.uffizi={ko:'우피치 미술관',name:'Galleria degli Uffizi',xy:[11.255364,43.76809],osm:'#map=19/43.76809/11.255364',source:'https://dati.beniculturali.it/'};
p('market','florence','way',1442475760,'중앙시장','Mercato Centrale');
p('psmn','pisa','node',12633170992,'피사 중앙역');
p('tower','pisa','relation',12982355,'피사의 사탑','Torre di Pisa');
p('pduomo','pisa','way',22945163,'피사 대성당');
p('baptistery','pisa','way',22945162,'세례당');
p('campo','pisa','relation',154289,'캄포산토');
p('vsmn','venice','node',6063641885,'산타 루치아역');
p('sanmarco','venice','way',172349507,'산마르코 광장');
p('basilica','venice','way',138800932,'산마르코 대성당');
p('ducale','venice','way',138803915,'두칼레 궁전');
p('rialto','venice','relation',2289364,'리알토 다리','Ponte di Rialto');
places.rocco={ko:'산 로코 대동신회관',name:'Scuola Grande di San Rocco',xy:[12+19/60+31.112/3600,45+26/60+11.656/3600],osm:'#map=18/45.436571/12.325309',source:'https://www.wikidata.org/wiki/Q1270723'};
places.frari={ko:'프라리 성당',name:'Santa Maria Gloriosa dei Frari',xy:[12.32636,45.43687],osm:'way/138841819',source:'https://mapcarta.com/28166696'};
p('bus','venice','way',174463835,'로마 광장 버스터미널','Piazzale Roma');
p('airport','venice','way',1056163677,'마르코 폴로 공항','VCE · 여객 터미널');
const coords=g=>g.map(p=>[+p.lon.toFixed(6),+p.lat.toFixed(6)]);
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
function rings(e){if(e.geometry){const r=coords(e.geometry);return same(r[0],r.at(-1))?[r]:[];}const pending=(e.members||[]).filter(m=>m.geometry&&['outer','inner',''].includes(m.role)).map(m=>coords(m.geometry));const out=[];while(pending.length){const r=pending.shift();while(!same(r[0],r.at(-1))){const i=pending.findIndex(s=>same(s[0],r.at(-1))||same(s.at(-1),r.at(-1)));if(i<0)throw Error('Incomplete polygon '+e.id);const s=pending.splice(i,1)[0];if(!same(s[0],r.at(-1)))s.reverse();r.push(...s.slice(1));}out.push(r);}return out;}
const names={florence:/Calzaiuoli|Tornabuoni|Cerretani|Panzani|Nazionale|della Scala|Guelfa|Cavour|Roma$|Lungarno|Ponte|Michelangiolo|Giuseppe Poggi|dei Bardi|de. Guicciardini|Signoria|Duomo/,pisa:/Corso Italia|Francesco Crispi|Roma$|Santa Maria|Lungarno|Ponte|Bonanno|Pietrasantina|Piazza del Duomo|Contessa Matilde|Vittorio Emanuele|Antonio Gramsci|Francesco Carrara/,venice:/Strada No[vw]a|Lista di Spagna|Salizada San Geremia|Rio Ter[aà]|Mercerie|Merceria|Riva degli Schiavoni|Riva del Carbon|Riva del Vin|Ponte di Rialto|Piazza San Marco|Piazzale Roma/};
const maps={};for(const c of Object.keys(raws)){const es=raws[c];maps[c]={roads:es.filter(e=>e.type==='way'&&e.geometry&&e.tags?.highway&&e.tags.area!=='yes'&&(names[c].test(e.tags.name||'')||['primary','secondary','tertiary'].includes(e.tags.highway))).map(e=>({name:e.tags.name||'',xy:coords(e.geometry)})),water:es.filter(e=>e.type==='way'&&e.tags?.natural==='water').flatMap(rings),land:c==='venice'?es.filter(e=>e.tags?.place==='island').map(rings):[],buildings:[]};}
for(const [c,t,id] of [['pisa','way',22945163],['pisa','way',22945162],['pisa','relation',12982355],['pisa','relation',154289],['venice','way',138800932],['venice','way',138803915],['venice','way',460409906]])maps[c].buildings.push(rings(source(c,t,id)));
let html=fs.readFileSync(projectPath('docs', 'index.html'),'utf8');
const routeBlock='/* MAP_ROUTES_START */\n'+fs.readFileSync(projectPath('src', 'map-routes-runtime.js'),'utf8')+'\n/* MAP_ROUTES_END */';
if(html.includes('/* MAP_ROUTES_START */'))html=html.replace(/\/\* MAP_ROUTES_START \*\/[\s\S]*?\/\* MAP_ROUTES_END \*\//,()=>routeBlock);
else html=html.replace('/* ROME_MAP_START */',routeBlock+'\n/* ROME_MAP_START */');
const block='/* TRIP_MAP_START */\nconst TRIP_MAP='+JSON.stringify({places,maps,overview:JSON.parse(fs.readFileSync(projectPath('data','venice-overview-background.json'),'utf8'))})+';\n'+fs.readFileSync(projectPath('src', 'trip-map-runtime.js'),'utf8')+'\n/* TRIP_MAP_END */';
if(html.includes('/* TRIP_MAP_START */'))html=html.replace(/\/\* TRIP_MAP_START \*\/[\s\S]*?\/\* TRIP_MAP_END \*\//,()=>block);
else html=html.replace('let city=0,day=1;',block+'\nlet city=0,day=1;');
html=html.replace("${city===0?renderRomeMap(day):''}","${city===0?renderRomeMap(day):renderTripMap(day)}");
html=html.replace("${city===0?romeEventBadges(day,e):''}","${city===0?romeEventBadges(day,e):tripEventBadges(day,e)}");
html=html.replace('${e[1]}</strong>','${city===0?e[1]:tripEventTitle(day,e)}</strong>');
fs.writeFileSync(projectPath('docs', 'index.html'),html,'utf8');
console.log(JSON.stringify({places:Object.keys(places).length,embeddedBytes:Buffer.byteLength(block),mapCounts:Object.fromEntries(Object.entries(maps).map(([c,m])=>[c,{roads:m.roads.length,water:m.water.length,land:m.land.length}]))}));
