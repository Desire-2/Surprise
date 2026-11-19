import { useCallback, useEffect, useRef, useState } from 'react'

type Props = {
  src: string | null
  enabled: boolean
  volume?: number
  fadeMs?: number
}

/**
 * One persistent audio element for the whole story. It is mounted outside the
 * scene list, so moving between scenes never stops or restarts it. It loops
 * itself at the end, and scenes with their own music or voice simply fade it
 * down and pause it; it resumes from the same position afterwards.
 */
export function BackgroundMusic({ src, enabled, volume = 0.3, fadeMs = 1400 }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const rafRef = useRef(0)
  const stateRef = useRef({ src, enabled })
  stateRef.current = { src, enabled }
  // Try to start on its own a few seconds after the page is ready. Browsers
  // that require a gesture will reject that attempt, so taps/keypresses remain
  // as a retry path below.
  const [autoReady, setAutoReady] = useState(false)
  // Browsers refuse to start sound without a user gesture. Every tap/keypress
  // retries the play, so a blocked first attempt can succeed on the next one.
  const [gestures, setGestures] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAutoReady(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  const animateVolume = useCallback(
    (target: number, onDone?: () => void) => {
      const audio = audioRef.current
      if (!audio) return
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      const from = audio.volume
      if (fadeMs <= 0 || Math.abs(target - from) < 0.005) {
        audio.volume = target
        onDone?.()
        return
      }
      const started = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - started) / fadeMs))
        audio.volume = Math.min(1, Math.max(0, from + (target - from) * (1 - Math.pow(1 - t, 3))))
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step)
        } else {
          rafRef.current = 0
          onDone?.()
        }
      }
      rafRef.current = requestAnimationFrame(step)
    },
    [fadeMs],
  )

  useEffect(() => {
    // Call play() inside the gesture itself: some mobile browsers only grant
    // audio permission while the event is being handled.
    const onGesture = () => {
      const { src: currentSrc, enabled: isEnabled } = stateRef.current
      if (currentSrc && isEnabled) void audioRef.current?.play().catch(() => {})
      setGestures((count) => count + 1)
    }
    window.addEventListener('pointerdown', onGesture, { passive: true })
    window.addEventListener('touchstart', onGesture, { passive: true })
    window.addEventListener('click', onGesture)
    window.addEventListener('keydown', onGesture)
    return () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('touchstart', onGesture)
      window.removeEventListener('click', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    let cancelled = false
    const shouldPlay = Boolean(src) && enabled && (autoReady || gestures > 0)
    if (!shouldPlay) {
      animateVolume(0, () => {
        if (!audio.paused) audio.pause()
      })
    } else {
      const result = audio.play()
      if (result && typeof result.then === 'function') {
        // Only fade in once the browser confirms playback; otherwise a blocked
        // autoplay would raise the slider to full on a silent element.
        result
          .then(() => {
            if (!cancelled) animateVolume(volume)
          })
          .catch(() => {
            if (!cancelled) animateVolume(0)
          })
      } else {
        animateVolume(volume)
      }
    }
    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [src, enabled, autoReady, gestures, volume, animateVolume])

  return (
    <audio
      ref={audioRef}
      src={src ?? undefined}
      loop
      preload="auto"
      onEnded={(event) => {
        // `loop` handles normal repeats; this keeps the music going on browsers
        // that still report an ended event for a looping element.
        const audio = event.currentTarget
        audio.currentTime = 0
        if (enabled) void audio.play().catch(() => {})
      }}
    />
  )
}
