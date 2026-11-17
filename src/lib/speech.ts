type SpeechResultLike = { 0: { transcript: string }; isFinal: boolean }
type SpeechEventLike = {
  resultIndex: number
  results: { length: number; [index: number]: SpeechResultLike }
}
type SpeechErrorEventLike = { error: string }

export type SpeechController = {
  start: () => void
  stop: () => void
  abort: () => void
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechEventLike) => void) | null
  onerror: ((event: SpeechErrorEventLike) => void) | null
  onend: (() => void) | null
}

type SpeechConstructor = new () => SpeechController

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechConstructor
  webkitSpeechRecognition?: SpeechConstructor
}

export function getSpeechRecognition(): SpeechConstructor | null {
  if (typeof window === 'undefined') return null
  const speechWindow = window as SpeechWindow
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null
}
