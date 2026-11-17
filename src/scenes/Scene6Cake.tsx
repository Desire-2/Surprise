import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SceneShell } from '../components/SceneShell'
import { Reveal } from '../components/Reveal'
import { Cake } from '../components/Cake'
import { Celebration } from '../components/Celebration'
import { AudioPlayer } from '../components/AudioPlayer'

type Props = {
  musicSrc: string | null
  photos: string[]
  onContinue: () => void
}

export function Scene6Cake({ musicSrc, photos, onContinue }: Props) {
  const [cut, setCut] = useState(false)
  const [reveal, setReveal] = useState(0)

  useEffect(() => {
    if (!cut) return
    const timers = [
      setTimeout(() => setReveal(1), 1400),
      setTimeout(() => setReveal(2), 3200),
      setTimeout(() => setReveal(3), 5200),
      setTimeout(() => setReveal(4), 6800),
      setTimeout(onContinue, 11000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [cut, onContinue])

  return (
    <SceneShell sceneKey="cake" tone="celebrate">
      <Celebration active={cut} />
      <div className="stack">
        <div className="cake-stage">
          <div className="cake-glow" aria-hidden="true" />
          <Cake cut={cut} />
        </div>

        <AnimatePresence mode="wait">
          {!cut ? (
            <motion.div
              key="before"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
              className="stack stack--tight"
            >
              <h2 className="display display--small">A little sweetness for our 18/11</h2>
              <p className="body-copy">
                Now, My Pinnacle, we&apos;ve reached the part where words give way to a little celebration.
              </p>
              <p className="soft-copy">
                I could write a thousand things about us, but today deserves something we can actually celebrate,
                something sweet enough to match the memories we&apos;ve made.
              </p>
              <p className="body-copy">
                Go ahead, cut our cake. And when you do, remember that behind this little celebration is someone who is
                genuinely grateful that your story and his story crossed paths.
              </p>
              <button type="button" className="btn btn--primary" onClick={() => setCut(true)}>
                Let Me Cut Our Cake <span className="heart-inline">🎂</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="after"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25 }}
              className="stack"
            >
              {reveal >= 1 ? (
                <Reveal>
                  <p className="final-verse">There it is! Another beautiful moment added to our story.</p>
                </Reveal>
              ) : null}
              {reveal >= 2 ? (
                <Reveal>
                  <p className="body-copy">
                    May we never become too busy to celebrate the little things, too proud to say what we feel, or too
                    distracted to appreciate what we have.
                  </p>
                </Reveal>
              ) : null}
              {reveal >= 3 ? (
                <Reveal>
                  <AudioPlayer src={musicSrc} variant="music" autoPlay fadeInMs={2200} />
                </Reveal>
              ) : null}
              {photos.length && reveal >= 3 ? (
                <div className="photo-strip" aria-label="Photographs of us">
                  {photos.slice(0, 3).map((photo, index) => (
                    <img key={photo} src={photo} alt={`A photograph of us ${index + 1}`} loading="lazy" />
                  ))}
                </div>
              ) : null}
              {reveal >= 4 ? (
                <Reveal>
                  <p className="final-verse">
                    To the memories we&apos;ve made, the lessons we&apos;ve learned, the laughter we&apos;ve shared, and
                    the chapters we haven&apos;t written yet... here&apos;s to us.
                  </p>
                </Reveal>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneShell>
  )
}
