# A Week of Art and Coffee in Meatpacking

This is a one-page site for an art activation in the Meatpacking District, timed around Art Week NYC (November 11–14, 2026). The title is a working title.

It is a plain static site with no build step, no framework, no analytics and no external requests:

```
index.html   page markup + the inline CONFIG block (all editable content)
styles.css   layout and type
script.js    renders CONFIG into the page
assets/      concept illustrations: site-hero, site-dinner, site-cowork
             (.webp served first, .png fallback) and site-coffee.jpg,
             a detail cropped from the hero illustration
app.py       optional Flask server, not required
```

## Run locally

Either of these works:

1. **Open the file directly.** Double-click `index.html`. It runs over `file://` because the config is inline and nothing is fetched.
2. **Run a local server.** From this folder:

   ```bash
   python3 -m http.server 8000
   ```

   Then open http://localhost:8000.

Optional Flask version (same page, local only):

```bash
pip install flask
python3 app.py
```

Then open http://127.0.0.1:5000.

## Editing content

Every date, venue, partner and contact string is in the `CONFIG` block at the top of `index.html`. Change a value there and reload; nothing else needs editing. Image paths, alt text and captions are also in `CONFIG`.

- `partners.show: false` hides the Partners row entirely.
- In `week.intro`, `{festivalDates}` and `{festivalName}` are filled in from `CONFIG.festival`.

### Phase 2 keys (brief v2)

These stay empty in phase 1. While empty, their lines and sections are removed from the page, so nothing renders as a blank shell.

| Key | Fill in only when | Where it shows |
| --- | --- | --- |
| `activationDates` | The organizers supply the confirmed public dates. Copy them verbatim. Never reuse the festival dates. | Replaces the hero date line |
| `festivalContext` | You want festival context shown, e.g. "During Art Week NYC, November 11–14, 2026" | Dark band under the hero |
| `admission` | Dates and venue are confirmed: "Free entry · optional contribution on exit" | Under the hero dates. Text only, no payment code |
| `participation` | The organizers have selected and approved specific visitor-made works | "Made with visitors" list, always with `participationNote` |

### Content rules (brief v2)

- Name no institution, partner, artist, artwork or lender until a partnership is confirmed **and** naming it is approved.
- No attendance, capacity or occupancy figures. No loan, install or return dates. No basement size or layout detail beyond "a basement".
- No donations, payments or contribution capture in code.

## Phase 1: private concept preview (now)

- Local only. Show it from your own machine.
- No domain, no hosting account, no analytics, no trackers, no forms, no data collection.
- Fonts: Fraunces (serif) and Caveat (pencil notes) load from Google Fonts. That is the page's only third-party request, and Google can see visitors' IP addresses. Offline or over `file://`, the page falls back to Georgia and the system sans.
- The `noindex` meta tag is **not** privacy. If a hosted preview is ever needed, it must sit behind real access control (password protection). A public URL is public, even if the repository is private.
- The illustrations are concept art. They do not show the actual building.

## Phase 2: public event site (later)

Once the venue and exact dates are confirmed:

1. Update `CONFIG`: `site.dates`, `space.*`, `program.text`, `partners.*`, `contact.text`, `footer`, and the final event name in `site.title` (then clear `site.titleNote`).
2. Remove `<meta name="robots" content="noindex, nofollow">` from `index.html`.
3. Choose hosting and point the domain at it.
4. If you need an RSVP or contact form, add it to `app.py` and choose a Python host. Review the privacy notice and storage before collecting anything.

### Hosting options to decide later

| Option | Fits | Notes |
| --- | --- | --- |
| GitHub Pages | static | Free, pushes from a repo. Password protection is not built in, so it is not suitable for a private preview. |
| Netlify | static | Simple custom domains. Password protection for previews is on paid plans. |
| Vercel | static | Similar to Netlify. Preview protection depends on plan. |
| Small Python host (Render, Fly.io, Railway, PythonAnywhere) | `app.py` | Needed only if the site gets server-side features such as RSVP. |

### Current hosting

- Code: private GitHub repo `loglixyz/artweek-meatpacking`.
- Site: GitHub Pages, deployed from `main`, repo root (Settings → Pages → Deploy from a branch). Address: https://loglixyz.github.io/artweek-meatpacking/
- `.nojekyll` tells Pages to serve the files as they are, with no Jekyll processing.
- The site is **public to anyone with the link** and shared internally only. The `noindex` meta tag asks search engines to skip it, but it is not access control.
- To go fully public in phase 2, remove the `noindex` meta tag, then add the domain under Settings → Pages → Custom domain and point its DNS at GitHub.

## Pre-publish checklist

- No street names, address, map or building-identifying details.
- No partner names, logos, endorsements or artwork loans unless confirmed in writing.
- No dates other than the confirmed ones.
- Readable at 320px, 390px and 1280px wide, keyboard navigable, and text contrast at WCAG AA. The teal `#73A89A` is used only for decoration, never for text.
