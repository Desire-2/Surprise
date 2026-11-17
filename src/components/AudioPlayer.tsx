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
  missingText?: string
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
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
  missingText,
}: AudioPlayerProps) {
  const reduce = useReducedMotion()
  const label = title || 'audio'
  const audioRef = useRef<HTMLAudioElement>(null)
  const targetVolumeRef = useRef(0.85)
  const rafRef = useRef(0)
  const autoStartedRef = useRef(false)
  const onEndedRef = useRef(onEnded)
  onEndedRef.current = onEnded

  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [volume, setVolume] = useState(0.85)
  const [blocked, setBlocked] = useState(false)

  const cancelFade = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
  }, [])

  const rampVolume = useCallback(
    (target: number, ms: number) => {
      cancelFade()
      const audio = audioRef.current
      if (!audio) return
      if (reduce || ms <= 0) {
        audio.volume = target
        return
      }
      const started = performance.now()
      audio.volume = 0
      const step = (now: number) => {
        const t = Math.min(1, (now - started) / ms)
        const eased = 1 - Math.pow(1 - t, 3)
        audio.volume = Math.min(1, target * eased)
        if (t < 1) rafRef.current = requestAnimationFrame(step)
        else rafRef.current = 0
      }
      rafRef.current = requestAnimationFrame(step)
    },
    [cancelFade, reduce],
  )

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      if (audio.readyState === 0) audio.load()
      audio.volume = 0
      const result = audio.play()
      if (result && typeof result.then === 'function') await result
      setBlocked(false)
      rampVolume(targetVolumeRef.current, fadeInMs)
    } catch {
      audio.pause()
      audio.volume = targetVolumeRef.current
      setBlocked(true)
    }
  }, [fadeInMs, rampVolume])

  const pause = useCallback(() => {
    cancelFade()
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.volume = targetVolumeRef.current
    }
    setPlaying(false)
  }, [cancelFade])

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
    cancelFade()
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }, [src, cancelFade])

  useEffect(() => {
    if (!src || !autoPlay || autoStartedRef.current) return
    autoStartedRef.current = true
    const timer = setTimeout(() => void play(), 280)
    return () => clearTimeout(timer)
  }, [src, autoPlay, play])

  useEffect(() => () => cancelFade(), [cancelFade])

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
                  if (audioRef.current) audioRef.current.volume = next
                }}
              />
            </label>
          </div>
          {blocked ? (
            <p className="audio-blocked">Your phone held the sound back for a moment. Press play and it will begin.</p>
          ) : null}
          <audio
            ref={audioRef}
            src={src}
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
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
