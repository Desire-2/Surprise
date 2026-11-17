import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SceneShell } from '../components/SceneShell'
import { Reveal } from '../components/Reveal'
import { AudioPlayer } from '../components/AudioPlayer'

type Props = {
  src: string | null
  onContinue: () => void
}

export function Scene5Voice({ src, onContinue }: Props) {
  const [stage, setStage] = useState(0)
  const [finished, setFinished] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 2800),
      setTimeout(() => setStage(2), 6000),
      setTimeout(() => setStage(3), 9500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // The closing message normally waits for the recording to end (onEnded). These
  // timers only guarantee she is never left without a way forward: a phone that
  // never starts the recording, or a pause she never comes back from.
  useEffect(() => {
    if (stage < 3 || !src) return
    const delay = !hasPlayed ? 30000 : playing ? 0 : 45000
    if (delay === 0) return
    const timer = setTimeout(() => setFinished(true), delay)
    return () => clearTimeout(timer)
  }, [stage, src, hasPlayed, playing])

  useEffect(() => {
    if (stage < 3 || src) return
    const timer = setTimeout(() => setFinished(true), 3000)
    return () => clearTimeout(timer)
  }, [stage, src])

  return (
    <SceneShell sceneKey="voice" tone="warm">
      <div className="voice-stage">
        <div className="spotlight" aria-hidden="true" />
        <AnimatePresence mode="wait">
          {stage < 3 ? (
            <motion.div
              key="lead-in"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.7 }}
              className="stack"
            >
              {stage >= 1 ? (
                <Reveal>
                  <h2 className="display display--small">Now, let me speak...</h2>
                </Reveal>
              ) : null}
              {stage >= 2 ? (
                <Reveal delay={0.15}>
                  <p className="body-copy">
                    You&apos;ve listened to a melody. You&apos;ve shared what lives inside your heart. But there is
                    something I have kept for this particular moment.
                  </p>
                </Reveal>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key="recording"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="stack"
            >
              <p className="body-copy">
                A screen can carry my words, but it cannot carry the warmth of my voice. So I decided to leave you
                something more personal.
              </p>
              <p className="soft-copy">
                For a moment, forget that you&apos;re listening to a recording. Imagine I&apos;m sitting right beside
                you, looking into your eyes, saying every word myself.
              </p>

              <div className="stack stack--tight">
                <p className="audio-title">A Voice From Your Man</p>
                <p className="audio-subtitle">Recorded with love. Meant only for you.</p>
              </div>

              <AudioPlayer
                src={src}
                playLabel="▶ Play My Heart"
                variant="voice"
                fadeInMs={500}
                onEnded={() => setFinished(true)}
                onPlayingChange={(isPlaying) => {
                  setPlaying(isPlaying)
                  if (isPlaying) setHasPlayed(true)
                }}
              />

              <AnimatePresence>
                {finished ? (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="stack stack--tight"
                  >
                    <p className="body-copy">
                      Those were not just words I wanted you to hear. They were little pieces of what I carry in my
                      heart.
                    </p>
                    <p className="final-verse">
                      If I could choose one thing, it would be to keep giving us reasons to look back at our story and
                      smile.
                    </p>
                    <button type="button" className="btn btn--primary" onClick={onContinue}>
                      I Heard You, Him <span className="heart-inline">❤️</span>
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneShell>
  )
}
