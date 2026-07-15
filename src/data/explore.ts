// Curated family-friendly ideas around Singapore, gathered from Time Out,
// Sassy Mama, Honeykids Asia, Little Day Out, TheSmartLocal and BYKidO.
// Static stage-1 list — refresh it any time by editing this file.

export interface ExploreIdea {
  name: string
  emoji: string
  category: 'play' | 'nature' | 'indoor' | 'eat'
  area: string
  desc: string
  free?: boolean
  source: string
}

/** When this list was last curated from the web */
export const EXPLORE_UPDATED = '2026-07-10'

/** Live pages that publish fresh openings — the "refresh" button links here */
export const SOURCE_LINKS: { name: string; url: string; what: string }[] = [
  { name: 'Honeycombers — new cafes', url: 'https://thehoneycombers.com/singapore/new-cafes-singapore/', what: 'New cafes, updated monthly' },
  { name: 'Honeycombers — new restaurants', url: 'https://thehoneycombers.com/singapore/new-restaurants-menus-singapore/', what: 'Hot new tables and menus' },
  { name: 'HungryGoWhere — new openings', url: 'https://hungrygowhere.com/what-to-eat/new-openings-2026/', what: 'Running list of 2026 openings' },
  { name: 'DanielFoodDiary — new cafes', url: 'https://danielfooddiary.com/', what: 'Monthly new-cafe roundups' },
  { name: 'Sassy Mama — new restaurants', url: 'https://www.sassymamasg.com/eat-new-best-restaurants-singapore/', what: 'Best new family tables' },
  { name: 'Sassy Mama — kid-friendly dining', url: 'https://www.sassymamasg.com/eat-best-kid-friendly-restaurants-singapore-cafes-playgrounds-healthy/', what: 'Kid-friendly cafes with play areas' },
  { name: 'TheSmartLocal — new spots', url: 'https://thesmartlocal.com/read/restaurants-cafes-2026/', what: 'New cafes, bars and restaurants' },
  { name: 'Time Out Singapore', url: 'https://www.timeout.com/singapore', what: 'Things to do, eat and see' },
]

/** Google Maps link for a venue — always current, no stale URLs to maintain */
export function mapUrl(idea: ExploreIdea): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${idea.name} ${idea.area} Singapore`)}`
}

export const EXPLORE_IDEAS: ExploreIdea[] = [
  // ---- Playgrounds & water play ----
  { name: 'Coastal PlayGrove', emoji: '🗼', category: 'play', area: 'East Coast Park', free: true, source: 'Little Day Out', desc: "Singapore's tallest outdoor play tower (16m) with big slides, climbing nets, a nature playgarden and water play." },
  { name: "Jacob Ballas Children's Garden", emoji: '🌱', category: 'play', area: 'Botanic Gardens', free: true, source: 'Sassy Mama', desc: 'A whole garden just for kids — farm, forest stream, flying fox and water play. Closed Mondays.' },
  { name: 'COMO Adventure Grove', emoji: '🧗', category: 'play', area: 'Botanic Gardens', free: true, source: 'TheSmartLocal', desc: 'Nature-inspired climbing playground with giant tree-trunk structures next to the Gallop Extension.' },
  { name: "Far East Organization Children's Garden", emoji: '💦', category: 'play', area: 'Gardens by the Bay', free: true, source: 'Honeykids Asia', desc: 'Free water play and rainforest obstacle course for under-12s — bring a change of clothes!' },
  { name: 'Jewel Canopy Park & Discovery Slides', emoji: '✈️', category: 'play', area: 'Changi Airport', source: 'Time Out', desc: 'Indoor park in the clouds: Discovery Slides, Foggy Bowls, mazes and the Rain Vortex downstairs.' },
  { name: 'Admiralty Park Playground', emoji: '🛝', category: 'play', area: 'Woodlands', free: true, source: 'TheSmartLocal', desc: '26 slides in one park — terrain slides, tube slides and toddler-friendly ones on the hill.' },
  { name: 'Marine Cove Playground', emoji: '🚨', category: 'play', area: 'East Coast Park', free: true, source: 'Little Day Out', desc: '8m lighthouse tower playground with food options (and big lawns) right next door.' },
  { name: 'Jurong Lake Gardens — Clusia Cove & Forest Ramble', emoji: '🌊', category: 'play', area: 'Jurong', free: true, source: 'BYKidO', desc: 'Tidal-pool water play plus Forest Ramble, the largest nature playgarden in the heartlands.' },

  // ---- Outdoors & nature ----
  { name: 'Skyline Luge + Palawan Beach', emoji: '🛷', category: 'nature', area: 'Sentosa', source: 'Time Out', desc: 'Luge rides down the hill, then beach play and the suspension bridge at Palawan.' },
  { name: 'Changi Jurassic Mile', emoji: '🦖', category: 'nature', area: 'Changi', free: true, source: 'TheSmartLocal', desc: 'Cycle or walk a 1km path lined with life-sized dinosaurs connecting East Coast to Changi.' },
  { name: 'East Coast Park cycling', emoji: '🚴', category: 'nature', area: 'East Coast', free: true, source: 'Time Out', desc: 'Rent bikes (with kids seats or tandems) and ride the coast; end with a hawker dinner.' },
  { name: 'Supertree Grove — Garden Rhapsody', emoji: '🌳', category: 'nature', area: 'Gardens by the Bay', free: true, source: 'Time Out', desc: 'Free light-and-music show under the Supertrees every evening (7.45pm & 8.45pm).' },
  { name: 'Mandai — Zoo, River & Bird Paradise', emoji: '🦁', category: 'nature', area: 'Mandai', source: 'Time Out', desc: 'Pick one park per trip; the Zoo splash pad (KidzWorld) is worth the change of clothes.' },
  { name: 'Forest Adventure Kids Course', emoji: '🌲', category: 'nature', area: 'Bedok Reservoir', source: 'Honeykids Asia', desc: 'Treetop ropes course for ages 5+ with zip-lines, ladders and tunnels over the reservoir.' },

  // ---- Museums & indoor ----
  { name: 'ArtScience Museum — Future World', emoji: '🎨', category: 'indoor', area: 'Marina Bay', source: 'Time Out', desc: 'teamLab digital playground: light forests, sliding fruit fields and a crystal universe.' },
  { name: 'Science Centre + KidsSTOP', emoji: '🔬', category: 'indoor', area: 'Jurong', source: 'Sassy Mama', desc: 'Hands-on science galleries; KidsSTOP next door is built for the under-8s.' },
  { name: 'Keppel Centre for Art Education', emoji: '🖼️', category: 'indoor', area: 'National Gallery, City Hall', free: true, source: 'Little Day Out', desc: 'Free kids art space inside National Gallery with interactive installations and art trails.' },
  { name: 'Mandai Wildlife East — Exploria', emoji: '🦘', category: 'indoor', area: 'Mandai', source: 'Little Steps', desc: 'New (2026) indoor adventure world at Mandai for bigger kids — great rainy-day backup.' },
  { name: 'Singapore Air Force Museum', emoji: '🛩️', category: 'indoor', area: 'Paya Lebar', free: true, source: 'Honeykids Asia', desc: 'Reopened 2026 with real fighter jets, interactive games and a C-130-inspired playground.' },

  // ---- Eat & drink ----
  { name: "Huber's Bistro", emoji: '🥨', category: 'eat', area: 'Dempsey Hill', source: 'Sassy Mama', desc: 'Swiss bistro with a playground right next door — book near the window and let them run.' },
  { name: 'Café Melba', emoji: '🏕️', category: 'eat', area: 'Goodman Arts Centre', source: 'Sassy Mama', desc: 'Big lawn with a weekend bouncy castle; kids eat free on Mondays and Tuesdays.' },
  { name: 'Trapizza', emoji: '🍕', category: 'eat', area: 'Siloso Beach, Sentosa', source: 'Honeykids Asia', desc: 'Beachside pizza where kids build their own bentos, with a play gym steps away.' },
  { name: 'Fusion Spoon', emoji: '🥄', category: 'eat', area: 'Botanic Gardens', source: 'Little Day Out', desc: 'Indoor AND outdoor play areas, right by the Gardens — easy pre-nap lunch stop.' },
  { name: 'Canopy Garden Dining', emoji: '🌿', category: 'eat', area: 'HortPark / Changi Village / Jurong Lake', source: 'Little Day Out', desc: 'Leafy all-day dining with playgrounds beside every outlet — three locations island-wide.' },
  { name: 'Kith Café at Kiztopia', emoji: '🎪', category: 'eat', area: 'Marina Square', source: 'Sassy Mama', desc: "Proper coffee and brunch inside Singapore's largest indoor playground — eat while they play." },
  { name: 'Baker & Cook at Core Collective', emoji: '🥖', category: 'eat', area: 'Dempsey', source: 'Sassy Mama', desc: 'Bakery-cafe with a wooden treehouse playground and bouncy swings just outside.' },
  { name: 'ColBar', emoji: '🍳', category: 'eat', area: 'Portsdown', source: 'Sassy Mama', desc: 'Old-school colonial-era kopitiam with masses of open green space for kids to run wild.' },
  { name: 'Whisk & Paddle', emoji: '🛶', category: 'eat', area: 'Punggol', source: 'Little Day Out', desc: 'Riverside brunch with a free sheltered kids play area; face painting and balloons on weekends.' },
  { name: 'Wildseed Cafe at The Summerhouse', emoji: '🌻', category: 'eat', area: 'Seletar', source: 'Sassy Mama', desc: 'Garden-style cafe with a retro playground — pair it with plane-spotting at Seletar Aerospace Park.' },

]

/** Deterministic pick-of-the-day so every device shows the same suggestion */
export function ideaOfTheDay(d: Date): ExploreIdea {
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000)
  return EXPLORE_IDEAS[dayOfYear % EXPLORE_IDEAS.length]
}
