const path = require('path');
const projectPath = (...parts) => path.join(__dirname, '..', ...parts);
const fs = require('fs');
const raw = JSON.parse(fs.readFileSync(projectPath('data', 'rome-map-data.json'), 'utf8'));
const extra = JSON.parse(fs.readFileSync(projectPath('data', 'rome-map-places.json'), 'utf8'));
const revised = JSON.parse(fs.readFileSync(projectPath('data', 'rome-map-revised-places.json'), 'utf8'));
const context = JSON.parse(fs.readFileSync(projectPath('data', 'rome-map-context.json'), 'utf8'));
const elements = [...raw.elements, ...extra.elements, ...revised.elements];
function source(type, id) {
  const e = elements.find(e => e.type === type && e.id === id);
  if (!e) throw new Error(`Missing OSM ${type}/${id}`);
  return e;
}
function position(e) {
  if (e.center) return [e.center.lon, e.center.lat];
  if (e.lat != null) return [e.lon, e.lat];
  const b = e.bounds;
  return [(b.minlon + b.maxlon) / 2, (b.minlat + b.maxlat) / 2];
}
function place(type, id, ko, name) {
  return {ko, name, xy: position(source(type, id)), osm: `${type}/${id}`};
}
const places = {
  doria: place('node', 706793341, '도리아 팜필리 갤러리', 'Galleria Doria Pamphilj'),
  luigi: place('way', 52335646, '산 루이지 데이 프란체시', 'San Luigi dei Francesi'),
  bridge: place('way', 25752465, '산탄젤로 다리', 'Ponte Sant’Angelo'),
  capitol: place('way', 123817455, '카피톨리니 박물관', 'Musei Capitolini'),
  campidoglio: place('way', 23055100, '캄피돌리오 광장', 'Piazza del Campidoglio'),
  navona: place('way', 4247138, '나보나 광장', 'Piazza Navona'),
  ignazio: place('way', 23840659, '산 이냐시오 성당', "Sant’Ignazio di Loyola"),
  trevi: place('relation', 13448560, '트레비 분수', 'Fontana di Trevi'),
  sordi: place('relation', 325554, '알베르토 소르디', 'Galleria Alberto Sordi'),
  rinascente: place('node', 5288226122, '리나셴테 백화점', 'Rinascente · Via del Tritone'),
  barberini: place('node', 2122709063, '바르베리니 미술관', 'Palazzo Barberini'),
  basilica: place('way', 244159210, '성 베드로 대성당', 'Basilica di San Pietro'),
  sanpietro: place('relation', 10044166, '성 베드로 광장', 'Piazza San Pietro'),
  cola: place('node', 4156297497, '콜라 디 리엔초 상가', 'Via Cola di Rienzo · Zara Home 부근'),
  borgo: place('node', 11847576432, '보르고 피오 식당가', 'Borgo Pio · Passpartout 부근'),
  pantheon: place('relation', 3374342, '판테온', 'Pantheon'),
  castello: place('way', 8035487, '산탄젤로성', 'Castel Sant’Angelo'),
  colosseo: place('relation', 1834818, '콜로세움', 'Colosseo'),
  termini: place('node', 251904108, '테르미니역', 'Roma Termini'),
  airport: place('relation', 16054538, '피우미치노 공항', 'FCO · Aeroporto di Roma-Fiumicino')
};
const risWays = raw.elements.filter(e => e.tags?.name === 'Piazza del Risorgimento' && e.geometry);
if (!risWays.length) throw new Error('Risorgimento absent');
const rs = risWays.flatMap(e => e.geometry);
places.risorgimento = {ko:'리소르지멘토 광장',name:'Piazza del Risorgimento',xy:[(Math.min(...rs.map(p=>p.lon))+Math.max(...rs.map(p=>p.lon)))/2,(Math.min(...rs.map(p=>p.lat))+Math.max(...rs.map(p=>p.lat)))/2],osm:`way/${risWays[0].id}`};
const roadElements=[...new Map([...raw.elements,...context.elements].filter(e=>e.type==='way'&&e.geometry&&e.tags?.highway&&e.tags.area!=='yes'&&!['platform','construction','proposed'].includes(e.tags.highway)).map(e=>[e.id,e])).values()];
const roads=roadElements.map(e=>({name:e.tags.name||'',kind:e.tags.highway,xy:e.geometry.map(p=>[p.lon,p.lat])}));
const waterways=context.elements.filter(e=>e.geometry&&e.tags?.waterway==='river').map(e=>e.geometry.map(p=>[p.lon,p.lat]));
function joinRings(members) {
  const remaining = members.filter(m=>m.geometry).map(m=>m.geometry.map(p=>[p.lon,p.lat]));
  const same=(a,b)=>Math.abs(a[0]-b[0])<1e-7&&Math.abs(a[1]-b[1])<1e-7;
  const rings=[];
  while(remaining.length){
    let ring=remaining.shift();
    while(!same(ring[0],ring.at(-1))){
      const i=remaining.findIndex(s=>same(s[0],ring.at(-1))||same(s.at(-1),ring.at(-1)));
      if(i<0) throw new Error('Unclosed river geometry');
      const next=remaining.splice(i,1)[0];if(!same(next[0],ring.at(-1)))next.reverse();
      ring.push(...next.slice(1));
    }
    rings.push(ring);
  }
  return rings;
}
const riverRel=source('relation',5071);
const river=[...joinRings(riverRel.members.filter(m=>m.role==='outer')),...joinRings(riverRel.members.filter(m=>m.role==='inner')),source('way',22797948).geometry.map(p=>[p.lon,p.lat])];
const mapData={places,roads,river,waterways,date:raw.osm3s.timestamp_osm_base};
let html=fs.readFileSync(projectPath('docs', 'index.html'),'utf8');
const runtime=fs.readFileSync(projectPath('src', 'rome-map-runtime.js'),'utf8');
if(html.includes('/* ROME_MAP_START */')) {
  const start=html.indexOf('/* ROME_MAP_START */'),end=html.indexOf('/* ROME_MAP_END */')+'/* ROME_MAP_END */'.length;
  html=html.slice(0,start)+`/* ROME_MAP_START */\nconst ROME_MAP=${JSON.stringify(mapData)};\n${runtime}\n/* ROME_MAP_END */`+html.slice(end);
  fs.writeFileSync(projectPath('docs', 'index.html'),html,'utf8');
  console.log('Updated embedded Rome map data and renderer.');
  return;
}
html=html.replace('let city=0,day=1;',`/* ROME_MAP_START */\nconst ROME_MAP=${JSON.stringify(mapData)};\n${runtime}\n/* ROME_MAP_END */\nlet city=0,day=1;`);
html=html.replace('<div class="layout"><div><div class="cards">','${city===0?renderRomeMap(day):\'\'}<div class="layout"><div><div class="cards">');
html=html.replace("${e[1]}</strong>","${city===0?romeEventBadges(day,e):''}${e[1]}</strong>");
html=html.replace("day=Number(b.dataset.day);render();","day=Number(b.dataset.day);romeFocus='day';render();");
html=html.replace('</style>',fs.readFileSync(projectPath('src', 'rome-map-style.css'),'utf8')+'\n</style>');
html=html.replace('</script>',`document.addEventListener('click',e=>{const b=e.target.closest('[data-rome-focus]');if(b){romeFocus=b.dataset.romeFocus;render();}});\n</script>`);
fs.writeFileSync(projectPath('docs', 'index.html'),html,'utf8');
console.log(JSON.stringify({places:Object.keys(places).length,roadSegments:roads.length,riverRings:river.length,embeddedBytes:JSON.stringify(mapData).length}));
