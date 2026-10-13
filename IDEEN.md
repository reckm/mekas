# Ideen

Was später kommen könnte. Nummern in Klammern verweisen auf `docs/zwischen-den-frames.md`. Eine Idee wird erst zur Modulkarte in `MODULE.md`, wenn Maris sie für eine Runde auswählt.

## Bildbewegung (nutzen den Schwinger)

- **Pendel beim Halten (7):** (Hinweis: im Labor sind zwei Finger seit Runde 1d „accum.“, drei Finger „hält“.) Das Halten hält das Bild nicht starr an, sondern zwischen den letzten zwei Bildern. Neigen oder Anstossen schaukelt vom einen zum anderen.
- **Linse auf Federn (14):** Ohne Defekt, die gesunde Linse schwingt nach einem Ruck leicht nach. Eventuell Teil der Linse (Runde 3) als „Grundunruhe 0“.
- **Fokus sucht (15):** Bild atmet unscharf und wieder scharf, mit minimaler Grössenänderung. Teilweise schon in der Linse (Runde 3).
- **Zweiter Projektor (10):** Zwei Schichten derselben Szene, leicht verschieden schnell. Laufen auseinander und finden zurück wie Steve Reichs Phasenverschiebung. Braucht ein Bildgedächtnis von 1–2 s.

## Belichtung und Zeit

- **Stehender Film (Mehrfachbelichtung), zusammen mit der Mehrumlauf-Blende (1).** Ausgangspunkt: das Stapeln im Greifer („Film steht“), Maris 2026-10-12: das Glühen und Ausbreiten beim Aufsummieren ist spannend. Neu als eigenes Modul ohne Greiferbewegung. **Auslösen und Sandwich mit Lichthof sind als Runde 1d gebaut (im Labor, Karte in `MODULE.md`). Die anderen Materialien stehen unter Filmmaterial.** Hier bleibt der Rest, vor allem Achse B.
  - *Mechanik:* Der Film steht, die Blende dreht weiter. Jedes Kurbelbild belichtet dasselbe Stück Film noch einmal. Kurbel = Durchgänge pro Sekunde, Blende = Licht pro Durchgang. Kein eigener Tempo-Regler.
  - *Auslösen:* über das bestehende **Halten** (zwei Finger). Halten bei geschlossener Blende = Standbild wie heute, Halten bei offener Blende = Mehrfachbelichtung. Loslassen: Der Greifer zieht ein frisches Bild ins Fenster, weich übergeblendet (siehe Runde 1c). Dafür muss die Kurbel beim Halten weiterdrehen (heute fps = 0), das ist eine Änderung im Kern.
  - *Achse A, Material (wie reagiert der Film auf viel Licht):* Sandwich/Bipack (dunkler, Schatten bleiben stehen, gut bei Schnee) ← Graufilter (gleich hell, Stehendes satt, Bewegtes wird Nebel) → Umkehrfilm mit Schulter (heller, Lichter glühen und breiten sich aus, ohne hart ins Weiss zu laufen) → hinter einem Strich: Solarisation (Überbelichtetes kippt ins Dunkle, höchstes Digital-Risiko). Variante: nur Veränderung belichtet (Bewegungsbelichtung, 4).
  - *Achse B, Gedächtnis (wer bleibt):* das Erste brennt sich ein (Film erschöpft) – alle gleich – das Neueste (Altes verblasst). Das Neueste ist die Mehrumlauf-Blende: Blende über 360° hinaus, Akkumulation klingt über mehrere Bilder nach, ab 360° werden die Schlieren schwächer, Strich auf dem Fader bei 360°.
  - *Stand 2026-10-13:* Der jetzige Film nimmt fest Sandwich mit Lichthof 0,4 (auch am Tag gut). Die anderen Materialien sind ins **Filmmaterial** verschoben (unten).
  - *Offen:* Ob das Stapeln im Greifer (Runde 1b) später dasselbe Material benutzt: Kopplung, Schritt 2.
  - *Technik:* gelöst mit WebGL2 und 32 Bit (laufende Mittel), keine Farbstufen nach 30 s. Solarisation kann bei schwankendem Licht pulsieren.
- **Nachtverarbeitung (18):** Dasselbe Nachklingen wie beim Stehenden Film (Gedächtnis „das Neueste“), aber automatisch nach Licht: je dunkler, desto länger. Der „digitale Antrieb“ derselben Mechanik wie 1.
- **Zeitkamm (3):** Bild in breite Streifen, jeder Streifen zeigt einen etwas anderen Moment.
- **Bewegungsbelichtung (4):** Neues Licht nur dort, wo sich etwas bewegt.
- **Bildstrich als Zeitnaht (8):** Oberhalb des rollenden Bildstrichs ein etwas früherer Moment.
- **Unterdreht überarbeiten:** wirkt noch wie „TikTok-Vorspulen“. Ideen: lange Belichtung plus Kamerabewegung (Marie Menken), Stösse (Mekas), Pixilation (McLaren). Maris klärt später, was genau nicht überzeugt.

## Kopierwerk (für geladenes Material, aber nicht darauf beschränkt)

Kommt ganz am Schluss (`FAHRPLAN.md`, Phase F). Bis dahin soll geladenes Video einfach ähnlich brauchbar sein wie Live-Kamera (Maris 2026-10-13).

- **Kopierdurchgänge (9):** Echos in festem Abstand wie McLarens Tanzfilm. Funktioniert vor dunklem Grund.
- **Schwelle „nur Lichter kopieren“:** wie harter Lith-Kopierfilm. Macht 9 auch bei mittlerem Licht brauchbar. Wird als Raststelle „Lith“ im Accum. Material zuerst ausprobiert (Runde 1d).

## Röhre (Video, 1970)

- **Röhre atmen (12, neu gefasst):** Bei hellen Szenen wird das Bild etwas grösser und zieht sich langsam zurück, weil die Hochspannung nachgibt. Maris: „Genau so Bildeffekte suchen wir.“ Kandidat für eine frühe Runde.
- Nachleuchten der Röhre, sichtbare Zeilen: noch offen, ob das zu sehr nach Overlay aussieht. Das Nachziehen (Kometenschweife) ist jetzt ein Rezept der Gedächtnis-Schicht (siehe Filmmaterial).

## Licht

- **Blitz und Strobo:** Die Taschenlampe des iPhones brennt nur, solange die Blende offen ist, getaktet auf die aktuellen fps. Jedes Kurbelbild friert die Bewegung ein, wie Edgertons Stroboskop. Der Film flackert nicht, der Raum schon. **Vorsicht:** 4–12 Hz liegt genau im Bereich, der für Kopfweh und lichtempfindliche Menschen heikel ist, deshalb weich an- und ausblenden statt hart blitzen und einen deutlichen Hinweis zeigen. **Zuerst klären:** Lässt Safari auf dem iPhone die Taschenlampe überhaupt ansteuern (`torch` als Kamera-Einstellung), und wie schnell schaltet sie?

## Filmmaterial (andere Filme)

Ein anderer Film in der Kamera verhält sich überall anders: bei jedem Bild, bei accum., bei Doppel. Deshalb keine Materialwahl nur fürs Halten (Maris 2026-10-13). Hintergrund: Maris’ Recherche „Filmchemie physikalisch simulieren“ (Research-Chat). Gebaut und auf dem iPhone ausprobiert in 1.2.5 (Code im Commit c2a21dd, `src/module/stehender-film.js`):
- **Lith (harter Kopierfilm), als ganzer Filmlook:** Jedes Bild belichtet nur, was heller ist als eine Schwelle (Grund 0,75, weicher Übergang bis 1,5-mal so hell), der Rest bleibt schwarz. Schwaches Licht summiert sich auch über lange Zeit nicht (Schwarzschild-Effekt). Beim Sammeln eine Summe statt eines Mittels: Spuren bleiben so hell, wie sie gemalt wurden (`1 − e^(−2,5·Summe)`). Fast blind für Rot (Rücklichter verschwinden). Der Lichthof kommt nur aus dem Lith-Licht. Maris: als accum. allein ergibt es keinen Sinn, als ganzer Film schon.
- **Umkehrfilm mit Farbschichten (Aufsummieren und Farbschichten zusammengelegt):** Licht addiert sich, Schulter ab 0,7, dann der Solarisationsast `y·e^(1−y)`, wenn die Belichtung (Mittel × (1 + 0,9·ln Gewicht)) über den Kippunkt steigt. Die hellsten Lichter kippen bei 12 fps und 180° nach etwa 8 s, weniger helle viel später, der Ring wandert langsam nach aussen. Nur das Licht selbst entscheidet übers Kippen, der Lichthof leuchtet weiter (dunkler Kern, heller Ring). Im Überbelichteten ist Rot um 0,1 schneller und Blau langsamer: gekippte Kerne erst cyan, dann blau, dann dunkel. Maris: kaum ein Unterschied zum Aufsummieren ohne Farben, Farbschichten wirkt etwas natürlicher.
- **Lichthof:** 0,4 ist nachts super, am Tag bei den aufsummierenden Materialien fast zu extrem (der Hof wächst dort mit dem aufsummierten Licht). Beim Sandwich auch am Tag gut.
- **Doppel, Kopierdurchgänge (9), Mehrumlauf-Blende (1)** würden dasselbe Material benutzen (siehe unten).
- Offen: wie man den Film wechselt (Filmdose, Schild neben der Quelle?), und ob das zusammen mit den Gehäusen kommt.

### Ein Film, drei Zeitfenster (Strategie-Chat 2026-10-13)

Maris: Filme sollen einen **Charakter über die ganze Zeit** haben, nicht nur bei accum. Bei accum. zeigt sich der Charakter dann umso mehr. Angelehnt an Chemie und Physik, nicht nachgebaut („physikalisch gekoppelt, nicht korrekt“). Prüfsteine: entsteht über Zeit, nichtlinear, voneinander abhängig, was vorher war prägt was kommt. Hintergrund: Recherche „Filmchemie physikalisch simulieren“ und Skizzenseite „Mekas Filmküche“ (Artifact, Lith und müder Entwickler hatten Potential; Standbilder in tiefer Auflösung taugen nicht zum Beurteilen von Zeit).

- **Teilbelichtungen:** Das iPhone liefert etwa 30 Kamerabilder pro Sekunde, die Kurbel zeigt 4–24. Jedes Kurbelbild ist schon eine kleine Mehrfachbelichtung (4 fps/360°: etwa 7,5 Kamerabilder, 6 fps/180°: 2,5, 12 fps/180°: 1,25, 24 fps/135°: etwa 0,5). Ein Film wirkt auf jede Teilbelichtung (ein Kamerabild, etwa 33 ms). Das Zeitfenster entscheidet, wie viele zusammenkommen: **Kurbelbild** (Blende offen, 30–250 ms), **accum.** (Sekunden), **Foto-Modus** (Anzahl und Tempo frei).
- **Zwei Maschinen:**
  1. **Sammeln (Kern):** wann, wie viel und durch welches Filter jede Teilbelichtung auf den Film kommt. Dazu gehören die Emulsion (weiche Schwelle pro Teilbelichtung: kurze, schwache Teilbelichtungen gehen verloren, Takt-Film; Farbempfindlichkeit, z. B. Lith rotblind) und die Farbsektoren (unten).
  2. **Gedächtnis-Schicht:** ein Zustand pro Pixel, den Licht verändert und der sich mit der Zeit erholt. Er lebt von Kurbelbild zu Kurbelbild weiter und ändert sich glatt mit etwa 30 Hz, auch bei geschlossener Blende (die Zeit läuft). Die Kurbel schaut nur hin. Kein neuer Zufall pro Kurbelbild, das schützt vor Flackern. Eine Maschine, viele **Rezepte**:

  | Rezept | Was das Licht tut | Spur hinter Bewegtem | Ausbreitung zu Nachbarn |
  |---|---|---|---|
  | Müder Entwickler | verbraucht Entwickler, grosse helle Flächen gedämpft, kleine Lichter funkeln | dunkel, erholt sich in Sekunden | ja (Säume an Kanten) |
  | Lith | Schwarz steckt Nachbarn an, warme Lichter, harte Schatten | Schatten wachsen, wo es dunkel bleibt | ja (Ansteckung) |
  | Röhre (Vidicon) | lädt die Schicht, Ladung baut sich langsam ab | hell (Kometenschweif), im Dunkeln stärker | leicht (Blooming) |
  | Photochrom | dunkelt eine Vorschicht wie eine selbsttönende Brille | dunkel, ohne Säume | nein |
  | Netzhaut | ermüdet je Farbe | Nachbild in der Gegenfarbe | nein |

  Kopplungen: **Anstossen = Rühren** (frischer Entwickler, Säume und Spuren verschwinden; ruhig halten = Standentwicklung). Langsam kurbeln heisst mehr Teilbelichtungen pro Bild und damit mehr Verbrauch. **Bromid-Schlieren** als Teil des müden Entwicklers: Unter Lichtern ziehen weiche Schlieren nach unten, „unten“ nach Gyroskop. Risiken: Säume dürfen nicht nach HDR oder „Klarheit“ aussehen. Die Ansteckung darf nicht am Bildfenster kleben (sähe aus wie Schmutz auf der Linse), sie muss verblassen, wenn sich das Bild bewegt. Rechenzeit Entwickler geschätzt 3–10 ms.
- **Farbsektoren in der Blende:** eine Sammelregel. Die Teilbelichtungen gehen reihum durch einen roten, grünen und blauen Sektor (wie Kinemacolor 1908 und der Harris-Shutter von Kodak). Was stillsteht, hat normale Farben, was sich bewegt, bekommt Farbsäume. Kurbel und Blende bestimmen die Breite. Sind in einem Kurbelbild weniger als drei Teilbelichtungen, behält jede Farbschicht ihr letztes Licht. Sonst zeigt ein Kurbelbild nur eine Farbe und flackert stark. Digital-Risiko: Den Harris-Shutter gibt es als Plug-in (Boris FX), die Säume müssen weich und aus der Mechanik kommen. Verwandt mit der Kammblende (Fenster mit Filter statt Schlitze).
- **Foto-Modus (Maris):** eine flexible Anzahl Teilbelichtungen in einem flexiblen Tempo zu einem Foto summiert. Dieselbe Maschine mit einem dritten Zeitfenster, derselbe Film.
- **Später oder eher nicht:** Ausbleichen (Anthotypie, Gedächtnis über Minuten: eher Foto-Modus, im Lauf nah am Overlay). Selbstmaskierung (Auskopierpapier: ohne Gedächtnis nur eine Kennlinie, eher accum.). Korn aus dem Modell (im Lauf neue Körner pro Kurbelbild = Flimmern, Regel 3 und 4), vorerst nicht. **Alter-Fader** statt „Rolle altert“: Der Film altert über eine Rolle (Bolex 100 ft = 4000 Bilder, 2:47 min bei 24 fps). Später, eventuell als Regler „Alter“.
- **Vorbilder:** [Filmulator](https://github.com/CarVac/filmulator-gui/wiki) (müder Entwickler, offline), [Guy J. Brown: Digital Lith](https://www.guyjbrown.com/posts/digital-lith/) (Ansteckung, offline), [Flickr Lith Printing](https://www.flickr.com/groups/1113988@N24/), [AV Artifact Atlas: image lag](https://avartifactatlas.com/artifacts/image_lag.html) (Röhre), [Kinemacolor](https://en.wikipedia.org/wiki/Kinemacolor), [Photochromic lens](https://en.wikipedia.org/wiki/Photochromic_lens), [Afterimage](https://en.wikipedia.org/wiki/Afterimage).

### Fahrplan Filmmaterial (Stand 2026-10-13, eingeordnet im globalen `FAHRPLAN.md`: 1–2 sind Runde 2, 3–5 sind Runde 4)

1. **Kern: Teilbelichtungen sammeln.** Heute legt der Kern bei offener Blende bei jedem Bildschirm-Refresh (60 oder 120 pro Sekunde, nicht im Kameratakt) das aktuelle Kamerabild in Canvas 2D über das Gesammelte (laufendes Mittel, 8 Bit, nicht in linearem Licht, `kern/kette.js`, `sampleExposure`). Dasselbe Kamerabild zählt so oft mehrfach, und kein Modul sieht die einzelnen Kamerabilder. Neu:
   - Jedes echte Kamerabild zählt genau einmal (`requestVideoFrameCallback`, auch für Video). Die Demo bekommt einen festen 30-Hz-Takt. Das Gewicht ist die Zeit, in der die Blende während dieses Kamerabilds offen ist.
   - Gesammelt wird in WebGL mit Gleitkomma in linearem Licht (wie beim Stehenden Film).
   - Neue Stelle in der Kette für jede Teilbelichtung, an der die Emulsion ansetzt (Schwelle, Farbempfindlichkeit, Farbsektor).
   - Zustand, der über die Kurbelbilder lebt (für die Gedächtnis-Schicht).
   - Derselbe Weg für Kurbelbild, accum. und Foto-Modus. Hilft auch der Linse (Runde 3, Teilmomente innerhalb der Belichtung).

   Sichtbar ändert sich nichts. Der Kontaktbogen muss gleich aussehen wie vorher, höchstens ruhiger bei kleiner Blende. Grösster Umbau im Kern seit Runde 0, Speicher auf dem iPhone beachten (eine Gleitkommafläche bei 720p etwa 15 MB).
2. **Gedächtnis-Schicht mit dem Rezept „müder Entwickler“**, dazu Anstossen = Rühren. Der erste Film mit Charakter über die ganze Zeit.
3. **Weitere Rezepte:** Lith, Röhre, eventuell Photochrom und Netzhaut. Jedes eher klein, weil die Maschine steht.
4. **Farbsektoren in der Blende.**
5. **Foto-Modus.**

Skizzen ab jetzt im Labor mit Live-Kamera und Video auf dem iPhone, nicht mehr als Standbild.

## Gehäuse und Kopplungen (Schritt 2)

- **Kameramodelle als Gehäuse:** Bolex, Telefon, Kopierwerk, Röhre. Jedes mit eigener Belegung rechts und eigenen Grundwerten. Siehe `docs/KONZEPT.md`, Teil 4.
- **Filmmaterial auch für Doppel:** Doppel legt die zweite Schicht heute additiv drauf (wie Aufsummieren). Mit Sandwich würden sich die Schatten der zweiten Schicht durchsetzen, Doppel funktioniert dann auch auf Schnee und hellem Himmel. Später ebenso für Kopierdurchgänge (9) und Mehrumlauf-Blende (1). Dann verdient die Wahl ein eigenes Schild auf dem Hauptbildschirm.
- **Kopplungen zwischen Modulen und Doppelfunktionen:** Welche Module bedingen sich gegenseitig? Erst angehen, wenn die Module einzeln abgenommen sind.
- **Ein Instrument mit allen Funktionen** als langfristiges Ziel.

## Sonstiges

- **Objektiv-Charakter:** Mitte scharf, Ränder weich.
- **Einzeldatei zum Mitnehmen:** Skript, das alles in eine HTML-Datei packt.
- **Automatisch in einen Ordner „Mekas“ sichern:** aus dem Browser nicht möglich. Weg über einen iOS-Kurzbefehl.
- **Gangart des Greifers (6):** unregelmässiger Rhythmus als Metrum, eventuell im Tempo eines Stücks.
- **Linsenwechsel (16):** Beim Zoomen springt das Bild leicht, weil eine andere Kamera übernimmt.

## Aufgefallen in Runde 0 (2026-10-09, nicht auf der Karte, deshalb nicht angefasst)

- **Labor: geteilte Ansicht** (links mit, rechts ohne Modul). Braucht die Kette zweimal pro Bild. Erst, wenn klar ist, wie viel Rechenzeit das iPhone übrig hat.
- **Greifer-Pad und Blendenfader liegen über dem Einstellungsblatt** (auf dem Handy rechts unten). War in der alten `mekas.html` schon so.
- **Veraltete Meldungen:** „Öffne die Datei direkt im Browser“ (Kamera gesperrt, Sichern) stammt aus der Zeit vor GitHub Pages. Die Texte im Menü sind schon angepasst.
- **Querformat: Das Greifer-Pad deckt den Knopf Einstellungen zu** (aufgefallen 2026-10-13 beim Gyroskop-Knopf, 844×390): Die rechte Spalte reicht bis fast an den oberen Rand und liegt über dem Zahnrad. Dazu achtet die Spalte nicht auf den seitlichen sicheren Rand (Notch im Querformat).
- **Seitliches Spiel im Filmkanal** (Runde 1b, Labor-Schalter): war kaum zu sehen und ist wieder raus. Falls es fehlt: grösserer Weg, nur bei kräftigem seitlichem Stoss.
