import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'

export type BackgroundMusicHandle = {
  /** Called synchronously from the toggle click so mobile browsers accept it. */
  play: () => void
}

type Props = {
  src: string | null
  enabled: boolean
  playing: boolean
  volume?: number
  fadeMs?: number
}

/** Background sound never goes louder than 30%, however it is requested. */
const MAX_VOLUME = 0.3

/**
 * One persistent audio element for the whole story. It is mounted outside the
 * scene list, so moving between scenes never stops or restarts it. It loops
 * itself at the end, and scenes with their own music or voice simply fade it
 * down and pause it; it resumes from the same position afterwards.
 */
export const BackgroundMusic = forwardRef<BackgroundMusicHandle, Props>(function BackgroundMusic(
  { src, enabled, playing, volume = MAX_VOLUME, fadeMs = 1400 },
  ref,
) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const rafRef = useRef(0)
  const targetVolume = Math.min(volume, MAX_VOLUME)

  useImperativeHandle(
    ref,
    () => ({
      play: () => {
        if (audioRef.current) void audioRef.current.play().catch(() => {})
      },
    }),
    [],
  )

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
    const audio = audioRef.current
    if (!audio) return
    let cancelled = false
    const shouldPlay = Boolean(src) && enabled && playing
    if (!shouldPlay) {
      animateVolume(0, () => {
        if (!audio.paused) audio.pause()
      })
    } else {
      const result = audio.play()
      if (result && typeof result.then === 'function') {
        // Only fade in once the browser confirms playback; a blocked attempt
        // must never leave a silent element sitting at full volume.
        result
          .then(() => {
            if (!cancelled) animateVolume(targetVolume)
          })
          .catch(() => {
            if (!cancelled) animateVolume(0)
          })
      } else {
        animateVolume(targetVolume)
      }
    }
    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [src, enabled, playing, targetVolume, animateVolume])

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
        if (enabled && playing) void audio.play().catch(() => {})
      }}
    />
  )
})
