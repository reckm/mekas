// Kammblende: zwei geschlitzte Scheiben auf einer Achse. Gegeneinander verdreht, zerhacken sie das offene Fenster
// in schmale Schlitze, aus der Schliere werden einzelne scharfe Fragmente. Nicht in der Bedienung, nur im Labor.
const combOf = h => Math.max(0, Math.min(1, (Math.max(0, Math.min(1, h)) - 0.04) / 0.96));   // 0 = one continuous window

export default {
  id: 'kammblende',
  titel: 'Kammblende',
  station: 'belichtung',
  an: false,
  params: {
    schlitze: { min: 0, max: 1, def: 0.5, schritt: 0.01, titel: 'Schlitze' },
  },
  apply(ctx, z){
    const c = combOf(this.p.schlitze); if (c <= 0) return;
    const N = 2 + Math.round(c * 4), duty = 1 - 0.85 * c;
    // the opening sets how long the window is; the comb decides whether it is one smear or separate fragments
    const neu = [];
    for (const [a, b] of z.fenster){ const slot = (b - a) / N, slit = slot * duty; for (let i = 0; i < N; i++) neu.push([a + i * slot, a + i * slot + slit]); }
    z.fenster = neu;
    z.stops += Math.log2(1 / duty) * 0.8;    // fragments brought up to full light: phases bright, still parts burn
  },
};
