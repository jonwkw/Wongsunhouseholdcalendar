import type { AvatarSpec, AvatarAge, Member } from '../types'

// Parametric SVG avatars. Everything is drawn in a 100×100 viewBox and
// composed from option lists indexed by AvatarSpec.

export const SKIN_TONES = ['#ffe3c8', '#f6d0a7', '#eebe8e', '#dcae7e', '#c78f5f']

export const HAIR_COLORS = [
  '#26211e', '#453128', '#6b4a33', '#8c8f93', '#e8e6e2',
  '#a14f2b', '#d9a94a', '#d97fb0', '#5b7fd4', '#8b64c4',
] as const

export const SHIRT_COLORS = [
  '#d95d5d', '#e08a2e', '#e3b93e', '#2f9e77', '#4a9ba8', '#3b82c4', '#8a6bbf', '#c45b9d',
] as const

export const GLASSES = ['none', 'round', 'square', 'sunglasses'] as const
export const ACCESSORIES = ['none', 'bow', 'flower', 'cap', 'crown', 'headband', 'star', 'partyhat', 'beanie', 'flowercrown', 'headphones', 'tiara'] as const
export const EARRINGS = ['none', 'studs', 'hoops'] as const

export const AGES: { key: AvatarAge; emoji: string }[] = [
  { key: 'baby', emoji: '👶' },
  { key: 'toddler', emoji: '🧒' },
  { key: 'kid', emoji: '🧒' },
  { key: 'adult', emoji: '🧑' },
  { key: 'grandparent', emoji: '🧓' },
]

export const FACIAL_HAIR = ['none', 'mustache', 'goatee', 'beard', 'stubble'] as const

interface AgeGeo {
  ry: number // face vertical radius
  eye: number // eye radius
  cheeks: boolean
  wrinkles: boolean
}

const AGE_GEO: Record<AvatarAge, AgeGeo> = {
  baby: { ry: 25.5, eye: 3.4, cheeks: true, wrinkles: false },
  toddler: { ry: 26, eye: 3.1, cheeks: true, wrinkles: false },
  kid: { ry: 26, eye: 2.8, cheeks: false, wrinkles: false },
  adult: { ry: 27, eye: 2.5, cheeks: false, wrinkles: false },
  grandparent: { ry: 27, eye: 2.5, cheeks: false, wrinkles: true },
}

export const HAIRSTYLE_NAMES = [
  'Bald', 'Buzz cut', 'Short & neat', 'Side part', 'Spiky', 'Bowl cut', 'Short curls',
  'Big curls', 'Bob', 'Long straight', 'Ponytail', 'Pigtails', 'Top bun', 'Double buns',
  'Long braid', 'Fringe & long', 'Wavy', 'Mohawk', 'Comb-over', 'Baby tuft',
  'Man bun', 'Flat top', 'Twin braids', 'Hairband', 'Shaggy', 'Long curly', 'Swept fringe', 'Low pigtails',
  'Light buzz', 'Light buzz (widow\'s peak)',
]

/** Hair drawn behind the face (long styles) — returns SVG elements */
function hairBack(style: number, c: string) {
  switch (style) {
    case 8: // bob
      return <path d="M22 50 Q20 84 32 84 L68 84 Q80 84 78 50 Q78 24 50 24 Q22 24 22 50Z" fill={c} />
    case 9: // long straight
      return <path d="M22 48 Q18 92 30 92 L70 92 Q82 92 78 48 Q78 22 50 22 Q22 22 22 48Z" fill={c} />
    case 14: // long braid
      return (
        <g fill={c}>
          <path d="M24 48 Q22 30 50 24 Q78 30 76 48 Z" />
          <circle cx="76" cy="56" r="6" />
          <circle cx="78" cy="67" r="5.5" />
          <circle cx="79" cy="77" r="5" />
          <circle cx="80" cy="86" r="4.5" />
        </g>
      )
    case 15: // fringe & long
      return <path d="M23 48 Q19 90 31 90 L69 90 Q81 90 77 48 Q77 22 50 22 Q23 22 23 48Z" fill={c} />
    case 16: // wavy
      return (
        <path
          d="M22 46 Q16 70 24 88 Q30 78 28 66 Q34 84 40 90 Q40 76 38 66 Q50 84 62 90 Q60 76 60 66 Q68 84 76 88 Q84 70 78 46 Q76 22 50 22 Q24 22 22 46Z"
          fill={c}
        />
      )
    case 10: // ponytail (tail behind)
      return (
        <g fill={c}>
          <circle cx="76" cy="34" r="7" />
          <path d="M76 34 Q86 52 78 70 Q73 68 72 52 Q72 42 76 34Z" />
        </g>
      )
    case 11: // pigtails
      return (
        <g fill={c}>
          <circle cx="20" cy="46" r="8" />
          <circle cx="80" cy="46" r="8" />
          <path d="M20 46 Q14 62 20 74 Q26 70 24 56Z" />
          <path d="M80 46 Q86 62 80 74 Q74 70 76 56Z" />
        </g>
      )
    case 22: // twin braids (behind, both sides)
      return (
        <g fill={c}>
          <path d="M24 48 Q22 30 50 24 Q78 30 76 48 Z" />
          <circle cx="24" cy="56" r="5.5" />
          <circle cx="23" cy="66" r="5" />
          <circle cx="22" cy="75" r="4.5" />
          <circle cx="76" cy="56" r="5.5" />
          <circle cx="77" cy="66" r="5" />
          <circle cx="78" cy="75" r="4.5" />
        </g>
      )
    case 24: // shaggy
      return (
        <path
          d="M22 46 Q18 66 22 76 L30 68 L34 78 L42 68 L50 80 L58 68 L66 78 L70 68 L78 76 Q82 66 78 46 Q76 22 50 22 Q24 22 22 46Z"
          fill={c}
        />
      )
    case 25: // long curly
      return (
        <g fill={c}>
          <path d="M24 46 Q20 26 50 22 Q80 26 76 46Z" />
          <circle cx="24" cy="52" r="8" />
          <circle cx="21" cy="64" r="8" />
          <circle cx="24" cy="76" r="8" />
          <circle cx="76" cy="52" r="8" />
          <circle cx="79" cy="64" r="8" />
          <circle cx="76" cy="76" r="8" />
        </g>
      )
    case 27: // low pigtails
      return (
        <g fill={c}>
          <path d="M24 48 Q22 28 50 23 Q78 28 76 48Z" />
          <circle cx="24" cy="70" r="7" />
          <circle cx="76" cy="70" r="7" />
          <path d="M24 70 Q20 82 26 88 Q30 82 28 74Z" />
          <path d="M76 70 Q80 82 74 88 Q70 82 72 74Z" />
        </g>
      )
    default:
      return null
  }
}

/** Hair drawn over the face (caps, bangs, buns) */
function hairFront(style: number, c: string) {
  switch (style) {
    case 0: // bald
      return null
    case 1: // buzz
      return <path d="M27 42 Q28 22 50 21 Q72 22 73 42 Q72 32 50 30 Q28 32 27 42Z" fill={c} opacity="0.85" />
    case 2: // short & neat
      return <path d="M25 44 Q25 20 50 20 Q75 20 75 44 Q73 32 62 32 Q52 32 46 28 Q38 34 27 35 Q25 38 25 44Z" fill={c} />
    case 3: // side part
      return <path d="M25 44 Q24 20 52 20 Q76 22 75 46 Q74 30 58 33 Q40 36 33 32 Q27 36 25 44Z" fill={c} />
    case 4: // spiky
      return (
        <path
          d="M25 42 L28 28 L33 36 L38 22 L43 33 L50 19 L57 33 L62 22 L67 36 L72 28 L75 42 Q72 30 50 29 Q28 30 25 42Z"
          fill={c}
        />
      )
    case 5: // bowl
      return <path d="M23 48 Q23 19 50 19 Q77 19 77 48 L71 48 Q71 34 50 34 Q29 34 29 48Z" fill={c} />
    case 6: // short curls
      return (
        <g fill={c}>
          <circle cx="30" cy="36" r="8" />
          <circle cx="40" cy="29" r="8" />
          <circle cx="51" cy="27" r="8" />
          <circle cx="62" cy="29" r="8" />
          <circle cx="71" cy="36" r="8" />
        </g>
      )
    case 7: // big curls
      return (
        <g fill={c}>
          <circle cx="50" cy="27" r="15" />
          <circle cx="31" cy="35" r="11" />
          <circle cx="69" cy="35" r="11" />
          <circle cx="24" cy="48" r="8" />
          <circle cx="76" cy="48" r="8" />
        </g>
      )
    case 8: // bob bangs
    case 9: // long straight bangs
      return <path d="M26 42 Q26 21 50 21 Q74 21 74 42 Q70 30 50 30 Q30 30 26 42Z" fill={c} />
    case 10: // ponytail cap
      return <path d="M25 44 Q25 20 50 20 Q75 20 76 40 Q70 30 50 30 Q30 30 25 44Z" fill={c} />
    case 11: // pigtails cap with middle part
      return <path d="M26 42 Q26 21 50 21 Q74 21 74 42 Q70 30 52 30 L52 26 L48 26 L48 30 Q30 30 26 42Z" fill={c} />
    case 12: // top bun
      return (
        <g fill={c}>
          <circle cx="50" cy="16" r="9" />
          <path d="M26 42 Q26 21 50 21 Q74 21 74 42 Q70 30 50 30 Q30 30 26 42Z" />
        </g>
      )
    case 13: // double buns
      return (
        <g fill={c}>
          <circle cx="32" cy="19" r="8" />
          <circle cx="68" cy="19" r="8" />
          <path d="M26 42 Q26 21 50 21 Q74 21 74 42 Q70 30 50 30 Q30 30 26 42Z" />
        </g>
      )
    case 14: // braid front
    case 15: // fringe
      return <path d="M26 40 Q26 21 50 21 Q74 21 74 40 L70 40 Q70 32 50 32 Q30 32 30 40Z" fill={c} />
    case 16: // wavy bangs
      return <path d="M26 40 Q26 21 50 21 Q74 21 74 40 Q68 30 58 34 Q50 26 42 34 Q32 30 26 40Z" fill={c} />
    case 17: // mohawk
      return <path d="M44 30 L46 14 L50 26 L54 12 L56 30 Q50 26 44 30Z" fill={c} />
    case 18: // comb-over (sparse)
      return (
        <g stroke={c} strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M30 34 Q45 22 68 30" />
          <path d="M32 39 Q48 28 70 35" />
        </g>
      )
    case 19: // baby tuft
      return <path d="M48 33 Q45 21 55 18 Q49 25 54 30 Q51 34 48 33Z" fill={c} />
    case 20: // man bun
      return (
        <g fill={c}>
          <circle cx="50" cy="14" r="7" />
          <path d="M27 42 Q28 22 50 21 Q72 22 73 42 Q72 32 50 30 Q28 32 27 42Z" />
        </g>
      )
    case 21: // flat top
      return <path d="M26 40 L26 24 L74 24 L74 40 Q70 30 50 30 Q30 30 26 40Z" fill={c} />
    case 22: // twin braids cap with middle part
      return <path d="M26 42 Q26 21 50 21 Q74 21 74 42 Q70 30 52 30 L52 26 L48 26 L48 30 Q30 30 26 42Z" fill={c} />
    case 23: // hairband
      return (
        <g>
          <path d="M25 44 Q25 20 50 20 Q75 20 75 44 Q73 30 50 29 Q27 30 25 44Z" fill={c} />
          <path d="M28 34 Q50 24 72 34 L71 38 Q50 29 29 38Z" fill="#e05d7e" />
        </g>
      )
    case 24: // shaggy bangs
      return <path d="M26 42 Q26 21 50 21 Q74 21 74 42 L70 36 L64 42 L58 34 L50 42 L42 34 L36 42 L30 36 Z" fill={c} />
    case 25: // long curly bangs
      return (
        <g fill={c}>
          <circle cx="34" cy="30" r="8" />
          <circle cx="46" cy="26" r="8" />
          <circle cx="58" cy="27" r="8" />
          <circle cx="68" cy="32" r="7" />
        </g>
      )
    case 26: // swept fringe
      return <path d="M25 44 Q24 19 52 19 Q77 21 75 44 Q75 28 64 36 Q48 44 36 34 Q28 32 25 44Z" fill={c} />
    case 27: // low pigtails cap
      return <path d="M26 42 Q26 21 50 21 Q74 21 74 42 Q70 30 50 30 Q30 30 26 42Z" fill={c} />
    case 28: // light buzz
      return <path d="M27 42 Q28 22 50 21 Q72 22 73 42 Q72 32 50 30 Q28 32 27 42Z" fill={c} opacity="0.35" />
    case 29: // light buzz with widow's peak
      return (
        <g fill={c} opacity="0.35">
          <path d="M27 42 Q28 22 50 21 Q72 22 73 42 Q72 32 50 30 Q28 32 27 42Z" />
          <path d="M46 30 L50 38 L54 30 Q50 28 46 30Z" opacity="1" />
        </g>
      )
    default:
      return null
  }
}

function glassesFor(kind: number) {
  switch (kind) {
    case 1: // round
      return (
        <g stroke="#33302b" strokeWidth="2.2" fill="none">
          <circle cx="40" cy="53" r="7.5" />
          <circle cx="60" cy="53" r="7.5" />
          <path d="M47.5 53 L52.5 53" />
          <path d="M32.5 53 L27 50" />
          <path d="M67.5 53 L73 50" />
        </g>
      )
    case 2: // square
      return (
        <g stroke="#33302b" strokeWidth="2.2" fill="none">
          <rect x="33" y="47" width="14" height="12" rx="2.5" />
          <rect x="53" y="47" width="14" height="12" rx="2.5" />
          <path d="M47 53 L53 53" />
          <path d="M33 52 L27 50" />
          <path d="M67 52 L73 50" />
        </g>
      )
    case 3: // sunglasses
      return (
        <g>
          <rect x="32" y="47" width="15" height="11" rx="4" fill="#33302b" />
          <rect x="53" y="47" width="15" height="11" rx="4" fill="#33302b" />
          <path d="M47 52 L53 52 M32 51 L27 49 M68 51 L73 49" stroke="#33302b" strokeWidth="2.2" fill="none" />
        </g>
      )
    default:
      return null
  }
}

function accessoryFor(kind: number) {
  switch (kind) {
    case 1: // bow
      return (
        <g fill="#e05d7e">
          <path d="M62 24 L72 19 L72 30 Z" />
          <path d="M82 24 L72 19 L72 30 Z" transform="translate(-1 0)" />
          <circle cx="71" cy="24.5" r="3" fill="#c23a60" />
        </g>
      )
    case 2: // flower
      return (
        <g>
          <g fill="#f2a1c2">
            <circle cx="70" cy="22" r="3.4" />
            <circle cx="76" cy="24" r="3.4" />
            <circle cx="74" cy="30" r="3.4" />
            <circle cx="68" cy="28" r="3.4" />
          </g>
          <circle cx="72" cy="26" r="2.6" fill="#e3b93e" />
        </g>
      )
    case 3: // cap
      return (
        <g fill="#3b82c4">
          <path d="M28 34 Q30 14 50 14 Q70 14 72 34 Q60 26 40 26 Q32 28 28 34Z" />
          <path d="M66 30 Q84 28 88 34 Q80 38 68 36Z" opacity="0.9" />
          <circle cx="50" cy="16" r="2.6" fill="#235a92" />
        </g>
      )
    case 4: // crown
      return (
        <path d="M36 28 L40 16 L47 24 L53 13 L59 24 L66 16 L70 28 Q50 22 36 28Z" fill="#ffd76e" stroke="#d98f1b" strokeWidth="1.6" />
      )
    case 5: // headband (sporty)
      return <path d="M27 36 Q50 24 73 36 L72 41 Q50 30 28 41Z" fill="#2f9e77" />
    case 6: // star clip
      return (
        <path d="M70 20 L72 25 L77 25 L73 28.5 L74.5 33.5 L70 30.5 L65.5 33.5 L67 28.5 L63 25 L68 25 Z" fill="#e3b93e" />
      )
    case 7: // party hat
      return (
        <g>
          <path d="M50 -2 L38 26 Q50 20 62 26 Z" fill="#d4477f" />
          <path d="M44 12 L58 8" stroke="#ffd76e" strokeWidth="3" />
          <circle cx="50" cy="-2" r="4" fill="#ffd76e" />
        </g>
      )
    case 8: // beanie
      return (
        <g fill="#2f9e77">
          <path d="M26 36 Q26 12 50 12 Q74 12 74 36 Q74 30 50 28 Q26 30 26 36Z" />
          <rect x="26" y="31" width="48" height="7" rx="3.5" fill="#1c6b4e" />
          <circle cx="50" cy="10" r="4.5" fill="#a8dcc3" />
        </g>
      )
    case 9: // flower crown
      return (
        <g>
          {[32, 41, 50, 59, 68].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={26 - (i === 2 ? 3 : 0)} r="3.6" fill={i % 2 ? '#f2a1c2' : '#ffd76e'} />
              <circle cx={x} cy={26 - (i === 2 ? 3 : 0)} r="1.5" fill="#fff" />
            </g>
          ))}
        </g>
      )
    case 10: // headphones
      return (
        <g>
          <path d="M27 52 Q27 20 50 20 Q73 20 73 52" stroke="#33302b" strokeWidth="4" fill="none" />
          <rect x="22" y="48" width="9" height="14" rx="4" fill="#d4477f" />
          <rect x="69" y="48" width="9" height="14" rx="4" fill="#d4477f" />
        </g>
      )
    case 11: // tiara
      return (
        <g>
          <path d="M38 26 L42 17 L47 24 L50 13 L53 24 L58 17 L62 26 Q50 21 38 26Z" fill="#b9e2f5" stroke="#7ab6d4" strokeWidth="1.4" />
          <circle cx="50" cy="15" r="2.2" fill="#f2a1c2" />
        </g>
      )
    default:
      return null
  }
}

function earringsFor(kind: number) {
  switch (kind) {
    case 1: // studs
      return (
        <g fill="#e3b93e">
          <circle cx="25" cy="60" r="2.2" />
          <circle cx="75" cy="60" r="2.2" />
        </g>
      )
    case 2: // hoops
      return (
        <g stroke="#e3b93e" strokeWidth="2" fill="none">
          <circle cx="25" cy="63" r="3.5" />
          <circle cx="75" cy="63" r="3.5" />
        </g>
      )
    default:
      return null
  }
}

function facialHair(kind: number, c: string) {
  switch (kind) {
    case 1: // mustache
      return <path d="M40 66 Q50 61 60 66 Q55 69 50 68 Q45 69 40 66Z" fill={c} />
    case 2: // goatee
      return <ellipse cx="50" cy="79" rx="6" ry="4.5" fill={c} />
    case 3: // full beard
      return (
        <path
          d="M27 56 Q28 84 50 86 Q72 84 73 56 Q73 74 62 76 Q56 70 50 70 Q44 70 38 76 Q27 74 27 56Z"
          fill={c}
        />
      )
    case 4: // stubble
      return <path d="M30 62 Q34 80 50 82 Q66 80 70 62 Q66 74 50 76 Q34 74 30 62Z" fill={c} opacity="0.28" />
    default:
      return null
  }
}

export function AvatarSvg({ spec, ring, size = 40 }: { spec: AvatarSpec; ring?: string; size?: number }) {
  const geo = AGE_GEO[spec.age]
  const skin = SKIN_TONES[spec.skin] ?? SKIN_TONES[1]
  const hc = HAIR_COLORS[spec.hairColor] ?? HAIR_COLORS[0]
  const shirt = SHIRT_COLORS[spec.shirt ?? 5] ?? SHIRT_COLORS[5]
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="avatar-svg" style={ring ? { background: ring + '22', borderColor: ring } : undefined}>
      <g transform="matrix(0.97,0,0,1,1.5,0.5)">{hairBack(spec.hair, hc)}</g>
      {/* shirt / shoulders */}
      <path d="M18 100 Q20 82 34 79 L50 84 L66 79 Q80 82 82 100 Z" fill={shirt} />
      <path d="M43 82 L50 90 L57 82 L50 84 Z" fill="#ffffff" opacity="0.35" />
      {/* neck */}
      <rect x="44" y="74" width="12" height="9" rx="4" fill={skin} />
      {/* ears */}
      <circle cx="26.5" cy="56" r="4.6" fill={skin} />
      <circle cx="73.5" cy="56" r="4.6" fill={skin} />
      <g transform="translate(1.5 0)">{earringsFor(spec.earrings ?? 0)}</g>
      {/* face — slightly slim for a cooler look */}
      <ellipse cx="50" cy="55" rx="22.5" ry={geo.ry} fill={skin} />
      {/* eyebrows — softer for the female style */}
      <g stroke={hc} strokeWidth={spec.gender === 'female' ? 1.6 : 2.4} fill="none" strokeLinecap="round" opacity="0.85">
        <path d="M34.5 46.5 Q40 44 45.5 46.5" />
        <path d="M54.5 46.5 Q60 44 65.5 46.5" />
      </g>
      {/* eyes with highlights */}
      <circle cx="40" cy="53" r={geo.eye} fill="#33302b" />
      <circle cx="60" cy="53" r={geo.eye} fill="#33302b" />
      <circle cx={41} cy={52} r={geo.eye * 0.32} fill="#fff" />
      <circle cx={61} cy={52} r={geo.eye * 0.32} fill="#fff" />
      {spec.gender === 'female' && (
        <g stroke="#33302b" strokeWidth="1.3" strokeLinecap="round">
          <path d="M35.5 50.5 L33.5 49" />
          <path d="M36.5 49 L35 47" />
          <path d="M64.5 50.5 L66.5 49" />
          <path d="M63.5 49 L65 47" />
        </g>
      )}
      {/* nose */}
      <path d="M48 58 Q50 61 52 58" stroke="#c99a72" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* smile — a touch of colour for the female style */}
      <path d="M42 66 Q50 73 58 66" stroke={spec.gender === 'female' ? '#cf6a80' : '#8a5a3a'} strokeWidth={spec.gender === 'female' ? 3 : 2.4} fill="none" strokeLinecap="round" />
      {geo.cheeks && (
        <g fill="#f2a19b" opacity="0.55">
          <circle cx="36" cy="62" r="4.2" />
          <circle cx="64" cy="62" r="4.2" />
        </g>
      )}
      {geo.wrinkles && (
        <g stroke="#b98e63" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.7">
          <path d="M34 45 Q40 42 46 45" />
          <path d="M54 45 Q60 42 66 45" />
        </g>
      )}
      <g transform="matrix(0.95,0,0,1,2.5,0)">{facialHair(spec.facialHair, hc)}</g>
      <g transform="matrix(0.93,0,0,1,3.5,1)">{hairFront(spec.hair, hc)}</g>
      {accessoryFor(spec.accessory ?? 0)}
      {glassesFor(spec.glasses ?? 0)}
    </svg>
  )
}

/** A member's face: their designed avatar, or their emoji as a fallback */
export function MemberFace({ member, size = 32 }: { member: Member; size?: number }) {
  if (member.avatar) return <AvatarSvg spec={member.avatar} ring={member.color} size={size} />
  return (
    <span
      className="avatar"
      title={member.name}
      style={{ width: size, height: size, fontSize: size * 0.58, background: member.color + '22', borderColor: member.color }}
    >
      {member.emoji}
    </span>
  )
}

export const DEFAULT_SPEC: AvatarSpec = { age: 'adult', skin: 1, hair: 2, hairColor: 0, facialHair: 0 }
