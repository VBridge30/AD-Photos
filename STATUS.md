# aashish.in — project status

Updated: 2026-11-21 · Live: https://www.vbridge.in · Repo: VBridge30/AD-Photos (branch `main`, latest `658bbc5`)

## Hosting
- GitHub Pages, custom domain `www.vbridge.in` (GoDaddy DNS: `www` CNAME to `vbridge30.github.io`, four apex A records).
- HTTPS certificate approved and enforced; `vbridge.in` redirects (301) to `www`.
- Static site: `index.html`, `script.js`, `data.js`, `style.css`, `photos/` (full size), `thumbs/`, `CNAME`.
- Assets are cache-busted with `?v=` (currently `20261122q`); bump it in `index.html` on every change.

## What the site does
- **Intro:** blue name draws and fills, "PHOTOGRAPHS" reveals letter by letter, underline draws and shines in a slow loop; waits for a click, Enter, Space or Esc ("click anywhere to enter" at the bottom). Plays once per session; skipped with reduced motion.
- **Hero:** typewriter tagline with blinking caret.
- **Chapters (7):** Monochrome and Light and Shadow, Unforced Frames, Macro, Story, Street and Architecture, Abstract, Landscape. 153 photographs.
- **Navigation:** Selected Works first; one chapter at a time (desktop and phone). Phone uses a three-bar menu with a blue "aashish.in" title. Desktop nav tightened for 601–1420px; wraps to two rows at 601–1100px.
- **Landscape:** opens in grid with "Wide frames" (2 columns) then "Vertical frames" (3 columns); slider uses the same wide-first order. Architecture opens in slider.
- **Photo exhibition:** curved 3D gallery wall with the main photo highlighted; opens the lightbox.
- **Music:** generated slow solo piano (a `music.mp3` in the root would take priority).
- **Footer banner:** Orbitron "aashish.in" built from 0/1 digits; digits near the cursor turn blue and trace the edges. Follows the light theme.
- **Themes:** dark and light. Favicon is a blue ring; the AD monogram was removed everywhere.

## Audit (final, before submission)
Checked: all 153 ids have photo and thumb files, no duplicate ids, no script errors clicking every chapter, the exhibition and the lightbox (headless Chrome), live site 200, canonical and og tags present, photos 38 MB total (largest 753 KB).

Not verified: real phones, the piano sound and volume, real-mouse banner hover, WhatsApp/LinkedIn link preview.

## Not done (optional)
- `robots.txt`, `sitemap.xml`, `404.html`.
- 68 photos have stored width/height that differ from the file pixels (same aspect ratio, harmless).

## Deliverables
- ZIP for forwarding: `~/Desktop/aashish-website.zip` (47 MB, no git history).
- This file is local only; it is not committed or published.
