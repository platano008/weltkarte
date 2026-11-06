# Weltkarte

Satellitenkarte der ganzen Welt mit Orts- und Ländernamen und eigenen Strecken.

**Live:** https://platano008.github.io/weltkarte/

## Dateien

- `index.html` – die Seite, die Besucher sehen (nur ansehen, nichts bearbeiten)
- `linien.json` – deine Strecken und Kategorien. Wenn diese Datei geändert wird, ist die Änderung nach etwa einer Minute online.

## So ist eine Linie aufgebaut

```json
{
  "id": "l7",
  "kategorie": "zug",
  "name": "Hamburg – Kopenhagen",
  "text": "Kurze Beschreibung für das Infofenster.",
  "punkte": [[9.9937, 53.5511], [12.5683, 55.6761]]
}
```

- `punkte`: Liste aus `[Längengrad, Breitengrad]`
- `"bogen": true`: zeichnet die Strecke als Bogen über die Erdkugel (gut für Flüge mit zwei Punkten)
- `kategorie`: muss oben unter `kategorien` stehen (dort stehen Name und Farbe)

## Kartenquellen

- Satellit: [Sentinel-2 cloudless](https://s2maps.eu) by EOX IT Services GmbH (Copernicus Sentinel data 2020), frei für nicht-kommerzielle Nutzung
- Ortsnamen und Grenzen: [OpenFreeMap](https://openfreemap.org), Daten © OpenStreetMap-Mitwirkende
- Kartenbibliothek: [MapLibre GL JS](https://maplibre.org)
