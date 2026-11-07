/* Gemeinsamer Kartencode für index.html (Ansicht) und editor.html (Bearbeiten). */
(function(){
"use strict";

const MAPTILER_KEY = "4TDQhzPsZwABTFDNshhB";
const MT = n => `https://api.maptiler.com/maps/${n}/style.json?key=${MAPTILER_KEY}`;
const STYLES = {
  sat:  {name:"Satellit", url:MT("hybrid-v4"), theme:"sat"},
  karte:{name:"Karte",    url:()=>darkStyle(), theme:null, own:true},
  topo: {name:"Gelände",  url:MT("topo-v4"),   theme:"topo"}
};
const STYLE_FREE = "https://tiles.openfreemap.org/styles/liberty";

/* Eigener, klarer Kartenstil „Karte“ auf Basis von OpenFreeMap (OpenMapTiles-Schema).
   Land dunkelgrau, Meer dunkelblau, klare Grenzen, deutsche Ortsnamen, kaum Straßen. */
const styleOf = k => typeof STYLES[k].url === "function" ? STYLES[k].url() : STYLES[k].url;
function darkStyle(){
  const S = "omt", Z = (...a)=>["interpolate",["linear"],["zoom"],...a];
  const NAME = ["coalesce",["get","name:de"],["get","name:latin"],["get","name"]];
  const FONT = ["Noto Sans Regular"], BOLD = ["Noto Sans Bold"], ITAL = ["Noto Sans Italic"];
  const halo = {"text-halo-color":"#0c0d10","text-halo-width":1.4};
  const notMar = ["!=",["get","maritime"],1];
  return {version:8, name:"Lagekarte dunkel",
    glyphs:"https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources:{[S]:{type:"vector", url:"https://tiles.openfreemap.org/planet"}},
    layers:[
      {id:"land", type:"background", paint:{"background-color":"#2a2e35"}},
      {id:"wood", type:"fill", source:S, "source-layer":"landcover", filter:["==",["get","class"],"wood"], paint:{"fill-color":"#27342b","fill-opacity":Z(3,0.6,8,1)}},
      {id:"grass", type:"fill", source:S, "source-layer":"landcover", filter:["in",["get","class"],["literal",["grass","wetland"]]], paint:{"fill-color":"#283029","fill-opacity":0.8}},
      {id:"ice", type:"fill", source:S, "source-layer":"landcover", filter:["in",["get","class"],["literal",["ice","glacier"]]], paint:{"fill-color":"#2b2f35"}},
      {id:"urban", type:"fill", source:S, "source-layer":"landuse", minzoom:6, filter:["in",["get","class"],["literal",["residential","suburb","neighbourhood","industrial","commercial","retail"]]], paint:{"fill-color":"#454a54","fill-opacity":Z(6,0.7,10,1)}},
      {id:"water", type:"fill", source:S, "source-layer":"water", paint:{"fill-color":"#0a1520"}},
      {id:"river", type:"line", source:S, "source-layer":"waterway", minzoom:5, filter:["in",["get","class"],["literal",["river","canal"]]], paint:{"line-color":"#2f5a7e","line-width":Z(5,0.7,10,2.2,14,4)}},
      {id:"stream", type:"line", source:S, "source-layer":"waterway", minzoom:10, filter:["==",["get","class"],"stream"], paint:{"line-color":"#284c6a","line-width":0.8}},
      {id:"road-major", type:"line", source:S, "source-layer":"transportation", minzoom:6, filter:["in",["get","class"],["literal",["motorway","trunk"]]], layout:{"line-join":"round"}, paint:{"line-color":"#50555f","line-width":Z(6,0.5,10,1.6,14,4)}},
      {id:"road-primary", type:"line", source:S, "source-layer":"transportation", minzoom:9, filter:["in",["get","class"],["literal",["primary","secondary"]]], layout:{"line-join":"round"}, paint:{"line-color":"#41454e","line-width":Z(9,0.5,14,2.5)}},
      {id:"rail", type:"line", source:S, "source-layer":"transportation", minzoom:9, filter:["==",["get","class"],"rail"], paint:{"line-color":"#34383f","line-width":1,"line-dasharray":[3,2]}},
      {id:"border-state", type:"line", source:S, "source-layer":"boundary", minzoom:4.5, filter:["all",["==",["get","admin_level"],4],notMar], paint:{"line-color":"rgba(255,255,255,0.16)","line-width":Z(5,0.5,10,1.2),"line-dasharray":[3,2]}},
      {id:"border-country", type:"line", source:S, "source-layer":"boundary", filter:["all",["==",["get","admin_level"],2],notMar,["!=",["get","disputed"],1]], layout:{"line-join":"round"}, paint:{"line-color":"#aeb3bb","line-width":Z(2,0.6,6,1.2,10,2)}},
      {id:"border-disputed", type:"line", source:S, "source-layer":"boundary", filter:["all",["==",["get","admin_level"],2],notMar,["==",["get","disputed"],1]], paint:{"line-color":"#aeb3bb","line-width":Z(2,0.6,10,1.6),"line-dasharray":[2,2]}},
      {id:"water-name", type:"symbol", source:S, "source-layer":"water_name", layout:{"text-field":NAME,"text-font":ITAL,"text-size":Z(3,10,8,13),"text-letter-spacing":0.05}, paint:{"text-color":"#6c8cab", ...halo}},
      {id:"place-village", type:"symbol", source:S, "source-layer":"place", minzoom:10, filter:["in",["get","class"],["literal",["village","suburb"]]], layout:{"text-field":NAME,"text-font":FONT,"text-size":11}, paint:{"text-color":"#aeb3bb", ...halo}},
      {id:"place-town", type:"symbol", source:S, "source-layer":"place", minzoom:7.5, filter:["==",["get","class"],"town"], layout:{"text-field":NAME,"text-font":FONT,"text-size":Z(8,11,12,13)}, paint:{"text-color":"#cfd3d9", ...halo}},
      {id:"place-city", type:"symbol", source:S, "source-layer":"place", minzoom:4, filter:["==",["get","class"],"city"], layout:{"text-field":NAME,"text-font":BOLD,"text-size":Z(4,10,7,13,11,16),"symbol-sort-key":["get","rank"]}, paint:{"text-color":"#eceef1", ...halo}},
      {id:"place-state", type:"symbol", source:S, "source-layer":"place", minzoom:5.5, maxzoom:9, filter:["==",["get","class"],"state"], layout:{"text-field":NAME,"text-font":FONT,"text-size":11,"text-transform":"uppercase","text-letter-spacing":0.12}, paint:{"text-color":"#7d838c", ...halo}},
      {id:"place-country", type:"symbol", source:S, "source-layer":"place", maxzoom:9, filter:["==",["get","class"],"country"], layout:{"text-field":NAME,"text-font":BOLD,"text-size":Z(2,11,6,15),"text-transform":"uppercase","text-letter-spacing":0.15}, paint:{"text-color":"#c5c9cf", ...halo}}
    ]};
}


/* Esri World Imagery: schärfere Satellitenbilder, nur über der Ukraine und erst ab Zoom 7.
   Der Schlüssel ist auf platano008.github.io beschränkt. */
const ESRI_KEY = "AAPTa9KuMZUnWQGzFYq1i52nlAw..h2fE1_muFqHQuDnyNWqSWZcjtPU2Jbxwcs-6KhCrxrHhceZLvPzRTuneYNUm3ay_PxyZIXScz5yX43P4sv2ZbP4uWqaJ-TnWNxnO7wJwTASkMrYh9NHEgP01OLyUqRmIeoObk4DICPw3hWf3uxCQ4MwjHtW5-O9V5dDL5vN5PGfV5pGbe5Pi2sWyMDmJppIIPsUKmZMA7-HVfam5Xy8aAc2i6eZGWGzMoRNOwBobJ2DasxpCX1kAMUP04UQ.AT1_p9XEFpe5";
const ESRI_URLS = [
  "https://static-map-tiles-api.arcgis.com/arcgis/rest/services/static-basemap-tiles-service/v1/arcgis/imagery/static/tile/{z}/{y}/{x}?token=" + ESRI_KEY,
  "https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=" + ESRI_KEY
];
const ESRI_BOUNDS = [21.9, 44.2, 40.4, 52.5];   /* Ukraine inkl. Krim, mit etwas Rand */
const ESRI_ATTR = 'Ukraine: Powered by <a href="https://www.esri.com" target="_blank">Esri</a> · Esri, Maxar, Earthstar Geographics, GIS User Community';
let esriUrl = 0, esriErrs = 0, esriOff = false;
function addEsri(map){
  if(esriOff || !ESRI_KEY) return;
  const firstSymbol = (map.getStyle().layers.find(l=>l.type==="symbol")||{}).id;
  try{
    map.addSource("esri", {type:"raster", tiles:[ESRI_URLS[esriUrl]], tileSize:256, bounds:ESRI_BOUNDS, minzoom:7, maxzoom:19, attribution:ESRI_ATTR});
    map.addLayer({id:"esri", type:"raster", source:"esri", minzoom:7, paint:{"raster-fade-duration":200}}, firstSymbol);
  }catch(e){}
}
function esriFailed(map){
  esriErrs = 0;
  try{ map.removeLayer("esri"); map.removeSource("esri"); }catch(e){}
  if(esriUrl < ESRI_URLS.length-1){ esriUrl++; addEsri(map); }
  else esriOff = true;  /* beide Adressen gehen nicht: einfach MapTiler-Bilder behalten */
}
const START = {center:[31.6,48.6], zoom:5.3};

/* ---------------- Farbschema ---------------- */
const PAL = {
  dark:{bg:"#121418", land:"#16181c", water:"#1b2f42", waterway:"#2b4a63", wood:"#1f2d23", green:"#1c261e",
        urban:"#1e2024", building:"#26292e", ice:"#2a2f35", sand:"#22221f",
        minor:"#2c2f35", major:"#4a4e56", motorway:"#727780", rail:"#3a3e45", casing:"#0c0d0f",
        border:"rgba(255,255,255,0.55)", border2:"rgba(255,255,255,0.16)", contour:"rgba(255,255,255,0.12)",
        text:"#e3e5e8", textWater:"#8fb0cb", halo:"#0c0d0f"},
  topo:{bg:"#272b31", land:"#272b31", water:"#0c1a28", waterway:"#33618a", wood:"#2c3b30", green:"#29322b",
        urban:"#454a54", building:"#4d525c", ice:"#3a3f45", sand:"#33332f",
        minor:"#3f434b", major:"#5d626b", motorway:"#878c95", rail:"#4a4e56", casing:"#16181b",
        border:"rgba(255,255,255,0.65)", border2:"rgba(255,255,255,0.22)", contour:"rgba(255,255,255,0.15)",
        text:"#eceef1", textWater:"#8fb3d2", halo:"#14161a"}
};
function setP(map,id,k,v){ try{ map.setPaintProperty(id,k,v); }catch(e){} }
/* Satellit: Straßen ausblenden, Orte, Grenzen und Gewässer behalten */
const ROADS = /road|street|transport|highway|motorway|trunk|primary|secondary|tertiary|minor|service|path|track|rail|bridge|tunnel|ferry|aeroway|runway|oneway|shield|poi|housenum|building|landuse|landcover|park/;
const KEEP_SAT = /boundary|admin|border|place|city|town|village|country|state|water|ocean|sea|lake|river|marine|continent/;
function cleanSatellite(map){
  for(const l of map.getStyle().layers){
    if(l.type!=="line" && l.type!=="symbol" && l.type!=="fill") continue;
    const key = (l.id+" "+(l["source-layer"]||"")).toLowerCase();
    if(ROADS.test(key) && !KEEP_SAT.test(key)){ try{ map.setLayoutProperty(l.id,"visibility","none"); }catch(e){} }
    else if(l.type==="symbol"){ setP(map,l.id,"text-halo-color","rgba(0,0,0,0.85)"); setP(map,l.id,"text-halo-width",1.4); }
  }
}
function applyTheme(map, kind){
  if(kind==="sat") return cleanSatellite(map);
  const p = PAL[kind]; if(!p) return;
  for(const l of map.getStyle().layers){
    const key = (l.id+" "+(l["source-layer"]||"")).toLowerCase();
    const t = l.type;
    if(t==="background"){ setP(map,l.id,"background-color",p.bg); continue; }
    const sl = (l["source-layer"]||"").toLowerCase();
    if(t==="fill" && /^(landcover|land_cover|globallandcover)$/.test(sl)){
      /* Landbedeckung nach Klasse einfärben, damit Wald und Grünflächen auch von weitem sichtbar sind */
      setP(map,l.id,"fill-pattern",undefined);
      setP(map,l.id,"fill-color",["match",["get","class"], ["wood","forest","tree"], p.wood, ["ice","glacier","snow"], p.ice,
        ["sand","beach","bare_rock","rock","desert","scree"], p.sand, p.green]);
      setP(map,l.id,"fill-outline-color","rgba(0,0,0,0)"); setP(map,l.id,"fill-opacity",0.95);
      continue;
    }
    if(t==="fill" && /^(water|ocean)$/.test(sl)){
      setP(map,l.id,"fill-pattern",undefined); setP(map,l.id,"fill-color",p.water); setP(map,l.id,"fill-outline-color",p.water); setP(map,l.id,"fill-opacity",1);
      continue;
    }
    if(t==="fill" || t==="fill-extrusion"){
      const c = /water|ocean|sea|lake|reservoir/.test(key) ? p.water
        : /wood|forest/.test(key) ? p.wood
        : /grass|park|meadow|farm|scrub|crop|wetland|orchard|vineyard|garden/.test(key) ? p.green
        : /building/.test(key) ? p.building
        : /ice|glacier|snow/.test(key) ? p.ice
        : /sand|beach|desert|bare|rock|scree/.test(key) ? p.sand
        : /residential|urban|landuse|industrial|commercial|built/.test(key) ? p.urban : p.land;
      if(t==="fill"){ setP(map,l.id,"fill-pattern",undefined); setP(map,l.id,"fill-color",c); setP(map,l.id,"fill-outline-color",c); }
      else setP(map,l.id,"fill-extrusion-color",p.building);
      continue;
    }
    if(t==="line"){
      const c = /contour/.test(key) ? p.contour
        : /boundary|admin|border/.test(key) ? (/country|national|level.?2|_2\b|disputed/.test(key) ? p.border : p.border2)
        : /casing|outline/.test(key) ? p.casing
        : /water|river|stream|canal|ditch|drain/.test(key) ? p.waterway
        : /rail|transit|tram|subway/.test(key) ? p.rail
        : /motorway|highway/.test(key) ? p.motorway
        : /trunk|primary/.test(key) ? p.major
        : p.minor;
      setP(map,l.id,"line-pattern",undefined); setP(map,l.id,"line-color",c);
      if(c===p.waterway) setP(map,l.id,"line-opacity",1);
      continue;
    }
    if(t==="symbol"){
      if(/poi|housenum|house_num|shield|oneway/.test(key)){ try{ map.setLayoutProperty(l.id,"visibility","none"); }catch(e){} continue; }
      setP(map,l.id,"text-color", /water|ocean|sea|lake|river|marine/.test(key) ? p.textWater : p.text);
      setP(map,l.id,"text-halo-color",p.halo); setP(map,l.id,"text-halo-width",1.3);
      continue;
    }
    if(t==="hillshade"){ setP(map,l.id,"hillshade-shadow-color","#000000"); setP(map,l.id,"hillshade-highlight-color", kind==="topo"?"#3b3b31":"#26261f"); setP(map,l.id,"hillshade-accent-color","#000000"); continue; }
    if(t==="raster"){ setP(map,l.id,"raster-saturation",-1); setP(map,l.id,"raster-opacity",0.5); setP(map,l.id,"raster-brightness-max",0.55); continue; }
  }
}

/* ---------------- NATO-Symbole (APP-6 / MIL-STD-2525C) ---------------- */
const SIDES = {
  F:{name:"Eigene / verbündet", short:"Freund", color:"#80e0ff"},
  H:{name:"Feind",              short:"Feind",  color:"#ff8080"},
  N:{name:"Neutral",            short:"Neutral",color:"#aaffaa"},
  U:{name:"Unbekannt",          short:"Unbekannt", color:"#ffff80"}
};
const UNITS = {
  inf:  {name:"Infanterie",              fn:"UCI---"},
  mech: {name:"Mechanisierte Infanterie",fn:"UCIZ--"},
  mot:  {name:"Motorisierte Infanterie", fn:"UCIM--"},
  pz:   {name:"Panzer",                  fn:"UCA---"},
  art:  {name:"Artillerie",              fn:"UCF---"},
  rak:  {name:"Raketenartillerie",       fn:"UCFR--"},
  flak: {name:"Luftverteidigung",        fn:"UCD---"},
  aufk: {name:"Aufklärung",              fn:"UCR---"},
  pio:  {name:"Pioniere",                fn:"UCE---"},
  uav:  {name:"Drohnen (UAV)",           fn:"UCVU--"},
  mar:  {name:"Marineinfanterie",        fn:"UCIN--"},
  vers: {name:"Versorgung",              fn:"USS---"},
  san:  {name:"Sanität",                 fn:"USM---"},
  fm:   {name:"Fernmelder",              fn:"UUS---"}
};
const ECHELONS = {"-":"–", D:"Zug", E:"Kompanie", F:"Bataillon", G:"Regiment", H:"Brigade", I:"Division", J:"Korps", K:"Armee"};
function sidcOf(s){
  if(s.sidc) return s.sidc;
  const side = s.seite||"U", fn = (UNITS[s.einheit]||UNITS.inf).fn;
  const mod = s.hq ? "A" : "-";
  return "S"+side+"G"+(s.geplant?"A":"P")+fn+mod+(s.groesse||"-")+"---";
}
function symbolSVG(s, size){
  size = size||30;
  try{
    if(window.ms && ms.Symbol){
      const sym = new ms.Symbol(sidcOf(s), {size, uniqueDesignation:s.zusatz||"", outlineWidth:3, outlineColor:"rgba(0,0,0,0.7)"});
      if(sym.isValid && !sym.isValid()) throw 0;
      const a = sym.getAnchor(), z = sym.getSize();
      return {svg:sym.asSVG(), ax:a.x, ay:a.y, w:z.width, h:z.height};
    }
  }catch(e){}
  /* einfacher Ersatz, falls die Symbol-Bibliothek nicht lädt */
  const side = s.seite || (s.sidc && s.sidc[1]) || "U";
  const c = (SIDES[side]||SIDES.U).color, w = size*1.5, h = size;
  const shape = side==="H" ? `<polygon points="${w/2},2 ${w-2},${h/2+4} ${w/2},${h+6} 2,${h/2+4}" fill="${c}" stroke="#000" stroke-width="2"/>`
    : `<rect x="2" y="4" width="${w-4}" height="${h}" fill="${c}" stroke="#000" stroke-width="2"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h+10}">${shape}<text x="${w/2}" y="${h/2+9}" font-family="Arial" font-size="${size*0.38}" font-weight="700" text-anchor="middle">${(UNITS[s.einheit]||UNITS.inf).name.slice(0,3).toUpperCase()}</text></svg>`;
  return {svg, ax:w/2, ay:(h+10)/2, w, h:h+10};
}
function describe(el){
  if(el.typ==="symbol"){
    const parts = [(SIDES[el.seite]||SIDES.U).short, (UNITS[el.einheit]||UNITS.inf).name];
    if(el.groesse && el.groesse!=="-") parts.push(ECHELONS[el.groesse]);
    if(el.hq) parts.push("Stab");
    if(el.geplant) parts.push("vermutet/geplant");
    return parts.join(" · ");
  }
  return {linie:"Linie", pfeil:"Pfeil", flaeche:"Fläche"}[el.typ] || el.typ;
}

/* ---------------- Geometrie ---------------- */
function lineKm(c){ let d=0; const R=6371, r=Math.PI/180;
  for(let i=1;i<c.length;i++){ const [a,b]=c[i-1],[e,f]=c[i];
    const h=Math.sin((f-b)*r/2)**2+Math.cos(b*r)*Math.cos(f*r)*Math.sin((e-a)*r/2)**2; d+=2*R*Math.asin(Math.sqrt(h)); }
  return d; }
function areaKm2(ring){
  if(ring.length<3) return 0;
  const r=Math.PI/180, R=6371; let s=0;
  for(let i=0;i<ring.length;i++){ const [x1,y1]=ring[i], [x2,y2]=ring[(i+1)%ring.length]; s += (x2-x1)*r*(2+Math.sin(y1*r)+Math.sin(y2*r)); }
  return Math.abs(s*R*R/2);
}
/* Stoßpfeil: geschwungener, zur Spitze breiter werdender Körper mit Schwalbenschwanz und großer Spitze.
   Gerechnet in einer lokalen, längentreuen Ebene (x = Länge · cos(Breite), y = Breite). */
function smoothPath(pts, per){
  if(pts.length < 3) return pts.slice();
  const out = [], P = i => pts[Math.max(0, Math.min(pts.length-1, i))];
  for(let i=0;i<pts.length-1;i++){
    const p0=P(i-1), p1=P(i), p2=P(i+1), p3=P(i+2);
    for(let s=0;s<per;s++){
      const t=s/per, t2=t*t, t3=t2*t;
      out.push([0,1].map(k=>0.5*((2*p1[k]) + (-p0[k]+p2[k])*t + (2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2 + (-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3)));
    }
  }
  out.push(pts[pts.length-1]);
  return out;
}
function arrow(coords){
  const n = coords.length; if(n<2) return {axis:coords, body:null};
  const lat0 = coords.reduce((a,c)=>a+c[1],0)/n, k = Math.cos(lat0*Math.PI/180)||1;
  const pts = smoothPath(coords.map(([x,y])=>[x*k, y]), 14);
  const dist = [0]; for(let i=1;i<pts.length;i++) dist.push(dist[i-1] + Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]));
  const L = dist[dist.length-1]; if(!L) return {axis:coords, body:null};
  const w = L*0.042;                       /* halbe Breite des Körpers an der Spitze */
  const headLen = Math.min(L*0.28, w*4.2), headW = w*2.6, tailW = w*0.55, notch = w*1.1;
  const at = d=>{                           /* Punkt und Richtung bei Strecke d */
    let i = 1; while(i < dist.length-1 && dist[i] < d) i++;
    const a = pts[i-1], b = pts[i], seg = (dist[i]-dist[i-1])||1e-12, t = Math.max(0, Math.min(1, (d-dist[i-1])/seg));
    const dx = b[0]-a[0], dy = b[1]-a[1], l = Math.hypot(dx,dy)||1e-12;
    return {p:[a[0]+dx*t, a[1]+dy*t], d:[dx/l, dy/l]};
  };
  const tip = pts[pts.length-1];
  const baseD = L - headLen, steps = Math.max(12, Math.min(90, Math.round(pts.length*1.2)));
  const left = [], right = [];
  for(let s=0;s<=steps;s++){
    const d = baseD*s/steps, {p, d:dir} = at(d), f = s/steps, hw = tailW + (w - tailW)*Math.pow(f, 0.8);
    let nx = -dir[1], ny = dir[0];
    if(s===steps){ const cx = tip[0]-p[0], cy = tip[1]-p[1], l = Math.hypot(cx,cy)||1; nx = -cy/l; ny = cx/l; }
    left.push([p[0]+nx*hw, p[1]+ny*hw]); right.push([p[0]-nx*hw, p[1]-ny*hw]);
  }
  const base = at(baseD);
  const cd = [tip[0]-base.p[0], tip[1]-base.p[1]], cl = Math.hypot(cd[0], cd[1]) || 1, bn = [-cd[1]/cl, cd[0]/cl];
  const start = at(0), notchPt = [start.p[0] + start.d[0]*notch, start.p[1] + start.d[1]*notch];
  const ring = [notchPt, ...left,
    [base.p[0]+bn[0]*headW, base.p[1]+bn[1]*headW], tip, [base.p[0]-bn[0]*headW, base.p[1]-bn[1]*headW],
    ...right.reverse(), notchPt];
  const back = ([x,y])=>[+(x/k).toFixed(6), +y.toFixed(6)];
  return {axis: pts.filter((_,i)=>i%3===0 || i===pts.length-1).map(back), body: ring.map(back)};
}
/* Farben aus älteren Versionen auf die aktuelle Palette abbilden */
const LEGACY_COL = {"#f2ff1a":"#ffb800", "#ff3b30":"#e5383b", "#2f80ff":"#2f7cf6", "#ff8a3d":"#ffb800", "#3ddc84":"#45c46b"};
function farbe(c){ c = String(c||"#ffffff").toLowerCase(); return LEGACY_COL[c] || c; }
function toFeatures(els){
  const f = [];
  for(const el of els){
    const props = {id:el.id, typ:el.typ, farbe:farbe(el.farbe), stil:el.stil||"durchgezogen"};
    if(el.typ==="linie" && el.koordinaten.length>1) f.push({type:"Feature", properties:props, geometry:{type:"LineString", coordinates:el.koordinaten}});
    if(el.typ==="pfeil" && el.koordinaten.length>1){
      const a = arrow(el.koordinaten);
      if(a.body) f.push({type:"Feature", properties:props, geometry:{type:"Polygon", coordinates:[a.body]}});
      f.push({type:"Feature", properties:{...props, typ:"pfeilachse"}, geometry:{type:"LineString", coordinates:a.axis}});
    }
    if(el.typ==="flaeche" && el.koordinaten.length>2){
      const ring = el.koordinaten.concat([el.koordinaten[0]]);
      f.push({type:"Feature", properties:props, geometry:{type:"Polygon", coordinates:[ring]}});
    }
  }
  return {type:"FeatureCollection", features:f};
}

/* ---------------- Ebenen für Linien, Pfeile, Flächen ---------------- */
const W = (a,b)=>["interpolate",["linear"],["zoom"],4,a,12,b];
function addDataLayers(map, prefix, src){
  const P = prefix;
  map.addSource(P, {type:"geojson", data:src});
  const isLine = ["==",["get","typ"],"linie"];
  const isArrow = ["==",["get","typ"],"pfeil"], dashed = ["==",["get","stil"],"gestrichelt"];
  map.addLayer({id:P+"-area-fill", type:"fill", source:P, filter:["==",["get","typ"],"flaeche"], paint:{"fill-color":["get","farbe"],"fill-opacity":0.14}});
  map.addLayer({id:P+"-area-line", type:"line", source:P, filter:["==",["get","typ"],"flaeche"], layout:{"line-join":"miter"}, paint:{"line-color":["get","farbe"],"line-width":W(1.5,3),"line-dasharray":[3,2]}});
  map.addLayer({id:P+"-casing", type:"line", source:P, filter:isLine, layout:{"line-join":"miter","line-cap":"butt"}, paint:{"line-color":"#000","line-opacity":0.55,"line-width":W(5,9)}});
  map.addLayer({id:P+"-line", type:"line", source:P, filter:["all",isLine,["!=",["get","stil"],"gestrichelt"]], layout:{"line-join":"miter","line-cap":"butt"}, paint:{"line-color":["get","farbe"],"line-width":W(2.5,5)}});
  map.addLayer({id:P+"-dash", type:"line", source:P, filter:["all",isLine,["==",["get","stil"],"gestrichelt"]], layout:{"line-join":"miter","line-cap":"butt"}, paint:{"line-color":["get","farbe"],"line-width":W(2.5,5),"line-dasharray":[2,1.5]}});
  map.addLayer({id:P+"-arrow-casing", type:"line", source:P, filter:isArrow, layout:{"line-join":"miter"}, paint:{"line-color":"#000","line-opacity":0.6,"line-width":W(3.5,6)}});
  map.addLayer({id:P+"-arrow-fill", type:"fill", source:P, filter:isArrow, paint:{"fill-color":["get","farbe"],"fill-opacity":["case",dashed,0.18,0.38]}});
  map.addLayer({id:P+"-arrow-line", type:"line", source:P, filter:["all",isArrow,["!",dashed]], layout:{"line-join":"miter"}, paint:{"line-color":["get","farbe"],"line-width":W(1.5,3)}});
  map.addLayer({id:P+"-arrow-dash", type:"line", source:P, filter:["all",isArrow,dashed], layout:{"line-join":"miter"}, paint:{"line-color":["get","farbe"],"line-width":W(1.5,3),"line-dasharray":[3,2]}});
  map.addLayer({id:P+"-sel", type:"line", source:P, filter:["==",["get","id"],"__none"], layout:{"line-join":"miter"}, paint:{"line-color":"#ffffff","line-width":W(1.5,2.5),"line-gap-width":W(4,8)}});
  map.addLayer({id:P+"-hit", type:"line", source:P, paint:{"line-color":"#000","line-opacity":0,"line-width":18}});
}
const DATA_LAYERS = p => [p+"-area-fill",p+"-area-line",p+"-casing",p+"-line",p+"-dash",p+"-arrow-casing",p+"-arrow-fill",p+"-arrow-line",p+"-arrow-dash",p+"-sel",p+"-hit"];

/* ---------------- Karte erstellen ---------------- */
/* ---------------- Importierte Lagedaten (MilX → import/lage.geojson) ---------------- */
const IMPORT_URL = "import/lage.geojson";
let importData = null, importPromise = null;
const importHidden = new Set();
function loadImport(){
  if(!importPromise) importPromise = fetch(IMPORT_URL, {cache:"no-cache"}).then(r=>r.ok ? r.json() : null).catch(()=>null).then(d=>importData = d);
  return importPromise;
}
/* NATO-Symbol als Kartenbild, Ankerpunkt in der Bildmitte */
function importIcon(sidc){
  let src = null, ax = 0, ay = 0, w = 0, h = 0;
  try{
    if(window.ms && ms.Symbol){
      const s = new ms.Symbol(sidc, {size:26, outlineWidth:3, outlineColor:"rgba(0,0,0,0.75)"});
      if(!s.isValid || s.isValid()){ src = s.asCanvas(2); const a = s.getAnchor(), z = s.getSize(); ax = a.x; ay = a.y; w = z.width; h = z.height; }
    }
  }catch(e){ src = null; }
  const W = src ? Math.ceil(2*Math.max(ax, w-ax)) : 40, H = src ? Math.ceil(2*Math.max(ay, h-ay)) : 28;
  const cv = document.createElement("canvas"); cv.width = W*2; cv.height = H*2;
  const g = cv.getContext("2d");
  if(src) g.drawImage(src, (W/2 - ax)*2, (H/2 - ay)*2);
  else { const c = (SIDES[sidc[1]]||SIDES.U).color; g.fillStyle = c; g.strokeStyle = "#000"; g.lineWidth = 4; g.fillRect(4,4,W*2-8,H*2-8); g.strokeRect(4,4,W*2-8,H*2-8); }
  return {width:cv.width, height:cv.height, data:g.getImageData(0,0,cv.width,cv.height).data};
}
function addImportIcon(map, id){
  if(!id || id.indexOf("imp-")!==0 || map.hasImage(id)) return;
  try{ map.addImage(id, importIcon(id.slice(4)), {pixelRatio:2}); }catch(e){}
}
function importFilter(extra){
  const f = ["all", extra];
  if(importHidden.size) f.push(["!", ["in", ["get","ebene"], ["literal", [...importHidden]]]]);
  return f;
}
const IMP_LAYERS = ["imp-fill","imp-line","imp-change-fill","imp-change-line","imp-change-label","imp-sym","imp-sym-small"];
/* Veränderungen werden so lange kräftig gezeigt */
const CHANGE_DAYS = 14;
const CHANGE_COL = {ru:"#d8344a", ua:"#2f7fe0", grau:"#d6d6d6"};
const changeCutoff = ()=>new Date(Date.now() - CHANGE_DAYS*864e5).toISOString().slice(0,10);
const isRecentChange = ()=>["all",["==",["get","art"],"aenderung"],[">=",["coalesce",["get","datum"],""],changeCutoff()]];
function applyImportFilters(map){
  const base = {"imp-fill":["==",["get","art"],"flaeche"], "imp-line":["in",["get","art"],["literal",["flaeche","linie"]]],
    "imp-change-fill":isRecentChange(), "imp-change-line":isRecentChange(), "imp-change-label":isRecentChange(),
    "imp-sym":["all",["==",["get","art"],"symbol"],["!=",["get","ebene"],"units-lower"]], "imp-sym-small":["all",["==",["get","art"],"symbol"],["==",["get","ebene"],"units-lower"]]};
  for(const id of IMP_LAYERS) if(map.getLayer(id)) map.setFilter(id, importFilter(base[id]));
}
function addImportLayers(map){
  if(!importData || map.getSource("imp")) return;
  const before = map.getLayer("lage-area-fill") ? "lage-area-fill" : undefined;
  const fontLayer = map.getStyle().layers.find(l=>l.type==="symbol" && l.layout && l.layout["text-font"]);
  const font = fontLayer ? fontLayer.layout["text-font"] : ["Noto Sans Regular"];
  [...new Set(importData.features.filter(f=>f.properties.art==="symbol").map(f=>f.properties.sidc))].forEach(s=>addImportIcon(map, "imp-"+s));
  if(!map.getStyle()) return;
  map.addSource("imp", {type:"geojson", data:importData, attribution: importData.meta && importData.meta.quelle ? "Lage: " + importData.meta.quelle : undefined});
  map.addLayer({id:"imp-fill", type:"fill", source:"imp", filter:["==",["get","art"],"flaeche"], paint:{"fill-color":["get","fuellung"], "fill-opacity":["case",["==",["get","ebene"],"ukraine-terr"],0.05,["==",["get","ebene"],"russian-terr"],0.32,["min",["get","deckkraft"],0.18]]}}, before);
  map.addLayer({id:"imp-line", type:"line", source:"imp", filter:["in",["get","art"],["literal",["flaeche","linie"]]], paint:{"line-color":["get","linie"], "line-width":["interpolate",["linear"],["zoom"],4,0.8,10,2], "line-opacity":["case",["==",["get","ebene"],"ukraine-terr"],0.35,1]}}, before);
  const chCol = ["match",["get","richtung"],"ru",CHANGE_COL.ru,"ua",CHANGE_COL.ua,CHANGE_COL.grau];
  map.addLayer({id:"imp-change-fill", type:"fill", source:"imp", filter:isRecentChange(), paint:{"fill-color":chCol, "fill-opacity":0.3}}, before);
  map.addLayer({id:"imp-change-line", type:"line", source:"imp", filter:isRecentChange(), layout:{"line-join":"round"}, paint:{"line-color":chCol, "line-width":["interpolate",["linear"],["zoom"],5,1.5,10,3]}}, before);
  map.addLayer({id:"imp-change-label", type:"symbol", source:"imp", minzoom:8, filter:isRecentChange(), layout:{"text-field":["coalesce",["get","datum"],""], "text-font":font, "text-size":11, "symbol-placement":"point"},
    paint:{"text-color":"#ffffff","text-halo-color":"rgba(0,0,0,0.9)","text-halo-width":1.5}}, before);
  const sym = (id, minzoom, size)=>({id, type:"symbol", source:"imp", minzoom, layout:{
      "icon-image":["concat","imp-",["get","sidc"]], "icon-size":["interpolate",["linear"],["zoom"],4,size*0.38,6,size*0.55,8,size*0.8,12,size],
      "icon-allow-overlap":false, "text-optional":true,
      "text-field":["step",["zoom"],"",7.5,["coalesce",["get","name"],""]], "text-font":font, "text-size":11,
      "text-offset":[0,1.5], "text-anchor":"top", "text-max-width":9},
    paint:{"text-color":"#ffffff", "text-halo-color":"rgba(0,0,0,0.85)", "text-halo-width":1.4}});
  map.addLayer(sym("imp-sym", 4.5, 1), before);
  map.addLayer(sym("imp-sym-small", 7.5, 0.9), before);
  applyImportFilters(map);
}
function setImportHidden(map, ids){
  importHidden.clear(); ids.forEach(i=>importHidden.add(i));
  applyImportFilters(map);
}
function importLegend(project, inView){
  if(!importData) return [];
  const out = [];
  for(const L of (importData.meta && importData.meta.ebenen) || []){
    if(importHidden.has(L.id)) continue;
    if(L.id==="aenderungen"){
      const cut = changeCutoff();
      const rec = importData.features.filter(f=>f.properties.art==="aenderung" && (f.properties.datum||"") >= cut && f.geometry.coordinates[0].some(inView));
      const lab = {ru:"Neu russisch kontrolliert", ua:"Neu ukrainisch kontrolliert", grau:"Neu Grauzone"};
      for(const k of ["ru","ua","grau"]) if(rec.some(f=>f.properties.richtung===k)) out.push({kind:"flaeche", color:CHANGE_COL[k], dash:false, label:lab[k]});
      continue;
    }
    const fs = importData.features.filter(f=>f.properties.ebene===L.id && (f.geometry.type==="Point" ? inView(f.geometry.coordinates) : f.geometry.coordinates[0].some ? (f.geometry.type==="Polygon" ? f.geometry.coordinates[0] : f.geometry.coordinates).some(inView) : false));
    if(!fs.length) continue;
    const areas = fs.filter(f=>f.properties.art==="flaeche");
    if(areas.length){
      const cnt = {}; areas.forEach(f=>cnt[f.properties.fuellung]=(cnt[f.properties.fuellung]||0)+1);
      const col = Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0];
      out.push({kind:"flaeche", color:col, dash:false, label:L.name});
    }
    const syms = fs.filter(f=>f.properties.art==="symbol");
    if(syms.length) out.push({kind:"symbol", el:{typ:"symbol", sidc:syms[0].properties.sidc}, label:L.name});
  }
  return out;
}

/* ---------------- Frontlinie bearbeiten ---------------- */
/* Ersetzt den Randabschnitt eines Rings zwischen den Ecken iA und iB durch einen neuen Verlauf.
   ring: offener Ring (ohne doppelten Endpunkt), pts: neue Zwischenpunkte von A nach B.
   Ersetzt wird der Abschnitt, der näher am neuen Verlauf liegt. */
function pointInRing(pt, ring){
  let inside = false;
  for(let i=0, j=ring.length-1; i<ring.length; j=i++){
    const [xi,yi] = ring[i], [xj,yj] = ring[j];
    if(((yi>pt[1]) !== (yj>pt[1])) && (pt[0] < (xj-xi)*(pt[1]-yi)/((yj-yi)||1e-12) + xi)) inside = !inside;
  }
  return inside;
}
function ringArea(r){ let a=0; for(let i=0;i<r.length;i++){ const [x1,y1]=r[i],[x2,y2]=r[(i+1)%r.length]; a += x1*y2-x2*y1; } return a/2; }
function replaceFront(ring, iA, iB, pts){
  const n = ring.length;
  if(iA===iB || n < 3) return null;
  const fwd = [], bwd = [];
  for(let i=iA;;i=(i+1)%n){ fwd.push(i); if(i===iB) break; }
  for(let i=iA;;i=(i-1+n)%n){ bwd.push(i); if(i===iB) break; }
  const k = Math.cos((ring[iA][1]||0)*Math.PI/180);
  const dist = (p,q)=>Math.hypot((p[0]-q[0])*k, p[1]-q[1]);
  const near = idx=>{
    if(!pts.length) return idx.length;
    let s = 0; for(const p of pts){ let m = Infinity; for(const i of idx) m = Math.min(m, dist(p, ring[i])); s += m; }
    return s / pts.length;
  };
  /* Ersetzt wird der Abschnitt, bei dem die Änderungsfläche am kleinsten ist (Frontänderungen sind örtlich) */
  const changeOf = idx => [...idx.map(i=>ring[i]), ...pts.slice().reverse()];
  const aF = Math.abs(ringArea(changeOf(fwd).map(([x,y])=>[x*k,y]))), aB = Math.abs(ringArea(changeOf(bwd).map(([x,y])=>[x*k,y])));
  const replaceFwd = aF === aB ? near(fwd) <= near(bwd) : aF < aB;
  const replaced = replaceFwd ? fwd : bwd, kept = replaceFwd ? bwd : fwd;
  /* neuer Ring: A → neue Punkte → B → behaltener Abschnitt zurück zu A */
  const keptBack = kept.slice(1, -1).reverse().map(i=>ring[i]);
  const newRing = [ring[iA], ...pts, ring[iB], ...keptBack];
  /* Änderungsfläche: alter Abschnitt A→B und neuer Verlauf B→A */
  const change = [...replaced.map(i=>ring[i]), ...pts.slice().reverse()];
  /* Ist die Fläche gewachsen? Mittelpunkt des neuen Verlaufs außerhalb der alten Fläche → ja */
  const probe = pts.length ? pts[Math.floor(pts.length/2)] : null;
  const grew = probe ? !pointInRing(probe, ring) : Math.abs(ringArea(newRing)) > Math.abs(ringArea(ring));
  return {newRing, change, grew};
}
const close = r => (r.length && (r[0][0]!==r[r.length-1][0] || r[0][1]!==r[r.length-1][1])) ? r.concat([r[0]]) : r;
const open = r => (r.length>1 && r[0][0]===r[r.length-1][0] && r[0][1]===r[r.length-1][1]) ? r.slice(0,-1) : r;
/* Nächste Randecke einer Fläche der gewählten Ebene, in Bildschirmpixeln */
function nearestEdge(map, ebene, lngLat, onlyFeature){
  if(!importData) return null;
  const p = map.project(lngLat); let best = null;
  for(const f of importData.features){
    if(f.properties.ebene!==ebene || f.properties.art!=="flaeche" || f.geometry.type!=="Polygon") continue;
    if(onlyFeature && f!==onlyFeature) continue;
    const ring = open(f.geometry.coordinates[0]);
    for(let i=0;i<ring.length;i++){
      const q = map.project(ring[i]), d = Math.hypot(q.x-p.x, q.y-p.y);
      if(!best || d < best.d) best = {f, i, d, pt:ring[i]};
    }
  }
  return best;
}
function applyFrontEdit(f, iA, iB, pts, meta){
  const ring = open(f.geometry.coordinates[0]);
  const r = replaceFront(ring, iA, iB, pts);
  if(!r) return null;
  const before = f.geometry.coordinates;
  f.geometry.coordinates = [close(r.newRing)].concat(before.slice(1));
  const ebene = f.properties.ebene;
  const gainSide = ebene==="ukraine-terr" ? "ua" : ebene==="gray-zone" ? "grau" : "ru";
  const lossSide = ebene==="ukraine-terr" ? "ru" : ebene==="gray-zone" ? "grau" : "ua";
  const change = {type:"Feature", properties:{art:"aenderung", ebene:"aenderungen", richtung: r.grew ? gainSide : lossSide, datum: meta.datum, von: ebene},
    geometry:{type:"Polygon", coordinates:[close(r.change)]}};
  importData.features.push(change);
  const m = importData.meta = importData.meta || {ebenen:[]};
  m.ebenen = m.ebenen || [];
  if(!m.ebenen.some(e=>e.id==="aenderungen")) m.ebenen.push({id:"aenderungen", name:"Veränderungen", anzahl:0});
  m.ebenen.find(e=>e.id==="aenderungen").anzahl = importData.features.filter(x=>x.properties.art==="aenderung").length;
  return {f, before, change};
}
function undoFrontEdit(u){
  u.f.geometry.coordinates = u.before;
  const i = importData.features.indexOf(u.change); if(i>=0) importData.features.splice(i,1);
}
function setImportData(map, d){
  importData = d; importPromise = Promise.resolve(d);
  if(!map) return;
  const src = map.getSource && map.getSource("imp");
  if(src) src.setData(d); else if(map.isReady && map.isReady()){ try{ addImportLayers(map); }catch(e){ console.warn("Lagedaten:", e); } }
}
function refreshImport(map){ const src = map.getSource && map.getSource("imp"); if(src) src.setData(importData); }

function createMap(opts){
  let current = opts.style || "sat", free = false, errs = 0, globe = opts.globe!==false;
  const map = new maplibregl.Map({container:opts.container, style:styleOf(current), center:START.center, zoom:START.zoom,
    attributionControl:false, doubleClickZoom: opts.doubleClickZoom!==false});
  map.addControl(new maplibregl.NavigationControl(), "top-right");
  map.addControl(new maplibregl.ScaleControl({unit:"metric"}), "bottom-right");
  map.addControl(new maplibregl.AttributionControl({compact:false}), "bottom-right");
  map.on("error", e=>{
    if(e && e.sourceId==="esri"){ if(++esriErrs > 6) esriFailed(map); return; }
    if(free) return;
    const st = e && e.error && e.error.status;
    /* Nur bei klaren Absagen von MapTiler umschalten, nicht bei einzelnen langsamen Kacheln */
    const fromMT = e && e.error && /api\.maptiler\.com/.test(String(e.error.url || e.error.message || ""));
    if((st===401 || st===403 || st===429) && (fromMT || !e.sourceId)){
      free = true; const logo = document.getElementById("mtLogo"); if(logo) logo.hidden = true;
      styleReady = false; map.setStyle(STYLE_FREE, {diff:false});
      if(opts.onNotice) opts.onNotice(st===429 ? "MapTiler-Kontingent aufgebraucht – Ersatzkarte aktiv" : "MapTiler-Schlüssel abgelehnt – Ersatzkarte aktiv");
    }
  });
  let styleReady = false;
  map.on("style.load", ()=>{
    styleReady = true;
    try{ map.setProjection({type: globe ? "globe" : "mercator"}); }catch(e){}
    const logo = document.getElementById("mtLogo"); if(logo) logo.hidden = free || !!STYLES[current].own;
    const th = free ? "dark" : STYLES[current].theme;
    if(th){ try{ applyTheme(map, th); }catch(e){ console.warn("Farbschema:", e); } }
    if(!free && current==="sat") addEsri(map);
    if(importData){ try{ addImportLayers(map); }catch(e){ console.warn("Lagedaten:", e); } }
    if(opts.onStyle) opts.onStyle(map);
  });
  map.setBase = k=>{ if(free || !STYLES[k] || k===current) return; current = k; errs = 0; styleReady = false; map.setStyle(styleOf(k), {diff:false}); };
  map.setGlobe = g=>{ globe = g; try{ map.setProjection({type: g ? "globe" : "mercator"}); }catch(e){} };
  map.currentBase = ()=>current;
  map.isFree = ()=>free;
  map.isReady = ()=>styleReady;
  map.on("styleimagemissing", e=>addImportIcon(map, e.id));
  map.setImportHidden = ids=>setImportHidden(map, ids);
  /* Lagedaten: sofort einfügen, wenn der Kartenstil schon steht (auch wenn noch Kacheln laden), sonst beim nächsten style.load */
  if(opts.importLayers !== false) loadImport().then(d=>{ if(!d) return; if(styleReady){ try{ addImportLayers(map); }catch(e){ console.warn("Lagedaten:", e); } } if(opts.onImport) opts.onImport(d); });
  return map;
}

/* ---------------- NATO-Symbole als Marker ---------------- */
function symbolMarker(map, el, o){
  o = o||{};
  const r = symbolSVG(el, o.size||30);
  const div = document.createElement("div");
  div.className = "nato"; div.innerHTML = r.svg; div.title = (el.name||"")+(el.name?" – ":"")+describe(el);
  div.style.width = r.w+"px"; div.style.height = r.h+"px";
  const m = new maplibregl.Marker({element:div, anchor:"top-left", offset:[-r.ax,-r.ay], draggable:!!o.draggable})
    .setLngLat(el.koordinaten).addTo(map);
  div.addEventListener("click", ev=>{ ev.stopPropagation(); o.onClick && o.onClick(el); });
  if(o.onDragEnd) m.on("dragend", ()=>{ const ll = m.getLngLat(); o.onDragEnd(el, [+ll.lng.toFixed(5), +ll.lat.toFixed(5)]); });
  return m;
}

/* ---------------- Bild-Export ---------------- */
/* Aufbau wie eine Lagekarte zum Teilen: Karte links (bzw. oben), Seitenleiste mit Titel, Legende,
   Übersichtskarte und Quellen. Die Ausgabegröße hängt nur von Format und Qualität ab, nicht vom Bildschirm. */
const QUAL = {2:1920, 3:2880, 4:3840};
function exportLayout(ratio, q, layout){
  const TW = QUAL[q] || 2880, TH = Math.round(TW/ratio), u = TW/1000, p = Math.round(12*u);
  if(layout==="overlay") return {TW, TH, u, p:0, overlay:true, portrait: ratio < 1.2, map:{x:0, y:0, w:TW, h:TH}};
  if(ratio >= 1.2){
    const sw = Math.round(300*u);
    return {TW, TH, u, p, portrait:false, map:{x:p, y:p, w:TW-3*p-sw, h:TH-2*p}, side:{x:TW-p-sw, y:p, w:sw, h:TH-2*p}};
  }
  const ph = Math.round(TH*0.3);
  return {TW, TH, u, p, portrait:true, map:{x:p, y:p, w:TW-2*p, h:TH-3*p-ph}, side:{x:p, y:TH-p-ph, w:TW-2*p, h:ph}};
}
function loadImg(src){ return new Promise((res,rej)=>{ const i = new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; }); }
const svgImgCache = {};
function symbolImg(el, size){
  const r = symbolSVG(el, size);
  let svg = r.svg; if(!/xmlns=/.test(svg)) svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  const key = svg;
  if(!svgImgCache[key]) svgImgCache[key] = loadImg("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)).then(img=>({img, r}), ()=>null);
  return svgImgCache[key];
}
function niceScale(maxMeters){
  const p = Math.pow(10, Math.floor(Math.log10(maxMeters)));
  for(const f of [5,2,1]) if(f*p <= maxMeters) return f*p;
  return p;
}
function attributionFor(map, center, zoom){
  if((map.isFree && map.isFree()) || map.currentBase()==="karte") return "Karte: © OpenFreeMap, © OpenStreetMap-Mitwirkende";
  let a = "Karte: © MapTiler, © OpenStreetMap-Mitwirkende";
  const [w,s,e,n] = ESRI_BOUNDS;
  if(map.currentBase()==="sat" && !esriOff && zoom >= 7 && center[0]>w && center[0]<e && center[1]>s && center[1]<n)
    a += ". Satellit: Powered by Esri (Esri, Maxar, Earthstar Geographics)";
  return a;
}
function offMap(opts){
  const holder = document.createElement("div");
  holder.style.cssText = `position:fixed;left:-${opts.w*2+200}px;top:0;width:${opts.w}px;height:${opts.h}px;pointer-events:none;opacity:0`;
  document.body.appendChild(holder);
  const m = new maplibregl.Map(Object.assign({container:holder, interactive:false, attributionControl:false, pixelRatio:2, fadeDuration:0,
    preserveDrawingBuffer:true, canvasContextAttributes:{preserveDrawingBuffer:true}}, opts.map));
  m.on("error", ()=>{});
  m.on("styleimagemissing", e=>addImportIcon(m, e.id));
  const ready = new Promise(res=>{
    const t = setTimeout(res, 45000);
    m.once("load", ()=>{ opts.onLoad && opts.onLoad(m); m.once("idle", ()=>{ clearTimeout(t); res(); }); });
  });
  return {m, ready, done(){ try{ m.remove(); }catch(e){} holder.remove(); }};
}
function wrapText(g, text, maxW, maxLines){
  const words = text.split(/\s+/).filter(Boolean), lines = [];
  let cur = "";
  for(const w of words){
    const t = cur ? cur+" "+w : w;
    if(g.measureText(t).width <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
  }
  if(cur) lines.push(cur);
  if(maxLines && lines.length > maxLines){ lines.length = maxLines; lines[maxLines-1] += " …"; }
  return lines;
}
function legendItems(shown){
  const items = [], seen = new Set();
  for(const el of shown){
    let it;
    if(el.typ==="symbol") it = {kind:"symbol", el, label: el.name || describe(el)};
    else it = {kind: el.typ, color: el.farbe||"#ffffff", dash: el.stil==="gestrichelt", label: el.name || {linie:"Linie", pfeil:"Bewegung", flaeche:"Gebiet"}[el.typ]};
    const key = it.kind + "|" + (it.kind==="symbol" ? sidcOf(el) : it.color + it.dash) + "|" + it.label;
    if(seen.has(key)) continue; seen.add(key); items.push(it);
  }
  const order = {flaeche:0, linie:1, pfeil:2, symbol:3};
  return items.sort((a,b)=>order[a.kind]-order[b.kind]);
}
async function drawLegendRow(g, it, x, y, u, maxW){
  const sw = 26*u, cy = y + 11*u;
  if(it.kind==="flaeche"){ g.fillStyle = it.color; g.globalAlpha = .35; g.fillRect(x, cy-7*u, sw, 14*u); g.globalAlpha = 1; g.strokeStyle = it.color; g.lineWidth = 1.5*u; g.setLineDash([4*u,3*u]); g.strokeRect(x, cy-7*u, sw, 14*u); g.setLineDash([]); }
  else if(it.kind==="pfeil"){
    g.beginPath(); g.moveTo(x, cy+1*u); g.lineTo(x+4*u, cy+3.5*u); g.lineTo(x, cy+6*u); g.lineTo(x+16*u, cy+4*u); g.lineTo(x+16*u, cy+7*u); g.lineTo(x+sw, cy); g.lineTo(x+16*u, cy-7*u); g.lineTo(x+16*u, cy-4*u); g.closePath();
    g.fillStyle = it.color; g.globalAlpha = it.dash ? .3 : .6; g.fill(); g.globalAlpha = 1;
    g.strokeStyle = it.color; g.lineWidth = 1.5*u; if(it.dash) g.setLineDash([4*u,3*u]); g.lineJoin = "miter"; g.stroke(); g.setLineDash([]);
  }
  else if(it.kind==="linie"){
    g.strokeStyle = it.color; g.lineWidth = 3*u; if(it.dash) g.setLineDash([6*u,4*u]);
    g.beginPath(); g.moveTo(x, cy); g.lineTo(x + sw - (it.kind==="pfeil"?7*u:0), cy); g.stroke(); g.setLineDash([]);
    if(it.kind==="pfeil"){ g.fillStyle = it.color; g.beginPath(); g.moveTo(x+sw, cy); g.lineTo(x+sw-9*u, cy-6*u); g.lineTo(x+sw-9*u, cy+6*u); g.closePath(); g.fill(); }
  } else {
    const s = await symbolImg(it.el, 22);
    if(s){ const sc = Math.min(sw/s.r.w, 20*u/s.r.h); g.drawImage(s.img, x + (sw - s.r.w*sc)/2, cy - s.r.h*sc/2, s.r.w*sc, s.r.h*sc); }
  }
  g.fillStyle = "#e6e8eb"; g.font = `500 ${12*u}px "Archivo", Arial, sans-serif`; g.textBaseline = "middle";
  let t = it.label; while(g.measureText(t).width > maxW - sw - 12*u && t.length > 4) t = t.slice(0,-2);
  if(t !== it.label) t = t.replace(/\s*$/,"") + "…";
  g.fillText(t, x + sw + 12*u, cy);
}

async function exportImage(map, o){
  const ratio = o.ratio || 16/9, L = exportLayout(ratio, o.quality || 3, o.layout), u = L.u;
  const fw = o.frame.w, fh = o.frame.h;
  const c = map.unproject([o.frame.x + fw/2, o.frame.y + fh/2]);
  const cssW = Math.round(L.map.w/2), cssH = Math.round(L.map.h/2);
  const zoom = map.getZoom() + Math.log2(cssW / fw), bearing = map.getBearing(), pitch = map.getPitch();

  const main = offMap({w:cssW, h:cssH, map:{style:map.getStyle(), center:c, zoom, bearing, pitch},
    onLoad: m=>{ try{ if(m.getLayer("lage-sel")) m.setFilter("lage-sel",["==",["get","id"],"__none"]); }catch(e){} }});
  /* Übersichtskarte */
  const sideInner = L.overlay ? {w:(L.portrait?320:270)*u, h:(L.portrait?320:270)*u*0.64}
    : L.portrait ? {w: L.side.w*0.38, h: L.side.h - 40*u} : {w: L.side.w - 40*u, h: (L.side.w - 40*u)*0.62};
  const iw = Math.round(sideInner.w/2), ih = Math.round(sideInner.h/2);
  const inUA = c.lng > ESRI_BOUNDS[0] && c.lng < ESRI_BOUNDS[2] && c.lat > ESRI_BOUNDS[1] && c.lat < ESRI_BOUNDS[3];
  const insetMap = inUA ? {bounds:[[22.1,44.3],[40.2,52.4]], fitBoundsOptions:{padding:6}} : {center:c, zoom:Math.max(1, zoom - 4.5)};
  const useDark = true;
  const inset = o.overview===false ? null : offMap({w:iw, h:ih, map:Object.assign({style: useDark ? styleOf("karte") : map.getStyle()}, insetMap),
    onLoad: m=>{
      if(!importData) return;
      const isRed = c=>{ const v = parseInt(String(c||"").slice(1),16); if(isNaN(v)) return false; const r=v>>16&255, b=v&255; return r > b + 40; };
      const cut = changeCutoff();
      const feats = importData.features.filter(f=>f.geometry.type==="Polygon" && (
        (f.properties.ebene==="russian-terr" && f.properties.art==="flaeche" && isRed(f.properties.fuellung)) ||
        (f.properties.art==="aenderung" && f.properties.richtung==="ru")));
      if(!feats.length) return;
      const before = m.getLayer("water-name") ? "water-name" : undefined;
      try{
        m.addSource("ru", {type:"geojson", data:{type:"FeatureCollection", features:feats}});
        m.addLayer({id:"ru-fill", type:"fill", source:"ru", paint:{"fill-color":"#e5383b", "fill-opacity":0.45}}, before);
        m.addLayer({id:"ru-line", type:"line", source:"ru", paint:{"line-color":"#ff5a5c", "line-width":1}}, before);
      }catch(e){}
    }});


  try{
    await Promise.all([main.ready, inset ? inset.ready : null]);
    const out = document.createElement("canvas"); out.width = L.TW; out.height = L.TH;
    const g = out.getContext("2d");
    try{ if(document.fonts) await Promise.all([document.fonts.load(`${40*u}px "Setline Display"`), document.fonts.load(`500 ${12*u}px "IBM Plex Mono"`), document.fonts.load(`500 ${12*u}px "Archivo"`)]); }catch(e){}
    g.fillStyle = "#0e0f11"; g.fillRect(0, 0, L.TW, L.TH);

    /* Karte */
    const M = L.map, src = main.m.getCanvas();
    g.drawImage(src, M.x, M.y, M.w, M.h);
    const sx = M.w / cssW;
    const inView = ll=>{ const p = main.m.project(ll); return p.x >= -20 && p.y >= -20 && p.x <= cssW+20 && p.y <= cssH+20; };
    const shown = (o.elements||[]).filter(el=> el.typ==="symbol" ? inView(el.koordinaten) : (el.koordinaten||[]).some(inView));
    const impLegend = importLegend(null, inView);

    /* Inset-Rahmen zeichnen (für beide Aufbauten) */
    const drawInsetMark = (IX, IY, IW, IH)=>{
      const isx = IW / iw, corners = [[0,0],[cssW,0],[cssW,cssH],[0,cssH]].map(p=>main.m.unproject(p)).map(ll=>inset.m.project(ll));
      const xs = corners.map(p=>IX + p.x*isx), ys = corners.map(p=>IY + p.y*isx);
      const rw = Math.max(...xs) - Math.min(...xs), rh = Math.max(...ys) - Math.min(...ys);
      g.save(); g.beginPath(); g.rect(IX, IY, IW, IH); g.clip();
      if(rw < 10*u || rh < 10*u){
        const mx = (Math.max(...xs)+Math.min(...xs))/2, my = (Math.max(...ys)+Math.min(...ys))/2, k = 9*u;
        g.strokeStyle = "#ffffff"; g.lineWidth = 2.5*u; g.strokeRect(mx-k, my-k, 2*k, 2*k);
        g.fillStyle = "#ffffff"; g.fillRect(mx-2*u, my-2*u, 4*u, 4*u);
      } else {
        g.fillStyle = "rgba(255,255,255,0.18)"; g.strokeStyle = "#ffffff"; g.lineWidth = 2*u;
        g.beginPath(); xs.forEach((x,i)=> i ? g.lineTo(x, ys[i]) : g.moveTo(x, ys[i])); g.closePath(); g.fill(); g.stroke();
      }
      g.restore();
    };
    const shadowText = (txt, x, y, color, blur)=>{ g.save(); g.shadowColor = "rgba(0,0,0,0.75)"; g.shadowBlur = (blur||8)*u; g.fillStyle = color; g.fillText(txt, x, y); g.restore(); };
    const drawOverlay = async ()=>{
      const TW = L.TW, TH = L.TH, pad = 26*u;
      /* Abdunkeln an den Rändern, damit Schrift lesbar bleibt */
      const vg = g.createRadialGradient(TW/2, TH/2, Math.min(TW,TH)*0.3, TW/2, TH/2, Math.hypot(TW,TH)/2);
      vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.5)"); g.fillStyle = vg; g.fillRect(0,0,TW,TH);
      let gr = g.createLinearGradient(0, 0, 0, 230*u); gr.addColorStop(0, "rgba(10,11,13,0.8)"); gr.addColorStop(1, "rgba(10,11,13,0)"); g.fillStyle = gr; g.fillRect(0, 0, TW, 230*u);
      gr = g.createLinearGradient(0, TH - 260*u, 0, TH); gr.addColorStop(0, "rgba(10,11,13,0)"); gr.addColorStop(1, "rgba(10,11,13,0.7)"); g.fillStyle = gr; g.fillRect(0, TH - 260*u, TW, 260*u);
      /* Sucher-Ecken */
      const ci = 12*u, cl = 26*u, ct = 3*u; g.fillStyle = "#ffffff";
      [[ci,ci,1,1],[TW-ci,ci,-1,1],[ci,TH-ci,1,-1],[TW-ci,TH-ci,-1,-1]].forEach(([x,y,dx,dy])=>{ g.fillRect(dx>0?x:x-cl, dy>0?y:y-ct, cl, ct); g.fillRect(dx>0?x:x-ct, dy>0?y:y-cl, ct, cl); });

      /* oben links: Logo, Titel, Stand */
      let y = pad + 8*u; const x0 = pad + 8*u;
      g.textBaseline = "middle";
      if(o.credit){
        g.save(); g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 6*u; g.fillStyle = "#ffffff"; g.fillRect(x0, y, 20*u, 20*u); g.restore();
        g.font = `${22*u}px "Setline Display", "Archivo", Arial, sans-serif`;
        shadowText(o.credit.toUpperCase(), x0 + 30*u, y + 11*u, "#f2f3f5"); y += 42*u;
      }
      if(o.title){
        const maxW = Math.min(TW*0.55, 600*u); let fs = 56*u, lines;
        for(;;){ g.font = `${fs}px "Setline Display", "Archivo", Arial, sans-serif`; lines = wrapText(g, o.title.toUpperCase(), maxW); if((lines.length <= 2 && lines.every(l=>g.measureText(l).width <= maxW)) || fs < 24*u) break; fs -= 2*u; }
        lines = lines.slice(0, 3);
        const th = lines.length * fs * 0.98;
        g.fillStyle = "#ffffff"; g.fillRect(x0, y + 2*u, 5*u, th - 6*u);
        g.textBaseline = "top"; lines.forEach((l,i)=>shadowText(l, x0 + 20*u, y + i*fs*0.98, "#ffffff", 10));
        y += th + 6*u;
      }
      if(o.subtitle){ g.font = `500 ${14*u}px "IBM Plex Mono", Menlo, monospace`; g.textBaseline = "top"; shadowText(o.subtitle.toUpperCase(), x0 + (o.title?20*u:0), y, "#e2e1d6", 6); }

      /* oben rechts: Koordinaten und Quellen */
      g.textAlign = "right"; g.textBaseline = "top";
      const ll = `${Math.abs(c.lat).toFixed(4)}° ${c.lat>=0?"N":"S"}   ${Math.abs(c.lng).toFixed(4)}° ${c.lng>=0?"O":"W"}`;
      g.font = `600 ${13*u}px "IBM Plex Mono", Menlo, monospace`; shadowText(ll, TW - pad - 8*u, pad + 8*u, "#ffffff", 6);
      g.font = `${9.5*u}px "IBM Plex Mono", Menlo, monospace`;
      wrapText(g, attributionFor(map, [c.lng, c.lat], zoom), 520*u, 3).forEach((l,i)=>shadowText(l, TW - pad - 8*u, pad + 32*u + i*13*u, "rgba(241,240,232,0.8)", 5));
      g.textAlign = "left";

      /* unten links: Übersichtskarte */
      let scaleX = pad + 8*u;
      if(inset){
        const IW = sideInner.w, IH = sideInner.h, hh = 0, IX = pad + 8*u, IY = TH - pad - 8*u - IH;
        g.save(); g.shadowColor = "rgba(0,0,0,0.55)"; g.shadowBlur = 18*u; g.fillStyle = "#0e0f11"; g.fillRect(IX, IY - hh, IW, IH + hh); g.restore();
        g.fillStyle = "#ffffff"; g.fillRect(IX, IY - hh, IW, 2*u);
        g.drawImage(inset.m.getCanvas(), IX, IY, IW, IH);
        g.strokeStyle = "#3a3e45"; g.lineWidth = 1.5*u; g.strokeRect(IX, IY - hh, IW, IH + hh);
        drawInsetMark(IX, IY, IW, IH);
        scaleX = IX + IW + 16*u;
      }
      drawScale(scaleX, TH - pad - 8*u, 0.1);

      /* unten rechts: Legende */
      if(o.legend !== false){
        const items = impLegend.concat(legendItems(shown));
        if(items.length){
          const LW = (L.portrait ? 360 : 270)*u, rowH = 21*u, head = 12*u, ip = 12*u;
          const maxRows = Math.max(1, Math.floor((TH*(L.portrait ? 0.32 : 0.4) - head - ip) / rowH));
          const list = items.length > maxRows ? items.slice(0, maxRows-1) : items;
          const more = items.length - list.length, rowsN = list.length + (more ? 1 : 0);
          const LH = head + rowsN*rowH + ip, LX = TW - pad - 8*u - LW, LY = TH - pad - 8*u - LH;
          g.save(); g.shadowColor = "rgba(0,0,0,0.55)"; g.shadowBlur = 18*u; g.fillStyle = "rgba(14,15,17,0.9)"; g.fillRect(LX, LY, LW, LH); g.restore();
          g.strokeStyle = "#3a3e45"; g.lineWidth = 1.5*u; g.strokeRect(LX, LY, LW, LH);
          g.fillStyle = "#ffffff"; g.fillRect(LX, LY, LW, 2*u);
          let yy = LY + head;
          for(const it of list){ await drawLegendRow(g, it, LX + ip, yy, u, LW - 2*ip); yy += rowH; }
          if(more){ g.fillStyle = "#7b818a"; g.font = `500 ${11*u}px "IBM Plex Mono", Menlo, monospace`; g.textBaseline = "middle"; g.fillText(`+ ${more} weitere`, LX + ip, yy + 11*u); }
        }
      }
    };
    g.save(); g.beginPath(); g.rect(M.x, M.y, M.w, M.h); g.clip();
    for(const el of shown.filter(e=>e.typ==="symbol")){
      const p = main.m.project(el.koordinaten), s = await symbolImg(el, 30);
      if(!s) continue;
      g.save(); g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 3*sx; g.shadowOffsetY = 1*sx;
      g.drawImage(s.img, M.x + (p.x - s.r.ax)*sx, M.y + (p.y - s.r.ay)*sx, s.r.w*sx, s.r.h*sx); g.restore();
    }
    /* Maßstab */
    const mpp = 40075016.686*Math.cos(c.lat*Math.PI/180)/(512*Math.pow(2,zoom)) / sx;
    const drawScale = (bx, byy, frac)=>{
      const meters = niceScale(mpp*M.w*frac), bar = meters/mpp, label = meters >= 1000 ? (meters/1000).toLocaleString("de-DE")+" km" : meters+" m";
      g.font = `600 ${13*u}px "IBM Plex Mono", Menlo, monospace`;
      const lw = g.measureText(label).width;
      g.fillStyle = "rgba(14,15,17,0.82)"; g.fillRect(bx, byy - 34*u, bar + lw + 40*u, 34*u);
      g.fillStyle = "#6b7079"; g.fillRect(bx+12*u, byy-12*u, bar, 3*u); g.fillStyle = "#f2f3f5"; g.fillRect(bx+12*u, byy-19*u, 2*u, 10*u); g.fillRect(bx+12*u+bar-2*u, byy-19*u, 2*u, 10*u);
      g.fillStyle = "#ffffff"; g.fillRect(bx+12*u, byy-12*u, bar/2, 3*u);
      g.fillStyle = "#f2f3f5"; g.textBaseline = "middle"; g.fillText(label, bx + 22*u + bar, byy - 13*u);
    };
    if(!L.overlay) drawScale(M.x + 16*u, M.y + M.h - 16*u, 0.15);
    if(Math.abs(bearing) > 0.5){
      const nx = M.x + M.w - (L.overlay ? 50 : 30)*u, ny = M.y + (L.overlay ? 90 : 30)*u;
      g.save(); g.translate(nx, ny); g.rotate(-bearing*Math.PI/180);
      g.fillStyle = "rgba(14,15,17,0.85)"; g.fillRect(-18*u,-18*u,36*u,36*u);
      g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(0,-12*u); g.lineTo(7*u,7*u); g.lineTo(0,2*u); g.lineTo(-7*u,7*u); g.closePath(); g.fill(); g.restore();
    }
    g.restore();
    if(L.overlay){ await drawOverlay(); }
    else {
    g.strokeStyle = "#3a3e45"; g.lineWidth = 1.5*u; g.strokeRect(M.x, M.y, M.w, M.h);

    /* Seitenleiste */
    const S = L.side, ip = 20*u;
    g.fillStyle = "#15171a"; g.fillRect(S.x, S.y, S.w, S.h);
    g.strokeStyle = "#3a3e45"; g.lineWidth = 1.5*u; g.strokeRect(S.x, S.y, S.w, S.h);
    g.fillStyle = "#ffffff"; g.fillRect(S.x, S.y, S.w, 3*u);
    const colW = L.portrait ? S.w*0.58 - ip : S.w - 2*ip, x0 = S.x + ip;
    let y = S.y + ip + 6*u;
    if(o.subtitle){
      g.fillStyle = "#ffffff"; g.fillRect(x0, y, 9*u, 9*u);
      g.fillStyle = "#a3a8b0"; g.font = `500 ${12*u}px "IBM Plex Mono", Menlo, monospace`; g.textBaseline = "middle";
      g.fillText(o.subtitle.toUpperCase(), x0 + 17*u, y + 5*u); y += 26*u;
    }
    if(o.title){
      let fs = 40*u, lines;
      for(;;){ g.font = `${fs}px "Setline Display", "Archivo", Arial, sans-serif`; lines = wrapText(g, o.title.toUpperCase(), colW); if((lines.length <= 2 && lines.every(l=>g.measureText(l).width <= colW)) || fs < 18*u) break; fs -= 2*u; }
      if(lines.length > 3) lines = lines.slice(0,3);
      g.fillStyle = "#f2f3f5"; g.textBaseline = "top";
      for(const l of lines){ g.fillText(l, x0, y); y += fs*1.02; }
      y += 8*u;
    }
    g.fillStyle = "#3a3e45"; g.fillRect(x0, y, colW, 1.5*u); y += 16*u;

    /* Fußzeile */
    const attr = attributionFor(map, [c.lng, c.lat], zoom);
    g.font = `${9.5*u}px "IBM Plex Mono", Menlo, monospace`;
    const footW = L.portrait ? colW : S.w - 2*ip, attrLines = wrapText(g, attr, footW, 3);
    const creditH = o.credit ? 26*u : 0, footH = attrLines.length*13*u + creditH;
    const footY = S.y + S.h - ip - footH;
    if(o.credit){ g.fillStyle = "#f2f3f5"; g.font = `${20*u}px "Setline Display", "Archivo", Arial, sans-serif`; g.textBaseline = "top"; g.fillText(o.credit.toUpperCase(), x0, footY); }
    g.fillStyle = "#7b818a"; g.font = `${9.5*u}px "IBM Plex Mono", Menlo, monospace`; g.textBaseline = "top";
    attrLines.forEach((l,i)=>g.fillText(l, x0, footY + creditH + i*13*u));

    /* Übersichtskarte */
    let legendBottom = footY - 14*u;
    if(inset){
      const IW = sideInner.w, IH = L.portrait ? S.h - 2*ip : sideInner.h;
      const IX = L.portrait ? S.x + S.w - ip - IW : x0, IY = L.portrait ? S.y + ip : footY - 16*u - IH;
      g.drawImage(inset.m.getCanvas(), IX, IY, IW, IH);
      g.strokeStyle = "#3a3e45"; g.lineWidth = 1.5*u; g.strokeRect(IX, IY, IW, IH);
      drawInsetMark(IX, IY, IW, IH);
      if(!L.portrait) legendBottom = IY - 14*u;
    }

    /* Legende */
    if(o.legend !== false){
      const items = impLegend.concat(legendItems(shown)), rowH = 22*u;
      if(items.length){
        const cols = L.portrait ? 2 : 1, cw = (colW - (cols-1)*16*u) / cols;
        const fit = Math.max(0, Math.floor((legendBottom - y) / rowH)) * cols;
        const list = items.length > fit ? items.slice(0, Math.max(0, fit-1)) : items;
        const rows = Math.ceil(list.length / cols);
        for(let i=0;i<list.length;i++){ const col = Math.floor(i / rows), row = i % rows; await drawLegendRow(g, list[i], x0 + col*(cw+16*u), y + row*rowH, u, cw); }
        if(items.length > list.length && fit > 0){ const i = list.length, col = Math.floor(i / Math.max(rows,1)), row = rows ? i % rows : 0;
          g.fillStyle = "#7b818a"; g.font = `500 ${11*u}px "IBM Plex Mono", Menlo, monospace`; g.textBaseline = "middle"; g.fillText(`+ ${items.length - list.length} weitere`, x0 + Math.min(col,cols-1)*(cw+16*u), y + (col>=cols ? rows : row)*rowH + 11*u); }
      }
    }

    }

    const type = o.format==="jpg" ? "image/jpeg" : "image/png";
    const blob = await new Promise((res,rej)=>{ try{ out.toBlob(b=>b?res(b):rej(new Error("leer")), type, 0.92); }catch(e){ rej(e); } });
    return {blob, width:L.TW, height:L.TH};
  } finally {
    main.done(); if(inset) inset.done();
  }
}

function emptyData(){ return {version:1, aktualisiert:null, elemente:[]}; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

window.Karte = {STYLES, START, SIDES, UNITS, ECHELONS, sidcOf, symbolSVG, describe, lineKm, areaKm2, toFeatures,
  addDataLayers, DATA_LAYERS, createMap, symbolMarker, emptyData, esc, applyTheme, exportImage, exportLayout, farbe, loadImport, replaceFront, nearestEdge, applyFrontEdit, undoFrontEdit, setImportData, refreshImport, importData: ()=>importData, importMeta: ()=>importData && importData.meta};
})();
