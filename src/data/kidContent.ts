// Daily learning content for a 6-year-old, picked deterministically by date
// so the whole family sees the same "today" content on any device.

export interface WordOfDay {
  word: string
  phonetic: string
  meaning: string
  sentence: string
}

export const WORDS: WordOfDay[] = [
  { word: 'brave', phonetic: 'BRAYV', meaning: 'not afraid to try something hard', sentence: 'The brave boy jumped into the pool.' },
  { word: 'curious', phonetic: 'KYOOR-ee-us', meaning: 'wanting to find out about things', sentence: 'The curious cat looked inside the box.' },
  { word: 'gentle', phonetic: 'JEN-tul', meaning: 'soft and careful', sentence: 'Be gentle when you pat the puppy.' },
  { word: 'enormous', phonetic: 'ih-NOR-mus', meaning: 'very, very big', sentence: 'The elephant is enormous!' },
  { word: 'tiny', phonetic: 'TY-nee', meaning: 'very, very small', sentence: 'An ant is tiny next to your shoe.' },
  { word: 'delicious', phonetic: 'dih-LISH-us', meaning: 'tastes really good', sentence: 'The chicken rice was delicious.' },
  { word: 'sparkle', phonetic: 'SPAR-kul', meaning: 'to shine with little flashes of light', sentence: 'The stars sparkle at night.' },
  { word: 'whisper', phonetic: 'WISS-per', meaning: 'to speak very softly', sentence: 'Please whisper — the baby is sleeping.' },
  { word: 'giggle', phonetic: 'GIG-ul', meaning: 'to laugh in a silly way', sentence: 'The joke made everyone giggle.' },
  { word: 'explore', phonetic: 'ex-PLOR', meaning: 'to look around a new place', sentence: 'We will explore the park today.' },
  { word: 'imagine', phonetic: 'ih-MAJ-in', meaning: 'to make a picture in your mind', sentence: 'Imagine you can fly like a bird!' },
  { word: 'kindness', phonetic: 'KIND-ness', meaning: 'being nice and helpful to others', sentence: 'Sharing your toys shows kindness.' },
  { word: 'patient', phonetic: 'PAY-shunt', meaning: 'able to wait calmly', sentence: 'Be patient — dinner is almost ready.' },
  { word: 'proud', phonetic: 'PROWD', meaning: 'feeling happy about something you did', sentence: 'I am proud of my drawing.' },
  { word: 'cozy', phonetic: 'KOH-zee', meaning: 'warm and comfortable', sentence: 'My bed is warm and cozy.' },
  { word: 'gloomy', phonetic: 'GLOO-mee', meaning: 'dark and a little sad', sentence: 'The sky looks gloomy before it rains.' },
  { word: 'cheerful', phonetic: 'CHEER-ful', meaning: 'happy and smiling', sentence: 'Grandma is always cheerful in the morning.' },
  { word: 'honest', phonetic: 'ON-est', meaning: 'telling the truth', sentence: 'An honest person does not tell lies.' },
  { word: 'shiver', phonetic: 'SHIV-er', meaning: 'to shake because you are cold', sentence: 'The cold aircon made me shiver.' },
  { word: 'stomp', phonetic: 'STOMP', meaning: 'to walk with big loud steps', sentence: 'The dinosaur stomps through the forest.' },
  { word: 'zoom', phonetic: 'ZOOM', meaning: 'to move very fast', sentence: 'The race car zooms around the track.' },
  { word: 'drift', phonetic: 'DRIFT', meaning: 'to float along slowly', sentence: 'The leaf drifts down the river.' },
  { word: 'soar', phonetic: 'SOR', meaning: 'to fly very high', sentence: 'Eagles soar above the mountains.' },
  { word: 'wobble', phonetic: 'WOB-ul', meaning: 'to shake from side to side', sentence: 'The jelly wobbles on the plate.' },
  { word: 'munch', phonetic: 'MUNCH', meaning: 'to chew food with big bites', sentence: 'Rabbits munch on carrots.' },
  { word: 'snooze', phonetic: 'SNOOZ', meaning: 'a short little sleep', sentence: 'The cat had a snooze in the sun.' },
  { word: 'gather', phonetic: 'GATH-er', meaning: 'to collect things together', sentence: 'We gather our toys before dinner.' },
  { word: 'rescue', phonetic: 'RESS-kyoo', meaning: 'to save someone from danger', sentence: 'The firefighter rescued the kitten.' },
  { word: 'invent', phonetic: 'in-VENT', meaning: 'to make something brand new', sentence: 'I want to invent a robot helper.' },
  { word: 'discover', phonetic: 'diss-KUV-er', meaning: 'to find something for the first time', sentence: 'We discovered a bird nest in the tree.' },
  { word: 'protect', phonetic: 'pruh-TEKT', meaning: 'to keep someone safe', sentence: 'An umbrella protects you from the rain.' },
  { word: 'celebrate', phonetic: 'SEL-uh-brayt', meaning: 'to do something fun for a special day', sentence: 'We celebrate birthdays with cake.' },
  { word: 'wonder', phonetic: 'WUN-der', meaning: 'to ask yourself about something', sentence: 'I wonder how planes stay in the sky.' },
  { word: 'speedy', phonetic: 'SPEE-dee', meaning: 'very quick', sentence: 'The speedy cheetah wins the race.' },
  { word: 'mighty', phonetic: 'MY-tee', meaning: 'very strong', sentence: 'The mighty lion has a loud roar.' },
  { word: 'twinkle', phonetic: 'TWINK-ul', meaning: 'to shine on and off like a star', sentence: 'Twinkle, twinkle, little star.' },
  { word: 'grumpy', phonetic: 'GRUM-pee', meaning: 'in a bad mood', sentence: 'I feel grumpy when I am tired.' },
  { word: 'splendid', phonetic: 'SPLEN-did', meaning: 'really wonderful', sentence: 'What a splendid day for the playground!' },
  { word: 'gigantic', phonetic: 'jy-GAN-tik', meaning: 'super duper big', sentence: 'The whale is gigantic.' },
  { word: 'polite', phonetic: 'puh-LYT', meaning: 'saying please and thank you', sentence: 'It is polite to say thank you to Auntie.' },
]

export const MISSIONS: string[] = [
  'Say thank you to whoever cooked your dinner tonight 🍽️',
  'Help set the table for one meal today 🥢',
  'Draw your favourite animal and show the family 🎨',
  'Teach your little brother one new word 🗣️',
  'Tidy up 5 toys before bedtime 🧸',
  'Do 10 star jumps — count them out loud! ⭐',
  'Find 3 things in the house that are red 🔴',
  'Give everyone in the family one big hug 🤗',
  'Help water a plant today 🪴',
  'Say good morning to Waipo with a big smile 🌞',
  'Count how many chairs are in your home 🪑',
  'Make up a short story about a friendly dragon 🐉',
  'Practise writing your name 3 times ✏️',
  'Help fold one piece of laundry 👕',
  'Find 3 things that start with the letter S 🔎',
  'Ask Papa or Mama about their day and listen carefully 👂',
  'Share something of yours with someone today 💛',
  'Sing your favourite song for the family 🎤',
  'Try one bite of a food you have never tried 🥦',
  'Count backwards from 20 to 0 🔢',
  'Say one thing you are thankful for at dinner 🙏',
]

export interface MathProblem {
  question: string
  answer: string
}

function dayOfYear(d: Date): number {
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000)
}

/** Same date → same problem, everywhere. Sums stay within 20 for a 6-year-old. */
export function mathProblemFor(d: Date): MathProblem {
  const n = dayOfYear(d)
  const day = d.getDate()
  const kind = n % 4
  if (kind === 0) {
    const a = (n % 4) + 2
    const b = (day % 4) + 1
    return { question: `What is ${a} + ${b}?`, answer: String(a + b) }
  }
  if (kind === 1) {
    const a = (n % 5) + 5
    const b = (day % 4) + 1
    return { question: `What is ${a} − ${b}?`, answer: String(a - b) }
  }
  if (kind === 2) {
    const step = [2, 10][n % 2]
    const start = step
    return {
      question: `Count on: ${start}, ${start + step}, ${start + 2 * step}, … what comes next?`,
      answer: String(start + 3 * step),
    }
  }
  const a = (n % 4) + 2
  const b = (day % 3) + 1
  return {
    question: `You have ${a} stickers. Papa gives you ${b} more. How many stickers do you have now?`,
    answer: String(a + b),
  }
}

export function wordFor(d: Date): WordOfDay {
  return WORDS[dayOfYear(d) % WORDS.length]
}

export function missionFor(d: Date): string {
  return MISSIONS[dayOfYear(d) % MISSIONS.length]
}

/** 10 increasingly cool rockets — a new one unlocks after every launch */
export interface Rocket {
  art: string
  name: string
}

export const ROCKETS: Rocket[] = [
  { art: '🚀', name: 'Little Zoomer' },
  { art: '🚀💨', name: 'Speedy Comet' },
  { art: '🔥🚀', name: 'Blaze Runner' },
  { art: '⚡🚀⚡', name: 'Thunder Bolt' },
  { art: '🌈🚀', name: 'Rainbow Racer' },
  { art: '💎🚀💎', name: 'Diamond Dart' },
  { art: '🌟🚀🌟', name: 'Star Chaser' },
  { art: '🛸🚀🛸', name: 'Galaxy Glider' },
  { art: '🌌🚀🌌', name: 'Nebula Knight' },
  { art: '👑🚀👑', name: 'Golden Emperor' },
]

export function rocketFor(launches: number): { rocket: Rocket; level: number } {
  const level = Math.min(launches, ROCKETS.length - 1)
  return { rocket: ROCKETS[level], level }
}
