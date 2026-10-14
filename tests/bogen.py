"""Kontaktbogen: ein Modul mit mehreren Werten durchschalten, Standbilder und kurze Clips als HTML-Seite.

    .venv/bin/python tests/bogen.py --modul blende --param winkel --werte 30,135,240,360 --alt

--quelle demo (Standard) oder ein Video (wird mit ffmpeg zu .y4m und als falsche Kamera eingespielt)
--alt      dieselben Werte mit der alten mekas.html daneben (vorher/nachher), nur für Werte, die sie kannte
--referenz ein Referenzbild, das neben jeder Zeile steht
--aktion   stoss (Wert = Stärke, nach oben) oder halten (Wert = Höhe auf dem Greifer-Pad, --dauer s lang, dann loslassen)
           oder accum (Bild halten wie mit zwei Fingern; ein Standbild vorher, dann zu den --zeiten in s, nach dem
           Loslassen zu den --los in s) oder film (das Video aus --quelle wird als Datei geladen und läuft wie im Projektor,
           solange aufgenommen wird, vom Anfang an; Standbilder zu den --zeiten in s Videozeit, --stoss-bei s gibt dort einen
           Stoss wie vom Pad; das geprüfte Modul wird beim Start frisch eingeschaltet, sein Gedächtnis ist leer).
           Der Clip läuft während der Aktion, Standbilder im Abstand --abstand ms.
--setze    weitere Werte vorher, z. B. --setze blende.winkel=300 (mehrfach möglich)
--aus      diese Module ausschalten (durch Komma getrennt), z. B. --aus muederentwickler
--fps      Kurbel auf dieses Tempo stellen (4–24)
--ohne     dazu eine Reihe mit ausgeschaltetem Modul, zum Vergleich
--vergleich modul.param=wert: dazu eine Reihe mit diesem Wert, z. B. --vergleich sammeln.neu=false (altes Sammeln)
--notiz    ein Satz für den Kopf der Seite (z. B. was im Video wann passiert)
Jede Reihe zeigt die mittlere Helligkeit ihrer Standbilder (Ø, 0–255).

    .venv/bin/python tests/bogen.py --modul muederentwickler --aktion film --quelle tests/out/schwenk.mp4 --param kurve --werte 1,2,3,4 \
        --zeiten 0.5,1,3,5,7,10,14 --stoss-bei 8 --fps 12 --setze blende.winkel=180 --ohne

    .venv/bin/python tests/bogen.py --modul greifer --aktion stoss --werte 0.3,0.6,1 --setze blende.winkel=300 --bilder 8 --abstand 120
Ausgabe nach tests/out/bogen-<modul>-<zeit>/index.html (nicht im Repository).
"""
import argparse
import base64
import datetime
import html
import json
import pathlib
import shutil
import subprocess

from playwright.sync_api import sync_playwright

from hilfe import OUT, ROOT, SAAT, VERSION, Server, starte_chrome

ALT = 'docs/archiv/mekas-2026-10-05.html'
# wie die alte Datei denselben Wert in localStorage `kurbel.v3` hielt
ALT_FELD = {
    ('blende', 'winkel'): ('expo', lambda w: w / 360),
    ('bildstand', 'staerke'): ('weave', lambda w: round(w * 100)),
    ('handkurbel', 'unruhe'): ('jitter', lambda w: w),
    ('entwickeln', 'anlaufblitz'): ('startFlash', lambda w: bool(w)),
}

CLIP_START = """() => {
  const c = document.querySelector('#out'), r = new MediaRecorder(c.captureStream(30), { mimeType: 'video/webm' }), teile = [];
  r.ondataavailable = e => e.data.size && teile.push(e.data); r.start(); window.__clip = { r, teile };
}"""
CLIP_STOP = """async () => {
  const { r, teile } = window.__clip;
  await new Promise(res => { r.onstop = res; r.stop(); });
  const b = new Blob(teile, { type: 'video/webm' });
  return await new Promise(res => { const f = new FileReader(); f.onload = () => res(f.result.split(',')[1]); f.readAsDataURL(b); });
}"""

CLIP_JS = """async (sek) => {
  const c = document.querySelector('#out'), s = c.captureStream(30);
  const r = new MediaRecorder(s, { mimeType: 'video/webm' }), teile = [];
  r.ondataavailable = e => e.data.size && teile.push(e.data);
  r.start(); await new Promise(res => setTimeout(res, sek * 1000));
  await new Promise(res => { r.onstop = res; r.stop(); });
  const b = new Blob(teile, { type: 'video/webm' });
  return await new Promise(res => { const f = new FileReader(); f.onload = () => res(f.result.split(',')[1]); f.readAsDataURL(b); });
}"""


def kamera_y4m(video):
    """Video als falsche Kamera: Chrome braucht .y4m."""
    ziel = OUT / ('quelle-' + pathlib.Path(video).stem + '.y4m')
    if not ziel.exists():
        OUT.mkdir(parents=True, exist_ok=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(video), '-vf', 'scale=1280:-2', '-pix_fmt', 'yuv420p', str(ziel)], check=True)
    return ziel


def mp4(ordner, name, daten):
    webm = ordner / f'{name}.webm'
    webm.write_bytes(base64.b64decode(daten))
    mp4 = ordner / f'{name}.mp4'
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(webm), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '24', '-an', str(mp4)])
    if r.returncode == 0:
        webm.unlink()
        return mp4.name
    return webm.name


HELLIGKEIT = {}      # Standbild → mittlere Helligkeit (0–255)
BESCHRIFTUNG = {}    # Standbild → kurzer Text darunter (Zeit)
# merkt sich jedes Video, das abgespielt wird (das geladene Video hängt nicht im Dokument)
VIDEO_HAKEN = """(() => { const p = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function(){ (window.__videos = window.__videos || new Set()).add(this); return p.apply(this, arguments); }; })();"""
VIDEO_ZEIT = "(() => { const v = [...(window.__videos || [])].find(v => (v.src || '').startsWith('blob:')); return v ? v.currentTime : -1; })()"
STANDBILD_JS = """() => {
  const o = document.querySelector('#out'), c = document.createElement('canvas'); c.width = 160; c.height = 90;
  const g = c.getContext('2d'); g.drawImage(o, 0, 0, 160, 90);
  const d = g.getImageData(0, 0, 160, 90).data; let s = 0;
  for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  return [o.toDataURL('image/png'), s / (d.length / 4)];
}"""


def standbild(page, ordner, name, text=None):
    url, hell = page.evaluate(STANDBILD_JS)
    datei = ordner / f'{name}.png'
    datei.write_bytes(base64.b64decode(url.split(',')[1]))
    HELLIGKEIT[datei.name] = hell
    if text:
        BESCHRIFTUNG[datei.name] = text
    return datei.name


def sek(z):
    return f'{z:.1f}'.replace('.', ',').replace(',0', '') + ' s'


def aufnehmen(page, ordner, name, bilder, clip_sek, abstand=500):
    """Standbilder (im Abstand `abstand` ms) und ein Clip vom Ausgabebild."""
    standbilder = []
    for i in range(bilder):
        standbilder.append(standbild(page, ordner, f'{name}-{i + 1}'))
        page.wait_for_timeout(abstand)
    return standbilder, mp4(ordner, name, page.evaluate(CLIP_JS, clip_sek))


def zahl(w):
    """Zahl, wenn es eine ist, true/false als Schalter, sonst der Name (Raststellen wie Sandwich, Lith).
    (Bis 2026-10-14 kam „false“ als Text an, und das Labor machte daraus „an“.)"""
    if w in ('true', 'false'):
        return w == 'true'
    try:
        return float(w) if '.' in w else int(w)
    except ValueError:
        return w


def accum(page, ordner, name, a):
    """Halten wie mit zwei Fingern: ein Standbild vorher, dann zu festen Zeiten, dann loslassen und das Verklingen sehen."""
    page.evaluate(CLIP_START)
    page.wait_for_timeout(400)
    standbilder = [standbild(page, ordner, f'{name}-vor', 'vorher')]
    page.evaluate('window.mekas.halteBild(true)')
    start = page.evaluate('performance.now()')
    for z in [float(x) for x in a.zeiten.split(',')]:
        rest = start + z * 1000 - page.evaluate('performance.now()')
        if rest > 0:
            page.wait_for_timeout(rest)
        standbilder.append(standbild(page, ordner, f'{name}-{z:g}s', 'accum. ' + sek(z)))
    page.evaluate('window.mekas.halteBild(false)')
    los = page.evaluate('performance.now()')
    for z in [float(x) for x in a.los.split(',')]:
        rest = los + z * 1000 - page.evaluate('performance.now()')
        if rest > 0:
            page.wait_for_timeout(rest)
        standbilder.append(standbild(page, ordner, f'{name}-los{z:g}s', 'los + ' + sek(z)))
    return standbilder, mp4(ordner, name, page.evaluate(CLIP_STOP))


def film(page, ordner, name, a, an):
    """Das geladene Video läuft vom Anfang (es läuft nur, solange aufgenommen wird). Standbilder zu Videozeiten, dazu ein Stoss."""
    page.wait_for_function(f'{VIDEO_ZEIT} >= 0')
    if an:
        page.evaluate(f"window.mekas.schalte({json.dumps(a.modul)}, false)")
    page.click('#btnRec')
    if an:
        page.evaluate(f"window.mekas.schalte({json.dumps(a.modul)}, true)")     # frisch eingelegt: das Gedächtnis ist leer
    page.wait_for_function("document.querySelector('#recLabel').textContent === 'Pause'", timeout=10000)
    page.evaluate(CLIP_START)
    ereignisse = [(float(z), 'bild') for z in a.zeiten.split(',')]
    if a.stoss_bei is not None:
        ereignisse.append((a.stoss_bei, 'stoss'))
    standbilder = []
    for z, was in sorted(ereignisse):
        page.wait_for_function(f'{VIDEO_ZEIT} >= {z}', polling=5, timeout=60000)
        if was == 'stoss':
            page.evaluate(f'window.mekas.stoss(0, {a.stoss_staerke})')
            continue
        t = page.evaluate(VIDEO_ZEIT)
        standbilder.append(standbild(page, ordner, f'{name}-t{z:g}s', sek(z) + (' (Stoss ' + sek(a.stoss_bei) + ')' if a.stoss_bei is not None and abs(z - a.stoss_bei) < 1e-6 else '')))
        if abs(t - z) > 0.12:
            print(f'    Achtung: Standbild {z} s erst bei {t:.2f} s')
    return standbilder, mp4(ordner, name, page.evaluate(CLIP_STOP))


def mit_aktion(page, ordner, name, a, wert):
    """Clip läuft, dann Stoss oder Halten; Standbilder in kurzen Abständen ab der Aktion."""
    page.evaluate(CLIP_START)
    page.wait_for_timeout(400)
    if a.aktion == 'stoss':
        page.evaluate(f'window.mekas.stoss(0, {wert})')
    else:
        page.evaluate(f'window.mekas.halte({wert})')
    standbilder, start = [], page.evaluate('performance.now()')
    for i in range(a.bilder):
        if a.aktion == 'halten' and page.evaluate('performance.now()') - start > a.dauer * 1000 and page.evaluate('window.mekas.ctx.eingabe.greiferHaelt'):
            page.evaluate('window.mekas.lass()')
        standbilder.append(standbild(page, ordner, f'{name}-{i + 1}'))
        page.wait_for_timeout(a.abstand)
    if a.aktion == 'halten':
        page.evaluate('window.mekas.lass()')
    page.wait_for_timeout(1200)
    return standbilder, mp4(ordner, name, page.evaluate(CLIP_STOP))


def starte_quelle(page, kamera):
    page.click('#cardCam' if kamera else '#cardDemo')
    if not kamera:
        return
    # die falsche Kamera springt manchmal nicht an: warten, sonst ein zweites Mal starten
    for _ in range(3):
        try:
            page.wait_for_function("document.querySelector('#srcLabel').textContent !== 'DEMO'", timeout=4000)
            return
        except Exception:
            page.evaluate("document.querySelector('#btnSrc').click()")
    raise SystemExit('Die falsche Kamera startet nicht')


def lauf_neu(browser, url, a, wert, ordner, kamera, an=True, vergleich=None):
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    context.add_init_script(SAAT)
    if a.aktion == 'film':
        context.add_init_script(VIDEO_HAKEN)
    page = context.new_page()
    page.goto(url + '?labor')
    page.wait_for_function('window.mekas')
    page.evaluate('document.querySelector("#labor").classList.add("weg")')
    starte_quelle(page, kamera)
    page.evaluate(f"window.mekas.schalte({json.dumps(a.modul)}, {'true' if an else 'false'})")      # das geprüfte Modul ist an (bzw. für --ohne aus)
    for mid in filter(None, (a.aus or '').split(',')):
        page.evaluate(f"window.mekas.schalte({json.dumps(mid)}, false)")
    if a.fps:   # Kurbelstellung für dieses Tempo (Umkehrung der Skala: 4–12 fps auf 0–80 %)
        import math
        x = 0.8 * math.log(a.fps / 4) / math.log(3) if a.fps <= 12 else 0.8 + 0.2 * math.log(a.fps / 12) / math.log(24 / 12)
        page.evaluate(f"Object.assign(window.mekas.ctx.kurbel, {{ zielX: {x}, x: {x} }})")
    for s in a.setze + ([vergleich] if vergleich else []):
        ziel, w = s.split('=')
        mid, par = ziel.split('.')
        page.evaluate(f"window.mekas.setze({json.dumps(mid)}, {json.dumps(par)}, {json.dumps(zahl(w))})")
    if a.param:   # --param name (des Moduls) oder modul.name (eines anderen, z. B. blende.winkel bei der Überblendung)
        mid, par = a.param.split('.') if '.' in a.param else (a.modul, a.param)
        page.evaluate(f"window.mekas.setze({json.dumps(mid)}, {json.dumps(par)}, {json.dumps(wert)})")
    if a.aktion == 'film':     # das Video als Datei laden (wie „Video laden“), es steht auf dem ersten Bild
        page.set_input_files('#fileIn', str(ROOT / a.quelle if not pathlib.Path(a.quelle).is_absolute() else a.quelle))
        page.wait_for_function("document.querySelector('#srcLabel').textContent === 'VIDEO'")
    page.wait_for_timeout(a.warten * 1000)
    fps = page.evaluate('window.mekas.ctx.kurbel.fps')
    name = f'{"vgl" if vergleich else "neu" if an else "ohne"}-{wert}'
    if a.aktion == 'film':
        ergebnis = film(page, ordner, name, a, an)
    elif a.aktion == 'accum':
        ergebnis = accum(page, ordner, name, a)
    elif a.aktion:
        ergebnis = mit_aktion(page, ordner, name, a, wert)
    else:
        ergebnis = aufnehmen(page, ordner, name, a.bilder, a.clip, a.abstand)
    context.close()
    return ergebnis, fps


def lauf_alt(browser, url, a, wert, ordner, kamera):
    feld, umrechnen = ALT_FELD[(a.modul, a.param)]
    einst = {'v': 4, 'slits': 0, 'lastMode': 'demo', feld: umrechnen(wert)}   # Quelle startet über die Startkarte
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    context.add_init_script(SAAT)
    context.add_init_script(f"localStorage.setItem('kurbel.v3', {json.dumps(json.dumps(einst))})")
    page = context.new_page()
    page.goto(url + ALT)
    starte_quelle(page, kamera)
    page.wait_for_timeout(a.warten * 1000)
    ergebnis = aufnehmen(page, ordner, f'alt-{wert}', a.bilder, a.clip, a.abstand)
    context.close()
    return ergebnis


def seite(a, ordner, zeilen, referenz, fps):
    def zelle(standbilder, clip, label):
        bilder = ''.join(f'<figure><a href="{b}"><img src="{b}" loading="lazy"></a><figcaption>{html.escape(BESCHRIFTUNG.get(b, ""))}</figcaption></figure>' for b in standbilder)
        hell = [HELLIGKEIT[b] for b in standbilder if b in HELLIGKEIT]
        if hell:
            label += f'<br>Ø {sum(hell) / len(hell):.1f}'
        return f'<div class="reihe"><span class="was">{label}</span>{bilder}<video src="{clip}" controls loop muted playsinline></video></div>'
    teile = []
    for z in zeilen:
        t = f'<section><h2>{html.escape(z["label"])}</h2>'
        t += zelle(*z['neu'], f'jetzt {VERSION}')
        if z.get('ohne'):
            t += zelle(*z['ohne'], 'ohne Modul')
        if z.get('vergleich'):
            t += zelle(*z['vergleich'], 'mit ' + html.escape(a.vergleich))
        if z.get('alt'):
            t += zelle(*z['alt'], 'vorher')
        if referenz:
            t += f'<div class="reihe"><span class="was">Referenz</span><img src="{referenz}"></div>'
        teile.append(t + '</section>')
    quelle = 'Demo' if a.quelle == 'demo' else pathlib.Path(a.quelle).name
    jetzt = datetime.datetime.now().strftime('%d.%m.%Y %H:%M')
    return f"""<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kontaktbogen {html.escape(a.modul)}</title><style>
body{{margin:0;padding:16px;background:#0d0c10;color:#efecf3;font:15px/1.4 system-ui,sans-serif}}
h1{{font:700 1.3rem "Courier New",monospace;margin:0 0 4px}} p{{color:#9a96a8;margin:0 0 16px}}
section{{border-top:1px solid #2e2c37;padding:12px 0}} h2{{font:700 1.1rem "Courier New",monospace;margin:0 0 8px;color:#a9cbe8}}
.reihe{{display:flex;gap:6px;align-items:center;overflow-x:auto;margin-bottom:6px}}
.was{{flex:none;width:86px;font-size:.8rem;color:#9a96a8}}
img,video{{height:150px;border-radius:6px;background:#000;flex:none}}
figure{{margin:0;flex:none}} figcaption{{font-size:.75rem;color:#9a96a8;text-align:center}}
</style></head><body>
<h1>Kontaktbogen: {html.escape(a.modul)} · {html.escape(a.param or a.aktion)}</h1>
<p>Mekas {VERSION} · Quelle {html.escape(quelle)} · Kurbel {fps:.1f} fps · {'Standbilder zu den angeschriebenen Zeiten' if a.aktion in ('film', 'accum') else f'{a.bilder} Standbilder im Abstand von {a.abstand} ms'}{(' · ' + ', '.join(a.setze)) if a.setze else ''}{(' · aus: ' + a.aus) if a.aus else ''} · {jetzt}</p>
{f'<p>{html.escape(a.notiz)}</p>' if a.notiz else ''}
{''.join(teile)}
</body></html>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--modul', required=True)
    ap.add_argument('--param', default=None)
    ap.add_argument('--werte', required=True, help='durch Komma getrennt, z. B. 30,135,240,360 oder Sandwich,Lith')
    ap.add_argument('--einheit', default=None, help='für die Überschriften, z. B. °')
    ap.add_argument('--quelle', default='demo')
    ap.add_argument('--alt', action='store_true')
    ap.add_argument('--referenz', default=None)
    ap.add_argument('--bilder', type=int, default=4)
    ap.add_argument('--clip', type=float, default=3)
    ap.add_argument('--aktion', choices=['stoss', 'halten', 'accum', 'film'], default=None)
    ap.add_argument('--zeiten', default='2,5,15', help='accum: Standbilder nach so vielen Sekunden Halten; film: zu diesen Videozeiten')
    ap.add_argument('--los', default='0.3,1.5', help='accum: Standbilder so viele Sekunden nach dem Loslassen')
    ap.add_argument('--stoss-bei', type=float, default=None, help='film: ein Stoss zu dieser Videozeit (s)')
    ap.add_argument('--stoss-staerke', type=float, default=1, help='film: Stärke des Stosses wie vom Pad (-1..1, nach oben)')
    ap.add_argument('--notiz', default=None)
    ap.add_argument('--aus', default=None, help='diese Module ausschalten, durch Komma getrennt')
    ap.add_argument('--dauer', type=float, default=1.5, help='halten: Sekunden bis zum Loslassen')
    ap.add_argument('--abstand', type=int, default=500, help='ms zwischen den Standbildern')
    ap.add_argument('--fps', type=float, default=None)
    ap.add_argument('--ohne', action='store_true')
    ap.add_argument('--vergleich', default=None, help='modul.param=wert: eine zweite Reihe mit diesem Wert, z. B. sammeln.neu=false')
    ap.add_argument('--setze', action='append', default=[], help='modul.param=wert, vor dem Durchschalten')
    ap.add_argument('--warten', type=float, default=2.0, help='Sekunden nach dem Einstellen')
    a = ap.parse_args()
    if not a.param and not a.aktion:
        raise SystemExit('--param oder --aktion angeben')
    if a.aktion == 'film' and a.quelle == 'demo':
        raise SystemExit('--aktion film braucht ein Video als --quelle')
    werte = [zahl(w) for w in a.werte.split(',')]
    einheit = a.einheit if a.einheit is not None else ('°' if (a.param or '').endswith('winkel') else '')
    titel = a.param or {'stoss': 'Stoss', 'halten': 'Halten auf Höhe', 'accum': 'accum', 'film': 'Video'}.get(a.aktion, '')
    if a.alt and (a.modul, a.param) not in ALT_FELD:
        raise SystemExit(f'--alt geht nur für {sorted(ALT_FELD)}')

    ordner = OUT / f'bogen-{a.modul}-{"demo" if a.quelle == "demo" else pathlib.Path(a.quelle).stem}{f"-{a.fps:g}fps" if a.fps else ""}-{datetime.datetime.now():%Y%m%d-%H%M%S}'
    ordner.mkdir(parents=True)
    kamera = None if a.quelle == 'demo' or a.aktion == 'film' else kamera_y4m(ROOT / a.quelle if not pathlib.Path(a.quelle).is_absolute() else a.quelle)
    referenz = None
    if a.referenz:
        referenz = 'referenz' + pathlib.Path(a.referenz).suffix
        shutil.copy(a.referenz, ordner / referenz)

    zeilen, fps = [], 0
    with Server() as s, sync_playwright() as p:
        browser = starte_chrome(p, kamera)
        for w in werte:
            neu, fps = lauf_neu(browser, s.url, a, w, ordner, kamera)
            z = {'label': f'{titel} {w}{einheit}' if a.aktion and not a.param else f'{w}{einheit}', 'neu': neu}
            if a.ohne:
                z['ohne'] = lauf_neu(browser, s.url, a, w, ordner, kamera, an=False)[0]
            if a.vergleich:
                z['vergleich'] = lauf_neu(browser, s.url, a, w, ordner, kamera, vergleich=a.vergleich)[0]
            if a.alt:
                z['alt'] = lauf_alt(browser, s.url, a, w, ordner, kamera)
            zeilen.append(z)
            print(f'  {w}{einheit} fertig')
        browser.close()
    (ordner / 'index.html').write_text(seite(a, ordner, zeilen, referenz, fps))
    print(f'Kontaktbogen: {ordner.relative_to(ROOT)}/index.html')


if __name__ == '__main__':
    main()
