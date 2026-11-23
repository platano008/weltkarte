/* Plyus · Sichtfeld: Was kann man von einem Haus (oder Punkt) aus sehen?
   Rechnet komplett im Browser: Höhenmodell (Terrain Tiles, AWS, frei) + Gebäude mit Höhe aus den Kartendaten.
   Von der Beobachterposition laufen Sichtstrahlen in alle Richtungen; was hinter Gelände oder Häusern liegt, ist verdeckt.
   Häuser, die die Sicht blockieren, werden rot markiert. */
(function(){
"use strict";
const DEM_Z = 14, AUGE = 1.6, ZIEL = 1.7, STD_HOEHE = 8, KRUEMMUNG = 0.87/(2*6371000);   /* Erdkrümmung mit üblicher Lichtbrechung */
const TERRA = (z,x,y)=>`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
const demCache = new Map();

/* --- Höhenmodell --- */
function kachel(lon, lat, z){ const n = 2**z, x = (lon + 180)/360*n, r = lat*Math.PI/180, y = (1 - Math.log(Math.tan(r) + 1/Math.cos(r))/Math.PI)/2*n; return [x, y]; }
async function demKachel(z, x, y){
  const k = z+"/"+x+"/"+y; if(demCache.has(k)) return demCache.get(k);
  const p = (async()=>{
    const r = await fetch(TERRA(z,x,y)); if(!r.ok) throw new Error("Höhendaten " + r.status);
    const bmp = await createImageBitmap(await r.blob()), cv = document.createElement("canvas"); cv.width = bmp.width; cv.height = bmp.height;
    const cx = cv.getContext("2d", {willReadFrequently:true}); cx.drawImage(bmp, 0, 0);
    const d = cx.getImageData(0, 0, cv.width, cv.height).data, h = new Float32Array(cv.width*cv.height);
    for(let i=0;i<h.length;i++) h[i] = d[i*4]*256 + d[i*4+1] + d[i*4+2]/256 - 32768;
    return {w:cv.width, h};
  })();
  demCache.set(k, p); p.catch(()=>demCache.delete(k)); return p;
}
async function hoehenGitter(lon0, lat0, R, zelle, N, mx, my){
  /* Kacheln für die Umgebung laden, dann jede Gitterzelle bilinear abtasten */
  const [x1, y1] = kachel(lon0 - R/mx, lat0 + R/my, DEM_Z), [x2, y2] = kachel(lon0 + R/mx, lat0 - R/my, DEM_Z);
  const T = {}, jobs = [];
  for(let x=Math.floor(x1); x<=Math.floor(x2); x++) for(let y=Math.floor(y1); y<=Math.floor(y2); y++) jobs.push(demKachel(DEM_Z, x, y).then(t=>T[x+"/"+y] = t));
  await Promise.all(jobs);
  const g = new Float32Array(N*N);
  const probe = (tx, ty)=>{ const xi = Math.floor(tx), yi = Math.floor(ty), t = T[xi+"/"+yi]; if(!t) return 0;
    const px = Math.min(t.w-1, Math.max(0, (tx - xi)*t.w)), py = Math.min(t.w-1, Math.max(0, (ty - yi)*t.w));
    const a = Math.floor(px), b = Math.floor(py), fx = px - a, fy = py - b, a2 = Math.min(t.w-1, a+1), b2 = Math.min(t.w-1, b+1);
    return (t.h[b*t.w+a]*(1-fx) + t.h[b*t.w+a2]*fx)*(1-fy) + (t.h[b2*t.w+a]*(1-fx) + t.h[b2*t.w+a2]*fx)*fy; };
  for(let j=0;j<N;j++){ const y = R - (j + 0.5)*zelle, lat = lat0 + y/my;
    for(let i=0;i<N;i++){ const x = -R + (i + 0.5)*zelle, [tx, ty] = kachel(lon0 + x/mx, lat, DEM_Z); g[j*N+i] = probe(tx, ty); } }
  return g;
}

/* --- Gebäude ins Gitter --- */
function gebaeudeQuelle(map){
  const st = map.getStyle(), L = st.layers.filter(l=>l["source-layer"]==="building");
  return L.length ? L[0].source : null;
}
function polygone(f){ const g = f.geometry; if(!g) return []; if(g.type==="Polygon") return [g.coordinates]; if(g.type==="MultiPolygon") return g.coordinates; return []; }
function drin(px, py, ring){ let c = false; for(let i=0, j=ring.length-1; i<ring.length; j=i++){ const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
  if(((yi > py) !== (yj > py)) && (px < (xj - xi)*(py - yi)/(yj - yi) + xi)) c = !c; } return c; }


/* --- Gebäude direkt aus den OpenFreeMap-Vektorkacheln (Zoom 14 = alle Häuser, unabhängig von der Ansicht, kostenlos) --- */
const vorlagen = {}; const mvtCache = new Map();
function pbfLeser(buf){
  let p = 0;
  const v = ()=>{ let r = 0, s = 1, b; do { b = buf[p++]; r += (b & 0x7f)*s; s *= 128; } while(b & 0x80); return r; };
  return { get pos(){ return p; }, set pos(x){ p = x; }, v, ende:()=>p >= buf.length,
    feld(){ const k = v(); return [k >> 3, k & 7]; },
    skip(t){ if(t === 0) v(); else if(t === 1) p += 8; else if(t === 2){ const l = v(); p += l; } else if(t === 5) p += 4; },
    bytes(){ const l = v(); const a = buf.subarray(p, p + l); p += l; return a; } };
}
const td = new TextDecoder();
function wert(b){ const r = pbfLeser(b); let w = null; const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  while(!r.ende()){ const [f, t] = r.feld();
    if(f === 1) w = td.decode(r.bytes()); else if(f === 2){ w = dv.getFloat32(r.pos, true); r.pos += 4; } else if(f === 3){ w = dv.getFloat64(r.pos, true); r.pos += 8; }
    else if(f === 4 || f === 5) w = r.v(); else if(f === 6){ const z = r.v(); w = (z % 2) ? -(z + 1)/2 : z/2; } else if(f === 7) w = !!r.v(); else r.skip(t); }
  return w; }
function gebaeudeAusKachel(buf, z, tx, ty){
  const out = [], T = pbfLeser(buf);
  while(!T.ende()){ const [f, t] = T.feld(); if(f !== 3){ T.skip(t); continue; }
    const L = pbfLeser(T.bytes()); let name = "", ext = 4096; const keys = [], vals = [], feats = [];
    while(!L.ende()){ const [g, u] = L.feld();
      if(g === 1) name = td.decode(L.bytes()); else if(g === 2) feats.push(L.bytes()); else if(g === 3) keys.push(td.decode(L.bytes()));
      else if(g === 4) vals.push(wert(L.bytes())); else if(g === 5) ext = L.v(); else L.skip(u); }
    if(name !== "building") continue;
    const n = 2**z;
    const ll = (px, py)=>{ const X = (tx + px/ext)/n, Y = (ty + py/ext)/n; return [X*360 - 180, Math.atan(Math.sinh(Math.PI*(1 - 2*Y)))*180/Math.PI]; };
    for(const fb of feats){ const F = pbfLeser(fb); let tags = [], geom = [], typ = 0;
      while(!F.ende()){ const [g, u] = F.feld();
        if(g === 2){ const l = F.v(), e = F.pos + l; while(F.pos < e) tags.push(F.v()); }
        else if(g === 3) typ = F.v();
        else if(g === 4){ const l = F.v(), e = F.pos + l; while(F.pos < e) geom.push(F.v()); }
        else F.skip(u); }
      if(typ !== 3) continue;
      const props = {}; for(let i=0;i+1<tags.length;i+=2) props[keys[tags[i]]] = vals[tags[i+1]];
      const ringe = []; let x = 0, y = 0, i = 0, ring = null;
      while(i < geom.length){ const c = geom[i++], cmd = c & 7, cnt = c >> 3;
        if(cmd === 1 || cmd === 2){ for(let k=0;k<cnt;k++){ const dx = geom[i++], dy = geom[i++]; x += (dx >> 1) ^ (-(dx & 1)); y += (dy >> 1) ^ (-(dy & 1));
            if(cmd === 1){ ring = [[x, y]]; ringe.push(ring); } else ring.push([x, y]); } }
        else if(cmd === 7 && ring){ ring.push(ring[0]); } }
      /* Außenringe (positive Fläche in Kachelkoordinaten) */
      const fl = ringe.map(r=>{ let a = 0; for(let k=0;k+1<r.length;k++) a += r[k][0]*r[k+1][1] - r[k+1][0]*r[k][1]; return a; });
      const aussen = fl.some(a=>a > 0) ? (a=>a > 0) : (a=>a < 0);   /* falls die Drehrichtung andersherum kodiert ist */
      ringe.forEach((r, k)=>{ if(aussen(fl[k]) && r.length > 3) out.push({properties:props, geometry:{type:"Polygon", coordinates:[r.map(q=>ll(q[0], q[1]))]}}); });
    }
  }
  return out;
}
async function vorlage(name){
  if(vorlagen[name] === undefined){
    const url = name === "mt" ? (typeof MAPTILER_KEY !== "undefined" ? `https://api.maptiler.com/tiles/v3/tiles.json?key=${MAPTILER_KEY}` : null) : "https://tiles.openfreemap.org/planet";
    vorlagen[name] = url ? fetch(url).then(r=>r.json()).then(tj=>tj.tiles[0]).catch(()=>null) : Promise.resolve(null);
  }
  return vorlagen[name];
}
/* Häuser aus beiden Quellen (OpenFreeMap + MapTiler) zusammen – fehlt eine Quelle, reicht die andere */
async function hausKacheln(lon0, lat0, R, mx, my){
  const z = 14, [x1, y1] = kachel(lon0 - R/mx, lat0 + R/my, z), [x2, y2] = kachel(lon0 + R/mx, lat0 - R/my, z), jobs = [];
  for(const name of ["ofm", "mt"]){
    const tpl = await vorlage(name); if(!tpl) continue;
    for(let x=Math.floor(x1); x<=Math.floor(x2); x++) for(let y=Math.floor(y1); y<=Math.floor(y2); y++){
      const k = name+"/"+x+"/"+y;
      if(!mvtCache.has(k)) mvtCache.set(k, fetch(tpl.replace("{z}", z).replace("{x}", x).replace("{y}", y))
        .then(r=>{ if(!r.ok) throw new Error("Kachel " + r.status); return r.arrayBuffer(); }).then(b=>gebaeudeAusKachel(new Uint8Array(b), z, x, y))
        .catch(e=>{ mvtCache.delete(k); console.warn("Sichtfeld:", name, e); return []; }));
      jobs.push(mvtCache.get(k));
    }
  }
  return (await Promise.all(jobs)).flat();
}

async function berechne(map, ll, opt){
  opt = opt || {};
  const R = opt.radius || 1000, zelle = Math.max(2.5, R/250), N = Math.round(2*R/zelle);
  const lon0 = ll[0], lat0 = ll[1], my = 110540, mx = 111320*Math.cos(lat0*Math.PI/180);
  const toXY = (lon, lat)=>[(lon - lon0)*mx, (lat - lat0)*my], geo = (x, y)=>[lon0 + x/mx, lat0 + y/my];

  /* 1. Häuser: Grundriss in Metern, Höhe, Winkelbereich vom Beobachter aus */
  /* alle Häuser, die die Karte gerade zeigt (2D und 3D, aus jeder Quelle) – plus die Kacheln für den ganzen Kreis */
  let feats = [];
  const quellen = new Set(map.getStyle().layers.filter(l=>l["source-layer"] === "building").map(l=>l.source));
  if(opt.quelle) quellen.add(opt.quelle);
  quellen.forEach(q=>{ try{ feats = feats.concat(map.querySourceFeatures(q, {sourceLayer:"building"})); }catch(e){} });
  try{ feats = feats.concat(await hausKacheln(lon0, lat0, R, mx, my)); }catch(e){ console.warn("Sichtfeld: Gebäudekacheln", e); }
  const haeuser = [], seen = new Set(), BINS = 1440, bins = Array.from({length:BINS}, ()=>[]);
  let beob = -1, beobD = Infinity;
  for(const f of feats){
    const p = f.properties || {};
    const h = +(p.render_height || p.height || 0) || (p["building:levels"] ? +p["building:levels"]*3 + 2 : STD_HOEHE);
    const hb = +(p.render_min_height || 0) || 0;
    for(const poly of polygone(f)){
      const ring = poly[0].map(q=>toXY(q[0], q[1]));
      let x1 = Infinity, x2 = -Infinity, y1 = Infinity, y2 = -Infinity; for(const q of ring){ x1 = Math.min(x1,q[0]); x2 = Math.max(x2,q[0]); y1 = Math.min(y1,q[1]); y2 = Math.max(y2,q[1]); }
      if(x2 < -R || x1 > R || y2 < -R || y1 > R) continue;
      const key = Math.round(x1/2)+","+Math.round(y1/2)+","+Math.round(x2/2)+","+Math.round(y2/2); if(seen.has(key)) continue; seen.add(key);
      const idx = haeuser.length, H = {poly, ring, h, hb, sicht:false, block:false};
      haeuser.push(H);
      if(drin(0, 0, ring)){ beob = idx; beobD = 0; continue; }
      /* angeklickt knapp daneben: nächstes Haus innerhalb 4 m zählt als Standort */
      const dmin = Math.min(...ring.map(q=>Math.hypot(q[0], q[1]))); if(dmin < 4 && dmin < beobD && beobD > 0){ beob = idx; beobD = dmin; }
      /* Winkelbereich */
      const a0 = Math.atan2(ring[0][1], ring[0][0]); let lo = 0, hi = 0;
      for(const q of ring){ let d = Math.atan2(q[1], q[0]) - a0; while(d > Math.PI) d -= 2*Math.PI; while(d < -Math.PI) d += 2*Math.PI; lo = Math.min(lo, d); hi = Math.max(hi, d); }
      if(hi - lo > Math.PI) continue;
      const b1 = Math.floor((a0 + lo + 2*Math.PI)/(2*Math.PI)*BINS), b2 = Math.floor((a0 + hi + 2*Math.PI)/(2*Math.PI)*BINS);
      for(let b=b1; b<=b2; b++) bins[((b % BINS) + BINS) % BINS].push(idx);
    }
  }
  /* angetipptes Haus: das Haus nehmen, das den Schwerpunkt enthält – oder das angetippte selbst ergänzen */
  if(opt.haus && opt.haus.ring){
    const tr = opt.haus.ring.map(q=>toXY(q[0], q[1]));
    const hit = haeuser.findIndex(H=>drin(0, 0, H.ring));
    if(hit >= 0) beob = hit;
    else { haeuser.push({poly:[opt.haus.ring], ring:tr, h: opt.haus.h || STD_HOEHE, hb:0, sicht:false, block:false}); beob = haeuser.length - 1; }
  }
  /* 2. Höhenmodell als feines Gitter */
  const dem = await hoehenGitter(lon0, lat0, R, zelle, N, mx, my);
  /* Höhenmodell leicht glätten: Messrauschen von 1–2 m würde sonst auf freiem Feld die Sicht unnötig abschneiden */
  { const r = Math.max(1, Math.round(9/zelle)), tmp = new Float32Array(N*N);
    for(let pass=0; pass<2; pass++){
      for(let j=0;j<N;j++){ let s = 0, n = 0; for(let i=-r;i<=r;i++){ if(i>=0 && i<N){ s += dem[j*N+i]; n++; } }
        for(let i=0;i<N;i++){ tmp[j*N+i] = s/n; const a = i - r, b = i + r + 1; if(a >= 0){ s -= dem[j*N+a]; n--; } if(b < N){ s += dem[j*N+b]; n++; } } }
      for(let i=0;i<N;i++){ let s = 0, n = 0; for(let j=-r;j<=r;j++){ if(j>=0 && j<N){ s += tmp[j*N+i]; n++; } }
        for(let j=0;j<N;j++){ dem[j*N+i] = s/n; const a = j - r, b = j + r + 1; if(a >= 0){ s -= tmp[a*N+i]; n--; } if(b < N){ s += tmp[b*N+i]; n++; } } } } }
  const gelaende = (x, y)=>{ const fi = (x + R)/zelle - 0.5, fj = (R - y)/zelle - 0.5;
    const i = Math.max(0, Math.min(N-2, Math.floor(fi))), j = Math.max(0, Math.min(N-2, Math.floor(fj))), u = Math.min(1, Math.max(0, fi - i)), v = Math.min(1, Math.max(0, fj - j));
    return (dem[j*N+i]*(1-u) + dem[j*N+i+1]*u)*(1-v) + (dem[(j+1)*N+i]*(1-u) + dem[(j+1)*N+i+1]*u)*v; };
  const hausH = beob >= 0 ? haeuser[beob].h : (opt.hoehe || 0);
  const extra = +opt.extra || 0, z0 = gelaende(0, 0) + hausH + AUGE + extra;

  /* 3. Sichtstrahlen: exakte Schnittpunkte mit den Hauswänden + Gelände alle paar Meter */
  const STR = R <= 600 ? 2880 : 3600, schritt = Math.max(1.5, R/450), dw = 2*Math.PI/STR;
  const verdeckt = [];   /* je Strahl: Liste [von, bis] */
  let versteckt = 0;
  for(let s=0; s<STR; s++){
    const w = (s + 0.5)*dw, cx = Math.cos(w), cy = Math.sin(w);
    const bin = Math.floor(((w + 2*Math.PI) % (2*Math.PI))/(2*Math.PI)*BINS) % BINS;
    const iv = [];
    for(const idx of bins[bin]){ if(idx === beob) continue; const ring = haeuser[idx].ring, ts = [];
      for(let k=0, m=ring.length-1; k<ring.length; m=k++){ const px = ring[m][0], py = ring[m][1], ex = ring[k][0] - px, ey = ring[k][1] - py;
        const den = cx*ey - cy*ex; if(Math.abs(den) < 1e-12) continue;
        const t = (px*ey - py*ex)/den, u = (px*cy - py*cx)/den; if(u >= 0 && u < 1 && t > 0) ts.push(t); }
      ts.sort((a,b)=>a-b); for(let k=0; k+1<ts.length; k+=2) if(ts[k] < R) iv.push([ts[k], Math.min(R, ts[k+1]), idx]); }
    iv.sort((a,b)=>a[0]-b[0]);
    const proben = []; for(let d=schritt; d<R; d+=schritt) proben.push(d);
    for(const q of iv){ proben.push(q[0] + 0.05, (q[0] + q[1])/2, Math.max(q[0] + 0.05, q[1] - 0.05)); }
    proben.sort((a,b)=>a-b);
    let maxS = -Infinity, blocker = -1, start = -1, ivk = 0; const H = [];
    for(const d of proben){
      while(ivk < iv.length && iv[ivk][1] < d) ivk++;
      let bh = 0, bi = -1; for(let k=ivk; k<iv.length && iv[k][0] <= d; k++) if(d <= iv[k][1] && haeuser[iv[k][2]].h > bh){ bh = haeuser[iv[k][2]].h; bi = iv[k][2]; }
      const g = gelaende(cx*d, cy*d) - d*d*KRUEMMUNG, oben = g + bh;
      const ziel = (bi >= 0 ? oben : g + ZIEL), vis = (ziel - z0)/d >= maxS;
      if(bi >= 0 && vis) haeuser[bi].sicht = true;
      if(!vis){ if(start < 0) start = d; if(blocker >= 0) haeuser[blocker].block = true; }
      else if(start >= 0){ H.push([start, d]); start = -1; }
      const sl = (oben - z0)/d; if(sl > maxS){ maxS = sl; blocker = bi; }
    }
    if(start >= 0) H.push([start, R]);
    for(const [a,b] of H) versteckt += (b*b - a*a)*dw/2;
    verdeckt.push(H);
  }

  /* 4. Verdeckte Bereiche zu glatten Flächen zusammenfassen (benachbarte Strahlen mit ähnlichem Abschnitt = eine Fläche) */
  const flaechen = [], tol = Math.max(5*schritt, 12);
  let offen = [];
  const pkt = (w, d)=>geo(Math.cos(w)*d, Math.sin(w)*d);
  const schliessen = o=>{ const innen = o.a.map(([w,d])=>[Math.cos(w)*d, Math.sin(w)*d]), aussen = o.b.map(([w,d])=>[Math.cos(w)*d, Math.sin(w)*d]).reverse(); flaechen.push(innen.concat(aussen)); };
  for(let s=0; s<=STR; s++){
    const H = s < STR ? verdeckt[s] : [], w1 = s*dw, w2 = (s + 1)*dw, neu = [];
    for(const [a,b] of H){
      const o = offen.find(o=>!o.genutzt && Math.abs(o.la - a) < tol && Math.abs(o.lb - b) < tol*2);
      if(o){ o.genutzt = true; o.a.push([w1,a],[w2,a]); o.b.push([w1,b],[w2,b]); o.la = a; o.lb = b; neu.push(o); }
      else neu.push({a:[[w1,a],[w2,a]], b:[[w1,b],[w2,b]], la:a, lb:b, genutzt:true});
    }
    offen.forEach(o=>{ if(!o.genutzt) schliessen(o); });
    offen = neu; offen.forEach(o=>o.genutzt = false);
  }
  offen.forEach(schliessen);

  /* 5. Ergebnis */
  const kreis = []; for(let i=0;i<=180;i++){ const a = i/180*2*Math.PI; kreis.push(geo(Math.cos(a)*R, Math.sin(a)*R)); }
  /* Sicht und Schatten als ein Bild in hoher Auflösung: ein einziger Pfad, dadurch keine Nähte, gerade Kanten */
  const S = 2048, sk = S/(2*R), cv = document.createElement("canvas"); cv.width = cv.height = S;
  const c = cv.getContext("2d"), X = x=>(x + R)*sk, Y = y=>(R - y)*sk;
  c.fillStyle = "rgba(255,255,255,0.3)"; c.beginPath(); c.arc(S/2, S/2, S/2, 0, 2*Math.PI); c.fill();
  c.save(); c.beginPath(); c.arc(S/2, S/2, S/2, 0, 2*Math.PI); c.clip();
  c.beginPath();
  for(const r of flaechen){ c.moveTo(X(r[0][0]), Y(r[0][1])); for(let i=1;i<r.length;i++) c.lineTo(X(r[i][0]), Y(r[i][1])); c.closePath(); }
  c.globalCompositeOperation = "source-over"; c.fillStyle = "rgba(8,2,6,0.68)";
  /* zuerst ausstanzen, dann dunkel füllen – damit der grüne Ton unter den Schatten nicht durchscheint */
  c.save(); c.globalCompositeOperation = "destination-out"; c.fillStyle = "#000"; c.fill("nonzero"); c.restore(); c.fill("nonzero"); c.restore();
  const F = [{type:"Feature", properties:{k:"kreis"}, geometry:{type:"LineString", coordinates:kreis}}];
  let nBlock = 0;
  haeuser.forEach((H, i)=>{ if(i === beob) return; const r0 = H.ring; if(!r0.some(q=>q[0]*q[0] + q[1]*q[1] < R*R)) return;
    const k = H.block ? "block" : H.sicht ? "hsicht" : "hweg"; if(H.block) nBlock++;
    F.push({type:"Feature", properties:{k}, geometry:{type:"Polygon", coordinates:H.poly}}); });
  F.push({type:"Feature", properties:{k:"auge"}, geometry:{type:"Point", coordinates:[lon0, lat0]}});
  if(beob >= 0) F.push({type:"Feature", properties:{k:"haus"}, geometry:{type:"Polygon", coordinates:haeuser[beob].poly}});
  return {bild: cv.toDataURL("image/png"), ecken:[geo(-R, R), geo(R, R), geo(R, -R), geo(-R, -R)], geojson:{type:"FeatureCollection", features:F}, anteil: Math.max(0, 1 - versteckt/(Math.PI*R*R)), blockierer: nBlock,
    hoehe: hausH, extra, gebaeude: haeuser.length, haus: beob >= 0, radius: R};
}

/* --- Auf die Karte legen --- */
function zeigen(map, r){
  entfernen(map);
  const vor = (map.getStyle().layers.find(l=>l.type==="symbol")||{}).id;
  map.addSource("sicht", {type:"geojson", data:r.geojson});
  const K = k=>["==",["get","k"],k];
  map.addSource("sicht-bild", {type:"image", url:r.bild, coordinates:r.ecken});
  map.addLayer({id:"sicht-flaeche", type:"raster", source:"sicht-bild", paint:{"raster-opacity":1, "raster-fade-duration":0, "raster-resampling":"linear"}}, vor);
  map.addLayer({id:"sicht-hweg", type:"fill", source:"sicht", filter:K("hweg"), paint:{"fill-color":"#26242b","fill-opacity":0.92}}, vor);
  map.addLayer({id:"sicht-hsicht", type:"fill", source:"sicht", filter:K("hsicht"), paint:{"fill-color":"#ffffff","fill-opacity":0.95}}, vor);
  map.addLayer({id:"sicht-block", type:"fill", source:"sicht", filter:K("block"), paint:{"fill-color":"#ff2d4f","fill-opacity":0.9}}, vor);
  map.addLayer({id:"sicht-block-l", type:"line", source:"sicht", filter:["in",["get","k"],["literal",["block","hsicht"]]], paint:{"line-color":["case",["==",["get","k"],"block"],"#ffffff","#ff2d4f"],"line-width":0.8}}, vor);
  map.addLayer({id:"sicht-haus", type:"fill", source:"sicht", filter:K("haus"), paint:{"fill-color":"#18e0ff","fill-opacity":0.95}}, vor);
  map.addLayer({id:"sicht-kreis", type:"line", source:"sicht", filter:K("kreis"), paint:{"line-color":"#ffffff","line-width":2,"line-dasharray":[3,2]}});
  map.addLayer({id:"sicht-auge", type:"circle", source:"sicht", filter:K("auge"), paint:{"circle-radius":6,"circle-color":"#18e0ff","circle-stroke-color":"#000","circle-stroke-width":2}});
}
function entfernen(map){
  ["sicht-auge","sicht-kreis","sicht-haus","sicht-block-l","sicht-block","sicht-hsicht","sicht-hweg","sicht-naht","sicht-schatten","sicht-flaeche","sicht-bild"].forEach(id=>{ try{ if(map.getLayer(id)) map.removeLayer(id); }catch(e){} });
  ["sicht","sicht-bild"].forEach(id=>{ try{ if(map.getSource(id)) map.removeSource(id); }catch(e){} });
}

window.Sicht = { berechne, zeigen, entfernen, gebaeudeQuelle };
})();
