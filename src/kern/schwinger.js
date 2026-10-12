// Ein gedämpfter Schwinger: eine Masse an einer Feder. Ein Stoss gibt ihm Schwung, er schwingt aus und kommt zur Ruhe.
// Module halten sich eigene Schwinger und sagen selbst, wo die Ruhelagen sind (über die Kraft).
export class Schwinger {
  constructor(){ this.x = 0; this.v = 0; }
  // kraft(x): Beschleunigung der Feder an der Stelle x; omega: Eigenkreisfrequenz; zeta: Dämpfung (1 = gerade kein Überschwingen)
  schritt(dt, kraft, omega, zeta){
    const n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;      // kleine Schritte, damit auch harte Federn stabil bleiben
    for (let i = 0; i < n; i++){
      this.v += (kraft(this.x) - 2 * zeta * omega * this.v) * h;
      this.x += this.v * h;
    }
  }
  stoss(dv){ this.v += dv; }
  ruhe(){ this.x = 0; this.v = 0; }
}
