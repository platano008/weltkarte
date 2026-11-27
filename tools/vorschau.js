/* Vorschaubilder für die Ansicht-Auswahl der Karte (bild/ansicht/*.jpg).
   Läuft in GitHub Actions: öffnet die echte Karte (wegen der Kartenschlüssel auf platano008.github.io),
   rendert jeden Kartenstil an einem Ort, an dem seine Eigenheit gut zu sehen ist, und speichert ihn als JPEG. */
const {chromium} = require("playwright");
const fs = require("fs");
const ORTE = {
  sat:   {center:[35.06, 48.45], zoom:10.2},   // Dnipro: Fluss, Stadt, Felder im Satellitenbild
  karte: {center:[35.06, 48.45], zoom:9.2},    // gleiche Gegend als klare Karte: Straßen, Flüsse, Ortsnamen
  topo:  {center:[34.25, 44.72], zoom:9.3},    // Krimgebirge: Schummerung und Höhenlinien
  hoehe: {center:[34.2, 44.68], zoom:11.2},    // Krimgebirge als topografische Karte
  mix:   {center:[30.53, 50.45], zoom:10.6}    // Kiew: Satellitenbild mit Kartenschicht darüber
};
(async()=>{
  const b = await chromium.launch({args:["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]});
  const p = await (await b.newContext({viewport:{width:1280, height:800}})).newPage();
  await p.goto("https://platano008.github.io/weltkarte/karte.html", {waitUntil:"load"});
  await p.waitForFunction(()=>window.Karte && window.maplibregl, null, {timeout:60000});
  fs.mkdirSync("bild/ansicht", {recursive:true});
  for(const [k, o] of Object.entries(ORTE)){
    const d = await p.evaluate(({k, o})=>new Promise(fertig=>{
      const box = document.createElement("div"); box.style.cssText = "position:fixed;left:0;top:0;width:192px;height:128px;z-index:99";
      document.body.appendChild(box);
      const s = Karte.STYLES[k], stil = typeof s.url === "function" ? s.url() : s.url;
      const m = new maplibregl.Map({container:box, style:stil, center:o.center, zoom:o.zoom, interactive:false, attributionControl:false, preserveDrawingBuffer:true, fadeDuration:0, pixelRatio:2});
      let fertigt = false;
      const ab = ()=>{ if(fertigt) return; fertigt = true; const u = m.getCanvas().toDataURL("image/jpeg", .84); m.remove(); box.remove(); fertig(u); };
      m.on("idle", ()=>setTimeout(ab, 1500)); setTimeout(ab, 45000);
    }), {k, o});
    fs.writeFileSync(`bild/ansicht/${k}.jpg`, Buffer.from(d.split(",")[1], "base64"));
    console.log(k, Math.round(d.length*0.75/1024) + " KB");
  }
  await b.close();
})();
