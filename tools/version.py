#!/usr/bin/env python3
"""Version erhöhen: python3 tools/version.py 0.0.2

Setzt VERSION in src/kern/version.js und jedes ?v=… in index.html und src/**/*.{js,css}.
Jede Datei wird so mit der neuen Version geladen, auch wenn GitHub Pages noch die alte im Cache hat.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MUSTER = re.compile(r'\?v=\d+\.\d+\.\d+')


def dateien():
    yield ROOT / 'index.html'
    for p in sorted((ROOT / 'src').rglob('*')):
        if p.suffix in ('.js', '.css'):
            yield p


def main():
    if len(sys.argv) != 2 or not re.fullmatch(r'\d+\.\d+\.\d+', sys.argv[1]):
        sys.exit('Aufruf: python3 tools/version.py <runde.modul.stand>, zum Beispiel 0.0.2')
    neu = sys.argv[1]
    vfile = ROOT / 'src/kern/version.js'
    text = vfile.read_text()
    text = re.sub(r"VERSION = '[^']*'", f"VERSION = '{neu}'", text)
    vfile.write_text(text)
    geaendert = []
    for p in dateien():
        alt = p.read_text()
        t = MUSTER.sub(f'?v={neu}', alt)
        if t != alt:
            p.write_text(t)
            geaendert.append(str(p.relative_to(ROOT)))
    print(f'Version {neu}: version.js und {len(geaendert)} Dateien mit ?v= angepasst.')


if __name__ == '__main__':
    main()
