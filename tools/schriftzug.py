import json, math
G = 7.0                      # Schlitzbreite, überall gleich
B = (100 - 2*G)/3            # Balkenhöhe: drei Balken und zwei Schlitze füllen die Höhe
R1, R2 = B + G, 100 - B - G  # Unterkante des 1. Schlitzes, Oberkante des 2. Schlitzes
KS, SX = 0.74, 1.22
def rund(pts):
    """Vieleck mit eigener Rundung je Ecke: [(x, y, r), ...] -> SVG-Pfad"""
    n = len(pts); d = ""
    for i in range(n):
        x, y, r = pts[i]; ax, ay, _ = pts[i-1]; bx, by, _ = pts[(i+1) % n]
        la, lb = math.hypot(ax-x, ay-y), math.hypot(bx-x, by-y); r = min(r, la/2, lb/2)
        p1 = (x + (ax-x)/la*r, y + (ay-y)/la*r); p2 = (x + (bx-x)/lb*r, y + (by-y)/lb*r)
        d += ("M" if i == 0 else "L") + f"{p1[0]:.1f} {p1[1]:.1f}" + (f"Q{x:.1f} {y:.1f} {p2[0]:.1f} {p2[1]:.1f}" if r > 0.2 else "")
    return d + "Z"
def kreis(cx, cy, r):
    """Punkt, der nach dem Neigen ein echter Kreis ist (Radius r in Höhe gemessen)."""
    pts = []
    for i in range(36):
        t = 2*math.pi*i/36; dx, dy = r*math.cos(t), r*math.sin(t)      # Kreis im fertigen Bild ...
        pts.append((cx + (dx + KS*SX*dy)/SX, cy + dy))                 # ... zurückgerechnet in die ungeneigte Zeichnung
    return "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + "Z"
S = 28.0                     # Stammbreite
x = 0; T = []                # Teile: je Buchstabe eine Liste von Pfaden
# p: Stamm und gefüllter Bauch, runder Punkt als Innenform
w = 86; T.append([rund([(x,0,16),(x+w,0,30),(x+w,R2,26),(x+S+G,R2,3),(x+S+G,100,0),(x,100,0)]) + kreis(x+56, 32, 8.5)]); x += w + G
# l: Stamm, der Fuss läuft unter das y
lx = x; yx = x + S + G
T.append([rund([(lx,0,0),(lx+S,0,0),(lx+S,R2+G,3),(yx+58-G,R2+G,13),(yx+58-G,100,0),(lx,100,30)])])
# y: Schale und Stamm
x = yx; w = 86
T.append([rund([(x,0,0),(x+S,0,0),(x+S,36,5),(x+58,36,5),(x+58,0,0),(x+w,0,0),(x+w,100,0),(x+58,100,0),(x+58,R2,3),(x,R2,28)])]); x += w + G
# u: Block mit Schlitz von oben, darin schwebt ein Punkt
w = 92; T.append([rund([(x,0,0),(x+S,0,0),(x+S,R2,6),(x+w-S,R2,6),(x+w-S,0,0),(x+w,0,0),(x+w,100,30),(x,100,30)]), kreis(x+w/2, 18, 8.5)]); x += w + G
# s: ein Stück, drei Balken, zwei Schlitze mit runden Enden
w = 118; T.append([rund([(x,0,24),(x+w,0,B/2),(x+w,B,B/2),(x+32,B,3.5),(x+32,R1,3.5),(x+w,R1,22),(x+w,100,28),(x,100,B/2),(x,R2+G,B/2),(x+w-32,R2+G,3.5),(x+w-32,R2,3.5),(x,R2,22)])]); x += w
W = (x + KS*100)*SX
json.dump({"w": round(W, 1), "h": 100, "m": f"matrix({SX} 0 {-KS*SX:.3f} 1 {KS*100*SX:.1f} 0)", "teile": T}, open("fl.json", "w"))
print(round(W))
