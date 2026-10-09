# Handover: Mekas – mechanische Kamera im Browser

Projektname **Mekas** (Martins Entscheid, 5.10.2026; vorher „Kurbel“, kurz „Bolex“). Filme heissen `mekas-JJJJMMTT-hhmmss.mp4`. Intern heissen IndexedDB (`kurbel`) und localStorage (`kurbel.v3`) bewusst weiter so, damit gespeicherte Filme und Einstellungen erhalten bleiben. Eine einzelne HTML-Datei, die das iPhone in eine spielbare Filmkamera nach dem Vorbild der Bolex H16 verwandelt. Gebaut zusammen mit Martin (Musiker, „electronic chamber pop“, macOS, filmt mit dem iPhone).

Datei: `mekas.html` (liegt neben diesem Handover). Eigenständige Seite mit `<!doctype html>`, `<head>`, `<body>`, alles inline. Keine Abhängigkeiten ausser Google Fonts (Courier Prime, Karla).

Es gibt zusätzlich eine veröffentlichte Version als Claude-Artifact (claude.ai/artifact/3vac4mHWguVd8u6ZAukwJD). Dort sind Kamera und Mikrofon gesperrt, dort läuft nur Demo und „Video laden“. Für echtes Filmen wird die Datei direkt im Browser geöffnet (iPhone Safari braucht dafür https, z. B. lokal über einen kleinen Server oder Hosting).

---

## 1. Worum es geht

Nicht Filter, sondern **Mechanik und Zeitlichkeit** machen den analogen Look. Martins Erkenntnis nach dem ersten Test: „Das sieht aus wie eine analoge Aufnahme ohne jedes Farb-Gimmick.“ Farbe, Schärfe, Sensor bleiben iPhone. Nachgebaut wird, *wann* und *wie lange* belichtet wird und *wie der Film transportiert* wird.

Ziel: eine ausdrucksstarke Kamera-App, die zum Experimentieren einlädt, „wie früher“. Improvisation, im Moment filmen, loslassen. Primär nicht für die Bühne.

## 2. Designphilosophie (Kern, unbedingt beibehalten)

1. **Parameter hängen physikalisch voneinander ab.** Nicht alles separat steuerbar machen. Beispiele, die schon so funktionieren:
   - Langsamer kurbeln → längere Belichtung → heller *und* mehr Bewegungsunschärfe.
   - Blende über 240° offen → überschneidet sich mit dem Filmtransport → Schlieren entstehen von selbst.
   - Schlierenlänge = Weg, den der Film während der Belichtung zurücklegt. Steht der Greifer, gibt es keine Schlieren.
   - Schmalere Schlitze → weniger Licht. Fragmente werden aufgehellt, stehende Teile brennen aus.
   - Stapeln bei 24 fps brennt schnell aus, bei 2 fps ist es dosierbar.
   - Marey-Fragmente sieht man nur bei langsamem Kurbeln (iPhone liefert nur ca. 30 Bilder/s).
2. **Instrument statt Bedienoberfläche.** Das ganze Bild ist das Spielfeld. Wenige, grosse, spielbare Regler. Einstellungen im Menü.
3. **Ruhig und sinnlich vor spektakulär.** Mehr Reglerweg für die ruhigen Werte. Martin reagiert empfindlich auf Flackern („Kopfweh-Territorium“). Harte Helligkeitssprünge mit 3–30 Wechseln/s vermeiden bzw. dämpfen.
4. **Keine Texturen, keine Overlays.** Kein Grain-Bild, kein Staub, kein Haar im Bildfenster. Alles nur aus Zeit, Lage und Dauer der Belichtung.
5. **Alt-technische Begriffe, beschreibend.** Nicht „Raffen“, sondern „Unterdreht“. Kein Fachjargon ohne Erklärung.
6. **Digital wirkende Effekte fliegen raus.** Der Lartigue-Slit-Scan wurde entfernt, weil er digital aussah.

## 3. Bedienung (aktueller Stand)

- **Übers Bild wischen, relativ** (der Wert wandert von dort, wo er ist):
  - seitwärts = **Kurbel** (Bildrate). Skala: **4–12 fps auf 0–80 %** (der ausdrucksstärkste Bereich), 12–24 fps im Rest. Unter 4 fps gibt es nicht mehr (sah nicht gut aus). Ganzer Weg ≈ 55 % Bildschirmbreite.
  - hoch/runter = **Zoom** 1×–3× (≈ 50 % Bildschirmhöhe).
  - Punkt mit Fadenkreuz folgt mit Trägheit (Zeitkonstante 0,11 s). Label zeigt fps und Zoom.
- **Zwei Finger aufs Bild = Halten** (Bild friert ein, wie die Kerbe beim Pathé-Baby-Projektor). Am Rechner: Leertaste gedrückt.
- **Rechter Bildrand, untereinander, für den rechten Daumen:**
  - **Greifer** (oben, 2D-Pad): hoch/runter = Filmzug pro Bild, seitwärts = Takt zwischen Greifer und Blende.
  - **Blende** (unten, 2D-Fader): hoch/runter = Öffnung 0°–360°, seitwärts = von **verwaschen** (links) zu **fragmentiert** (rechts).
- **Unten links:** Doppel (immer sichtbar, aktiv sobald gefilmt wird; während der Aufnahme pausiert es und spult direkt zurück), Auslöser (gross), Fertig.
- **Oben:** links Quelle/Kamerawechsel (Tipp wechselt reihum HINTEN → VORNE → VIDEO, falls eins geladen ist, auch während der Aufnahme), Filme-Bibliothek, Einstellungen (Zahnrad).

## 4. Mechanik im Detail (Code-Konzepte)

### Belichtung / Umlaufblende
- Jeder Kamerazyklus: `startExposure(now, T, angle)`. Die Blende ist pro Zyklus `angle/360·T` offen, iPhone-Frames werden in `acc` gemittelt (`sampleInto` mit alpha 1/n).
- **Kamm-Blende** (zwei geschlitzte Scheiben gegeneinander verdreht): `combOf(slitsH)`; N = 1 (verwaschen) bzw. 2–6 Fragmente, `duty = 1 − 0.85·comb`. Das Öffnungsfenster wird in N Slots geteilt, je Slot nur `slot·duty` offen. Helligkeitsausgleich `stops += log2(1/duty)·0.8`.
- `exposureStops(E)`: Belichtung relativ zur Bolex-Referenz (135° bei Ausgabe-fps), Faktor 0,3, begrenzt auf −2…+1,2 Blenden. Entwicklung in `develop()` mit `screen` (aufhellen) bzw. Schwarz-Überlagerung (abdunkeln).
- `fadeOf(angle)`: unter 36° wird gegen Schwarz geblendet. Blende ganz zu = schwarz, so blendet man von Hand auf und ab.
- **Anlaufblitz**: erste Bilder nach jedem Start +1,6 / +0,9 / +0,4 Blenden.
- **Handkurbel**: Abstand zwischen Belichtungen `T·(1 ± 0.6·jitter)`, Regler im Menü (Standard 75).

### Filmtransport / Greifer (virtueller Filmstreifen)
- Canvas-Streifen `stripA/stripB` mit drei Bildabständen `P = H` (Bilder bündig, kein schwarzer Steg: der variierte je nach Geschwindigkeit und wirkte digital), Bildfenster bei `GY`. Pro Zyklus: Streifen um `Z·P` weiterziehen, neue Belichtung mit `screen` ans Bildfenster legen.
- Projektor-Fenster `framOff` (in (−P, 0]) driftet um `(Z−1)·P` pro Zyklus → **rollender Bildstrich**. Z=0: Film steht, Belichtungen stapeln sich. Z>1: Lücken.
- `zugOf(v)`: Mitte bei 0,6 mit Totzone (±7 %), danach Exponent 2,4 (ruhig in der Mitte). Unten bis Z=0, oben bis Z=1,5.
- `taktOf(h)`: Phasenverschiebung der Blende gegen den Transport, Totzone ±8 %, quadratisch bis ±180°.
- `transportOverlap(angle, phase)`: Transportsektor 0–120° des Zyklus, offener Sektor zentriert bei 240°+Phase. Überlappung → Schlieren. Schlieren nur aus Lichtern (Bild hoch 4 via `multiply`), als ausklingender Schweif.
- **Loslassen**: `relaxGrip` führt Zug und Takt weich zurück. Der Bildstrich läuft **in der bisherigen Fliessrichtung** weiter, startet mit der aktuellen Rutschgeschwindigkeit (`|Z−1|·P·fps`) und **beschleunigt** (Ease-in, `gRelaxV`), bis er am nächsten Bildrand einrastet. Doppeltippen = sofort einrichten.

### Bildstand
- Neue Position nur bei neuem Bild (`newWeave` in `closeShutter`). Ein stehendes Bild steht still. Amplitude `H·0.006·Bildstand` (Regler im Menü, Standard 35).

### Zeit-Modi (Menü „Zeit“)
- **Bild steht nach** (Standard): Echtzeit, jedes Bild steht bis zum nächsten (Step-Printing wie Wong Kar-wai). Aufnahme per `MediaRecorder` auf `canvas.captureStream(0)` mit `requestFrame()` im Ausgabetakt. Ton synchron (Mikrofon über Delay-Knoten, im Menü „Mikrofon verzögern“).
- **Unterdreht** (Bolex-echt): jedes belichtete Bild genau einmal → Zeit verdichtet sich. Frames als JPEG in IndexedDB (`kurbel` DB v2, Store `frames`), beim „Fertig“ mit Ausgabe-fps neu aufgenommen („Film wird entwickelt“). Ton läuft separat in Echtzeit (wie Nagra bei Mekas) und wird als **WAV-Spur** geliefert. Auslöser halten = Kamera läuft, kurz tippen = Stoss von 4 Bildern. Spule: max. 4000 Bilder (100 Fuss).

### Aufnahme-Ablauf
- Auslöser: Start → Pause → weiter (Bild-steht-nach-Modus). Fertig = beenden und speichern.
- **Doppel** (in Pause): Scrubber durch den bisherigen Film, Stelle wählen, Aufnehmen legt das neue Bild additiv darüber (alt 60 %, neu 60 %). Keine automatische Blende mehr: auf/ab blendet Martin selbst mit der Blende. Mehrere Pässe auf einer Zeitachse, der letzte gewinnt. Mit Doppel wird beim Fertig in Echtzeit neu „entwickelt“.
- **Bibliothek**: Filme in IndexedDB (Store `films`), also nur im Browser-Speicher dieser Adresse, nicht in Fotos. Safari kann diesen Speicher räumen (z. B. nach Wochen ohne Besuch, ausser die Seite ist zum Home-Bildschirm hinzugefügt). „Alle löschen“ (zweimal tippen) leert den Store. „Sichern“ nutzt auf dem iPhone `navigator.share` (→ „Video sichern“ in Fotos), sonst Download.
- Einstellungen in `localStorage` (`kurbel.v3`, Feld `v: 4` für die neue Blenden-Skala).
- Klappe im Menü: weisses Bild mit Piepton zum Synchronisieren.

## 5. Bewusst verworfen (nicht wieder einbauen ohne Anlass)

- Kurbel unter 4 fps.
- Schwarzer Steg zwischen den Bildern.
- Federwerk mit 28-s-Limit und Aufziehen: nervt.
- Einzelbild- und Ton-Auslöser bei 0 fps: ergab keinen Ausdruck.
- Automatische Doppel-Auf-/Abblende: Martin will selbst blenden.
- Lartigue-Slit-Scan (Zeilen aus verschiedenen Momenten, Ringpuffer): sah digital aus.
- Kurbel-Geste (Kreise auf dem Bildschirm): nicht gewünscht.
- Begriff „Raffen“.
- Farbfilter, Grain-Overlays, Texturen.

## 6. Offene Punkte / nächste Schritte

- **Doppel schwarz** (iPhone): Beim Doppel nicht ab Anfang war das Bild schwarz, bis das neue Bild erschien. In Chrome/WebKit nicht reproduzierbar. Absicherungen: Rückwärts-Sprung in einem Abschnitt → frische Kopie des Videos statt Seek (`passVideo`), Abschnitte einmal kurz anspielen, während Seek das letzte gute Bild zeigen (`vidReady`, `lastUnder`). Auf dem iPhone bestätigen.
- **Automatisch in einen Ordner „Mekas“ sichern**: Aus dem Browser nicht möglich (kein Zugriff auf Fotos-Alben oder Dateien-Ordner). Weg: iOS-Kurzbefehl „In Fotoalbum Mekas sichern“ im Teilen-Menü, oder später eine native Hülle.
- **Video laden** (Safari): Das geladene Video ist der „Film im Projektor“. Es steht nach dem Laden (kurz stumm angespielt, damit Safari ein Bild hat, `primeFile` mit Timeout), läuft nur während der Aufnahme (`startFile` im Tipp, `syncFile` pro Frame), pausiert mit ihr, kein Loop. Neuer Film beginnt bei 0, Doppel an der gewählten Stelle, „weiter“ dort, wo es stand. Sein Ende beendet den Film (`ended` → `onDone`). Auf dem iPhone noch bestätigen.
- **Schwenken mit dem Telefon** (Video und Demo, Einstellung „Schwenken mit dem Telefon“, Standard an): Im Zoom wandert der Ausschnitt mit dem Gyroskop, wie beim Abfilmen eines Fernsehers. `devicemotion.rotationRate` wird aufsummiert (auf Bildschirmachsen umgerechnet, auch quer), das ganze Video entspricht 60° (`SWIVEL_FOV`), der Bildrand ist eine Wand. Mitte = Haltung beim Start jeder Aufnahme (auch „weiter“ und Doppel, `centerSwivel`). iPhone fragt den Bewegungssensor nur bei einem echten Tipp ab (`touchend`/`click`, nicht `pointerdown`), nur über https. Einmal abgelehnt, fragt Safari erst nach Löschen der Website-Daten wieder. Label zeigt „· schwenkt“, wenn Sensordaten kommen. Richtung und Stärke auf dem iPhone prüfen.
- **Fertig in Pause** (Safari): Aufnahme ging verloren. Fix: pausierten Recorder vor `stop()` wieder starten und ein Bild nachreichen, Timeout 5 s in `finishRecorder`. Auf dem iPhone noch bestätigen.
- **Feinjustage nach iPhone-Tests**: Reglerwege, Stärke der Schlieren, Fragmente, Greifer-Rückkehrgeschwindigkeit, Handkurbel.
- **Unterdreht-Modus** noch nicht überzeugend („wirkt wie TikTok-Vorspulen“). Ideen: lange Belichtung + Kamerabewegung (Marie Menken), Stösse (Mekas), Pixilation (McLaren).
- **Lartigue ehrlich**: Schlitz läuft nur so lange wie die Belichtung, kaum sichtbar ausser bei schnellen Schwenks. Nur angehen, wenn es fehlt.
- **Objektiv-Charakter** (Mitte scharf, Ränder weich) als mögliche Ergänzung. Kino-Modus des iPhones ist im Browser nicht zugänglich (keine Tiefendaten).
- **Performance auf dem iPhone** prüfen: 720p Standard, Streifen-Canvas 3·P hoch, IndexedDB-Schreiblast im Unterdreht-Modus.
- **Hosting über https**, damit Safari die Kamera-Freigabe merken kann (Einstellungen › Apps › Safari › Kamera/Mikrofon › Erlauben).
- Nicht auf dem iPhone getestet wurden bisher: alle Änderungen ab Blende/Greifer-Umbau (nur Headless-Chromium mit Playwright).

## 7. Arbeitsweise mit Martin

- Antwortet auf Deutsch (Schweiz), kurz und direkt. Er testet sofort auf dem iPhone und meldet Gefühl zurück („zu digital“, „Kopfweh“, „sinnlicher“).
- Bei Erklärungen: zuerst, was mechanisch passiert, dann der Effekt, dann was wir im Code machen.
- Lieber eine Sache richtig koppeln als drei neue Regler.
- Nach Änderungen kurz im Headless-Browser durchspielen (Demo-Quelle, Aufnehmen, Doppel, Fertig) und Screenshots ansehen.

## 8. Kontext: Bolex-Fakten, die wir verwenden

- Bolex H16 Rex: 12–64 fps plus Einzelbild (ca. 1/30 s), Umlaufblende ca. 133–135° (≈ 1/65 s bei 24 fps), variable Blende mit vier Stufen bis ganz zu (Abblenden in der Kamera), Federwerk ca. 18 Fuss ≈ 28 s bei 24 fps, Rückspulkurbel für Überblendungen, Reflexprisma nimmt 20–25 % Licht.
- Bolex ist eine stumme Kamera; Mekas hat Ton separat aufgenommen (Walden).
- 100-Fuss-Spule 16 mm = 4000 Bilder ≈ 2:46 bei 24 fps.
