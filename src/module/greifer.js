// Greifer mit Feder: Der Filmstreifen sitzt in einer Rastung, wie eine Kugel in einer Wellblechrinne.
// Ein Stoss lässt ihn rutschen; ein kleiner rollt zurück in dieselbe Lage, ein grosser über den Kamm ins nächste Bild,
// mit leichtem Überschwingen. Halten auf dem Pad lässt ihn schlüpfen (Zug ≠ 1, der Bildstrich rollt), Loslassen gibt ihn
// mit seinem Schwung an die Rastung zurück. Ist die Blende offen, während der Film zieht oder rutscht, ziehen Lichter Schlieren.
import { TRANSPORT, transportOverlap } from '../kern/mechanik.js?v=1.1.1';
import { Schwinger } from '../kern/schwinger.js?v=1.1.1';

// Kennlinie des Schlupfs: Pad-Höhe 0..1 → Bilder pro Zug. Mitte bei 0,6 mit Totzone, viel Weg für ruhige Werte, das Extreme am Rand
export function zugOf(v, p){
  const c = 0.6, d = v >= c ? (v - c) / (1 - c) : (v - c) / c, dz = Math.min(0.95, p.totzone);
  if (Math.abs(d) < dz) return 1;
  const s = Math.pow((Math.abs(d) - dz) / (1 - dz), p.kurve);
  return d < 0 ? 1 - s * (1 - p.maxUnten) : 1 + s * (p.maxOben - 1);
}
const mk = () => { const c = document.createElement('canvas'); return [c, c.getContext('2d', { alpha: false })]; };
const TAU = Math.PI * 2;

export default {
  id: 'greifer',
  titel: 'Greifer',
  station: 'transport',
  anstoss: ['y'],
  params: {
    rastkraft: { min: 20, max: 2000, def: 360, schritt: 5, titel: 'Rastkraft' },
    masse: { min: 0.2, max: 5, def: 1, schritt: 0.05, titel: 'Masse' },
    daempfung: { min: 0.05, max: 1.5, def: 0.45, schritt: 0.01, titel: 'Dämpfung (Einschwingen)' },
    kurve: { min: 1, max: 4, def: 2.4, schritt: 0.1, titel: 'Kurve des Schlupfs' },
    totzone: { min: 0, max: 0.3, def: 0.07, schritt: 0.01, titel: 'Totzone des Schlupfs' },
    maxOben: { min: 1, max: 3, def: 1.5, schritt: 0.05, titel: 'Schlupf oben (Bilder pro Zug)' },
    maxUnten: { min: 0, max: 1, def: 0, schritt: 0.05, titel: 'Schlupf unten (Bilder pro Zug)' },
    schwelle: { min: 80, max: 500, def: 180, schritt: 10, titel: 'Tippen oder Halten ab', einheit: ' ms' },
    spiel: { typ: 'schalter', def: false, titel: 'Seitliches Spiel im Filmkanal' },
    takt: { min: -180, max: 180, def: 0, schritt: 1, titel: 'Takt zur Blende', einheit: '°' },
  },
  // the film strip near the gate: three frame pitches; exposures land at the gate, the projector window can slip
  setup(){
    [this.stripA, this.sa] = mk(); [this.stripB, this.sb] = mk(); [this.hiC, this.hictx] = mk();
    this.P = 0; this.GY = 0;
    this.s = new Schwinger();          // Lage des Films in Bildhöhen, Ruhelagen bei jeder ganzen Zahl
    this.sx = new Schwinger();         // seitliches Spiel, Anteil der Bildbreite
    this.haelt = false; this.Z = 1; this.weg = []; this.gezeigt = null;
  },
  reset(ctx){
    const { W, H } = ctx;
    this.hiC.width = W; this.hiC.height = H;
    this.P = H; this.GY = this.P;                      // frames sit flush, no black bar between them
    for (const c of [this.stripA, this.stripB]){ c.width = W; c.height = this.P * 3; }
    this.sa.fillStyle = '#000'; this.sa.fillRect(0, 0, W, this.P * 3);
    this.s.ruhe(); this.sx.ruhe(); this.gezeigt = null;
  },
  ein(ctx){ this.reset(ctx); this.haelt = ctx.eingabe.greiferHaelt; this.weg = []; },
  tick(ctx, dt){
    const e = ctx.eingabe, p = this.p, s = this.s;
    // Stösse: der Film rutscht senkrecht, seitlich nur mit Spiel im Filmkanal
    if (ctx.stoss.y) s.stoss(ctx.stoss.y / p.masse);
    if (p.spiel && ctx.stoss.x) this.sx.stoss(ctx.stoss.x / p.masse * 0.02);
    // Loslassen: die Rastung fasst den Film mit dem Schwung, den er beim Schlüpfen hatte
    if (this.haelt && !e.greiferHaelt) s.stoss((this.Z - 1) * ctx.kurbel.fps);
    this.haelt = e.greiferHaelt;
    this.Z = this.haelt ? zugOf(e.greiferY, p) : 1;
    // the detent: force ∝ −sin(2π·x), so the next stable position is always the nearest frame; while held, it does not grip
    const omega = Math.sqrt(p.rastkraft / p.masse);
    const kraft = this.haelt ? () => 0 : x => -omega * omega * Math.sin(TAU * x) / TAU;
    const x0 = s.x;
    s.schritt(dt, kraft, omega, p.daempfung);
    this.weg.push({ t: ctx.jetzt, d: s.x - x0 });
    while (this.weg.length && this.weg[0].t < ctx.jetzt - 1500) this.weg.shift();
    if (!this.haelt && Math.abs(s.v) < 0.003 && Math.abs(s.x - Math.round(s.x)) < 0.0015){ s.x = 0; s.v = 0; }
    else s.x -= Math.round(s.x);                        // nur die Lage im Bild zählt
    // seitliches Spiel: eine weiche Feder, die Wand des Filmkanals begrenzt den Weg
    if (p.spiel){
      const om = TAU * 6;
      this.sx.schritt(dt, x => -om * om * x, om, 0.5);
      if (Math.abs(this.sx.x) > 0.004){ this.sx.x = Math.sign(this.sx.x) * 0.004; this.sx.v *= -0.3; }
    } else this.sx.ruhe();
    this.zeigeFenster(ctx);
  },
  // what the projector window shows: the strip at the film's position (wrapped into one frame pitch)
  zeigeFenster(ctx, immer){
    const { W, H } = ctx, P = this.P; if (!P) return;
    let off = this.s.x * P;
    while (off > 0) off -= P;
    while (off <= -P) off += P;
    const y = Math.round(this.GY + off), lx = Math.round(this.sx.x * W);
    const k = y + '|' + lx;
    if (!immer && k === this.gezeigt) return;
    this.gezeigt = k;
    const g = ctx.bildfenster;
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    if (lx){ g.fillStyle = '#000'; g.fillRect(0, 0, W, H); }
    g.drawImage(this.stripA, 0, y, W, H, lx, 0, W, H);
    if (!immer) ctx.zeichne();
  },
  // tails of the bright parts: the light kept falling while the film moved by `travel` pixels
  schliere(expC, GY, travel, ov){
    const hictx = this.hictx, sa = this.sa;
    hictx.globalCompositeOperation = 'source-over'; hictx.globalAlpha = 1;
    hictx.drawImage(expC, 0, 0);
    hictx.globalCompositeOperation = 'multiply'; hictx.drawImage(expC, 0, 0); hictx.drawImage(expC, 0, 0); hictx.drawImage(expC, 0, 0);
    hictx.globalCompositeOperation = 'source-over';
    const m = Math.min(28, Math.max(6, Math.round(Math.abs(travel) / 4)));
    sa.globalCompositeOperation = 'lighter';
    for (let k = 1; k <= m; k++){ const fall = Math.pow(1 - k / (m + 1), 1.6); sa.globalAlpha = 2.2 * ov * fall / m; sa.drawImage(this.hiC, 0, GY + travel * k / m); }
    sa.globalCompositeOperation = 'source-over'; sa.globalAlpha = 1;
  },
  // the claw pulls the strip by Z pitches, the new exposure lands at the gate as light; what the projector shows can slip
  apply(ctx, bild){
    const { W } = ctx, P = this.P, GY = this.GY, z = bild.zyklus, expC = bild.belichtet, Z = this.Z;
    // Filmzug bei offener Blende (über 240°)
    const ov = transportOverlap(z.winkel, this.p.takt);
    const curOv = z.winkel > 0 ? ov / z.winkel : 0, curTravel = Z * P * (ov / TRANSPORT);
    // Rutschen nach einem Stoss, während Licht kam: Weg aus der Bewegung des Schwingers
    let netto = 0, pfad = 0;
    for (const w of this.weg) if (w.t > z.t0 && w.t <= z.ende){ netto += w.d; pfad += Math.abs(w.d); }
    const rutsch = pfad * P * (netto < 0 ? -1 : 1), rutschOv = Math.min(1, Math.abs(rutsch) / 24);
    if (Z > 0.001){
      const sb = this.sb;
      sb.globalCompositeOperation = 'source-over'; sb.globalAlpha = 1;
      sb.fillStyle = '#000'; sb.fillRect(0, 0, W, P * 3);
      sb.drawImage(this.stripA, 0, -Z * P);
      [this.stripA, this.stripB] = [this.stripB, this.stripA]; [this.sa, this.sb] = [this.sb, this.sa];
    }
    const sa = this.sa, still = 1 - 0.5 * curOv;          // beim Rutschen nicht dunkler: das wäre ein Flackern, nur die Lichter ziehen
    sa.globalCompositeOperation = 'screen'; sa.globalAlpha = still;
    sa.drawImage(expC, 0, GY);
    sa.globalCompositeOperation = 'source-over'; sa.globalAlpha = 1;
    if (curOv > 0.01 && curTravel > 1) this.schliere(expC, GY, curTravel, curOv);
    if (Math.abs(rutsch) > 1) this.schliere(expC, GY, -rutsch, rutschOv);
    this.s.x += Z - 1;                                   // Schlupf: der Bildstrich rollt um (Z − 1) Bilder pro Zug
    this.s.x -= Math.round(this.s.x);
    this.zeigeFenster(ctx, true);
  },
};
