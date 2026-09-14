# Power of Two

A single-file 2048 clone: merge matching tiles until they double, and try to reach 2048 (or keep folding past it for a higher score).

## Play it

Open [`index.html`](index.html) directly in a browser — no build step or server required.

## Controls

- Arrow keys or `WASD` to move
- Swipe on touch devices
- **New game** button to restart
- **Feedback** button to open a pre-filled GitHub issue in a new tab

Your best score is saved locally in the browser (`localStorage`) and persists between sessions.

## Development

Tests use Node's built-in test runner with `jsdom` to drive the page:

```
npm install
npm test
```
