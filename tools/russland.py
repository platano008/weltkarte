#!/usr/bin/env python3
"""Schmiegt Russland (daten/russland.geojson) exakt an die Außengrenze der Ukraine aus import/lage.geojson:
   Überlappungen werden abgeschnitten, schmale Lücken entlang der Landgrenze vom angrenzenden Gebiet gefüllt."""
import json
from shapely.geometry import shape, mapping, Polygon, MultiPolygon, box
from shapely.ops import unary_union

D = 0.05                                   # bis ~5 km Abstand gilt als Lücke an der Grenze
LANDGRENZE = box(31.7, 47.05, 40.3, 52.36)  # Landgrenze Russland–Ukraine (ohne Asowsches Meer, Kertsch und Belarus)

def ohne_loecher(g):
    teile = g.geoms if isinstance(g, MultiPolygon) else [g]
    return unary_union([Polygon(t.exterior) for t in teile])

lage = json.load(open("import/lage.geojson"))
U = ohne_loecher(unary_union([shape(f["geometry"]).buffer(0) for f in lage["features"]
      if f["geometry"]["type"] in ("Polygon", "MultiPolygon") and f["properties"].get("art") == "flaeche" and f["properties"].get("ebene") != "base"]))
ru = json.load(open("daten/russland.geojson"))
geo = [shape(f["geometry"]).buffer(0) for f in ru["features"]]
alle = unary_union(geo)
band = U.buffer(D).difference(U).difference(alle).intersection(LANDGRENZE)   # Lücke zwischen beiden Grenzen
vergeben = Polygon()
for f, g in zip(ru["features"], geo):
    neu = g.difference(U)
    if g.distance(U) < D:
        dazu = band.intersection(g.buffer(D)).difference(vergeben)
        if not dazu.is_empty:
            neu = neu.union(dazu); vergeben = vergeben.union(dazu)
    neu = neu.buffer(0).simplify(0.002, preserve_topology=True)
    teile = [t for t in (neu.geoms if hasattr(neu, "geoms") else [neu]) if isinstance(t, Polygon) and t.area > 1e-5]
    f["geometry"] = mapping(MultiPolygon(teile) if len(teile) > 1 else teile[0])
def runden(c):
    return [runden(x) for x in c] if isinstance(c[0], (list, tuple)) else [round(c[0], 3), round(c[1], 3)]
for f in ru["features"]:
    f["geometry"]["coordinates"] = runden(f["geometry"]["coordinates"])
json.dump(ru, open("daten/russland.geojson", "w"), separators=(",", ":"), ensure_ascii=False)
print("Lücken gefüllt:", round(vergeben.area, 4), "Grad²")
