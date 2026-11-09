/* Plyus · Werkzeuge für Besucher: Lineal, Fläche, Radius, Koordinate.
   Nichts davon wird gespeichert, alles bleibt nur im eigenen Browser. */
(function(){
"use strict";
const R = 6371.0088, rad = d=>d*Math.PI/180, deg = r=>r*180/Math.PI;
const nf1 = new Intl.NumberFormat("de-DE",{maximumFractionDigits:1, minimumFractionDigits:1});
const nf0 = new Intl.NumberFormat("de-DE",{maximumFractionDigits:0});

/* ---------- Geometrie ---------- */
function dist(a, b){ const dφ = rad(b[1]-a[1]), dλ = rad(b[0]-a[0]);
  const h = Math.sin(dφ/2)**2 + Math.cos(rad(a[1]))*Math.cos(rad(b[1]))*Math.sin(dλ/2)**2; return 2*R*Math.asin(Math.min(1, Math.sqrt(h))); }
function bearing(a, b){ const φ1 = rad(a[1]), φ2 = rad(b[1]), dλ = rad(b[0]-a[0]);
  return (deg(Math.atan2(Math.sin(dλ)*Math.cos(φ2), Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(dλ))) + 360) % 360; }
function dest(c, km, brg){ const δ = km/R, θ = rad(brg), φ1 = rad(c[1]), λ1 = rad(c[0]);
  const φ2 = Math.asin(Math.sin(φ1)*Math.cos(δ) + Math.cos(φ1)*Math.sin(δ)*Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ)*Math.sin(δ)*Math.cos(φ1), Math.cos(δ) - Math.sin(φ1)*Math.sin(φ2)); return [deg(λ2), deg(φ2)]; }
function areaKm2(ring){ if(ring.length < 3) return 0; let s = 0;
  for(let i=0;i<ring.length;i++){ const p = ring[i], q = ring[(i+1)%ring.length]; s += rad(q[0]-p[0]) * (2 + Math.sin(rad(p[1])) + Math.sin(rad(q[1]))); }
  return Math.abs(s * R * R / 2); }
function circle(c, km, n=96){ const r = []; for(let i=0;i<=n;i++) r.push(dest(c, km, i*360/n)); return r; }
const pathLen = pts=>pts.reduce((s,p,i)=>i ? s + dist(pts[i-1], p) : 0, 0);
const DIRS = ["N","NNO","NO","ONO","O","OSO","SO","SSO","S","SSW","SW","WSW","W","WNW","NW","NNW"];
const dir = b=>DIRS[Math.round(b/22.5) % 16];
const fmtKm = km=>km < 1 ? nf0.format(km*1000) + " m" : (km < 100 ? nf1.format(km) : nf0.format(km)) + " km";
const fmtKm2 = a=>a < 1 ? nf0.format(a*1e6) + " m²" : (a < 100 ? nf1.format(a) : nf0.format(a)) + " km²";

/* ---------- Koordinaten: Grad, Grad-Minuten-Sekunden, MGRS ---------- */
function dms(v, pos, neg){ const a = Math.abs(v), d = Math.floor(a), mf = (a-d)*60, m = Math.floor(mf), s = (mf-m)*60;
  return `${d}° ${String(m).padStart(2,"0")}′ ${s.toFixed(1).padStart(4,"0")}″ ${v>=0?pos:neg}`; }
function utm(lat, lon){
  let zone = Math.floor((lon+180)/6) + 1;
  if(lat >= 56 && lat < 64 && lon >= 3 && lon < 12) zone = 32;
  if(lat >= 72 && lat < 84){ if(lon>=0&&lon<9) zone=31; else if(lon>=9&&lon<21) zone=33; else if(lon>=21&&lon<33) zone=35; else if(lon>=33&&lon<42) zone=37; }
  const a = 6378137, f = 1/298.257223563, e2 = f*(2-f), ep2 = e2/(1-e2), k0 = 0.9996;
  const φ = rad(lat), λ = rad(lon), λ0 = rad((zone-1)*6 - 180 + 3);
  const N = a/Math.sqrt(1 - e2*Math.sin(φ)**2), T = Math.tan(φ)**2, C = ep2*Math.cos(φ)**2, A = Math.cos(φ)*(λ-λ0);
  const M = a*((1 - e2/4 - 3*e2**2/64 - 5*e2**3/256)*φ - (3*e2/8 + 3*e2**2/32 + 45*e2**3/1024)*Math.sin(2*φ)
          + (15*e2**2/256 + 45*e2**3/1024)*Math.sin(4*φ) - (35*e2**3/3072)*Math.sin(6*φ));
  const x = k0*N*(A + (1-T+C)*A**3/6 + (5 - 18*T + T*T + 72*C - 58*ep2)*A**5/120) + 500000;
  let y = k0*(M + N*Math.tan(φ)*(A*A/2 + (5 - T + 9*C + 4*C*C)*A**4/24 + (61 - 58*T + T*T + 600*C - 330*ep2)*A**6/720));
  if(lat < 0) y += 10000000;
  return {zone, x, y};
}
function mgrs(lat, lon){
  if(lat < -80 || lat > 84) return "–";
  const {zone, x, y} = utm(lat, lon);
  const band = "CDEFGHJKLMNPQRSTUVWXX"[Math.floor((lat+80)/8)];
  const col = ["ABCDEFGH","JKLMNPQR","STUVWXYZ"][(zone-1)%3][Math.floor(x/1e5)-1];
  const row = "ABCDEFGHJKLMNPQRSTUV"[(Math.floor(y/1e5) + (zone%2===0 ? 5 : 0)) % 20];
  const e = String(Math.floor(x % 1e5)).padStart(5,"0"), n = String(Math.floor(y % 1e5)).padStart(5,"0");
  return `${zone}${band} ${col}${row} ${e} ${n}`;
}

/* ---------- Werkzeug-Leiste ---------- */
const ICONS = {
  lineal: '<path d="M2.5 15.5L15.5 2.5l6 6-13 13z"/><path d="M6.5 11.5l2 2M9.5 8.5l2 2M12.5 5.5l2 2"/>',
  flaeche: '<path d="M4 6l9-3 8 7-4 10H6z"/><circle cx="4" cy="6" r="1.6"/><circle cx="13" cy="3" r="1.6"/><circle cx="21" cy="10" r="1.6"/><circle cx="17" cy="20" r="1.6"/><circle cx="6" cy="20" r="1.6"/>',
  radius: '<circle cx="12" cy="12" r="9"/><path d="M12 12h9"/><circle cx="12" cy="12" r="1.4"/>',
  punkt: '<circle cx="12" cy="12" r="6"/><path d="M12 1v5M12 18v5M1 12h5M18 12h5"/>',
  weg: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>'
};
const NAMES = {lineal:"Lineal", flaeche:"Fläche", radius:"Radius", punkt:"Koordinate"};
const HINT = {
  lineal: "Auf die Karte tippen, um Punkte zu setzen. Doppelt tippen oder „Fertig“ beendet.",
  flaeche: "Eckpunkte der Fläche antippen. Doppelt tippen oder „Fertig“ schließt sie.",
  radius: "Mittelpunkt antippen, dann den Rand – oder unten einen Radius wählen.",
  punkt: "Einen Punkt auf der Karte antippen."
};
const RANGES = [5, 10, 20, 40, 70, 150, 300];

function init(map, opts){
  opts = opts || {};
  let tool = null, pts = [], hover = null, radiusKm = null, done = [], labels = [], live = null;
  const root = document.createElement("div");
  root.className = "wz";
  root.innerHTML = `<div class="wz-rail" role="toolbar" aria-label="Werkzeuge">
      ${["lineal","flaeche","radius","punkt"].map(k=>`<button data-t="${k}" title="${NAMES[k]}" aria-label="${NAMES[k]}"><svg viewBox="0 0 24 24">${ICONS[k]}</svg></button>`).join("")}
      <button data-x="clear" title="Alle Messungen löschen" aria-label="Alle Messungen löschen" class="wz-clear"><svg viewBox="0 0 24 24">${ICONS.weg}</svg></button>
    </div>
    <div class="wz-box" hidden></div>`;
  document.body.appendChild(root);
  const box = root.querySelector(".wz-box");

  /* Ebenen (nach jedem Stilwechsel neu) */
  const empty = {type:"FeatureCollection", features:[]};
  function ensure(m){
    m = m || map;
    try{
      if(!m.getSource("wz")) m.addSource("wz", {type:"geojson", data: empty});
      if(!m.getLayer("wz-fill")) m.addLayer({id:"wz-fill", type:"fill", source:"wz", filter:["==",["get","k"],"fill"], paint:{"fill-color":"#ffffff","fill-opacity":0.14}});
      if(!m.getLayer("wz-case")) m.addLayer({id:"wz-case", type:"line", source:"wz", filter:["==",["get","k"],"line"], layout:{"line-join":"round","line-cap":"round"}, paint:{"line-color":"#0e0f11","line-width":5,"line-opacity":0.75}});
      if(!m.getLayer("wz-line")) m.addLayer({id:"wz-line", type:"line", source:"wz", filter:["==",["get","k"],"line"], layout:{"line-join":"round","line-cap":"round"}, paint:{"line-color":"#ffffff","line-width":2.2,"line-dasharray":["case",["get","p"],["literal",[1.5,1.5]],["literal",[1,0]]]}});
      if(!m.getLayer("wz-pt")) m.addLayer({id:"wz-pt", type:"circle", source:"wz", filter:["==",["get","k"],"pt"], paint:{"circle-radius":4.5,"circle-color":"#ffffff","circle-stroke-color":"#0e0f11","circle-stroke-width":2}});
      ["wz-fill","wz-case","wz-line","wz-pt"].forEach(l=>{ try{ m.moveLayer(l); }catch(e){} });
      draw();
    }catch(e){}
  }
  map.on("load", ()=>ensure());

  /* Geometrie einer Messung als Features */
  function feats(t, p, r, preview){
    const F = [], L = (c, prev)=>F.push({type:"Feature", properties:{k:"line", p:!!prev}, geometry:{type:"LineString", coordinates:c}});
    const P = c=>F.push({type:"Feature", properties:{k:"pt"}, geometry:{type:"Point", coordinates:c}});
    if(t==="lineal"){ if(p.length > 1) L(p); if(preview && p.length) L([p[p.length-1], preview], true); p.forEach(P); }
    if(t==="flaeche"){ const ring = preview ? p.concat([preview]) : p;
      if(ring.length > 2) F.push({type:"Feature", properties:{k:"fill"}, geometry:{type:"Polygon", coordinates:[ring.concat([ring[0]])]}});
      if(ring.length > 1) L(ring.concat(ring.length > 2 ? [ring[0]] : []), !!preview && ring.length < 3); p.forEach(P); }
    if(t==="radius" && p.length){ const km = r != null ? r : (preview ? dist(p[0], preview) : 0);
      if(km > 0){ const c = circle(p[0], km); F.push({type:"Feature", properties:{k:"fill"}, geometry:{type:"Polygon", coordinates:[c]}}); L(c);
        L([p[0], r != null ? dest(p[0], km, 90) : preview], true); }
      P(p[0]); }
    if(t==="punkt" && p.length) P(p[0]);
    return F;
  }
  function draw(){
    const src = map.getSource && map.getSource("wz"); if(!src) return;
    let F = [];
    done.forEach(d=>F = F.concat(feats(d.t, d.p, d.r)));
    if(tool) F = F.concat(feats(tool, pts, radiusKm, hover));
    src.setData({type:"FeatureCollection", features:F});
  }

  /* Beschriftungen auf der Karte */
  function label(ll, html, cls){ const el = document.createElement("div"); el.className = "wz-lbl " + (cls||""); el.innerHTML = html;
    return new maplibregl.Marker({element:el, anchor:"bottom"}).setLngLat(ll).addTo(map); }
  function shapeLabels(t, p, r){
    const out = [];
    if(t==="lineal" && p.length > 1){
      for(let i=1;i<p.length;i++){ if(p.length > 2) out.push(label(mid(p[i-1],p[i]), fmtKm(dist(p[i-1],p[i])), "seg")); }
      out.push(label(p[p.length-1], "<b>" + fmtKm(pathLen(p)) + "</b>"));
    }
    if(t==="flaeche" && p.length > 2) out.push(label(centroid(p), "<b>" + fmtKm2(areaKm2(p)) + "</b>", "ctr"));
    if(t==="radius" && p.length && r) out.push(label(dest(p[0], r, 0), "<b>r = " + fmtKm(r) + "</b>"));
    return out;
  }
  const mid = (a,b)=>[(a[0]+b[0])/2, (a[1]+b[1])/2];
  const centroid = p=>[p.reduce((s,q)=>s+q[0],0)/p.length, p.reduce((s,q)=>s+q[1],0)/p.length];
  function relabel(){ labels.forEach(m=>m.remove()); labels = [];
    done.forEach(d=>labels = labels.concat(shapeLabels(d.t, d.p, d.r)));
    if(tool && tool!=="punkt") labels = labels.concat(shapeLabels(tool, pts, radiusKm)); }

  /* Anzeige */
  function readout(){
    if(!tool){ box.hidden = true; return; }
    box.hidden = false;
    const p = hover && tool!=="punkt" && tool!=="radius" ? pts.concat([hover]) : pts;
    let big = "–", sub = "", extra = "";
    if(tool==="lineal"){
      const L = pathLen(p); big = p.length > 1 ? fmtKm(L) : "0 km";
      if(p.length > 1){ const a = p[p.length-2], b = p[p.length-1], br = bearing(a,b);
        sub = `${p.length-1} Abschnitt${p.length>2?"e":""} · letzter ${fmtKm(dist(a,b))} · Richtung ${nf0.format(br)}° ${dir(br)}`; }
    }
    if(tool==="flaeche"){ big = p.length > 2 ? fmtKm2(areaKm2(p)) : "0 km²";
      sub = p.length > 1 ? `Umfang ${fmtKm(pathLen(p.concat(p.length > 2 ? [p[0]] : [])))} · ${pts.length} Punkte` : ""; }
    if(tool==="radius"){ const r = radiusKm != null ? radiusKm : (pts.length && hover ? dist(pts[0], hover) : 0);
      big = "r = " + fmtKm(r); sub = r ? `Durchmesser ${fmtKm(2*r)} · Fläche ${fmtKm2(Math.PI*r*r)}` : "";
      extra = `<div class="wz-ranges">${RANGES.map(k=>`<button data-r="${k}" class="${radiusKm===k?"on":""}">${k}</button>`).join("")}<label><input type="number" min="0.1" step="0.1" inputmode="decimal" placeholder="km" value="${radiusKm && !RANGES.includes(radiusKm) ? radiusKm : ""}"></label></div>`; }
    if(tool==="punkt"){
      if(pts.length){ const [lng,lat] = pts[0];
        const rows = [["Grad", `${lat.toFixed(5)}, ${lng.toFixed(5)}`], ["GMS", `${dms(lat,"N","S")}  ${dms(lng,"O","W")}`], ["MGRS", mgrs(lat,lng)]];
        big = mgrs(lat,lng); extra = `<div class="wz-co">${rows.map(([k,v])=>`<div><span>${k}</span><code>${v}</code><button data-copy="${v}">Kopieren</button></div>`).join("")}</div>`;
      } else big = "–";
    }
    const canUndo = pts.length > 0 && tool!=="punkt";
    box.innerHTML = `<div class="wz-h"><span class="eyebrow">${NAMES[tool]}</span><button class="wz-x" data-x="close" aria-label="Werkzeug schließen">✕</button></div>
      <div class="wz-big">${big}</div>${sub ? `<div class="wz-sub">${sub}</div>` : ""}${extra}
      ${pts.length ? "" : `<div class="wz-hint">${HINT[tool]}</div>`}
      <div class="wz-act">${canUndo ? '<button data-x="undo">Rückgängig</button>' : ""}${(tool==="lineal"||tool==="flaeche") && pts.length > 1 ? '<button data-x="finish" class="solid">Fertig</button>' : ""}${pts.length ? '<button data-x="new">Neu</button>' : ""}</div>`;
    const inp = box.querySelector("input");
    if(inp) inp.addEventListener("change", ()=>{ const v = parseFloat(String(inp.value).replace(",", ".")); if(v > 0){ setRadius(v); } });
  }
  function setRadius(km){ radiusKm = km; if(!pts.length){ const c = map.getCenter(); pts = [[c.lng, c.lat]]; } refresh(true); }
  function refresh(full){ draw(); readout(); if(full) relabel(); }

  /* Live-Wert am Mauszeiger (nur PC) */
  function liveLabel(ll){
    if(!tool || tool==="punkt" || !pts.length || !ll){ if(live){ live.remove(); live = null; } return; }
    let txt = "";
    if(tool==="lineal") txt = fmtKm(pathLen(pts.concat([ll])));
    if(tool==="flaeche") txt = pts.length > 1 ? fmtKm2(areaKm2(pts.concat([ll]))) : fmtKm(dist(pts[0], ll));
    if(tool==="radius" && radiusKm == null) txt = "r = " + fmtKm(dist(pts[0], ll));
    if(!txt){ if(live){ live.remove(); live = null; } return; }
    if(!live){ const el = document.createElement("div"); el.className = "wz-lbl live"; live = new maplibregl.Marker({element:el, anchor:"bottom-left", offset:[12,-6]}).setLngLat(ll).addTo(map); }
    live.getElement().innerHTML = "<b>" + txt + "</b>"; live.setLngLat(ll);
  }

  /* Bedienung */
  function start(t){
    finish(true);
    tool = t; pts = []; hover = null; radiusKm = null;
    root.querySelectorAll("[data-t]").forEach(b=>b.classList.toggle("on", b.dataset.t===t));
    document.body.classList.add("wz-on");
    try{ map.doubleClickZoom.disable(); }catch(e){}
    opts.onStart && opts.onStart(t);
    refresh(true);
  }
  function finish(keepTool){
    if(tool && pts.length && ((tool==="lineal" && pts.length > 1) || (tool==="flaeche" && pts.length > 2) || (tool==="radius" && radiusKm))) done.push({t:tool, p:pts.slice(), r:radiusKm});
    if(tool==="punkt" && pts.length) done.push({t:"punkt", p:pts.slice()});
    pts = []; hover = null; radiusKm = null; liveLabel(null);
    if(keepTool !== true){ stop(); return; }
    refresh(true);
  }
  function stop(){
    tool = null; pts = []; hover = null; radiusKm = null; liveLabel(null);
    root.querySelectorAll("[data-t]").forEach(b=>b.classList.remove("on"));
    document.body.classList.remove("wz-on");
    try{ if(opts.doubleClickZoom !== false) map.doubleClickZoom.enable(); }catch(e){}
    refresh(true);
  }
  root.querySelector(".wz-rail").addEventListener("click", e=>{
    const b = e.target.closest("button"); if(!b) return;
    if(b.dataset.t){ if(tool===b.dataset.t) finish(); else start(b.dataset.t); }
    if(b.dataset.x==="clear"){ done = []; pts = []; radiusKm = null; refresh(true); }
  });
  box.addEventListener("click", e=>{
    const b = e.target.closest("button"); if(!b) return;
    if(b.dataset.x==="close") finish();
    if(b.dataset.x==="finish") finish(true);
    if(b.dataset.x==="new"){ pts = []; radiusKm = null; refresh(true); }
    if(b.dataset.x==="undo"){ if(tool==="radius"){ pts = []; radiusKm = null; } else pts.pop(); refresh(true); }
    if(b.dataset.r) setRadius(+b.dataset.r);
    if(b.dataset.copy != null){ const v = b.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(()=>{ b.textContent = "Kopiert"; setTimeout(()=>b.textContent = "Kopieren", 1400); })
        .catch(()=>{ b.textContent = "Nicht möglich"; }); }
  });

  let lastClick = 0, lastPt = null;
  const coarse = window.matchMedia && matchMedia("(pointer:coarse)").matches;
  map.on("click", e=>{
    if(!tool) return;
    const ll = [e.lngLat.lng, e.lngLat.lat], now = Date.now();
    const pt = map.project ? map.project(e.lngLat) : {x:0,y:0};
    const dbl = now - lastClick < 350 && lastPt && Math.hypot(pt.x-lastPt.x, pt.y-lastPt.y) < 12;
    lastClick = now; lastPt = pt;
    /* Doppelklick beendet nur mit Maus; am Handy tippt man oft schnell hintereinander, dort gibt es „Fertig“ */
    if(dbl && !coarse && (tool==="lineal" || tool==="flaeche")){ finish(true); return; }
    if(tool==="punkt"){ pts = [ll]; refresh(true); return; }
    if(tool==="radius"){
      if(!pts.length || radiusKm != null){ pts = [ll]; radiusKm = null; }
      else { radiusKm = Math.round(dist(pts[0], ll)*10)/10; }
      refresh(true); return;
    }
    pts.push(ll); refresh(true);
  });
  let raf = 0, mv = null;
  map.on("mousemove", e=>{
    if(!tool) return; mv = [e.lngLat.lng, e.lngLat.lat];
    if(!raf) raf = requestAnimationFrame(()=>{ raf = 0; hover = mv; if(tool==="radius" && radiusKm != null) hover = null; draw(); readout(); liveLabel(hover); });
  });
  map.getCanvas && map.getCanvas().addEventListener("mouseleave", ()=>{ if(!tool) return; hover = null; draw(); readout(); liveLabel(null); });
  document.addEventListener("keydown", e=>{
    if(!tool || /input|textarea/i.test((e.target.tagName||""))) return;
    if(e.key==="Escape") finish();
    if(e.key==="Enter") finish(true);
    if(e.key==="Backspace"){ pts.pop(); refresh(true); e.preventDefault(); }
  });

  return { ensure, active: ()=>!!tool, stop: ()=>finish() };
}

window.Werkzeuge = { init, mgrs, dist, areaKm2, bearing };
})();
