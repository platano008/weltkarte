#!/usr/bin/env python3
"""MilX-Layerdatei (.milxly oder .zip) -> GeoJSON für die Lagekarte.

Aufruf:  python3 tools/milx2geojson.py Layer.milxly import/lage.geojson "ukv3.65"
"""
import sys, re, json, html, zipfile, io
import xml.etree.ElementTree as ET

NS = {"m": "http://gs-soft.com/MilX/V3.1"}
LAYER_DE = {
    "Ukraine Terr": "Ukrainisches Gebiet",
    "Gray zone": "Grauzone",
    "Russia main": "Russland",
    "Russian Terr": "Russisch kontrolliert",
    "Base": "Basen",
    "Units": "Großverbände",
    "Units lower": "Verbände",
}
NAMED = {"clBlack": "#000000", "clWhite": "#ffffff", "clRed": "#ff0000", "clBlue": "#0000ff", "clGray": "#808080", "clGreen": "#008000"}

def color(c):
    if not c: return None
    if c in NAMED: return NAMED[c]
    m = re.fullmatch(r"\$?([0-9A-Fa-f]{8})", c)
    if not m: return None
    v = m.group(1)                      # Delphi: $00BBGGRR
    b, g, r = v[2:4], v[4:6], v[6:8]
    return f"#{r}{g}{b}".lower()

def read(path):
    if path.lower().endswith(".zip"):
        with zipfile.ZipFile(path) as z:
            name = next(n for n in z.namelist() if n.lower().endswith(".milxly"))
            return z.read(name)
    return open(path, "rb").read()

def convert(data, version):
    root = ET.fromstring(data.decode("utf-8-sig"))
    feats, layers = [], []
    for lay in root.findall(".//m:MilXLayer", NS):
        lname = (lay.findtext("m:Name", namespaces=NS) or "Ebene").strip()
        lid = re.sub(r"[^a-z0-9]+", "-", lname.lower()).strip("-")
        count = 0
        for g in lay.findall(".//m:MilXGraphic", NS):
            mss = g.findtext("m:MssStringXML", namespaces=NS) or ""
            sym = ET.fromstring(mss) if mss.strip().startswith("<") else ET.fromstring(html.unescape(mss))
            sidc = sym.get("ID", "")
            pts = [[round(float(p.findtext("m:X", namespaces=NS)), 5), round(float(p.findtext("m:Y", namespaces=NS)), 5)]
                   for p in g.findall(".//m:Point", NS)]
            if not pts: continue
            label = ""
            line = fill = None; fop = 0.3
            for a in sym.findall("Attribute"):
                if a.get("ID") == "T" and (a.text or "").strip(): label = a.text.strip()
                l = a.find("Line"); f = a.find("Fill")
                if l is not None: line = color(l.get("Color"))
                if f is not None:
                    fill = color(f.get("Color"))
                    if f.get("Transparency"): fop = round(max(0.05, 1 - int(f.get("Transparency")) / 100), 2)
            props = {"ebene": lid, "sidc": sidc}
            if label: props["name"] = label
            if sidc.startswith("G") and len(pts) >= 3:
                if pts[0] != pts[-1]: pts.append(pts[0])
                props.update({"art": "flaeche", "linie": line or "#888888", "fuellung": fill or line or "#888888", "deckkraft": fop})
                if lid == "gray-zone": props.update({"linie": "#b9b9ae", "fuellung": "#9a9a8f", "deckkraft": 0.35})
                feats.append({"type": "Feature", "properties": props, "geometry": {"type": "Polygon", "coordinates": [pts]}})
            elif sidc.startswith("G") and len(pts) >= 2:
                props.update({"art": "linie", "linie": line or "#888888"})
                feats.append({"type": "Feature", "properties": props, "geometry": {"type": "LineString", "coordinates": pts}})
            elif sidc.startswith("S"):
                props["art"] = "symbol"
                feats.append({"type": "Feature", "properties": props, "geometry": {"type": "Point", "coordinates": pts[0]}})
            else:
                continue
            count += 1
        layers.append({"id": lid, "name": LAYER_DE.get(lname, lname), "original": lname, "anzahl": count})
    return {"type": "FeatureCollection", "meta": {"quelle": version, "ebenen": [l for l in layers if l["anzahl"]]}, "features": feats}

if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    version = sys.argv[3] if len(sys.argv) > 3 else ""
    out = convert(read(src), version)
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(out['features'])} Einträge, Ebenen:", ", ".join(f"{l['name']} ({l['anzahl']})" for l in out["meta"]["ebenen"]))
