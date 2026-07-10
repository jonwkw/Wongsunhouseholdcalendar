// Read text aloud with the browser's built-in speech synthesis (no network needed).
// Voice quality is device-dependent: we rank every installed voice and pick the
// most natural one, then speak sentence-by-sentence so the rhythm sounds human
// instead of one long monotone run-on.

/** Higher score = more natural. Neural/online voices beat classic robotic ones. */
function scoreVoice(v: SpeechSynthesisVoice, lang: 'en' | 'zh'): number {
  if (!v.lang.toLowerCase().startsWith(lang)) return -1
  let s = 0
  const n = v.name
  if (/natural|neural|premium|enhanced|online/i.test(n)) s += 8
  if (/google/i.test(n)) s += 6 // Chrome's Google voices are far less robotic
  if (/siri/i.test(n)) s += 6
  if (!v.localService) s += 4 // network voices are usually the higher-quality tier
  if (lang === 'en') {
    if (/UK English Female|Samantha|Karen|Moira|Aria|Jenny|Libby|Sonia/i.test(n)) s += 5
    if (/female/i.test(n)) s += 1
    if (v.lang === 'en-GB' || v.lang === 'en-US') s += 1
  } else {
    if (/Tingting|Meijia|Xiaoxiao|Yunyang|普通话|Mandarin/i.test(n)) s += 5
    if (v.lang.toLowerCase().startsWith('zh-cn')) s += 2
  }
  return s
}

function pickVoice(lang: 'en' | 'zh'): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  let best: SpeechSynthesisVoice | undefined
  let bestScore = -1
  for (const v of voices) {
    const s = scoreVoice(v, lang)
    if (s > bestScore) {
      best = v
      bestScore = s
    }
  }
  return best
}

/** Split into sentences so each gets its own utterance (natural pauses between) */
function sentences(text: string, lang: 'en' | 'zh'): string[] {
  const parts = text
    .split(lang === 'zh' ? /(?<=[。！？；])/ : /(?<=[.!?;:])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length ? parts : [text]
}

export function speak(text: string, lang: 'en' | 'zh' = 'en') {
  if (!('speechSynthesis' in window)) return
  let spoken = false
  const doSpeak = () => {
    if (spoken) return // the voiceschanged event AND the fallback timer can both fire
    spoken = true
    window.speechSynthesis.cancel()
    const voice = pickVoice(lang)
    for (const part of sentences(text, lang)) {
      const u = new SpeechSynthesisUtterance(part)
      u.lang = lang === 'zh' ? 'zh-CN' : voice?.lang ?? 'en-US'
      u.rate = lang === 'zh' ? 0.88 : 0.92
      u.pitch = 1.04
      if (voice) u.voice = voice
      window.speechSynthesis.speak(u)
    }
  }
  // voices can load asynchronously on first use
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true })
    // some browsers never fire the event if voices are already (un)available
    setTimeout(doSpeak, 250)
  } else {
    doSpeak()
  }
}

export function stopSpeak() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}
