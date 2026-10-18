// ASCII fire.
//
// A Doom-style heat buffer: the bottom row is kept hot, and each row above it
// averages the row below and cools a little, so flames of varying height rise
// and flicker on their own. Each cell is then drawn as a single glyph from a
// ramp, coloured along an ember -> orange -> yellow scale on a canvas.
//
// No dependencies, no image assets. Honours prefers-reduced-motion by drawing
// one settled frame instead of animating.

(() => {
  const canvas = document.getElementById('fire')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const MONO =
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Courier New", monospace'

  const FONT = 18 // glyph size, px
  const ROW_H = 20 // row pitch, px
  const DECAY = 0.028 // heat lost per row — controls how tall the flames get
  const MIN_HEAT = 0.1 // below this a cell stays black
  const FRAME_MS = 32 // ~31 fps: deliberate, not frantic

  // glyph ramp, dimmest to brightest
  const GLYPH = [' ', '.', ':', '*', 'o', 'O', '#', '@']
  // matching colour ramp: embers -> orange -> amber -> pale yellow
  const COLOUR = [
    '#000000',
    '#5c1800',
    '#8f2f00',
    '#c85000',
    '#f07a00',
    '#ffa000',
    '#ffcb3a',
    '#fff5a8',
  ]

  let cols = 0
  let rows = 0
  let cellW = 11
  let heat = null
  let clock = 0

  function measureCell() {
    ctx.font = `${FONT}px ${MONO}`
    cellW = Math.max(6, ctx.measureText('M').width)
  }

  function initialise() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight

    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.textBaseline = 'top'
    measureCell()

    cols = Math.ceil(w / cellW) + 1
    rows = Math.ceil(h / ROW_H) + 1
    heat = new Float32Array(cols * rows)

    stoke()
  }

  // Keep the bottom row hot so the fire never dies out. Brightness varies
  // smoothly along the row and drifts over time: that uneven floor is what
  // splits the fire into separate tongues of different heights.
  function stoke() {
    clock += 0.05
    const base = (rows - 1) * cols
    for (let x = 0; x < cols; x++) {
      const n =
        0.5 +
        0.3 * Math.sin(x * 0.21 + clock * 1.1) +
        0.2 * Math.sin(x * 0.53 - clock * 0.7) +
        0.15 * Math.sin(x * 1.31 + clock * 1.7) +
        (Math.random() - 0.5) * 0.5
      heat[base + x] = n < 0.06 ? 0.06 : n > 1 ? 1 : n
    }
  }

  function step() {
    stoke()

    // A gentle wind so the flames lean and flicker sideways.
    const wind = Math.sin(clock * 0.4) * 0.1

    // Walk upwards; each row is a weighted average of the (already updated)
    // row below, minus a little heat. Weighting the centre heavily keeps the
    // tongues narrow instead of smearing into one bright band.
    for (let y = rows - 2; y >= 0; y--) {
      const row = y * cols
      const below = (y + 1) * cols
      for (let x = 0; x < cols; x++) {
        const left = heat[below + (x > 0 ? x - 1 : 0)]
        const mid = heat[below + x]
        const right = heat[below + (x < cols - 1 ? x + 1 : cols - 1)]
        const v =
          left * (0.2 - wind) +
          mid * 0.6 +
          right * (0.2 + wind) -
          DECAY +
          (Math.random() - 0.5) * 0.03
        heat[row + x] = v > 0 ? v : 0
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Collect cells per colour so we only switch fillStyle a handful of times.
    const buckets = GLYPH.map(() => [])
    for (let y = 0; y < rows; y++) {
      const row = y * cols
      for (let x = 0; x < cols; x++) {
        const v = heat[row + x]
        if (v < MIN_HEAT) continue
        let i = (v * GLYPH.length) | 0
        if (i > GLYPH.length - 1) i = GLYPH.length - 1
        if (i === 0) continue
        const b = buckets[i]
        b.push(x, y)
      }
    }

    for (let i = 1; i < GLYPH.length; i++) {
      const b = buckets[i]
      if (!b.length) continue
      ctx.fillStyle = COLOUR[i]
      // hotter cells are more opaque, so the fire dissolves into the dark
      ctx.globalAlpha = 0.4 + (i / (GLYPH.length - 1)) * 0.6
      const glyph = GLYPH[i]
      for (let j = 0; j < b.length; j += 2) {
        ctx.fillText(glyph, b[j] * cellW, b[j + 1] * ROW_H)
      }
    }
    ctx.globalAlpha = 1
  }

  function loop(t) {
    if (t - last < FRAME_MS) {
      requestAnimationFrame(loop)
      return
    }
    last = t
    step()
    draw()
    requestAnimationFrame(loop)
  }

  let last = 0
  let resizeTimer = 0

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      initialise()
      if (reduceMotion) settle()
    }, 140)
  })

  function settle() {
    for (let i = 0; i < 90; i++) step()
    draw()
  }

  initialise()

  if (reduceMotion) {
    settle()
  } else {
    requestAnimationFrame((t) => {
      last = t
      loop(t)
    })
  }
})()
