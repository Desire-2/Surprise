import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Icon } from './Icon'
import { Waveform } from './Waveform'

type AudioPlayerProps = {
  src: string | null
  title?: string
  subtitle?: string
  playLabel?: string
  variant?: 'music' | 'voice'
  autoPlay?: boolean
  fadeInMs?: number
  onEnded?: () => void
  onPlayingChange?: (playing: boolean) => void
  missingText?: string
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const livePlayers = new Set<HTMLAudioElement>()

/**
 * Every mounted player registers its element here so a scene change can fade the
 * sound out instead of cutting it off mid-phrase.
 */
export function fadeOutActiveAudio(ms = 650) {
  livePlayers.forEach((audio) => {
    if (audio.paused || audio.volume <= 0.02) return
    const from = audio.volume
    const started = performance.now()
    let raf = 0
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      if (raf) cancelAnimationFrame(raf)
      try {
        audio.volume = 0
      } catch {
        /* some browsers lock the volume property */
      }
      try {
        audio.pause()
      } catch {
        /* already gone */
      }
    }
    const step = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - started) / ms))
      try {
        audio.volume = from * (1 - t)
      } catch {
        finish()
        return
      }
      if (t < 1) raf = requestAnimationFrame(step)
      else finish()
    }
    raf = requestAnimationFrame(step)
    window.setTimeout(finish, ms + 200)
  })
}

export function AudioPlayer({
  src,
  title,
  subtitle,
  playLabel,
  variant = 'music',
  autoPlay = false,
  fadeInMs = 2600,
  onEnded,
  onPlayingChange,
  missingText,
}: AudioPlayerProps) {
  const reduce = useReducedMotion()
  const label = title || 'audio'
  const audioRef = useRef<HTMLAudioElement>(null)
  const targetVolumeRef = useRef(0.85)
  const rafRef = useRef(0)
  const timerRef = useRef(0)
  const autoStartedRef = useRef(false)
  const onEndedRef = useRef(onEnded)
  onEndedRef.current = onEnded
  const onPlayingChangeRef = useRef(onPlayingChange)
  onPlayingChangeRef.current = onPlayingChange

  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [volume, setVolume] = useState(0.85)
  const [blocked, setBlocked] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [failed, setFailed] = useState(false)

  const applyVolume = useCallback((value: number) => {
    const audio = audioRef.current
    if (!audio) return
    // Keep the write inside [0, 1]: a negative value makes the setter throw,
    // which used to kill the fade loop and leave the sound stuck at zero.
    const clamped = Math.min(1, Math.max(0, value))
    try {
      audio.volume = clamped
    } catch {
      /* some browsers lock the volume property */
    }
  }, [])

  const cancelFade = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (timerRef.current) clearTimeout(timerRef.current)
    rafRef.current = 0
    timerRef.current = 0
  }, [])

  const finishFade = useCallback(
    (target: number) => {
      cancelFade()
      applyVolume(target)
    },
    [applyVolume, cancelFade],
  )

  const rampVolume = useCallback(
    (target: number, ms: number) => {
      cancelFade()
      const audio = audioRef.current
      if (!audio) return
      if (reduce || ms <= 0) {
        applyVolume(target)
        return
      }
      const started = performance.now()
      applyVolume(0)
      const step = (now: number) => {
        // rAF can hand back a timestamp taken before this fade started, which
        // used to push `t` below zero. Clamp both ends so volume never escapes
        // [0, 1] and the setter can never throw mid-fade.
        const t = Math.min(1, Math.max(0, (now - started) / ms))
        if (t >= 1) {
          rafRef.current = 0
          finishFade(target)
          return
        }
        applyVolume(target * (1 - Math.pow(1 - t, 3)))
        rafRef.current = requestAnimationFrame(step)
      }
      rafRef.current = requestAnimationFrame(step)
      // rAF is suspended in background tabs and when the screen sleeps; this
      // timer still lands the fade even when frames stop arriving.
      timerRef.current = window.setTimeout(() => finishFade(target), ms + 200)
    },
    [applyVolume, cancelFade, finishFade, reduce],
  )

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      setFailed(false)
      if (audio.readyState === 0 && audio.networkState === HTMLMediaElement.NETWORK_EMPTY) {
        audio.load()
      }
      applyVolume(0)
      const result = audio.play()
      if (result && typeof result.then === 'function') await result
      setBlocked(false)
      rampVolume(targetVolumeRef.current, fadeInMs)
    } catch {
      applyVolume(targetVolumeRef.current)
      setBlocked(true)
    }
  }, [applyVolume, fadeInMs, rampVolume])

  const pause = useCallback(() => {
    finishFade(targetVolumeRef.current)
    audioRef.current?.pause()
    setPlaying(false)
  }, [finishFade])

  const toggle = useCallback(() => {
    if (playing) pause()
    else void play()
  }, [pause, play, playing])

  useEffect(() => {
    autoStartedRef.current = false
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
    setBlocked(false)
    setBuffering(false)
    setFailed(false)
    cancelFade()
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      // A scene change may have faded this element down to zero; restore the
      // level the slider shows, otherwise the next play starts silent.
      applyVolume(targetVolumeRef.current)
      audio.load()
    }
  }, [src, applyVolume, cancelFade])

  useEffect(() => {
    if (!src || !autoPlay || autoStartedRef.current) return
    autoStartedRef.current = true
    const timer = setTimeout(() => void play(), 280)
    return () => clearTimeout(timer)
  }, [src, autoPlay, play])

  useEffect(() => {
    onPlayingChangeRef.current?.(playing)
  }, [playing])

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && rafRef.current) {
        finishFade(targetVolumeRef.current)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [finishFade])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) livePlayers.add(audio)
    return () => {
      if (audio) livePlayers.delete(audio)
      cancelFade()
    }
  }, [cancelFade, src])

  const progress = duration > 0 ? Math.min(1, current / duration) : 0

  if (!src && !missingText) return null

  return (
    <div className="audio-card">
      {title || subtitle ? (
        <div className="audio-card__head">
          {title ? <p className="audio-title">{title}</p> : null}
          {subtitle ? <p className="audio-subtitle">{subtitle}</p> : null}
        </div>
      ) : null}

      {src ? (
        <>
          <Waveform playing={playing} progress={progress} variant={variant} />
          <input
            className="seek"
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(current, duration || 1)}
            aria-label={`Seek through ${label}`}
            style={{ '--progress': `${progress * 100}%` } as CSSProperties}
            onChange={(event) => {
              const next = Number(event.target.value)
              if (audioRef.current) audioRef.current.currentTime = next
              setCurrent(next)
            }}
          />
          <div className="audio-controls">
            <button
              type="button"
              className={`play-button${playLabel ? ' play-button--labelled' : ''}`}
              onClick={toggle}
              aria-label={playLabel ?? `${playing ? 'Pause' : 'Play'} ${label}`}
            >
              <Icon name={playing ? 'pause' : 'play'} size={24} />
              {playLabel ? <span className="play-button__label">{playing ? 'Pause' : playLabel}</span> : null}
            </button>
            <span className="audio-time">
              {formatTime(current)} / {formatTime(duration)}
            </span>
            <label className="volume-control">
              <Icon name="volume" size={18} />
              <span className="visually-hidden">Volume for {label}</span>
              <input
                className="volume-range"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(event) => {
                  const next = Number(event.target.value)
                  cancelFade()
                  targetVolumeRef.current = next
                  setVolume(next)
                  applyVolume(next)
                }}
              />
            </label>
          </div>
          {failed ? (
            <p className="audio-blocked">
              This moment could not reach the audio.{' '}
              <button type="button" className="audio-link" onClick={() => void play()}>
                Try again
              </button>
            </p>
          ) : null}
          {buffering && playing ? (
            <p className="audio-blocked">
              {variant === 'voice' ? 'Gathering the next few words…' : 'Pouring a little more of the music…'}
            </p>
          ) : null}
          {blocked ? (
            <p className="audio-blocked">Your phone held the sound back for a moment. Press play and it will begin.</p>
          ) : null}
          <audio
            ref={audioRef}
            src={src}
            preload="auto"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onWaiting={() => setBuffering(true)}
            onStalled={() => setBuffering(true)}
            onPlaying={() => setBuffering(false)}
            onCanPlay={() => setBuffering(false)}
            onError={() => {
              setFailed(true)
              setPlaying(false)
              setBuffering(false)
            }}
            onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
            onEnded={() => {
              setPlaying(false)
              setCurrent(duration)
              onEndedRef.current?.()
            }}
          />
        </>
      ) : (
        <p className="audio-missing">{missingText}</p>
      )}
    </div>
  )
}
