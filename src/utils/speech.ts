// Read text aloud with the browser's built-in speech synthesis (no network needed).
export function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.rate = 0.88
  u.pitch = 1.1
  const voices = window.speechSynthesis.getVoices()
  const en = voices.find((v) => v.lang.startsWith('en') && /female|Samantha|Google US/i.test(v.name)) ||
    voices.find((v) => v.lang.startsWith('en'))
  if (en) u.voice = en
  window.speechSynthesis.speak(u)
}
