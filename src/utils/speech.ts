// Read text aloud with the browser's built-in speech synthesis (no network needed).

const PREFERRED_EN = [
  'Google UK English Female', 'Google US English', 'Samantha', 'Karen', 'Moira',
  'Microsoft Aria', 'Microsoft Jenny', 'Daniel',
]

function pickVoice(lang: 'en' | 'zh'): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  if (lang === 'zh') {
    return (
      voices.find((v) => v.lang.startsWith('zh') && /Google|Natural|Tingting|Meijia/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith('zh'))
    )
  }
  for (const name of PREFERRED_EN) {
    const v = voices.find((x) => x.name.includes(name))
    if (v) return v
  }
  return (
    voices.find((v) => v.lang.startsWith('en') && /Natural|Enhanced|Premium/i.test(v.name)) ||
    voices.find((v) => v.lang.startsWith('en'))
  )
}

export function speak(text: string, lang: 'en' | 'zh' = 'en') {
  if (!('speechSynthesis' in window)) return
  const doSpeak = () => {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang === 'zh' ? 'zh-CN' : 'en-US'
    u.rate = 0.95
    u.pitch = 1.05
    const v = pickVoice(lang)
    if (v) u.voice = v
    window.speechSynthesis.speak(u)
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
