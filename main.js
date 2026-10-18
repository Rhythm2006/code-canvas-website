// The title decodes itself: random glyphs resolve left to right into
// "CODE CANVAS", terminal-style. The ongoing flicker is pure CSS (see
// .title animation) so it keeps going whatever the JS does afterwards.

(() => {
  const el = document.getElementById('title')
  if (!el) return

  const target = el.textContent.trim()
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduceMotion) {
    el.textContent = target
    return
  }

  const NOISE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>[]{}=+*#$%&@'
  const STEP_MS = 80

  let revealed = 0
  el.textContent = ''

  const timer = setInterval(() => {
    revealed += 1

    let out = ''
    for (let i = 0; i < target.length; i++) {
      const ch = target[i]
      if (ch === ' ') {
        out += ' '
      } else if (i < revealed) {
        out += ch
      } else {
        out += NOISE[(Math.random() * NOISE.length) | 0]
      }
    }
    el.textContent = out

    if (revealed >= target.length) {
      clearInterval(timer)
      el.textContent = target
    }
  }, STEP_MS)
})()
