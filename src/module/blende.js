// Blende: Die Umlaufblende ist pro Kurbelbild so viele Grad offen. Unter 36° blendet sie gegen Schwarz,
// so blendet man von Hand auf und ab. Der Fader in der Bedienung stellt die Öffnung.
const ABBLENDEN = 36;

export default {
  id: 'blende',
  titel: 'Blende',
  station: 'belichtung',
  params: {
    winkel: { min: 0, max: 360, def: 135, schritt: 1, titel: 'Öffnung', einheit: '°' },
  },
  apply(ctx, z){
    z.winkel = this.p.winkel;
    z.fenster = [[0, z.T * z.winkel / 360]];
    z.deckung = Math.max(0, Math.min(1, z.winkel / ABBLENDEN));
  },
};
