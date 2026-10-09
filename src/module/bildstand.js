// Bildstand: Jedes neue Bild sitzt minimal anders im Bildfenster (Mikroraum). Ein stehendes Bild steht still.
export default {
  id: 'bildstand',
  titel: 'Bildstand',
  station: 'projektor',
  params: {
    staerke: { min: 0, max: 1, def: 0.35, schritt: 0.01, titel: 'Stärke' },
  },
  setup(){ this.wx = 0; this.wy = 0; this.ws = 1; this.nr = -1; },
  apply(ctx, bild){
    if (ctx.bildNr !== this.nr){ this.nr = ctx.bildNr; this.neu(ctx); }   // a new position only when a new frame arrives
    bild.lage.x += this.wx; bild.lage.y += this.wy; bild.lage.s *= this.ws;
  },
  neu(ctx){
    if (this.p.staerke <= 0){ this.wx = this.wy = 0; this.ws = 1; return; }
    const A = ctx.H * 0.006 * this.p.staerke, t = ctx.jetzt / 1000;
    this.wy = A * (0.55 * Math.sin(t * 2.1) + 0.25 * Math.sin(t * 5.3 + 1.3) + 0.35 * (Math.random() * 2 - 1));
    this.wx = A * 0.35 * (0.6 * Math.sin(t * 1.3 + 0.7) + 0.5 * (Math.random() * 2 - 1));
    this.ws = 1 + 2.5 * A / Math.min(ctx.W, ctx.H);
  },
};
