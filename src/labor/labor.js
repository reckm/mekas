// Labor (nur mit ?labor): alle Module mit Ein/Aus und rohen Reglern, Vergleich, Schnappschuss, Rechenzeit.
// Speichert nur in `mekas.labor`, die normale Bedienung bleibt unberührt.
import { ctx, out, $ } from '../kern/zustand.js?v=1.2.1';
import { comma } from '../kern/mechanik.js?v=1.2.1';
import { VERSION } from '../kern/version.js?v=1.2.1';
import { module, kernteile, modul, setze, schalte, vergleiche, zeiten, STATIONEN } from '../kern/kette.js?v=1.2.1';
import { anstoss, padStoss, bewegungStatus } from '../kern/anstoss.js?v=1.2.1';
import { persist } from '../kern/speicher.js?v=1.2.1';
import { setMode, startCam, loadFile } from '../kern/quelle.js?v=1.2.1';
import { renderExpo, renderGrip, renderMenuWerte, say } from '../kern/bedienung.js?v=1.2.1';

const STATION_TITEL = { takt: 'Takt', quelle: 'Quelle', belichtung: 'Belichtung', entwickeln: 'Entwickeln', transport: 'Transport', projektor: 'Projektor' };
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const ms = v => comma(v.toFixed(2)) + ' ms';
function zeigeWert(d, v){
  if (d.typ === 'schalter') return v ? 'an' : 'aus';
  const s = (d.schritt || 0.01) >= 1 ? String(Math.round(v)) : comma((+v).toFixed(2));
  return s + (d.einheit || '');
}

let gewaehlt = 'blende';
const regler = [];          // { id, name, d, input, val }

function nachAenderung(){ renderExpo(); renderGrip(); renderMenuWerte(); persist(); }

function baue(){
  const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = new URL('./labor.css?v=1.2.1', import.meta.url).href;
  document.head.appendChild(link);

  // Knopf oben in der Leiste
  const knopf = el('button', 'srcbtn laborbtn', 'LABOR'); knopf.type = 'button'; knopf.setAttribute('aria-label', 'Labor zeigen oder verbergen');
  $('.bar.top').insertBefore(knopf, $('#btnFilms'));

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
  inhalt.append(q);

  // Vergleich und Schnappschuss
  const v = el('div', 'lab-zeile lab-knoepfe');
  const bVgl = el('button', 'pill primary lab-vgl', ''); bVgl.type = 'button';
  const bSnap = el('button', 'pill', 'Schnappschuss'); bSnap.type = 'button';
  const bZurueck = el('button', 'pill', 'Zurücksetzen'); bZurueck.type = 'button';
  bZurueck.addEventListener('click', zuruecksetzen);
  const an = e => { e.preventDefault(); try { bVgl.setPointerCapture(e.pointerId); } catch (_) {} vergleiche(gewaehlt); bVgl.classList.add('aktiv'); };
  const ab = () => { vergleiche(null); bVgl.classList.remove('aktiv'); };
  bVgl.addEventListener('pointerdown', an);
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => bVgl.addEventListener(ev, ab));
  bVgl.addEventListener('contextmenu', e => e.preventDefault());
  bSnap.addEventListener('click', schnappschuss);
  v.append(bVgl, bSnap, bZurueck);
  inhalt.append(v);
  const vglText = () => { const m = modul(gewaehlt); bVgl.textContent = m ? 'Ohne ' + m.titel + ' (halten)' : 'Modul antippen'; };

  // Module nach Stationen
  const zeilen = new Map();
  function kasten(m, schaltbar){
    const box = el('div', 'lab-modul');
    const zeile = el('div', 'lab-modulkopf');
    const name = el('button', 'lab-name', m.titel); name.type = 'button';
    const zeit = el('span', 'lab-ms val', '');
    let sw = null;
    if (schaltbar){
      sw = document.createElement('input'); sw.type = 'checkbox'; sw.className = 'switch'; sw.checked = m.an; sw.setAttribute('aria-label', m.titel + ' ein oder aus');
      sw.addEventListener('change', () => { schalte(m.id, sw.checked); nachAenderung(); });
      name.addEventListener('click', () => { gewaehlt = m.id; zeilen.forEach((z, id) => z.box.classList.toggle('gewaehlt', id === gewaehlt)); vglText(); });
      zeile.append(sw);
    }
    zeile.append(name, zeit); box.append(zeile);
    for (const [n, d] of Object.entries(m.params || {})){
      const r = el('label', 'lab-regler');
      const t = el('span', 'lab-titel', d.titel || n), val = el('span', 'val', '');
      const input = document.createElement('input');
      if (d.typ === 'schalter'){ input.type = 'checkbox'; input.className = 'switch'; }
      else { input.type = 'range'; input.min = d.min; input.max = d.max; input.step = d.schritt || (d.max - d.min) / 100; }
      input.addEventListener(d.typ === 'schalter' ? 'change' : 'input', () => { setze(m.id, n, d.typ === 'schalter' ? input.checked : +input.value); val.textContent = zeigeWert(d, m.p[n]); nachAenderung(); });
      r.append(t, val, input); box.append(r);
      regler.push({ m, n, d, input, val });
    }
    if (schaltbar) zeilen.set(m.id, { box, sw, zeit, m });
    return box;
  }
  for (const st of STATIONEN){
    const ms_ = module.filter(m => m.station === st); if (!ms_.length) continue;
    inhalt.append(el('h3', 'lab-station', STATION_TITEL[st] || st));
    for (const m of ms_) inhalt.append(kasten(m, true));
  }
  // Kern
  inhalt.append(el('h3', 'lab-station', 'Kern'));
  for (const k of kernteile) inhalt.append(kasten(k, false));
  const kern = el('div', 'lab-modul lab-kern'); inhalt.append(kern);

  zeilen.forEach((z, id) => z.box.classList.toggle('gewaehlt', id === gewaehlt));
  vglText();
  document.body.querySelector('.app').append(p);

  knopf.addEventListener('click', () => p.classList.toggle('weg'));
  zu.addEventListener('click', () => p.classList.toggle('klein'));

  // Anzeige nachführen: Rechenzeit und Werte, die sich über die Bedienung ändern
  const gesamt = kopf.querySelector('.lab-gesamt');
  setInterval(() => {
    if (p.classList.contains('weg')) return;
    gesamt.textContent = ms(zeiten.gesamt) + '/Bild';
    zeilen.forEach(z => { z.zeit.textContent = ms(z.m.ms); if (z.sw.checked !== z.m.an) z.sw.checked = z.m.an; });
    for (const r of regler){
      const v = r.m.p[r.n];
      if (document.activeElement !== r.input){ if (r.d.typ === 'schalter') r.input.checked = !!v; else if (+r.input.value !== v) r.input.value = v; }
      r.val.textContent = zeigeWert(r.d, v);
    }
    kern.textContent = 'Kurbel ' + comma(ctx.kurbel.fps.toFixed(1)) + ' fps · Bild ' + ctx.W + '×' + ctx.H +
      ' · Licht sammeln ' + ms(zeiten.sammeln) + ' · Projektor ' + ms(zeiten.zeichnen) +
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

/* ---------- Schnappschuss: Bild als PNG, alle Werte als JSON ---------- */
function werte(){
  return {
    version: VERSION, zeit: new Date().toISOString(), quelle: ctx.quelle, aufnahme: ctx.aufnahme, zeitModus: ctx.zeitModus,
    kurbel: { stellung: +ctx.kurbel.x.toFixed(3), fps: +ctx.kurbel.fps.toFixed(2) }, zoom: +ctx.zoom.toFixed(2), ausgabeFps: ctx.ausgabeFps,
    bild: { breite: ctx.W, hoehe: ctx.H },
    module: Object.fromEntries(module.map(m => [m.id, { an: m.an, station: m.station, werte: { ...m.p }, ms: +m.ms.toFixed(3) }])),
  };
}
async function schnappschuss(){
  const d = new Date(), p = n => String(n).padStart(2, '0');
  const base = 'mekas-labor-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
  const png = await new Promise(res => out.toBlob(res, 'image/png'));
  const json = new Blob([JSON.stringify(werte(), null, 2)], { type: 'application/json' });
  const files = [new File([png], base + '.png', { type: 'image/png' }), new File([json], base + '.json', { type: 'application/json' })];
  if (navigator.canShare && navigator.canShare({ files })){
    try { await navigator.share({ files }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  for (const f of files){
    const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name;
    document.body.appendChild(a); a.click(); a.remove();
  }
  say('Schnappschuss gesichert: ' + base);
}

export function starteLabor(){
  baue();
  // für die Tests (tests/rauch.py, tests/bogen.py)
  window.mekas = {
    version: VERSION, ctx, zeiten, werte,
    module: () => module.map(m => ({ id: m.id, titel: m.titel, station: m.station, an: m.an, werte: { ...m.p } })),
    setze: (id, n, v) => { setze(id, n, v); nachAenderung(); },
    schalte: (id, an) => { schalte(id, an); nachAenderung(); },
    vergleiche, quelle: q => q === 'cam' ? startCam(true) : setMode('demo'),
    stoss: (x, y) => padStoss(x, y),                       // wie Tippen aufs Greifer-Pad, Achsen -1..1
    halte: (y, x = 0.5) => { Object.assign(ctx.eingabe, { padFinger: true, greiferHaelt: true, greiferX: x, greiferY: y }); },
    halteBild: an => document.dispatchEvent(new KeyboardEvent(an ? 'keydown' : 'keyup', { code: 'Space', key: ' ', bubbles: true })),   // wie die Leertaste
    lass: () => { Object.assign(ctx.eingabe, { padFinger: false, greiferHaelt: false }); },
  };
}
