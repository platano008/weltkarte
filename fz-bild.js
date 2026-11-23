/* Plyus · Fahrzeugbilder
   Zeichnet aus wenigen Kennwerten eine Seitenansicht als SVG (Front rechts).
   Kennwerte (alle optional außer c):
     c  Fahrwerk: k Kette · r Rad · l Lkw · s gezogenes Geschütz · m Motorrad/Quad/Buggy · u Bodenroboter · z Eisenbahn
     L  Länge in Bildpunkten (Bild ist 240 × 100) · n Laufrollen bzw. Achsen · h Wannenhöhe
     w  Wannenform: kpz spz box flach btr mrap imv auto pick van bus
     t  Aufbau oben: rund eckig klein haub kasten stand werfer fla radar schild
     a  Lkw-Aufbau: plane tank koffer kran werfer rak fla radar schuessel mast haub sattel leer bus
     k  Lkw-Kabine: f (Frontlenker) · n (Haube) · p (gepanzert)
     g  Rohrlänge · gw Rohrstärke · gx Rohrwinkel in Grad
     f  Zusätze, durch Leerzeichen getrennt: era kaefig zar mg atgm schuerze raeumer kran bruecke antenne nebel walze flak
   Stil: Aufkleber mit dunkler Kontur, runden Ecken, großen Radnaben und einem Streifen in der Farbe der Seite. */
(function(){
  // Aufkleber-Stil: jede Form wird dreimal gezeichnet – heller Rand, dunkle Kontur (AUS), dann farbig mit runden Ecken
  const G = 88, RAND = ["#eef2e6", 7.5], KONTUR = ["#1b1f19", 3.6], AKZ = {ua:"#4aa3ff", ru:"#ff4d63", beide:"#b98cff"};
  const F = {hell:"#dce3c8", mittel:"#aab691", dunkel:"#2b3027", rad:"#eef1e4", glas:"#a9dbf7", linie:"#7f8a6c", glanz:"rgba(255,255,255,.7)"};
  let AUS = null;
  const r1 = v=>Math.round(v*10)/10;
  const stil = c=>AUS ? `fill="${AUS[0]}" stroke="${AUS[0]}" stroke-width="${AUS[1]}" stroke-linejoin="round"` : `fill="${c}" stroke="${c}" stroke-width="2" stroke-linejoin="round"`;
  const poly = (p, c)=>`<polygon points="${p.map(q=>r1(q[0])+","+r1(q[1])).join(" ")}" ${stil(c)}/>`;
  const rect = (x, y, w, h, c, rx)=>`<rect x="${r1(x)}" y="${r1(y)}" width="${r1(Math.max(w, 0))}" height="${r1(Math.max(h, 0))}" rx="${rx == null ? Math.min(2.5, h/3, w/3) : rx}" ${stil(c)}/>`;
  const kreis = (x, y, r, c)=>`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" ${stil(c)}/>`;
  const ellipse = (x, y, rx, ry, c)=>`<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${rx}" ry="${ry}" ${stil(c)}/>`;
  const pfad = (d, c)=>`<path d="${d}" ${stil(c)}/>`;
  const strich = (x1, y1, x2, y2, b, c)=>AUS && (c === F.glanz || b < 1) ? "" : `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${AUS ? AUS[0] : c || F.linie}" stroke-width="${AUS ? b + AUS[1] - 1 : b}" stroke-linecap="round"/>`;
  const dreh = (gr, x, y, inhalt)=>`<g transform="rotate(${gr} ${r1(x)} ${r1(y)})">${inhalt}</g>`;
  const glanz = (x1, x2, y)=>strich(x1, y, x2, y, 1.3, F.glanz);
  const streifen = (x, y, s)=>AUS ? "" : rect(x, y, 13, 4, AKZ[s] || AKZ.beide, 2);

  // Rohr ab (x, y) nach rechts (rw > 0) oder links (rw < 0), gx = Erhöhung in Grad
  function rohr(x, y, len, b, gx, rw){
    if(!len) return "";
    const s = rw < 0 ? -1 : 1, x2 = s > 0 ? x : x - len;
    let i = rect(x2, y - b/2, len, b, F.mittel, b/2) + rect(s > 0 ? x + len - 5 : x - len, y - b/2 - 0.9, 5, b + 1.8, F.mittel, 1.2);
    if(len > 40) i += rect(s > 0 ? x + len*0.55 : x - len*0.6, y - b/2 - 0.7, 5, b + 1.4, F.mittel, 1.2);
    return dreh(-(gx || 0)*s, x, y, i);
  }
  function raeder(xs, r){ return xs.map(x=>kreis(x, G - r, r, F.dunkel) + (AUS ? "" : kreis(x, G - r, r*0.55, F.rad) + kreis(x, G - r, r*0.2, F.mittel))).join(""); }
  function achsen(x0, L, n, r){
    if(n <= 2) return [x0 + r + 6, x0 + L - r - 8];
    const vorne = x0 + L - r - 8, hinten = x0 + r + 6, d = (vorne - hinten)/(n - 1);
    if(n === 3) return [hinten, hinten + 2*r + 3, vorne];
    if(n === 4) return [hinten, hinten + 2*r + 3, vorne - 2*r - 3, vorne];
    return Array.from({length:n}, (_, i)=>hinten + i*d);
  }

  // ── Aufbauten oben (Türme, Werfer, Radar) ───────────────────────────
  function oben(b, cx, T, L){
    const t = b.t, g = b.g || 0, gw = b.gw || 2.6, gx = b.gx || 0;
    let s = "", tw, th;
    if(t === "rund"){ tw = L*0.4; th = 16;
      s += pfad(`M${r1(cx - tw/2)} ${T} C${r1(cx - tw/2 + 2)} ${r1(T - th*1.05)} ${r1(cx + tw/2 - 6)} ${r1(T - th*1.1)} ${r1(cx + tw/2)} ${T} Z`, F.mittel) + glanz(cx - tw/4, cx + tw/6, T - th*0.82);
      s += rohr(cx + tw/2 - 4, T - th*0.45, g, gw, gx, 1); return {s, top:T - th, tw, th}; }
    if(t === "eckig"){ tw = L*0.42; th = 15;
      s += poly([[cx - tw/2 - 10, T - 2], [cx - tw/2 - 8, T - th + 1], [cx + tw/2 - 10, T - th], [cx + tw/2 + 4, T - th*0.42], [cx + tw/2, T]], F.mittel);
      s += rohr(cx + tw/2 + 1, T - th*0.5, g, gw, gx, 1); return {s, top:T - th, tw, th}; }
    if(t === "klein"){ tw = L*0.24; th = 11;
      s += poly([[cx - tw/2, T], [cx - tw/2 + 3, T - th], [cx + tw/2 - 4, T - th], [cx + tw/2, T]], F.mittel);
      s += rohr(cx + tw/2 - 2, T - th*0.55, g, gw || 1.8, gx, 1); return {s, top:T - th, tw, th}; }
    if(t === "haub"){ tw = L*0.5; th = 17;
      s += poly([[cx - tw/2, T], [cx - tw/2, T - th], [cx + tw/2 - 7, T - th], [cx + tw/2, T - th + 7], [cx + tw/2, T]], F.mittel);
      s += rohr(cx + tw/2 - 2, T - th*0.55, g, gw || 3.2, gx || 6, 1); return {s, top:T - th, tw, th}; }
    if(t === "kasten"){ tw = L*0.3; th = 13;
      s += poly([[cx - tw/2, T], [cx - tw/2 + 2, T - th], [cx + tw/2 - 3, T - th], [cx + tw/2, T]], F.mittel);
      if(g) { s += rohr(cx + tw/2 - 2, T - th*0.6, g, gw || 2, gx || 18, 1) + rohr(cx + tw/2 - 2, T - th*0.3, g, gw || 2, gx || 18, 1); }
      return {s, top:T - th, tw, th}; }
    if(t === "stand"){ tw = 12; th = 6;
      s += rect(cx - tw/2, T - th, tw, th, F.mittel, 1.5) + rohr(cx + 4, T - th*0.6, g || 16, gw || 1.6, gx, 1); return {s, top:T - th, tw, th}; }
    if(t === "werfer"){ const lw = L*0.75, hh = 15;
      s += dreh(14, cx + lw/2 - 8, T - 2, rect(cx - lw/2, T - hh - 2, lw, hh, F.mittel, 1.5) +
        Array.from({length:5}, (_, i)=>strich(cx - lw/2 + 2, T - hh + 1 + i*3, cx + lw/2 - 2, T - hh + 1 + i*3, 0.6, F.linie)).join(""));
      return {s, top:T - 30, tw:lw, th:hh}; }
    if(t === "fla"){ const lw = Math.min(L*0.3, 50), n = b.nr || 4;
      s += rect(cx - 9, T - 14, 18, 14, F.mittel, 2);
      s += dreh(48, cx + 6, T - 9, Array.from({length:n}, (_, i)=>rect(cx + 6 - lw, T - 14 - i*5.2, lw, 4.4, i % 2 ? F.hell : F.mittel, 2)).join(""));
      if(b.f && b.f.includes("radar")) s += rect(cx - 4, T - 30, 9, 16, F.hell, 1.5);
      return {s, top:T - 34, tw:18, th:14}; }
    if(t === "radar"){ s += strich(cx, T, cx, T - 16, 2.4, F.mittel) + rect(cx - 15, T - 40, 30, 24, F.hell, 2) +
      [1, 2, 3].map(i=>strich(cx - 14, T - 40 + i*6, cx + 14, T - 40 + i*6, 0.6, F.linie)).join(""); return {s, top:T - 40, tw:30, th:24}; }
    if(t === "schuessel"){ s += strich(cx, T, cx, T - 14, 2.4, F.mittel) + ellipse(cx, T - 24, 6, 12, F.hell); return {s, top:T - 36, tw:12, th:24}; }
    return {s:"", top:T, tw:0, th:0};
  }

  // ── Zusätze ─────────────────────────────────────────────────────────
  function zusatz(b, x0, L, T, o, cx){
    const f = " " + (b.f || "") + " ";
    let s = "";
    if(f.includes(" era ")){ for(let i = 0; i < 4; i++) s += rect(cx + (o.tw || 20)/2 - 12 + i*3.2, o.top + 1 + i*0.4, 2.6, 4.5, F.hell);
      for(let i = 0; i < 4; i++) s += rect(x0 + L - 20 + i*4.5, T + 2 + i*1.4, 3.8, 3, F.mittel); }
    if(f.includes(" mg ")) s += rect(cx - 4, o.top - 4, 7, 4, F.mittel, 1) + strich(cx + 2, o.top - 3, cx + 12, o.top - 3.5, 1.1, F.mittel);
    if(f.includes(" atgm ")) s += rect(cx - 6, o.top - 5, 14, 3.6, F.hell, 1.5);
    if(f.includes(" antenne ")) s += strich(x0 + 14, T, x0 + 10, T - 26, 0.9, F.linie) + strich(x0 + 22, T, x0 + 20, T - 20, 0.9, F.linie);
    if(f.includes(" nebel ")) s += [0, 1, 2].map(i=>rect(cx + (o.tw || 20)/2 - 4, o.top + 2 + i*2.6, 5, 2, F.hell, 1)).join("");
    if(f.includes(" kaefig ")){ const a = cx - (o.tw || 30)/2 - 6, e = cx + (o.tw || 30)/2 + 8, y = o.top - 10;
      s += strich(a, y, e, y, 1.2, F.hell) + strich(a, y, a, T, 1, F.hell) + strich(e, y, e, T, 1, F.hell);
      for(let x = a + 5; x < e; x += 5) s += strich(x, y, x, y + 5, 0.7, F.hell); }
    if(f.includes(" zar ")){ const a = x0 - 3, e = x0 + L + 3, y = o.top - 12;
      s += AUS ? "" : `<path d="M${r1(a)} ${r1(G - 20)} L${r1(a)} ${r1(y + 6)} L${r1((a + e)/2)} ${r1(y - 4)} L${r1(e)} ${r1(y + 6)} L${r1(e)} ${r1(G - 20)}" fill="rgba(196,203,213,.38)" stroke="${F.hell}" stroke-width="1.6" stroke-linejoin="round"/>`;
      for(let x = a + 8; x < e - 4; x += 8) s += strich(x, y + 6, x, G - 21, 0.6, F.hell); }
    if(f.includes(" raeumer ")) s += poly([[x0 + L + 2, G - 26], [x0 + L + 12, G - 24], [x0 + L + 14, G - 3], [x0 + L + 4, G - 6]], F.mittel);
    if(f.includes(" walze ")) s += strich(x0 + L, G - 18, x0 + L + 12, G - 12, 2, F.mittel) + kreis(x0 + L + 14, G - 8, 7, F.dunkel) + kreis(x0 + L + 14, G - 8, 3, F.rad);
    if(f.includes(" kran ")) s += strich(cx - 6, T, cx + 26, T - 34, 3.2, F.mittel) + strich(cx + 26, T - 34, cx + 26, T - 14, 0.8, F.linie);
    if(f.includes(" bruecke ")) s += pfad(`M${r1(x0 - 4)} ${r1(T - 1)} L${r1(x0 + L/2)} ${r1(T - 22)} L${r1(x0 + L + 6)} ${r1(T - 1)} Z`, F.mittel) + strich(x0 + L/2, T - 22, x0 + L/2, T - 1, 0.8, F.hell);
    return s;
  }

  // ── Fahrwerke ───────────────────────────────────────────────────────
  function kette(b){
    const L = b.L || 180, x0 = (240 - L)/2 - Math.max(0, (b.g || 0) - 40)*0.4, n = b.n || 6, h = (b.h || (b.w === "spz" ? 16 : b.w === "box" ? 22 : b.w === "flach" ? 9 : 12)) + 2;
    let s = rect(x0, G - 21, L, 20, F.dunkel, 10);
    const r = Math.min(8.4, (L - 24)/(2*n) - 0.4), a = x0 + 11 + r, e = x0 + L - 11 - r;
    for(let i = 0; i < n; i++){ const x = n > 1 ? a + i*(e - a)/(n - 1) : (a + e)/2; s += AUS ? "" : kreis(x, G - 9.5, r, F.rad) + kreis(x, G - 9.5, r*0.38, F.mittel); }
    s += kreis(x0 + 7, G - 14, 3.6, F.mittel) + kreis(x0 + L - 7, G - 14, 3.6, F.mittel);
    const T = G - 21 - h, w = b.w || "kpz";
    const wanne = w === "spz" ? [[x0 + 1, G - 21], [x0, T + 2], [x0 + 3, T], [x0 + L - 42, T], [x0 + L + 5, G - 24], [x0 + L, G - 21]]
      : w === "box" ? [[x0 + 1, G - 21], [x0 + 1, T], [x0 + L - 16, T], [x0 + L + 3, T + 12], [x0 + L + 1, G - 21]]
      : w === "flach" ? [[x0 + 1, G - 21], [x0 + 1, T], [x0 + L - 14, T], [x0 + L + 4, G - 23], [x0 + L, G - 21]]
      : [[x0 + 2, G - 21], [x0 - 1, T + 3], [x0 + 3, T], [x0 + L - 28, T], [x0 + L + 4, G - 26], [x0 + L, G - 21]];
    s += poly(wanne, F.hell) + glanz(x0 + 6, x0 + L*0.6, T + 1.6);
    if((" " + (b.f || "") + " ").includes(" schuerze ")) s += rect(x0 + 8, G - 24, L - 30, 7, F.mittel, 2.5);
    s += streifen(x0 + 8, T + 4, b.s);
    const cx = x0 + L*(b.tx || (b.t === "haub" ? 0.4 : 0.52));
    const o = oben(b, cx, T, L);
    return s + o.s + zusatz(b, x0, L, T, o, cx);
  }
  function rad(b){
    const L = b.L || 160, x0 = (240 - L)/2 - Math.max(0, (b.g || 0) - 40)*0.4, n = b.n || 4, w = b.w || "btr", rr = b.r || (w === "auto" || w === "pick" || w === "van" ? 8.5 : 10);
    const h = b.h || ({btr:16, box:22, mrap:30, imv:20, auto:18, pick:18, van:24, bus:30}[w] || 18), T = G - 2*rr - 2 - h + (w === "btr" ? 6 : 0);
    let s = "", unten = G - rr - 2;
    if(w === "btr") s += poly([[x0 + 3, unten + 2], [x0 - 2, T + 7], [x0 + 4, T], [x0 + L - 24, T], [x0 + L + 4, T + 11], [x0 + L - 1, unten + 2]], F.hell);
    else if(w === "box") s += poly([[x0, unten], [x0, T], [x0 + L - 16, T], [x0 + L + 2, T + 9], [x0 + L + 2, unten]], F.hell);
    else if(w === "mrap"){ s += poly([[x0, unten], [x0, T], [x0 + L - 30, T], [x0 + L - 14, T + 2], [x0 + L, T + 17], [x0 + L + 2, unten]], F.hell) +
      rect(x0 + L - 28, T + 5, 13, 10, F.glas, 1) + rect(x0 + L - 12, T + 9, 7, 9, F.glas, 1) + poly([[x0 + 12, unten], [x0 + L - 12, unten], [x0 + L/2, unten + 5]], F.mittel); }
    else if(w === "imv"){ s += poly([[x0, unten], [x0, T + 3], [x0 + 6, T], [x0 + L - 40, T], [x0 + L - 24, T + 11], [x0 + L + 2, T + 13], [x0 + L + 2, unten]], F.hell) +
      rect(x0 + L - 52, T + 3, 12, 8, F.glas, 1) + poly([[x0 + L - 38, T + 3], [x0 + L - 28, T + 3], [x0 + L - 23, T + 10], [x0 + L - 38, T + 10]], F.glas); }
    else if(w === "auto" || w === "pick"){ const kab = w === "pick" ? x0 + L*0.42 : x0 + 8;
      s += poly([[x0, unten], [x0, T + 9], [x0 + L - 16, T + 9], [x0 + L + 2, T + 12], [x0 + L + 2, unten]], F.hell) +
        poly([[kab, T + 9], [kab + 4, T], [x0 + L - 36, T], [x0 + L - 22, T + 9]], F.hell) + poly([[kab + 6, T + 2], [x0 + L - 37, T + 2], [x0 + L - 27, T + 8], [kab + 5, T + 8]], F.glas); }
    else if(w === "van" || w === "bus"){ s += rect(x0, T, L + 2, unten - T, F.hell, 5);
      for(let x = x0 + 8; x < x0 + L - 20; x += 18) s += rect(x, T + 4, 13, 8, F.glas, 1);
      s += rect(x0 + L - 14, T + 4, 13, 9, F.glas, 1); }
    s += glanz(x0 + 6, x0 + L*0.55, T + 1.6) + streifen(x0 + 8, (T + unten)/2 - 2, b.s) + raeder(achsen(x0, L, n, rr), rr);
    const cx = x0 + L*(b.tx || 0.55), o = oben(b, cx, T, L);
    return s + o.s + zusatz(b, x0, L, T, o, cx);
  }
  function lkw(b){
    const L = b.L || 180, x0 = (240 - L)/2, x1 = x0 + L, n = b.n || 3, rr = b.r || 9.5, k = b.k || "n", a = b.a || "plane";
    let s = rect(x0, G - 2*rr - 3, L, 5, F.dunkel), kab;
    if(a === "sattel"){ // Zugmaschine rechts, Auflieger links
      const zx = x1 - 56; s += rect(x0, G - 2*rr - 6, zx - x0 - 4, 5, F.mittel) + poly([[zx - 4, G - 2*rr - 6], [zx + 6, G - 2*rr - 12], [zx + 10, G - 2*rr - 3]], F.mittel);
      s += raeder([x0 + 14, x0 + 34, x0 + 54, zx + 8, zx + 28, x1 - 12], rr);
      return s + rect(x1 - 34, G - 2*rr - 34, 34, 31, F.hell, 3) + rect(x1 - 16, G - 2*rr - 30, 14, 12, F.glas, 1); }
    if(k === "f" || k === "p"){ kab = x1 - 32; s += rect(kab, G - 2*rr - 34, 32, 31, k === "p" ? F.mittel : F.hell, 3) + rect(x1 - 15, G - 2*rr - 30, 13, 11, F.glas, 1);
      if(k === "p") s += strich(kab + 3, G - 2*rr - 18, x1 - 3, G - 2*rr - 18, 0.8, F.linie); }
    else { kab = x1 - 46; s += poly([[x1 - 18, G - 2*rr - 3], [x1 - 18, G - 2*rr - 22], [x1 + 1, G - 2*rr - 19], [x1 + 2, G - 2*rr - 3]], F.hell) +
      rect(kab, G - 2*rr - 36, 29, 33, F.hell, 3) + rect(kab + 15, G - 2*rr - 32, 12, 11, F.glas, 1); }
    const bx = x0 + 1, bw = kab - bx - 3, by = G - 2*rr - 3, T = by;
    s += streifen(x1 - 28, by - 9, b.s);
    if(a === "plane") s += rect(bx, by - 28, bw, 28, F.mittel, 4) + [1, 2, 3].map(i=>strich(bx + i*bw/4, by - 27, bx + i*bw/4, by - 1, 0.6, F.linie)).join("");
    else if(a === "tank") s += rect(bx + 2, by - 22, bw - 4, 21, F.hell, 10) + strich(bx + 10, by - 11, bx + bw - 10, by - 11, 0.6, F.linie);
    else if(a === "koffer") s += rect(bx, by - 32, bw, 32, F.hell, 2) + strich(bx + bw*0.3, by - 30, bx + bw*0.3, by - 2, 0.7, F.linie);
    else if(a === "kran") s += rect(bx, by - 8, bw, 8, F.mittel) + strich(bx + 8, by - 8, kab + 18, by - 44, 3.4, F.mittel) + strich(kab + 18, by - 44, kab + 18, by - 22, 0.8, F.linie);
    else if(a === "werfer") s += dreh(8, bx + bw - 4, by - 4, rect(bx - 2, by - 20, bw + 4, 15, F.mittel, 1.5) +
      Array.from({length:4}, (_, i)=>strich(bx, by - 17 + i*3.2, bx + bw, by - 17 + i*3.2, 0.6, F.linie)).join(""));
    else if(a === "rak") s += rect(bx, by - 6, bw, 6, F.mittel) + pfad(`M${r1(bx - 6)} ${r1(by - 14)} L${r1(bx + 6)} ${r1(by - 20)} L${r1(bx + bw)} ${r1(by - 20)} L${r1(bx + bw)} ${r1(by - 8)} L${r1(bx + 6)} ${r1(by - 8)} Z`, F.hell);
    else if(a === "fla") s += rect(bx, by - 8, bw, 8, F.mittel) + dreh(50, bx + bw - 6, by - 8, Array.from({length:b.nr || 4}, (_, i)=>rect(bx + bw - 6 - Math.min(bw*0.55, 56), by - 13 - i*5.5, Math.min(bw*0.55, 56), 4.8, i % 2 ? F.hell : F.mittel, 2.4)).join(""));
    else if(a === "radar") s += rect(bx, by - 10, bw, 10, F.mittel) + strich(bx + bw/2, by - 10, bx + bw/2, by - 22, 2.4, F.mittel) + rect(bx + bw/2 - 18, by - 52, 36, 30, F.hell, 2) +
      [1, 2, 3, 4].map(i=>strich(bx + bw/2 - 17, by - 52 + i*6, bx + bw/2 + 17, by - 52 + i*6, 0.6, F.linie)).join("");
    else if(a === "schuessel") s += rect(bx, by - 24, bw, 24, F.hell, 2) + strich(bx + bw*0.5, by - 24, bx + bw*0.5, by - 38, 2.2, F.mittel) + ellipse(bx + bw*0.5, by - 48, 5, 11, F.hell);
    else if(a === "mast") s += rect(bx, by - 26, bw, 26, F.hell, 2) + strich(bx + 10, by - 26, bx + 10, by - 64, 1.8, F.mittel) + strich(bx + 3, by - 60, bx + 17, by - 60, 1.2, F.mittel) + strich(bx + 5, by - 54, bx + 15, by - 54, 1, F.mittel);
    else if(a === "haub") s += rect(bx + 6, by - 14, bw - 6, 14, F.mittel, 2) + rohr(bx + bw*0.55, by - 12, b.g || 70, b.gw || 3.4, b.gx || 10, -1) + poly([[bx + 2, by], [bx - 8, G - 2], [bx - 2, G - 2], [bx + 8, by]], F.mittel);
    else if(a === "bus") s += rect(bx, by - 32, bw + 34, 32, F.hell, 4) + [0, 1, 2, 3].map(i=>rect(bx + 6 + i*((bw - 8)/4), by - 27, (bw - 8)/4 - 4, 10, F.glas, 1)).join("");
    else if(a === "leer") s += rect(bx, by - 6, bw, 6, F.mittel);
    s += raeder((n === 2 ? [x0 + rr + 8, x1 - rr - 10] : n === 3 ? [x0 + rr + 6, x0 + 3*rr + 9, x1 - rr - 10] : [x0 + rr + 6, x0 + 3*rr + 9, x1 - 3*rr - 13, x1 - rr - 10]), rr);
    const f = " " + (b.f || "") + " ";
    if(f.includes(" kran ")) s += strich(kab - 6, T - 6, bx + 10, T - 40, 3, F.mittel);
    if(f.includes(" bruecke ")) s += pfad(`M${r1(bx - 6)} ${r1(by - 10)} L${r1(bx + bw*0.55)} ${r1(by - 40)} L${r1(kab + 30)} ${r1(by - 14)} Z`, F.mittel);
    if(f.includes(" flak ")) s += rect(bx + bw*0.35, by - 14, 16, 8, F.mittel, 2) + rohr(bx + bw*0.35 + 14, by - 12, 26, 1.8, 20, 1) + rohr(bx + bw*0.35 + 14, by - 9, 26, 1.8, 20, 1);
    return s;
  }
  function geschuetz(b){
    const g = b.g || 80, x = 132, s0 = poly([[x - 6, G - 16], [x - 90, G - 2], [x - 84, G - 1], [x + 2, G - 10]], F.mittel);
    return s0 + (b.t === "schild" ? rect(x - 4, G - 40, 6, 26, F.hell, 1) : "") + rect(x - 12, G - 32, 26, 10, F.mittel, 3) +
      rohr(x + 10, G - 27, g, b.gw || 3.2, b.gx || 12, 1) + raeder([x], 12);
  }
  function zweirad(b){
    const a = b.a || "motorrad";
    if(a === "motorrad") return raeder([86, 156], 13) + poly([[90, G - 18], [112, G - 34], [138, G - 34], [152, G - 22], [140, G - 18]], F.hell) + strich(152, G - 13, 146, G - 42, 2.2, F.mittel) + strich(140, G - 44, 152, G - 44, 2, F.mittel);
    if(a === "quad") return raeder([84, 160], 12) + poly([[74, G - 22], [80, G - 34], [168, G - 34], [176, G - 22]], F.hell) + rect(110, G - 44, 26, 10, F.mittel, 3) + strich(150, G - 34, 146, G - 50, 2, F.mittel);
    if(a === "golf") return raeder([82, 162], 10) + rect(66, G - 30, 112, 14, F.hell, 4) + strich(80, G - 30, 84, G - 66, 2, F.mittel) + strich(156, G - 30, 150, G - 66, 2, F.mittel) + rect(76, G - 70, 86, 5, F.mittel, 2);
    return raeder([76, 166], 14) + poly([[64, G - 24], [72, G - 38], [176, G - 34], [180, G - 22]], F.mittel) +
      strich(78, G - 36, 96, G - 64, 2.6, F.hell) + strich(96, G - 64, 144, G - 64, 2.6, F.hell) + strich(144, G - 64, 164, G - 34, 2.6, F.hell);
  }
  function roboter(b){
    const L = b.L || 110, x0 = (240 - L)/2, T = G - 32;
    let s = rect(x0, G - 18, L, 16, F.dunkel, 8) + (AUS ? "" : [0, 1, 2, 3].map(i=>kreis(x0 + 14 + i*(L - 28)/3, G - 10, 6, F.rad)).join("")) + rect(x0 + 4, T, L - 8, 14, F.hell, 3) + streifen(x0 + 10, T + 5, b.s);
    if(b.t === "stand") s += rect(x0 + L/2 - 8, T - 9, 16, 9, F.mittel, 2) + rohr(x0 + L/2 + 6, T - 5, b.g || 26, 1.8, 2, 1);
    if(b.a === "last") s += rect(x0 + 8, T - 10, L - 16, 10, F.mittel, 1);
    return s;
  }
  function zug(b){
    let s = "";
    [[14, 116], [124, 226]].forEach(([a, e], i)=>{ s += rect(a, G - 48, e - a, 34, F.hell, 2) + raeder([a + 12, a + 28, e - 28, e - 12], 6) + rect(a + 6, G - 44, e - a - 12, 6, F.mittel);
      if(i === 1) s += rect(a + 34, G - 60, 30, 12, F.mittel, 2) + rohr(a + 62, G - 55, 26, 1.8, 18, 1) + rohr(a + 62, G - 52, 26, 1.8, 18, 1); });
    return s + strich(116, G - 24, 124, G - 24, 3, F.dunkel) + strich(4, G, 236, G, 1.4, F.linie);
  }

  // b: Kennwerte, seite: "ua", "ru" oder "beide" (Farbe des Seitenstreifens)
  window.FzBild = function(b, seite){
    const zeichne = b && {k:kette, r:rad, l:lkw, s:geschuetz, m:zweirad, u:roboter, z:zug}[b.c];
    if(!zeichne) return "";
    const x = Object.assign({}, b, {s:seite});
    AUS = RAND; const rand = zeichne(x); AUS = KONTUR; const kontur = zeichne(x); AUS = null;
    return `<svg viewBox="0 12 240 84" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${rand}${kontur}${zeichne(x)}</svg>`;
  };
})();
