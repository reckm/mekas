"""Rauchtest: Demo → Aufnehmen → Pause → Doppel → Doppel starten → Fertig, ohne Konsolenfehler.
Dazu: alle Importe tragen die aktuelle Version, und das Labor zeigt alle Module.

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
    erwartet = ['handkurbel', 'schwenken', 'blende', 'kammblende', 'entwickeln', 'greifer', 'bildstand']
    if ids != erwartet:
        fehler.append(f'Labor: Module {ids}, erwartet {erwartet}')
    if page.locator('.lab-modulkopf .switch').count() != len(erwartet):
        fehler.append('Labor: nicht alle Module in der Liste')
    page.click('#cardDemo')
    for m in module:                           # jedes Modul einmal um und wieder zurück
        page.evaluate(f"window.mekas.schalte('{m['id']}', {str(not m['an']).lower()})")
        page.wait_for_timeout(300)
        page.evaluate(f"window.mekas.schalte('{m['id']}', {str(m['an']).lower()})")
        page.wait_for_timeout(200)
    # Greifer: Stoss, Halten (Schlupf), Loslassen (Feder)
    page.evaluate('window.mekas.stoss(0, 1)')
    page.wait_for_timeout(600)
    page.evaluate('window.mekas.halte(0.95)')
    page.wait_for_timeout(1000)
    page.evaluate('window.mekas.lass()')
    page.wait_for_timeout(1500)
    page.evaluate("window.mekas.vergleiche('greifer')")
    page.wait_for_timeout(300)
    page.evaluate('window.mekas.vergleiche(null)')
    with page.expect_download() as d1:
        page.click('text=Schnappschuss')
    print(f'  Labor: {len(ids)} Module, Schnappschuss {d1.value.suggested_filename}')
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
