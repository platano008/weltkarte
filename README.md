# Plyus

Lagekarte Ukraine. 
Satellitenkarte mit Linien, Pfeilen, Flächen und NATO-Symbolen. Startet auf der Ukraine, zeigt aber die ganze Welt.

- **Startseite:** https://platano008.github.io/weltkarte/
- **Karte für alle:** https://platano008.github.io/weltkarte/karte.html
- **Bearbeiten (nur mit GitHub-Schlüssel):** https://platano008.github.io/weltkarte/editor.html

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite mit Kennzahlen und neuesten Veränderungen |
| `karte.html` | Karte für Besucher, nur ansehen |
| `editor.html` | Bearbeitungs-Seite: Linie, Pfeil, Fläche, NATO-Symbol, Speichern |
| `karte.json` | Alle Einträge auf der Karte. Der Editor schreibt diese Datei. |
| `karte.js` | Gemeinsamer Code: Kartenstile, Farbschema, Symbole |
| `style.css` | Gemeinsames Design |
| `fonts/` | Eigene Schrift „Plyus“ (Regular und Bold) |

## Bearbeiten

1. `editor.html` öffnen.
2. Unten unter **GitHub-Schlüssel** einmalig einen Fine-grained Token eintragen
   (nur Repository `weltkarte`, Berechtigung **Contents: Read and write**).
3. Zeichnen, dann **Speichern**. Nach etwa einer Minute ist die Änderung auf der Ansicht-Seite.

Der Schlüssel bleibt nur im eigenen Browser. Ohne Schlüssel kann die Editor-Seite nichts speichern.
Ungespeicherte Änderungen bleiben als Entwurf im Browser erhalten.

## NATO-Symbole

Erzeugt mit [milsymbol](https://github.com/spatialillusions/milsymbol) nach MIL-STD-2525C / APP-6.
Seite (Freund, Feind, Neutral, Unbekannt), Truppengattung, Größe, Stab und „vermutet“ sind einstellbar.

## Kartenquellen

- Satellit, Karte und Gelände: [MapTiler](https://www.maptiler.com) (Free-Plan, nicht-kommerziell, Logo und Quellenangabe Pflicht). Der Schlüssel ist auf `platano008.github.io` beschränkt.
- Ukraine (ab Zoom 7, nur Satellit): [Esri World Imagery](https://www.esri.com), Powered by Esri. Der Schlüssel in `karte.js` ist auf `platano008.github.io` beschränkt.
- Ersatz, falls MapTiler nicht antwortet: [OpenFreeMap](https://openfreemap.org), Daten © OpenStreetMap-Mitwirkende
- Kartenbibliothek: [MapLibre GL JS](https://maplibre.org)

## Lagedaten aus MilX importieren

Eine MilX-Layerdatei (`.milxly` oder `.zip`) wird in `import/lage.geojson` umgewandelt und als eigene,
schaltbare Ebene unter deinen eigenen Einträgen angezeigt:

```
python3 tools/milx2geojson.py Layer.milxly import/lage.geojson "ukv3.65"
```

Flächenfarben und Transparenz kommen aus der Datei, NATO-Symbole werden aus dem SIDC erzeugt,
Namen (z. B. „18th Army“) erscheinen ab mittlerer Zoomstufe. Eine neue Version ersetzt einfach die Datei.

## Frontlinie anpassen

Im Editor das Werkzeug **Front** wählen:

1. Fläche wählen (meist „Russisch kontrolliert“), Datum prüfen.
2. Auf die weiß gestrichelte Frontlinie tippen, wo die Änderung beginnt.
3. Den neuen Verlauf Punkt für Punkt tippen.
4. Auf die Frontlinie tippen, wo der Verlauf wieder anschließt, dann **Übernehmen**.
5. **Speichern**. Die geänderte Fläche wird in `import/lage.geojson` geschrieben.

Die Änderung wird automatisch als Gewinn oder Verlust erkannt („Richtung umkehren“ korrigiert das)
und 14 Tage lang kräftig hervorgehoben (Ebene „Veränderungen“).
Achtung: Ein neuer MilX-Import ersetzt die Datei und damit auch diese Änderungen.
