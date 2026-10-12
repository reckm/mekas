// Überblendender Projektor: Im Modus „Bild steht nach“ springt das Bild nicht hart zum nächsten Kurbelbild.
// Wie bei zwei Projektoren blendet das neue über das alte, so lange, wie die Blende in diesem Kurbelbild offen war:
// offen = weicher Übergang, fast zu = hart. Langsam gekurbelt wird es von selbst weicher. Das Stocken bleibt als Rhythmus.
const mk = () => { const c = document.createElement('canvas'); return [c, c.getContext('2d', { alpha: false })]; };

export default {
  id: 'ueberblenden',
  titel: 'Überblendender Projektor',
  station: 'projektor',
  an: 'labor',
  params: {
    laenge: { min: 0, max: 3, def: 2, schritt: 0.05, titel: 'Länge (× Blendenzeit)' },
  },
  setup(){
    [this.alt, this.altG] = mk(); [this.zuletzt, this.zuletztG] = mk(); [this.misch, this.mischG] = mk();
    this.nr = -1; this.t0 = 0; this.dauer = 0;
  },
  reset(ctx){
    for (const c of [this.alt, this.zuletzt, this.misch]){ c.width = ctx.W; c.height = ctx.H; }
    this.dauer = 0;
  },
  apply(ctx, bild){
    if (ctx.zeitModus !== 'hold') return;                // Unterdreht: jedes Bild genau einmal, ohne Mischen
    if (ctx.bildNr !== this.nr){
      // ein neues Bild kommt: was eben noch zu sehen war, bleibt als „alter Projektor“ stehen
      if (this.nr >= 0){
        [this.alt, this.zuletzt] = [this.zuletzt, this.alt]; [this.altG, this.zuletztG] = [this.zuletztG, this.altG];
        this.t0 = ctx.jetzt;
        this.dauer = this.p.laenge * ctx.belichtung.T * ctx.belichtung.winkel / 360;
      }
      this.nr = ctx.bildNr;
    }
    // was der Projektor gerade zeigt, für das nächste Mal festhalten
    this.zuletztG.drawImage(bild.quelle, 0, 0);
    const a = this.dauer > 0 ? (ctx.jetzt - this.t0) / this.dauer : 1;
    if (a >= 1) return;
    // altes Bild, neues mit wachsendem Anteil darüber: (1 − a) · alt + a · neu
    const g = this.mischG;
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1; g.drawImage(this.alt, 0, 0);
    g.globalAlpha = Math.max(0, a); g.drawImage(bild.quelle, 0, 0);
    g.globalAlpha = 1;
    bild.quelle = this.misch;
    ctx.zeichne();                                        // bis die Blende fertig ist, jedes Ausgabebild neu
  },
};
