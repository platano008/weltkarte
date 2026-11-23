/* Plyus · Sichtfeld: Was kann man von einem Haus (oder Punkt) aus sehen?
   Rechnet komplett im Browser: Höhenmodell (Terrain Tiles, AWS, frei) + Gebäude mit Höhe aus den Kartendaten.
   Von der Beobachterposition laufen Sichtstrahlen in alle Richtungen; was hinter Gelände oder Häusern liegt, ist verdeckt.
   Häuser, die die Sicht blockieren, werden rot markiert. */
(function(){
"use strict";
const DEM_Z = 14, AUGE = 1.6, ZIEL = 1.7, STD_HOEHE = 8;
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

async function berechne(map, ll, opt){
  opt = opt || {};
  const R = opt.radius || 1000, zelle = Math.max(2.5, R/250), N = Math.round(2*R/zelle);
  const lon0 = ll[0], lat0 = ll[1], my = 110540, mx = 111320*Math.cos(lat0*Math.PI/180);
  const toXY = (lon, lat)=>[(lon - lon0)*mx, (lat - lat0)*my], geo = (x, y)=>[lon0 + x/mx, lat0 + y/my];

  /* 1. Häuser: Grundriss in Metern, Höhe, Winkelbereich vom Beobachter aus */
  const src = opt.quelle || gebaeudeQuelle(map);
  const feats = src ? map.querySourceFeatures(src, {sourceLayer:"building"}) : [];
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
      const key = Math.round(x1*2)+","+Math.round(y1*2)+","+Math.round(x2*2)+","+Math.round(y2*2); if(seen.has(key)) continue; seen.add(key);
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
  /* 2. Höhenmodell als feines Gitter */
  const dem = await hoehenGitter(lon0, lat0, R, zelle, N, mx, my);
  const gelaende = (x, y)=>{ const fi = (x + R)/zelle - 0.5, fj = (R - y)/zelle - 0.5;
    const i = Math.max(0, Math.min(N-2, Math.floor(fi))), j = Math.max(0, Math.min(N-2, Math.floor(fj))), u = Math.min(1, Math.max(0, fi - i)), v = Math.min(1, Math.max(0, fj - j));
    return (dem[j*N+i]*(1-u) + dem[j*N+i+1]*u)*(1-v) + (dem[(j+1)*N+i]*(1-u) + dem[(j+1)*N+i+1]*u)*v; };
  const hausH = beob >= 0 ? haeuser[beob].h : (opt.hoehe || 0);
  const z0 = gelaende(0, 0) + hausH + AUGE;

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
      const g = gelaende(cx*d, cy*d), oben = g + bh;
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
  c.fillStyle = "rgba(40,235,120,0.34)"; c.beginPath(); c.arc(S/2, S/2, S/2, 0, 2*Math.PI); c.fill();
  c.save(); c.beginPath(); c.arc(S/2, S/2, S/2, 0, 2*Math.PI); c.clip();
  c.beginPath();
  for(const r of flaechen){ c.moveTo(X(r[0][0]), Y(r[0][1])); for(let i=1;i<r.length;i++) c.lineTo(X(r[i][0]), Y(r[i][1])); c.closePath(); }
  c.globalCompositeOperation = "source-over"; c.fillStyle = "rgba(12,7,24,0.66)";
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
    hoehe: hausH, gebaeude: haeuser.length, haus: beob >= 0, radius: R};
}

/* --- Auf die Karte legen --- */
function zeigen(map, r){
  entfernen(map);
  const vor = (map.getStyle().layers.find(l=>l.type==="symbol")||{}).id;
  map.addSource("sicht", {type:"geojson", data:r.geojson});
  const K = k=>["==",["get","k"],k];
  map.addSource("sicht-bild", {type:"image", url:r.bild, coordinates:r.ecken});
  map.addLayer({id:"sicht-flaeche", type:"raster", source:"sicht-bild", paint:{"raster-opacity":1, "raster-fade-duration":0, "raster-resampling":"linear"}}, vor);
  map.addLayer({id:"sicht-hweg", type:"fill", source:"sicht", filter:K("hweg"), paint:{"fill-color":"#3a3448","fill-opacity":0.85}}, vor);
  map.addLayer({id:"sicht-hsicht", type:"fill", source:"sicht", filter:K("hsicht"), paint:{"fill-color":"#2ee87f","fill-opacity":0.85}}, vor);
  map.addLayer({id:"sicht-block", type:"fill", source:"sicht", filter:K("block"), paint:{"fill-color":"#ff2d4f","fill-opacity":0.9}}, vor);
  map.addLayer({id:"sicht-block-l", type:"line", source:"sicht", filter:["in",["get","k"],["literal",["block","hsicht"]]], paint:{"line-color":"#ffffff","line-width":0.8}}, vor);
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
