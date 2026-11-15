#!/usr/bin/env python3
"""Zeichnet das Fernglas-Logo im Stil des Schriftzugs (schräges Band, harte Kanten, gleich breite Schlitze) -> bild/logo.svg"""
import math, sys, os
src = open(os.path.join(os.path.dirname(__file__), "schriftzug.py")).read().split("S = 28.0")[0]
ns = {}; exec(src, ns); rund, G, RF = ns["rund"], ns["G"], ns["RF"]
KS, SX = 0.34, 1.1                      # weniger geneigt als der Schriftzug, damit das Fernglas erkennbar bleibt
def linse(cx, cy, r):
    """Loch, das nach dem Neigen ein echter Kreis ist"""
    return "M" + "L".join(f"{cx + (r*math.cos(t) + KS*SX*r*math.sin(t))/SX:.1f} {cy + r*math.sin(t):.1f}" for t in (2*math.pi*i/40 for i in range(40))) + "Z"
P = []; A = 76
for o in (0, A):                        # zwei Rohre nebeneinander
    P.append(rund([(o+12,0,-4),(o+40,0,-4),(o+40,16,0),(o+12,16,0)]))                                                    # Okular
    P.append(rund([(o+6,16+G,0),(o+46,16+G,0),(o+60,50,0),(o+60,100,-14),(o-8,100,-14),(o-8,50,0)]) + linse(o+26, 66, 21) + " " + linse(o+26, 66, 9.5)[0:0])   # Rohr mit Linse
    P.append(linse(o+26, 66, 10))                                                                                        # Lichtpunkt in der Linse
P.append(rund([(57,29,0),(71,29,0),(66.5,41,0),(61.5,41,0)]))                                                  # Brücke
x0, x1 = -8, A+60
W = (x1 - x0 + KS*100)*SX
m = f"matrix({SX} 0 {-KS*SX:.3f} 1 {(KS*100 - x0)*SX:.1f} 0)"
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.1f} 100" fill-rule="evenodd" fill="{sys.argv[2] if len(sys.argv) > 2 else "#fff"}"><g transform="{m}">' + "".join(f'<path d="{d}"/>' for d in P) + "</g></svg>"
open(sys.argv[1] if len(sys.argv) > 1 else "bild/logo.svg", "w").write(svg); print(round(W))
