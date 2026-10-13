// Bauplan (nur mit ?labor): die ganze Architektur auf einem Blatt. Hände (was Maris spielt), die Kette (wodurch jedes Bild läuft)
// und die Maschinen im Kern, mit Stand und Griff. Antippen zeigt, was von einem Teil abhängt (blau) und woran es hängt (weiss umrandet).
// Nachführen, wenn ein Modul dazukommt oder sich eine Abhängigkeit ändert. Ein Modul ohne Eintrag erscheint trotzdem, mit Hinweis.
import { ctx } from '../kern/zustand.js?v=1.2.6';
import { comma, fmtFps } from '../kern/mechanik.js?v=1.2.6';
import { VERSION } from '../kern/version.js?v=1.2.6';
import { module, modul, wert, STATIONEN } from '../kern/kette.js?v=1.2.6';
import { sammeln, sammeltNeu } from '../kern/sammeln.js?v=1.2.6';

// Stand: bedienung (in Maris' normaler Bedienung), labor (nur im Labor), geplant (Fahrplan, mit Runde)
// an: woran ein Teil hängt (was es liest oder wer es spielt). griff: wo man es einstellt. jetzt: der Wert gerade.
const HAENDE = {
  wischenX: { titel: 'Wischen seitwärts', kurz: 'dreht die Kurbel' },
  wischenY: { titel: 'Wischen hoch und runter', kurz: 'Zoom' },
  fader: { titel: 'Blende-Fader', kurz: 'rechts unten: wie weit die Blende offen ist' },
  pad: { titel: 'Greifer-Pad', kurz: 'Tippen gibt einen Stoss, Halten lässt den Film schlüpfen' },
  ruck: { titel: 'Ruck mit dem Telefon', kurz: 'wie ein Schlag an die Kamera. Der Knopf über dem Greifer koppelt ab',
    jetzt: () => wert('anstossen', 'gekoppelt') === false ? 'entkoppelt' : 'gekoppelt' },
  drehen: { titel: 'Telefon drehen', kurz: 'schwenkt den Ausschnitt im Zoom' },
  zwei: { titel: 'Zwei Finger', kurz: 'accum.: der Film steht, die Kurbel dreht weiter' },
  drei: { titel: 'Drei Finger', kurz: 'hält: friert das sichtbare Bild ein' },
  ausloeser: { titel: 'Auslöser, Doppel, Fertig', kurz: 'aufnehmen, pausieren, darüber belichten, speichern' },
  menue: { titel: 'Einstellungen', kurz: 'Quelle, Zeit, Handkurbel, Bildstand, Anlaufblitz, Aufnahme' },
};

const STATION = {
  takt: ['Takt', 'wann ein Kurbelbild beginnt'],
  quelle: ['Quelle', 'was vor dem Objektiv ist'],
  belichtung: ['Belichtung', 'wann und wie lange Licht kommt'],
  emulsion: ['Emulsion', 'jede Teilbelichtung, etwa 30 pro Sekunde'],
  entwickeln: ['Entwickeln', 'Licht wird Helligkeit'],
  transport: ['Transport', 'der Film im Bildfenster'],
  projektor: ['Projektor', 'wie das Bild gezeigt wird'],
  aufnahme: ['Aufnahme', 'der Film entsteht'],
};

const TEILE = {
  // Takt
  kurbel: { ort: 'takt', titel: 'Kurbel', stand: 'bedienung', kurz: 'Taktgeber: 4–24 Kurbelbilder pro Sekunde', griff: 'Wischen seitwärts',
    an: ['wischenX', 'drei'], jetzt: () => fmtFps(ctx.kurbel.fps) + ' fps' },
  handkurbel: { ort: 'takt', titel: 'Handkurbel', stand: 'bedienung', kurz: 'die Hand dreht nie ganz gleichmässig: jedes Bild kommt etwas früher oder später',
    griff: 'Menü, Labor: Unregelmässigkeit', an: ['kurbel', 'menue'] },
  // Quelle
  quelle: { ort: 'quelle', titel: 'Kamera, Video, Demo', stand: 'bedienung', kurz: 'Live-Kamera mit etwa 30 Bildern pro Sekunde, geladenes Video oder Demo',
    griff: 'Knopf oben links, Menü', an: ['menue'], jetzt: () => ({ cam: 'Kamera', file: 'Video', demo: 'Demo' }[ctx.quelle]) },
  zoom: { ort: 'quelle', titel: 'Zoom', stand: 'bedienung', kurz: '1- bis 3-fach', griff: 'Wischen hoch und runter',
    an: ['wischenY'], jetzt: () => comma(ctx.zoom.toFixed(1)) + '×' },
  schwenken: { ort: 'quelle', titel: 'Schwenken', stand: 'bedienung', kurz: 'im Zoom wandert der Ausschnitt mit, wie beim Abfilmen eines Fernsehers. Nur Video und Demo',
    griff: 'Menü: ein/aus', an: ['drehen', 'zoom', 'bewegung'] },
  linse: { ort: 'quelle', titel: 'Linse', stand: 'geplant', runde: 'Runde 3', kurz: 'das kaputte iPhone: die Linse schwingt, der Sensor liest Zeile für Zeile',
    an: ['sammeln', 'schwinger', 'anstossen'] },
  // Belichtung
  blende: { ort: 'belichtung', titel: 'Blende', stand: 'bedienung', kurz: 'Umlaufblende: 0–360° offen pro Kurbelbild, unter 36° gegen Schwarz',
    griff: 'Fader', an: ['fader', 'kurbel'], jetzt: () => Math.round(wert('blende', 'winkel')) + '°' },
  // Emulsion
  farbsektoren: { ort: 'emulsion', titel: 'Farbsektoren', stand: 'geplant', runde: 'Runde 4', kurz: 'rote, grüne und blaue Sektoren in der Blende: Bewegtes bekommt Farbsäume',
    an: ['blende', 'sammeln'] },
  filme: { ort: 'emulsion', titel: 'Filme', stand: 'geplant', runde: '2b, Runde 4', kurz: 'Filmmaterial als Rezepte der Gedächtnis-Schicht: müder Entwickler (2b), Lith, Röhre',
    an: ['gedaechtnis', 'sammeln'] },
  // Entwickeln
  entwickeln: { ort: 'entwickeln', titel: 'Entwickeln', stand: 'bedienung', kurz: 'länger belichtet wird heller: langsam kurbeln oder weit öffnen gibt mehr Licht. Wird Teil der Filme (2b)',
    griff: 'fest', an: ['sammeln', 'kurbel', 'blende'] },
  anlaufblitz: { ort: 'entwickeln', titel: 'Anlaufblitz', stand: 'bedienung', kurz: 'die ersten Bilder nach jedem Start sind überbelichtet, wie beim Anlaufen der Kamera',
    griff: 'Menü: ein/aus', an: ['ausloeser'] },
  // Transport
  greifer: { ort: 'transport', titel: 'Greifer', stand: 'bedienung', kurz: 'der Film rastet federnd im Bildfenster. Stoss: er rutscht, Halten: Schlupf. Über 240° Schlieren aus den Lichtern',
    griff: 'Pad, Ruck', an: ['pad', 'anstossen', 'schwinger', 'blende'] },
  stehenderfilm: { ort: 'transport', titel: 'Stehender Film', stand: 'labor', kurz: 'accum.: dasselbe Stück Film wird immer wieder belichtet, Sandwich mit Lichthof',
    griff: 'zwei Finger. Labor: Lichthof, Überblendung beim Loslassen', an: ['zwei', 'kurbel', 'blende'],
    jetzt: () => ctx.halten && !ctx.standbild ? 'sammelt' : '' },
  // Projektor
  bildstand: { ort: 'projektor', titel: 'Bildstand', stand: 'bedienung', kurz: 'jedes neue Bild sitzt minimal anders im Bildfenster', griff: 'Menü: Stärke', an: ['kurbel', 'menue'] },
  ueberblenden: { ort: 'projektor', titel: 'Überblendender Projektor', stand: 'labor', kurz: 'das neue Bild blendet weich über das alte, so lange, wie die Blende offen war',
    griff: 'Labor: Länge', an: ['blende', 'kurbel', 'zeit'] },
  halten: { ort: 'projektor', titel: 'Hält', stand: 'bedienung', kurz: 'friert genau das Bild ein, das gerade zu sehen ist', griff: 'drei Finger', an: ['drei'],
    jetzt: () => ctx.standbild ? 'hält' : '' },
  // Aufnahme
  aufnahme: { ort: 'aufnahme', titel: 'Aufnahme', stand: 'bedienung', kurz: 'mit 24, 25 oder 30 Bildern pro Sekunde, Ton nur vom Mikrofon', griff: 'Auslöser, Menü', an: ['ausloeser', 'menue'] },
  doppel: { ort: 'aufnahme', titel: 'Doppel', stand: 'bedienung', kurz: 'zurückspulen und darüber belichten, abgeblendet wird mit der Blende', griff: 'Knopf Doppel', an: ['ausloeser', 'blende'] },
  zeit: { ort: 'aufnahme', titel: 'Zeit', stand: 'bedienung', kurz: 'Bild steht nach (echte Zeit) oder Unterdreht (jedes Bild genau einmal)', griff: 'Menü', an: ['menue'],
    jetzt: () => ctx.zeitModus === 'under' ? 'Unterdreht' : 'steht nach' },
  fotomodus: { ort: 'aufnahme', titel: 'Foto-Modus', stand: 'geplant', runde: 'Runde 4', kurz: 'freie Anzahl Teilbelichtungen in freiem Tempo, zu einem Foto summiert', an: ['sammeln', 'ausloeser'] },
  // Maschinen im Kern
  sammeln: { ort: 'kern', titel: 'Sammeln', stand: 'labor', kurz: 'jedes Kamerabild ist eine Teilbelichtung und zählt genau einmal, in linearem Licht (2a)',
    griff: 'Labor: neu/alt zum Vergleichen', an: ['quelle', 'blende'],
    jetzt: () => sammeltNeu() ? comma(sammeln.anzeige.teile.toFixed(1)) + ' pro Bild' : 'alt' },
  schwinger: { ort: 'kern', titel: 'Schwinger', stand: 'bedienung', kurz: 'gedämpfte Feder: ein Stoss, Ausschwingen, Ruhe. Für Greifer, später Linse und Pendel', an: ['anstossen'] },
  anstossen: { ort: 'kern', titel: 'Anstossen', stand: 'bedienung', kurz: 'sammelt die Stösse vom Pad und vom Ruck', griff: 'Pad, Ruck, Knopf über dem Greifer', an: ['pad', 'ruck', 'bewegung'] },
  bewegung: { ort: 'kern', titel: 'Bewegungssensor', stand: 'bedienung', kurz: 'das Gyroskop: einmal freigegeben, geteilt von Anstossen und Schwenken', an: [] },
  gedaechtnis: { ort: 'kern', titel: 'Gedächtnis-Schicht', stand: 'geplant', runde: '2b', kurz: 'ein Zustand pro Pixel, den Licht verändert und der sich erholt. Anstossen rührt',
    an: ['sammeln', 'anstossen'] },
  bildgedaechtnis: { ort: 'kern', titel: 'Bildgedächtnis', stand: 'geplant', runde: 'später', kurz: 'die letzten Bilder über Sekunden: Zweiter Projektor, Pendel, Kopierwerk', an: [] },
};

const FAHRPLAN = [
  ['A', 'Runde 1 abschliessen', 'Gyroskop-Knopf gebaut, iPhone-Test offen'],
  ['B', 'Fundament', '2a Teilbelichtungen gebaut · 2b Gedächtnis-Schicht mit müdem Entwickler'],
  ['C', 'Linse', 'das kaputte iPhone, danach Fokus sucht, Linse auf Federn'],
  ['D', 'Filme', 'Lith, Röhre, Mehrumlauf-Blende, Farbsektoren, Foto-Modus'],
  ['E', 'Gehäuse und Übernahme', 'Bolex, Telefon, Filmdosen, Kopplungen, alles in die Bedienung'],
  ['F', 'Kopierwerk', 'ganz am Schluss'],
];
const STAND_TEXT = { bedienung: 'in der Bedienung', labor: 'im Labor', geplant: 'geplant' };

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
let blatt = null, gewaehlt = null, timer = 0;
const karten = new Map();              // id → Element
const alle = () => ({ ...Object.fromEntries(Object.entries(HAENDE).map(([id, h]) => [id, { ...h, ort: 'hand', an: [] }])), ...TEILE });
const name = id => (alle()[id] || modul(id) || { titel: id }).titel;

function karte(id, t){
  const k = el('div', 'bp-teil bp-' + (t.stand || 'hand')); k.dataset.id = id;
  k.tabIndex = 0; k.setAttribute('role', 'button'); k.setAttribute('aria-pressed', 'false');
  const kopf = el('span', 'bp-kopf');
  kopf.append(el('b', '', t.titel), el('span', 'bp-jetzt val', ''));
  k.append(kopf);
  if (t.stand) k.append(el('span', 'bp-stand', STAND_TEXT[t.stand] + (t.runde ? ', ' + t.runde : '')));
  k.append(el('span', 'bp-kurz', t.kurz));
  if (t.griff) k.append(el('span', 'bp-griff', 'Griff: ' + t.griff));
  if (t.an && t.an.length){
    const an = el('span', 'bp-an', 'hängt an ');
    for (const a of t.an){ const i = el('i', '', name(a)); i.dataset.id = a; an.append(i); }
    k.append(an);
  }
  const waehle = () => { gewaehlt = gewaehlt === id ? null : id; zeigeAuswahl(); };
  k.addEventListener('click', waehle);
  k.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); waehle(); } });
  karten.set(id, k);
  return k;
}

// was von `id` abhängt (direkt und weiter hinten) und woran es direkt hängt
function beziehungen(id){
  const teile = alle(), nach = new Map();
  for (const [t, d] of Object.entries(teile)) for (const a of d.an || []) { if (!nach.has(a)) nach.set(a, []); nach.get(a).push(t); }
  const direkt = new Set(nach.get(id) || []), weiter = new Set();
  const offen = [...direkt];
  while (offen.length){ const x = offen.shift(); for (const y of nach.get(x) || []) if (y !== id && !direkt.has(y) && !weiter.has(y)){ weiter.add(y); offen.push(y); } }
  return { direkt, weiter, vorher: new Set((teile[id] && teile[id].an) || []) };
}
function zeigeAuswahl(){
  const info = blatt.querySelector('.bp-info');
  blatt.classList.toggle('bp-auswahl', !!gewaehlt);
  if (!gewaehlt){
    karten.forEach(k => { k.className = k.className.replace(/ bp-(gewaehlt|wirkt|wirkt2|haengt)/g, ''); k.setAttribute('aria-pressed', 'false'); });
    blatt.querySelectorAll('.bp-an i.an').forEach(i => i.classList.remove('an'));
    info.textContent = 'Tipp ein Teil an: blau wird, was davon abhängt, weiss umrandet, woran es hängt.';
    return;
  }
  const b = beziehungen(gewaehlt);
  blatt.querySelectorAll('.bp-an i').forEach(i => i.classList.toggle('an', i.dataset.id === gewaehlt));   // das Schild des Gewählten in den anderen Karten
  karten.forEach((k, id) => {
    k.className = k.className.replace(/ bp-(gewaehlt|wirkt|wirkt2|haengt)/g, '');
    const c = id === gewaehlt ? 'gewaehlt' : b.direkt.has(id) ? 'wirkt' : b.weiter.has(id) ? 'wirkt2' : b.vorher.has(id) ? 'haengt' : '';
    if (c) k.className += ' bp-' + c;
    k.setAttribute('aria-pressed', String(id === gewaehlt));
  });
  const liste = s => [...s].map(name).join(', ');
  info.textContent = '';
  info.append(el('b', '', name(gewaehlt)), (b.direkt.size ? ' wirkt auf ' + liste(b.direkt) : ' wirkt auf nichts weiter') +
    (b.weiter.size ? ', weiter hinten auf ' + liste(b.weiter) : '') + (b.vorher.size ? '. Hängt an ' + liste(b.vorher) + '.' : '.'));
}

function nachfuehren(){
  const teile = alle();
  karten.forEach((k, id) => {
    const t = teile[id], m = modul(id), j = k.querySelector('.bp-jetzt');
    const aus = m && m.station && !m.an;
    k.classList.toggle('bp-aus', !!aus);
    const text = aus ? 'aus' : t && t.jetzt ? t.jetzt() : '';
    if (j.textContent !== text) j.textContent = text;
  });
}

function baue(){
  const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = new URL('./bauplan.css?v=1.2.6', import.meta.url).href;
  document.head.appendChild(link);
  blatt = el('div', 'bauplan'); blatt.id = 'bauplan'; blatt.hidden = true;
  blatt.setAttribute('role', 'dialog'); blatt.setAttribute('aria-label', 'Bauplan');
  // oben fest: Titel und die Zeile, die die Auswahl in Worten sagt
  const oben = el('div', 'bp-oben'), zeile = el('div', 'bp-zeile');
  const titel = el('div', 'bp-titel'); titel.append(el('b', '', 'Bauplan'), el('span', '', 'Mekas ' + VERSION));
  const zu = el('button', 'close', '×'); zu.type = 'button'; zu.setAttribute('aria-label', 'Bauplan schliessen');
  zu.addEventListener('click', schliesse);
  zeile.append(titel, zu);
  oben.append(zeile, el('p', 'bp-info', ''));
  blatt.append(oben);

  const abschnitt = (t, s) => { const a = el('section', 'bp-abschnitt'); a.append(el('h2', '', t)); if (s) a.append(el('p', 'bp-sub', s)); blatt.append(a); return a; };
  // Hände
  const h = abschnitt('Hände', 'was du spielst');
  const hr = el('div', 'bp-teile bp-haende');
  for (const [id, t] of Object.entries(HAENDE)) hr.append(karte(id, t));
  h.append(hr);
  // die Kette, Station für Station; Module ohne Eintrag kommen trotzdem
  const k = abschnitt('Kette', 'das Bild fliesst von oben nach unten');
  const fluss = el('div', 'bp-fluss'); k.append(fluss);
  for (const st of [...STATIONEN, 'aufnahme']){
    const reihe = el('div', 'bp-station');
    const [t, s] = STATION[st] || [st, ''];
    const ort = el('div', 'bp-ort'); ort.append(el('b', '', t), el('small', '', s));
    const teile = el('div', 'bp-teile');
    for (const [id, d] of Object.entries(TEILE)) if (d.ort === st) teile.append(karte(id, d));
    for (const m of module) if (m.station === st && !TEILE[m.id]) teile.append(karte(m.id, { titel: m.titel, stand: 'labor', kurz: 'noch nicht im Bauplan beschrieben', an: [] }));
    if (!teile.children.length) teile.append(el('span', 'bp-leer', 'noch leer'));
    reihe.append(ort, teile); fluss.append(reihe);
  }
  // Maschinen
  const ma = abschnitt('Maschinen im Kern', 'treiben die Kette, viele Teile hängen daran');
  const mr = el('div', 'bp-teile');
  for (const [id, d] of Object.entries(TEILE)) if (d.ort === 'kern') mr.append(karte(id, d));
  ma.append(mr);
  // Fahrplan
  const fp = abschnitt('Fahrplan', 'Einzelheiten in FAHRPLAN.md');
  const ol = el('ol', 'bp-fahrplan');
  for (const [b, t, s] of FAHRPLAN){ const li = el('li'); li.append(el('b', '', b + ' · ' + t), el('span', '', s)); ol.append(li); }
  fp.append(ol);
  const leg = el('p', 'bp-sub bp-legende', 'Weisser Rand: in der Bedienung · blauer Rand: nur im Labor · gestrichelt: geplant. Griff: wo man es einstellt.');
  blatt.append(leg);

  document.body.querySelector('.app').append(blatt);
  // Tasten bleiben im Bauplan (sonst hielte die Leertaste das Bild an)
  blatt.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') schliesse(); });
  zeigeAuswahl();
}

export function oeffne(){
  if (!blatt) baue();
  blatt.hidden = false; nachfuehren();
  clearInterval(timer); timer = setInterval(nachfuehren, 400);
  blatt.querySelector('.close').focus({ preventScroll: true });
}
export function schliesse(){ if (!blatt) return; blatt.hidden = true; clearInterval(timer); }
export const istOffen = () => !!blatt && !blatt.hidden;
