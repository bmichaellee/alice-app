import { useState, useEffect, useMemo, useRef } from 'react'

const shapeMap = {
  triangle:  () => <polygon points="500,50 950,920 50,920" />,
  circle:    () => <circle cx="500" cy="500" r="460" />,
  oval:      () => <ellipse cx="500" cy="500" rx="460" ry="280" />,
  square:    () => <rect x="40" y="40" width="920" height="920" />,
  rectangle: () => <rect x="40" y="220" width="920" height="560" />,
  diamond:   () => <polygon points="500,80 720,500 500,920 280,500" />,
  pentagon:  () => <polygon points="500,50 928,361 765,864 235,864 72,361" />,
  hexagon:   () => <polygon points="500,50 890,275 890,725 500,950 110,725 110,275" />,
  octagon:   () => <polygon points="500,50 818,182 950,500 818,818 500,950 182,818 50,500 182,182" />,
  star:      () => <polygon points="500,50 606,354 928,361 671,556 765,864 500,680 235,864 329,556 72,361 394,354" />,
  heart:     () => <path d="M500,820 C200,620 30,420 30,270 C30,120 150,30 300,30 Q420,30 500,180 Q580,30 700,30 C850,30 970,120 970,270 C970,420 800,620 500,820 Z" />,
  arrow:     () => <polygon points="500,30 900,420 660,420 660,970 340,970 340,420 100,420" />,
  clover:    () => {
    const leaf = "M500,500 C200,480 100,300 200,160 C250,80 380,80 500,250 C620,80 750,80 800,160 C900,300 800,480 500,500 Z"
    return (
      <>
        {[0, 90, 180, 270].map(angle => (
          <g key={angle} transform={`rotate(${angle}, 500, 500)`}>
            <path d={leaf} />
          </g>
        ))}
      </>
    )
  },
}

// Lazily-created shared AudioContext (browsers only allow audio after a
// user gesture — the first keypress counts).
let audioCtx = null

function playChime() {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return
      audioCtx = new Ctx()
    }
    if (audioCtx.state === 'suspended') audioCtx.resume()

    const now = audioCtx.currentTime
    // A soft, friendly two-note rise (C6 -> E6), gentle on the ears.
    const gain = audioCtx.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7)
    gain.connect(audioCtx.destination)

    ;[1046.5, 1318.5].forEach((freq, i) => {
      const osc = audioCtx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.connect(gain)
      osc.start(now + i * 0.09)
      osc.stop(now + 0.7)
    })
  } catch {
    // Audio is a nice-to-have; never let it break the app.
  }
}

function isCssColor(str) {
  const s = new Option().style
  s.color = str
  return s.color !== ''
}

const IDLE_RESET_MS = 100000

export default function App() {
  const [key, setKey] = useState('')
  // Timestamp of the last keypress. The word stays on screen indefinitely;
  // only the *next* keypress after a long pause starts a fresh string
  // (Alice often types, admires it for a while, then starts over).
  const lastKeyAt = useRef(0)
  const [now, setNow] = useState(0)

  useEffect(() => {
    const handler = (e) => {
      const t = Date.now()
      const idle = t - lastKeyAt.current
      lastKeyAt.current = t
      setNow(t)

      // After a long pause, a fresh letter clears the old word first.
      const expired = idle >= IDLE_RESET_MS

      if (e.key === 'Escape' || e.key === 'Enter') {
        setKey('')
      } else if (e.key === ' ') {
        setKey((prev) => {
          const base = expired ? '' : prev
          return base.includes(' ') || base === '' ? base : base + ' '
        })
      } else if (e.key === 'Backspace') {
        setKey((prev) => (expired ? '' : prev).slice(0, -1))
      } else if (/^[a-z0-9]$/i.test(e.key)) {
        setKey((prev) => (expired ? '' : prev) + e.key.toUpperCase())
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Tick a few times a second while a word is on screen, so the
  // reset-countdown progress bar animates. Idle (no word) = no timer.
  useEffect(() => {
    if (!key) return
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [key])

  // Countdown bar stays hidden for the first half of the idle window, then
  // appears "full" at the halfway mark and depletes over the second half.
  const elapsed = now - lastKeyAt.current
  const fraction = elapsed / IDLE_RESET_MS          // 0 -> 1 across the window
  const barActive = key && fraction >= 0.5
  // Remap [0.5, 1] -> [1, 0] so the bar reads full at the halfway point.
  const resetRemaining = barActive ? Math.max(0, 1 - (fraction - 0.5) / 0.5) : 0

  const words = key.split(' ').filter(Boolean)
  const colorWord = words.find(w => isCssColor(w))
  const shapeWord = words.find(w => shapeMap[w.toLowerCase()])
  const shapeName = shapeWord ? shapeWord.toLowerCase() : (key.includes(' ') ? null : key.toLowerCase())

  const twoWords = words.length >= 2
  const bg = twoWords && colorWord
    ? `color-mix(in srgb, ${colorWord} 12%, #111)`
    : colorWord ? colorWord : '#111'
  const shapeColor = twoWords && colorWord ? colorWord : null
  const Shape = shapeName ? shapeMap[shapeName] : null

  const isAlice = key.toLowerCase() === 'alice'

  // Chime once when a typed word resolves to a shape (or "alice") — the
  // reward moment. Only fires on the off->on transition, not every keystroke.
  const rewardActive = Boolean(Shape || isAlice)
  const wasRewardActive = useRef(false)
  useEffect(() => {
    if (rewardActive && !wasRewardActive.current) playChime()
    wasRewardActive.current = rewardActive
  }, [rewardActive])

  const bgShapes = useMemo(() => {
    if (!Shape && !isAlice) return []
    const names = isAlice ? Object.keys(shapeMap) : [shapeName]
    return Array.from({ length: 16 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 7 + Math.random() * 16,
      rotation: Math.random() * 360,
      opacity: 0.5 + Math.random() * 0.4,
      color: shapeColor || `hsl(${Math.random() * 360}, 90%, 65%)`,
      shapeName: names[i % names.length],
    }))
  }, [shapeName, isAlice, shapeColor])

  const charCount = key.replace(' ', '').length
  const fontSize = charCount <= 1 ? '90vmin' : `${Math.floor(90 / key.length)}vw`

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100vw',
      height: '100vh',
      margin: 0,
      background: bg,
      transition: 'background 1s ease-in',
      overflow: 'hidden',
    }}>
      {/* Subtle countdown bar: stays hidden while she's engaged, then fades
          in at the halfway point and depletes over the back half of the
          idle window — a gentle cue that the next keypress will start fresh. */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '6px',
        width: `${resetRemaining * 100}%`,
        background: shapeColor || (colorWord ? '#fff' : 'rgba(255,255,255,0.6)'),
        opacity: barActive ? 0.55 : 0,
        borderRadius: '0 3px 3px 0',
        transition: 'width 0.12s linear, opacity 0.6s ease',
        pointerEvents: 'none',
        zIndex: 2,
      }} />
      {bgShapes.map((sh, i) => {
        const BgShape = shapeMap[sh.shapeName]
        return (
          <svg
            key={i}
            viewBox="0 0 1000 1000"
            className="bg-shape"
            style={{
              position: 'absolute',
              left: `${sh.x}%`,
              top: `${sh.y}%`,
              width: `${sh.size}vmin`,
              height: `${sh.size}vmin`,
              transform: `translate(-50%, -50%) rotate(${sh.rotation}deg)`,
              fill: shapeColor ? sh.color : 'none',
              stroke: shapeColor ? 'none' : sh.color,
              strokeWidth: 45,
              '--sh-opacity': sh.opacity,
              pointerEvents: 'none',
            }}
          >
            <BgShape />
          </svg>
        )
      })}
      <span style={{
        position: 'relative',
        zIndex: 1,
        fontSize,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: '#fff',
        lineHeight: 1,
        userSelect: 'none',
        WebkitTextStroke: '2px black',
        whiteSpace: 'nowrap',
      }}>
        {key}
      </span>
    </div>
  )
}
