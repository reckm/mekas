# Zwischen den Frames

Dieser Bericht hat drei Teile. **Teil 1** erklärt, was in Kurbel heute technisch passiert, mit den Begriffen, die danach vorkommen. **Teil 2** zeigt alle Vorschläge auf einen Blick: was du sehen würdest, ausgehend von dem, was du schon kennst. **Teil 3** enthält die genauen Beschreibungen mit Herkunft, Risiken und Aufwand, zum Nachlesen, wenn dich eine Idee interessiert.

Neu gegenüber der ersten Fassung ist die **Mechanik des iPhones selbst**: schwebende Linsen, Magnetspulen, mehrere Kameras, zeilenweises Auslesen. Was dort schiefgehen kann, ist genauso „analog in einem Gerät von heute“ wie die Bolex in einem Gerät von 1960.

---

# Teil 1: Was in Kurbel heute passiert

## Der Weg eines Bildes

Jedes Bild in Kurbel durchläuft fünf Stationen. Fast alle Vorschläge setzen an genau einer davon an.

1. **Kamera.** Das iPhone liefert etwa 30 Bilder pro Sekunde. Das sind die **Kamerabilder**. Kurbel kann an ihnen nichts ändern, nur auswählen und verrechnen.
2. **Belichtung (Blende).** Die Kurbel bestimmt, wie oft ein neues Bild „belichtet“ wird, also die **Kurbelbilder** (1 bis 24 pro Sekunde). Solange die Blende offen ist, werden alle Kamerabilder, die in dieser Zeit ankommen, übereinandergelegt und gemittelt. Daraus entsteht das Verwischen. Die Kammblende teilt diese Zeit in schmale Schlitze, dann werden nur einzelne Momente gesammelt und es entstehen Fragmente.
3. **Entwickeln.** Je länger die Blende offen war, desto heller wird das Bild, sanft begrenzt. Ganz zu wird es schwarz.
4. **Filmstreifen (Greifer).** Kurbel hat einen kleinen virtuellen Filmstreifen von drei Bildhöhen. Das neue Bild wird ins Bildfenster gelegt. Dann zieht der Greifer den Streifen weiter: genau ein Bild (normal), weniger (die Bilder überlappen sich, der Bildstrich rollt), gar nicht (die Bilder stapeln sich als Licht) oder mehr (Lücken). Ist die Blende noch offen, während der Greifer zieht, entstehen Schlieren aus den Lichtern.
5. **Projektor.** Das Bild aus dem Bildfenster wird angezeigt, mit einem kleinen Zittern pro neuem Bild (**Bildstand**). In der Aufnahme wird es 24-mal pro Sekunde gespeichert.

## Die zwei Zeit-Modi

- **Bild steht nach:** Die Zeit läuft echt. Bei 6 fps bleibt jedes Kurbelbild etwa vier Ausgabebilder lang stehen. Ton bleibt synchron. Fachbegriff: **Step-Printing**.
- **Unterdreht:** Jedes Kurbelbild kommt genau einmal in den Film. Langsam gekurbelt läuft die Zeit im Film schneller ab, wie bei der Bolex.

## Begriffe, die im Bericht vorkommen

- **Kamerabild:** eines der etwa 30 Bilder pro Sekunde, die das iPhone liefert.
- **Kurbelbild:** ein von Kurbel belichtetes Bild (1–24 pro Sekunde).
- **Ausgabebild:** eines der 24 Bilder pro Sekunde in der fertigen Datei.
- **Kurbelperiode:** die Zeit zwischen zwei Kurbelbildern, bei 6 fps also etwa 167 ms.
- **Öffnungswinkel:** wie lange die Blende pro Kurbelbild offen ist. 360° bedeutet die ganze Kurbelperiode. Analog liegt die Grenze bei 360°, die Bolex hat etwa 135°.
- **Bildgedächtnis (Ringpuffer):** eine Reihe gespeicherter vergangener Bilder. **Heute hat Kurbel fast keines:** Ausser dem Filmstreifen (drei Bildhöhen) und den Doppel-Aufnahmen merkt sich Kurbel nichts. Viele Vorschläge brauchen ein kleines Bildgedächtnis von etwa 8 bis 40 Bildern. Das ist der wichtigste technische Unterschied zu heute.
- **Überblenden:** zwei Bilder weich ineinander übergehen lassen, statt hart zu wechseln.
- **Zeitversatz:** verschiedene Teile eines Bildes zeigen verschiedene Momente.
- **Flackern:** grossflächige Helligkeitssprünge mehrmals pro Sekunde. Bewegung und Stocken sind harmlos, Helligkeitssprünge nicht.

## Die Leitregel aus der Recherche

Das Gehirn baut Bewegung aus dem **Unterschied** zwischen zwei Bildern, nicht aus dem Dunkel dazwischen. Bei 4 bis 12 fps (83 bis 250 ms pro Bild) liegt genau die Kante, an der flüssige Bewegung in einzelne Bilder zerfällt. Deshalb ist dieser Bereich so ausdrucksstark. Daraus folgt: **Zeit sammeln statt Zwischenbilder erfinden.** Die harte Dunkelphase zwischen den Bildern, die beim echten Film Flackern verursacht, kann Kurbel weglassen.

---

# Teil 2: Alle Vorschläge auf einen Blick

Die Nummern verweisen auf die Details in Teil 3. ★ markiert die Empfehlungen zum Testen.

## A. Was zwischen zwei Kurbelbildern passieren kann (Film-Mechanik weitergedacht)

| Nr. | Name | Was du sehen würdest | Wo du es spielst |
|---|---|---|---|
| 1 ★ | **Mehrumlauf-Blende** | Wie das Verwischen bei offener Blende, nur über mehrere Bilder. Stehendes bleibt scharf und satt, Bewegtes wird zu Nebel, Lichter ziehen lange, weiche Bahnen. | Blende über die heutige Obergrenze hinausschieben |
| 2 | **Gedehnter Schlitzverschluss** | Bei sehr langsamem Kurbeln biegen sich bewegte Dinge leicht, oben ein Hauch später als unten. Bei 24 fps fast unsichtbar. | Entsteht beim langsamen Kurbeln, kein Regler |
| 3 ★ | **Zeitkamm** | Wie die heutigen Fragmente, aber räumlich: Das Bild ist in breite Streifen geteilt, jeder Streifen zeigt einen etwas anderen Moment. | Blende seitwärts (heutiger Kamm) |
| 4 | **Bewegungsbelichtung** | Wie Stapeln bei stehendem Greifer, aber nur dort, wo sich etwas bewegt, kommt neues Licht. Der Rest bleibt als Standbild. | Greifer ganz runter |
| 5 ★ | **Überblendender Projektor** | Statt hart von Bild zu Bild zu springen, geht ein stehendes Bild weich ins nächste über. Ruhiger, weniger Kopfweh. | Blende: offen heisst weich, zu heisst hart |
| 6 | **Gangart des Greifers** | Der unregelmässige Rhythmus, in dem neue Bilder kommen, wird hörbar wie ein Metrum, auf Wunsch im Tempo eines Stücks. | Einstellung im Menü |
| 7 | **Pendelbild** | Kurbel auf null: Das Bild friert nicht ein, die letzten zwei Bilder pendeln langsam ineinander. Bewegung, die nirgends hinführt. | Kurbel ganz runter |
| 8 | **Bildstrich als Zeitnaht** | Wie der heutige rollende Bildstrich, aber oberhalb liegt ein etwas früherer Moment als unterhalb. | Greifer (heute) |
| 9 | **Kopierdurchgänge** | Wie Doppel, aber mehrfach in festem Abstand: eine Bewegung fächert auf wie in McLarens Tanzfilm. | Doppel mehrfach antippen |
| 10 | **Zweiter Projektor** | Zwei Schichten derselben Szene, leicht verschieden gekurbelt. Sie laufen auseinander und finden wieder zusammen, eine sichtbare Schwebung. | Doppel antippen, weiterkurbeln |
| 11 | **Fliessendes Standbild** | Ein stehendes Bild wird von der Bewegung der Welt geschoben und gedehnt, bis das neue Bild kommt. Höchstes Risiko, digital zu wirken. | Greifer |
| 12 | **Lichtzug** | Statt zufälligem Zittern zieht helles Licht das Bild ein paar Pixel zu sich. | Bildstand (heute) |

## B. Was die Mechanik des iPhones hergibt (neu)

| Nr. | Name | Was du sehen würdest | Wo du es spielst |
|---|---|---|---|
| 13 ★ | **Lose Linse** | Der Effekt vom kaputten iPhone deiner Freundin: Die Linse schwingt schnell im Gehäuse. Bei kurzer Belichtung zittert das Bild nervös, bei langer wird das Zittern zu einem feinen Vibrato aus Doppelkonturen. | Neuer Zustand des Bildstands, gekoppelt an die Blende |
| 14 ★ | **Linse auf Federn** | Das Bildzittern kommt nicht mehr vom Zufall, sondern von deiner Hand: Bewegst du das iPhone ruckartig, schwingt das Bild leicht nach, wie eine Linse, die an Federn hängt. | Bildstand, gesteuert vom Bewegungssensor des iPhones |
| 15 | **Fokus sucht** | Das Bild atmet: Es wird kurz unscharf und wieder scharf und verändert dabei minimal seine Grösse, wie wenn der Autofokus im Dunkeln sucht. | Ausgelöst beim Zoomen oder bei wenig Licht |
| 16 | **Linsenwechsel** | Beim Zoomen springt das Bild an bestimmten Punkten leicht zur Seite und ändert Farbe und Helligkeit, weil eine andere Kamera übernimmt, kurz überblendet. | Zoom-Geste |
| 17 | **Zwei Uhren** | Unter LED-Licht wandern helle und dunkle Querstreifen langsam durchs Bild, weil Lampe und Kamera in verschiedenen Takten laufen. | Greifer-Takt, nur sehr langsam |
| 18 | **Nachtverarbeitung** | Im Dunkeln verschmiert Bewegung zu Aquarell, weil das iPhone mehrere Bilder zusammenrechnet. In Kurbel: je dunkler, desto länger das Gedächtnis. | Automatisch, gekoppelt an das Licht |

## Was ich zuerst testen würde

1. **Überblendender Projektor (5):** am einfachsten, und er macht alles Weitere ruhiger.
2. **Lose Linse und Linse auf Federn (13, 14):** Sie bringen die Mechanik deiner Zeit in die Kamera. Beides setzt am Bildstand an, den es schon gibt, und braucht kein Bildgedächtnis.
3. **Mehrumlauf-Blende (1):** über das Analoge hinaus, aber mechanisch logisch.
4. **Zeitkamm (3):** testet die Frage nach dem Zeitversatz innerhalb des bestehenden Kamms.

Die Begründungen stehen am Ende von Teil 3.

---

# Teil 3: Die Details

## Das Gehirn erfindet die Bewegung aus der Differenz, nicht aus dem Dunkel

Die alte Erklärung für Kino heisst „Nachbildwirkung" (persistence of vision): Ein Bild bleibt im Auge stehen, bis das nächste kommt. In der Wahrnehmungsforschung gilt sie als überholt. Max Wertheimer zeigte 1912 mit einem Tachistoskop zwei abwechselnd aufleuchtende Reize, und seine Versuchspersonen sahen Bewegung, die physisch nie gezeigt wurde. Heute unterscheidet man zwei Phänomene. **Beta-Bewegung** ist der Eindruck, ein *Objekt* wandere von A nach B, und sie ist die Grundlage von Film und Animation. **Phi** ist eine objektlose, „schattenhafte" Bewegung *zwischen* den Reizen ([Wikipedia: Phi phenomenon](https://en.wikipedia.org/wiki/Phi_phenomenon); [Wikipedia: Beta movement](https://en.wikipedia.org/wiki/Beta_movement)). Steinman, Pizlo und Pizlo argumentierten 2000, dass beide auf verschiedenen Verarbeitungsebenen entstehen ([Vision Research](https://www.sciencedirect.com/science/article/pii/S0042698900000869)). Reines Phi verlangt laut neueren Replikationen Lücken von **höchstens etwa 150 ms** ([Wikipedia](https://en.wikipedia.org/wiki/Phi_phenomenon)). Norman McLaren hat dieses Prinzip für Künstler auf eine Formel gebracht: Animation sei die „manipulation of the differences between successive frames". Belegt ist das über einen Brief, den Georges Sifianos 1995 im *Animation Journal* veröffentlichte ([Animation Studies Blog](https://blog.animationstudies.org/?p=1562)). Der berühmtere Satz „What happens between each frame is much more important than what exists on each frame" wird ihm breit zugeschrieben, ist aber in den gelesenen Quellen nicht im Original nachgewiesen ([Animation Obsessive](https://animationobsessive.substack.com/p/two-views-of-movement)). Die Zuschreibung ist also plausibel, aber unsicher.

Warum 12 fps (und darunter) reizvoll ist, lässt sich an diesen Zeitfenstern ablesen. Lehrbücher nennen für Wertheimers Versuche grob drei Zonen: um 30 ms Lücke erscheinen zwei Reize gleichzeitig, um 60 ms entsteht „optimale" Bewegung, ab etwa 200 ms sieht man zwei getrennte Bilder nacheinander ([Wikipedia: Interstimulus interval](https://en.wikipedia.org/wiki/Interstimulus_interval)). Diese Zahlen sind nicht aus der Primärquelle geprüft und hängen stark von Abstand und Helligkeit ab. Legt man die Kurbel daneben, ergibt sich ein klares Bild. Bei 24 fps (42 ms) liegt man sicher in der Bewegung. Bei 12 fps (83 ms) ist die Bewegung noch zusammenhängend, aber jeder Sprung ist schon spürbar. Bei 4–6 fps (170–250 ms) kippt sie in eine Abfolge. Der Schwerpunkt 4–12 fps spannt also genau den Übergang auf, an dem das Gehirn sichtbar arbeiten muss, um die Lücke zu schliessen. Dass Zeichentrick „on twos" (12 Zeichnungen pro Sekunde) so gut funktioniert, ist Handwerkswissen. Eine Wahrnehmungsstudie dazu fand die Recherche nicht.

Ein zweiter Mechanismus betrifft das iPhone-Display direkt. Moderne Bildschirme sind **Sample-and-Hold-Displays**: Sie halten jedes Bild die ganze Bilddauer lang stehen, statt es wie ein Projektor kurz aufblitzen zu lassen. Das Auge folgt einer Bewegung aber gleichmässig über das stehende Bild, und daraus entstehen Unschärfe und Doppelkonturen. Blur Busters fasst das als Faustregel: **1 ms Haltezeit ergibt 1 Pixel Unschärfe pro 1000 Pixel/s Bewegung** ([Blur Busters](https://blurbusters.com/blur-busters-law-amazing-journey-to-future-1000hz-displays-with-blurfree-sample-and-hold/)). Bei 8 fps steht jedes Bild 125 ms. Der Ruck (Judder) wird stark, und ohne Gegenmittel wirkt das stroboskopisch und „digital". Analog wirkende Gegenmittel gibt es zwei: eingebrannte Bewegungsunschärfe (grosser Blendenwinkel) und weiche Übergänge (Nachleuchten). Beide *sammeln* Zeit, statt Zwischenbilder geometrisch zu *erfinden*. Das ist die wichtigste Designregel dieses Berichts. Konkret gerechnet bei 30 fps Kameraeingang: Ein 180°-Bild bei 12 fps entspricht dem Mittel aus etwa 1,25 Kamerabildern, ein 360°-Bild aus 2,5, ein 360°-Bild bei 4 fps aus 7,5 (eigene Rechnung).

## Flackern ist der Preis der Dunkelphase, und digital braucht man sie nicht

Die kritische Flimmerfusionsfrequenz (CFF, die Frequenz, ab der ein pulsierendes Licht ruhig wirkt) liegt für kleine Reize bei Bildschirmhelligkeiten um **34–52 Hz**. Sie steigt mit der Helligkeit, und bei bildfüllenden Reizen liegt sie mindestens etwa 15 Hz höher ([Chapiro et al. 2023](https://achapiro.github.io/cha23/cha23.pdf)). Darum zeigt ein Kinoprojektor jedes Bild zwei- oder dreimal, mit dem Ergebnis 48 bzw. 72 Hz (Standardwissen, in dieser Recherche nicht an der Primärquelle geprüft). Das iPhone-Display mit 60 oder 120 Hz liegt darüber. Riskant ist also nicht das Display, sondern der **Inhalt**, nämlich Helligkeitswechsel zwischen den Bildern des Instruments.

Die Richtlinien sind sich einig. ITU-R BT.1702 stuft eine Sequenz als problematisch ein, wenn **mehr als drei Blitze pro Sekunde** auftreten **und** die Blitze zusammen **mehr als ein Viertel der Bildfläche** einnehmen. Als Blitz zählt ein Hin-und-zurück-Wechsel mit mindestens 20 cd/m² Unterschied. Übergänge zu oder von gesättigtem Rot gelten unabhängig von der Helligkeit als schädlich ([ITU-R BT.1702-2](https://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.1702-2-201910-S!!PDF-E.pdf)). WCAG 2.3.1 formuliert dieselbe Drei-Blitze-Regel mit einer relativen Schwelle von etwa 10 % Helligkeitsänderung ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)). Die genauen Detailwerte stammen dort aus Vorwissen, weil die Seite nicht abrufbar war. Die Epilepsy Society nennt **3–30 Hz** als häufigste Auslöser und **16–25 Hz** als den kritischsten Bereich ([Epilepsy Society 2025](https://epilepsysociety.org.uk/sites/default/files/2025-04/PhotosensitiveepilepsyApril2025.pdf)). Für das Projekt heisst das: Die Kurbel selbst (1–24 fps) liegt mitten in diesem Band. Tony Conrad fand für *The Flicker* (1966) die stärkste stroboskopische Wirkung **zwischen 6 und 16 Hz**, und sein Publikum klagte über Kopfschmerzen und Übelkeit ([Wikipedia: The Flicker](https://en.wikipedia.org/wiki/The_Flicker)). Ein harter Bildwechsel bei 8 fps ist an sich harmlos, solange sich zwischen den Bildern nur Formen bewegen. Gefährlich wird er, wenn eine Lampe, ein Fenster oder ein Schwenk von hell nach dunkel bei jedem Bildwechsel grossflächig springt. Für nicht-epileptische Kopfschmerzen fand die Recherche keine belastbaren Schwellen. Es gibt Hinweise auf Unbehagen durch Flimmern sogar unterhalb der Sichtbarkeit (Wilkins et al. zu LED-Flimmern, [PDF](https://ece.northeastern.edu/groups/power/lehman/Publications/Pub2010/2010_9_Wilkins.pdf)), aber das Paper wurde nicht gelesen.

Interessant ist ein Befund, der dem zuwiderläuft. Ken Jacobs entdeckte bei seinem *Nervous System*, dass Scheiben mit **mehr Dunkelphase** zwischen den zwei Bildern **mehr räumliche Tiefe** erzeugen. Alfons Schilling riet ihm: „Try giving it more black" ([Bright Lights Film Journal](https://brightlightsfilm.com/shapes-through-time-and-space-an-interview-with-ken-jacobs-about-his-abstract-3d-film-3x3d/)). Das „throbbing flickering" gehörte ausdrücklich zum Werk ([Mark Webber](https://markwebber.org.uk/archive/category/seasons/ken-jacobs-nervous-system/)). Die Analogtechnik bezahlt ihre stärksten Zwischenbild-Effekte also mit Schwarz. Das Instrument braucht kein Schwarz, weil kein Film transportiert werden muss. Jede Idee unten übersetzt deshalb Dunkelphasen in eine von drei ruhigen Formen: weiche Überblendung, Wechsel im Raum statt in der Zeit (Streifen, Kamm) oder Akkumulation. Ob dabei etwa Jacobs' Tiefeneffekt erhalten bleibt, ist offen.

Als Sicherheitsnetz für alle Ideen empfiehlt sich ein unsichtbarer **Blitzwächter**. Er verkleinert jedes Ausgabebild auf etwa 32×18 Pixel, misst pro Bild die Helligkeitsänderung und den betroffenen Flächenanteil, zählt Hin-und-zurück-Wechsel in einem gleitenden Sekundenfenster und erzwingt bei mehr als drei Wechseln eine Überblendung. Den Rotkanal überwacht er separat. Der Rechenaufwand ist vernachlässigbar (Inferenz aus den Richtlinien, nicht als fertige Lösung recherchiert).

## Belichtung: was sich innerhalb eines Kurbelbildes sammelt

Die ersten vier Ideen betreffen den Moment, in dem Licht auf den „Film" fällt. Analog ist er streng begrenzt: Die Umlaufblende muss schliessen, damit der Greifer transportieren kann. Digital kann man diese Grenze verschieben.

### 1. Mehrumlauf-Blende

**Zwischen den Frames:** Analog sind höchstens 360° möglich, also Belichtung über die ganze Bilddauer. Die Mehrumlauf-Blende lässt den Winkel weiterdrehen, auf 720°, 1440° und mehr. Ein Kurbelbild enthält dann auch das Licht der Zeit von Bild n−1, n−2 und so weiter. Zwischen zwei Bildern geht nichts verloren. Jedes Bild ist ein gleitendes Mittel über die letzten Umdrehungen. Was stillsteht, bleibt scharf und satt. Was sich bewegt, wird zu Nebel oder verschwindet ganz. Lichter ziehen weiche Bahnen.
**Herkunft:** Hiroshi Sugimotos *Theaters* (ab 1978) belichten einen ganzen Spielfilm auf ein Negativ. Die Leinwand wird weiss, der Kinosaal tritt hervor ([Wikipedia](https://en.wikipedia.org/wiki/Hiroshi_Sugimoto)). Dazu kommt die Langzeitbelichtung des Step-Printing, typischerweise 6–12 fps bei 180–360° ([Yaroflasher](https://flashboards.yaroflasher.com/learn/post-production/step-printing/)).
**Kopplung:** Es gilt die Bolex-Formel, nur verlängert: Belichtungsdauer = Winkel/360 × 1/Kurbelrate. 1440° bei 2 fps sind 2 Sekunden Licht pro Bild. Steht der Greifer (Stapeln), ist das der Grenzfall „unendlicher Winkel".
**Spielen:** Dieselbe Blenden-Geste, die bei 360° an einer spürbaren Raste kurz anhält (eine optische Markierung oder ein kurzer Widerstand) und danach in „Umläufen" weiterzählt. Es kommt kein neuer Regler dazu.
**Flackern / Digital-Look:** Flackern gibt es praktisch keines, denn die Idee wirkt selbst als Tiefpass gegen Blitze. Digital-Risiko entsteht durch 8-Bit-Rundung: Bei kleinen Mischanteilen bleiben Reste als „eingefrorene" Geister stehen oder es bilden sich Farbstufen. Abhilfe schaffen eine Textur mit höherer Genauigkeit (Half-Float) oder ein leichtes Rauschen (Dithering). Ein *festes* Zeitfenster (Mittel über genau N Bilder) wirkt mechanischer als ein endlos ausklingender Schleier, weil jedes Licht nach genau N Umläufen wirklich verschwunden ist.
**Browser:** Am besten in WebGL. Die Variante „ausklingend" braucht nur 2 Bildspeicher (unter 10 MiB bei 720p). Das feste Fenster braucht N gespeicherte Kurbelbilder, also zum Beispiel 8 × 2 MiB bei 540p. In Canvas2D ist die Idee mit Transparenz-Zeichnen möglich, leidet aber stark unter der Rundung.

### 2. Gedehnter Schlitzverschluss

**Zwischen den Frames:** Der Kamerasensor des iPhones liest Zeile für Zeile aus (Rolling Shutter). Die untere Zeile ist also Millisekunden jünger als die obere. Diese Idee dehnt das auf menschliche Zeitmassstäbe: Zeile y stammt aus dem Zeitpunkt t − y·k. Zwischen Bild n und n+1 wandert eine Wellenfront durchs Bild, und jede Zeile zeigt als Nächstes, was ihre Nachbarzeile eben gezeigt hat. Ruhende Dinge bleiben unverzerrt, nur Bewegtes biegt sich.
**Herkunft:** In Zbigniew Rybczyńskis *The Fourth Dimension* (1988) stammt Zeile 1 aus Bild t, Zeile 2 aus t−1 und so weiter. Drehende Figuren „bend and twist like melting plastic" ([John Coulthart](https://www.johncoulthart.com/feuilleton/2012/06/13/the-fourth-dimension/), Beschreibung aus zweiter Hand). Daniel Crooks spricht von einer „plane of cohesion", einer Tiefe, in der Streifenversatz und Kamerabewegung sich aufheben und das Bild ganz bleibt. In seinen späteren *Static*-Arbeiten wich das Stakkato einer Fluidität, „in which the footage begins to stretch and melt" ([QAGOMA](https://www.qagoma.qld.gov.au/stories/daniel-crooks-motion-studies)).
**Warum das nicht wie der verworfene Lartigue-Versuch wirkt:** Erstens ist der Zeitversatz **auf eine Kurbelperiode begrenzt**. Das ist genau die Zeit, die ein echter Schlitzverschluss bräuchte, liefe er so langsam wie die Kurbel. Bei 24 fps ist das kaum mehr als der Rolling Shutter des iPhones selbst. Erst bei 2–4 fps wird es deutlich, und man entdeckt den Effekt durch langsames Kurbeln, statt ihn einzuschalten. Zweitens wird zwischen benachbarten Zeitpunkten weich gemischt, sodass keine Treppen entstehen. Drittens läuft der Schlitz **in Greifer-Richtung** und existiert nur, während der Film läuft. Steht der Greifer, fällt der Keil auf null zusammen, und alle Zeilen zeigen denselben Moment. Viertens gibt es keine Wahl von Richtung, Kurve oder Zeitgradient. Es bleibt ein einziger, physikalisch lesbarer Verschluss.
**Kopplung:** Die Kurbel bestimmt die Gesamtspanne. Die Blende bestimmt, wie lang jede Zeile belichtet: schmal ergibt scharfe Zeitkanten, weit ergibt verschmierte. Der Greifer bestimmt die Richtung, und ein Stopp setzt den Keil auf null.
**Spielen:** Kein Regler, es ist schlicht die Eigenschaft des Verschlusses bei niedriger Kurbelrate. Wenn überhaupt, gibt es einen einmaligen Schalter „Umlaufblende / Schlitzverschluss" als Einstellung der Kamera, nicht als Spielregler.
**Flackern / Digital-Look:** Flackern ist niedrig, weil jede Zeile in sich zeitlich stetig ist. Ein Digital-Look entsteht nur, wenn die Spanne zu gross wird. Deshalb ist die harte Obergrenze von einer Periode der Kern der Idee.
**Browser:** WebGL2 mit einem Bildgedächtnis (Ringpuffer) als Textur-Stapel. Gespeichert werden die Kamerabilder einer Kurbelperiode, bei 2 fps also 15 Bilder. Bei 360p sind das etwa 14 MiB. In Canvas2D lässt sich die Idee mit Zeilenbändern aus mehreren Zwischenspeichern grob nachbauen, dann aber mit sichtbaren Stufen.

### 3. Zeitkamm

**Zwischen den Frames:** Die bestehende Kammblende wird zur Zeitblende. Jeder Zahn zeigt einen anderen Moment: Zahn i stammt aus t − i·Δ. Bei kleinem Δ (Bruchteile eines Bildes, durch Mischen gewonnen) verschmelzen die Zähne zu einer leicht gestreiften Unschärfe. Bei grossem Δ (ganze Kurbelperioden) zerfällt Bewegtes in versetzte Streifen, wie eine in Bänder geschnittene Chronofotografie. Das ist exakt die bestehende Seitwärtsachse der Blende „verwaschen → fragmentiert", nur in der Zeit statt im Raum.
**Herkunft:** Das Zeilensprungverfahren (Interlacing) der Fernsehtechnik ist ein Zwei-Zeiten-Kamm: gerade und ungerade Zeilen stammen aus verschiedenen Halbbildern (Standardwissen). Kurt Kren filmte für *31/75 Asyl* 21 Tage lang dasselbe Fenster auf dieselben Rollen. Jeden Tag benutzte er eine andere Maske mit vier oder fünf kleinen Öffnungen, sodass jedes Bildfenster einen anderen Tag zeigt ([Close-Up Film Centre](https://www.closeupfilmcentre.com/film_programmes/2016/kurt-kren-structural-films/)). Der Zeitkamm übersetzt ausserdem Jacobs' Wechsel zweier Bilder aus der Zeit in den Raum.
**Kopplung:** Kammblende (vorhanden), Kurbel (Δ in Kurbelperioden). Die Zähne sind fest am Bildfenster, und der Zoom verändert, was in einen Zahn fällt.
**Spielen:** Die bestehende Seitwärtsgeste der Blende, ohne neuen Regler.
**Flackern / Digital-Look:** Zähne von 1–2 Pixeln flimmern bei feinen waagrechten Kanten, so wie beim Fernsehen. Die Zähne sollten deshalb mindestens 6–8 Pixel breit sein und weiche Kanten haben. Niemals sollten die Zähne ihre Zeitpunkte schnell *tauschen*, denn das wäre Jacobs' Flackern in Streifenform. Wenn der Kamm wandert, dann langsamer als ein halber Zahn pro Sekunde. Wenige Zähne (3–6) wirken wie eine Maske, viele harte Zähne wie Glitch-Art. Eine reizvolle, unsichere Variante ist ein Kamm aus Kreissektoren, der die Form der Umlaufblende selbst aufnimmt.
**Browser:** Auch in Canvas2D gut machbar (Zeichnen mit Ausschnittmasken aus m gespeicherten Bildern). WebGL ist trivial. Speicher: m ≤ 8 Bilder, bei 540p etwa 16 MiB.

### 4. Bewegungsbelichtung

**Zwischen den Frames:** Wenn der Greifer steht und gestapelt wird, belichtet das Instrument heute das ganze Bild immer wieder neu. Bei der Bewegungsbelichtung fällt neues Licht nur dort auf den Film, wo sich zwischen Bild n−k und n etwas verändert hat. Überall sonst bleibt das alte Bild stehen. Es entsteht ein Standbild, in dem nur Bewegtes erneuert wird, wie ein Film, der nur für Veränderung empfindlich ist.
**Herkunft:** In Bill Violas *The Reflecting Pool* (1977–79) schwebt ein Mann eingefroren im Sprung über dem Wasser. Alle Bewegung steckt in den Spiegelungen, verbunden durch „still-framing and multiple keying" ([EAI](https://www.eai.org/titles/the-reflecting-pool)). Malcolm Le Grice legte in *Berlin Horse* (1970) Negativ und Positiv übereinander, sodass nur das Veränderliche farbig erscheint ([Cinema Scope](https://cinema-scope.com/exploded-view/exploded-view-malcolm-le-grices-berlin-horse/)). Posys „Motion Extraction" mischt ein invertiertes, zeitversetztes Bild 50/50 mit dem aktuellen. Stillstand wird grau, und längere Versätze machen langsamere Veränderungen sichtbar ([martinoshelf](https://martinoshelf.neocities.org/posy-motion-part1)).
**Kopplung:** Wichtig ist, das graue Differenzbild nicht zu *zeigen*, denn es wirkt wie ein Röntgenbild und damit digital. Es dient nur als *Belichtungsmaske*. Der Greifer schaltet den Modus (steht = Bewegungsbelichtung). Die Kurbel bestimmt den Vergleichsabstand k: Bei 2 fps zählen auch langsame Veränderungen, bei 12 fps nur schnelle. Die Blendenöffnung bestimmt die Empfindlichkeit.
**Spielen:** Greifer anhalten heisst stapeln mit Bewegungsbelichtung. Loslassen bringt den normalen Lauf zurück.
**Flackern / Digital-Look:** Flackern ist niedrig. Ein Digital-Risiko ist das Bildrauschen bei wenig Licht, das als „Veränderung" zählt und flirrt. Dagegen helfen eine unscharf gerechnete Maske in niedriger Auflösung, eine Schwelle mit Nachlauf (Hysterese) und weiche Ränder.
**Browser:** WebGL ist einfach (Differenz auf 160×90, weich hochskaliert). In Canvas2D geht es über ein kleines Hilfsbild und Mischmodi, ebenfalls machbar. Speicher: gering.

## Transport und Projektion: wie ein Bild ins nächste übergeht

Die nächsten vier Ideen betreffen den Wechsel selbst, also das, was der Greifer tut und wie der „Projektor" das Bild zeigt.

### 5. Überblendender Projektor

**Zwischen den Frames:** Im Zeit-Modus „Bild steht nach" steht heute ein Bild und springt dann hart weiter. Neu blendet der letzte Teil der Standzeit in das nächste Bild über. Der Blendenwinkel bestimmt in seiner Projektionsrolle den Anteil: Bei 0° gibt es einen harten Sprung (reines Step-Printing, der Wong-Kar-wai-Look). Bei 180° steht das Bild die halbe Periode und blendet die andere Hälfte über. Bei 360° wird durchgehend übergeblendet, und das Bild „kriecht". Zwischen zwei Bildern liegen für einen Moment zwei Zustände übereinander, eine Doppelbelichtung in der Zeit.
**Herkunft:** Beim Step-Printing wird mit niedriger Rate und langer Belichtung gedreht und jedes Bild mehrfach kopiert. Das Tempo bleibt echt, die Bewegung aber stottert und schmiert ([Yaroflasher](https://flashboards.yaroflasher.com/learn/post-production/step-printing/)). Die genauen Parameter von *Chungking Express* sind nicht belegt. Beim Stretch-Printing gilt dasselbe Prinzip mit ungleichmässiger Kadenz: *Avalon* drehte eine Rückblende mit 16 fps und wiederholte jedes zweite Bild ([cinematography.net](https://cinematography.net/edited-pages/StepPrinting-ExamplesInformation.htm)). Chris Markers *La Jetée* (1962) besteht fast nur aus Fotografien, die mit dem Ton synchron überblendet werden ([Wikipedia](https://en.wikipedia.org/wiki/La_Jet%C3%A9e)).
**Kopplung:** Die Blende wirkt für Aufnahme *und* Wiedergabe. Eine weit offene Kamera projiziert auch weich, so wird aus einer Gegensatz-Einstellung ein physikalischer Zusammenhang. Die Kurbel bestimmt die Länge der Standzeit.
**Spielen:** Kein neuer Regler.
**Flackern / Digital-Look:** Diese Idee *senkt* das Flackerrisiko. Wenn eine Lampe zwischen zwei Kurbelbildern grossflächig an- und ausgeht, wird aus einem harten Blitz ein weiches Atmen. Digital-Risiko ist gering. Eine Überblendung ist kein berechnetes Zwischenbild, sie wirkt wie ein Projektor mit nachglühender Lampe, nicht wie die Bewegungsglättung eines Fernsehers.
**Browser:** Canvas2D reicht völlig (zwei Bilder mit Transparenz übereinander zeichnen). Speicher: 2 Bilder.

### 6. Gangart des Greifers

**Zwischen den Frames:** Bei 24 fps Ausgabe und 10 fps Kurbel steht jedes Bild rechnerisch 2,4 Ausgabebilder lang. In der Praxis ergibt das das Muster 2-2-3-2-3. Meist wird dieser unregelmässige Gang versteckt. Hier wird er zum Ausdruck: Zwischen den Frames entscheidet sich nicht *was* sich ändert, sondern *ob*. Der Rhythmus der Veränderung wird sichtbar wie ein Metrum.
**Herkunft:** Das 2:3-Pulldown der Fernsehtechnik (Standardwissen, nicht recherchiert) und das 1-1-2-Muster des Stretch-Printing ([cinematography.net](https://cinematography.net/edited-pages/StepPrinting-ExamplesInformation.htm)). Peter Kubelka baute *Arnulf Rainer* aus Phrasenlängen von 2, 4, 6, 8 … bis 288 Bildern, analog zu Notenwerten ([Wikipedia](https://en.wikipedia.org/wiki/Arnulf_Rainer_(film))). Kurt Krens *48 Köpfe aus dem Szondi-Test* zeigt jedes Porträt 1–8 Bilder lang nach festem Schema ([sixpackfilm](https://www.sixpackfilm.com/en/catalogue/223/)).
**Kopplung:** Das Muster ergibt sich aus dem Verhältnis von Kurbel und Ausgaberate, ohne Erfindung. Für einen Musiker naheliegend ist eine Erweiterung des bestehenden Greifer-Verhaltens: Er „läuft weiter, bis er einrastet", und die Rasten könnten auf Teiler eines Tempos liegen. Dann laufen Kurbel-Stufen wie 6, 8 und 12 fps im Takt eines Stücks.
**Spielen:** Kurbel wie bisher. Die Tempo-Rasten wären eine einmalige Einstellung, kein Spielregler.
**Flackern / Digital-Look:** Es gibt keine Helligkeitswechsel, nur Gangunterschiede, also ist die Idee unkritisch. Vorsicht gilt nur bei Kubelka-artigen *harten* Schnitten zwischen sehr verschiedenen Bildern unter 4 Bildern Länge.
**Browser:** Reine Zeitplanung, kein Grafikaufwand, kein Speicher.

### 7. Pendelbild

**Zwischen den Frames:** Wird die Kurbel bis zum Stillstand gebremst, friert das Bild nicht ein. Stattdessen pendeln die letzten zwei Bilder (oder zwei Bilder im Abstand von 2–3) langsam und sinusförmig ineinander, mit etwa 0,5–2 Schwingungen pro Sekunde. Das Gehirn liest den winzigen Unterschied zwischen zwei fast gleichen Bildern als Bewegung, die nirgendwohin führt, und manchmal als Tiefe.
**Herkunft:** Ken Jacobs' *Nervous System* lässt zwei identische Kopien auf zwei Projektoren laufen, meist **um genau ein Bild versetzt**, abwechselnd von einer rotierenden Scheibe freigegeben ([Mark Webber](https://markwebber.org.uk/archive/category/seasons/ken-jacobs-nervous-system/)). In seinen digitalen *Eternalisms* wechseln zwei Bilder, die „a moment in perpetual oscillation" halten ([e-flux](https://www.e-flux.com/notes/6783406/eternalisms-of-the-nervous-system-ken-jacobs-1933-2025)).
**Kopplung:** Die Kurbel löst aus (Stillstand). Der Greifer bestimmt den Abstand: Wie weit er nach dem Loslassen bis zum Einrasten weiterläuft, legt fest, ob ein, zwei oder drei Bilder zwischen den Pendelpartnern liegen. Das entspricht Jacobs' „Synchronisationsgrad".
**Spielen:** Kurbel herunterwischen bis Stillstand. Ein Greifer-Schubs verändert den Abstand.
**Flackern / Digital-Look:** Jacobs arbeitete mit Schwarz, das Instrument tut es nicht. Bei 2 Hz und sanftem Sinus ist das Risiko gering, weil zwei benachbarte Bilder fast gleich hell sind. Zu prüfen bleiben Bilder, in denen ein Licht gerade an- oder ausgeht, und dort greift der Blitzwächter. Ob die Tiefe ohne Dunkelphase trägt, ist unsicher. Als Alternative kann man das Pendeln räumlich über den Zeitkamm (Idee 3) machen, bei dem die Zähne langsam die Rolle tauschen.
**Browser:** Canvas2D trivial. Speicher: 2–4 Bilder.

### 8. Bildstrich als Zeitnaht

**Zwischen den Frames:** Ein verrutschtes Projektorbild zeigt oberhalb des Bildstrichs den unteren Teil von Bild n und unterhalb den oberen Teil von Bild n+1. Der Strich ist also eine Naht zwischen zwei Momenten. Rollt er, weil Greifer und Blende aus dem Takt sind, wandert der Bildwechsel *räumlich* durchs Bild: Der Schnitt wird zu einem langsam ziehenden Horizont, oberhalb ist es etwas früher, unterhalb etwas später.
**Herkunft:** In Joan Jonas' *Vertical Roll* (1972) wird die vertikale Bildsynchronisation des Monitors verstellt, das Bild rollt dauernd. Die Wirkung ist ein „continuous dissolve through time and space", und Jonas schlägt im Takt einen Löffel gegen einen Spiegel ([Wikipedia](https://en.wikipedia.org/wiki/Vertical_Roll)).
**Kopplung:** Greifer (rollender Bildstrich, vorhanden). Die Rollgeschwindigkeit ergibt sich aus der Schwebung zwischen Transporttakt und Blendentakt: kleine Differenz heisst langsames Wandern. Der Zeitabstand über und unter der Naht beträgt genau eine Kurbelperiode. Rastet der Greifer ein, wandert die Naht an den Bildrand und verschwindet.
**Spielen:** Bestehende Greifer-Geste.
**Flackern / Digital-Look:** Das Rollen bei Jonas, etwa jede halbe Sekunde, ist rhythmisch aggressiv. Hier sollte es bei 0,1–0,5 Bildhöhen pro Sekunde liegen. Der Strich selbst ist schmal (weit unter einem Viertel der Fläche) und sollte weich sein statt tiefschwarz. Digital-Risiko ist gering, weil das ein Artefakt des Mediums selbst ist. Zur Abgrenzung von Idee 2: Dort ist die Zeit ein stetiger Keil, hier eine einzelne, wandernde Kante. Beide könnten die zwei Enden desselben Greifer-Verhaltens sein: einrasten heisst Kante, gleiten heisst Keil.
**Browser:** Canvas2D trivial (zwei Bilder mit Ausschnitt). Speicher: 2 Bilder.

## Kopierwerk und Gedächtnis: mehrere Zeiten in einem Bild

Die letzten vier Ideen betreffen das, was analog im Kopierwerk geschieht: Bilder werden aufeinander kopiert, verzögert, verformt.

### 9. Kopierdurchgänge

**Zwischen den Frames:** Dieselbe Aufnahme wird mehrmals auf sich selbst kopiert, jeder Durchgang um eine Kurbelperiode verzögert. Jedes Bild trägt so seine eigene Vergangenheit in Stufen. Ruhendes summiert sich zu satter Form, Bewegtes fächert auf.
**Herkunft:** McLarens *Pas de deux* (1968) ist harte Gegenlichtsilhouette auf Schwarz. „The same shot was exposed on itself, but each time delayed or staggered by a few frames", gesteigert bis zu **elf Belichtungen**, mit Bezug auf Muybridges Chronofotografie ([eCampusOntario](https://ecampusontario.pressbooks.pub/canadarthistories/chapter/pas-de-deux-1968/)). Der genaue Bildversatz ist nicht verifiziert.
**Kopplung:** Die bestehende Doppelbelichtung wird zu „Durchgängen": Jedes Antippen fügt einen Durchgang hinzu, bis etwa 6. Der Versatz ist eine Kurbelperiode, bei 4 fps also 250 ms Abstand und weite Fächer, bei 12 fps enge. Gemischt wird aufhellend (screen/lighten), sodass dunkler Grund dunkel bleibt. Das wirkt am stärksten mit Lichtern in der Nacht und ergänzt die Greifer-Schlieren.
**Spielen:** Doppelbelichtung mehrfach antippen, langes Halten setzt zurück.
**Flackern / Digital-Look:** Flackern ist niedrig. Digital-Risiko besteht, weil Handy-Apps „Geisterspuren" als Filter anbieten. Die Abgrenzung gelingt durch **diskrete** Kopien in festen Kurbelabständen (stroboskopisch, chronofotografisch) statt einer verschmierten Schleppe, durch gleich starke Durchgänge und durch normierte Helligkeit.
**Browser:** Canvas2D hat die nötigen Mischmodi (`lighter`, `screen`). Gespeichert werden nur Kurbelbilder, nicht Kamerabilder: 6 Durchgänge brauchen 6 Bilder, bei 540p etwa 12 MiB.

### 10. Zweiter Projektor

**Zwischen den Frames:** Die Doppelbelichtung zeigt zwei Abtastungen derselben Live-Szene, die mit leicht verschiedenen Raten gekurbelt werden, zum Beispiel 8 und 8,5 fps. Die beiden Schichten laufen auseinander und finden periodisch wieder zusammen. Mal zeigen beide denselben Moment, und das Bild wird einfach und klar. Mal liegen sie maximal auseinander, und alles wird doppelt. Das ist eine Schwebung im Bild, die ein Musiker hört, bevor er sie sieht.
**Herkunft:** Ernst Schmidt jr.s *Doppelprojektion* (1969) erzeugt durch „leicht differierenden Drehbeginn" ein „gegenseitiges Überholen der linken und rechten Bilder" ([sixpackfilm](https://www.sixpackfilm.com/de/catalogue/193/)). In Hollis Framptons *Critical Mass* (1971) driften Bild und Ton um eine, dann zwei Wiederholungen auseinander, mit Bezug auf Steve Reichs *Come Out* ([Cinema Scope](https://cinema-scope.com/columns/exploded-view-hollis-framptons-critical-mass-by-chuck-stephens/)).
**Kopplung:** Beim Antippen der Doppelbelichtung behält die zweite Schicht die *damalige* Kurbelrate. Kurbelt man weiter, entsteht die Schwebung von selbst. Der zeitliche Abstand bleibt immer unter einer Periode, die Idee bleibt also in der Gegenwart. Genau das unterscheidet sie von grossen, „digitalen" Zeitversätzen. Eine Variante mit wachsender Verzögerung (echtes Reich-Phasing aus dem Speicher) ist möglich, braucht aber mehr Speicher und entfernt sich von der Gegenwart.
**Spielen:** Doppelbelichtung antippen, dann weiterkurbeln.
**Flackern / Digital-Look:** Flackern ist niedrig, solange die Schichten *gemischt* und nicht *abgewechselt* werden. Ein Abwechseln wäre die Situation von Vasulkas *Noisefields* mit Quellen-Alternation ([Wikipedia](https://en.wikipedia.org/wiki/Noisefields)), also das Gegenmodell. Digital-Risiko ist gering.
**Browser:** Canvas2D. Speicher: 2–3 Bilder.

### 11. Fliessendes Standbild

**Zwischen den Frames:** Wenn der Film steht, kommt kein neues Licht, aber die *Bewegung* der Welt läuft weiter. Das gehaltene Bild wird von der Bewegung der Live-Szene geschoben und gestaucht und kehrt nur langsam zum Live-Bild zurück. Es ist ein stehendes Filmbild, das von der Welt verformt wird. Das ist analog unmöglich und doch mechanisch lesbar.
**Herkunft:** Datamoshing entfernt bei komprimiertem Video die Schlüsselbilder. Die Bewegungsanweisungen der folgenden Bilder „smear over the surface of an old keyframe" ([Menkman, beyond resolution](https://beyondresolution.info/Datamoshing)). Takeshi Murata machte so in *Monster Movie* (2005) einen B-Film zu „digital liquid" ([Smithsonian](https://americanart.si.edu/artwork/monster-movie-86385)).
**Kopplung:** Steht der Greifer, trägt die Bewegung das Bild. Beim Loslassen kommt das neue Bild als Überblendung, während der Greifer bis zum Einrasten weiterläuft (mindestens 0,5 s). Die Blende bestimmt die Rückkehrgeschwindigkeit.
**Spielen:** Bestehende Greifer-Geste.
**Flackern / Digital-Look:** Flackern entsteht nur bei hartem Zurückspringen, deshalb wird immer übergeblendet. **Das Digital-Risiko ist das höchste aller Ideen.** Sichtbare Pixelblöcke (8×8, 16×16) sind das Erkennungszeichen von Codec-Fehlern. Das Bewegungsfeld muss weich gerechnet und schwach dosiert werden. Menkmans These, jedes Medium habe seine eigenen Fehler, spricht dafür, hier keine Codec-Fehler zu zitieren, sondern ein „Film, der sich unter Bewegung dehnt" zu bauen.
**Browser:** Nur WebGL. Nötig ist eine Bewegungsschätzung (Optical Flow) auf 160×90 bis 320×180 Pixeln, etwa per Blockvergleich, über mehrere Rechenschritte. Für das iPhone fanden sich keine Messwerte, deshalb ist das experimentell. Speicher: gering.

### 12. Lichtzug

**Zwischen den Frames:** Der Bildstand wackelt nicht zufällig. Die Helligkeit des vorigen Bildes „zieht" am nächsten: Helle Bereiche verschieben das Bild um wenige Pixel, geglättet über die Zeit. Das Licht von gestern wird zur Geometrie von heute.
**Herkunft:** Beim Rutt/Etra-Scan-Prozessor (Steina und Woody Vasulka, 1972–74) zogen helle Bildbereiche die Zeilen des Rasters vertikal, und „these lines seem to adopt the contours of objects" ([Fondation Langlois](https://www.fondation-langlois.org/html/e/page.php?NumPage=456)). Als poetisches Bild passt der Film, der sich in der Wärme der Lampe wölbt. Das ist eine Metapher, als Mechanismus wurde es nicht recherchiert.
**Kopplung:** Der Bildstand (vorhanden) liefert die Stärke. Die Kurbel liefert die Trägheit: Bei niedriger Rate ist die Glättung länger, und das Bild bewegt sich schwer. Der Zoom wirkt mit, denn wer in ein Licht zoomt, zieht stärker.
**Spielen:** Bestehender Bildstand-Regler, ohne neuen Regler.
**Flackern / Digital-Look:** Gibt es keines, wenn zeitlich geglättet wird. Ein Digital-Look entsteht, wenn es als sichtbares Zeilenraster gerendert wird (der Drahtgitter-Look der Siebziger). Daher nur als Verschiebung um 1–4 Pixel.
**Browser:** Die einfache Fassung (das ganze Bild folgt dem Helligkeitsschwerpunkt) geht in Canvas2D. Die lokale Fassung (Verformungskarte aus unscharfer Helligkeit) braucht WebGL. Speicher: gering.

## Speicher entscheidet, und niedrige Kurbelraten machen ihn billig

Rechenzeit ist bei fast allen Ideen kein Problem. Der Engpass ist der Speicher. iOS-Safari begrenzt den gesamten Canvas-Speicher auf etwa **384 MB** (ab iOS 15, auf älteren Geräten weniger, gerätespezifisch) ([PQINA](https://pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit/)). Wird zu viel belegt, beendet Safari die Seite ([Apple Developer Forums](https://developer.apple.com/forums/thread/741624)). Ob WebGL-Texturen auf dieses Limit angerechnet werden, ist undokumentiert. Ein Bild kostet bei 720p rund 3,5 MiB, bei 540p 2 MiB und bei 360p 0,9 MiB (eigene Rechnung). Mit einem vorsichtigen Budget von 100–150 MiB passen 40 Bilder in 720p oder 160 in 360p. Der entscheidende Trick liegt in der Mechanik selbst: **Gespeichert werden Kurbelbilder, nicht Kamerabilder.** 40 Bilder sind bei 24 fps 1,7 Sekunden, bei 4 fps 10 Sekunden und bei 1 fps 40 Sekunden. Nur der Schlitzverschluss (Idee 2) und die Bewegungsunschärfe über mehrere Kamerabilder brauchen die vollen 30 fps, und auch nur für eine Kurbelperiode. Zeiteffekte verzeihen geringere Auflösung. Halbe Auflösung im Gedächtnis und volle Auflösung nur im aktuellen Bild ist ein guter Kompromiss. WebGL2 ist in Safari seit Version 15 vorhanden ([Wonderland Engine](https://wonderlandengine.com/news/webgl-performance-safari-apple-vision-pro/)), WebGPU seit Safari 26 auch auf iOS ([WebKit](https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/)). Zwei praktische Fallen: Die Canvas-Grösse sollte nie zur Laufzeit geändert werden, weil es einen bekannten Speicherleck-Fehler gibt ([Apple Developer Forums](https://developer.apple.com/forums/thread/668999)). Und das Hochladen von Bildern in die Grafikkarte kann gelegentlich hängen.

| Idee | Hauptkopplung | Neue Geste? | Flackern | Digital-Look | Technik | Speicher (ca.) |
|---|---|---|---|---|---|---|
| 1 Mehrumlauf-Blende | Blende > 360°, Kurbel | nein (Raste bei 360°) | keins, dämpft | gering (Rundung beachten) | WebGL | 5–20 MiB |
| 2 Gedehnter Schlitzverschluss | Kurbel, Greifer-Richtung, Blende | nein | niedrig | mittel (Spanne begrenzen) | WebGL2 | ~15 MiB |
| 3 Zeitkamm | Kammblende, Kurbel | nein | niedrig (Zähne breit) | mittel | Canvas2D/WebGL | ~16 MiB |
| 4 Bewegungsbelichtung | Greifer steht, Kurbel, Blende | nein | niedrig | mittel (Rauschen) | WebGL/Canvas2D | gering |
| 5 Überblendender Projektor | Blende, „Bild steht nach" | nein | senkt es | gering | Canvas2D | 2 Bilder |
| 6 Gangart | Kurbel, Greifer-Rasten | Einstellung | keins | keins | Zeitplanung | keiner |
| 7 Pendelbild | Kurbel-Stopp, Greifer-Abstand | nein | gering (≤ 2 Hz) | gering | Canvas2D | 2–4 Bilder |
| 8 Bildstrich als Zeitnaht | Greifer/Blende-Schwebung | nein | gering (langsam) | gering | Canvas2D | 2 Bilder |
| 9 Kopierdurchgänge | Doppelbelichtung, Kurbel | nein | niedrig | mittel | Canvas2D | ~12 MiB |
| 10 Zweiter Projektor | Doppelbelichtung, Kurbel | nein | niedrig | gering | Canvas2D | 2–3 Bilder |
| 11 Fliessendes Standbild | Greifer steht/läuft | nein | gering | **hoch** | nur WebGL | gering |
| 12 Lichtzug | Bildstand, Kurbel, Zoom | nein | keins | gering (subtil halten) | Canvas2D/WebGL | gering |

Bewusst *nicht* empfohlen werden fünf Dinge. Das sind erstens Flicker-Partituren nach Conrad, Kubelka oder Sharits in Helligkeit: Ihre Struktur steckt in Idee 6, ihr Licht wäre gefährlich. Zweitens das Einfügen schwarzer Bilder zur Schärfung (Projektor-Imitation), weil es bei 12–24 fps genau ins Band von 16–25 Hz fällt. Drittens das Abwechseln zweier Quellen. Viertens neuronale Zwischenbildberechnung (etwa RIFE, [arXiv](https://arxiv.org/html/2011.06294v9)), die im iPhone-Browser kaum in Echtzeit läuft und den „Gummi-Look" erzeugt. Fünftens die Verstärkung kleinster Bewegungen nach dem MIT-Verfahren „Eulerian Video Magnification" ([CACM](https://cacm.acm.org/research/eulerian-video-magnification-and-analysis/)). Sie wäre als „Resonanz im Kurbeltakt" verlockend, pulsiert aber leicht in Helligkeit und verstärkt Bildrauschen. Wenn überhaupt, dann nur für langsame Bänder unter 2 Hz.

## Die Mechanik des iPhones: analog in einem Gerät von heute

Eine iPhone-Kamera ist nicht nur Elektronik. In ihr bewegen sich Teile. Die Linse schwebt auf winzigen Federn und wird von Magnetspulen verschoben. Bei manchen Modellen bewegt sich stattdessen der Sensor auf einer biegsamen Leiterplatte. Mehrere Kameras sitzen nebeneinander und übergeben sich beim Zoomen das Bild. Der Sensor liest Zeile für Zeile aus, nicht alles auf einmal. Was dabei schiefgehen kann, ist das Gegenstück zum rollenden Bildstrich oder zum ausser Takt geratenen Greifer der Bolex.

**So funktioniert die Stabilisierung.** Apple beschreibt zwei Systeme. Bei der **optischen Bildstabilisierung (OIS)** merkt ein Gyroskop, dass sich die Kamera bewegt hat, und die Linse wird entsprechend dem Winkel verschoben, um Unschärfe zu verringern. Beim **Autofokus mit geschlossenem Regelkreis** messen Magnetsensoren den Einfluss von Schwerkraft und Vibration und regeln die Linsenposition nach. Apple warnt, dass starke Vibrationen in bestimmten Frequenzbereichen, etwa von Motorradmotoren, diese Systeme auf Dauer beschädigen können ([Apple Support](https://support.apple.com/HT212803); [DPReview](https://www.dpreview.com/news/7460252626/apple-warns-that-high-powered-motorcycles-can-damage-autofocus-image-stabilization-in-iphones/)). Beim **Sensor-Shift** (ab iPhone 12 Pro Max) sitzt der Sensor auf einer kleinen Leiterplatte, die an biegsamen Armen hängt und sich so seitlich verschieben und drehen kann ([Edge AI and Vision Alliance](https://www.edge-ai-vision.com/2021/03/apples-novel-sensor-shift-ois-in-the-iphone-12-pro-max-camera/)).

**Was beim iPhone deiner Freundin vermutlich passiert.** Reparaturbetriebe beschreiben defekte Stabilisierung so: ein ständiges, schnelles Zittern im Bild, das Bild scheint zu „verziehen“ oder zu „schmelzen“, manchmal hört man ein leises Surren oder Klicken, weil die Linse an ihr Gehäuse schlägt. Stabilisierung und Autofokus sitzen oft im selben Gehäuse, deshalb leidet häufig auch der Fokus mit ([Mobile Fix Experts](https://mobilefixexperts.com/iphone-samsung-camera-shaking-ois-failure-2026/), Reparatur-Blog, keine Herstellerquelle). Mechanisch heisst das: Die Linse folgt nicht mehr dem Gyroskop, sondern schwingt in ihrer Federaufhängung, oder der Regelkreis schaukelt sich auf. Das passt zu deiner Beschreibung: wie schnelles Wackeln, aber aus der Linse heraus.

Zwei Grenzen vorweg. Kurbel kann die echte Linse nicht steuern: Der Browser bekommt nur das fertige Kamerabild. Alles hier wird also aus dem Bild heraus nachgebaut, mit derselben Logik wie die Bolex-Mechanik. Der Bewegungssensor (Gyroskop) ist im Browser dagegen zugänglich. Auf dem iPhone muss man ihn einmal per Tippen erlauben. Das ist der Schlüssel für die Ideen 13 und 14, denn so reagiert die nachgebaute Linse auf deine echte Hand.

### 13. Lose Linse

**Zwischen den Frames:** Die Linse schwingt schnell in ihrer Aufhängung, schneller als die Kamera Bilder liefert, etwa mit einigen Dutzend Schwingungen pro Sekunde (eigene Annahme, nicht gemessen). Jedes Kamerabild erwischt die Linse an einer anderen Stelle ihrer Schwingung. Was dann sichtbar wird, hängt von der Blende ab, und genau das macht die Idee zu einer gekoppelten: Bei **kurzer Belichtung** zeigt jedes Kurbelbild die Linse an einer zufälligen Stelle, das Bild zittert nervös. Bei **langer Belichtung** sammelt die Blende viele Positionen, und das Zittern wird zu einer weichen Doppel- oder Mehrfachkontur, einem Vibrato. Bei **Fragmenten** (Kamm rechts) sieht man einzelne, gegeneinander verschobene Bilder.
**Herkunft:** Der Defekt am iPhone deiner Freundin. Physikalisch verwandt mit der „Schlaufe verloren“ beim Film: ein Teil, das seinen Takt verloren hat.
**Kopplung:** Die Stärke ist ein Zustand des Bildstands (wie stark die Linse locker ist). Wenn Ideen 13 und 14 zusammenkommen, schaukelt sich die lose Linse bei ruckartigen Handbewegungen auf, wie ein echter Regelkreis, der übersteuert, und beruhigt sich, wenn du stillhältst.
**Spielen:** Der Bildstand-Regler erhält eine zweite Zone: oben „locker“. Besser wäre, ihn wie den Greifer zu halten: Solange dein Daumen draufliegt, ist die Linse locker, beim Loslassen fängt sie sich.
**Flackern / Digital-Look:** Das ist Bewegung, keine Helligkeit, also kein Flackern im engeren Sinn. Schnelles, grossflächiges Zittern kann trotzdem unangenehm sein. Deshalb sollte die Schwingung klein bleiben (wenige Pixel) und bei kurzer Belichtung gedämpft werden. Digital wirkt es, wenn das Zittern als zufälliges Springen programmiert ist. Echt wirkt es, wenn es eine gedämpfte Schwingung mit eigener Frequenz ist, die gegen die Kamera-Bildrate „schwebt“.
**Browser:** Canvas2D reicht. Pro Kamerabild wird das Bild um die aktuelle Linsenauslenkung verschoben, bevor es gesammelt wird. Kein Bildgedächtnis nötig. Bewegungssensor optional.

### 14. Linse auf Federn

**Zwischen den Frames:** Heute ist der Bildstand ein Zufallswackeln pro neuem Bild. Neu hängt das Bild wie eine Linse an Federn: Bewegst du das iPhone ruckartig, bleibt das Bild einen Moment zurück, schwingt über und pendelt sich ein. Hältst du still, steht es ruhig. Zwischen den Frames passiert, was die Feder in dieser Zeit tut.
**Herkunft:** Die Federaufhängung der OIS-Linse, beschrieben von Apple ([Apple Support](https://support.apple.com/HT212803)). Eine funktionierende Stabilisierung bewegt die Linse *gegen* die Handbewegung. Hier dreht man das um: Die Linse folgt träge, statt auszugleichen.
**Kopplung:** Bewegungssensor des iPhones (echte Handbewegung), Bildstand-Regler (wie weich die Feder ist), Zoom (beim Hineinzoomen schwingt das Bild stärker, wie bei einem Teleobjektiv). Bei niedriger Kurbelrate sieht man das Pendeln in Stufen, weil nur jedes Kurbelbild eine neue Position zeigt.
**Spielen:** Ohne neuen Regler. Das Instrument ist deine Hand.
**Flackern / Digital-Look:** Kein Flackern. Digital wirkt es, wenn die Feder zu weich ist (Gummi-Look). Die Ausschläge sollten klein und gut gedämpft sein.
**Browser:** Canvas2D, eine Federrechnung pro Bild. Der Bewegungssensor muss auf dem iPhone einmal per Tippen erlaubt werden. In der Claude-Vorschau muss die Seite diese Fähigkeit ausdrücklich anmelden. Kein Bildgedächtnis.

### 15. Fokus sucht

**Zwischen den Frames:** Wenn der Autofokus im Dunkeln oder nach einem Zoom sucht, fährt die Linse vor und zurück. Das Bild wird kurz unscharf, wieder scharf und ändert dabei minimal seine Grösse, weil sich mit dem Fokus auch der Bildwinkel leicht verschiebt (unter Filmleuten „Focus Breathing“, Fachwissen, nicht eigens recherchiert).
**Herkunft:** Autofokus mit Magnetspule und geschlossenem Regelkreis ([Apple Support](https://support.apple.com/HT212803)).
**Kopplung:** Ausgelöst durch die Zoom-Geste (nach jedem grösseren Zoomschritt sucht der Fokus kurz) und durch wenig Licht (je dunkler, desto länger sucht er). Die Kurbel bestimmt, wie viel vom Suchen man sieht: Bei 4 fps nur zwei, drei Stationen, bei 24 fps ein flüssiges Atmen.
**Spielen:** Kein Regler, es ist eine Folge des Zoomens.
**Flackern / Digital-Look:** Das Atmen ist Schärfe und Grösse, nicht Helligkeit, also unkritisch, solange es langsam bleibt (eine Suche dauert eine halbe bis eine Sekunde). Digital wirkt es, wenn die Unschärfe zu glatt ist.
**Browser:** Den echten Fokus kann Kurbel auf dem iPhone vermutlich nicht steuern (unsicher, im Browser kaum unterstützt). Nachgebaut wird mit Unschärfe und leichter Vergrösserung. Canvas2D geht, WebGL ist sauberer.

### 16. Linsenwechsel

**Zwischen den Frames:** Das iPhone hat mehrere Kameras nebeneinander. Beim Zoomen übergibt es das Bild von einer an die nächste. Weil die Kameras an verschiedenen Stellen sitzen, springt das Bild dabei sichtbar. Die Kamera-App des iPhones blendet den Sprung weich über, Apps ohne diese Überblendung zeigen ihn hart ([Apple Developer Forums](https://developer.apple.com/forums/thread/718739)). Auch Farbe und Helligkeit ändern sich leicht, weil jede Kamera anders abgestimmt ist.
**Herkunft:** Der Kamerawechsel des iPhones, verwandt mit dem Objektivrevolver der Bolex (drei Objektive, die man von Hand weiterdreht).
**Kopplung:** Die Zoom-Geste erhält zwei Übergabepunkte (zum Beispiel bei 2× und 3×). Wer darüber zoomt, löst einen kleinen Sprung mit Parallaxe und Farbwechsel aus, der über einige Kurbelbilder überblendet wird. Bei niedriger Kurbelrate ist der Sprung ein deutlicher Moment, bei hoher fast unsichtbar.
**Spielen:** Bestehende Zoom-Geste.
**Flackern / Digital-Look:** Ein einzelner Sprung, kein Flackern. Digital wirkt er nur, wenn er zu gross oder zu sauber ist.
**Browser:** Canvas2D. Ob Kurbel im Browser wirklich zwischen den Kameras des iPhones wechseln kann, ist offen. Nachgebaut ist es einfach. Kein Bildgedächtnis.

### 17. Zwei Uhren

**Zwischen den Frames:** Viele LED-Lampen flackern unsichtbar schnell. Der iPhone-Sensor liest Zeile für Zeile aus, deshalb erwischt jede Zeile die Lampe in einem anderen Moment. Es entstehen helle und dunkle Querstreifen, die langsam durchs Bild wandern. Ihre Anzahl hängt davon ab, wie schnell die Lampe flackert und wie lange das Auslesen dauert. Ihre Geschwindigkeit ergibt sich aus der Schwebung zwischen Lampentakt und Bildrate. Das ist kein Defekt, sondern das Zusammenspiel zweier Uhren ([ENTTEC](https://support.enttec.com/pixel/pixel-general-knowledge/why-do-leds-flicker-on-camera)).
**Herkunft:** Rolling Shutter und LED-Licht. Dasselbe Prinzip wie der Takt zwischen Greifer und Blende in Kurbel.
**Kopplung:** Kurbel könnte diese Schwebung bewusst nachbauen: eine gedachte „Lampenuhr“, die mit der Kurbel schwebt. Sie zeigt sich nur in hellen Bereichen und wandert nur langsam.
**Spielen:** Greifer-Takt seitwärts.
**Flackern / Digital-Look:** **Hier ist Vorsicht nötig.** Wandernde Helligkeitsstreifen sind Helligkeitswechsel. Sie müssen schwach bleiben, langsam wandern und dürfen nie das ganze Bild erfassen. Wenn echte LED-Lampen im Bild schon Streifen erzeugen, kommen diese ohnehin von der Kamera. Das ist die riskanteste Idee dieses Teils, eher zum Ausprobieren als zum Einbauen.
**Browser:** Canvas2D. Kein Bildgedächtnis.

### 18. Nachtverarbeitung

**Zwischen den Frames:** Bei wenig Licht rechnet das iPhone mehrere Kamerabilder zusammen, um Rauschen zu verringern. Bewegtes verschmiert dabei zu einem Aquarell-Look mit Geistern (Fachbegriff: zeitliche Rauschunterdrückung; Grundprinzip [NVIDIA VPI](https://docs.nvidia.com/vpi/algo_tnr.html), dass das iPhone es genau so macht, ist nicht belegt). In Kurbel wird daraus eine Kopplung: Je dunkler das Bild, desto länger sammelt die Blende über mehrere Kurbelbilder hinweg.
**Herkunft:** Rechenfotografie des iPhones. Verwandt mit der Mehrumlauf-Blende (Idee 1), aber automatisch vom Licht gesteuert.
**Kopplung:** Helligkeit des Bildes bestimmt die Länge des Gedächtnisses. Hell bleibt alles knackig, Dämmerung macht weich, Nacht macht Aquarell.
**Spielen:** Kein Regler. Du spielst es mit dem Licht, das du suchst.
**Flackern / Digital-Look:** Kein Flackern, die Idee dämpft eher. Digital wirkt sie, wenn der Übergang zwischen hell und dunkel sprunghaft ist. Er muss weich und träge sein.
**Browser:** WebGL ist besser (genauere Rechnung über viele Bilder), Canvas2D geht mit Abstrichen. Wenig Speicher, wenn nachklingend gerechnet wird.


## Was zuerst, und warum

**Erstens der überblendende Projektor (Idee 5).** Er ist am billigsten (Canvas2D, zwei Bilder) und löst sofort das grösste reale Problem: harte Helligkeitssprünge bei 4–12 fps und damit Kopfweh. Ausserdem macht er die Blende zu einer doppelt gekoppelten Einstellung: Wer offen belichtet, projiziert auch weich. Testen sollte man ihn nachts mit Lampen und mit einem schnellen Schwenk von einem Fenster in einen dunklen Raum, denn dort würde es heute blitzen.

**Zweitens Lose Linse und Linse auf Federn (Ideen 13 und 14).** Sie setzen an etwas an, das es schon gibt (Bildstand), brauchen kein Bildgedächtnis und bringen genau das, was dich am kaputten iPhone fasziniert hat, in die Kamera: einen mechanischen Fehler deines eigenen Geräts. Zusammen ergeben sie ein schönes Paar. Die Feder reagiert auf deine Hand, die lose Linse zeigt, was passiert, wenn diese Feder ihren Halt verliert. Die Testfrage ist, ob das Vibrato bei offener Blende so sinnlich wirkt wie im Video deiner Freundin. Ein kurzer Clip davon wäre die beste Vorlage zum Abstimmen.

**Drittens die Mehrumlauf-Blende (Idee 1).** Sie ist die reinste Form von „über das Analoge hinaus, aber mechanisch logisch“: dieselbe Formel, dieselbe Geste, nur eine Raste weiter. Sie ist ruhig, flackerfrei und verbindet sich mit dem Stapeln des Greifers. Technisch baut sie den Belichtungsspeicher, den auch Bewegungsbelichtung, Kopierdurchgänge und Nachtverarbeitung brauchen.

**Viertens der Zeitkamm (Idee 3).** Er beantwortet die Frage nach dem Zeitversatz am direktesten, innerhalb des bestehenden Kamms und mit wenigen breiten Streifen. Gleichzeitig baut er das Bildgedächtnis, auf dem Pendelbild, Kopierdurchgänge und Zweiter Projektor aufbauen. Wirkt er noch zu digital, ist das ein wertvolles Ergebnis: Dann ist der gedehnte Schlitzverschluss (Idee 2), stetig und an den Greifer gebunden, die bessere Form desselben Gedankens.

## Fazit

Die zwölf Film-Ideen lösen dieselbe einzige analoge Beschränkung auf, nur an verschiedenen Stellen des Bolex-Zyklus: Der Film darf nur belichtet werden, während er steht, und nur transportiert werden, während es dunkel ist. Belichtung über den Transport hinweg ergibt Mehrumlauf und Kopierdurchgänge. Transport während der Belichtung ergibt Schlitzverschluss und Zeitnaht. Bewegung ohne Belichtung ergibt das Fliessende Standbild und die Bewegungsbelichtung. Daraus folgt ein brauchbarer Prüfstein für jede künftige Idee: Wirkt eine Funktion wie ein Effekt, dann meist, weil sie keine dieser Phasen verschiebt, sondern etwas *neben* die Mechanik stellt.

Die zweite Einsicht betrifft das Flackern. Historisch ist es kein Merkmal des „Zwischen", sondern der Preis für die Dunkelphase, die der Transport erzwingt. Jacobs und Conrad haben diesen Preis zur Kunst gemacht. Das Instrument kann ihn weglassen und behält trotzdem das, worauf es ankommt: die Differenz zwischen zwei Bildern, aus der das Gehirn die Bewegung baut. Offen ist, ob Effekte wie Jacobs' Tiefe ohne Schwarz überleben. Ein ehrliches Experiment dazu (Pendelbild mit Überblendung gegen Pendelbild mit leichtem Helligkeitseinbruch unter der Drei-Blitze-Grenze) wäre die interessanteste wahrnehmungspsychologische Frage, die das Projekt nebenbei beantworten könnte.

Die dritte Einsicht kam mit dem kaputten iPhone. Die Logik dieses Berichts gilt nicht nur für die Bolex. Jedes Gerät hat Phasen, die nicht zusammenpassen müssen: Gyroskop und Linse, Lampentakt und Zeilenauslesung, eine Kamera und die nächste. Wo diese Phasen auseinandergeraten, entsteht etwas, das gleichzeitig mechanisch und zeitgenössisch ist. „Analog“ heisst für Kurbel damit weniger „Film“ als „bewegte Teile, die ihren eigenen Takt haben“.
