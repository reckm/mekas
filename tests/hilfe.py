"""Gemeinsames für die Tests: kleiner Server über den Projektordner, Chrome mit Fake-Kamera, gesäter Zufall."""
import functools
import http.server
import pathlib
import re
import threading

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'tests' / 'out'
VERSION = re.search(r"VERSION = '([^']+)'", (ROOT / 'src/kern/version.js').read_text()).group(1)

# Math.random gesät, damit alt und neu dieselben Zufallsfolgen bekommen (Handkurbel, Bildstand)
SAAT = """
(() => { let a = 20261009; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
"""


class _Leise(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


class Server:
    """Liefert den Projektordner auf einem freien Port aus, solange der with-Block läuft."""

    def __enter__(self):
        handler = functools.partial(_Leise, directory=str(ROOT))
        self.httpd = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
        self.url = f'http://127.0.0.1:{self.httpd.server_address[1]}/'
        return self

    def __exit__(self, *a):
        self.httpd.shutdown()


def starte_chrome(p, kamera_datei=None):
    args = ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required']
    if kamera_datei:
        args.append(f'--use-file-for-fake-video-capture={kamera_datei}')
    try:
        return p.chromium.launch(channel='chrome', headless=True, args=args)
    except Exception:
        return p.chromium.launch(headless=True, args=args)   # falls kein Chrome installiert ist: playwright install chromium
