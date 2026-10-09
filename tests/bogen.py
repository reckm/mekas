"""Kontaktbogen: ein Modul mit mehreren Werten durchschalten, Standbilder und kurze Clips als HTML-Seite.

    .venv/bin/python tests/bogen.py --modul blende --param winkel --werte 30,135,240,360 --alt

--quelle demo (Standard) oder ein Video (wird mit ffmpeg zu .y4m und als falsche Kamera eingespielt)
--alt      dieselben Werte mit der alten mekas.html daneben (vorher/nachher), nur für Werte, die sie kannte
--referenz ein Referenzbild, das neben jeder Zeile steht
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
    ('kammblende', 'schlitze'): ('slits', lambda w: w),
}

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


def aufnehmen(page, ordner, name, bilder, clip_sek):
    """Standbilder (alle 0,5 s) und ein Clip vom Ausgabebild."""
    standbilder = []
    for i in range(bilder):
        daten = page.evaluate("document.querySelector('#out').toDataURL('image/png')").split(',')[1]
        datei = ordner / f'{name}-{i + 1}.png'
        datei.write_bytes(base64.b64decode(daten))
        standbilder.append(datei.name)
        page.wait_for_timeout(500)
    webm = ordner / f'{name}.webm'
    webm.write_bytes(base64.b64decode(page.evaluate(CLIP_JS, clip_sek)))
    mp4 = ordner / f'{name}.mp4'
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(webm), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '24', '-an', str(mp4)])
    if r.returncode == 0:
        webm.unlink()
        return standbilder, mp4.name
    return standbilder, webm.name


def starte_quelle(page, kamera):
    page.click('#cardCam' if kamera else '#cardDemo')


def lauf_neu(browser, url, a, wert, ordner, kamera):
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    context.add_init_script(SAAT)
    page = context.new_page()
    page.goto(url + '?labor')
    page.wait_for_function('window.mekas')
    page.evaluate('document.querySelector("#labor").classList.add("weg")')
    starte_quelle(page, kamera)
    page.evaluate(f"window.mekas.schalte({json.dumps(a.modul)}, true)")      # das geprüfte Modul ist immer an
    page.evaluate(f"window.mekas.setze({json.dumps(a.modul)}, {json.dumps(a.param)}, {json.dumps(wert)})")
    page.wait_for_timeout(a.warten * 1000)
    fps = page.evaluate('window.mekas.ctx.kurbel.fps')
    ergebnis = aufnehmen(page, ordner, f'neu-{wert}', a.bilder, a.clip)
    context.close()
    return ergebnis, fps


def lauf_alt(browser, url, a, wert, ordner, kamera):
    feld, umrechnen = ALT_FELD[(a.modul, a.param)]
    einst = {'v': 4, 'slits': 0, 'lastMode': 'cam' if kamera else 'demo', feld: umrechnen(wert)}
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    context.add_init_script(SAAT)
    context.add_init_script(f"localStorage.setItem('kurbel.v3', {json.dumps(json.dumps(einst))})")
    page = context.new_page()
    page.goto(url + ALT)
    starte_quelle(page, kamera)
    page.wait_for_timeout(a.warten * 1000)
    ergebnis = aufnehmen(page, ordner, f'alt-{wert}', a.bilder, a.clip)
    context.close()
    return ergebnis


def seite(a, ordner, zeilen, referenz, fps):
    def zelle(standbilder, clip, label):
        bilder = ''.join(f'<a href="{b}"><img src="{b}" loading="lazy"></a>' for b in standbilder)
        return f'<div class="reihe"><span class="was">{label}</span>{bilder}<video src="{clip}" controls loop muted playsinline></video></div>'
    teile = []
    for z in zeilen:
        t = f'<section><h2>{html.escape(z["label"])}</h2>'
        t += zelle(*z['neu'], f'jetzt {VERSION}')
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
</style></head><body>
<h1>Kontaktbogen: {html.escape(a.modul)} · {html.escape(a.param)}</h1>
<p>Mekas {VERSION} · Quelle {html.escape(quelle)} · Kurbel {fps:.1f} fps · {a.bilder} Standbilder im Abstand von 0,5 s, Clip {a.clip} s · {jetzt}</p>
{''.join(teile)}
</body></html>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--modul', required=True)
    ap.add_argument('--param', required=True)
    ap.add_argument('--werte', required=True, help='durch Komma getrennt, z. B. 30,135,240,360')
    ap.add_argument('--einheit', default=None, help='für die Überschriften, z. B. °')
    ap.add_argument('--quelle', default='demo')
    ap.add_argument('--alt', action='store_true')
    ap.add_argument('--referenz', default=None)
    ap.add_argument('--bilder', type=int, default=4)
    ap.add_argument('--clip', type=float, default=3)
    ap.add_argument('--warten', type=float, default=2.0, help='Sekunden nach dem Einstellen')
    a = ap.parse_args()
    werte = [float(w) if '.' in w else int(w) for w in a.werte.split(',')]
    einheit = a.einheit if a.einheit is not None else ('°' if a.param == 'winkel' else '')
    if a.alt and (a.modul, a.param) not in ALT_FELD:
        raise SystemExit(f'--alt geht nur für {sorted(ALT_FELD)}')

    ordner = OUT / f'bogen-{a.modul}-{datetime.datetime.now():%Y%m%d-%H%M%S}'
    ordner.mkdir(parents=True)
    kamera = None if a.quelle == 'demo' else kamera_y4m(ROOT / a.quelle if not pathlib.Path(a.quelle).is_absolute() else a.quelle)
    referenz = None
    if a.referenz:
        referenz = 'referenz' + pathlib.Path(a.referenz).suffix
        shutil.copy(a.referenz, ordner / referenz)

    zeilen, fps = [], 0
    with Server() as s, sync_playwright() as p:
        browser = starte_chrome(p, kamera)
        for w in werte:
            neu, fps = lauf_neu(browser, s.url, a, w, ordner, kamera)
            z = {'label': f'{w}{einheit}', 'neu': neu}
            if a.alt:
                z['alt'] = lauf_alt(browser, s.url, a, w, ordner, kamera)
            zeilen.append(z)
            print(f'  {w}{einheit} fertig')
        browser.close()
    (ordner / 'index.html').write_text(seite(a, ordner, zeilen, referenz, fps))
    print(f'Kontaktbogen: {ordner.relative_to(ROOT)}/index.html')


if __name__ == '__main__':
    main()
