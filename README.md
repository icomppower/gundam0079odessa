# オデッサ作戦 · Battle of Odessa — U.C. 0079
**by Johnny · [icomppower](https://linkedin.com/in/icomppower/)**

Self-playing 3D documentary of Operation Odessa (6–9 Nov U.C. 0079).
Part of the [Narrated History Map Documentary Series](https://github.com/icomppower/Gundambattleseries).

[![live demo](https://img.shields.io/badge/live-gundam0079odessa.vercel.app-2ea44f?style=for-the-badge)](https://gundam0079odessa.vercel.app)

---

## About

A self-playing 3D documentary of **Operation Odessa** — the Earth Federation's combined-arms counteroffensive that drove the Principality of Zeon off the north coast of the Black Sea, the largest ground battle of the One Year War (6–9 November U.C. 0079).

Rendered on the **real Odessa / Black Sea terrain** (EOX Sentinel-2 imagery + AWS Terrarium / SRTM elevation), with a self-directing Director camera, period faction emblems, bilingual Traditional Chinese / English narration, weather, and a day/night cycle.

**Non-commercial fan tribute.** *Mobile Suit Gundam* © Sotsu, Sunrise. This is a fictional battle and is not a depiction of or commentary on the current conflict in the real Odessa, Ukraine.

## Quick start

```bash
node tools/fetch_tiles.mjs   # first time: download terrain + imagery tiles
node tools/serve.js          # then open http://localhost:5050
```

Tiles load over HTTP — `file://` will not work. Windows: `start.bat` · macOS/Linux: `sh start.sh`.

## Structure

| File | Role |
|------|------|
| `data.js` | Battle data — factions, units, storyboard, narration, sources |
| `flags.js` | Faction emblems — Sigil of Zeon, E.F.F. emblem |
| `index.html` | Title, meta, canon-confidence chip CSS |
| `lib/tiles/` | Committed terrain + imagery tiles (self-contained deploy) |
| `lib/Rise of the Iron Vanguard.mp3` | Background music |

Engine modules (`app.js`, `core.js`, `director.js`, etc.) are never edited — see [PLAYBOOK.md](PLAYBOOK.md).

## Validate

```bash
node tools/check-agnostic.mjs   # engine modules must stay battle-agnostic
```

---

## Credits
- **Series creator:** Johnny — [linkedin.com/in/icomppower](https://linkedin.com/in/icomppower/)
- **Engine:** cinematic-3d-battle-engine by Keith Li (MIT) — used as base, not modified
- **Imagery:** Sentinel-2 © EOX IT Services GmbH · **Terrain:** AWS Terrarium / SRTM © USGS
- **IP:** *Mobile Suit Gundam* © Sotsu, Sunrise — non-commercial fan tribute
