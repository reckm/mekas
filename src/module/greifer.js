// Greifer: Er zieht den Filmstreifen pro Kurbelbild um Z Bildhöhen weiter, die neue Belichtung landet im Bildfenster.
// Z = 1: sauber. Z < 1: der Bildstrich rollt langsam, bei 0 steht der Film und die Bilder stapeln sich. Z > 1: Lücken.
// Ist die Blende offen, während er zieht, ziehen helle Stellen Schlieren. Loslassen: Er läuft weiter, bis er wieder
// in der Perforation sitzt. (Wird in Runde 1 zur Feder mit Rastung.)
import { TRANSPORT, transportOverlap } from '../kern/mechanik.js?v=0.0.1';

// Kennlinie des Pads: Mitte bei 0,6 mit Totzone, viel Weg für ruhige Werte
export function zugOf(v){
  const c = 0.6, d = v >= c ? (v - c) / (1 - c) : (v - c) / c, dz = 0.07;
  if (Math.abs(d) < dz) return 1;
  const s = Math.pow((Math.abs(d) - dz) / (1 - dz), 2.4);
  return d < 0 ? 1 - s : 1 + 0.5 * s;
}
const mk = () => { const c = document.createElement('canvas'); return [c, c.getContext('2d', { alpha: false })]; };

export default {
  id: 'greifer',
  titel: 'Greifer',
  station: 'transport',
  params: {
    zug: { min: 0, max: 1, def: 0.6, schritt: 0.01, titel: 'Zug (Pad)' },
    takt: { min: -180, max: 180, def: 0, schritt: 1, titel: 'Takt zur Blende', einheit: '°' },
  },
  // the film strip near the gate: three frame pitches; exposures land at the gate, the projector window can slip
  setup(ctx){
    [this.stripA, this.sa] = mk(); [this.stripB, this.sb] = mk(); [this.hiC, this.hictx] = mk();
    this.P = 0; this.GY = 0; this.framOff = 0;
    this.relax = false; this.relaxDir = 0; this.relaxV = 0;
    this.haelt = ctx.eingabe.greiferHaelt; this.einrichten = ctx.eingabe.einrichten;
  },
  reset(ctx){
    const { W, H } = ctx;
    this.hiC.width = W; this.hiC.height = H;
    this.P = H; this.GY = this.P;                      // frames sit flush, no black bar between them
    for (const c of [this.stripA, this.stripB]){ c.width = W; c.height = this.P * 3; }
    this.sa.fillStyle = '#000'; this.sa.fillRect(0, 0, W, this.P * 3); this.framOff = 0;
  },
  ein(ctx){
    this.reset(ctx); this.relax = false;
    this.haelt = ctx.eingabe.greiferHaelt; this.einrichten = ctx.eingabe.einrichten;
  },
  tick(ctx, dt){
    const e = ctx.eingabe;
    if (e.einrichten !== this.einrichten){ this.einrichten = e.einrichten; this.relax = false; this.framOff = 0; }   // double tap
    if (e.greiferHaelt) this.relax = false;
    else if (this.haelt){
      // let go: keep slipping the same way, from the slip speed, until the claw sits in the perforation again
      const z = zugOf(this.p.zug);
      this.relaxDir = z < 1 ? -1 : z > 1 ? 1 : 0;
      this.relaxV = Math.max(this.P * 0.15, Math.abs(z - 1) * this.P * ctx.kurbel.fps);
      if (Math.abs(this.framOff) < 1) this.framOff = 0;
      this.relax = true;
    }
    this.haelt = e.greiferHaelt;
    if (this.relax) this.relaxGrip(ctx, dt);
  },
  relaxGrip(ctx, dt){
    const k = 1 - Math.exp(-dt / 0.35), P = this.P;
    this.p.zug += (0.6 - this.p.zug) * k;
    let aligned = true;
    if (P && this.framOff !== 0){
      // keep slipping the same way, slowing down, until the next frame line reaches the edge
      const dir = this.relaxDir || (this.framOff < -P / 2 ? -1 : 1);
      const left = dir < 0 ? this.framOff + P : -this.framOff;          // distance still to go
      this.relaxV = Math.min(P * 8, this.relaxV + (P * 2.5 + this.relaxV * 2) * dt);   // ease in: from the slip speed, faster until it catches
      const stepPx = Math.min(left, this.relaxV * dt);
      this.framOff += dir * stepPx;
      if (left - stepPx < 0.5) this.framOff = 0; else aligned = false;
    }
    if (aligned && Math.abs(this.p.zug - 0.6) < 0.002){ this.p.zug = 0.6; this.framOff = 0; this.relax = false; }
    if (P){ ctx.bildfenster.drawImage(this.stripA, 0, Math.round(this.GY + this.framOff), ctx.W, ctx.H, 0, 0, ctx.W, ctx.H); ctx.zeichne(); }
  },
  // the claw pulls the strip by Z pitches, the new exposure lands at the gate as light; what the projector shows can slip
  apply(ctx, bild){
    const { W, H } = ctx, P = this.P, GY = this.GY, z = bild.zyklus, expC = bild.belichtet;
    const Z = zugOf(this.p.zug), ov = transportOverlap(z.winkel, this.p.takt);
    const curOv = z.winkel > 0 ? ov / z.winkel : 0, curTravel = Z * P * (ov / TRANSPORT);
    if (Z > 0.001){
      const sb = this.sb;
      sb.globalCompositeOperation = 'source-over'; sb.globalAlpha = 1;
      sb.fillStyle = '#000'; sb.fillRect(0, 0, W, P * 3);
      sb.drawImage(this.stripA, 0, -Z * P);
      [this.stripA, this.stripB] = [this.stripB, this.stripA]; [this.sa, this.sb] = [this.sb, this.sa];
    }
    const sa = this.sa, still = 1 - 0.5 * curOv;
    sa.globalCompositeOperation = 'screen'; sa.globalAlpha = still;
    sa.drawImage(expC, 0, GY);
    if (curOv > 0.01 && curTravel > 1){
      // exposure while the film is moving: only bright parts leave a trace, fading out like a tail
      const hictx = this.hictx;
      hictx.globalCompositeOperation = 'source-over'; hictx.globalAlpha = 1;
      hictx.drawImage(expC, 0, 0);
      hictx.globalCompositeOperation = 'multiply'; hictx.drawImage(expC, 0, 0); hictx.drawImage(expC, 0, 0); hictx.drawImage(expC, 0, 0);
      hictx.globalCompositeOperation = 'source-over';
      const m = Math.min(28, Math.max(6, Math.round(curTravel / 4)));
      sa.globalCompositeOperation = 'lighter';
      for (let k = 1; k <= m; k++){ const fall = Math.pow(1 - k / (m + 1), 1.6); sa.globalAlpha = 2.2 * curOv * fall / m; sa.drawImage(this.hiC, 0, GY + curTravel * k / m); }
    }
    sa.globalCompositeOperation = 'source-over'; sa.globalAlpha = 1;
    this.framOff += (Z - 1) * P;
    while (this.framOff > 0) this.framOff -= P;
    while (this.framOff <= -P) this.framOff += P;
    if (Math.abs(this.framOff) < 0.5) this.framOff = 0;
    const g = bild.g;
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.drawImage(this.stripA, 0, Math.round(GY + this.framOff), W, H, 0, 0, W, H);
  },
};
