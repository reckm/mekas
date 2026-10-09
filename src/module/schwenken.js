// Schwenken mit dem Telefon: Im Zoom wandert der Ausschnitt eines Videos mit, wie beim Abfilmen eines Fernsehers.
// Das Gyroskop wird aufsummiert, der Bildrand ist eine Wand. Mitte ist, wie das Telefon beim Start der Aufnahme liegt.
// Nur bei Video und Demo, nicht bei der Live-Kamera.
const fuer = quelle => quelle === 'file' || quelle === 'demo';

export default {
  id: 'schwenken',
  titel: 'Schwenken mit dem Telefon',
  station: 'quelle',
  params: {
    bildwinkel: { min: 20, max: 120, def: 60, schritt: 1, titel: 'Bildwinkel des Videos', einheit: '°' },   // as if the TV filled the view at zoom 1
  },
  setup(ctx){
    this.asked = false; this.asking = false; this.live = false;
    this.panX = 0; this.panY = 0; this.rateU = 0; this.rateR = 0; this.nr = ctx.anlauf.nr;
    this.onMotion = this.onMotion.bind(this);
    // iPhone hands out the motion sensor only when a finger is lifted (a real tap), not when it touches down
    ['touchend', 'click'].forEach(ev => document.addEventListener(ev, () => { if (this.an && fuer(ctx.quelle)) this.ask(ctx); }, true));
  },
  ein(ctx){ this.panX = this.panY = 0; this.asked = false; this.ask(ctx); },
  tick(ctx){
    if (ctx.anlauf.nr !== this.nr){ this.nr = ctx.anlauf.nr; this.panX = this.panY = 0; }   // every take starts in the middle
  },
  onMotion(e){
    const r = e.rotationRate; if (!r || r.beta === null) return;
    this.live = true;
    const a = ((screen.orientation && screen.orientation.angle) || window.orientation || 0) * Math.PI / 180;
    const b = r.beta || 0, g = r.gamma || 0;
    // rotation about the screen's up and right axes, whatever way the phone is held
    const up = b * Math.sin(a) + g * Math.cos(a), right = b * Math.cos(a) - g * Math.sin(a);
    this.rateU += (up - this.rateU) * 0.5; this.rateR += (right - this.rateR) * 0.5;
    const dt = Math.min(0.05, (e.interval > 1 ? e.interval / 1000 : e.interval) || 0.016);
    const dead = v => Math.abs(v) < 0.6 ? 0 : v;          // ignore the gyro's own creep
    this.panX -= dead(this.rateU) * dt; this.panY -= dead(this.rateR) * dt;
  },
  async ask(ctx){
    if (this.asked || this.asking || !this.an) return;
    if (typeof DeviceMotionEvent === 'undefined'){ this.asked = true; return; }
    this.asking = true;
    try {
      if (typeof DeviceMotionEvent.requestPermission === 'function'){
        const r = await DeviceMotionEvent.requestPermission();
        if (r !== 'granted'){
          this.asked = true;
          ctx.sag('Der Bewegungssensor ist gesperrt. Safari fragt erst wieder nach dem Löschen der Website-Daten (Einstellungen › Apps › Safari › Erweitert › Website-Daten).', true);
          return;
        }
      }
      this.asked = true;
      window.addEventListener('devicemotion', this.onMotion);
      setTimeout(() => {
        if (this.live) ctx.sag('Schwenken an: zoom rein und dreh das Telefon.');
        else if (!isSecureContext) ctx.sag('Den Bewegungssensor gibt Safari nur über https frei.', true);
      }, 1200);
    } catch (e) {
      // not inside a real tap yet: try again with the next one
    } finally { this.asking = false; }
  },
  apply(ctx, bild){
    if (!fuer(ctx.quelle) || !this.live) return;
    const { W, H } = ctx, { dw, dh } = bild, fov = this.p.bildwinkel;
    const fovV = fov * dh / dw;           // same degrees per pixel both ways
    const mx = fov * (dw - W) / (2 * dw), my = fovV * (dh - H) / (2 * dh);
    this.panX = Math.max(-mx, Math.min(mx, this.panX)); this.panY = Math.max(-my, Math.min(my, this.panY));   // the edge of the picture is a wall
    bild.dx += -this.panX / fov * dw; bild.dy += -this.panY / fovV * dh;
  },
  hinweis(ctx){ return this.live && fuer(ctx.quelle) && ctx.zoom > 1.05 ? 'schwenkt' : null; },
};
