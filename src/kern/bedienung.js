// Bedienung: Wischen übers Bild (Kurbel und Zoom), Halten, Blendenfader, Greifer-Pad, Blätter, Einstellungen, Tastatur, MIDI.
import { ctx, intern, einst, $ } from './zustand.js?v=1.2.6';
import { clamp01, comma, fmtFps, REF_ANGLE, TRANSPORT, transportOverlap } from './mechanik.js?v=1.2.6';
import { VERSION } from './version.js?v=1.2.6';
import { wert, setze, istAn, schalte, hinweise, setSize, modul, haltenUebernommen } from './kette.js?v=1.2.6';
import { padStoss, koppeln } from './anstoss.js?v=1.2.6';
import { fpsOf, zoomOf } from './kurbel.js?v=1.2.6';
import { persist } from './speicher.js?v=1.2.6';
import { startCam, setMode, renderSrc, vergissGroesse } from './quelle.js?v=1.2.6';
import { setAvDelay } from './ton.js?v=1.2.6';
import { onRec, renderControls } from './aufnahme.js?v=1.2.6';
import { zugOf, GREIFER } from '../module/greifer.js?v=1.2.6';

let toastTimer = 0;
export function say(text, warn){
  const t = $('#toast'); t.textContent = text; t.classList.toggle('warn', !!warn); t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), warn ? 6000 : 3400);
}
ctx.sag = say;

/* ---------- welcome ---------- */
let hintTimer = 0;
export function hideHint(){ clearTimeout(hintTimer); $('#hint').classList.add('gone'); }
export function hideCard(){ $('#startcard').hidden = true; }

/* ---------- the pad on the picture: crank and zoom ---------- */
let lastLabel = '';
export function vergissLabel(){ lastLabel = ''; }
export function renderPad(){
  const xC = ctx.kurbel.x, yC = ctx.kurbel.y;
  const px = xC * 100, py = (1 - yC) * 100;
  $('#puck').style.left = px + '%'; $('#puck').style.top = py + '%';
  $('#xline').style.left = px + '%'; $('#yline').style.top = py + '%';
  const pl = $('#plabel');
  pl.style.left = px + '%'; pl.style.top = py + '%';
  pl.classList.toggle('flip', xC > 0.5); pl.classList.toggle('below', yC > 0.82);
  const f = fpsOf(xC), z = 'Zoom ' + comma(zoomOf(yC).toFixed(1)) + '×';
  const r = ctx.ausgabeFps / f, tempo = f >= ctx.ausgabeFps - 0.3 ? 'echtes Tempo' : (r < 10 ? comma(r.toFixed(1)) : String(Math.round(r))) + '× schneller';
  // zwei Finger mit stehendem Film: der Film wird mehrfach belichtet; drei Finger: Standbild
  const accum = ctx.halten && !ctx.standbild && haltenUebernommen();
  const top = ctx.halten ? (accum ? 'accum.' : 'hält') : fmtFps(f) + ' fps';
  const schild = accum ? 'ACCUM.' : 'HÄLT';
  if ($('#frozen').textContent !== schild) $('#frozen').textContent = schild;
  const h = hinweise(), zz = h.length ? z + ' · ' + h.join(' · ') : z;
  const sub = ctx.zeitModus === 'under' && !ctx.halten ? tempo + ' · ' + zz : zz;
  const lbl = top + '|' + sub;
  if (lbl !== lastLabel){
    pl.textContent = top + '\n';
    const sm = document.createElement('small'); sm.textContent = sub; pl.appendChild(sm);
    lastLabel = lbl;
  }
  renderGrip();
}

/* ---------- readouts next to the faders ---------- */
function showRead(id, text){ const r = $(id); r.textContent = text; r.classList.add('show'); }
function hideRead(id){ $(id).classList.remove('show'); }

/* ---------- shutter fader: open .. closed ---------- */
const expo = () => (wert('blende', 'winkel') ?? REF_ANGLE) / 360;
export function renderExpo(){
  const e = expo(), a = Math.round(e * 360), vf = $('#vfader');
  $('#vfill').style.height = (e * 100) + '%';
  $('#vknob').style.top = ((1 - e) * 100) + '%';
  $('#vlimit').style.top = ((1 - (360 - TRANSPORT) / 360) * 100) + '%';
  vf.classList.toggle('closed', e < 0.01);
  vf.setAttribute('aria-valuenow', String(a));
  vf.setAttribute('aria-valuetext', a === 0 ? 'zu' : a + ' Grad');
}
function vReadText(){
  const a = Math.round(expo() * 360);
  const schlieren = istAn('greifer') && transportOverlap(expo() * 360, 0) > 0;
  return (a === 0 ? 'zu' : a + '°') + (schlieren ? ' · Schlieren' : '');
}

/* ---------- Greifer pad: tap = a knock, hold = the film slips ---------- */
let lastGrip = '';
export function renderGrip(){
  const e = ctx.eingabe, y = e.greiferHaelt ? e.greiferY : 0.6, x = e.greiferHaelt ? e.greiferX : 0.5;
  const gekoppelt = wert('anstossen', 'gekoppelt') !== false;
  const key = x.toFixed(3) + '|' + y.toFixed(3) + '|' + gekoppelt;
  if (key === lastGrip) return;
  lastGrip = key;
  $('#btnRuck').setAttribute('aria-pressed', String(gekoppelt));
  $('#gknob').style.left = (x * 100) + '%';
  $('#gknob').style.top = ((1 - y) * 100) + '%';
  $('#gZline').style.top = ((1 - 0.6) * 100) + '%';
  $('#gpad').classList.toggle('off', e.greiferHaelt && zugOf(y) !== 1);
}
function gReadText(){
  const Z = zugOf(ctx.eingabe.greiferY);
  return Z === 1 ? 'Zug 1' : Z < 0.02 ? 'Film steht' : 'Zug ' + comma(Z.toFixed(2));
}

/* ---------- sheets ---------- */
export function openSheet(id){
  closeSheets();
  $(id).classList.add('show'); $(id).setAttribute('aria-hidden', 'false'); $('#backdrop').classList.add('show');
  const f = $(id).querySelector('.close'); if (f) f.focus({ preventScroll: true });
}
export function closeSheets(){
  document.querySelectorAll('.sheet.show').forEach(s => { s.classList.remove('show'); s.setAttribute('aria-hidden', 'true'); });
  $('#backdrop').classList.remove('show');
}
function seg(id, value, onPick){
  const g = $(id);
  const mark = v => g.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === String(v))));
  mark(value);
  g.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (ctx.aufnahme !== 'idle'){ say('Das geht erst, wenn der Film fertig ist.'); return; }
    mark(b.dataset.v); onPick(b.dataset.v); persist();
  });
  return mark;
}
export function renderTimeNote(){
  $('#timeNote').textContent = ctx.zeitModus === 'under'
    ? 'Wie bei der Bolex: Jedes belichtete Bild wird genau einmal vorgeführt. Langsam gedreht, läuft die Zeit im Film schneller ab. Die Kamera läuft, solange du den Auslöser hältst, kurz tippen gibt einen Stoss von vier Bildern. Der Ton läuft wie ein separates Tonband in Echtzeit mit und kommt als eigene Spur dazu.'
    : 'Die Zeit läuft echt weiter. Jedes Bild steht nach, bis das nächste kommt. Ton und Bild bleiben synchron.';
}
// Menüregler zeigen die Werte der Module (Handkurbel, Bildstand)
export function renderMenuWerte(){
  const j = Math.round((wert('handkurbel', 'unruhe') ?? 0.75) * 100), w = Math.round((wert('bildstand', 'staerke') ?? 0.35) * 100);
  $('#jitter').value = j; $('#jitterVal').textContent = String(j);
  $('#weave').value = w; $('#weaveVal').textContent = String(w);
  $('#swivel').checked = istAn('schwenken');
  $('#avDelay').value = einst.avDelayMs; $('#delayVal').textContent = einst.avDelayMs + ' ms';
}
export const markiere = {};

export function initBedienung(){
  $('#version').textContent = VERSION;
  hintTimer = setTimeout(hideHint, 6000);

  /* XY pad on the picture, relative; two fingers hold the picture */
  const stage = $('#stage'), pointers = new Map();
  let primaryId = null, dragFrom = null, keyHold = false, keyStand = false;
  // zwei Finger halten (mit Stehendem Film: der Film steht, die Kurbel dreht weiter), drei Finger: Standbild
  function updateFrozen(){
    const f = pointers.size >= 2 || keyHold || keyStand;
    const stand = pointers.size >= 3 || keyStand;
    ctx.eingabe.finger = pointers.size;
    // „hält“ friert genau das Bild ein, das gerade zu sehen ist (mit allem, was sich darin gesammelt hat)
    if (stand && !ctx.standbild){
      const c = intern.stand || document.createElement('canvas'), o = $('#out');
      c.width = o.width; c.height = o.height; c.getContext('2d').drawImage(o, 0, 0); intern.stand = c;
    }
    if (!stand) intern.stand = null;
    ctx.standbild = stand;
    if (f !== ctx.halten){ ctx.halten = f; $('#frozen').hidden = !f; if (!f) intern.nextAt = 0; }
  }
  stage.addEventListener('pointerdown', e => {
    pointers.set(e.pointerId, true);
    try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    if (pointers.size === 1){
      primaryId = e.pointerId; dragFrom = { x: e.clientX, y: e.clientY, vx: ctx.kurbel.zielX, vy: ctx.kurbel.zielY };
      stage.classList.add('playing'); hideHint(); hideCard();
    }
    updateFrozen();
  });
  stage.addEventListener('pointermove', e => {
    if (e.pointerId !== primaryId || !dragFrom) return;
    const r = stage.getBoundingClientRect(), k = ctx.kurbel;
    k.zielX = clamp01(dragFrom.vx + (e.clientX - dragFrom.x) / (r.width * 0.55));
    k.zielY = clamp01(dragFrom.vy - (e.clientY - dragFrom.y) / (r.height * 0.5));
    if (k.zielX === 0 || k.zielX === 1){ dragFrom.x = e.clientX; dragFrom.vx = k.zielX; }
    if (k.zielY === 0 || k.zielY === 1){ dragFrom.y = e.clientY; dragFrom.vy = k.zielY; }
  });
  const lift = e => {
    pointers.delete(e.pointerId);
    if (e.pointerId === primaryId){ primaryId = null; dragFrom = null; }
    if (!pointers.size){ stage.classList.remove('playing'); persist(); }
    updateFrozen();
  };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => stage.addEventListener(ev, lift));

  /* shutter fader: up and down only */
  const vf = $('#vfader');
  let vReadTimer = 0, vfFrom = null;
  vf.addEventListener('pointerdown', e => { e.preventDefault(); try { vf.setPointerCapture(e.pointerId); } catch (_) {} vfFrom = { y: e.clientY, v: expo() }; hideHint(); showRead('#vRead', vReadText()); });
  vf.addEventListener('pointermove', e => {
    if (!vfFrom) return;
    setze('blende', 'winkel', clamp01(vfFrom.v - (e.clientY - vfFrom.y) / 200) * 360);
    renderExpo(); showRead('#vRead', vReadText());
  });
  ['pointerup', 'pointercancel'].forEach(ev => vf.addEventListener(ev, () => { if (vfFrom){ vfFrom = null; persist(); clearTimeout(vReadTimer); vReadTimer = setTimeout(() => hideRead('#vRead'), 900); } }));
  vf.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') setze('blende', 'winkel', clamp01(expo() + 0.03) * 360);
    else if (e.key === 'ArrowDown') setze('blende', 'winkel', clamp01(expo() - 0.03) * 360);
    else return;
    e.preventDefault(); e.stopPropagation(); renderExpo(); persist();
  });

  /* Greifer pad: tap = a knock (direction and strength from the middle line to the finger), hold = the film slips
     (where the finger lies: above the line gaps, below it the frame line rolls, at the bottom the film stands), let go = the detent takes it */
  const gp = $('#gpad');
  let gReadTimer = 0, gFrom = null, gTimer = 0;
  const padLage = ev => { const r = gp.getBoundingClientRect(); return { x: clamp01((ev.clientX - r.left) / r.width), y: clamp01(1 - (ev.clientY - r.top) / r.height) }; };
  function lesen(text){ showRead('#gRead', text); clearTimeout(gReadTimer); gReadTimer = setTimeout(() => hideRead('#gRead'), 900); }
  function halten(){
    if (!gFrom || gFrom.haelt) return;
    gFrom.haelt = true; clearTimeout(gTimer);
    ctx.eingabe.greiferHaelt = true; ctx.eingabe.greiferX = gFrom.x; ctx.eingabe.greiferY = gFrom.y;
    renderGrip(); showRead('#gRead', gReadText()); clearTimeout(gReadTimer);
  }
  // Stoss: vom Mittelpunkt (Mittellinie bei 0,6) zum Finger, an den Rändern Stärke 1
  function stossVon(x, y){ padStoss((x - 0.5) * 2, y >= 0.6 ? (y - 0.6) / 0.4 : (y - 0.6) / 0.6); lesen('Stoss'); }
  gp.addEventListener('pointerdown', e => {
    e.preventDefault(); try { gp.setPointerCapture(e.pointerId); } catch (_) {}
    const l = padLage(e);
    gFrom = { cx: e.clientX, cy: e.clientY, x: l.x, y: l.y, haelt: false };
    ctx.eingabe.padFinger = true; hideHint();
    gTimer = setTimeout(halten, GREIFER.schwelle);
  });
  gp.addEventListener('pointermove', e => {
    if (!gFrom) return;
    const l = padLage(e);
    gFrom.x = l.x; gFrom.y = l.y;
    if (!gFrom.haelt && Math.abs(e.clientX - gFrom.cx) + Math.abs(e.clientY - gFrom.cy) > 10) halten();   // wer zieht, hält
    if (!gFrom.haelt) return;
    ctx.eingabe.greiferX = l.x; ctx.eingabe.greiferY = l.y;
    renderGrip(); showRead('#gRead', gReadText());
  });
  ['pointerup', 'pointercancel'].forEach(ev => gp.addEventListener(ev, e => {
    if (!gFrom) return;
    clearTimeout(gTimer);
    if (gFrom.haelt){ ctx.eingabe.greiferHaelt = false; lesen('rastet ein'); }
    else if (ev === 'pointerup') stossVon(gFrom.x, gFrom.y);
    gFrom = null; ctx.eingabe.padFinger = false; renderGrip();
  }));
  gp.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') stossVon(0.5, 0.8);
    else if (e.key === 'ArrowDown') stossVon(0.5, 0.3);
    else return;
    e.preventDefault(); e.stopPropagation();
  });
  // Knopf über dem Greifer: Gyroskop koppeln oder entkoppeln (nur der Ruck, Schwenken hat seinen Schalter im Menü)
  $('#btnRuck').addEventListener('click', () => {
    const an = wert('anstossen', 'gekoppelt') === false;
    koppeln(an); renderGrip(); persist();
    lesen(an ? 'Gyroskop gekoppelt' : 'Gyroskop entkoppelt');
  });

  /* sheets */
  $('#btnSettings').addEventListener('click', () => openSheet('#settings'));
  $('#btnFilms').addEventListener('click', () => openSheet('#filmsSheet'));
  $('#backdrop').addEventListener('click', closeSheets);
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeSheets));

  /* settings wiring */
  $('#btnCam').addEventListener('click', () => { closeSheets(); startCam(false); });
  $('#btnDemo').addEventListener('click', () => { setMode('demo'); closeSheets(); });
  $('#mirrorView').addEventListener('change', e => { einst.mirrorView[ctx.facing] = e.target.checked; renderSrc(); persist(); });
  $('#mirrorRec').addEventListener('change', e => { einst.mirrorRec = e.target.checked; renderSrc(); persist(); });
  $('#jitter').addEventListener('input', e => { setze('handkurbel', 'unruhe', +e.target.value / 100); $('#jitterVal').textContent = e.target.value; });
  $('#jitter').addEventListener('change', persist);
  $('#weave').addEventListener('input', e => { setze('bildstand', 'staerke', +e.target.value / 100); $('#weaveVal').textContent = e.target.value; });
  $('#weave').addEventListener('change', persist);
  $('#swivel').addEventListener('change', e => { schalte('schwenken', e.target.checked); persist(); });
  $('#ton').addEventListener('change', persist);
  $('#avDelay').addEventListener('input', e => { setAvDelay(+e.target.value); $('#delayVal').textContent = einst.avDelayMs + ' ms'; });
  $('#avDelay').addEventListener('change', persist);
  markiere.time = seg('#segTime', ctx.zeitModus, v => { ctx.zeitModus = v === 'under' ? 'under' : 'hold'; renderTimeNote(); renderControls(); lastLabel = ''; });
  markiere.fps = seg('#segFps', ctx.ausgabeFps, v => { ctx.ausgabeFps = +v; lastLabel = ''; });
  markiere.res = seg('#segRes', einst.resCap, v => {
    einst.resCap = +v;
    if (ctx.quelle === 'demo') setSize(1280, 720); else vergissGroesse();
    if (ctx.quelle === 'cam') startCam(true);
  });
  $('#cardCam').addEventListener('click', () => startCam(false));
  $('#cardDemo').addEventListener('click', () => { hideCard(); });

  /* keyboard */
  document.addEventListener('keydown', e => {
    const tag = e.target && e.target.tagName, k = ctx.kurbel;
    if (e.metaKey || e.ctrlKey || e.altKey || (tag === 'INPUT' && e.target.type === 'range')) return;
    if (e.key === 'Escape'){ closeSheets(); return; }
    if (document.querySelector('.sheet.show')) return;
    if (e.key === 'r' || e.key === 'R'){ e.preventDefault(); onRec(); }
    else if (e.code === 'Space' && !e.repeat && tag !== 'BUTTON'){ e.preventDefault(); keyHold = true; updateFrozen(); }
    else if ((e.key === 'h' || e.key === 'H') && !e.repeat){ e.preventDefault(); keyStand = true; updateFrozen(); }
    else if (e.target === vf || e.target === gp) return;
    else if (e.key === 'ArrowLeft'){ k.zielX = clamp01(k.zielX - 0.04); hideHint(); }
    else if (e.key === 'ArrowRight'){ k.zielX = clamp01(k.zielX + 0.04); hideHint(); }
    else if (e.key === 'ArrowUp'){ k.zielY = clamp01(k.zielY + 0.05); hideHint(); e.preventDefault(); }
    else if (e.key === 'ArrowDown'){ k.zielY = clamp01(k.zielY - 0.05); hideHint(); e.preventDefault(); }
  });
  document.addEventListener('keyup', e => {
    if (e.code === 'Space'){ keyHold = false; updateFrozen(); }
    if (e.key === 'h' || e.key === 'H'){ keyStand = false; updateFrozen(); }
  });

  /* MIDI: a knob is the crank */
  let learnCC = null, midiAccess = null;
  function onMidi(m){
    const d = m.data; if (!d || d.length < 3 || (d[0] & 0xf0) !== 0xb0) return;
    if (learnCC === null){ learnCC = d[1]; $('#midiStatus').textContent = 'CC ' + learnCC + ' ist die Kurbel'; }
    if (d[1] === learnCC){ ctx.kurbel.zielX = d[2] / 127; hideHint(); }
  }
  function hookMidi(){
    let n = 0; midiAccess.inputs.forEach(i => { i.onmidimessage = onMidi; n++; });
    if (learnCC === null) $('#midiStatus').textContent = n ? 'Dreh jetzt den Knopf, der die Kurbel sein soll' : 'Kein MIDI-Gerät gefunden';
  }
  $('#btnMidi').addEventListener('click', async () => {
    learnCC = null;
    if (!navigator.requestMIDIAccess){ $('#midiStatus').textContent = 'MIDI gibt es hier nicht, Chrome kann es'; return; }
    try { if (!midiAccess){ midiAccess = await navigator.requestMIDIAccess(); midiAccess.onstatechange = hookMidi; } hookMidi(); }
    catch (e) { $('#midiStatus').textContent = 'MIDI ist hier gesperrt'; }
  });
}
