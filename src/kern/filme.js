// Die Filme: Bibliothek im Browser (IndexedDB `kurbel`, Store `films`) und Sichern aufs iPhone.
import { intern, $ } from './zustand.js?v=1.2.6';
import { mmss } from './mechanik.js?v=1.2.6';
import { idbReq } from './speicher.js?v=1.2.6';
import { say } from './bedienung.js?v=1.2.6';

export let films = [], filmN = 0;
const dlPromise = intern.inViewer ? window.claude.use('downloads') : Promise.resolve(undefined);
dlPromise.catch(() => {});

/* ---------- saving: share sheet on the iPhone, download elsewhere ---------- */
export async function saveFile(blob, name, type){
  const file = new File([blob], name, { type: type || blob.type || 'application/octet-stream' });
  if (!intern.inViewer && navigator.canShare && navigator.canShare({ files: [file] })){
    try { await navigator.share({ files: [file] }); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  let api; try { api = await dlPromise; } catch (e) { api = null; }
  if (api){
    try { await api.save({ filename: name, data: blob }); say('Gesichert: ' + name); }
    catch (e) { if (e && e.code === 'declined') return; say('Sichern hat nicht geklappt (' + ((e && e.code) || 'Fehler') + ').', true); }
    return;
  }
  if (api === null){ say('Sichern geht in dieser Ansicht nicht. Öffne die Datei direkt im Browser.', true); return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); say('Gesichert: ' + name);
}

/* ---------- library ---------- */
export const dbPut = rec => idbReq('films', true, s => s.put(rec));
const dbDel = id => idbReq('films', true, s => s.delete(id));
const dbAll = () => idbReq('films', false, s => s.getAll());
export function addFilm(film){
  filmN++; films.push(film);
  const el = document.createElement('div'); el.className = 'film';
  el.innerHTML = '<video controls playsinline preload="metadata"></video><div class="meta"><div class="info"></div>' +
    (/webm/.test(film.type || '') ? '<p class="note">WebM öffnet Final Cut nicht direkt. In Safari wird es MP4.</p>' : '') +
    '<div class="acts"><button class="pill primary" type="button" data-a="save">Sichern</button>' + (film.audio ? '<button class="pill" type="button" data-a="ton">Tonspur</button>' : '') + '<button class="pill" type="button" data-a="drop">Löschen</button></div></div>';
  const url = URL.createObjectURL(film.blob);
  el.querySelector('video').src = url;
  if (film.thumb) el.querySelector('video').poster = film.thumb;
  const d = new Date(film.created);
  el.querySelector('.info').textContent = d.toLocaleDateString('de-CH') + ' ' + d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }) + ' · ' + mmss(film.dur || 0) + (film.audio ? ' · Ton separat' : '');
  el.querySelector('[data-a="save"]').addEventListener('click', () => saveFile(film.blob, film.name, film.type));
  const tb = el.querySelector('[data-a="ton"]'); if (tb) tb.addEventListener('click', () => saveFile(film.audio, film.audioName, film.audio.type));
  el.querySelector('[data-a="drop"]').addEventListener('click', () => {
    films = films.filter(f => f !== film); URL.revokeObjectURL(url); el.remove(); dbDel(film.id).catch(() => {}); renderFilmCount();
  });
  $('#films').prepend(el);
  renderFilmCount();
}
// two taps: the first arms the button, the second empties the library (IndexedDB store "films")
let dropArmed = 0;
function disarmDrop(){ clearTimeout(dropArmed); dropArmed = 0; const b = $('#btnDropAll'); b.classList.remove('armed'); b.textContent = 'Alle löschen'; }
export function renderFilmCount(){
  const c = $('#filmCount'); c.hidden = !films.length; c.textContent = String(films.length);
  $('#noFilms').hidden = films.length > 0;
  $('#filmsFoot').hidden = !films.length;
}
export function ladeFilme(){
  dbAll().then(list => { (list || []).sort((a, b) => a.created - b.created).forEach(f => { if (f && f.blob) addFilm(f); }); }).catch(() => {});
}

export function initFilme(){
  $('#btnDropAll').addEventListener('click', async () => {
    const b = $('#btnDropAll');
    if (!dropArmed){ b.classList.add('armed'); b.textContent = 'Wirklich alle ' + films.length + ' löschen?'; dropArmed = setTimeout(disarmDrop, 3500); return; }
    disarmDrop();
    try { await idbReq('films', true, st => st.clear()); } catch (e) { say('Löschen hat nicht geklappt.', true); return; }
    films.forEach(f => { if (f.url) URL.revokeObjectURL(f.url); });
    films = []; $('#films').querySelectorAll('video').forEach(v => { URL.revokeObjectURL(v.src); v.removeAttribute('src'); });
    $('#films').innerHTML = ''; renderFilmCount(); say('Alle Filme gelöscht.');
  });
}
