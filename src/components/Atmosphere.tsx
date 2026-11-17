import { useMemo, type CSSProperties } from 'react'
import { useReducedMotion } from 'framer-motion'

type ParticleData = {
  x: number
  size: number
  duration: number
  delay: number
  drift: number
  heart: boolean
}

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453
  return value - Math.floor(value)
}

export function Atmosphere() {
  const reduce = useReducedMotion()

  const particles = useMemo<ParticleData[]>(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        x: seeded(i, 1) * 100,
        size: 2 + seeded(i, 2) * 3,
        duration: 15 + seeded(i, 3) * 16,
        delay: seeded(i, 4) * -28,
        drift: (seeded(i, 5) - 0.5) * 90,
        heart: i % 7 === 3,
      })),
    [],
  )

  return (
    <>
      <div className="app-backdrop" aria-hidden="true" />
      <div className="backdrop-glow" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="particles" aria-hidden="true">
        {particles.map((particle, i) => (
          <span
            key={i}
            className={`particle${particle.heart ? ' particle--heart' : ''}`}
            style={
              {
                '--x': `${particle.x}%`,
                '--size': `${particle.size}px`,
                '--duration': reduce ? '0ms' : `${particle.duration}s`,
                '--delay': `${particle.delay}s`,
                '--drift': `${particle.drift}px`,
              } as CSSProperties
            }
          >
            {particle.heart ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 20.5S3.8 15.4 3.8 9.4A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.2 2.8c0 6-8.2 11.1-8.2 11.1Z" />
              </svg>
            ) : null}
          </span>
        ))}
      </div>
    </>
  )
}
