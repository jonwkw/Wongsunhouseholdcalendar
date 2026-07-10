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
  { name: 'Tiong Bahru Bakery Safari', emoji: '🥐', category: 'eat', area: 'Dempsey', source: 'Honeykids Asia', desc: 'Greenhouse bakery with an outdoor playground, edible garden, bunnies and chickens.' },
  { name: 'Café Melba', emoji: '🏕️', category: 'eat', area: 'Goodman Arts Centre', source: 'Sassy Mama', desc: 'Big lawn with a weekend bouncy castle; kids eat free on Mondays and Tuesdays.' },
  { name: 'Trapizza', emoji: '🍕', category: 'eat', area: 'Siloso Beach, Sentosa', source: 'Honeykids Asia', desc: 'Beachside pizza where kids build their own bentos, with a play gym steps away.' },
  { name: 'Fusion Spoon', emoji: '🥄', category: 'eat', area: 'Botanic Gardens', source: 'Little Day Out', desc: 'Indoor AND outdoor play areas, right by the Gardens — easy pre-nap lunch stop.' },
  { name: 'Canopy Garden Dining', emoji: '🌿', category: 'eat', area: 'HortPark / Changi Village / Jurong Lake', source: 'Little Day Out', desc: 'Leafy all-day dining with playgrounds beside every outlet — three locations island-wide.' },
]

/** Deterministic pick-of-the-day so every device shows the same suggestion */
export function ideaOfTheDay(d: Date): ExploreIdea {
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000)
  return EXPLORE_IDEAS[dayOfYear % EXPLORE_IDEAS.length]
}
