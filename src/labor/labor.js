// Labor (nur mit ?labor): Quellen, Zurücksetzen, die Module, die noch eingestellt werden, mit Ein/Aus und rohen Reglern, Rechenzeit.
// Speichert nur in `mekas.labor`, die normale Bedienung bleibt unberührt.
import { ctx, $ } from '../kern/zustand.js?v=1.2.6';
import { comma } from '../kern/mechanik.js?v=1.2.6';
import { VERSION } from '../kern/version.js?v=1.2.6';
import { module, kernteile, modul, setze, schalte, vergleiche, zeiten, STATIONEN } from '../kern/kette.js?v=1.2.6';
import { anstoss, padStoss, bewegungStatus } from '../kern/anstoss.js?v=1.2.6';
import { sammeln, sammeltNeu } from '../kern/sammeln.js?v=1.2.6';
import { persist } from '../kern/speicher.js?v=1.2.6';
import { setMode, startCam, loadFile } from '../kern/quelle.js?v=1.2.6';
import { renderExpo, renderGrip, renderMenuWerte, say } from '../kern/bedienung.js?v=1.2.6';
import { oeffne as bauplan } from './bauplan.js?v=1.2.6';

const STATION_TITEL = { takt: 'Takt', quelle: 'Quelle', belichtung: 'Belichtung', emulsion: 'Emulsion', entwickeln: 'Entwickeln', transport: 'Transport', projektor: 'Projektor' };
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const ms = v => comma(v.toFixed(2)) + ' ms';
function zeigeWert(d, v){
  if (d.typ === 'schalter') return v ? 'an' : 'aus';
  if (d.typ === 'wahl') return v;
  const s = (d.schritt || 0.01) >= 1 ? String(Math.round(v)) : comma((+v).toFixed(2));
  return s + (d.einheit || '');
}

// Was das Labor nicht mehr zeigt (Maris 2026-10-13): Abgenommenes, und was auf dem Bildschirm oder im Menü schon einen Griff hat.
// Alles steht weiter im Bauplan. ganz: das Modul fehlt im Labor; schalter: false = ohne Ein/Aus; an: läuft immer in seiner Grundstellung
// (ein alter Labor-Stand schaltet es nicht mehr aus); fest: diese Werte gelten mit der Grundeinstellung und sind nicht zu sehen.
const AUS_DEM_LABOR = {
  schwenken: { ganz: true, fest: ['bildwinkel'] },                 // Ein/Aus im Menü
  blende: { ganz: true, an: true },                                // Öffnung mit dem Fader
  entwickeln: { ganz: true, an: true, fest: ['staerke', 'anlaufblitz'] },   // Anlaufblitz immer an (Maris 2026-10-13)
  greifer: { ganz: true, an: true },
  stehenderfilm: { schalter: false, an: true, fest: ['lichthof'] },   // zwei Finger wählen ihn
  bildstand: { ganz: true, an: true },                             // Stärke im Menü
  anstossen: { ganz: true, fest: ['pad', 'gyro', 'schwelle', 'nurMitFinger'] },   // gekoppelt über den Knopf über dem Greifer
};
const zeigt = m => !(AUS_DEM_LABOR[m.id] && AUS_DEM_LABOR[m.id].ganz);
function ausDemLabor(){
  for (const [id, a] of Object.entries(AUS_DEM_LABOR)){
    const m = modul(id); if (!m) continue;
    if (a.an && m.station) schalte(id, m.grund);
    for (const n of a.fest || []) if (m.params && m.params[n]) setze(id, n, m.params[n].def);
  }
}

const regler = [];          // { id, name, d, input, val }

function nachAenderung(){ renderExpo(); renderGrip(); renderMenuWerte(); persist(); }

function baue(){
  const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = new URL('./labor.css?v=1.2.6', import.meta.url).href;
  document.head.appendChild(link);

  // Knopf oben in der Leiste
  const knopf = el('button', 'srcbtn laborbtn', 'LABOR'); knopf.type = 'button'; knopf.setAttribute('aria-label', 'Labor zeigen oder verbergen');
  $('.bar.top').insertBefore(knopf, $('#btnFilms'));
  // daneben der Bauplan: die ganze Architektur auf einem Blatt
  const bp = el('button', 'iconbtn bauplanbtn'); bp.type = 'button'; bp.setAttribute('aria-label', 'Bauplan: die Architektur mit allen Teilen');
  bp.innerHTML = '<svg viewBox="0 0 24 24"><rect x="3" y="3.5" width="7" height="5" rx="1.2"/><rect x="14" y="3.5" width="7" height="5" rx="1.2"/><rect x="8.5" y="15.5" width="7" height="5" rx="1.2"/><path d="M6.5 8.5v3.5h11V8.5M12 12v3.5"/></svg>';
  bp.addEventListener('click', bauplan);
  $('.bar.top').insertBefore(bp, $('#btnFilms'));

  const p = el('aside', 'labor'); p.id = 'labor'; p.setAttribute('aria-label', 'Labor');
  const kopf = el('div', 'lab-kopf');
  kopf.append(el('b', '', 'Labor · Mekas ' + VERSION), el('span', 'lab-gesamt val', ''));
  const zu = el('button', 'lab-zu', '–'); zu.type = 'button'; zu.setAttribute('aria-label', 'Labor einklappen');
  kopf.append(zu);
  p.append(kopf);
  const inhalt = el('div', 'lab-inhalt'); p.append(inhalt);

  // Quellen
  const q = el('div', 'lab-zeile lab-knoepfe');
  const bCam = el('button', 'pill', 'Kamera'), bDemo = el('button', 'pill', 'Demo'), lVid = el('label', 'pill', 'Video laden');
  const fIn = document.createElement('input'); fIn.type = 'file'; fIn.accept = 'video/*'; lVid.append(fIn);
  [bCam, bDemo].forEach(b => b.type = 'button');
  bCam.addEventListener('click', () => startCam(false));
  bDemo.addEventListener('click', () => setMode('demo'));
  fIn.addEventListener('change', e => { loadFile(e.target.files && e.target.files[0]); e.target.value = ''; });
  q.append(bCam, bDemo, lVid);
  const z = el('div', 'lab-zeile lab-knoepfe');
  const bZurueck = el('button', 'pill', 'Zurücksetzen'); bZurueck.type = 'button';
  bZurueck.addEventListener('click', zuruecksetzen);
  z.append(bZurueck);
  inhalt.append(q, z);

  // Module nach Stationen
  const zeilen = new Map();
  function kasten(m, schaltbar){
    const box = el('div', 'lab-modul');
    const zeile = el('div', 'lab-modulkopf');
    const name = el('span', 'lab-name', m.titel);
    const zeit = el('span', 'lab-ms val', '');
    let sw = null;
    const a = AUS_DEM_LABOR[m.id] || {};
    if (schaltbar && a.schalter !== false){
      sw = document.createElement('input'); sw.type = 'checkbox'; sw.className = 'switch'; sw.checked = m.an; sw.setAttribute('aria-label', m.titel + ' ein oder aus');
      sw.addEventListener('change', () => { schalte(m.id, sw.checked); nachAenderung(); });
      zeile.append(sw);
    }
    zeile.append(name, zeit); box.append(zeile);
    for (const [n, d] of Object.entries(m.params || {})){
      if ((a.fest || []).includes(n)) continue;
      const r = el('label', 'lab-regler');
      const t = el('span', 'lab-titel', d.titel || n), val = el('span', 'val', '');
      const input = document.createElement('input');
      if (d.typ === 'schalter'){ input.type = 'checkbox'; input.className = 'switch'; }
      else if (d.typ === 'wahl'){ input.type = 'range'; input.min = 0; input.max = d.werte.length - 1; input.step = 1; }   // Fader mit Raststellen
      else { input.type = 'range'; input.min = d.min; input.max = d.max; input.step = d.schritt || (d.max - d.min) / 100; }
      const lies = () => d.typ === 'schalter' ? input.checked : d.typ === 'wahl' ? d.werte[+input.value] : +input.value;
      input.addEventListener(d.typ === 'schalter' ? 'change' : 'input', () => { setze(m.id, n, lies()); val.textContent = zeigeWert(d, m.p[n]); nachAenderung(); });
      r.append(t, val, input);
      // unter dem Fader die Namen der Raststellen, antippen springt hin
      let namen = null;
      if (d.typ === 'wahl'){
        namen = el('span', 'lab-rasten');
        d.werte.forEach(w => {
          const b = el('button', '', w); b.type = 'button';
          b.addEventListener('click', e => { e.preventDefault(); setze(m.id, n, w); nachAenderung(); });
          namen.append(b);
        });
        r.append(namen);
      }
      box.append(r);
      regler.push({ m, n, d, input, val, namen });
    }
    if (schaltbar) zeilen.set(m.id, { box, sw, zeit, m });
    return box;
  }
  for (const st of STATIONEN){
    const ms_ = module.filter(m => m.station === st && zeigt(m)); if (!ms_.length) continue;
    inhalt.append(el('h3', 'lab-station', STATION_TITEL[st] || st));
    for (const m of ms_) inhalt.append(kasten(m, true));
  }
  // Kern
  inhalt.append(el('h3', 'lab-station', 'Kern'));
  for (const k of kernteile.filter(zeigt)) inhalt.append(kasten(k, false));
  const kern = el('div', 'lab-modul lab-kern'); inhalt.append(kern);

  document.body.querySelector('.app').append(p);

  knopf.addEventListener('click', () => p.classList.toggle('weg'));
  zu.addEventListener('click', () => p.classList.toggle('klein'));

  // Anzeige nachführen: Rechenzeit und Werte, die sich über die Bedienung ändern
  const gesamt = kopf.querySelector('.lab-gesamt');
  setInterval(() => {
    if (p.classList.contains('weg')) return;
    gesamt.textContent = ms(zeiten.gesamt) + '/Bild';
    zeilen.forEach(z => { z.zeit.textContent = ms(z.m.ms); if (z.sw && z.sw.checked !== z.m.an) z.sw.checked = z.m.an; });
    for (const r of regler){
      const v = r.m.p[r.n];
      const iv = r.d.typ === 'wahl' ? r.d.werte.indexOf(v) : v;
      if (document.activeElement !== r.input){ if (r.d.typ === 'schalter') r.input.checked = !!v; else if (+r.input.value !== iv) r.input.value = iv; }
      r.val.textContent = zeigeWert(r.d, v);
      if (r.namen) [...r.namen.children].forEach((b, i) => b.classList.toggle('an', i === iv));
    }
    const sa = sammeln.anzeige;
    kern.textContent = 'Kurbel ' + comma(ctx.kurbel.fps.toFixed(1)) + ' fps · Bild ' + ctx.W + '×' + ctx.H +
      ' · Kamera ' + comma(sa.kameraFps.toFixed(1)) + ' Bilder/s · ' +
      (sammeltNeu() ? comma(sa.teile.toFixed(1)) + ' Teilbelichtungen pro Kurbelbild' : 'altes Sammeln' + (sa.fehler ? ' (' + sa.fehler + ')' : '')) +
      ' · Licht sammeln ' + ms(zeiten.sammeln) + ' · Projektor ' + ms(zeiten.zeichnen) +
      ' · Finger ' + ctx.eingabe.finger + (ctx.standbild ? ' (hält)' : ctx.halten ? ' (accum.)' : '') +
      ' · Sensor ' + ({ neu: 'noch nicht gefragt', fragt: 'fragt', an: 'an', gesperrt: 'gesperrt', fehlt: 'fehlt' }[bewegungStatus()]) +
      (anstoss.anzeige.daten ? '' : ', keine Daten') +
      ' · Ruck ' + Math.round(anstoss.anzeige.gyro) + ' °/s, höchster ' + Math.round(anstoss.anzeige.spitze) + ' °/s · letzter Stoss ' + comma(anstoss.anzeige.letzter.toFixed(1));
  }, 250);
}

// alle Module und Kern-Werte auf die Grundeinstellung, Module auf ihre Grundstellung ein/aus
function zuruecksetzen(){
  for (const m of [...module, ...kernteile]){
    for (const [n, d] of Object.entries(m.params || {})) setze(m.id, n, d.def);
    if (m.station && m.an !== m.grund) schalte(m.id, m.grund);
  }
  nachAenderung(); say('Labor auf die Grundeinstellung zurückgesetzt.');
}

// alle Werte auf einen Blick (für die Tests)
function werte(){
  return {
    version: VERSION, zeit: new Date().toISOString(), quelle: ctx.quelle, aufnahme: ctx.aufnahme, zeitModus: ctx.zeitModus,
    kurbel: { stellung: +ctx.kurbel.x.toFixed(3), fps: +ctx.kurbel.fps.toFixed(2) }, zoom: +ctx.zoom.toFixed(2), ausgabeFps: ctx.ausgabeFps,
    bild: { breite: ctx.W, hoehe: ctx.H },
    module: Object.fromEntries(module.map(m => [m.id, { an: m.an, station: m.station, werte: { ...m.p }, ms: +m.ms.toFixed(3) }])),
  };
}
export function starteLabor(){
  ausDemLabor(); nachAenderung();
  baue();
  // für die Tests (tests/rauch.py, tests/bogen.py); vergleiche(id) zeigt das Bild ohne dieses Modul
  window.mekas = {
    version: VERSION, ctx, zeiten, werte,
    module: () => module.map(m => ({ id: m.id, titel: m.titel, station: m.station, an: m.an, werte: { ...m.p } })),
    setze: (id, n, v) => { setze(id, n, v); nachAenderung(); },
    schalte: (id, an) => { schalte(id, an); nachAenderung(); },
    vergleiche, quelle: q => q === 'cam' ? startCam(true) : setMode('demo'),
    stoss: (x, y) => padStoss(x, y),                       // wie Tippen aufs Greifer-Pad, Achsen -1..1
    halte: (y, x = 0.5) => { Object.assign(ctx.eingabe, { padFinger: true, greiferHaelt: true, greiferX: x, greiferY: y }); },
    standBild: an => document.dispatchEvent(new KeyboardEvent(an ? 'keydown' : 'keyup', { key: 'h', bubbles: true })),   // wie drei Finger
    halteBild: an => document.dispatchEvent(new KeyboardEvent(an ? 'keydown' : 'keyup', { code: 'Space', key: ' ', bubbles: true })),   // wie die Leertaste
    lass: () => { Object.assign(ctx.eingabe, { padFinger: false, greiferHaelt: false }); },
  };
}
