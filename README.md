# Code Canvas — website

The landing page for [Code Canvas](https://github.com/Rhythm2006/Code-Canvas), a desktop
code editor with a drawing canvas layered straight over the code.

Static, no build step, no dependencies. Four files and a canvas element.

## Files

| File | What it is |
| --- | --- |
| `index.html` | All the copy: hero, install steps, features, links |
| `styles.css` | Pitch black, one accent colour, monospace |
| `fire.js` | The ASCII fire — a heat buffer rendered as coloured glyphs |
| `main.js` | The title decode animation |

## The fire

`fire.js` keeps a heat buffer the width and height of the viewport. The bottom row is
kept hot, with brightness varying smoothly along it and drifting over time; each row
above is a weighted average of the row below minus a little heat. That is the classic
"Doom fire" algorithm, and the uneven floor is what splits it into separate tongues of
different heights.

Each cell is then drawn as one glyph from the ramp ` . : * o O # @`, coloured along an
ember → orange → amber → pale-yellow scale. It runs at about 31 fps, which looks more
deliberate than 60.

If the visitor has `prefers-reduced-motion: reduce` set, the fire is drawn once in a
settled state and never animated.

## Publishing a release

Edit `index.html` — the version and the two download URLs are marked with a comment at
the top of the file. That is the only place they appear.

## Local preview

```sh
open index.html
```

Or serve it: `python3 -m http.server 8080`.

## Hosting

GitHub Pages, served from the root of the default branch. `.nojekyll` is present so the
files are served exactly as they are.
