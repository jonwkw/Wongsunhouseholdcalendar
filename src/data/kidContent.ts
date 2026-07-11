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

// Primary 1 level Chinese: everyday characters/words with pinyin,
// a simple Chinese explanation for the audio, and a short sentence.
export interface ChineseWordOfDay {
  hanzi: string
  pinyin: string
  meaning: string
  meaningZh: string
  sentence: string
}

export const CHINESE_WORDS: ChineseWordOfDay[] = [
  { hanzi: '水', pinyin: 'shuǐ', meaning: 'water', meaningZh: '我们每天都要喝的东西', sentence: '我口渴了，要喝水。' },
  { hanzi: '大', pinyin: 'dà', meaning: 'big', meaningZh: '很大很大，不是小的', sentence: '大象很大。' },
  { hanzi: '小', pinyin: 'xiǎo', meaning: 'small', meaningZh: '很小很小，不是大的', sentence: '小鸟很小。' },
  { hanzi: '山', pinyin: 'shān', meaning: 'mountain', meaningZh: '很高很高的地方', sentence: '我们去爬山。' },
  { hanzi: '人', pinyin: 'rén', meaning: 'person', meaningZh: '你、我、他都是人', sentence: '公园里有很多人。' },
  { hanzi: '手', pinyin: 'shǒu', meaning: 'hand', meaningZh: '我们用来拿东西的', sentence: '吃饭前要洗手。' },
  { hanzi: '口', pinyin: 'kǒu', meaning: 'mouth', meaningZh: '我们用来吃饭和说话的', sentence: '张开口，啊——' },
  { hanzi: '上', pinyin: 'shàng', meaning: 'up / above', meaningZh: '在高的地方', sentence: '小猫在桌子上。' },
  { hanzi: '下', pinyin: 'xià', meaning: 'down / below', meaningZh: '在低的地方', sentence: '皮球在椅子下。' },
  { hanzi: '天', pinyin: 'tiān', meaning: 'sky / day', meaningZh: '抬头看到的地方', sentence: '今天天很蓝。' },
  { hanzi: '月', pinyin: 'yuè', meaning: 'moon / month', meaningZh: '晚上挂在天上的', sentence: '晚上的月亮很亮。' },
  { hanzi: '日', pinyin: 'rì', meaning: 'sun / day', meaningZh: '白天挂在天上的太阳', sentence: '生日快乐！' },
  { hanzi: '火', pinyin: 'huǒ', meaning: 'fire', meaningZh: '很烫很烫，会发光的', sentence: '火很烫，不可以摸。' },
  { hanzi: '门', pinyin: 'mén', meaning: 'door', meaningZh: '进出房间要经过的', sentence: '请帮我开门。' },
  { hanzi: '开心', pinyin: 'kāi xīn', meaning: 'happy', meaningZh: '心里很快乐，想笑', sentence: '今天我很开心。' },
  { hanzi: '朋友', pinyin: 'péng yǒu', meaning: 'friend', meaningZh: '喜欢和你一起玩的人', sentence: '他是我的好朋友。' },
  { hanzi: '学校', pinyin: 'xué xiào', meaning: 'school', meaningZh: '我们去上课的地方', sentence: '我喜欢去学校。' },
  { hanzi: '老师', pinyin: 'lǎo shī', meaning: 'teacher', meaningZh: '在学校教我们的人', sentence: '老师教我们写字。' },
  { hanzi: '吃', pinyin: 'chī', meaning: 'to eat', meaningZh: '把东西放进嘴里', sentence: '我们一起吃饭。' },
  { hanzi: '喝', pinyin: 'hē', meaning: 'to drink', meaningZh: '把水喝进肚子里', sentence: '弟弟在喝牛奶。' },
  { hanzi: '看', pinyin: 'kàn', meaning: 'to look', meaningZh: '用眼睛去看东西', sentence: '我在看书。' },
  { hanzi: '听', pinyin: 'tīng', meaning: 'to listen', meaningZh: '用耳朵去听声音', sentence: '请认真听老师说话。' },
  { hanzi: '说', pinyin: 'shuō', meaning: 'to speak', meaningZh: '用嘴巴讲话', sentence: '妹妹会说很多话了。' },
  { hanzi: '走', pinyin: 'zǒu', meaning: 'to walk', meaningZh: '用脚一步一步地移动', sentence: '我们慢慢走。' },
  { hanzi: '跑', pinyin: 'pǎo', meaning: 'to run', meaningZh: '走得很快很快', sentence: '他跑得真快！' },
  { hanzi: '笑', pinyin: 'xiào', meaning: 'to laugh / smile', meaningZh: '开心的时候脸上的样子', sentence: '宝宝笑了。' },
  { hanzi: '红色', pinyin: 'hóng sè', meaning: 'red', meaningZh: '苹果和草莓的颜色', sentence: '我的书包是红色的。' },
  { hanzi: '妈妈', pinyin: 'mā ma', meaning: 'mummy', meaningZh: '最爱你的家人', sentence: '妈妈抱着我。' },
  { hanzi: '爸爸', pinyin: 'bà ba', meaning: 'daddy', meaningZh: '最爱你的家人', sentence: '爸爸带我去公园。' },
  { hanzi: '家', pinyin: 'jiā', meaning: 'home / family', meaningZh: '我们一起住的地方', sentence: '我爱我的家。' },
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


export const MISSIONS_ZH: string[] = [
  '晚餐后谢谢做饭的人 🍽️',
  '今天帮忙摆一次餐具 🥢',
  '画你最喜欢的动物给大家看 🎨',
  '教弟弟一个新词 🗣️',
  '睡前收好5个玩具 🧸',
  '做10个开合跳——大声数出来！⭐',
  '在家里找出3样红色的东西 🔴',
  '给家里每个人一个大大的拥抱 🤗',
  '今天帮忙浇一盆植物 🪴',
  '笑眯眯地跟外婆说早安 🌞',
  '数一数家里有多少把椅子 🪑',
  '编一个友善小龙的故事 🐉',
  '把你的名字写3遍 ✏️',
  '帮忙叠一件衣服 👕',
  '找出3样以字母S开头的东西 🔎',
  '问问爸爸或妈妈今天过得怎么样，认真听 👂',
  '今天和别人分享一样你的东西 💛',
  '给家人唱你最喜欢的歌 🎤',
  '尝一口没吃过的食物 🥦',
  '从20倒数到0 🔢',
  '晚餐时说一件感恩的事 🙏',
]

export interface MathProblem {
  question: string
  questionZh: string
  answer: string
  /** Kid-friendly spoken walkthrough for the audio explainer */
  explain: string
  explainZh: string
}

function dayOfYear(d: Date): number {
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000)
}

/** Same date → same problem, everywhere. Six rotating formats, numbers up to
 * 20 (a notch harder than before but still Primary 1 friendly).
 * `extra` deals out bonus problems beyond the daily one ("another one!"). */
export function mathProblemFor(d: Date, extra = 0): MathProblem {
  const n = dayOfYear(d) + extra * 5
  const day = d.getDate() + extra
  const countUp = (from: number, steps: number) =>
    Array.from({ length: steps }, (_, i) => from + i + 1).join(', ')
  const countDown = (from: number, steps: number) =>
    Array.from({ length: steps }, (_, i) => from - i - 1).join(', ')

  const kind = n % 6
  if (kind === 0) {
    // addition within 20
    const a = (n % 9) + 6 // 6..14
    const b = Math.min((day % 6) + 3, 20 - a) // 3..8, capped at 20
    return {
      question: `What is ${a} + ${b}?`,
      questionZh: `${a} + ${b} 等于多少？`,
      answer: String(a + b),
      explain: `Let's solve ${a} plus ${b} together! Start at ${a} and count up ${b} more: ${countUp(a, b)}. That's it — ${a} plus ${b} is ${a + b}! Great job!`,
      explainZh: `我们一起算 ${a} 加 ${b}！从 ${a} 开始往上数 ${b} 个：${countUp(a, b)}。所以 ${a} 加 ${b} 等于 ${a + b}！你真棒！`,
    }
  }
  if (kind === 1) {
    // subtraction from the teens
    const a = (n % 8) + 11 // 11..18
    const b = (day % 6) + 3 // 3..8
    return {
      question: `What is ${a} − ${b}?`,
      questionZh: `${a} − ${b} 等于多少？`,
      answer: String(a - b),
      explain: `Let's solve ${a} take away ${b}! Start at ${a} and count down ${b} steps: ${countDown(a, b)}. So ${a} take away ${b} is ${a - b}! You did it!`,
      explainZh: `我们来算 ${a} 减 ${b}！从 ${a} 开始往下数 ${b} 个：${countDown(a, b)}。所以 ${a} 减 ${b} 等于 ${a - b}！做得好！`,
    }
  }
  if (kind === 2) {
    // skip counting from a non-zero start
    const step = [2, 5, 10][n % 3]
    const start = step * ((n % 2) + 1)
    return {
      question: `Count on: ${start}, ${start + step}, ${start + 2 * step}, … what comes next?`,
      questionZh: `接着数：${start}、${start + step}、${start + 2 * step}……下一个是多少？`,
      answer: String(start + 3 * step),
      explain: `We are counting in jumps of ${step}! Every number is ${step} more than the one before. After ${start + 2 * step}, jump ${step} more, and you land on ${start + 3 * step}!`,
      explainZh: `我们在按 ${step} 跳着数！每个数都比前一个多 ${step}。${start + 2 * step} 之后再跳 ${step}，就是 ${start + 3 * step}！`,
    }
  }
  if (kind === 3) {
    // missing number: a + ▢ = c
    const a = (n % 7) + 4 // 4..10
    const miss = (day % 5) + 3 // 3..7
    const c = a + miss
    return {
      question: `Find the missing number: ${a} + ▢ = ${c}`,
      questionZh: `找一找缺少的数字：${a} + ▢ = ${c}`,
      answer: String(miss),
      explain: `Something plus ${a} makes ${c}. Count up from ${a} until you reach ${c}: ${countUp(a, miss)}. You counted ${miss} steps — so the missing number is ${miss}!`,
      explainZh: `${a} 加上多少等于 ${c}？从 ${a} 往上数到 ${c}：${countUp(a, miss)}。一共数了 ${miss} 步——缺少的数字就是 ${miss}！`,
    }
  }
  if (kind === 4) {
    // three-number addition
    const a = (n % 5) + 3 // 3..7
    const b = (day % 4) + 2 // 2..5
    const c = ((n + day) % 4) + 2 // 2..5
    return {
      question: `What is ${a} + ${b} + ${c}?`,
      questionZh: `${a} + ${b} + ${c} 等于多少？`,
      answer: String(a + b + c),
      explain: `Three numbers! First do ${a} plus ${b}, which is ${a + b}. Then add ${c} more: ${countUp(a + b, c)}. So the answer is ${a + b + c}! Super!`,
      explainZh: `三个数！先算 ${a} 加 ${b}，等于 ${a + b}。再加 ${c}：${countUp(a + b, c)}。答案就是 ${a + b + c}！太棒了！`,
    }
  }
  // sticker word problem, bigger numbers
  const a = (n % 7) + 7 // 7..13
  const b = (day % 5) + 3 // 3..7
  return {
    question: `You have ${a} stickers. Papa gives you ${b} more. How many stickers do you have now?`,
    questionZh: `你有 ${a} 张贴纸，爸爸再给你 ${b} 张。现在一共有多少张？`,
    answer: String(a + b),
    explain: `You start with ${a} stickers. Papa gives you ${b} more, so count up from ${a}: ${countUp(a, b)}. Now you have ${a + b} stickers! Hooray!`,
    explainZh: `你先有 ${a} 张贴纸，爸爸再给你 ${b} 张，从 ${a} 往上数：${countUp(a, b)}。现在一共有 ${a + b} 张！好耶！`,
  }
}

export function wordFor(d: Date, extra = 0): WordOfDay {
  return WORDS[(dayOfYear(d) + extra) % WORDS.length]
}

export function cnWordFor(d: Date, extra = 0): ChineseWordOfDay {
  return CHINESE_WORDS[(dayOfYear(d) + extra) % CHINESE_WORDS.length]
}

export function missionFor(d: Date, lang: 'en' | 'zh' = 'en', extra = 0): string {
  const i = (dayOfYear(d) + extra) % MISSIONS.length
  return lang === 'zh' ? MISSIONS_ZH[i] ?? MISSIONS[i] : MISSIONS[i]
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
