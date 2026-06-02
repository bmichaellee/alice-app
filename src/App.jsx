import { useState, useEffect, useMemo } from 'react'

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

function isCssColor(str) {
  const s = new Option().style
  s.color = str
  return s.color !== ''
}

export default function App() {
  const [key, setKey] = useState('')

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        setKey('')
      } else if (e.key === ' ') {
        setKey((prev) => prev.includes(' ') || prev === '' ? prev : prev + ' ')
      } else if (e.key === 'Backspace') {
        setKey((prev) => prev.slice(0, -1))
      } else if (/^[a-z0-9]$/i.test(e.key)) {
        setKey((prev) => prev + e.key.toUpperCase())
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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
