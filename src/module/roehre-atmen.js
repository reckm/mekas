// Röhre atmen (Runde 4a, Idee 12): Bei hellen Szenen gibt die Hochspannung der Röhre nach, weil der Strahl mehr Strom zieht.
// Der Strahl wird weniger steif und lenkt weiter aus: Das ganze Bild wird weich grösser und zieht sich langsam zurück, wenn es
// wieder dunkler wird. Es zählt die Gesamthelligkeit, vor allem grosse helle Flächen, nicht ein einzelnes Licht.
// Gemessen wird das Bildfenster bei jedem neuen Kurbelbild (höchstens alle 100 ms, das Atmen ist langsamer), klein (48 × 27) und in linearem Licht: das
// Mittel der Helligkeit zum Quadrat, so zählen helle Flächen viel und Mitten wenig. Daraus folgt der Massstab über zwei
// Tiefpässe hintereinander, die beim Wachsen schneller sind als beim Zurückgehen. So schwingt nichts nach, und Flackern im Bild
// kommt nicht als Zittern im Massstab an.
const MW = 48, MH = 27;     // so klein wird das Bildfenster gemessen
const VOLL = 0.25;          // bei diesem Mittel (Helligkeit zum Quadrat, etwa ein Viertel des Bilds weiss) atmet es zu 63 %
const LIN = Float32Array.from({ length: 256 }, (_, i) => Math.pow(i / 255, 2.2));

export default {
  id: 'roehreatmen',
  titel: 'Röhre atmen',
  station: 'projektor',
  an: false,
  params: {
    staerke: { min: 0, max: 20, def: 8, schritt: 0.1, titel: 'Stärke (so viel wird das Bild bei einer ganz hellen Szene grösser)', einheit: ' %' },
    wachsen: { min: 0.05, max: 2, def: 0.35, schritt: 0.01, titel: 'Wachsen (so schnell gibt die Hochspannung nach)', einheit: ' s' },
    zurueck: { min: 0.3, max: 8, def: 2, schritt: 0.1, titel: 'Zurück (so langsam erholt sie sich, wenn es dunkler wird)', einheit: ' s' },
  },
  setup(){
    // erst auf der Grafikkarte klein rechnen, dann nur die kleine Fläche herüberholen (die grosse nie auslesen)
    const fl = lesen => { const c = document.createElement('canvas'); c.width = MW; c.height = MH; return c.getContext('2d', { alpha: false, willReadFrequently: lesen }); };
    this.kleinG = fl(false); this.messG = fl(true);
    this.ziel = 0; this.a = 0; this.b = 0; this.nr = -1; this.tMess = -1e9;
  },
  ein(){ this.ziel = this.a = this.b = 0; this.nr = -1; },
  // die Hochspannung folgt der Helligkeit: zwei Tiefpässe hintereinander, je mit der halben Zeit, Wachsen schneller als Zurück
  tick(ctx, dt){
    const folge = (x, z) => x + (z - x) * (1 - Math.exp(-dt / Math.max(0.01, (z > x ? this.p.wachsen : this.p.zurueck) / 2)));
    this.a = folge(this.a, this.ziel);
    this.b = folge(this.b, this.a);
  },
  apply(ctx, bild){
    if (ctx.bildNr !== this.nr && ctx.jetzt - this.tMess >= 100){ this.nr = ctx.bildNr; this.tMess = ctx.jetzt; this.miss(bild.quelle); }
    bild.lage.s *= 1 + this.p.staerke / 100 * this.b;
  },
  miss(quelle){
    this.kleinG.drawImage(quelle, 0, 0, MW, MH);
    this.messG.drawImage(this.kleinG.canvas, 0, 0);
    const d = this.messG.getImageData(0, 0, MW, MH).data;
    let s = 0;
    for (let i = 0; i < d.length; i += 4){ const y = 0.2126 * LIN[d[i]] + 0.7152 * LIN[d[i + 1]] + 0.0722 * LIN[d[i + 2]]; s += y * y; }
    this.ziel = 1 - Math.exp(-s / (MW * MH) / VOLL);
  },
};
