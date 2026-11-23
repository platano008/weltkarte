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
  const R = opt.radius || 1000, zelle = R <= 600 ? 3 : R <= 1200 ? 4 : 6, N = Math.round(2*R/zelle);
  const lon0 = ll[0], lat0 = ll[1], my = 110540, mx = 111320*Math.cos(lat0*Math.PI/180);
  const toXY = (lon, lat)=>[(lon - lon0)*mx, (lat - lat0)*my];

  /* Gebäude aus den geladenen Kacheln */
  const src = opt.quelle || gebaeudeQuelle(map);
  const feats = src ? map.querySourceFeatures(src, {sourceLayer:"building"}) : [];
  const hg = new Float32Array(N*N), bid = new Int32Array(N*N).fill(-1), haeuser = [], seen = new Set();
  let beob = -1;
  for(const f of feats){
    const h = +(f.properties.render_height || f.properties.height || 0) || STD_HOEHE;
    for(const poly of polygone(f)){
      const ring = poly[0].map(p=>toXY(p[0], p[1]));
      let x1 = Infinity, x2 = -Infinity, y1 = Infinity, y2 = -Infinity; for(const p of ring){ x1 = Math.min(x1,p[0]); x2 = Math.max(x2,p[0]); y1 = Math.min(y1,p[1]); y2 = Math.max(y2,p[1]); }
      if(x2 < -R || x1 > R || y2 < -R || y1 > R) continue;
      const key = Math.round(x1*2)+","+Math.round(y1*2)+","+Math.round(x2*2); if(seen.has(key)) continue; seen.add(key);   /* gleiche Häuser aus Nachbarkacheln nur einmal */
      const idx = haeuser.length; haeuser.push({poly, h});
      if(drin(0, 0, ring)) beob = idx;
      const i1 = Math.max(0, Math.floor((x1 + R)/zelle)), i2 = Math.min(N-1, Math.floor((x2 + R)/zelle));
      const j1 = Math.max(0, Math.floor((R - y2)/zelle)), j2 = Math.min(N-1, Math.floor((R - y1)/zelle));
      for(let j=j1;j<=j2;j++){ const cy = R - (j + 0.5)*zelle;
        for(let i=i1;i<=i2;i++){ const cxp = -R + (i + 0.5)*zelle;
          if(drin(cxp, cy, ring)){ const k = j*N+i; if(h > hg[k]){ hg[k] = h; bid[k] = idx; } } } }
    }
  }
  if(beob < 0 && opt.haus){ /* angeklicktes Haus: Höhe vom Kartenobjekt */ }
  const dem = await hoehenGitter(lon0, lat0, R, zelle, N, mx, my);
  const c0 = (Math.floor(N/2))*N + Math.floor(N/2);
  const hausH = beob >= 0 ? haeuser[beob].h : (opt.hoehe || 0);
  const z0 = dem[c0] + hausH + AUGE;

  /* Sichtstrahlen */
  const sicht = new Uint8Array(N*N), block = new Set(), strahlen = Math.ceil(2*Math.PI*R/zelle*1.6), schritt = zelle*0.6;
  for(let s=0;s<strahlen;s++){
    const w = s/strahlen*2*Math.PI, dx = Math.cos(w), dy = Math.sin(w);
    let maxS = -Infinity, blocker = -1;
    for(let d=schritt; d<R; d+=schritt){
      const x = dx*d, y = dy*d, i = Math.floor((x + R)/zelle), j = Math.floor((R - y)/zelle);
      if(i < 0 || j < 0 || i >= N || j >= N) break;
      const k = j*N+i, eigen = bid[k] === beob && beob >= 0;
      const oben = dem[k] + (eigen ? 0 : hg[k]);
      const zielS = (oben + (hg[k] > 0 ? 0 : ZIEL) - z0)/d;
      if(zielS >= maxS) sicht[k] = 1;
      else if(blocker >= 0) block.add(blocker);
      const oS = (oben - z0)/d;
      if(oS > maxS){ maxS = oS; blocker = (hg[k] > 0 && !eigen) ? bid[k] : -1; }
    }
  }

  /* Bild malen */
  const cv = document.createElement("canvas"); cv.width = cv.height = N;
  const cx = cv.getContext("2d"), img = cx.createImageData(N, N), d = img.data;
  let an = 0, alle = 0;
  for(let j=0;j<N;j++) for(let i=0;i<N;i++){
    const x = -R + (i + 0.5)*zelle, y = R - (j + 0.5)*zelle; if(x*x + y*y > R*R) continue;
    const k = j*N+i, o = k*4; alle++;
    if(sicht[k]){ an++; d[o] = 40; d[o+1] = 235; d[o+2] = 120; d[o+3] = 115; }
    else { d[o] = 15; d[o+1] = 10; d[o+2] = 30; d[o+3] = 140; }
  }
  cx.putImageData(img, 0, 0);
  const geo = (x, y)=>[lon0 + x/mx, lat0 + y/my];
  const ecken = [geo(-R, R), geo(R, R), geo(R, -R), geo(-R, -R)];
  const kreis = []; for(let i=0;i<=120;i++){ const a = i/120*2*Math.PI; kreis.push(geo(Math.cos(a)*R, Math.sin(a)*R)); }
  const F = [{type:"Feature", properties:{k:"kreis"}, geometry:{type:"LineString", coordinates:kreis}},
             {type:"Feature", properties:{k:"auge"}, geometry:{type:"Point", coordinates:[lon0, lat0]}}];
  block.forEach(b=>F.push({type:"Feature", properties:{k:"block"}, geometry:{type:"Polygon", coordinates:haeuser[b].poly}}));
  if(beob >= 0) F.push({type:"Feature", properties:{k:"haus"}, geometry:{type:"Polygon", coordinates:haeuser[beob].poly}});
  return {bild: cv.toDataURL("image/png"), ecken, geojson:{type:"FeatureCollection", features:F},
    anteil: alle ? an/alle : 0, blockierer: block.size, hoehe: hausH, gebaeude: haeuser.length, haus: beob >= 0, radius: R};
}

/* --- Auf die Karte legen --- */
function zeigen(map, r){
  entfernen(map);
  const vor = (map.getStyle().layers.find(l=>l.type==="symbol")||{}).id;
  map.addSource("sicht-bild", {type:"image", url:r.bild, coordinates:r.ecken});
  map.addLayer({id:"sicht-bild", type:"raster", source:"sicht-bild", paint:{"raster-opacity":0.9, "raster-fade-duration":0, "raster-resampling":"nearest"}}, vor);
  map.addSource("sicht", {type:"geojson", data:r.geojson});
  map.addLayer({id:"sicht-block", type:"fill", source:"sicht", filter:["==",["get","k"],"block"], paint:{"fill-color":"#ff2d4f","fill-opacity":0.75}});
  map.addLayer({id:"sicht-block-l", type:"line", source:"sicht", filter:["==",["get","k"],"block"], paint:{"line-color":"#ffffff","line-width":1.2}});
  map.addLayer({id:"sicht-haus", type:"fill", source:"sicht", filter:["==",["get","k"],"haus"], paint:{"fill-color":"#18e0ff","fill-opacity":0.9}});
  map.addLayer({id:"sicht-kreis", type:"line", source:"sicht", filter:["==",["get","k"],"kreis"], paint:{"line-color":"#ffffff","line-width":2,"line-dasharray":[3,2]}});
  map.addLayer({id:"sicht-auge", type:"circle", source:"sicht", filter:["==",["get","k"],"auge"], paint:{"circle-radius":6,"circle-color":"#18e0ff","circle-stroke-color":"#000","circle-stroke-width":2}});
}
function entfernen(map){
  ["sicht-auge","sicht-kreis","sicht-haus","sicht-block-l","sicht-block","sicht-bild"].forEach(id=>{ try{ if(map.getLayer(id)) map.removeLayer(id); }catch(e){} });
  ["sicht","sicht-bild"].forEach(id=>{ try{ if(map.getSource(id)) map.removeSource(id); }catch(e){} });
}

window.Sicht = { berechne, zeigen, entfernen, gebaeudeQuelle };
})();
