// Entwickeln: Wie lange Licht kam, wird zur Helligkeit, gemessen an der Bolex (135° bei Ausgabetempo).
// Langsamer kurbeln belichtet länger und wird heller. Nach jedem Start überbelichtet der Anlaufblitz die ersten Bilder.
import { REF_ANGLE } from '../kern/mechanik.js?v=2.4.0';

export default {
  id: 'entwickeln',
  titel: 'Entwickeln',
  station: 'entwickeln',
  params: {
    staerke: { min: 0, max: 1, def: 0.3, schritt: 0.01, titel: 'Stärke' },
    anlaufblitz: { typ: 'schalter', def: true, titel: 'Anlaufblitz' },
  },
  setup(ctx){ this.q = []; this.nr = ctx.anlauf.nr; },
  ein(ctx){ this.q = []; this.nr = ctx.anlauf.nr; },
  tick(ctx){
    if (ctx.anlauf.nr !== this.nr){
      this.nr = ctx.anlauf.nr;
      if (this.p.anlaufblitz && !ctx.anlauf.doppel) this.q = [1.6, 0.9, 0.4];
    }
    if (ctx.aufnahme === 'paused') this.q = [];
  },
  apply(ctx, bild){
    const ref = (REF_ANGLE / 360) / ctx.ausgabeFps;
    let stops = Math.max(-2, Math.min(1.2, Math.log2(Math.max(1e-4, bild.E) / ref) * this.p.staerke));
    stops += bild.zyklus.stops;
    if (this.q.length) stops += this.q.shift();
    const g = bild.g;
    if (stops > 0.01){
      g.globalCompositeOperation = 'screen';
      for (let r = stops; r > 0.01; r -= 1){ g.globalAlpha = Math.min(1, r); g.drawImage(bild.roh, 0, 0); }
    } else if (stops < -0.01){
      g.globalAlpha = 1 - Math.pow(2, stops); g.fillStyle = '#000'; g.fillRect(0, 0, ctx.W, ctx.H);
    }
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  },
};
