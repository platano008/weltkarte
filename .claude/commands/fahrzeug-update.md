---
description: Fahrzeugliste mit Oryx und den Lieferlisten abgleichen, ergänzen und veröffentlichen
---

Aktualisiere die Plyus-Fahrzeugliste. Antworte auf Deutsch, einfach und ohne Fachsprache.

1. `git pull`. Datenquelle ist allein `tools/fahrzeuge.py`, daraus entsteht `daten/fahrzeuge.json`.
2. Lies die Typnamen der Bodenfahrzeuge (keine Flugzeuge, Hubschrauber, Schiffe, Flugdrohnen) aus:
   - https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-equipment.html
   - https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-ukrainian.html
   - https://www.oryxspioenkop.com/2022/04/answering-call-heavy-weaponry-supplied.html (Geberländer)
   - Wikipedia „List of military aid to Ukraine during the Russo-Ukrainian war“ (erst suchen, dann abrufen)
   Lange Seiten stückweise mit `offset` lesen.
3. Prüfe jeden Typnamen: Kommt er (klein geschrieben, nur Buchstaben und Ziffern) im Namen `n` oder in den Modellen `mod` eines Eintrags vor? Fehlende sammeln.
4. Ergänze in `tools/fahrzeuge.py`: Varianten an `var` der passenden Familie, neue Typen als eigenen `F(...)`-Eintrag und dazu in `tools/fahrzeuge_daten.py` eine Zeile mit Bild, Fahrdaten, Schutz und Zweitwaffen (Modellhinweise in `MOD`), neue Geberländer in `geber`, englische Schreibweisen in `ALIAS`. Nur Gemeldetes mit Hinweis „gemeldet“ in `info`. Neue Kategorie- oder Ländernamen auch in `lang.js` übersetzen.
5. `python3 tools/fahrzeuge.py` ausführen und Schritt 3 wiederholen, bis nichts mehr fehlt.
6. `fahrzeuge.html` und das Werkzeug „Fahrzeug setzen“ in `karte.html` mit Playwright testen und Screenshots ansehen.
7. Stand-Datum anpassen, Cache-Stempel `?v=` in allen HTML-Seiten erneuern, committen, `git fetch && git rebase origin/main && git push`.
8. Melde kurz, was neu ist (Typen, Varianten, Geberländer), mit Screenshot und Quellen.
