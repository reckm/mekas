"""Rauchtest: Demo → Aufnehmen → Pause → Doppel → Doppel starten → Fertig, ohne Konsolenfehler.
Dazu: alle Importe tragen die aktuelle Version, das Labor zeigt nur, was noch eingestellt wird, und der Bauplan beschreibt alle Module.

    .venv/bin/python tests/rauch.py
"""
import re
import sys

from playwright.sync_api import sync_playwright

from hilfe import ROOT, VERSION, Server, starte_chrome

fehler = []


def pruefe_versionen():
    """Jede relative Datei, die geladen wird, trägt ?v=<VERSION>. Sonst bleibt sie auf GitHub Pages im Cache hängen."""
    muster = [
        re.compile(r"""\bfrom\s*['"](\.{1,2}/[^'"]+)['"]"""),
        re.compile(r"""\bimport\s*\(\s*['"](\.{1,2}/[^'"]+)['"]"""),
        re.compile(r"""\bimport\s*['"](\.{1,2}/[^'"]+)['"]"""),
        re.compile(r"""new URL\(\s*['"](\.{1,2}/[^'"]+)['"]"""),
        re.compile(r"""(?:src|href)="(src/[^"]+)\""""),
    ]
    dateien = [ROOT / 'index.html'] + sorted((ROOT / 'src').rglob('*.js'))
    for d in dateien:
        text = d.read_text()
        for m in muster:
            for pfad in m.findall(text):
                if not pfad.endswith('?v=' + VERSION):
                    fehler.append(f'{d.relative_to(ROOT)}: {pfad} ohne ?v={VERSION}')


def beobachte(page, name):
    def konsole(m):
        # fehlende Dateien meldet `antwort` mit Adresse; das Favicon fehlt absichtlich
        if m.type == 'error' and not m.text.startswith('Failed to load resource'):
            fehler.append(f'{name}: Konsole: {m.text}')
    page.on('console', konsole)
    page.on('pageerror', lambda e: fehler.append(f'{name}: Fehler: {e}'))

    def anfrage(r):
        if '/src/' in r.url and '?v=' not in r.url:
            fehler.append(f'{name}: ohne Version geladen: {r.url}')
    page.on('request', anfrage)

    def antwort(r):
        if r.status >= 400 and not r.url.endswith('/favicon.ico'):
            fehler.append(f'{name}: {r.status} für {r.url}')
    page.on('response', antwort)


def warte_label(page, text):
    page.wait_for_function(f"document.querySelector('#recLabel').textContent === '{text}'", timeout=10000)


def ablauf(page, name):
    page.wait_for_timeout(800)
    page.click('#btnRec')                      # Aufnehmen
    warte_label(page, 'Pause')
    page.wait_for_timeout(2000)
    page.click('#btnRec')                      # Pause
    warte_label(page, 'weiter')
    page.click('#btnDoppel')                   # Doppel: zurückspulen
    page.wait_for_selector('#scrub:not([hidden])', timeout=5000)
    page.wait_for_timeout(600)
    page.click('#btnRec')                      # Doppel starten
    warte_label(page, 'Pause')
    page.wait_for_timeout(1500)
    page.click('#btnDone')                     # Fertig
    page.wait_for_selector('#result:not([hidden])', timeout=30000)
    titel = page.text_content('#resTitle')
    if 'Film 1 fertig' not in titel:
        fehler.append(f'{name}: Ergebnis heisst „{titel}“')
    print(f'  {name}: {titel}')


def labor(page, browser_url):
    page.goto(browser_url + '?labor')
    page.wait_for_function('window.mekas')
    module = page.evaluate('window.mekas.module()')
    ids = [m['id'] for m in module]
    erwartet = ['handkurbel', 'schwenken', 'blende', 'farbsektoren', 'muederentwickler', 'roehre', 'lith', 'entwickeln', 'greifer', 'stehenderfilm', 'bildstand', 'roehreatmen', 'ueberblenden']
    if ids != erwartet:
        fehler.append(f'Labor: Module {ids}, erwartet {erwartet}')
    # das Labor zeigt nur, was noch eingestellt wird; Abgenommenes steht im Bauplan
    namen = page.eval_on_selector_all('.lab-name', 'els => els.map(e => e.textContent)')
    for weg in ['Blende', 'Greifer', 'Bildstand', 'Entwickeln', 'Schwenken mit dem Telefon', 'Anstossen']:
        if weg in namen:
            fehler.append(f'Labor: {weg} sollte nicht mehr im Labor stehen')
    page.click('#cardDemo')
    for m in module:                           # jedes Modul einmal um und wieder zurück
        page.evaluate(f"window.mekas.schalte('{m['id']}', {str(not m['an']).lower()})")
        page.wait_for_timeout(300)
        page.evaluate(f"window.mekas.schalte('{m['id']}', {str(m['an']).lower()})")
        page.wait_for_timeout(200)
    # Sammeln: das alte und das neue (Teilbelichtungen), beide ohne Fehler
    page.evaluate("window.mekas.setze('sammeln', 'neu', false)")
    page.wait_for_timeout(800)
    page.evaluate("window.mekas.setze('sammeln', 'neu', true)")
    page.wait_for_timeout(800)
    if 'Teilbelichtungen pro Kurbelbild' not in page.text_content('.lab-kern'):
        fehler.append('Labor: das neue Sammeln läuft nicht')
    # Greifer: Stoss, Halten (Schlupf), Loslassen (Feder)
    page.evaluate('window.mekas.stoss(0, 1)')
    page.wait_for_timeout(600)
    page.evaluate('window.mekas.halte(0.95)')
    page.wait_for_timeout(1000)
    page.evaluate('window.mekas.lass()')
    page.wait_for_timeout(1500)
    # Stehender Film: Halten mit offener Blende sammelt Licht, Loslassen blendet ein frisches Bild hinein
    page.evaluate('window.mekas.halteBild(true)')
    page.wait_for_timeout(1500)
    if page.text_content('#frozen') != 'ACCUM.':
        fehler.append('Labor: beim Halten steht nicht ACCUM.')
    page.evaluate('window.mekas.standBild(true)')        # drei Finger: Standbild, die Kurbel steht
    page.wait_for_timeout(500)
    if page.text_content('#frozen') != 'HÄLT' or page.evaluate('window.mekas.ctx.kurbel.fps') != 0:
        fehler.append('Labor: drei Finger geben kein Standbild')
    page.evaluate('window.mekas.standBild(false)')
    page.evaluate('window.mekas.halteBild(false)')
    page.wait_for_timeout(1200)
    # Nachklingen: der Film steht immer und vergisst, zwei Finger halten fest, Loslassen verklingt von selbst
    page.evaluate("window.mekas.setze('stehenderfilm', 'nachklingen', true)")
    page.wait_for_timeout(800)
    page.evaluate('window.mekas.halteBild(true)')
    page.wait_for_timeout(800)
    page.evaluate('window.mekas.halteBild(false)')
    page.wait_for_timeout(800)
    page.evaluate("window.mekas.setze('stehenderfilm', 'nachklingen', false)")
    page.wait_for_timeout(800)
    page.evaluate("window.mekas.vergleiche('greifer')")
    page.wait_for_timeout(300)
    page.evaluate('window.mekas.vergleiche(null)')
    # Bauplan: jedes Modul der Kette hat eine beschriebene Karte, Antippen zeigt, was davon abhängt
    page.click('.bauplanbtn')
    page.wait_for_selector('#bauplan:not([hidden])')
    for m in ids:
        if page.locator(f'.bp-teil[data-id="{m}"]').count() != 1:
            fehler.append(f'Bauplan: keine Karte für {m}')
    if page.locator('text=noch nicht im Bauplan beschrieben').count():
        fehler.append('Bauplan: ein Modul ist nicht beschrieben')
    page.click('.bp-teil[data-id="blende"]')
    if page.locator('.bp-wirkt').count() < 3:
        fehler.append('Bauplan: die Blende wirkt auf nichts')
    page.keyboard.press('Escape')
    if page.is_visible('#bauplan'):
        fehler.append('Bauplan: Escape schliesst nicht')
    knoepfe = [k.strip() for k in page.eval_on_selector_all('.lab-knoepfe .pill', 'els => els.map(e => e.textContent)')]
    if knoepfe != ['Kamera', 'Demo', 'Video laden', 'Zurücksetzen', 'Werte kopieren']:
        fehler.append(f'Labor: oben {knoepfe}, erwartet Kamera, Demo, Video laden, Zurücksetzen, Werte kopieren')
    # Werte kopieren: verstellte Werte erscheinen als Text
    page.evaluate("window.mekas.setze('muederentwickler', 'verbrauch', 12)")
    wt = page.evaluate("window.mekas.werteText()")
    if 'muederentwickler.verbrauch = 12' not in wt:
        fehler.append(f'Labor: Werte kopieren zeigt den verstellten Wert nicht: {wt!r}')
    else:
        print('  Labor: Werte kopieren ok')
    page.click('text=Zurücksetzen')
    print(f'  Labor: {len(ids)} Module, Bauplan ok')
    ablauf(page, 'Labor')


def main():
    pruefe_versionen()
    with Server() as s, sync_playwright() as p:
        browser = starte_chrome(p)
        for name, url in [('Mekas', s.url), ('Labor', None)]:
            context = browser.new_context(viewport={'width': 1280, 'height': 800}, accept_downloads=True)
            page = context.new_page()
            beobachte(page, name)
            if url:
                page.goto(url)
                page.click('#cardDemo')
                ablauf(page, name)
            else:
                labor(page, s.url)
            context.close()
        browser.close()
    if fehler:
        print(f'Rauchtest {VERSION}: {len(fehler)} Fehler')
        for f in fehler:
            print('  -', f)
        sys.exit(1)
    print(f'Rauchtest {VERSION}: ok')


if __name__ == '__main__':
    main()
