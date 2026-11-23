/* Plyus · Sprache Deutsch / Englisch
   Die Seiten sind auf Deutsch geschrieben. Ist Englisch gewählt, ersetzt dieses Skript alle bekannten
   Texte (auch später nachgeladene) durch die englische Fassung. Zurück auf Deutsch stellt es die Originale wieder her.
   Wahl wird im Browser gemerkt (localStorage "plyus-lang"); ohne Wahl entscheidet die Browsersprache. */
(function(){
  const W = {
    // Menü, Kopf, allgemein
    "Karte":"Map", "Drohnenkarte":"Drone map", "in Arbeit":"in progress", "In Arbeit":"In progress", "folgt":"soon",
    "Mitwirkende":"Contributors", "Kontakt":"Contact", "Impressum":"Legal notice", "Menü öffnen":"Open menu", "Menü schließen":"Close menu",
    "Nach unten":"Scroll down", "Sprache":"Language", "Zur Startseite":"Back to home", "Schließen":"Close",
    // Startseite
    "Sektor":"Sector", "Russo-Ukrainian War":"Russo-Ukrainian War", "Lagedaten":"Map data", "Veränderungen":"Changes", "Lagekarte Ukraine":"Ukraine situation map",
    "Zur Lagekarte":"Open the map", "Beispielhafte Darstellung":"Illustrative example", "03 · Berichte":"03 · Reports", "Berichte":"Reports",
    "Einordnung":"Context", "statt Eilmeldung.":"not breaking news.",
    "Hintergründe zu den wichtigsten Veränderungen: was passiert ist, warum es zählt und was als Nächstes kommen kann.":"Background on the most important changes: what happened, why it matters and what could come next.",
    "Alle Berichte":"All reports", "Akte in Vorbereitung":"File in preparation", "In Vorbereitung":"In preparation",
    "Jedes Update direkt aufs Handy":"Every update straight to your phone", "Link folgt":"Link coming soon", "Karten, Videos und Kurzlagen":"Maps, videos and quick updates",
    "Stand":"As of", "letzte 14 Tage":"last 14 days", "Fläche verändert":"Area changed", "Erfasste Verbände":"Units tracked", "auf der Karte":"on the map",
    "Frontverlauf":"Front line", "Neueste Veränderungen":"Latest changes", "Alle auf der Karte →":"All on the map →", "Auf der Karte →":"On the map →",
    "Russischer Geländegewinn":"Russian territorial gain", "Ukrainischer Geländegewinn":"Ukrainian territorial gain", "Neue Grauzone":"New grey zone",
    "Haltung":"Our stance", "Keine Seite.":"No side.", "Nur die Lage.":"Just the situation.",
    "Plyus ergreift keine Partei. Jede Veränderung wird nach denselben Regeln erfasst, egal auf welcher Seite der Front sie passiert. Was nicht sicher belegt ist, bleibt Grauzone.":"Plyus takes no side. Every change is recorded by the same rules, no matter which side of the front it happens on. Anything not reliably confirmed stays grey zone.",
    "Lagekarte Ukraine. Alle Angaben ohne Gewähr, Darstellung kann von der tatsächlichen Lage abweichen.":"Ukraine situation map. All information without guarantee; the map may differ from the actual situation.",
    "Quellen":"Sources", "Lagedaten:":"Map data:", "· Karten: ©":"· Maps: ©", "OpenStreetMap-Mitwirkende":"OpenStreetMap contributors",
    "· NATO-Symbole: milsymbol":"· NATO symbols: milsymbol", "Lagegrafik:":"Map graphic:",
    // Blog
    "Noch keine Beiträge.":"No posts yet.", "Die Beiträge konnten nicht geladen werden.":"The posts could not be loaded.", "Zurück":"Back", "Alle Beiträge":"All posts",
    "Zurück zur Übersicht":"Back to overview", "Beitrag nicht gefunden.":"Post not found.",
    // Karte
    "Karte lädt":"Loading map", "Lädt …":"Loading …", "Neu":"New", "Log":"Log", "Ohne Datum":"No date", "Karte wird geladen …":"Loading map …", "Satellit":"Satellite", "Gelände":"Terrain", "Schlicht":"Minimal", "Globus":"Globe", "Flach":"Flat",
    "Symbole":"Symbols", "Linien":"Lines", "Linien & Pfeile":"Lines & arrows", "Flächen":"Areas", "Ukrainisches Gebiet":"Ukrainian territory", "Grauzone":"Grey zone",
    "Basen":"Bases", "Russisch kontrolliert":"Russian-controlled", "Großverbände":"Formations", "Verbände":"Units",
    "Freund":"Friendly", "Feind":"Hostile", "Unbekannt":"Unknown", "- - - vermutet":"- - - assumed",
    "Russischer Gewinn":"Russian gain", "Ukrainischer Gewinn":"Ukrainian gain", "Gewinn Russland":"Russian gain", "Gewinn":"Gain",
    "Koordinaten: Maus über die Karte":"Coordinates: hover over the map", "Plyus – neueste Veränderungen":"Plyus – latest changes",
    "Aktueller Stand":"Current state", "Aktuell":"Current", "Älterer Stand":"Older state", "Kartenmenüs":"Map menus",
    "Ansicht: Satellit, Karte, Gelände":"View: satellite, map, terrain", "Ansicht":"View",
    "Werkzeuge: Lineal, Fläche, Radius, Koordinate":"Tools: ruler, area, radius, coordinate", "Werkzeuge":"Tools",
    "Verlauf: zwischen Updates spulen":"History: step between updates", "Verlauf":"History", "Leiste ausblenden":"Hide panel", "Leiste einblenden":"Show panel",
    "Liste ein- oder ausklappen":"Expand or collapse list", "Einträge durchsuchen":"Search entries", "Suchen …":"Search …", "Nichts gefunden.":"Nothing found.",
    "Vorheriges Update":"Previous update", "Nächstes Update":"Next update", "Verlauf abspielen":"Play history", "Stand wählen":"Choose state",
    "Lineal":"Ruler", "Fläche":"Area", "Radius":"Radius", "Koordinate":"Coordinate", "Alle Messungen löschen":"Clear all measurements",
    "Link kopieren":"Copy link", "Link kopiert":"Link copied", "Link:":"Link:", "Hinzoomen":"Zoom in",
    "Dieser Stand konnte nicht geladen werden.":"This state could not be loaded.",
    "In diesem Stand gibt es noch keine eingetragenen Veränderungen.":"There are no recorded changes in this state yet.",
    "Veränderung":"Change", "Weitere Veränderungen":"More changes", "keine Frontänderung":"no change to the front", "neue Veränderungen":"new changes",
    "Ganze Lage auf der Karte":"Whole situation on the map", "Wochenrückblick":"Weekly review", "Frontlinie angepasst":"Front line adjusted",
    "Neu Grauzone":"New grey zone", "Neu russisch kontrolliert":"Newly Russian-controlled", "Neu ukrainisch kontrolliert":"Newly Ukrainian-controlled",
    "Eigene / verbündet":"Own / allied", "Russland":"Russia", "Gebiet":"Area", "Linie":"Line", "Pfeil":"Arrow", "Stellung":"Position", "Treffer":"Hit", "Bewegung":"Movement",
    "MapTiler-Kontingent aufgebraucht – Ersatzkarte aktiv":"MapTiler quota used up – fallback map active", "MapTiler-Schlüssel abgelehnt – Ersatzkarte aktiv":"MapTiler key rejected – fallback map active",
    "kein Video":"no video", "Farbschema:":"Colour scheme:",
    // Truppengattungen und Größen
    "Infanterie":"Infantry", "Mechanisierte Infanterie":"Mechanised infantry", "Motorisierte Infanterie":"Motorised infantry", "Marineinfanterie":"Naval infantry",
    "Panzer":"Armour", "Artillerie":"Artillery", "Raketenartillerie":"Rocket artillery", "Aufklärung":"Reconnaissance", "Pioniere":"Engineers", "Fernmelder":"Signals",
    "Flugabwehr":"Air defence", "Luftverteidigung":"Air defence", "Versorgung":"Supply", "Sanität":"Medical", "Stab":"Headquarters", "Drohne":"Drone", "Drohnen (UAV)":"Drones (UAV)",
    "Hubschrauber":"Helicopter", "Flugzeug":"Aircraft", "Schiff":"Ship", "Rakete":"Missile", "Fahrzeug":"Vehicle",
    "Zug":"Platoon", "Kompanie":"Company", "Bataillon":"Battalion", "Regiment":"Regiment", "Brigade":"Brigade", "Division":"Division", "Korps":"Corps", "Armee":"Army",
    "Beispiel: Symbol – Freund · Mechanisierte Infanterie · Brigade":"Example: symbol – friendly · mechanised infantry · brigade",
    "Feind · Infanterie · Bataillon":"Hostile · infantry · battalion",
    // Unterseiten: Mitwirkende, Kontakt, Impressum
    "Für längere Hinweise, Quellen und Anfragen.":"For longer tips, sources and enquiries.",
    "Mail schreiben →":"Send email →",
    "Topografie":"Topography",
    "Topografische Karte mit Höhenlinien und Relief.":"Topographic map with contour lines and relief.",
    "· Bilddaten: Esri · Topografische Karte: ©":"· Imagery: Esri · Topographic map: ©",
    "(CC-BY-SA) · NATO-Symbole: milsymbol":"(CC-BY-SA) · NATO symbols: milsymbol",
    "Mitwirkende · Plyus":"Contributors · Plyus",
    "Kontakt · Plyus":"Contact · Plyus",
    "Impressum · Plyus":"Legal notice · Plyus",
    "Einheit":"Unit",
    "Status":"Status",
    "aktiv":"active",
    "Plyus · Team":"Plyus · Team",
    "Wer an Plyus mitarbeitet und worauf die Karte aufbaut.":"Who works on Plyus and what the map is built on.",
    "Team":"Team",
    "Karte & Recherche":"Map & research",
    "Frontverlauf, Veränderungen und Einheiten – nach denselben Regeln für beide Seiten.":"Front line, changes and units – by the same rules for both sides.",
    "Blog & Einordnung":"Blog & context",
    "Berichte zu den wichtigsten Veränderungen an der Front.":"Reports on the most important changes at the front.",
    "Platz frei":"Open spot",
    "Name folgt":"Name coming soon",
    "Hier stehen bald weitere Mitwirkende.":"More contributors will be listed here soon.",
    "Grundlagen":"Foundations",
    "Ohne diese Daten und Werkzeuge gäbe es die Karte nicht. Danke an alle, die daran mitarbeiten.":"Without these data and tools the map would not exist. Thanks to everyone who works on them.",
    "Grundlage für den Frontverlauf, von uns geprüft und ergänzt.":"Basis for the front line, checked and extended by us.",
    "Kartenkacheln":"Map tiles",
    "Satellitenbilder und Kartengrundlage.":"Satellite imagery and base map.",
    "Ansehen →":"View →",
    "Geodaten":"Geodata",
    "Straßen, Orte und Grenzen – von Freiwilligen auf der ganzen Welt erfasst.":"Roads, places and borders – mapped by volunteers around the world.",
    "Bilddaten":"Imagery",
    "Zusätzliche Satellitenbilder.":"Additional satellite imagery.",
    "Technik":"Technology",
    "Die Kartenansicht im Browser, inklusive Globus.":"The map view in your browser, including the globe.",
    "Zeichnet die NATO-Symbole der Einheiten.":"Draws the NATO symbols of the units.",
    "Mitmachen":"Get involved",
    "Hinweise, Korrekturen, Quellen":"Tips, corrections, sources",
    "Hilf mit.":"Help out.",
    "Du hast eine Veränderung an der Front gesehen oder einen Fehler entdeckt? Schreib uns.":"Spotted a change at the front or found a mistake? Message us.",
    "Kanal":"Channel",
    "offen":"open",
    "Antwort":"Reply",
    "über X":"via X",
    "Plyus · Verbindung":"Plyus · Connection",
    "Hinweise zur Lage, Korrekturen oder Fragen – hier erreichst du uns.":"Tips on the situation, corrections or questions – this is how to reach us.",
    "Kanäle":"Channels",
    "Am schnellsten erreichst du uns per Nachricht auf X.":"The fastest way to reach us is a message on X.",
    "Schreiben →":"Message →",
    "Folgt":"Soon",
    "Der Kanal kommt bald.":"The channel is coming soon.",
    "E-Mail":"Email",
    "Eine Adresse kommt bald.":"An address is coming soon.",
    "Was uns hilft":"What helps us",
    "Du hast eine Veränderung an der Front gesehen? Mit diesen Angaben können wir sie am schnellsten prüfen:":"Spotted a change at the front? With these details we can check it fastest:",
    "Ort – Ortschaft oder Koordinaten.":"Place – town or coordinates.",
    "Zeit – wann es passiert ist oder aufgenommen wurde.":"Time – when it happened or was recorded.",
    "Quelle – Link zum Video, Foto oder Beitrag.":"Source – link to the video, photo or post.",
    "Was sich verändert hat – Vorstoß, Rückzug oder Grauzone.":"What changed – advance, withdrawal or grey zone.",
    "Keine Seite. Nur die Lage.":"No side. Just the situation.",
    "Jeder Hinweis wird nach denselben Regeln geprüft, egal von welcher Seite er kommt. Was nicht sicher belegt ist, bleibt Grauzone.":"Every tip is checked by the same rules, no matter which side it comes from. Anything not reliably confirmed stays grey zone.",
    "Dokument":"Document",
    "in Bearbeitung":"in progress",
    "Plyus · Dokument":"Plyus · Document",
    "Rechtliche Angaben und Hinweise zu dieser Website.":"Legal information and notes about this website.",
    "Angaben gemäß § 5 DDG":"Information pursuant to § 5 DDG",
    "Betreiber":"Operator",
    "Anschrift":"Address",
    "Verantwortlich für den Inhalt":"Responsible for content",
    "Haftung":"Liability",
    "Haftung für Inhalte":"Liability for content",
    "Die Inhalte dieser Website wurden mit großer Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Die Lagekarte zeigt eine Einschätzung auf Grundlage öffentlich verfügbarer Informationen und kann von der tatsächlichen Lage abweichen.":"The content of this website was created with great care. However, we cannot guarantee that it is correct, complete or up to date. The situation map shows an assessment based on publicly available information and may differ from the actual situation.",
    "Haftung für Links":"Liability for links",
    "Diese Website enthält Links zu externen Websites, auf deren Inhalte wir keinen Einfluss haben. Für diese fremden Inhalte ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Werden uns Rechtsverletzungen bekannt, entfernen wir die betreffenden Links umgehend.":"This website contains links to external websites whose content we have no control over. The respective provider or operator is always responsible for that content. If we become aware of any legal violations, we will remove the links immediately.",
    "Urheberrecht":"Copyright",
    "Die Inhalte und Grafiken auf dieser Website unterliegen dem Urheberrecht. Kartendaten und Bilder stammen von den jeweils genannten Quellen und unterliegen deren Lizenzen.":"The content and graphics on this website are protected by copyright. Map data and images come from the sources named and are subject to their licences.",
    "Lagedaten: ukv3 · Karten: ©":"Map data: ukv3 · Maps: ©",
    "· Bilddaten: Esri · NATO-Symbole: milsymbol":"· Imagery: Esri · NATO symbols: milsymbol",
    "Datenschutz in Kürze":"Privacy in brief",
    "Diese Website wird über GitHub Pages bereitgestellt. Beim Aufruf verarbeitet der Anbieter technisch notwendige Daten wie deine IP-Adresse.":"This website is hosted on GitHub Pages. When you visit, the provider processes technically necessary data such as your IP address.",
    "Für Karten und Programmbibliotheken werden Inhalte von MapTiler, Esri, OpenFreeMap, OpenTopoMap, Amazon Web Services (Höhendaten) und jsDelivr geladen. Dabei wird deine IP-Adresse an diese Anbieter übertragen.":"Content for maps and code libraries is loaded from MapTiler, Esri, OpenFreeMap, OpenTopoMap, Amazon Web Services (elevation data) and jsDelivr. Your IP address is transmitted to these providers.",
    "Wir setzen keine Cookies und keine Tracking-Werkzeuge ein. Deine Sprachwahl wird nur lokal in deinem Browser gespeichert.":"We use no cookies and no tracking tools. Your language choice is only stored locally in your browser.",
    "Eine ausführliche Datenschutzerklärung folgt.":"A full privacy policy will follow.",
    // Seitentitel
    "Blog · Plyus":"Blog · Plyus"
  };
  const MUSTER = [
    [/^(\d+) Veränderungen$/, "$1 changes"], [/^Veränderungen (\d+)T$/, "Changes $1d"], [/^BERICHT (\d+)$/, "REPORT $1"],
    [/(\d)° O\b/g, "$1° E"], [/^Lage: /, "Data: "], [/^(.+)-Richtung\b/, "$1 axis"], [/^Bild (\d+) von (\d+)$/, "Image $1 of $2"],
    [/^Lagekarte Ukraine · Stand (.*)$/, "Ukraine situation map · as of $1"], [/ km² Grauzone/, " km² grey zone"], [/^(.*) · Frontänderungen$/, "$1 · front changes"],
    [/^Gebiet (.+)$/, "Area $1"], [/^Gewinn (.+)$/, "Gain $1"],
    [/^(.*) · MilX-Import (.*)$/, "$1 · MilX import $2"], [/^(.*) · Frontlinie angepasst$/, "$1 · front line adjusted"],
    [/^(Russischer|Ukrainischer) Gewinn (.*)$/, (m, a, b)=>(a === "Russischer" ? "Russian" : "Ukrainian") + " gain " + b],
    [/^vor (\d+) Tagen$/, "$1 days ago"], [/^vor (\d+) Stunden$/, "$1 hours ago"], [/^gestern$/, "yesterday"], [/^heute$/, "today"]
  ];
  const ATTR = ["title", "aria-label", "placeholder", "alt"];
  const orgT = new WeakMap(), orgA = new WeakMap();
  let sprache = "de";
  try { sprache = localStorage.getItem("plyus-lang") || ((navigator.language || "de").toLowerCase().startsWith("de") ? "de" : "en"); } catch(e){}

  function uebers(t){
    const k = t.replace(/\s+/g, " ").trim(); if(!k) return null;
    if(Object.prototype.hasOwnProperty.call(W, k)) return W[k] === k ? null : t.replace(k, W[k]);
    let r = k, treffer = false;
    for(const [re, z] of MUSTER){ if(re.test(r)){ r = r.replace(re, z); treffer = true; } re.lastIndex = 0; }
    return treffer && r !== k ? t.replace(k, r) : null;
  }
  function knoten(n){
    if(n.nodeType === 3){
      const p = n.parentElement; if(!p || p.closest("script,style,[data-nolang]")) return;
      const neu = uebers(n.nodeValue); if(neu !== null && neu !== n.nodeValue){ if(!orgT.has(n)) orgT.set(n, n.nodeValue); n.nodeValue = neu; }
      return;
    }
    if(n.nodeType !== 1 || n.matches("script,style,[data-nolang]")) return;
    for(const a of ATTR){ if(!n.hasAttribute(a)) continue; const v = n.getAttribute(a), neu = uebers(v);
      if(neu !== null && neu !== v){ let m = orgA.get(n); if(!m){ m = {}; orgA.set(n, m); } if(!(a in m)) m[a] = v; n.setAttribute(a, neu); } }
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT); let c;
    while((c = w.nextNode())){ if(c.nodeType === 3) knoten(c); else for(const a of ATTR){ if(!c.hasAttribute(a)) continue; const v = c.getAttribute(a), neu = uebers(v);
      if(neu !== null && neu !== v){ let m = orgA.get(c); if(!m){ m = {}; orgA.set(c, m); } if(!(a in m)) m[a] = v; c.setAttribute(a, neu); } } }
  }
  function zurueck(){
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT); let c;
    while((c = w.nextNode())){
      if(c.nodeType === 3){ if(orgT.has(c)){ c.nodeValue = orgT.get(c); orgT.delete(c); } }
      else { const m = orgA.get(c); if(m){ for(const a in m) c.setAttribute(a, m[a]); orgA.delete(c); } }
    }
  }
  let beob = null, titelDe = document.title;
  function anwenden(){
    document.documentElement.lang = sprache;
    document.querySelectorAll("[data-sprache]").forEach(b=>b.classList.toggle("an", b.dataset.sprache === sprache));
    if(sprache === "en"){
      knoten(document.body); const t = uebers(titelDe); document.title = t || titelDe;
      if(!beob){ beob = new MutationObserver(ms=>{ if(sprache !== "en") return; for(const m of ms){
          if(m.type === "characterData") knoten(m.target);
          else if(m.type === "attributes") knoten(m.target);
          else m.addedNodes.forEach(knoten); } });
        beob.observe(document.body, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:ATTR}); }
    } else { zurueck(); document.title = titelDe; }
  }
  window.plyusSprache = (s)=>{ if(s && s !== sprache){ sprache = s; try{ localStorage.setItem("plyus-lang", s); }catch(e){} anwenden(); } return sprache; };
  document.addEventListener("click", e=>{ const b = e.target.closest("[data-sprache]"); if(b){ e.preventDefault(); window.plyusSprache(b.dataset.sprache); } });
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", anwenden); else anwenden();
})();
