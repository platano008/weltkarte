# Baut mitwirkende.html, kontakt.html, impressum.html aus einer gemeinsamen Vorlage.
import re, os
os.chdir(os.path.join(os.path.dirname(__file__), ".."))
blog = open("blog.html").read()
kopf = blog[blog.index('<header class="kopf">'):blog.index('</header>')+9]
menu = blog[blog.index('<div class="menu" id="menu" hidden>'):]
menu = menu[:menu.index('<div class="menu-logo">')]
logo = blog[blog.index('<div class="menu-logo">'):]
logo = logo[:logo.index('</div>')+6]
NAV = '''  <nav>
    <a href="karte.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/></svg><b>Karte</b></a>
    <span class="aus"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5.5" cy="5.5" r="2.5"/><circle cx="18.5" cy="5.5" r="2.5"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M7.5 7.5l2.5 2.5M16.5 7.5L14 10M7.5 16.5l2.5-2.5M16.5 16.5L14 14"/><rect x="10" y="10" width="4" height="4" rx="1"/></svg><b>Drohnenkarte</b><em>in Arbeit</em></span>
    <a href="blog.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8.5 11h7M8.5 14.5h7M8.5 18h4"/></svg><b>Blog</b></a>
    <span class="aus"><svg viewBox="0 0 24 24" aria-hidden="true" class="f"><path d="M21.5 4.2L2.9 11.4c-.9.4-.9 1.6.1 1.9l4.6 1.4 1.8 5.6c.3.8 1.3 1 1.9.4l2.6-2.5 4.7 3.5c.7.5 1.7.1 1.9-.7L23 5.4c.2-.9-.7-1.6-1.5-1.2zM9.8 14.6l-.4 3.6-1.3-4.3 9.6-6.3-7.9 7z"/></svg><b>Telegram</b><em>folgt</em></span>
    <a href="https://x.com/plyusmap" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true" class="f"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z"/></svg><b>Twitter</b><em data-nolang>@plyusmap</em></a>
    <a href="fahrzeuge.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 15.5h19l-2 3.5h-15z"/><path d="M5 15.5V12h11l2.5 3.5M9 12V9h5.5v3M14.5 10h7"/></svg><b>Fahrzeuge</b></a>
  </nav>
'''
menu = re.sub(r'  <nav>.*?</nav>\n', NAV, menu, flags=re.S)
V = re.search(r'\?v=(\d{12})', blog).group(1)
X = '<svg viewBox="0 0 24 24"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z"/></svg>'
TG = '<svg viewBox="0 0 24 24"><path d="M21.5 4.2L2.9 11.4c-.9.4-.9 1.6.1 1.9l4.6 1.4 1.8 5.6c.3.8 1.3 1 1.9.4l2.6-2.5 4.7 3.5c.7.5 1.7.1 1.9-.7L23 5.4c.2-.9-.7-1.6-1.5-1.2zM9.8 14.6l-.4 3.6-1.3-4.3 9.6-6.3-7.9 7z"/></svg>'
SCHWARZ = lambda w: f'<span class="schwarz"><i style="--w:{w}px"></i><em>folgt</em></span>'

def seite(datei, titel, beschr, eyebrow, h1, intro, hud, boden, inhalt, rz="-12deg"):
    fuss = "".join(f'<a href="{d}"{" class=\"an\"" if d == datei else ""}>{n}</a>' for d, n in [("mitwirkende.html","Mitwirkende"),("kontakt.html","Kontakt"),("impressum.html","Impressum")])
    html = f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#000000">
<title>{titel} · Plyus</title>
<meta name="description" content="{beschr}">
<link rel="icon" type="image/png" href="bild/favicon.png?v=2">
<link rel="apple-touch-icon" href="bild/icon-180.png?v=2">
<link rel="stylesheet" href="style.css?v={V}">
<link rel="stylesheet" href="seiten.css?v={V}">
<script src="lang.js?v={V}" defer></script>
</head>
<body>
<script>(function(){{ try{{ const c = navigator.hardwareConcurrency || 8, m = navigator.deviceMemory || 8; if(c <= 4 || m <= 4 || matchMedia("(hover:none),(pointer:coarse)").matches) document.documentElement.classList.add("lite"); }}catch(e){{}} }})();</script>
{kopf}
{menu}{logo}
</div>
<section class="sk-held" aria-hidden="false">
  <div class="sk-szene" aria-hidden="true"><div class="sk-boden" style="--rz:{rz}"><div class="sk-gitter"></div>{boden}</div></div>
  <span class="brk a" aria-hidden="true"></span><span class="brk b" aria-hidden="true"></span>
  <div class="hud" aria-hidden="true">{hud}</div>
  <div class="sk-titel"><span class="eyebrow"><i></i><span>{eyebrow}</span></span><h1>{h1}</h1><p>{intro}</p></div>
</section>
<main class="sk-inhalt">
{inhalt}
</main>
<footer class="sk-fuss">{fuss}<a href="https://x.com/plyusmap" target="_blank" rel="noopener">X / Twitter</a><span class="r">© <span id="jahr">2026</span> Plyus</span></footer>
<script src="seiten.js?v={V}"></script>
</body>
</html>
'''
    open(datei, "w").write(html)

def block(nr, titel, inhalt):
    return f'<section class="sk-block rv"><div class="sk-kopf"><span class="nr">{nr}</span><h2>{titel}</h2></div>\n{inhalt}\n</section>'

def ding(x, y, inner): return f'<div class="ding" style="--x:{x}px;--y:{y}px">{inner}</div>'
FRONT = '<svg class="front" viewBox="0 0 1800 1800"><path class="zone-r" d="M1800 0V1800H1060L1010 1600L1070 1440L990 1300L1040 1150L960 1000L1010 860L930 720L980 560L900 400L950 230L880 0Z"/><path class="zone-b" d="M0 0H830L900 230L850 400L930 560L880 720L960 860L910 1000L990 1150L940 1300L1020 1440L960 1600L1010 1800H0Z"/><path d="M880 0L950 230L900 400L980 560L930 720L1010 860L960 1000L1040 1150L990 1300L1070 1440L1010 1600L1060 1800"/><path class="ua" d="M830 0L900 230L850 400L930 560L880 720L960 860L910 1000L990 1150L940 1300L1020 1440L960 1600L1010 1800"/></svg>'

# ---------- Mitwirkende ----------
saeulen = "".join(ding(x, y, f'<span class="saeule {c}" style="--h:{h}px;--d:{d}s"></span>') for x, y, h, c, d in
    [(760,820,260,"ua",.2),(1080,760,220,"",.5),(980,960,300,"w",.8),(700,1000,180,"ua",1.1),(1160,980,240,"",1.4),(880,700,200,"w",1.7)])
seite("mitwirkende.html", "Mitwirkende", "Wer hinter Plyus steht und worauf die Lagekarte aufbaut.",
    "Plyus · Team", "Mitwirkende", "Wer an Plyus mitarbeitet und worauf die Karte aufbaut.",
    "Einheit <b>Plyus</b><br>Status <b>aktiv</b>", FRONT + saeulen,
    block("01", "Team", '''<div class="karten">
  <div class="kt"><span class="tag">Plyus</span><b>Karte &amp; Recherche</b><span class="t">Frontverlauf, Veränderungen und Einheiten – nach denselben Regeln für beide Seiten.</span></div>
  <div class="kt blau"><span class="tag">Plyus</span><b>Blog &amp; Einordnung</b><span class="t">Berichte zu den wichtigsten Veränderungen an der Front.</span></div>
  <div class="kt leer"><span class="tag">Platz frei</span><b>Name folgt</b><span class="t">Hier stehen bald weitere Mitwirkende.</span></div>
</div>''') + "\n" +
    block("02", "Grundlagen", '''<div class="sk-text"><p>Ohne diese Daten und Werkzeuge gäbe es die Karte nicht. Danke an alle, die daran mitarbeiten.</p></div>
<div class="karten">
  <div class="kt"><span class="tag">Lagedaten</span><b>ukv3</b><span class="t">Grundlage für den Frontverlauf, von uns geprüft und ergänzt.</span></div>
  <a class="kt blau" href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener"><span class="tag">Kartenkacheln</span><b>MapTiler</b><span class="t">Satellitenbilder und Kartengrundlage.</span><span class="pf">Ansehen →</span></a>
  <a class="kt weiss" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener"><span class="tag">Geodaten</span><b>OpenStreetMap</b><span class="t">Straßen, Orte und Grenzen – von Freiwilligen auf der ganzen Welt erfasst.</span><span class="pf">Ansehen →</span></a>
  <a class="kt" href="https://www.esri.com" target="_blank" rel="noopener"><span class="tag">Bilddaten</span><b>Esri</b><span class="t">Zusätzliche Satellitenbilder.</span><span class="pf">Ansehen →</span></a>
  <a class="kt blau" href="https://maplibre.org" target="_blank" rel="noopener"><span class="tag">Technik</span><b>MapLibre</b><span class="t">Die Kartenansicht im Browser, inklusive Globus.</span><span class="pf">Ansehen →</span></a>
  <a class="kt" href="https://opentopomap.org" target="_blank" rel="noopener"><span class="tag">Topografie</span><b>OpenTopoMap</b><span class="t">Topografische Karte mit Höhenlinien und Relief.</span><span class="pf">Ansehen →</span></a>
  <a class="kt weiss" href="https://github.com/spatialillusions/milsymbol" target="_blank" rel="noopener"><span class="tag">Symbole</span><b>milsymbol</b><span class="t">Zeichnet die NATO-Symbole der Einheiten.</span><span class="pf">Ansehen →</span></a>
</div>''') + "\n" +
    block("03", "Mitmachen", f'''<div class="karten"><a class="kt gross" href="https://x.com/plyusmap" target="_blank" rel="noopener"><span class="ic">{X}</span><span class="mitte"><span class="tag">Hinweise, Korrekturen, Quellen</span><b>Hilf mit.</b><span class="t">Du hast eine Veränderung an der Front gesehen oder einen Fehler entdeckt? Schreib uns.</span></span><span class="pf" data-nolang>@plyusmap →</span></a></div>'''),
    rz="-14deg")

# ---------- Kontakt ----------
ringe = "".join(ding(x, y, f'<span class="punkt {c}"></span><span class="ring {c}" style="--r:{r}px;--d:{d}s"></span><span class="ring {c}" style="--r:{r}px;--d:{d+1.5}s"></span>') for x, y, r, c, d in
    [(900,880,110,"",0),(760,1020,80,"ua",.7),(1080,980,90,"",1.3),(820,760,70,"ua",2.0)])
seite("kontakt.html", "Kontakt", "So erreichst du Plyus.",
    "Plyus · Verbindung", "Kontakt", "Hinweise zur Lage, Korrekturen oder Fragen – hier erreichst du uns.",
    "Kanal <b>offen</b><br>Antwort <b>über X</b>", ringe,
    block("01", "Kanäle", f'''<div class="karten">
  <a class="kt gross" href="https://x.com/plyusmap" target="_blank" rel="noopener"><span class="ic">{X}</span><span class="mitte"><span class="tag">X / Twitter</span><b data-nolang>@plyusmap</b><span class="t">Am schnellsten erreichst du uns per Nachricht auf X.</span></span><span class="pf">Schreiben →</span></a>
  <div class="kt leer"><span class="tag">Telegram</span><b>Folgt</b><span class="t">Der Kanal kommt bald.</span></div>
  <a class="kt weiss" href="mailto:plyusmapping@gmail.com"><span class="tag">E-Mail</span><b data-nolang>plyusmapping@gmail.com</b><span class="t">Für längere Hinweise, Quellen und Anfragen.</span><span class="pf">Mail schreiben →</span></a>
</div>''') + "\n" +
    block("02", "Was uns hilft", '''<div class="sk-text"><p>Du hast eine Veränderung an der Front gesehen? Mit diesen Angaben können wir sie am schnellsten prüfen:</p></div>
<ol class="liste">
  <li><span>01</span>Ort – Ortschaft oder Koordinaten.</li>
  <li><span>02</span>Zeit – wann es passiert ist oder aufgenommen wurde.</li>
  <li><span>03</span>Quelle – Link zum Video, Foto oder Beitrag.</li>
  <li><span>04</span>Was sich verändert hat – Vorstoß, Rückzug oder Grauzone.</li>
</ol>''') + "\n" +
    block("03", "Keine Seite. Nur die Lage.", '''<div class="sk-text"><p>Jeder Hinweis wird nach denselben Regeln geprüft, egal von welcher Seite er kommt. Was nicht sicher belegt ist, bleibt Grauzone.</p></div>'''),
    rz="-6deg")

# ---------- Impressum ----------
scan = '<div class="scan"></div>' + ding(940, 900, '<span class="punkt"></span><span class="ring" style="--r:90px"></span>')
seite("impressum.html", "Impressum", "Impressum und rechtliche Hinweise von Plyus.",
    "Plyus · Dokument", "Impressum", "Rechtliche Angaben und Hinweise zu dieser Website.",
    "Dokument <b>Impressum</b><br>Status <b>in Bearbeitung</b>", FRONT + scan,
    block("01", "Angaben gemäß § 5 DDG", f'''<dl class="angaben">
  <dt>Betreiber</dt><dd>{SCHWARZ(220)}</dd>
  <dt>Anschrift</dt><dd>{SCHWARZ(280)}</dd>
  <dt>E-Mail</dt><dd><a href="mailto:plyusmapping@gmail.com" data-nolang>plyusmapping@gmail.com</a></dd>
  <dt>X / Twitter</dt><dd><a href="https://x.com/plyusmap" target="_blank" rel="noopener" data-nolang>@plyusmap</a></dd>
  <dt>Verantwortlich für den Inhalt</dt><dd>{SCHWARZ(220)}</dd>
</dl>''') + "\n" +
    block("02", "Haftung", '''<div class="sk-text recht">
<h3>Haftung für Inhalte</h3>
<p>Die Inhalte dieser Website wurden mit großer Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Die Lagekarte zeigt eine Einschätzung auf Grundlage öffentlich verfügbarer Informationen und kann von der tatsächlichen Lage abweichen.</p>
<h3>Haftung für Links</h3>
<p>Diese Website enthält Links zu externen Websites, auf deren Inhalte wir keinen Einfluss haben. Für diese fremden Inhalte ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Werden uns Rechtsverletzungen bekannt, entfernen wir die betreffenden Links umgehend.</p>
<h3>Urheberrecht</h3>
<p>Die Inhalte und Grafiken auf dieser Website unterliegen dem Urheberrecht. Kartendaten und Bilder stammen von den jeweils genannten Quellen und unterliegen deren Lizenzen.</p>
</div>''') + "\n" +
    block("03", "Quellen", '''<div class="sk-text"><p>Lagedaten: ukv3 · Karten: © <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a>, © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap-Mitwirkende</a> · Bilddaten: Esri · Topografische Karte: © <a href="https://opentopomap.org" target="_blank" rel="noopener">OpenTopoMap</a> (CC-BY-SA) · NATO-Symbole: milsymbol</p></div>''') + "\n" +
    block("04", "Datenschutz in Kürze", '''<div class="sk-text recht">
<p>Diese Website wird über GitHub Pages bereitgestellt. Beim Aufruf verarbeitet der Anbieter technisch notwendige Daten wie deine IP-Adresse.</p>
<p>Für Karten und Programmbibliotheken werden Inhalte von MapTiler, Esri, OpenFreeMap, OpenTopoMap, Amazon Web Services (Höhendaten) und jsDelivr geladen; die Fahrzeug-Steckbriefe laden Fotos und Lizenzangaben von Wikipedia und Wikimedia Commons (Wikimedia Foundation). Dabei wird deine IP-Adresse an diese Anbieter übertragen.</p>
<p>Wir setzen keine Cookies und keine Tracking-Werkzeuge ein. Deine Sprachwahl wird nur lokal in deinem Browser gespeichert.</p>
<p>Eine ausführliche Datenschutzerklärung folgt.</p>
</div>'''),
    rz="-18deg")
print("ok", V)
