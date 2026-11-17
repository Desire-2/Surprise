import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  spin: number
  color: string
  life: number
}

const COLORS = ['#efd9a8', '#d8b36b', '#f7ede8', '#e7b7c1', '#b98b43']

export function Celebration({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!active || reduce) return
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = window.innerWidth
    let height = window.innerHeight
    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Particle[] = []
    let frame = 0
    let raf = 0
    const started = performance.now()

    const spawn = (count: number) => {
      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: width * (0.2 + Math.random() * 0.6),
          y: height * 0.44 + Math.random() * 40,
          vx: (Math.random() - 0.5) * 13,
          vy: -6 - Math.random() * 11,
          size: 4 + Math.random() * 7,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.22,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          life: 1,
        })
      }
    }

    spawn(130)
    const extraSpawns = [setTimeout(() => spawn(60), 500), setTimeout(() => spawn(45), 1100)]

    const draw = (now: number) => {
      context.clearRect(0, 0, width, height)
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i]
        p.vy += 0.22
        p.vx *= 0.995
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.spin
        p.life -= 0.0035
        if (p.life <= 0 || p.y > height + 40) {
          particles.splice(i, 1)
          continue
        }
        context.save()
        context.globalAlpha = Math.max(0, Math.min(1, p.life))
        context.translate(p.x, p.y)
        context.rotate(p.rotation)
        context.fillStyle = p.color
        context.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66)
        context.restore()
      }
      frame += 1
      const elapsed = now - started
      if (elapsed < 8000 && (particles.length > 0 || frame < 40)) {
        raf = requestAnimationFrame(draw)
      } else {
        context.clearRect(0, 0, width, height)
      }
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      extraSpawns.forEach(clearTimeout)
      window.removeEventListener('resize', resize)
    }
  }, [active, reduce])

  if (!active || reduce) return null
  return <canvas ref={canvasRef} className="celebration-canvas" aria-hidden="true" />
}
