// Handkurbel: Die Hand dreht nie ganz gleichmässig. Jedes Kurbelbild kommt etwas früher oder später (Mikrozeit).
export default {
  id: 'handkurbel',
  titel: 'Handkurbel',
  station: 'takt',
  params: {
    unruhe: { min: 0, max: 1, def: 0.75, schritt: 0.01, titel: 'Unregelmässigkeit' },
  },
  apply(ctx, takt){
    takt.abstand = takt.T * (1 + (Math.random() * 2 - 1) * 0.6 * this.p.unruhe);
  },
};
