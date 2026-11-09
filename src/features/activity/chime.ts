// A short two-note chime made in the browser, so there is no audio file to ship.

const LAST_CHIME_KEY = "adbox-activity-last-chime"
/** One chime per burst, across every open AdBox tab. */
const QUIET_MS = 2_000
/** Long enough for both notes to finish. */
const CHIME_MS = 900

let context: AudioContext | null = null
let idleTimer: ReturnType<typeof setTimeout> | undefined

/**
 * Made on the first chime, never earlier: creating it starts the audio device, which
 * stalls the page for a moment. Browsers let it play once the admin has interacted
 * with the page (any click or key press since it loaded); before that it stays
 * silent and the toast and badge still show.
 */
function audioContext() {
  if (context) return context
  const Context = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Context) return null
  context = new Context()
  return context
}

function claimChime(now: number) {
  try {
    const last = Number(window.localStorage.getItem(LAST_CHIME_KEY) ?? 0)
    if (now - last < QUIET_MS) return false
    window.localStorage.setItem(LAST_CHIME_KEY, String(now))
  } catch {
    // Storage blocked: chime anyway; at worst two tabs both play it.
  }
  return true
}

function note(audio: AudioContext, frequency: number, start: number, volume: number) {
  const oscillator = audio.createOscillator()
  const gain = audio.createGain()
  oscillator.type = "sine"
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6)
  oscillator.connect(gain).connect(audio.destination)
  oscillator.start(start)
  oscillator.stop(start + 0.65)
}

/** Plays the chime unless another tab just did. `force` skips that check (the test button). */
export function playChime({ force = false }: { force?: boolean } = {}) {
  if (!force && !claimChime(Date.now())) return
  const audio = audioContext()
  if (!audio) return
  void audio.resume().catch(() => undefined)
  const start = audio.currentTime + 0.01
  note(audio, 880, start, 0.18)
  note(audio, 1318.5, start + 0.14, 0.14)
  // Let the audio device rest between chimes.
  clearTimeout(idleTimer)
  idleTimer = setTimeout(() => void audio.suspend().catch(() => undefined), CHIME_MS)
}
