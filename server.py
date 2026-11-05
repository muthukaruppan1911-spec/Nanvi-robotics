"""Nanvi Robotics – local web server.
Run:  python server.py   then open http://localhost:8001

Contact form emails are delivered by the Google Apps Script web app
(see apps-script/Code.gs); this server only serves the static site.
The legacy /contact endpoint still saves submissions to contacts.json.
"""
import json
import os
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

BASE = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(BASE, "static")
DATA = os.path.join(BASE, "contacts.json")
PORT = 8001


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=STATIC, **kw)

    # Only GET/HEAD/POST are allowed
    def do_PUT(self):
        self.send_error(405, "Method Not Allowed")

    def do_DELETE(self):
        self.send_error(405, "Method Not Allowed")

    def do_PATCH(self):
        self.send_error(405, "Method Not Allowed")

    def do_POST(self):
        if self.path == "/contact":
            self._handle_legacy_contact()
            return
        self.send_error(404)

    def _handle_legacy_contact(self):
        try:
            n = int(self.headers.get("Content-Length", 0))
            item = json.loads(self.rfile.read(n))
            item["time"] = datetime.now().isoformat(timespec="seconds")
            rows = json.load(open(DATA)) if os.path.exists(DATA) else []
            rows.append(item)
            json.dump(rows, open(DATA, "w"), indent=2)
            self.send_response(200)
        except Exception:
            self.send_response(400)
        self.end_headers()


if __name__ == "__main__":
    print(f"Nanvi site running at http://localhost:{PORT}  (Ctrl+C to stop)")
    ThreadingHTTPServer(("", PORT), Handler).serve_forever()
