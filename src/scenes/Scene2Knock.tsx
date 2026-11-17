import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SceneShell } from '../components/SceneShell'
import { Reveal } from '../components/Reveal'

type Props = { onComplete: () => void }

function AnimatedDoor() {
  const reduce = useReducedMotion()
  return (
    <div className="door-stage" aria-hidden="true">
      <div className="knock-ring" />
      <svg className="door-svg" viewBox="0 0 260 320">
        <defs>
          <linearGradient id="doorWood" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5a1d31" />
            <stop offset="52%" stopColor="#3a1020" />
            <stop offset="100%" stopColor="#200a13" />
          </linearGradient>
          <linearGradient id="frameGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0d9a8" />
            <stop offset="50%" stopColor="#b98b43" />
            <stop offset="100%" stopColor="#6f4d21" />
          </linearGradient>
          <radialGradient id="knobGlow">
            <stop offset="0%" stopColor="#fff3d3" />
            <stop offset="100%" stopColor="#a47b39" />
          </radialGradient>
        </defs>
        <rect x="20" y="8" width="220" height="304" rx="10" fill="#12060b" stroke="url(#frameGold)" strokeWidth="3" />
        <motion.g
          animate={reduce ? undefined : { x: [0, -4, 4, -2, 2, 0] }}
          transition={{ duration: 0.42, repeat: Infinity, repeatDelay: 2.1, ease: 'easeInOut' }}
        >
          <rect x="42" y="28" width="176" height="264" rx="5" fill="url(#doorWood)" stroke="#7d3349" strokeWidth="1.5" />
          <rect x="60" y="48" width="140" height="98" rx="4" fill="none" stroke="rgba(240,217,168,0.32)" strokeWidth="2" />
          <rect x="60" y="162" width="140" height="108" rx="4" fill="none" stroke="rgba(240,217,168,0.22)" strokeWidth="2" />
          <path d="M78 88h104M78 208h104" stroke="rgba(240,217,168,0.12)" strokeWidth="1" />
          <circle cx="188" cy="168" r="8" fill="url(#knobGlow)" />
          <circle cx="188" cy="168" r="13" fill="none" stroke="rgba(240,217,168,0.28)" strokeWidth="1" />
          <rect x="42" y="286" width="176" height="6" fill="rgba(240,217,168,0.32)" />
        </motion.g>
      </svg>
    </div>
  )
}

export function Scene2Knock({ onComplete }: Props) {
  const [stage, setStage] = useState(0)
  const [away, setAway] = useState(false)

  useEffect(() => {
    const first = setTimeout(() => setStage(1), 3200)
    const second = setTimeout(() => setStage(2), 7000)
    return () => {
      clearTimeout(first)
      clearTimeout(second)
    }
  }, [])

  return (
    <SceneShell sceneKey="knock" tone="dark">
      <AnimatePresence mode="wait">
        {!away ? (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="stack stack--wide"
          >
            <AnimatePresence mode="wait">
              {stage === 0 ? (
                <motion.p
                  key="heard"
                  className="display display--small"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.7 }}
                >
                  Wait a second... did you hear that?
                </motion.p>
              ) : null}
              {stage === 1 ? (
                <motion.p
                  key="knocking"
                  className="display display--small"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.7 }}
                >
                  Someone is knocking at your door.
                </motion.p>
              ) : null}
              {stage >= 2 ? (
                <motion.div
                  key="message"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="stack stack--tight"
                >
                  <p className="body-copy">
                    My Pinnacle, I think someone has come looking for you. Go and open the door. Don&apos;t keep your
                    visitor waiting. <span className="heart-inline">❤️</span>
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatedDoor />

            {stage >= 2 ? (
              <Reveal>
                <button type="button" className="btn btn--primary" onClick={() => setAway(true)}>
                  I&apos;ll Be Right Back
                </button>
              </Reveal>
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            key="away"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="stack"
          >
            <p className="display display--small">No rush, sweetheart. Some moments are worth stepping away from a screen for.</p>
            <div className="divider" aria-hidden="true" />
            <p className="body-copy">
              You&apos;re back! I hope you found something waiting for you. Now, come closer. We still have a little story
              to finish.
            </p>
            <button type="button" className="btn btn--primary" onClick={onComplete}>
              I&apos;m Back <span className="heart-inline">❤️</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneShell>
  )
}
