"""Serve only this folder on localhost. Python 3, standard library only."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
import webbrowser

root = Path(__file__).resolve().parent
class LocalOnly(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?', 1)[0] not in ('/', '/index.html', '/favicon.ico'):
            self.send_error(404)
            return
        super().do_GET()
    def do_HEAD(self):
        if self.path.split('?', 1)[0] not in ('/', '/index.html', '/favicon.ico'):
            self.send_error(404)
            return
        super().do_HEAD()
    def log_message(self, fmt, *args):
        pass
try:
    server = ThreadingHTTPServer(('127.0.0.1', 8765), partial(LocalOnly, directory=str(root)))
except OSError as exc:
    print('Local port 8765 is in use. Close the previous learning window/server and retry.')
    print(exc)
    input('Press Enter to close...')
    sys.exit(1)
print('English Studio: http://127.0.0.1:8765/')
print('Offline, localhost only. Keep this window open; Ctrl+C stops it.')
webbrowser.open('http://127.0.0.1:8765/')
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
