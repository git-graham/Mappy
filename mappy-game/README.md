# Mappy: Police Mouse

A browser-based HTML5 arcade game inspired by the 1983 Namco classic **Mappy**.
Canvas 2D + Web Audio API — no frameworks, no build step.

---

## Project Structure

```
mappy-game/
├── index.html          ← Entry point — open this in a browser or Live Server
├── README.md           ← You are here
└── src/
    ├── constants.js    ← Palette colours, base64 item sprites, level geometry
    ├── audio.js        ← Web Audio API: SFX helpers + procedural music
    ├── level.js        ← buildLevel(), platform segments, door & item layouts
    ├── state.js        ← All mutable game-state variables + entity factories
    ├── physics.js      ← resolveEntity(), getFloorAt(), rectsOverlap()
    ├── input.js        ← Keyboard event listeners
    ├── gameflow.js     ← startGame, resetAfterDeath, spawnShockwave helpers
    ├── update.js       ← Main update() loop (player, cats, doors, items, AI)
    ├── sprites.js      ← All canvas drawing: Mappy, cats, doors, items, tramps
    ├── hud.js          ← HUD overlay, title/game-over screens, hurry scroll
    └── main.js         ← render() function + requestAnimationFrame game loop
```

---

## How to Run Locally

### Option A — VS Code Live Server (recommended)
1. Install the **Live Server** extension (ritwickdey.LiveServer)
2. Right-click `index.html` → **Open with Live Server**
3. Game opens in your browser at `http://127.0.0.1:5500`

### Option B — Python quick server
```bash
cd mappy-game
python3 -m http.server 8080
# open http://localhost:8080
```

> **Why a server?** The game loads `src/*.js` files via `<script src="">` tags,
> which browsers block when opening `file://` directly (CORS policy).
> Any local HTTP server fixes this instantly.

---

## Controls

| Key | Action |
|-----|--------|
| ← → | Move Mappy left / right |
| Space | Open / close door |
| Stand on trampoline | Launch into channel |
| Arrow while rising | Buffer exit direction |
| P | Pause / unpause |
| K | Restart level (debug) |

---

## Key Files for Editing

### Want to add a new level layout?
→ **`src/level.js`** — Edit `DOORS_LAYOUT` and `ITEMS_LAYOUT` arrays.
Each entry is one level. Doors need `{floor, x, special: true/false}`.

### Want to change cat behaviour?
→ **`src/update.js`** — Cat AI block starting at `// ── Cat AI ──`

### Want to tweak Mappy's movement / trampoline physics?
→ **`src/physics.js`** — `resolveEntity()` controls all movement.
Key constants: `RISE_SPD`, `GRAVITY`, `WALK_SPD` (in `src/state.js`).

### Want to change how things look?
→ **`src/sprites.js`** — Every `draw*()` function is here.
→ **`src/constants.js`** — Palette colours are at the top as `PAL`.

### Want to swap item artwork?
→ **`src/constants.js`** — Replace the base64 string in `ITEM_SPRITES`
for the relevant label (`MONA`, `RADIO`, `SAFE`, `PC`, `TV`).

### Want to change music / sounds?
→ **`src/audio.js`** — `MEL[]` is the melody pattern, `BAS[]` is the bassline.
`sfx` object contains all one-shot sound effects.

---

## Adding to GitHub

```bash
cd mappy-game
git init
git add .
git commit -m "Initial commit: Mappy Police Mouse Phase 3"

# Then on GitHub.com: New Repository → copy the remote URL, then:
git remote add origin https://github.com/YOUR_USERNAME/mappy-game.git
git push -u origin main
```

---

## Phase Roadmap

- [x] Phase 1 — Core engine: canvas, platforms, trampolines, Mappy movement
- [x] Phase 2 — Cats, items, scoring, timer, music
- [x] Phase 3 — Doors (regular + shockwave), cat AI improvements, multi-floor exits
- [ ] Phase 4 — Custom pixel sprites for Mappy & cats
- [ ] Phase 5 — Multiple levels, power-ups, high-score table, mobile controls

