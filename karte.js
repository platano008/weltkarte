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
    if(opts.onStyle) opts.onStyle(map);
  });
  map.setBase = k=>{ if(free || !STYLES[k] || k===current) return; current = k; errs = 0; map.setStyle(STYLES[k].url); };
  map.setGlobe = g=>{ globe = g; try{ map.setProjection({type: g ? "globe" : "mercator"}); }catch(e){} };
  map.currentBase = ()=>current;
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

function emptyData(){ return {version:1, aktualisiert:null, elemente:[]}; }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

window.Karte = {STYLES, START, SIDES, UNITS, ECHELONS, sidcOf, symbolSVG, describe, lineKm, areaKm2, toFeatures,
  addDataLayers, DATA_LAYERS, createMap, symbolMarker, emptyData, esc, applyTheme};
})();
