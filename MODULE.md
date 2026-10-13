# Module

Status: **Idee** → **in Arbeit** → **im Labor** (Maris testet) → **abgenommen** (in der normalen Bedienung) oder **verworfen**.

Jede Karte hat: Mechanik, Bild, Parameter, Erfolgskriterien, Fragen an Maris, Notizen aus den Tests. Bei jeder Änderung des Status das Datum dazuschreiben.

---

## Bestand (seit Runde 0 als Kern und Module, siehe `CLAUDE.md`)

| Modul | Station | Status | Bemerkung |
|---|---|---|---|
| Kurbel | Takt (Kern) | abgenommen | 4–24 fps, 4–12 auf 0–80 % des Wegs |
| Anstossen | Kern | auf dem iPhone getestet (2026-10-12) | Tippen aufs Greifer-Pad und Ruck mit dem Telefon (Gyroskop, alle Achsen, Schwelle 30 °/s, sättigend). Knopf über dem Greifer koppelt das Gyroskop ab und an (2026-10-13) |
| Handkurbel | Takt | abgenommen | eigenes Modul seit Runde 0: Unregelmässigkeit in der Mikrozeit |
| Blende | Belichtung | abgenommen | 0–360°, unter 36° gegen Schwarz. **Seitwärts-Achse (Schlitze) entfällt** |
| Kammblende | Belichtung | entfernt (2026-10-13) | Maris braucht sie nicht. Der Code liegt in der Geschichte des Repositorys (`src/module/kammblende.js` bis Commit 14624e9) |
| Entwickeln | Entwickeln | abgenommen | Belichtung → Helligkeit, Anlaufblitz |
| Greifer | Transport | mit Feder, auf dem iPhone getestet (2026-10-12) | Tippen = Stoss, Halten = Schlupf, Loslassen = Feder rastet ein (Runde 1a/1b). Werte fest, Rastkraft 170 |
| Stehender Film | Transport | im Labor (1.2.6) | Runde 1d: zwei Finger = accum., fest Sandwich mit Lichthof 0,4, Loslassen mit weicher Überblendung (0,6 s). Andere Materialien: Filmmaterial in `IDEEN.md` |
| Bildstand | Projektor | abgenommen | neue Lage nur bei neuem Bild |
| Überblendender Projektor | Projektor | im Labor, abgenommen (2026-10-12) | Runde 1c: Blendzeit = 2 × so lange die Blende offen ist |
| Sammeln | Kern (Belichtung, Emulsion) | gebaut, im Labor (2026-10-13) | Runde 2a: jedes Kamerabild eine Teilbelichtung, lineares Licht. Im Labor neu/alt zum Vergleichen |
| Doppel | Aufnahme | abgenommen | auf dem iPhone bestätigt (2026-10-12) |
| Zeit-Modi | Aufnahme | Bild steht nach: abgenommen. Unterdreht: offen | Unterdreht überzeugt noch nicht, später |
| Halten | Kern | abgenommen | zwei Finger, Leertaste. Im Labor mit Stehendem Film: zwei Finger = accum., drei Finger (Taste H) = hält, friert das sichtbare Bild ein |
| Schwenken mit dem Telefon | Quelle | abgenommen (2026-10-12) | nur Video und Demo, Richtung und Stärke auf dem iPhone bestätigt |

---

## Runde 0: Fundament

**Status:** abgenommen (2026-10-12, iPhone: alle fünf Punkte ok)

**Ziel:** Mekas sieht danach aus und verhält sich wie heute, nur aufgeräumt, aus Modulen gebaut, online über https und mit Labor und Tests. **Keine neuen Bildeffekte in dieser Runde.**

**Aufgaben:**
1. **Repository und GitHub Pages:** öffentliches Repository `mekas`, Pages aus `main` /. `.gitignore` aus dem Startpaket übernehmen (`referenz/`, `tests/out/`, `.DS_Store`). Adresse oben in `CLAUDE.md` eintragen.
2. **Aufteilen** von `mekas.html` in `index.html`, `src/kern/` und `src/module/` nach der Richtung in `CLAUDE.md`. Die endgültige Schnittstelle in `CLAUDE.md` dokumentieren.
3. **Aufräumen in der Bedienung:**
   - Blende wird ein einfacher senkrechter Fader (Seitwärts-Achse „Schlitze“ weg, Blende immer „verwaschen“).
   - Greifer-Pad: Seitwärts-Achse „Takt“ weg (Takt fest auf dem bisherigen Mittelwert). Hoch/runter bleibt vorerst, bis Runde 1 das Pad ersetzt.
   - Erklärtexte im Menü und Aria-Labels anpassen.
4. **Version und Cache** wie in `CLAUDE.md`.
5. **Labor** (`?labor`) mit Modul-Liste, rohen Reglern, Vergleich, Schnappschuss und Rechenzeit.
6. **Tests:** Rauchtest und Kontaktbogen. Als Probe einen Kontaktbogen für die Blende bei 30°, 135°, 240° und 360° mit der Demo-Quelle.

**Erfolgskriterien:**
- Maris merkt auf dem iPhone keinen Unterschied zu vorher, ausser den weggefallenen Achsen.
- Live-Kamera, Video laden, Doppel und Fertig funktionieren über die https-Adresse.
- Das Labor zeigt alle Module und ihre Regler.

**Maris prüft auf dem iPhone (Checkliste aus dem alten Handover):**
1. Kamera-Erlaubnis bleibt beim nächsten Öffnen erhalten (Safari › Kamera › Erlauben).
2. Doppel nicht ab dem Anfang: Bild bleibt nicht schwarz.
3. Video laden: steht nach dem Laden, läuft mit der Aufnahme, Ende beendet den Film.
4. Fertig in Pause: Film wird gespeichert.
5. Schwenken mit dem Telefon: Richtung und Stärke stimmen.

**Notizen:**
- 2026-10-09: Gebaut und von Maris abgenommen („passt“). Kontaktbogen Blende 30°/135°/240°/360° mit der Demo: neu und alte `mekas.html` sehen gleich aus, mittlere Helligkeit gleich (Abweichung ≤ 0,05 von 255). Kammblende ebenso. Rauchtest grün, „Unterdreht“ einmal durchgespielt.
- Nicht auf der Karte, deshalb in `IDEEN.md`: geteilte Ansicht im Labor, Pad und Fader über dem Einstellungsblatt (war schon so), veraltete Meldungen „Datei direkt öffnen“.
- 2026-10-12, iPhone mit 0.0.1: alle fünf Punkte ok (Kamera-Erlaubnis bleibt, Doppel nicht schwarz, Video laden, Fertig in Pause, Schwenken).

---

## Runde 1a: Schwinger und Anstossen (gemeinsamer Kern)

**Status:** auf dem iPhone getestet, Grundwerte angepasst (1.2.1, 2026-10-12). Frage zum Gyroskop beantwortet (2026-10-13): vorerst immer gekoppelt, Entkoppeln über einen Knopf auf dem Hauptbildschirm jederzeit möglich (Knopf noch zu bauen, `FAHRPLAN.md` Phase A).

**Mechanik:** Ein gedämpfter Schwinger wie eine Masse an einer Feder. Ein Stoss gibt ihm Energie, er schwingt aus und kommt zur Ruhe. Dieser Kern wird von mehreren Modulen benutzt (Greifer, später Linse, Pendel, Zweiter Projektor). Jedes Modul sagt, auf welche Achsen es reagiert und welche Ruhelagen es hat.

**Bedienung:**
- Das **XY-Pad „Greifer“** (bisheriges Greifer-Pad, rechts über der Blende) hat zwei Gesten:
  - **Tippen = Stoss.** **Richtung** = vom Mittelpunkt zum Finger, **Stärke** = Abstand vom Mittelpunkt.
  - **Halten = Schlupf** (siehe 1b). Solange der Finger liegt, läuft der Film unsynchron zum Greifer.
- Das **Gyroskop ist immer gekoppelt:** Ein Ruck mit dem Telefon (Drehrate, hochpassgefiltert) ist ebenfalls ein Stoss. Ruhiges Halten gibt keinen.
- Ohne Gyroskop (Rechner, keine Erlaubnis) funktioniert das Pad allein.

**Parameter (Labor):** Eigenfrequenz, Dämpfung, Empfindlichkeit Gyroskop, Schwelle Gyroskop (unterhalb zählt nichts), Stärke Pad.

**Erfolgskriterien:**
- Normales Filmen aus der Hand löst nicht ständig Stösse aus.
- Ein bewusster Ruck ist sofort spürbar, wie ein Schlag an die Kamera.
- Das Ausschwingen wirkt physikalisch, nicht animiert.

**Frage an Maris nach dem Test:** Gyroskop immer gekoppelt, oder nur solange ein Finger auf dem Pad liegt? Im Labor beides als Schalter anbieten.

**Notizen:**
- 2026-10-12: Anstossen im Kern (`kern/anstoss.js`), Schwinger (`kern/schwinger.js`), Bewegungssensor geteilt mit Schwenken. Gyroskop simuliert: ruhige Hand und Schwenk bis 96 °/s ohne Stoss, Ruck 700 °/s gibt einen kräftigen. Stärke Pad auf 20 angehoben, damit ein Stoss am Rand ins nächste Bild springt. Im Labor zeigt „Kern“ den Ruck in °/s zum Einstellen der Schwelle. Von Maris abgenommen („passt“), iPhone-Test offen.
- 2026-10-12, iPhone: Gyroskop wirkte nicht, keine Frage nach der Berechtigung (vermutlich schon beim Schwenken erteilt). Geändert: Ein Ruck zählt jetzt auf allen drei Drehachsen (vorher nur zwei, und die Querrichtung erreichte den Greifer nicht), Schwelle 220 → 150 °/s. Das Labor zeigt unter „Kern“ den Sensorstatus, ob Daten kommen, und den höchsten Ruck der letzten 3 s. Gesperrter Sensor gibt jetzt eine Meldung.
- 2026-10-12, 1.1.2: Gyroskop geht in der normalen Bedienung, im Labor nicht. Ursache: Das Labor hatte alle Werte von 1.1.1 gespeichert (Schwelle 220). Ab 1.1.3 merkt es sich nur selbst verstellte Werte, alte Stände werden einmal verworfen, neuer Knopf „Zurücksetzen“.
- 2026-10-12, Maris: Gyroskop zu energisch, lieber empfindlicher und weicher, Feder langsamer. Neue Grundwerte: Schwelle 30 °/s, Empfindlichkeit 0,1 mit sättigender Kennlinie (kleine Rucke wirken, ein harter Ruck reicht knapp ins nächste Bild), Rastkraft 170 statt 360 (≈ 2 Hz statt 3 Hz), Dämpfung 0,5, Stärke Pad 14 (Tippen fühlt sich gleich an wie vorher). Ein stärkerer Ruck kurz nach einem kleinen wird nicht mehr von der Sperre verschluckt.
- 2026-10-13, Knopf zum Entkoppeln (Phase A): Maris wählt den Platz **über dem Greifer-Pad**, er schaltet **nur den Ruck** (Schwenken hat seinen Schalter im Menü). Kleiner runder Knopf (40 px) mit Telefon und Bögen, entkoppelt gedämpft und durchgestrichen, beim Antippen kurz „Gyroskop gekoppelt“ bzw. „entkoppelt“ neben dem Pad. Im Querformat ist die Spalte voll, dort sitzt er links neben dem Pad unter der oberen Leiste. Der Zustand bleibt gespeichert (`kurbel.v3`, Feld `ruck`), im Labor als Schalter „Gyroskop gekoppelt“ unter Anstossen. Koppeln fragt gleich nach dem Sensor (ein echter Tipp). Getestet mit simuliertem Ruck in Chrome (375×812 und 844×390): entkoppelt kein Stoss, gekoppelt wie vorher. Rauchtest grün.

---

## Runde 1b: Greifer mit Feder

**Status:** auf dem iPhone getestet (2026-10-12), Feder weicher ab 1.2.1

**Mechanik:** Der Filmstreifen sitzt normalerweise genau im Bildfenster. Ein Stoss lässt ihn senkrecht rutschen. Danach zieht ihn eine **Rastung** zur **nächsten stabilen Lage** (ganze Bildhöhe), auf dem **kürzesten Weg**, wie eine Feder mit **Einschwingen** (leichtes Überschwingen, dann Ruhe). Idee zur Umsetzung: ein periodisches Rastpotential, Kraft ∝ −sin(2π·Versatz/P). Damit ergibt sich die nächste Ruhelage von selbst.

**Bild:** Der Bildstrich wandert kurz durchs Bild, federt nach und sitzt wieder. Ist die Blende offen, während der Film rutscht, entstehen Schlieren aus den Lichtern. **Kopplung:** Die Schlierenlänge ist der Weg, den der Film während der offenen Blende tatsächlich zurücklegt (aus der Geschwindigkeit des Schwingers, nicht mehr aus dem festen Transportsektor).

**Schlupf (Halten), Maris 2026-10-09: „hat Potential“:** Solange der Finger auf dem Pad liegt, zieht der Greifer den Film nicht sauber. Der Film läuft gegen den Greifer, der Bildstrich rollt durchs Bild. Das ist der bisherige Zug ≠ 1, nur jetzt an den Finger gebunden.
- Die senkrechte Fingerposition gibt Richtung und Tempo: oben mehr als ein Bild pro Zug (Lücken), unten weniger, ganz unten steht der Film (Stapeln).
- Reglerweg wie früher verteilt: viel Raum für langsamen, ruhigen Schlupf nahe der Mitte, das Extreme nur am Rand (Totzone in der Mitte).
- **Loslassen:** Die Rastung übernimmt. Der Film rastet auf dem kürzesten Weg im nächsten Bild ein, mit Einschwingen. Es gibt keine eigene Rückkehr-Animation.
- Ein Gyroskop-Ruck während des Haltens gibt zusätzlich einen Stoss.

**Entfällt:** Dauerzug ohne Finger, automatische Rückkehr (`relaxGrip`, `gRelaxV`), Doppeltippen zum Einrichten.

**Achsen:** reagiert auf y. Ob x ein kleines seitliches Spiel im Filmkanal ergeben soll, als Labor-Schalter.

**Parameter (Labor):** Rastkraft, Dämpfung (Einschwingen), Masse, Kurve und Totzone des Schlupfs, maximaler Schlupf oben und unten, Schwelle Tippen gegenüber Halten (ms), seitliches Spiel an/aus.

**Erfolgskriterien:**
- Ohne Finger nie Durchlaufen, nie Zurückkriechen. Stoss: Rutschen, Einrasten, Ruhe.
- Halten nahe der Mitte ergibt einen langsamen, ruhigen Bildstrich. Das Extreme gibt es nur am Rand.
- Ein kleiner Stoss rastet zurück in dieselbe Lage, ein grosser in die nächste.
- Tippen und Halten verwechselt man nicht.
- Kein Flackern beim Einschwingen.

**Notizen:**
- 2026-10-12: Gebaut. Stoss bis etwa halbe Stärke federt zurück, ab etwa zwei Dritteln ins nächste Bild, Ruhe nach 0,6–1,2 s, Überschwingen 5–10 %. Loslassen rastet nach 0,5–1,1 s ein, danach kein Kriechen. Beim Rutschen wird das Bild nicht dunkler (wäre Flackern), nur die Lichter ziehen. Der harte Sprung vom hellen Stapel zum frischen Bild beim Loslassen bleibt wie bisher (→ 1c/1d). Kontaktbögen Stoss und Halten mit der Demo, Blende 300° bzw. 200°.
- 2026-10-12, Maris nach dem ersten iPhone-Test: zu viele Greifer-Regler im Labor. Die Grundeinstellung fühlt sich gut an, deshalb sind die Werte jetzt fest (`GREIFER` in `src/module/greifer.js`). Änderungen nur nach Bildbeobachtung, dann gezielt einen Wert vorschlagen. „Seitliches Spiel“ (war kaum sichtbar) und „Takt zur Blende“ (Rest der alten Takt-Achse) sind entfernt.

---

## Runde 1c: Überblendender Projektor (Idee 5, klein)

**Status:** im Labor, abgenommen 2026-10-12 (bleibt im Labor, bis die Kamera fertig ist)

**Mechanik:** Im Modus „Bild steht nach“ springt das Bild nicht hart zum nächsten Kurbelbild, sondern geht weich hinein, wie zwei Projektoren mit Überblendung. **Kopplung an die Blende:** offen = weicher Übergang, fast zu = hart.

**Erfolgskriterien:** Ruhiger bei 4–8 fps, das Stocken bleibt als Rhythmus erkennbar, wirkt nicht wie Zwischenbilder.

**Notizen:**
- 2026-10-12, iPhone: Maris sieht keine Wirkung, im Labor 0,00 ms. Die Rechenzeit ist echt so klein (das Mischen läuft auf der Grafikkarte, die Messung sieht davon fast nichts). Zu sehen ist die Überblendung nur bei langsamer Kurbel und weit offener Blende: bei 12 fps und 135° dauert sie 31 ms (unsichtbar), bei 4 fps und 360° die ganzen 250 ms bis zum nächsten Bild.
- 2026-10-12, iPhone (Maris): bei tiefen fps schön, weniger ruckelig und weniger Kopfweh. Länge 2 (× Blendenzeit) als Grundwert ab 1.2.3.
- 2026-10-12: Modul `ueberblenden` (Station Projektor), Grundstellung „nur im Labor an“. Maris: Blendzeit = so lange die Blende offen ist (Anteil des Kurbelbilds wie der Blendenwinkel). Nur im Modus „Bild steht nach“. Labor-Wert: Länge (× Blendenzeit). Kontaktbogen bei 6 fps, Blende 90°/270°/360° mit Vergleich ohne: grösster Sprung zwischen Ausgabebildern bei 360° von 2,7 auf 1,1, bei 90° fast wie ohne.

---

## Runde 1d: Stehender Film (Mehrfachbelichtung)

**Status:** im Labor, 1.2.6 (2026-10-13): fest Sandwich mit Lichthof 0,4, Loslassen mit weicher Kurve. Die anderen Materialien sind ins Filmmaterial verschoben (`IDEEN.md`).

**Herkunft:** Das Stapeln im Greifer („Film steht“). Maris 2026-10-12: „das Aufsummieren zu Glühen und Ausbreiten ist spannend“. Hier ohne Greiferbewegung, als eigenes Modul. Hintergrund in `IDEEN.md` (Stehender Film, Mehrumlauf-Blende).

**Mechanik:** Der Film steht im Bildfenster, die Blende dreht weiter. Jedes Kurbelbild belichtet dasselbe Stück Film noch einmal. Wie der Film auf das viele Licht reagiert, hängt vom **Material** ab (Kennlinie).
- **Kurbel** = Durchgänge pro Sekunde. Bei 4 fps baut sich das Bild langsam auf, bei 24 fps schnell. Kein eigener Tempo-Regler.
- **Blende** = wie stark jeder Durchgang einwirkt. Geschlossene Blende = Anteil 0 = Standbild, in jedem Material.

**Bedienung:** über das bestehende **Halten** (zwei Finger, Leertaste), keine neue Geste.
- Modul aus: Halten wie heute (Standbild).
- Modul an: Beim Halten steht der Film, die Kurbel dreht weiter. **Änderung im Kern:** Heute setzt Halten die Kurbel auf 0 fps (`src/kern/kurbel.js`). Mit dem Modul muss sie weiterlaufen, der Projektor zeigt das gestapelte Bild.
- **Loslassen:** Der Greifer zieht ein frisches Bild ins Fenster, weich übergeblendet, nie ein harter Sprung. Benutzt die Überblendung aus 1c, deshalb nach 1c.
- Kurbel-Label beim Halten mit offener Blende: „belichtet mehrfach“ statt „hält“ (Wortlaut mit Maris klären).

**Accum. Material (Strategie-Chat 2026-10-12, gebaut in 1.2.5, nach dem iPhone-Test 2026-10-13 wieder herausgenommen, siehe Notizen; der Code liegt im Commit c2a21dd):** Die Wahl heisst **„Accum. Material“**. Sie sagt, wie die Schichten beim Halten zusammenkommen, und wirkt **nur auf accum.**, nicht auf das normale Entwickeln jedes Bilds (dort würde Kippen von Bild zu Bild flackern). Doppel kommt eventuell später dazu (Kopplung, Schritt 2, siehe `IDEEN.md`).
- **Im Labor: Fader mit Raststellen statt Zahlen.** Der Fader springt auf feste Stellen und zeigt den Namen („Sandwich“, „Lith“ …), keine Zahl, keine Zwischenwerte. Dafür braucht das Labor einen neuen Param-Typ (z. B. `typ: 'wahl'` mit Liste der Namen), in `CLAUDE.md` bei der Schnittstelle nachtragen.
- **Raststellen**, von dunkel nach hell:
  1. **Sandwich** (Grundstellung, wie heute): Schichten übereinander wie Dias oder Bipack im Kopierwerk. Schatten setzen sich durch, Bewegtes verschwindet. Kippt nie.
  2. **Lith** (neu): harter Kopierfilm (Lith-Film). Nur Licht über einer Schwelle belichtet, alles andere bleibt schwarz. Weil aufsummiert wird, malen Lichter Spuren auf Schwarz. Für Nacht und Bühne. Die Schwelle steil, aber weich (keine harten Kanten), sonst wirkt es wie ein Schwellen-Filter.
  3. **Aufsummieren** (Umkehrfilm und Solarisation zusammengelegt): Licht addiert sich. Erst glühen die Lichter, dann breiten sie sich aus, bei sehr viel Licht kippen sie in die Solarisation. **Gesteuert über die Haltezeit**, nicht über eine eigene Wahl: kurz halten = Glühen, lange halten = Ausfressen und Kippen. Wie schnell, bestimmen Kurbel (Durchgänge pro Sekunde) und Blende (Licht pro Durchgang). So entsteht Solarisation auch bei echtem Film: durch extreme Überbelichtung. Kennlinie: Anstieg, Schulter, Solarisationsast. Wann es kippt, am Kontaktbogen einstellen (Richtwert: bei 12 fps und 180° nach etwa 8–15 s).
  4. **Farbschichten** (neu): wie Aufsummieren, aber die drei Farbschichten des Films (Rot, Grün, Blau) sättigen und kippen verschieden schnell. Überbelichtete Lichter verfärben sich leicht, bevor sie kippen, die Ringe der Solarisation bekommen farbige Ränder. Dunkles und Mitten bleiben unverändert.
- **Fällt weg:** Graufilter (wirkte wie Sandwich, leuchtet weniger). Umkehrfilm und Solarisation als getrennte Stellen (gehen in Aufsummieren auf).
- **Lichthof** bleibt an mit 0,4, für alle Raststellen.

**Nicht in dieser Runde:** Gedächtnis (wer bleibt, Altes verblasst = Mehrumlauf-Blende) bleibt fest auf „alle Durchgänge gleich“. Bewegungsbelichtung (4) ebenfalls später. Kopplung an das Stapeln im Greifer: Schritt 2.

**Umsetzung:** Station Transport, nach dem Greifer. Gesammelt wird in linearem Licht, die Kennlinie des Materials kommt erst beim Zeigen. Lange Stapel brauchen höhere Genauigkeit (WebGL mit Half-Float), sonst Farbstufen und eingefrorene Geister. Der Kontaktbogen braucht eine Möglichkeit, Halten für eine bestimmte Dauer auszulösen.

**Parameter (Labor):** Lichthof an/aus und Stärke (0,4), Dauer der Überblendung beim Loslassen (0,6 s). In 1.2.5 dazu Accum. Material und drei vorübergehende Regler (Schwelle Lith, Kippen, Abstand der Farbschichten), seit 1.2.6 wieder weg.

**Kontaktbogen (neu):** Raststellen Sandwich, Lith, Aufsummieren, Farbschichten. Je ein Standbild nach 2 s, 5 s, 15 s und 30 s Halten (30 s zeigt das Kippen), bei 6 und 18 fps, Blende 180°. Quellen: Demo und Nachtlichter.

**Erfolgskriterien:**
- Halten mit offener Blende: Das Bild baut sich über Sekunden auf, Lichter glühen und breiten sich aus. Auch nach 15 s nicht flächig reines Weiss (Umkehrfilm).
- Halten mit geschlossener Blende verhält sich wie heute.
- Die Kurbel ist spürbar: bei 4 fps langsames, bei 24 fps schnelles Aufbauen.
- Loslassen ohne harten Sprung.
- Nach 30 s Halten keine Farbstufen und keine eingefrorenen Geister.
- Kein Pulsieren, auch nicht bei Solarisation und schwankendem Licht.
- Lith: nachts malen Lichter auf Schwarz, tagsüber nur die hellsten Stellen, nie flächig weiss, keine harten Kanten.
- Aufsummieren: Das Kippen kommt allmählich mit der Haltezeit, nicht als Sprung.
- Farbschichten: wirkt wie Film, nicht wie Farbkorrektur. Verfärbt nur die überbelichteten Lichter.
- Vorschau flüssig bei 720p auf dem iPhone.

**Fragen an Maris nach dem Test:** Welche Materialien bleiben, und welches ist die Grundstellung? Solarisation behalten? Lichthof ja oder nein? Kommt das Material als Regler in die normale Bedienung, und wenn ja, wohin?

**Fragen an Maris nach dem Test des neuen Accum. Material:**
- Welche Raststellen bleiben? Lith und Farbschichten behalten?
- Reicht es, wenn die Solarisation mit der Haltezeit kommt, oder soll sie eine eigene Raststelle bekommen, um sie bewusst zu wählen?
- Für später: Kommt das Accum. Material auf den Hauptbildschirm, zum Beispiel als Schild zum Antippen neben der Quelle (wie die Filmdose an der Bolex)? Name noch offen, „KAMERA“ ist durch die Quelle belegt.

**Notizen:**
- 2026-10-12: Modul `stehenderfilm` (Station Transport nach dem Greifer), Grundstellung „nur im Labor an“, übernimmt das Halten: die Kurbel dreht beim Halten weiter (Kern: `haltenUebernommen()`). Label „accum.“ / Schild „ACCUM.“ (Maris), bei geschlossener Blende „hält“. Gesammelt wird in WebGL2 mit 32 Bit (laufende Mittel linear und logarithmisch), Material als ein Regler: 0 Sandwich (geometrisches Mittel), 0,5 Graufilter (Mittel), 0,85 Umkehrfilm (aufsummiert mit Schulter, Grundstellung), ab 0,92 Solarisation. Anteil pro Durchgang 0,5 bei 180°. Loslassen: das frische Bild blendet in 0,6 s über den Stapel.
- Kontaktbögen Demo und Nachtlichter (künstliches Video, `tests/out/nachtlichter.mp4`), 6 und 18 fps, Blende 180°, nach 2/5/15 s und 1,5 s nach dem Loslassen: Sandwich lässt Bewegtes verschwinden, Graufilter macht es zu Nebel, Umkehrfilm lässt Lichter glühen und Lichtspuren malen, nach 15 s nicht flächig weiss. 30 s bei 18 fps: keine Farbstufen, neue Durchgänge wirken weiter (keine eingefrorenen Geister).
- Beobachtet, zum Einstellen nach Maris’ Test: Umkehrfilm hebt mit der Zeit auch das Dunkle (Himmel wird grau-blau). Solarisation unterscheidet sich bei diesen Quellen kaum vom Umkehrfilm (kippt erst bei sehr viel Licht). Lichthof greift nur bei sehr hellen Stellen, bei Lichtspuren kaum sichtbar.
- 2026-10-12: Kontaktbogen von Maris abgenommen („passt“), veröffentlicht als 1.2.1 (nur im Labor). iPhone-Test offen.
- **2026-10-12, iPhone-Test 1.2.1 (Maris), für den Strategie-Chat:**
  - *Materialien:* **Solarisation** gefällt, soll aber viel schneller laufen (3–4 mal). **Umkehrfilm** schön. **Sandwich und Graufilter** wirken sehr ähnlich und leuchten weniger, eventuell weglassen. Maris denkt die Modi im Strategie-Chat noch einmal durch, deshalb bleiben vorerst alle vier im Regler.
  - *So ist es gebaut (Stand 1.2.2):* gesammelt werden zwei laufende Mittel pro Pixel in linearem Licht, 32 Bit: das arithmetische Mittel M und das geometrische G (über den Logarithmus). Gewicht W = Summe der Anteile, jeder Durchgang bringt 0,5 × Blendenwinkel/180°. Gezeigt wird je nach Material: **Sandwich** = G (Dunkles setzt sich durch, Bewegtes verschwindet), **Graufilter** = M (gleich hell, Bewegtes wird Nebel), **Umkehrfilm** = M × (1 + 0,9 · ln W) mit weicher Schulter ab 0,7 (Lichter glühen, nach 15 s nicht flächig weiss, hebt aber auch das Dunkle), **Solarisation** = dasselbe mit 3,5-mal schnellerem Anstieg, über 1 kippt es zurück (X · e^(1−X)), helle Punkte werden zu Ringen mit dunklem Kern. Regler: 0 Sandwich, 0,5 Graufilter, 0,85 Umkehrfilm (Grundstellung), ab 0,92 Solarisation.
  - *Regler entfernt:* Anteil pro Durchgang und Schulter (machten kaum einen Unterschied), jetzt fest 0,5 und 0,7.
  - *Flackern beim Loslassen behoben:* Das erste frische Bild stand ein Kurbelbild lang allein da, dann kam der Stapel zurück und blendete erst dann aus. Jetzt blendet schon das erste frische Bild über den Stapel, die Helligkeit sinkt gleichmässig.
  - *Halten neu (nur im Labor, mit Stehendem Film):* **zwei Finger = accum.** (der Film steht, die Kurbel dreht weiter, auch bei geschlossener Blende, dann kommt einfach nichts dazu), **drei Finger = hält** (Standbild, die Kurbel steht). Am Rechner: Leertaste bzw. Taste H. Achtung: iOS kennt Gesten mit drei Fingern (Rückgängig), auf dem iPhone prüfen.
  - *Lichthof:* Maris fragte, ob man das nicht mit Bewegen der Kamera erzeugt. Nein: Bewegung gibt Spuren in Bewegungsrichtung, der Lichthof ist ein runder Schein um ruhende helle Punkte (Licht streut in der Schicht und wird vom Träger zurückgeworfen), der mit der Haltezeit wächst. Maris: sichtbar machen. Neu gebaut: Licht über der Schwelle wird in einem Sechzehntel der Auflösung gesammelt und weich verwischt (Gauss, Breite wächst mit ln W), dann über das Bild gelegt. Labor-Schalter (Grundstellung aus), Stärke 1,5. Kontaktbogen Nachtlichter 12 fps, Stärke 0/1,5/3 nach 2/5/15 s: weicher Schein um die Laternen, der wächst, ohne Gittermuster.
- **2026-10-12, iPhone-Test 1.2.2 (Maris):** Solarisation 3,5-mal war definitiv zu stark, zurück auf gleich schnell wie der Umkehrfilm. Lichthof 1,5 sehr stark; **Sandwich mit Lichthof 0,4 „wunderschön“**, Sandwich jetzt cooler als Graufilter und Umkehrfilm. Neue Grundwerte (1.2.3): Material Sandwich, Lichthof an mit 0,4 für alle Materialien.
- 2026-10-12, Maris: Beim Drücken von „hält“ fiel das Bild auf ein einzelnes Bild ohne Gesammeltes zurück. Am Rechner nicht nachvollziehbar (Stapel blieb). Ab 1.2.4 friert „hält“ genau das Ausgabebild ein, das gerade zu sehen ist. Das Labor zeigt die erkannten Finger, um zu prüfen, ob iOS drei Finger abbricht. Offen: Wie Maris es gemacht hat (dritter Finger dazu oder neu ansetzen). **2026-10-13, Maris: Halten mit drei Fingern funktioniert auf dem iPhone.**
- **2026-10-12, Strategie-Chat (Materialien):** Maris mag **Solarisation und Sandwich**. Neu: Wahl heisst „Accum. Material“, gilt nur für accum., im Labor als Fader mit Raststellen (Namen statt Zahlen). Graufilter fällt weg, Umkehrfilm und Solarisation werden zu „Aufsummieren“ (Solarisation kommt mit der Haltezeit), **Lith und Farbschichten neu zum Ausprobieren**. Beobachtet beim Durchsehen: Mit zwei Fingern steuert der erste Finger weiter Kurbel und Zoom. Zoomen während accum. gibt Strahlen aus der Bildmitte wie beim Zoomen während einer Langzeitbelichtung. Mechanisch echt, behalten. Deshalb ist eine Zwei-Finger-Bewegung für die Materialwahl nicht frei.
- **2026-10-13, Accum. Material gebaut** (nur Labor): Fader mit Raststellen Sandwich · Lith · Aufsummieren · Farbschichten (neuer Param-Typ `wahl`, Wert ist der Name; alte Zahlenwerte im Labor-Speicher gelten nicht mehr, Grundstellung Sandwich).
  - *Sandwich:* unverändert (geometrisches Mittel plus Lichthof).
  - *Lith:* eigene Sammelschicht. Jeder Durchgang belichtet nur, was heller ist als die Schwelle (Grund 0,75 der Helligkeit, weicher Übergang bis 1,5-mal so hell). Darunter gar nichts, auch über lange Zeit nicht: Schwaches Licht summiert sich bei hartem Film nicht auf (Schwarzschild-Effekt). Erst mit der weichen Schwelle sammelte sich ein mittelhelles Fenster nach 30 s doch noch auf. Das Gesammelte wird als Summe gezeigt, nicht als Mittel: Eine Spur bleibt so hell, wie sie gemalt wurde, und verblasst nicht. Ein Durchgang mit vollem Licht bei 180° gibt etwa 70 % (`HART` 2,5). Lith ist für Rot fast blind: Rücklichter verschwinden, wie bei echtem orthochromatischem Film. Am Anfang des Haltens sinkt das Bild in 1,2 s weich ins Schwarz (sonst ein harter Sprung). Der Lichthof kommt nur aus dem Lith-Licht.
  - *Aufsummieren:* Kennlinie wie der Umkehrfilm (Anstieg, Schulter), dazu ein Solarisationsast. Ab einer bestimmten Belichtung fällt es weich ab (y·e^(1−y), ohne Knick). Die Belichtung kommt aus der Haltezeit: Die hellsten Lichter (voll überstrahlt) kippen bei 12 fps und 180° nach `kippen` s (Grund 8 s), bei mehr fps oder offenerer Blende früher. Weniger helle Stellen kippen viel später, so wandert der Ring langsam nach aussen. Wichtig: Ob es kippt, hängt nur am Licht selbst. Der Lichthof leuchtet weiter, das gibt den dunklen Kern mit hellem Ring. Im ersten Versuch zählte der Hof mit, dann kippte alles schon nach 3–5 s und ein mittelhelles Fenster wurde cyan.
  - *Farbschichten:* wie Aufsummieren, aber im Überbelichteten (über 1) ist Rot um den Abstand schneller und Blau langsamer. Rot kippt zuerst, gekippte Kerne werden erst cyan, dann blau, dann dunkel. Mit Abstand 0,15 waren die Kerne nach 15 s kräftig blau (eher Farbkorrektur), darum Grund 0,1.
  - Kontaktbögen mit neuem Testvideo `tests/out/laternen-hell.mp4` (drei voll überstrahlte Laternen, ein mittelhelles Fenster, ein fahrendes Licht; das alte Nachtvideo erreicht nur etwa halbe Helligkeit und kippt nie) und Demo, 6/12/18 fps, Blende 180°, nach 2/5/15/30 s. Lith: Fenster bleibt schwarz, Spur bleibt und wächst. Aufsummieren: Kippen allmählich ab etwa 10 s. Loslassen bei allen ohne Sprung. Eckige Höfe bei Lith auf Schwarz behoben (die Glocke des Verwischens läuft am Rand auf null aus, bei den anderen Materialien kaum ein Unterschied).

- **2026-10-13, iPhone-Test 1.2.5 (Maris):**
  - *Lith:* gehört zum ganzen Filmlook, nicht nur zu accum. („macht kein Sinn“ allein).
  - *Aufsummieren und Farbschichten:* kaum ein Unterschied, könnten eins sein. Farbschichten wirkt etwas natürlicher.
  - *Sandwich mit Lichthof 0,4:* auch am Tag ein guter Wert. Lichthof 0,4 war in der Nacht super, am Tag (bei den aufsummierenden Materialien) fast zu extrem.
  - *Überblendung beim Loslassen:* fühlt sich nicht gut an, zu lang oder zu kurz, der Übergang von überblendet zu einem Bild ist immer zu hart. Etwa 0,6 s ist ein guter Mittelwert, gewünscht ist eine Easing-Kurve.
  - *Entscheid:* Die Materialwahl gehört ins Filmmaterial (andere Filme mit eigenem Verhalten). Der jetzige Film nimmt fest Sandwich mit Lichthof 0,4.
- **2026-10-13, umgesetzt in 1.2.6:** Accum. Material, Lith-Sammelschicht und die drei vorübergehenden Regler entfernt. Der Stehende Film zeigt nur noch Sandwich mit Lichthof (spart eine Sammelschicht, also Speicher auf dem iPhone). Die Überblendung beim Loslassen läuft mit einer weichen Kurve (6t⁵ − 15t⁴ + 10t³): Sie beginnt und endet ohne Ruck, auch in der Geschwindigkeit. Linear änderte sich das Bild bis zum letzten Moment gleich schnell und stand dann plötzlich still, das wirkte wie ein Sprung. Kontaktbogen Laternen 12 fps: Der Hof klingt über etwa 0,5 s weich aus, ohne Knick am Ende. Der Param-Typ `wahl` bleibt im Labor für später. Der Rand des Lichthofs (Glocke läuft auf null aus) bleibt auch drin.
---

## Labor aufgeräumt, Bauplan (2026-10-13)

**Status:** gebaut, nicht veröffentlicht.

**Maris:** Im Labor nur noch, was noch eingestellt wird. Raus: Schwenken (Schalter und Bildwinkel), Blende (gibt es als Fader), Kammblende (ganz entfernt), Entwickeln (Stärke fest, gehört eher zum Filmmaterial), Anlaufblitz, Schalter des Stehenden Films (zwei Finger wählen ihn), Lichthof-Schalter, Bildstand, Greifer, alle Werte von Anstossen (gekoppelt über den Knopf). Bleiben: Handkurbel (nicht erwähnt), Stehender Film mit Stärke Lichthof und Überblendung beim Loslassen, Überblendender Projektor, Sammeln (neu/alt). Oben nur noch Kamera, Demo, Video laden und Zurücksetzen (bleibt, Maris): Vergleich („Ohne … (halten)“) und Schnappschuss sind weg. Neben dem Labor ein **Bauplan** auf dem ganzen Bildschirm: Architektur, Module, Funktionen, Griffe, Zusammenhänge und Abhängigkeiten, nicht jedes Detail.

**Notizen:**
- Was das Labor nicht zeigt, steht in `AUS_DEM_LABOR` (`src/labor/labor.js`). Ausgeblendete Module laufen im Labor immer in ihrer Grundstellung, ausgeblendete Werte gelten mit der Grundeinstellung (ein alter Labor-Stand kann nichts mehr unsichtbar verstellen). Werte mit einem Griff auf dem Bildschirm oder im Menü (Blende, Gyroskop gekoppelt, Bildstand, Anlaufblitz, Schwenken ein/aus) bleiben, wie sie dort stehen.
- Bauplan (`src/labor/bauplan.js`): Hände, Kette mit acht Stationen (mit Aufnahme), Maschinen im Kern, Fahrplan. 36 Karten, davon 7 geplant (Linse, Farbsektoren, Filme, Foto-Modus, Gedächtnis-Schicht, Bildgedächtnis). Live: Kurbel, Zoom, Quelle, Blende, Gyroskop, Zeit, Teilbelichtungen pro Kurbelbild, accum. und hält. Auf dem Telefon zeigt nur die angetippte Karte Griff und Abhängigkeiten.
- Labor-Tafel auf dem Telefon etwas kürzer, damit sie den Gyroskop-Knopf nicht verdeckt.

---

## Runde 2a: Teilbelichtungen sammeln (Kern)

**Status:** gebaut, im Labor zum Vergleichen (2026-10-13, noch nicht veröffentlicht). iPhone-Test offen. Teil der Maschine **Sammeln** (`FAHRPLAN.md`, Phase B). Hintergrund in `IDEEN.md` (Filmmaterial, Ein Film, drei Zeitfenster).

**Mechanik:** Das iPhone liefert etwa 30 Kamerabilder pro Sekunde, jedes etwa 33 ms lang. Das sind die **Teilbelichtungen**. Solange die Blende offen ist, fällt jede davon auf den Film, und zwar genau so lange, wie sich ihre Zeit mit dem offenen Fenster deckt. Ein Kurbelbild ist so schon eine kleine Mehrfachbelichtung: bei 4 fps und 360° etwa 7,5 Teilbelichtungen, bei 12 fps und 180° etwa 1,25, bei 24 fps und 135° nur ein Stück einer einzigen. Licht addiert sich dabei wie Licht (linear), nicht wie Pixelwerte.

**Heute (zum Vergleich):** Der Kern legt bei offener Blende bei jedem Bildschirm-Refresh (60 oder 120 pro Sekunde, je nach iPhone) das gerade sichtbare Kamerabild über das Gesammelte, als laufendes Mittel in 8 Bit und in Pixelwerten statt Licht (`kern/kette.js`, `sampleExposure`). Dasselbe Kamerabild zählt so zwei- bis viermal, und wie oft, hängt vom Bildschirm ab statt von der Zeit. Kein Modul sieht die einzelnen Kamerabilder.

**Bild:** Es soll gleich aussehen wie vorher. Kleine erwartete Unterschiede:
- Bewegte helle Stellen verwischen etwas heller, weil Licht sich addiert (wie bei echtem Film). Dunkles, das vor Hellem vorbeizieht, wird dafür etwas durchsichtiger.
- Die Demo läuft neu mit einem festen Takt von 30 Bildern pro Sekunde wie eine Kamera, heute wird sie bei jedem Refresh neu gezeichnet. Ihr Verwischen wird darum minimal stufiger.
- Bei kleiner Blende eher ruhiger: Heute entscheidet der Zufall des Refreshs, ob ein kurzes Fenster ein oder zwei Kamerabilder erwischt.

**Umsetzung:**
- Neu `kern/sammeln.js` mit WebGL2, Gleitkomma (16 Bit, 32 Bit wenn vorhanden). Gesammelt werden das Licht × Zeit und die Zeit selbst. Daraus wird beim Schliessen der Blende das Mittel, zurück in Pixelwerte, und das geht wie heute als `roh` ins Entwickeln. Entwickeln, Greifer, Stehender Film und Projektor bleiben unverändert in Canvas 2D.
- Jedes Kamerabild zählt genau einmal: `requestVideoFrameCallback` an Kamera und geladenem Video, die Demo mit festem 30-Hz-Takt. Ein Kamerabild gilt von seinem Eintreffen bis zum nächsten, sein Gewicht ist die Zeit, in der in dieser Spanne die Blende offen ist. So bekommt jede Millisekunde offener Blende genau ein Bild, ohne Wartezeit beim Schliessen. Mehrere Fenster (Kammblende) gehen von selbst.
- Hochgeladen wird ein Kamerabild nur, wenn es Licht bekommt.
- **Neue Station `emulsion`** in der Kette, zwischen Belichtung und Entwickeln, für jede Teilbelichtung: `{ t, licht (ms), filter: [r, g, b] }`. Ein Modul kann dort das Gewicht und die Farbempfindlichkeit dieser einen Teilbelichtung ändern. Das brauchen später die Farbsektoren (Runde 4) und ein rotblinder Film. In 2a hängt noch kein Modul dort. Schwelle und Zustand pro Pixel kommen mit ihrem ersten Rezept (2b: müder Entwickler), damit nichts auf Vorrat gebaut wird.
- Ohne WebGL2 oder ohne Gleitkomma läuft das alte Sammeln weiter.
- Zusätzlicher Speicher etwa 19 MB bei 720p (Fläche für das Kamerabild, Textur, Gleitkommafläche 16 Bit, WebGL-Bild).

**Nicht in dieser Runde:** Stehender Film, Foto-Modus, Gedächtnis-Schicht, Farbsektoren, Schwelle. Kein neuer Regler in der Bedienung.

**Parameter (Labor):** Unter „Kern“ ein Schalter **„Teilbelichtungen (neu)“** zum Vergleichen mit dem alten Sammeln. In der grauen Zeile: Kamerabilder pro Sekunde und Teilbelichtungen pro Kurbelbild.

**Kontaktbogen:** Blende 30°, 135°, 240°, 360° bei 4, 12 und 24 fps, neu und alt nebeneinander (alt mit `--setze sammeln.neu=false`). Quellen: Demo und ein Video als falsche Kamera (`--quelle`). Dazu die mittlere Helligkeit von 20 Kurbelbildern hintereinander bei 24 fps und 30°, um das Flackern bei kleiner Blende zu messen.

**Erfolgskriterien:**
- Der Kontaktbogen sieht gleich aus wie vorher, abgesehen von den erwarteten Unterschieden oben. Mittlere Helligkeit gleich.
- Bei kleiner Blende nicht unruhiger als vorher (Helligkeit von Kurbelbild zu Kurbelbild).
- Live-Kamera und geladenes Video verhalten sich gleich.
- Das Labor zeigt etwa 30 Kamerabilder pro Sekunde und bei 4 fps/360° etwa 7,5, bei 12 fps/180° etwa 1,25 Teilbelichtungen pro Kurbelbild.
- Vorschau flüssig bei 720p auf dem iPhone, „Licht sammeln“ im Labor nicht mehr als heute.
- Rauchtest grün, auch mit ausgeschaltetem neuem Sammeln.

**Frage an Maris vor dem Bau (beantwortet):** Soll der Stehende Film (accum.) schon jetzt aus den Teilbelichtungen sammeln? Heute zählt dort jedes Kurbelbild als ein Durchgang, darum baut sich das Bild bei 24 fps schneller auf als bei 4 fps (die Kurbel ist spürbar). Sammelt er aus den Teilbelichtungen, zählt die Zeit: Wie schnell es sich aufbaut, hängt dann nur an der Blende, nicht mehr an der Kurbel. Das ist mechanisch richtig (der Film steht, pro Sekunde fällt gleich viel Licht), aber die Kurbel verliert bei accum. ihre Rolle. Vorschlag: in 2a nicht, erst in 2b, wenn der müde Entwickler auch bei accum. wirken soll. **Maris 2026-10-13: erst in 2b.**

**Notizen:**
- 2026-10-13, gebaut: `kern/sammeln.js` (Kernteil „Sammeln“, im Labor unter „Kern“), eingehängt in `kern/kette.js` (`beginne` beim Öffnen, `tick` jedes Animationsbild, `schliesse` vor dem Entwickeln). Ein Kamerabild gilt von seinem Eintreffen bis zum nächsten. Trifft ein neues ein, bekommt das alte sein Licht bis dahin, beim Schliessen bekommt das letzte sein Licht bis zum Ende des Fensters. Hochgeladen wird ein Bild, sobald die Blende offen ist oder in den nächsten 45 ms öffnet. Gesammelt wird in RGBA16F mit additivem Mischen: Licht × Zeit (rgb) und Zeit (a). Beim Schliessen kommt das Mittel als Pixelwerte (Gamma 2,2 wie beim Stehenden Film) nach `acc`. Ist die Blende ganz zu, kommt wie bisher das aktuelle Bild hinein, abgeblendet wird danach.
- Station `emulsion` ist in der Kette (`STATIONEN`, Labor, `CLAUDE.md`), noch ohne Modul.
- Labor, graue Zeile unter „Kern“: Kamera 29,5–30 Bilder/s (Demo, falsche Kamera in Chrome). Teilbelichtungen pro Kurbelbild (gezählt sind die Kamerabilder, die Licht bekommen): 4 fps/360° etwa 7,5 bis 8,5, 12 fps/180° 2,5, 24 fps/135° 1,3, 24 fps/30° 1,0.
- Kontaktbögen neu gegen alt (`--vergleich sammeln.neu=false`), Blende 30°/135°/240°/360°, Demo bei 4, 12 und 24 fps, dazu `laternen-hell.mp4` als falsche Kamera bei 4 und 24 fps (30°/135°/360°): mittlere Helligkeit überall gleich (Abweichung höchstens 0,1 von 255). Bei 4 fps und 360° sind die Abdrücke bewegter Dinge gleichmässig hell, weil jedes Kamerabild nach seiner Zeit zählt. Im alten Sammeln hingen sie vom Refresh ab. Sonst kein Unterschied zu sehen.
- Rechenzeit „Licht sammeln“ am Mac in Chrome: neu 0,15–0,36 ms, alt 0,09–0,11 ms pro Animationsbild. Auf dem iPhone noch messen.
- Ohne WebGL2 (Chrome mit `--disable-webgl2`): altes Sammeln, das Labor zeigt „altes Sammeln (kein WebGL2)“, keine Fehler. Rauchtest schaltet neu und alt einmal um.
- Kontaktbogen kann jetzt `--vergleich modul.param=wert` (eine Reihe mit diesem Wert daneben) und zeigt pro Reihe die mittlere Helligkeit.

---

## Runde 3: Linse (das kaputte iPhone)

**Status:** Idee. Bis 2026-10-13 als Runde 2 geplant. Jetzt nach dem Fundament (Runde 2: Teilbelichtungen, Gedächtnis-Schicht), weil die Linse die Teilmomente innerhalb der Belichtung aus dem neuen Sammeln nutzt. Siehe `FAHRPLAN.md`.

**Mechanik (gemessen, siehe `docs/KONZEPT.md`, Teil 1):**
- Die Linse schwingt entlang **einer Achse**: der Längsachse des Sensors. Im Hochformat ist das im Bild senkrecht.
- Der Sensor liest **Zeile für Zeile**. Im Hochformat sind das senkrechte Spalten, gelesen von einer Bildseite zur anderen, in etwa 30 ms. Jede Spalte sieht die Linse an einer anderen Stelle.
- Zwei Anteile: **schnell** (etwa 860 Hz, sehr kleine Auslenkung, nur ein bis zwei Pixel im Foto) und **langsam** (einige zehn Hz, etwa 1–1,5 % der Bildhöhe, das sind die Sprünge im Video).
- Dazu der **Fokus**, der mitschwingt: Schärfe wandert in grossen Wellen durchs Bild. Bei starkem Ausschlag ganz unscharf und etwas heller.
- Die **Belichtungszeit** entscheidet, wie es aussieht: kurz = feine senkrechte Haarstriche und grosse Wellen (Foto), lang = weiches senkrechtes Verwischen (Video).

**Umsetzung:** Pro Spalte (oder Band von wenigen Pixeln): Zeitpunkt = Bildzeit + Spalte/Breite · Auslesezeit. Innerhalb der Belichtungszeit K Teilmomente abtasten, Versatz und Unschärfe aus der Linsenlage. Die Zeit ist simuliert und kontinuierlich, nicht an die 30 Kamerabilder gebunden. Wahrscheinlich ein WebGL-Durchgang. Im Querformat drehen die Achsen mit.

**Anstossen:** Die Linse wird entlang ihrer Achse angestossen und schwingt aus (Schwinger aus 1a). Ein starker Stoss lässt kurz den Fokus ausfallen.

**Parameter (Labor):** Belichtungszeit, Auslesezeit, Amplitude schnell, Frequenz schnell, Amplitude langsam, Frequenz langsam, Fokus-Anteil, Grundunruhe (wie kaputt das Gerät auch ohne Stoss ist).

**Erfolgskriterien:** gegen `referenz/` prüfen.
- Kurze Belichtung: **filigran**, feine Striche nur senkrecht, dazu grosse Fokuswellen durchs Bild, wie `referenz/linse-foto-schnee.jpg`. **Nicht** grobe Zacken wie in `referenz/linse-vergleich.png` (Panel 2). Das war zu stark gerechnet.
- Lange Belichtung: wie Bild 98 in `referenz/linse-video-normal-dann-defekt.mov` (Panel 3 und 4 in `linse-vergleich.png` passen).
- Kontaktbogen mit Referenzbild daneben. Als Quelle die normale erste Hälfte des Videos.

**Notizen:**
