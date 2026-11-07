/* Gemeinsamer Kartencode für index.html (Ansicht) und editor.html (Bearbeiten). */
(function(){
"use strict";

const MAPTILER_KEY = "4TDQhzPsZwABTFDNshhB";
const MT = n => `https://api.maptiler.com/maps/${n}/style.json?key=${MAPTILER_KEY}`;
const STYLES = {
  sat:  {name:"Satellit", url:MT("hybrid-v4"), theme:"sat"},
  karte:{name:"Karte",    url:MT("base-v4"),   theme:"dark"},
  topo: {name:"Gelände",  url:MT("topo-v4"),   theme:"topo"}
};
const STYLE_FREE = "https://tiles.openfreemap.org/styles/liberty";

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
  dark:{bg:"#10100e", land:"#151513", water:"#16202a", waterway:"#22303d", wood:"#192017", green:"#171b14",
        urban:"#1a1a17", building:"#22221e", ice:"#26292a", sand:"#1e1d18",
        minor:"#2b2b26", major:"#4a4a40", motorway:"#9aa216", rail:"#3a3a32", casing:"#0b0b0a",
        border:"rgba(242,255,26,0.55)", border2:"rgba(255,255,255,0.18)", contour:"rgba(242,255,26,0.16)",
        text:"#dedcd0", textWater:"#7590a8", halo:"#0b0b0a"},
  topo:{bg:"#191a15", land:"#1c1d18", water:"#1b2935", waterway:"#28394a", wood:"#243022", green:"#20261b",
        urban:"#23231f", building:"#2c2c26", ice:"#2d3131", sand:"#26251e",
        minor:"#36362f", major:"#55554a", motorway:"#a7af1c", rail:"#45453c", casing:"#121210",
        border:"rgba(242,255,26,0.6)", border2:"rgba(255,255,255,0.22)", contour:"rgba(242,255,26,0.22)",
        text:"#e6e4d8", textWater:"#86a2b8", halo:"#10100e"}
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
  const c = (SIDES[s.seite]||SIDES.U).color, w = size*1.5, h = size;
  const shape = s.seite==="H" ? `<polygon points="${w/2},2 ${w-2},${h/2+4} ${w/2},${h+6} 2,${h/2+4}" fill="${c}" stroke="#000" stroke-width="2"/>`
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
/* Pfeilspitze: Dreieck am Ende, Linie endet an der Basis */
function arrow(coords){
  const n = coords.length; if(n<2) return {line:coords, head:null};
  const [x2,y2]=coords[n-1], [x1,y1]=coords[n-2];
  const k = Math.cos(y2*Math.PI/180)||1;
  let total=0; for(let i=1;i<n;i++){ total += Math.hypot((coords[i][0]-coords[i-1][0])*k, coords[i][1]-coords[i-1][1]); }
  const dx=(x2-x1)*k, dy=y2-y1, len=Math.hypot(dx,dy); if(!len) return {line:coords, head:null};
  const size = Math.min(Math.max(total*0.14, 0.01), Math.min(len*0.9, 0.8));
  const ux=dx/len, uy=dy/len, bx=-ux*size, by=-uy*size, px=-uy*size*0.6, py=ux*size*0.6;
  const base=[x2+bx/k, y2+by];
  const head=[[x2,y2],[x2+(bx+px)/k, y2+by+py],[x2+(bx-px)/k, y2+by-py],[x2,y2]];
  const line = coords.slice(0,-1).concat([[x2+bx*0.5/k, y2+by*0.5]]);
  return {line, head, base};
}
function toFeatures(els){
  const f = [];
  for(const el of els){
    const props = {id:el.id, typ:el.typ, farbe:el.farbe||"#f2ff1a", stil:el.stil||"durchgezogen"};
    if(el.typ==="linie" && el.koordinaten.length>1) f.push({type:"Feature", properties:props, geometry:{type:"LineString", coordinates:el.koordinaten}});
    if(el.typ==="pfeil" && el.koordinaten.length>1){
      const a = arrow(el.koordinaten);
      f.push({type:"Feature", properties:props, geometry:{type:"LineString", coordinates:a.line}});
      if(a.head) f.push({type:"Feature", properties:{...props, typ:"pfeilspitze"}, geometry:{type:"Polygon", coordinates:[a.head]}});
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
  const isLine = ["in",["get","typ"],["literal",["linie","pfeil"]]];
  map.addLayer({id:P+"-area-fill", type:"fill", source:P, filter:["==",["get","typ"],"flaeche"], paint:{"fill-color":["get","farbe"],"fill-opacity":0.22}});
  map.addLayer({id:P+"-area-line", type:"line", source:P, filter:["==",["get","typ"],"flaeche"], layout:{"line-join":"miter"}, paint:{"line-color":["get","farbe"],"line-width":W(1.5,3),"line-dasharray":[3,2]}});
  map.addLayer({id:P+"-casing", type:"line", source:P, filter:isLine, layout:{"line-join":"miter","line-cap":"butt"}, paint:{"line-color":"#000","line-opacity":0.55,"line-width":W(5,9)}});
  map.addLayer({id:P+"-line", type:"line", source:P, filter:["all",isLine,["!=",["get","stil"],"gestrichelt"]], layout:{"line-join":"miter","line-cap":"butt"}, paint:{"line-color":["get","farbe"],"line-width":W(2.5,5)}});
  map.addLayer({id:P+"-dash", type:"line", source:P, filter:["all",isLine,["==",["get","stil"],"gestrichelt"]], layout:{"line-join":"miter","line-cap":"butt"}, paint:{"line-color":["get","farbe"],"line-width":W(2.5,5),"line-dasharray":[2,1.5]}});
  map.addLayer({id:P+"-head", type:"fill", source:P, filter:["==",["get","typ"],"pfeilspitze"], paint:{"fill-color":["get","farbe"],"fill-outline-color":"#000"}});
  map.addLayer({id:P+"-sel", type:"line", source:P, filter:["==",["get","id"],"__none"], layout:{"line-join":"miter"}, paint:{"line-color":"#ffffff","line-width":W(1.5,2.5),"line-gap-width":W(4,8)}});
  map.addLayer({id:P+"-hit", type:"line", source:P, paint:{"line-color":"#000","line-opacity":0,"line-width":18}});
}
const DATA_LAYERS = p => [p+"-area-fill",p+"-area-line",p+"-casing",p+"-line",p+"-dash",p+"-head",p+"-sel",p+"-hit"];

/* ---------------- Karte erstellen ---------------- */
function createMap(opts){
  let current = opts.style || "sat", free = false, errs = 0, globe = opts.globe!==false;
  const map = new maplibregl.Map({container:opts.container, style:STYLES[current].url, center:START.center, zoom:START.zoom,
    attributionControl:false, doubleClickZoom: opts.doubleClickZoom!==false});
  map.addControl(new maplibregl.NavigationControl(), "top-right");
  map.addControl(new maplibregl.ScaleControl({unit:"metric"}), "bottom-right");
  map.addControl(new maplibregl.AttributionControl({compact:false}), "bottom-right");
  map.on("error", e=>{
    if(e && e.sourceId==="esri"){ if(++esriErrs > 6) esriFailed(map); return; }
    if(free) return;
    const st = e && e.error && e.error.status;
    if(st===401 || st===403 || st===429 || ++errs > 25){
      free = true; const logo = document.getElementById("mtLogo"); if(logo) logo.hidden = true;
      map.setStyle(STYLE_FREE);
    }
  });
  map.on("style.load", ()=>{
    try{ map.setProjection({type: globe ? "globe" : "mercator"}); }catch(e){}
    const th = free ? "dark" : STYLES[current].theme;
    if(th) applyTheme(map, th);
    if(!free && current==="sat") addEsri(map);
    if(opts.onStyle) opts.onStyle(map);
  });
  map.setBase = k=>{ if(free || !STYLES[k] || k===current) return; current = k; errs = 0; map.setStyle(STYLES[k].url); };
  map.setGlobe = g=>{ globe = g; try{ map.setProjection({type: g ? "globe" : "mercator"}); }catch(e){} };
  map.currentBase = ()=>current;
  map.isFree = ()=>free;
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
/* Rendert einen Ausschnitt (frame in CSS-Pixeln relativ zur Karte) neu mit höherer Pixeldichte
   und legt Titel, NATO-Symbole, Legende, Maßstab und Quellenangabe darüber. */
function loadImg(src){ return new Promise((res,rej)=>{ const i = new Image(); i.onload=()=>res(i); i.onerror=rej; i.src=src; }); }
function niceScale(maxMeters){
  const p = Math.pow(10, Math.floor(Math.log10(maxMeters)));
  for(const f of [5,2,1]) if(f*p <= maxMeters) return f*p;
  return p;
}
function attributionFor(map, center, zoom){
  if(map.isFree && map.isFree()) return "© OpenFreeMap · © OpenStreetMap-Mitwirkende";
  let a = "© MapTiler · © OpenStreetMap-Mitwirkende";
  const [w,s,e,n] = ESRI_BOUNDS;
  if(map.currentBase()==="sat" && !esriOff && zoom >= 7 && center[0]>w && center[0]<e && center[1]>s && center[1]<n)
    a = "Powered by Esri · Esri, Maxar, Earthstar Geographics · " + a;
  return a;
}
async function exportImage(map, o){
  const PR = o.scale || 2, fw = Math.round(o.frame.w), fh = Math.round(o.frame.h);
  const c = map.unproject([o.frame.x + fw/2, o.frame.y + fh/2]);
  const zoom = map.getZoom(), bearing = map.getBearing(), pitch = map.getPitch();
  const holder = document.createElement("div");
  holder.style.cssText = `position:fixed;left:-${fw*2+100}px;top:0;width:${fw}px;height:${fh}px;pointer-events:none;opacity:0`;
  document.body.appendChild(holder);
  const style = map.getStyle();
  const off = new maplibregl.Map({container:holder, style, center:c, zoom, bearing, pitch, interactive:false, attributionControl:false,
    pixelRatio:PR, fadeDuration:0, preserveDrawingBuffer:true, canvasContextAttributes:{preserveDrawingBuffer:true}});
  try{
    await new Promise((res,rej)=>{
      const t = setTimeout(()=>res(), 45000);
      off.once("load", ()=>{
        try{ if(off.getLayer("lage-sel")) off.setFilter("lage-sel",["==",["get","id"],"__none"]); }catch(e){}
        off.once("idle", ()=>{ clearTimeout(t); res(); });
      });
      off.on("error", ()=>{});
    });
    const src = off.getCanvas();
    const W = src.width, H = src.height, s = W / fw;
    const out = document.createElement("canvas"); out.width = W; out.height = H;
    const g = out.getContext("2d");
    g.drawImage(src, 0, 0, W, H);
    try{ if(document.fonts) await Promise.all([document.fonts.load(`${40*s}px "Setline Display"`), document.fonts.load(`500 ${12*s}px "IBM Plex Mono"`)]); }catch(e){}

    /* nur was im Ausschnitt liegt */
    const inView = ll=>{ const p = off.project(ll); return p.x >= -40 && p.y >= -40 && p.x <= fw+40 && p.y <= fh+40; };
    const shown = (o.elements||[]).filter(el=> el.typ==="symbol" ? inView(el.koordinaten) : (el.koordinaten||[]).some(inView));
    const syms = shown.filter(el=>el.typ==="symbol");
    /* NATO-Symbole */
    for(const el of syms){
      const p = off.project(el.koordinaten);
      const r = symbolSVG(el, 30*(o.symbolScale||1));
      let svg = r.svg; if(!/xmlns=/.test(svg)) svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      try{
        const img = await loadImg("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
        g.save(); g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 3*s; g.shadowOffsetY = 1*s;
        g.drawImage(img, (p.x - r.ax)*s, (p.y - r.ay)*s, r.w*s, r.h*s); g.restore();
      }catch(e){}
    }

    const pad = 18*s, mono = `"IBM Plex Mono", Menlo, monospace`, disp = `"Setline Display", "Archivo", Arial, sans-serif`;
    /* Titel oben links */
    if(o.title || o.subtitle){
      g.font = `${30*s}px ${disp}`; const tw = o.title ? g.measureText(o.title.toUpperCase()).width : 0;
      g.font = `500 ${11*s}px ${mono}`; const sw = o.subtitle ? g.measureText(o.subtitle.toUpperCase()).width : 0;
      const bw = Math.max(tw, sw + 22*s) + 36*s, bh = (o.title && o.subtitle ? 78 : o.title ? 58 : 40)*s;
      g.fillStyle = "rgba(11,11,10,0.9)"; g.fillRect(pad, pad, bw, bh);
      g.fillStyle = "#f2ff1a"; g.fillRect(pad, pad, bw, 3*s);
      let y = pad + 20*s;
      if(o.subtitle){ g.fillRect(pad+18*s, y-8*s, 10*s, 10*s); g.fillStyle = "#8a897e"; g.font = `500 ${11*s}px ${mono}`; g.textBaseline = "middle"; g.fillText(o.subtitle.toUpperCase(), pad+36*s, y-3*s); y += 18*s; }
      if(o.title){ g.fillStyle = "#f1f0e8"; g.font = `${30*s}px ${disp}`; g.textBaseline = "top"; g.fillText(o.title.toUpperCase(), pad+18*s, o.subtitle ? y : pad+16*s); }
    }
    /* Nordpfeil, wenn gedreht */
    if(Math.abs(bearing) > 0.5){
      const cx = W - pad - 16*s, cy = pad + 16*s;
      g.save(); g.translate(cx, cy); g.rotate(-bearing*Math.PI/180);
      g.fillStyle = "rgba(11,11,10,0.9)"; g.fillRect(-16*s,-16*s,32*s,32*s);
      g.fillStyle = "#f2ff1a"; g.beginPath(); g.moveTo(0,-11*s); g.lineTo(6*s,6*s); g.lineTo(0,2*s); g.lineTo(-6*s,6*s); g.closePath(); g.fill();
      g.restore();
    }
    /* Legende unten links */
    let by = H - pad;
    const bottom = [];
    if(o.legend){
      const sides = [...new Set(syms.map(el=>el.seite||"U"))];
      const items = sides.map(k=>({c:SIDES[k].color, t:SIDES[k].short}));
      if(shown.some(el=>el.stil==="gestrichelt" || el.geplant)) items.push({dash:true, t:"vermutet"});
      if(items.length) bottom.push(items);
    }
    const lat = c.lat, mpp = 40075016.686*Math.cos(lat*Math.PI/180)/(512*Math.pow(2,zoom));
    const meters = niceScale(mpp*fw*0.18), barPx = meters/mpp*s;
    const label = meters >= 1000 ? (meters/1000).toLocaleString("de-DE")+" km" : meters+" m";
    g.font = `500 ${11*s}px ${mono}`;
    const legendW = bottom.length ? bottom[0].reduce((a,it)=>a + 22*s + g.measureText(it.t.toUpperCase()).width + 14*s, 0) : 0;
    const labelW = g.measureText(label).width;
    const boxW = Math.max(barPx + 8*s + labelW, legendW) + 28*s, boxH = (bottom.length ? 58 : 36)*s;
    g.fillStyle = "rgba(11,11,10,0.88)"; g.fillRect(pad, H - pad - boxH, boxW, boxH);
    let x = pad + 14*s, yy = H - pad - boxH + 18*s;
    g.textBaseline = "middle";
    if(bottom.length){
      for(const it of bottom[0]){
        if(it.dash){ g.strokeStyle = "#f1f0e8"; g.lineWidth = 2*s; g.setLineDash([4*s,3*s]); g.beginPath(); g.moveTo(x, yy); g.lineTo(x+14*s, yy); g.stroke(); g.setLineDash([]); }
        else { g.fillStyle = it.c; g.fillRect(x, yy-5*s, 10*s, 10*s); g.strokeStyle = "rgba(0,0,0,.6)"; g.lineWidth = 1*s; g.strokeRect(x, yy-5*s, 10*s, 10*s); }
        g.fillStyle = "#c9c8bd"; g.fillText(it.t.toUpperCase(), x + 20*s, yy); x += 22*s + g.measureText(it.t.toUpperCase()).width + 14*s;
      }
      yy += 22*s;
    }
    x = pad + 14*s;
    g.fillStyle = "#f1f0e8"; g.fillRect(x, yy+2*s, barPx, 3*s); g.fillRect(x, yy-4*s, 2*s, 9*s); g.fillRect(x+barPx-2*s, yy-4*s, 2*s, 9*s);
    g.fillStyle = "#f2ff1a"; g.fillRect(x, yy+2*s, barPx/2, 3*s);
    g.fillStyle = "#c9c8bd"; g.textBaseline = "middle"; g.font = `500 ${11*s}px ${mono}`; g.fillText(label, x + barPx + 8*s, yy+3*s);
    /* Quellenangabe unten rechts */
    const attr = attributionFor(map, [c.lng, c.lat], zoom) + (o.credit ? " · " + o.credit : "");
    g.font = `${10*s}px ${mono}`; g.textBaseline = "middle";
    const aw = g.measureText(attr).width + 16*s;
    g.fillStyle = "rgba(11,11,10,0.8)"; g.fillRect(W - aw, H - 20*s, aw, 20*s);
    g.fillStyle = "#c9c8bd"; g.fillText(attr, W - aw + 8*s, H - 10*s);

    const type = o.format==="jpg" ? "image/jpeg" : "image/png";
    const blob = await new Promise((res,rej)=>{ try{ out.toBlob(b=>b?res(b):rej(new Error("leer")), type, 0.92); }catch(e){ rej(e); } });
    return {blob, width:W, height:H};
  } finally {
    try{ off.remove(); }catch(e){}
    holder.remove();
  }
}

function emptyData(){ return {version:1, aktualisiert:null, elemente:[]}; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

window.Karte = {STYLES, START, SIDES, UNITS, ECHELONS, sidcOf, symbolSVG, describe, lineKm, areaKm2, toFeatures,
  addDataLayers, DATA_LAYERS, createMap, symbolMarker, emptyData, esc, applyTheme, exportImage};
})();
