// Farbsektoren (Runde 4c): In der Umlaufblende sitzen drei Farbfilter nacheinander, Rot, Grün, Blau, wie beim Harris-Shutter
// von Kodak (Kinemacolor drehte 1908 ein Rot-Grün-Rad vor dem Film). Die offene Zeit jedes Kurbelbilds ist in drei gleiche
// Teile geteilt, jede Teilbelichtung fällt durch den Sektor, der gerade vor dem Fenster steht. Was stillsteht, sieht alle drei
// Filter gleich lang und hat normale Farben. Was sich bewegt, steht in jedem Filter woanders und zieht weiche Säume in Rot,
// Grün und Blau. Kurbel und Blende bestimmen die Breite: langsam und weit offen fallen pro Farbe mehrere Kamerabilder, bei
// 24 fps liegt das ganze Fenster in einem einzigen Kamerabild, alle drei Farben sehen dasselbe, es gibt keine Säume.
// Echte Filter sind nicht rein: Ihre Kanten gleiten durch das Fenster (die Sektoren gehen ineinander über) und sie lassen
// etwas von den Nachbarfarben durch. Beides stellt die Reinheit.
// Gerechnet wird pro Teilbelichtung: ihr Anteil an jedem Sektor, mal das Filter des Sektors, mal 3. Jeder Kanal sieht über
// das ganze Fenster genau so viel Licht wie ohne Filter, ein stehendes Bild bleibt gleich hell und farbtreu.

const UEBERGANG = 1 / 6;   // bei Reinheit 0 so breit ist jede Kante, Anteil der offenen Zeit (die Hälfte eines Sektors: Grün wird ein Dreieck)
const NACHBAR = 0.5;       // bei Reinheit 0 lässt ein Filter so viel von der Nachbarfarbe durch (Rot–Grün, Grün–Blau), von der fernen das Quadrat

// Stammfunktion einer weichen Kante bei c mit halber Breite h: ∫₀ˢ clamp((x − c + h) / 2h, 0, 1) dx
function kante(s, c, h){
  if (s <= c - h) return 0;
  if (s >= c + h) return s - c;
  return (s - c + h) * (s - c + h) / (4 * h);
}
// wie viel Licht zwischen 0 und s (Anteil der offenen Zeit) durch Rot, Grün, Blau fiel. Jeder Sektor hat über das ganze Fenster genau 1/3
function sektoren(s, h, w){
  const r = s - kante(s, 1 / 3, h), b = kante(s, 2 / 3, h);
  w[0] = r; w[1] = s - r - b; w[2] = b;
  return w;
}

export default {
  id: 'farbsektoren',
  titel: 'Farbsektoren',
  station: 'emulsion',
  an: false,
  params: {
    staerke: { min: 0, max: 1, def: 1, schritt: 0.01, titel: 'Stärke (0 = keine Filter in der Blende)' },
    reinheit: { min: 0, max: 1, def: 0.5, schritt: 0.01, titel: 'Reinheit (1 = reine Filter mit harten Kanten, 0 = sie überlappen weit: weiche, blasse Säume)' },
  },
  setup(){ this.a = [0, 0, 0]; this.w0 = [0, 0, 0]; this.w1 = [0, 0, 0]; this.matrix = null; this.fuer = -1; },
  // Durchlass der drei Filter: Zeile = Sektor, Spalte = Farbe. Jede Spalte ergibt zusammen 1, so sieht jede Farbe über
  // die drei Sektoren gleich viel Licht
  filter(reinheit){
    if (this.fuer === reinheit) return this.matrix;
    const q = NACHBAR * (1 - reinheit), f = q * q;
    const roh = [[1, q, f], [q, 1, q], [f, q, 1]];
    const spalte = [0, 1, 2].map(c => roh[0][c] + roh[1][c] + roh[2][c]);
    this.matrix = roh.map(z => z.map((v, c) => v / spalte[c]));
    this.fuer = reinheit;
    return this.matrix;
  },
  apply(ctx, bild){
    const st = this.p.staerke;
    if (st <= 0 || !bild.fenster || !(bild.bis > bild.t)) return;
    const E = bild.fenster.reduce((s, f) => s + Math.max(0, f[1] - f[0]), 0);
    if (E <= 0) return;
    const h = UEBERGANG * (1 - this.p.reinheit);
    // Anteil dieser Teilbelichtung an jedem Sektor: die Zeit [t, bis] in den offenen Fenstern, gemessen in offener Zeit
    const a = this.a; a[0] = a[1] = a[2] = 0;
    let vorher = 0, licht = 0;
    for (const [fa, fb] of bild.fenster){
      const x = Math.max(bild.t, bild.t0 + fa), y = Math.min(bild.bis, bild.t0 + fb);
      if (y > x){
        const w0 = sektoren((vorher + x - bild.t0 - fa) / E, h, this.w0), w1 = sektoren((vorher + y - bild.t0 - fa) / E, h, this.w1);
        for (let k = 0; k < 3; k++) a[k] += w1[k] - w0[k];
        licht += (y - x) / E;
      }
      vorher += Math.max(0, fb - fa);
    }
    if (licht <= 0) return;
    const m = this.filter(this.p.reinheit);
    for (let c = 0; c < 3; c++){
      const f = Math.max(0, 3 * (a[0] * m[0][c] + a[1] * m[1][c] + a[2] * m[2][c]) / licht);
      bild.filter[c] *= 1 + st * (f - 1);
    }
  },
};
