// A parametric rocket that gets cooler with every launch level (0–9):
// richer colours, more windows, bigger fins, boosters, wings, sparkles, and a crown.

interface RocketTheme {
  body: string
  body2: string
  nose: string
  fin: string
  flame: string
  windows: number
  boosters: boolean
  wings: boolean
  sparkles: boolean
  crown: boolean
  glow: string
}

const THEMES: RocketTheme[] = [
  { body: '#c9ced6', body2: '#aab1bc', nose: '#d95d5d', fin: '#d95d5d', flame: '#ffb347', windows: 1, boosters: false, wings: false, sparkles: false, crown: false, glow: 'rgba(255,255,255,0.25)' },
  { body: '#9fd0e8', body2: '#7ab6d4', nose: '#3b82c4', fin: '#3b82c4', flame: '#ffb347', windows: 1, boosters: false, wings: false, sparkles: false, crown: false, glow: 'rgba(122,182,212,0.4)' },
  { body: '#ffb27a', body2: '#e08a2e', nose: '#c0504d', fin: '#c0504d', flame: '#ff6b35', windows: 2, boosters: false, wings: false, sparkles: false, crown: false, glow: 'rgba(255,140,60,0.45)' },
  { body: '#ffe27a', body2: '#e3b93e', nose: '#e08a2e', fin: '#e08a2e', flame: '#ff6b35', windows: 2, boosters: false, wings: false, sparkles: true, crown: false, glow: 'rgba(255,220,90,0.5)' },
  { body: '#a9e8c8', body2: '#5fc493', nose: '#2f9e77', fin: '#2f9e77', flame: '#7ae0ff', windows: 2, boosters: true, wings: false, sparkles: false, crown: false, glow: 'rgba(95,196,147,0.5)' },
  { body: '#b9c8f8', body2: '#7f96e8', nose: '#4a5fc4', fin: '#4a5fc4', flame: '#7ae0ff', windows: 3, boosters: true, wings: false, sparkles: true, crown: false, glow: 'rgba(127,150,232,0.55)' },
  { body: '#e6c2f0', body2: '#bd83d4', nose: '#8a3fb0', fin: '#8a3fb0', flame: '#ff8ae0', windows: 3, boosters: true, wings: true, sparkles: true, crown: false, glow: 'rgba(189,131,212,0.6)' },
  { body: '#ffc2d4', body2: '#f08bad', nose: '#d4477f', fin: '#d4477f', flame: '#ffd76e', windows: 3, boosters: true, wings: true, sparkles: true, crown: false, glow: 'rgba(240,139,173,0.65)' },
  { body: '#8ff0ea', body2: '#3ecfc4', nose: '#0e9c92', fin: '#0e9c92', flame: '#c3f558', windows: 4, boosters: true, wings: true, sparkles: true, crown: false, glow: 'rgba(62,207,196,0.7)' },
  { body: '#ffe08a', body2: '#f0b535', nose: '#d98f1b', fin: '#d98f1b', flame: '#ff5c5c', windows: 4, boosters: true, wings: true, sparkles: true, crown: true, glow: 'rgba(255,200,60,0.85)' },
]

export function RocketShip({ level, size = 180, launching = false }: { level: number; size?: number; launching?: boolean }) {
  const th = THEMES[Math.max(0, Math.min(level, THEMES.length - 1))]
  const windows = Array.from({ length: th.windows }, (_, i) => 44 + i * 14)

  return (
    <svg
      viewBox="0 0 120 160"
      width={size}
      height={(size * 160) / 120}
      className={`rocket-svg ${launching ? 'takeoff' : ''}`}
      style={{ filter: `drop-shadow(0 0 14px ${th.glow})` }}
    >
      {th.sparkles && (
        <g className="rocket-sparkles" fill="#fff">
          <circle cx="18" cy="30" r="2" />
          <circle cx="102" cy="48" r="1.6" />
          <circle cx="14" cy="86" r="1.6" />
          <circle cx="106" cy="100" r="2" />
        </g>
      )}

      {/* boosters */}
      {th.boosters && (
        <g>
          <rect x="24" y="82" width="14" height="38" rx="7" fill={th.body2} />
          <rect x="82" y="82" width="14" height="38" rx="7" fill={th.body2} />
          <path className="rocket-flame small" d="M31 120 Q27 132 31 140 Q35 132 31 120Z" fill={th.flame} />
          <path className="rocket-flame small" d="M89 120 Q85 132 89 140 Q93 132 89 120Z" fill={th.flame} />
        </g>
      )}

      {/* wings */}
      {th.wings && (
        <g fill={th.fin} opacity="0.9">
          <path d="M36 66 L12 84 L18 96 L38 86 Z" />
          <path d="M84 66 L108 84 L102 96 L82 86 Z" />
        </g>
      )}

      {/* fins */}
      <path d="M38 96 L22 124 L40 116 Z" fill={th.fin} />
      <path d="M82 96 L98 124 L80 116 Z" fill={th.fin} />

      {/* body */}
      <path d="M60 6 Q86 34 84 78 Q84 112 60 122 Q36 112 36 78 Q34 34 60 6Z" fill={th.body} />
      <path d="M60 6 Q86 34 84 78 Q84 112 60 122 L60 6Z" fill={th.body2} opacity="0.45" />

      {/* nose cone */}
      <path d="M60 6 Q74 20 78 38 Q69 30 60 29 Q51 30 42 38 Q46 20 60 6Z" fill={th.nose} />

      {/* crown for the top rocket */}
      {th.crown && (
        <path d="M50 6 L54 -2 L58 5 L62 -4 L66 5 L70 -2 L72 8 Q66 3 60 3 Q54 3 48 8 Z" fill="#ffd76e" stroke="#d98f1b" strokeWidth="1.5" />
      )}

      {/* windows */}
      {windows.map((cy, i) => (
        <g key={i}>
          <circle cx="60" cy={cy} r={i === 0 ? 9 : 6.5} fill="#eaf7ff" stroke={th.nose} strokeWidth="2.5" />
          <circle cx={57.5} cy={cy - 2} r={i === 0 ? 2.6 : 1.9} fill="#fff" />
        </g>
      ))}

      {/* stripe */}
      <path d="M42 92 Q60 100 78 92 L78 98 Q60 106 42 98 Z" fill={th.nose} opacity="0.85" />

      {/* main flame */}
      <g className="rocket-flame">
        <path d="M60 122 Q48 138 60 156 Q72 138 60 122Z" fill={th.flame} />
        <path d="M60 126 Q54 138 60 148 Q66 138 60 126Z" fill="#fff2b0" />
      </g>
    </svg>
  )
}
