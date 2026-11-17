import { useMemo, type CSSProperties } from 'react'

type WaveformProps = {
  playing: boolean
  progress: number
  variant?: 'music' | 'voice'
  bars?: number
}

export function Waveform({ playing, progress, variant = 'music', bars = 56 }: WaveformProps) {
  const heights = useMemo(
    () =>
      Array.from({ length: bars }, (_, i) => {
        const wave = Math.abs(Math.sin((i + 1) * 0.62))
        const detail = Math.abs(Math.cos((i + 1) * (variant === 'voice' ? 1.73 : 0.29)))
        const swell = 0.72 + Math.sin(i / bars * Math.PI) * 0.28
        return Math.round((18 + (wave * 0.58 + detail * 0.42) * 76) * swell)
      }),
    [bars, variant],
  )

  return (
    <div className="waveform" aria-hidden="true">
      {heights.map((height, i) => (
        <span
          key={i}
          className={[
            'wave-bar',
            i / bars <= progress ? 'wave-bar--active' : '',
            playing ? 'wave-bar--playing' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ height: `${height}%`, '--delay': `${(i % 11) * 0.085}s` } as CSSProperties}
        />
      ))}
    </div>
  )
}
