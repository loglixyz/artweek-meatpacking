"""Optional Flask server for the same static page.

The site works without this file. It exists so a later phase can add
server-side features (for example an RSVP form) without restructuring.

    pip install flask
    python app.py        # http://127.0.0.1:5000
"""
from pathlib import Path

from flask import Flask, send_from_directory

ROOT = Path(__file__).resolve().parent
ALLOWED = {"index.html", "styles.css", "script.js"}

app = Flask(__name__, static_folder=None)


@app.get("/")
def index():
    return send_from_directory(ROOT, "index.html")


@app.get("/<path:name>")
def static_file(name):
    # Serve only the site files and assets/, never app.py, README or .git.
    if name in ALLOWED or name.startswith("assets/"):
        return send_from_directory(ROOT, name)
    return "Not found", 404


if __name__ == "__main__":
    # Local only: bound to 127.0.0.1, not reachable from other machines.
    app.run(host="127.0.0.1", port=5000, debug=False)
