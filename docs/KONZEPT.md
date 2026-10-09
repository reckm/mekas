# Mekas: Konzept für die Weiterarbeit

Stand 6. Oktober 2026, zweite Fassung mit der Analyse des Videos vom kaputten Telefon. Dieses Papier ist ein Entwurf für eine oder zwei Feedback-Runden. Am Ende stehen die Fragen, die entschieden werden müssen, bevor Code geändert wird.

**Kurzfassung:**

- Das kaputte iPhone zeigt dasselbe Prinzip wie die Schlieren der Bolex: Das Bild bewegt sich, während es belichtet wird.
- Das Video bestätigt das. Die Linse schwingt entlang einer Achse mit etwa 860 Hz, und man hört sie. Die Belichtungszeit entscheidet, ob daraus Zacken (Foto) oder Verwischen (Video) werden.
- Daraus folgt ein gemeinsamer Kern für alle Bildbewegungen: ein **Schwinger**. Du stösst ihn an, er schwingt aus und kommt zur Ruhe.
- Mekas bekommt **Kameramodelle**. Jedes Modell hat denselben Körper, aber eigene Organe, eine eigene Belegung rechts und eigene Grundwerte.
- Die UI wird kleiner: Die Seitwärts-Achsen (Takt und Schlitze) fallen weg. Der Greifer wird vom Dauerzustand zur Geste.

---

## 1. Was das Foto zeigt

### Beobachtung

- **Grosse Welle:** Waagrechte und schräge Kanten (Strasse, Schneekante, Hangkante) laufen in einer langen Welle über das Bild, zwei bis drei Bögen über die Bildbreite.
- **Feine Zacken:** Auf denselben Kanten sitzen kleine, regelmässige Zähne wie bei einem Reissverschluss: Dachkante, Strassenrand, Kragen, Baumkrone.
- **Senkrechte bleiben gerade:** Pfosten und die Figur stehen fast unverzerrt, haben aber ausgefranste Ränder.
- **Schärfe in Bahnen:** Einige Bereiche sind unscharf und verwischt, andere direkt daneben relativ scharf.

### Erklärung

Zwei Uhren laufen gegeneinander:

1. **Der Sensor liest nicht das ganze Bild auf einmal**, sondern Zeile für Zeile, in etwa 20 bis 30 ms. Bei einem Hochformatbild laufen diese Zeilen senkrecht, das Telefon liest das Bild also Spalte für Spalte von einer Seite zur anderen. Das ist der **Rolling Shutter**, ein elektronischer Schlitzverschluss.
2. **Die Linse hängt bei diesem iPhone nicht mehr ruhig.** Bildstabilisator und Autofokus halten sie normalerweise mit Magnetspulen in Position. Ist der Regelkreis kaputt, schwingt die Linse, und zwar offenbar mit zwei Frequenzen: einer langsamen (die grosse Welle) und einer sehr schnellen (die Zacken).

Jede Spalte wird in einem anderen Moment gelesen und sieht deshalb die Linse an einer anderen Stelle ihrer Schwingung. So wird aus einer Schwingung in der Zeit eine Welle im Raum. Die Schärfe hängt von der Geschwindigkeit der Linse ab: Wo sie gerade umkehrt, ist das Bild scharf, wo sie schnell durchschwingt, verwischt es. Bewegt sich die Linse dabei auch in der Tiefe, wandert zusätzlich der Fokus. Das ist Idee 15, „Fokus sucht“.

Ich habe das mit einem einfachen Testbild nachgerechnet (Datei `zeilenwelle.png`, links das Original, rechts mit Spaltenauslesung und schwingender Linse). Grosse Welle, Zacken und gerade Pfosten entstehen genau so. Die Hypothese trägt also.

### Was das Video dazu sagt

Das Video vom kaputten Telefon (4,7 s, 30 fps, Hochformat) bestätigt die Erklärung und macht sie genauer. Gemessen, nicht nur angeschaut:

- **Eine einzige Achse.** Alle Sprünge zwischen den Bildern gehen senkrecht, um 12 bis 20 Pixel hin und her, seitlich null. Auch das Verwischen geht nur senkrecht: Waagrechte Kanten (Fensterrahmen, Markisenkante) verschmieren, die senkrechten Markisenstreifen bleiben fast scharf. Das ist dieselbe Richtung wie die Welle im Foto. Die Linse schwingt also nicht wild, sondern entlang einer Achse, der Längsachse des Sensors.
- **Die Linse singt.** Im Ton erscheint ein feiner, gleichbleibender Ton bei **etwa 860 Hz**, dazu die Oktave bei 1720 Hz. Er setzt leise ein, sobald das Bild unruhig wird, und ist am lautesten genau dort, wo das Bild springt (ab etwa 3 s). Die Magnetspule, die die Linse hält, arbeitet wie ein kleiner Lautsprecher. Das ist sehr wahrscheinlich die schnelle Schwingung selbst. Die Zahl passt zum Foto: Bei 860 Hz und der Auslesezeit eines Fotos ergeben sich einige Dutzend Zacken über die Bildbreite, und so viele sind es dort ungefähr.
- **Dazu kurze Klacker.** Zwischen 3,5 und 4,7 s gibt es breitbandige Knackser, ungefähr dort, wo das Bild springt. Möglicherweise schlägt die Linse an ihren Anschlag. Das ist weniger sicher als der Ton.
- **Phasen, nicht Dauerzustand.** Der Fehler baut sich auf: erst leicht weich, dann senkrecht verwischt, dann einzelne Bilder ganz unscharf und heller (der Fokus fällt mit aus, Idee 15). Der Bildausschnitt wirkt zwischendurch etwas grösser, wahrscheinlich Fokus-Atmen oder die Bildstabilisierung der Software, die mehr Rand braucht.

**Die wichtigste neue Erkenntnis:** Foto und Video zeigen denselben Defekt, aber die **Belichtungszeit** entscheidet, wie er aussieht.

- **Kurz belichtet** (Foto im Schnee, Bruchteil einer Millisekunde): Jede Spalte friert die Linse an einer Stelle ein. Das ergibt Welle und Zacken.
- **Länger belichtet** (Video): Jede Spalte sieht mehrere Schwingungen. Das ergibt ein weiches Verwischen in einer Richtung, wie eine Doppelkontur.

Das habe ich mit einem Bild aus deinem Video nachgerechnet (`linse-vergleich.png`, eine Schwingung von 860 Hz). Die lange Belichtung trifft das echte Bild 98 sehr genau. Genau diese Kopplung hatte Idee 13 vorhergesagt: Bei kurzer Belichtung zittert es nervös, bei langer wird es zum Vibrato.

### Was das für Mekas heisst

Das Foto bestätigt nicht nur 13, 14 und 15, es verbindet sie mit dem, was Mekas schon kann:

| | Bolex (heute in Mekas) | Kaputtes iPhone (Foto) |
|---|---|---|
| Was sich bewegt | der Film (Greifer) | die Linse (Bildstabilisator) |
| Was belichtet | die Blende, offen über 240° | der Sensor, Zeile für Zeile |
| Spur im Bild | Schlieren aus den Lichtern, in Zugrichtung | kurz belichtet Welle und Zacken, lang belichtet Verwischen in einer Richtung |
| Was man hört | Greifer und Motor rattern | Linse singt bei etwa 860 Hz |

**Es ist dieselbe Grammatik: Bewegung während der Belichtung.** Damit ist auch Idee 17 erledigt: Die LED-Streifen fallen weg, aber ihr Prinzip, die zeilenweise Zeit, ist genau das, was dein Foto zeigt. Idee 2 („Gedehnter Schlitzverschluss“) ist die analoge Verwandte davon.

---

## 2. Deine Punkte

**Mehrumlauf-Blende (1):** Ja, im Prinzip ein erweiterter Wertebereich des Blendenfaders oberhalb von 360°. Zwei Dinge sind aber nicht ganz „gratis“:

- Die Akkumulation darf beim neuen Kurbelbild nicht mehr gelöscht werden, sie muss **nachklingen**: Jedes neue Bild kommt hinzu, die alten verblassen langsam. Das ist eine kleine Änderung an `acc`.
- Heute erzeugt die Blende über 240° die Schlieren beim Greiferzug. Über 360° würden sich die Schlieren aufschaukeln. Vorschlag: Ab 360° werden die Schlieren schwächer und das Nachklingen übernimmt. Auf dem Fader markiert ein Strich die 360°, darüber beginnt „mehr als analog“.

**Kopierdurchgänge (9):** Richtig beobachtet. McLaren filmte Tänzer vor Schwarz. Auf hellem Schnee ergeben Echos nur Grau. Im Kopierwerk gab es dafür ein echtes Mittel: hart arbeitenden Kopierfilm (Lith-Film), der nur die Lichter durchlässt. Eine **Schwelle** („nur Lichter kopieren“) macht die Durchgänge auch bei mittlerem Licht brauchbar. Trotzdem gehört 9 in ein Modell, dessen Material eher dunkel ist: Bühne, Nacht, Konzert. Damit passt es zum Gedanken der Kameramodelle.

**Pendelbild (7) per Gyroskop:** Ja, und zwar am natürlichsten beim **Anhalten**. Heute friert „Zwei Finger halten“ das Bild ein. Neu könnte das Bild beim Halten zwischen den letzten zwei Bildern liegen, und das Neigen des Telefons schaukelt dich vom einen zum anderen. Das braucht kein neues Bedienelement.

**10, 11 und 12 einfach erklärt:**

- **10 Zweiter Projektor:** Zwei Projektoren zeigen denselben Film auf dieselbe Leinwand, einer läuft eine Spur langsamer. Erst decken sie sich, dann entsteht ein Echo, das immer weiter auseinanderläuft und irgendwann wieder deckungsgleich wird. Musikalisch ist das genau **Steve Reichs Phasenverschiebung** („Piano Phase“), nur im Bild. Technisch braucht es ein Bildgedächtnis von ein bis zwei Sekunden.
- **11 Fliessendes Standbild:** Ein stehendes Bild bleibt nicht starr, sondern wird von der Bewegung der echten Szene verschoben wie nasse Farbe, bis das nächste Bild kommt. Das ist im Kern **Datamosh**, also ein Videokompressionsfehler. Es ist digital und widerspricht deiner Linie. **Vorschlag: streichen.**
- **12 Lichtzug:** Statt zufällig zu zittern, wird das Bild ein paar Pixel zum hellsten Punkt gezogen. Dafür gibt es ein echtes analoges Vorbild: Alte **Röhrenfernseher „atmen“**, das Bild wird bei hellen Szenen etwas grösser, weil die Hochspannung nachgibt. **Vorschlag: parken**, bis es ein Röhren-Modell gibt (siehe 4.3).

**18 gegenüber Teil A:** Gleiche Rechnung, andere Kopplung.

- **1 (Mehrumlauf):** Du entscheidest, wie lange belichtet wird. Mechanisch, von Hand, analog.
- **18 (Nachtverarbeitung):** Das Gerät entscheidet nach Licht, je dunkler, desto länger. Automatisch, digital.

Es ist **dasselbe Organ mit einem anderen Antrieb.** Genau das ist der Unterschied zwischen den Modellen: Das Bolex-Modell bekommt 1, das Telefon-Modell 18.

---

## 3. Vereinfachen, bevor Neues dazukommt

**Raus aus der UI:**

- **Takt** (Greifer seitwärts) und **Schlitze** (Blende seitwärts) entfallen als Bedienung. Ihr Effekt ist zu klein für eine Achse. Was davon bleibt, wird zu einer festen Eigenschaft des Modells: Die Bolex hat eine durchgehende Blende und einen festen Takt, das Kopierwerk einen Kamm (Zeitkamm, Idee 3).
- Der **Greifer als Dauerzustand** entfällt. Kein durchlaufender Zug, keine automatische Rückkehr.

**Neu: ein Knopf „Anstossen“** an der Stelle des heutigen Greifer-Pads, rechts über der Blende.

- Ohne Berührung: Die Mechanik ist ruhig und läuft sauber.
- Knopf halten und das Telefon ruckartig bewegen: Das Gyroskop gibt dem **Schwinger** Energie. Ein schneller Ruck bedeutet einen starken Stoss, ruhiges Halten keinen.
- Loslassen: Der Schwinger klingt von selbst aus. Das ist keine Animation zurück, sondern Dämpfung wie bei einer Feder.
- Ohne Gyroskop (Rechner oder ohne Erlaubnis): Halten gibt einen gleichmässigen, sanften Stoss.

Ein Ruck mit dem Telefon bewegt natürlich auch die Kamera. Das ist physikalisch ehrlich: Wer eine Kamera anstösst, sieht den Stoss im Bild.

**Der Schwinger ist der gemeinsame Kern** aller Bildbewegungen. Je nach Modell bewegt er etwas anderes:

| Modell | Was schwingt | Wie es belichtet wird | Spur im Bild |
|---|---|---|---|
| Bolex | Filmstreifen (senkrecht) | ganzes Bild auf einmal, Blende | Bildstrich rutscht, Schlieren, rastet in Zugrichtung ein |
| Telefon | Linse, eine Achse, schnell (etwa 860 Hz), dazu der Fokus | Spalte für Spalte | kurz belichtet Welle und Zacken (Foto), lang belichtet Verwischen (Video) |
| Kopierwerk | Abstand der zwei Projektoren (Zeit) | ganzes Bild | Echo läuft auseinander und wieder zusammen |

Pendel (7), Zug (Greifer), Linse (13–15) und Zweiter Projektor (10) werden damit **eine Bedienung**, so wie du es angeregt hast.

---

## 4. Kameramodelle

### Was ein Modell ist

Ein Modell ist kein Preset mit anderen Werten, sondern ein **Gehäuse** mit:

1. **Organen:** Welche Teile der Pipeline aktiv sind und wie sie gekoppelt sind.
2. **Belegung rechts:** Ein Fader und der Knopf Anstossen, jeweils mit eigener Bedeutung.
3. **Grundwerten:** Kurbel, Bildstand, Ton, Zeit-Modus.

**Gleich für alle Modelle** bleiben: Wischen übers Bild (Kurbel und Zoom), Auslöser, Doppel, Fertig, Quelle und das Halten mit zwei Fingern (neu mit Pendel). Wer ein Modell kann, kann alle.

### 4.1 Bolex: Film, 1960

Für Tageslicht, Menschen, Reise, den „Lost Lost Lost“-Ton.

- **Fader:** Blende 0–360°, darüber Mehrumlauf (1).
- **Anstossen:** Greifer rutscht, Bildstrich wandert, rastet in Zugrichtung ein.
- **Organe:** Kurbel 4–24, Handkurbel-Unregelmässigkeit, Bildstand, Anlaufblitz, Überblendender Projektor (5), Doppel, Unterdreht.
- **Weg:** Takt, Schlitze, Greifer-Pad.

Das ist im Wesentlichen das heutige Mekas, aufgeräumt.

### 4.2 Telefon: das kaputte iPhone

Für das Heute, mit der Mechanik deines Geräts. Name offen, ich würde keinen Markennamen verwenden.

- **Fader:** **Belichtungszeit**, an derselben Stelle wie die Blende der Bolex. Unten ist sie kurz, dann entstehen Welle und Zacken wie im Foto. Oben ist sie lang, dann verwischt das Bild weich in einer Richtung wie im Video. Der Fader bleibt also über die Modelle hinweg derselbe Griff, nur die Mechanik dahinter ändert sich. Die Auslesezeit des Sensors ist fest eingebaut, wie beim echten Telefon.
- **Anstossen:** Die Linse wird angestossen und schwingt entlang ihrer Achse aus. Bei starkem Stoss fällt kurz auch der Fokus aus und das Bild wird weich und etwas heller, wie in den schlimmsten Bildern des Videos.
- **Organe:** Linse auf Federn (13, 14), Fokus sucht (15), Linsenwechsel beim Zoomen (16), Nachtverarbeitung (18) statt Mehrumlauf.
- **Ton (Option):** Die Linse singt hörbar mit, ein leiser Ton um 860 Hz, dessen Lautstärke der Schwingung folgt. Das ist kein aufgesetzter Effekt, sondern dieselbe Kopplung wie im echten Gerät. Bei der Bolex wäre das Gegenstück das Rattern des Greifers.

Das ist der eigentliche neue Beitrag des Projekts: ein Analogfilm-Instrument für die Mechanik von heute.

### 4.3 Kopierwerk: Optical Printer

Für **geladenes Material**, also deine Tour-Videos aus Japan und der Schweiz, für Bühne und Nacht. Ein Kopierwerk filmt einen bestehenden Film neu ab. Das ist genau „Video laden“.

- **Fader:** Durchgänge, von einer Kopie bis zu mehreren Echos in festem Abstand (9).
- **Anstossen:** Der zweite Projektor wird verschoben, sodass das Echo auseinanderläuft und zurückfindet (10).
- **Organe:** Schwelle „nur Lichter“, Zeitkamm (3), Mehrumlauf.

Dieses Modell schliesst den Kreis zum Anfang: dem Trailer aus dem Tourmaterial.

### Später vielleicht: Röhre (Video, 1970)

Bild atmet mit Helligkeit (12), Nachleuchten, Zeilen. Vorerst geparkt.

### Wie man wechselt

Wie die Quelle oben links: ein Antippen schaltet zyklisch Bolex, Telefon, Kopierwerk. Wechsel nur, wenn nicht aufgenommen wird. Beim Laden eines Videos schlägt Mekas das Kopierwerk vor, erzwingt es aber nicht.

---

## 5. Varianten und Alternativen

| | Idee | Stärke | Schwäche |
|---|---|---|---|
| **A** | **Feste Gehäuse** (wie oben) | Jedes Modell ist klar und hat wenig UI. Es fühlt sich an wie ein Instrument. | Keine Mischungen, etwa Bolex mit loser Linse. |
| B | **Ein Körper, wechselbare Teile**: Objektiv (Glas, Telefonlinse, kaputt) und Antrieb (Film, Sensor, Kopierwerk) getrennt wählbar | Viele Kombinationen | Mehr Menü, eher ein Baukasten als ein Instrument |
| C | **Keine Modelle, ein Zustand**: ein einziger Regler von „neu“ bis „kaputt“, der alles gleichzeitig lockert | Am einfachsten | Am wenigsten Kontrolle, eher ein Effekt |
| D | **Modelle als Presets** im heutigen UI | Schnell gebaut | Löst die überladene UI nicht |

**Empfehlung:** A für die Bedienung, intern gebaut wie B, also mit Organen als Module. So bleibt B später möglich, ohne dass man es jetzt im UI sieht.

---

## 6. Reihenfolge

0. **Hosting über https** (zum Beispiel GitHub Pages oder Netlify Drop). Das ist Voraussetzung für Gyroskop, Kamera-Erlaubnis und iPhone-Tests. Danach die **Aufräumarbeit** aus Teil 3: Takt und Schlitze weg, Greifer-Pad weg.
1. **Schwinger und Anstossen** im Bolex-Modell, plus Pendel beim Halten. Das ist der Kern, und am Bolex lässt er sich am besten beurteilen.
2. **Mehrumlauf** auf dem Blendenfader.
3. **Telefon-Modell** mit Welle und Verwischen. Die Werte stammen aus dem Video: eine Achse, etwa 860 Hz, Sprünge um 1 bis 1,5 % der Bildhöhe.
4. **Kopierwerk** mit echtem Tourmaterial.

**Unterdreht** bleibt vorerst eine Bolex-Eigenschaft. Was dich daran nicht überzeugt, gehört in die nächste Runde.

---

## 7. Fragen für die nächste Runde

1. **Modelle:** Passt Variante A (feste Gehäuse)? Oder lieber B oder C?
2. **Die drei Modelle:** Bolex, Telefon, Kopierwerk. Fehlt etwas, ist etwas zu viel? Hast du Ideen für Namen?
3. **Anstossen:** Soll der Greifer nach dem Ausschwingen in die nächste Bildlinie einrasten (Bild sauber) oder dort stehen bleiben, wo er zur Ruhe kommt (Bildstrich bleibt sichtbar, bis du wieder anstösst)?
4. **Gyroskop:** Ruck (Stoss, klingt aus) oder Neigung (solange du neigst, bleibt die Auslenkung)? Ich empfehle den Ruck, weil er mechanischer ist und das Bild in Ruhe lässt.
5. **Kopierwerk und Tourmaterial:** Ist das ein echter Anwendungsfall für dich, also Mekas als Werkzeug für den Trailer?
6. **Hörbare Mechanik:** Soll der Ton der Mechanik mit in die Aufnahme, also das Singen der Linse beim Telefon und das Rattern des Greifers bei der Bolex? Wenn ja: immer, oder nur als Schalter pro Modell?
7. **Unterdreht:** Was genau überzeugt dich nicht, der Bedienablauf, das Ergebnis oder das Warten beim Entwickeln?
