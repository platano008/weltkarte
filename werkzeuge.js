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
  weg: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
  sicht: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  fahrzeug: '<path d="M3 15h18l-2 4H5z"/><path d="M6 15v-3h9l2 3"/><path d="M9 12V9h5v3"/><path d="M14 10.5h7"/>'
};
const NAMES = {lineal:"Lineal", flaeche:"Fläche", radius:"Radius", punkt:"Koordinate", sicht:"Sichtfeld", fahrzeug:"Fahrzeug setzen"};
const SICHT_R = [300, 500, 1000, 2000], SICHT_H = [0, 10, 30, 100];
const RANGES = [5, 10, 20, 40, 70, 150, 300];

function init(map, opts){
  opts = opts || {};
  let tool = null, pts = [], hover = null, radiusKm = null, done = [], labels = [], live = null;
  let fzAlle = null, fzWahl = null, fzQ = "", fzGesetzt = [], fzMarker = [], fzOffen = true;
  let sichtR = 1000, sichtH = 0, sichtRes = null, sichtLauf = 0, sichtInfo = null, sichtPunkt = null;
  const root = document.createElement("div");
  root.className = "wz";
  root.innerHTML = `<div class="wz-rail" role="toolbar" aria-label="Werkzeuge">
      ${["lineal","flaeche","radius","punkt","sicht","fahrzeug"].map(k=>`<button data-t="${k}" title="${NAMES[k]}" aria-label="${NAMES[k]}"><svg viewBox="0 0 24 24">${ICONS[k]}</svg></button>`).join("")}
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
      if(!m.getLayer("wz-case")) m.addLayer({id:"wz-case", type:"line", source:"wz", filter:["==",["get","k"],"line"], layout:{"line-join":"round","line-cap":"round"}, paint:{"line-color":"#000000","line-width":5,"line-opacity":0.75}});
      /* durchgezogene Linie und gestrichelte Vorschau als zwei Ebenen (gestrichelt per Datenwert kann MapLibre 5.0 nicht) */
      if(!m.getLayer("wz-line")) m.addLayer({id:"wz-line", type:"line", source:"wz", filter:["all",["==",["get","k"],"line"],["!",["get","p"]]], layout:{"line-join":"round","line-cap":"round"}, paint:{"line-color":"#ffffff","line-width":2.4}});
      if(!m.getLayer("wz-prev")) m.addLayer({id:"wz-prev", type:"line", source:"wz", filter:["all",["==",["get","k"],"line"],["get","p"]], layout:{"line-join":"round"}, paint:{"line-color":"#ffffff","line-width":2.2,"line-dasharray":[1.5,1.5]}});
      if(!m.getLayer("wz-pt")) m.addLayer({id:"wz-pt", type:"circle", source:"wz", filter:["==",["get","k"],"pt"], paint:{"circle-radius":4.5,"circle-color":"#ffffff","circle-stroke-color":"#000000","circle-stroke-width":2}});
      ["wz-fill","wz-case","wz-line","wz-prev","wz-pt"].forEach(l=>{ try{ m.moveLayer(l); }catch(e){} });
      if(!m.getSource("wz-fz")) m.addSource("wz-fz", {type:"geojson", data: empty});
      const FZF = ["match",["get","s"],"ua","#4aa3ff","ru","#ff3550","#c08cff"];
      if(!m.getLayer("wz-fz-fill")) m.addLayer({id:"wz-fz-fill", type:"fill", source:"wz-fz", filter:["==",["get","k"],"kreis"], paint:{"fill-color":FZF,"fill-opacity":0.13}});
      if(!m.getLayer("wz-fz-line")) m.addLayer({id:"wz-fz-line", type:"line", source:"wz-fz", filter:["==",["get","k"],"rand"], paint:{"line-color":FZF,"line-width":2,"line-dasharray":[4,2]}});
      if(!m.getLayer("wz-fz-pt")) m.addLayer({id:"wz-fz-pt", type:"circle", source:"wz-fz", filter:["==",["get","k"],"pt"], paint:{"circle-radius":6,"circle-color":FZF,"circle-stroke-color":"#fff","circle-stroke-width":2}});
      fzZeichnen(m);
      if(sichtRes && window.Sicht && !m.getLayer("sicht-flaeche")) Sicht.zeigen(m, sichtRes);
      if(tool === "sicht") hausEbene(m);
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
  /* ---------- Fahrzeug setzen: Fahrzeug wählen, auf die Karte tippen, Reichweite als Kreis ---------- */
  const fzSeite = f=>f.seite.length > 1 ? "beide" : f.seite[0];
  const fzEsc = t=>String(t).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  function fzLaden(){ if(fzAlle) return Promise.resolve(fzAlle);
    return fetch("daten/fahrzeuge.json").then(r=>r.json())
      .then(d=>fzAlle = d.fahrzeuge.filter(f=>f.km > 0).map(f=>Object.assign({such:[f.n, f.land, d.typen[f.typ].l, f.var || "", (f.geber || []).join(" ")].join(" ").toLowerCase()}, f)))
      .catch(()=>fzAlle = []); }
  function fzTreffer(){ const q = fzQ.toLowerCase();
    return (fzAlle||[]).filter(f=>!q || f.such.includes(q)).sort((a,b)=>b.km - a.km).slice(0, 40); }
  function fzListeHTML(){ const L = fzTreffer();
    return L.length ? L.map(f=>`<button class="fz-w${fzWahl && fzWahl.n === f.n ? " on" : ""}" data-fz="${fzEsc(f.n)}"><i class="pk ${fzSeite(f)}"></i><span>${fzEsc(f.n)}</span><b>${nf1.format(f.km).replace(",0","")} km</b></button>`).join("") : '<div class="wz-sub">Nichts gefunden.</div>'; }
  function fzBox(){
    if(!fzAlle){ box.innerHTML = `<div class="wz-h"><span class="eyebrow">${NAMES.fahrzeug}</span><button class="wz-x" data-x="close" aria-label="Werkzeug schließen">✕</button></div><div class="wz-big">Lade …</div>`; fzLaden().then(()=>{ if(tool === "fahrzeug") fzBox(); }); return; }
    if(box.querySelector(".fz-such")){ box.querySelector(".fz-wahl").innerHTML = fzListeHTML(); fzKopf(); fzAuf(); return; }
    box.innerHTML = `<div class="wz-h"><span class="eyebrow">${NAMES.fahrzeug}</span><button class="wz-x" data-x="close" aria-label="Werkzeug schließen">✕</button></div>
      <div class="fz-kopfz"></div>
      <input class="fz-such" type="search" placeholder="Fahrzeug suchen …" value="${fzEsc(fzQ)}">
      <div class="fz-wahl">${fzListeHTML()}</div>
      <div class="wz-act">${fzGesetzt.length ? '<button data-x="fzundo">Letztes entfernen</button>' : ""}<a class="wz-link" href="fahrzeuge.html">Zur Fahrzeugliste →</a></div>`;
    fzKopf(); fzAuf();
    box.querySelector(".fz-such").addEventListener("input", e=>{ fzQ = e.target.value; box.querySelector(".fz-wahl").innerHTML = fzListeHTML(); });
  }
  /* nach der Auswahl klappt die Liste zu, damit man die Karte sieht */
  function fzAuf(){ const zu = !!fzWahl && !fzOffen; ["fz-such","fz-wahl"].forEach(c=>{ const e = box.querySelector("." + c); if(e) e.hidden = zu; }); }
  function fzKopf(){ const k = box.querySelector(".fz-kopfz"); if(!k) return;
    k.innerHTML = fzWahl ? `<div class="wz-big">${fzEsc(fzWahl.n)}</div><div class="wz-sub">bis ${nf1.format(fzWahl.km).replace(",0","")} km · ${fzEsc(fzWahl.reichweite)}</div>`
      : `<div class="wz-big">Fahrzeug wählen</div>`;
    const a = box.querySelector(".wz-act"); if(a) a.innerHTML = (fzWahl && !fzOffen ? '<button data-x="fzwechsel">Anderes Fahrzeug</button>' : "") + (fzGesetzt.length ? '<button data-x="fzundo">Letztes entfernen</button>' : "") + '<a class="wz-link" href="fahrzeuge.html">Zur Fahrzeugliste →</a>'; }
  function fzZeichnen(m){
    m = m || map; const src = m.getSource && m.getSource("wz-fz"); if(!src) return;
    const F = [];
    fzGesetzt.forEach(g=>{ const c = circle(g.ll, g.f.km, 128), s = fzSeite(g.f);
      F.push({type:"Feature", properties:{k:"kreis", s}, geometry:{type:"Polygon", coordinates:[c]}});
      F.push({type:"Feature", properties:{k:"rand", s}, geometry:{type:"LineString", coordinates:c}});
      F.push({type:"Feature", properties:{k:"pt", s}, geometry:{type:"Point", coordinates:g.ll}}); });
    src.setData({type:"FeatureCollection", features:F});
    fzMarker.forEach(x=>x.remove()); fzMarker = fzGesetzt.map(g=>label(g.ll, `<b>${fzEsc(g.f.n)}</b> · ${nf1.format(g.f.km).replace(",0","")} km`, "fz " + fzSeite(g.f)));
  }
  function fzWaehlen(name){ return fzLaden().then(L=>{ const f = L.find(x=>x.n === name); if(f){ fzWahl = f; fzOffen = false; if(tool !== "fahrzeug") start("fahrzeug"); else readout(); } return !!f; }); }
  const pct = v=>nf0.format(Math.round(v*100)) + " %";
  function sichtBox(){
    const rk = `<div class="wz-ranges"><span class="wz-lab">Radius</span>${SICHT_R.map(r=>`<button data-sr="${r}" class="${sichtR===r?"on":""}">${r < 1000 ? r + " m" : r/1000 + " km"}</button>`).join("")}</div>
      <div class="wz-ranges"><span class="wz-lab">Höhe</span>${SICHT_H.map(h=>`<button data-sh="${h}" class="${sichtH===h?"on":""}">${h ? "+" + h + " m" : "Dach"}</button>`).join("")}</div>`;
    let big = "Haus antippen", sub = "";
    if(sichtInfo === "laeuft") big = "Berechne …";
    else if(typeof sichtInfo === "string"){ big = "Fehler"; sub = sichtInfo; }
    else if(sichtRes){ const r = sichtRes;
      big = pct(r.anteil) + " sichtbar";
      sub = `Augenhöhe ${nf0.format((r.haus ? r.hoehe : 0) + 1.6 + r.extra)} m · ${r.gebaeude ? r.blockierer + (r.blockierer === 1 ? " Haus verdeckt" : " Häuser verdecken") : "keine Häuser gefunden"}${r.haus ? "" : " · vom Boden"}`;
    }
    box.innerHTML = `<div class="wz-h"><span class="eyebrow">${NAMES.sicht}</span><button class="wz-x" data-x="close" aria-label="Werkzeug schließen">✕</button></div>
      <div class="wz-big">${big}</div>${sub ? `<div class="wz-sub">${sub}</div>` : ""}${rk}
      <div class="wz-leg"><span><i style="background:rgba(255,255,255,.55)"></i>sichtbar</span><span><i style="background:#120a10"></i>verdeckt</span><span><i style="background:#ff2d4f"></i>blockiert</span><span><i style="background:#18e0ff"></i>Standort</span></div>
`;
  }
  function readout(){
    if(!tool){ box.hidden = true; return; }
    box.hidden = false;
    if(tool === "sicht"){ sichtBox(); return; }
    if(tool === "fahrzeug"){ fzBox(); return; }
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
    if(t === "sicht") hausEbene(); else hausEbeneWeg();
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
    hausEbeneWeg();
    tool = null; pts = []; hover = null; radiusKm = null; liveLabel(null);
    root.querySelectorAll("[data-t]").forEach(b=>b.classList.remove("on"));
    document.body.classList.remove("wz-on");
    try{ if(opts.doubleClickZoom !== false) map.doubleClickZoom.enable(); }catch(e){}
    refresh(true);
  }
  root.querySelector(".wz-rail").addEventListener("click", e=>{
    const b = e.target.closest("button"); if(!b) return;
    if(b.dataset.t){ if(tool===b.dataset.t) finish(); else start(b.dataset.t); }
    if(b.dataset.x==="clear"){ done = []; pts = []; radiusKm = null; sichtRes = null; sichtPunkt = null; sichtInfo = null; sichtLauf++; if(window.Sicht) Sicht.entfernen(map); fzGesetzt = []; fzZeichnen(); refresh(true); }
  });
  box.addEventListener("click", e=>{
    const b = e.target.closest("button"); if(!b) return;
    if(b.dataset.x==="close") finish();
    if(b.dataset.x==="finish") finish(true);
    if(b.dataset.x==="new"){ pts = []; radiusKm = null; refresh(true); }
    if(b.dataset.x==="undo"){ if(tool==="radius"){ pts = []; radiusKm = null; } else pts.pop(); refresh(true); }
    if(b.dataset.r) setRadius(+b.dataset.r);
    if(b.dataset.sr){ sichtR = +b.dataset.sr; if(sichtPunkt) sichtRechnen(sichtPunkt); else readout(); }
    if(b.dataset.fz){ fzWahl = (fzAlle||[]).find(x=>x.n === b.dataset.fz) || null; fzOffen = false; box.querySelectorAll(".fz-w").forEach(x=>x.classList.toggle("on", x === b)); fzKopf(); fzAuf(); }
    if(b.dataset.x==="fzwechsel"){ fzOffen = true; fzKopf(); fzAuf(); }
    if(b.dataset.x==="fzundo"){ fzGesetzt.pop(); fzZeichnen(); fzKopf(); }
    if(b.dataset.sh != null){ sichtH = +b.dataset.sh; if(sichtPunkt) sichtRechnen(sichtPunkt); else readout(); }
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
    if(tool==="sicht"){ const h = hausAmPunkt(e.point, e.lngLat); sichtRechnen(h ? h.mitte : ll, h); return; }
    if(tool==="fahrzeug"){ if(fzWahl){ fzGesetzt.push({ll, f:fzWahl}); fzZeichnen(); fzKopf(); } return; }
    if(tool==="punkt"){ pts = [ll]; refresh(true); return; }
    if(tool==="radius"){
      if(!pts.length || radiusKm != null){ pts = [ll]; radiusKm = null; }
      else { radiusKm = Math.round(dist(pts[0], ll)*10)/10; }
      refresh(true); return;
    }
    pts.push(ll); hover = null; liveLabel(null); refresh(true);
  });
  /* Häuser immer sichtbar und antippbar, solange das Sichtfeld-Werkzeug an ist – auch bei Satellit und Topo (dort gibt es sonst keine Häuser) */
  function hausEbene(m){
    m = m || map;
    try{
      const st = m.getStyle(); if(!st) return;
      const da = st.layers.some(l=>l["source-layer"] === "building" && (l.type === "fill" || l.type === "fill-extrusion") && l.id !== "sicht-geb2d" && (!l.layout || l.layout.visibility !== "none"));
      if(da || m.getLayer("sicht-geb2d")) return;
      if(!m.getSource("sicht-ofm")) m.addSource("sicht-ofm", {type:"vector", url:"https://tiles.openfreemap.org/planet"});
      const vor = (st.layers.find(l=>l.type === "symbol")||{}).id;
      m.addLayer({id:"sicht-geb2d", type:"fill", source:"sicht-ofm", "source-layer":"building", minzoom:13, paint:{"fill-color":"#f3c35a","fill-opacity":0.8,"fill-outline-color":"#b8862a"}}, vor);
    }catch(e){}
  }
  function hausEbeneWeg(){ try{ if(map.getLayer("sicht-geb2d")) map.removeLayer("sicht-geb2d"); }catch(e){} }
  /* Angetipptes Haus finden – auch bei 3D-Häusern (dort zeigt der Klick sonst auf den Boden dahinter) und mit etwas Spielraum am Handy */
  function hausAmPunkt(pt, ll){
    let F = [];
    for(const r of [0, 6, 14]){ try{ F = map.queryRenderedFeatures(r ? [[pt.x - r, pt.y - r], [pt.x + r, pt.y + r]] : pt).filter(f=>f.sourceLayer === "building" && f.geometry && /Polygon/.test(f.geometry.type)); }catch(e){ F = []; } if(F.length) break; }
    if(!F.length) return null;
    const ringe = f=>f.geometry.type === "Polygon" ? [f.geometry.coordinates[0]] : f.geometry.coordinates.map(p=>p[0]);
    const innen = (p, r)=>{ let c = false; for(let i=0, j=r.length-1; i<r.length; j=i++){ if(((r[i][1] > p[1]) !== (r[j][1] > p[1])) && (p[0] < (r[j][0]-r[i][0])*(p[1]-r[i][1])/(r[j][1]-r[i][1]) + r[i][0])) c = !c; } return c; };
    const p0 = [ll.lng, ll.lat];
    let best = null, bd = Infinity;
    for(const f of F) for(const r of ringe(f)){ const m = schwerpunkt(r), d = innen(p0, r) ? -1 : dist(p0, m); if(d < bd){ bd = d; best = {ring:r, mitte:m, h:+(f.properties.render_height || f.properties.height || 0) || 0}; } }
    return best;
  }
  /* Schwerpunkt relativ zum ersten Punkt rechnen – sonst frisst die Rundung bei Längen-/Breitengraden die Genauigkeit (bis zu Dutzende Meter) */
  function schwerpunkt(r){ const o = r[0]; let a = 0, x = 0, y = 0;
    for(let i=0, j=r.length-1; i<r.length; j=i++){ const xj = r[j][0]-o[0], yj = r[j][1]-o[1], xi = r[i][0]-o[0], yi = r[i][1]-o[1], c = xj*yi - xi*yj; a += c; x += (xj + xi)*c; y += (yj + yi)*c; }
    if(Math.abs(a) < 1e-18){ const n = r.length; return [r.reduce((s,p)=>s+p[0],0)/n, r.reduce((s,p)=>s+p[1],0)/n]; }
    return [o[0] + x/(3*a), o[1] + y/(3*a)]; }
  /* Sichtfeld berechnen: Karte so einstellen, dass der ganze Kreis drin ist (dann sind alle Häuser geladen) */
  function warteIdle(){ return new Promise(res=>{ let fertig = false; const f = ()=>{ if(!fertig){ fertig = true; res(); } }; map.once("idle", f); setTimeout(f, 6000); }); }
  let sichtHaus = null;
  async function sichtRechnen(ll, haus){
    if(!window.Sicht) return;
    const lauf = ++sichtLauf; sichtPunkt = ll; if(haus !== undefined) sichtHaus = haus; sichtInfo = "laeuft"; readout();
    try{
      hausEbene();
      const q = Sicht.gebaeudeQuelle(map);
      const km = sichtR/1000, b = [dest(ll, km, 270)[0], dest(ll, km, 180)[1], dest(ll, km, 90)[0], dest(ll, km, 0)[1]];
      const kasten = box.getBoundingClientRect(), H = map.getContainer().clientHeight, oben = box.hidden ? 30 : (innerWidth < 700 ? 110 : Math.min(kasten.bottom + 12, H*0.55)), unten = innerWidth < 700 ? H*0.45 : 110;
      map.fitBounds([[b[0], b[1]], [b[2], b[3]]], {padding:{top:oben, bottom:unten, left:20, right:70}, maxZoom:16, duration:700});
      await new Promise(r=>setTimeout(r, 750)); await warteIdle();
      if(map.getZoom() < 13){ map.easeTo({center:ll, zoom:13, duration:400}); await new Promise(r=>setTimeout(r, 450)); await warteIdle(); }
      const r = await Sicht.berechne(map, ll, {radius:sichtR, quelle:q, extra:sichtH, haus:sichtHaus});
      if(lauf !== sichtLauf) return;
      sichtRes = r; sichtInfo = null; Sicht.zeigen(map, r);
      if(innerWidth < 700) map.easeTo({center:ll, offset:[0, -map.getContainer().clientHeight*0.17], duration:500});
    }catch(e){ if(lauf === sichtLauf){ sichtInfo = "Konnte nicht berechnet werden (" + (e.message || e) + ")."; } console.warn("Sichtfeld:", e); }
    if(tool === "sicht") readout();
  }
  let raf = 0, mv = null;
  map.on("mousemove", e=>{
    if(!tool || coarse || tool==='sicht' || tool==='fahrzeug') return;   /* am Handy erzeugt jedes Tippen auch ein mousemove – keine Vorschau dort */ mv = [e.lngLat.lng, e.lngLat.lat];
    if(!raf) raf = requestAnimationFrame(()=>{ raf = 0; hover = mv; if(tool==="radius" && radiusKm != null) hover = null; draw(); readout(); liveLabel(hover); });
  });
  map.getCanvas && map.getCanvas().addEventListener("mouseleave", ()=>{ if(!tool) return; hover = null; draw(); readout(); liveLabel(null); });
  document.addEventListener("keydown", e=>{
    if(!tool || /input|textarea/i.test((e.target.tagName||""))) return;
    if(e.key==="Escape") finish();
    if(e.key==="Enter") finish(true);
    if(e.key==="Backspace"){ pts.pop(); refresh(true); e.preventDefault(); }
  });

  return { ensure, active: ()=>!!tool, stop: ()=>finish(), fahrzeug: fzWaehlen, oeffnen: start };
}

window.Werkzeuge = { init, mgrs, dist, areaKm2, bearing };
})();
