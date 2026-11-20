# Sunset Coast Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Deffi69/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Deffi69/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

An offline browser web app that turns any photo and a caption into multi-panel poster cover art in the style of a neon-sunset game cover — no uploads, no server, no watermark. Pick a layout, drop in up to nine photos, crop and position each panel by dragging, pick a sunset grade, letter the title in big gradient capitals with a script subtitle, and export print-ready PNGs in all three share sizes at once.

## What it does

- **5 poster layouts** — Hero + 3, Four Square, Trio, Full Bleed, Nine Grid — with white gutters and inked panel frames, the classic multi-panel cover look.
- **Any photo, per panel** — upload your own photos or use the three built-in samples; drag on the cover to pan, zoom and nudge each panel separately.
- **5 neon-sunset grades** — Sunset, Neon Night, Golden Hour, Teal Dusk, Noir — washed over every panel with a dusk gradient, grain and vignette.
- **Poster lettering** — a bold gradient title (Anton, SIL OFL), a Pacifico script subtitle and a letterspaced tagline, plus a hand-drawn halftone sun badge.
- **One-click export** — PNG at 1080 × 1080, 1080 × 1350 and 1920 × 1080, individually or all three at once.

## Try it

```sh
node serve.ts        # then open http://localhost:8080
```

Everything runs locally in the browser: photos are read with object URLs and drawn straight onto a canvas, so they never leave the machine. No network requests, no libraries — vanilla ES modules and two vendored OFL fonts.

## Hand in

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts   # copies app/ + screenshots/, writes out/dossier.json
```

## Originality

All artwork and lettering in this app is original: the panels, gradients, sun badge, grain and title treatment are drawn by hand on canvas, the fonts are Anton and Pacifico under the SIL Open Font License (texts in `app/fonts/`), and the three sample photos were made for this app (two from the make.fun kit, one generated portrait). No Rockstar Games logo, official artwork or fonts are used anywhere.

---

<sub>Entered on [make.fun](https://make.fun/?ref=eaffd4np&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
