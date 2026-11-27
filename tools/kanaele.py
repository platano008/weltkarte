#!/usr/bin/env python3
"""Tägliche Statistik (GitHub Actions): Website-Zahlen von gestern aus dem Zähler sichern und – falls ein Kanal
   in daten/kanaele.json steht – Abonnenten und Aufrufe des öffentlichen Telegram-Kanals von t.me/s/<kanal> lesen.
   X (Twitter) gibt Zahlen nur über die kostenpflichtige API heraus; die werden im Dashboard von Hand eingetragen."""
import json, re, urllib.request, datetime, zoneinfo

heute = datetime.datetime.now(zoneinfo.ZoneInfo("Europe/Berlin")).date()
gestern = (heute - datetime.timedelta(days=1)).isoformat()
cfg = json.load(open("daten/kanaele.json"))
st = json.load(open("daten/statistik.json"))
for k in ("website", "telegram", "x"): st.setdefault(k, {})

def hole(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Plyus-Statistik)"})
    with urllib.request.urlopen(req, timeout=30) as r: return r.read().decode("utf-8", "replace")

def zahl(t):
    t = t.strip().replace(" ", "").replace(",", ".")
    f = {"K": 1e3, "M": 1e6}.get(t[-1:].upper(), 1)
    return int(round(float(t[:-1] if f > 1 else t) * f))

# Website: gestern (abgeschlossener Tag) dauerhaft sichern
w = {}
for k in ("aufrufe", "besuche"):
    try: w[k] = json.loads(hole(f"https://abacus.jasoncameron.dev/get/plyus-weltkarte/{k}-{gestern}"))["value"]
    except Exception: w[k] = 0
st["website"][gestern] = w

# Telegram: öffentliche Vorschau des Kanals
kanal = (cfg.get("telegram") or "").strip().lstrip("@")
if kanal:
    try:
        html = hole(f"https://t.me/s/{kanal}")
        m = re.search(r'counter_value">([^<]+)</span>\s*<span class="counter_type">subscribers', html)
        views = [zahl(v) for v in re.findall(r'tgme_widget_message_views">([^<]+)<', html)]
        st["telegram"][heute.isoformat()] = {"abonnenten": zahl(m.group(1)) if m else None,
            "aufrufe": sum(views), "beitraege": len(views), "schnitt": round(sum(views) / len(views)) if views else 0}
    except Exception as e:
        print("Telegram nicht lesbar:", e)

json.dump(st, open("daten/statistik.json", "w"), ensure_ascii=False, indent=1)
print("Website", gestern, w, "· Telegram", kanal or "–")
