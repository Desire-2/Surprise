import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SceneShell } from '../components/SceneShell'
import { Reveal } from '../components/Reveal'
import { Icon } from '../components/Icon'

type Props = {
  phoneNumber: string
  phoneWasSet: boolean
  onReplay: () => void
}

export function Scene7Call({ phoneNumber, phoneWasSet, onReplay }: Props) {
  const [stage, setStage] = useState(0)
  const [showMissing, setShowMissing] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1700),
      setTimeout(() => setStage(2), 3600),
      setTimeout(() => setStage(3), 5600),
      setTimeout(() => setStage(4), 7400),
      setTimeout(() => setStage(5), 9600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const telHref = phoneNumber ? `tel:${phoneNumber.replace(/[^\d+]/g, '')}` : ''

  return (
    <SceneShell sceneKey="call" tone="warm">
      <div className="stack stack--wide">
        <Reveal>
          <h2 className="display display--small">One last thing, My Pinnacle...</h2>
        </Reveal>

        {stage >= 1 ? (
          <Reveal>
            <p className="body-copy">
              We&apos;ve reached the end of this little experience, but I hope you know that this is not where our story
              ends.
            </p>
          </Reveal>
        ) : null}

        {stage >= 2 ? (
          <Reveal>
            <p className="body-copy">
              I wanted to give you a moment you could see, hear, and feel. But there is one thing I still want more than
              anything this screen can offer.
            </p>
          </Reveal>
        ) : null}

        {stage >= 3 ? (
          <Reveal>
            <p className="pause-line">I want to hear you.</p>
          </Reveal>
        ) : null}

        {stage >= 4 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="stack"
          >
            <p className="body-copy">
              Not through typed words. Not through a little recording. I want the real you, your voice, your laughter,
              your stories, and everything you still want to tell your man.
            </p>
            <p className="body-copy">
              So, My Pinnacle, your Owner is waiting. Call me. Let&apos;s make this anniversary ours, beyond the screen.
            </p>
            <div className="divider" aria-hidden="true" />
            <p className="script">CALL YOUR OWNER ❤️</p>
            <p className="soft-copy">A real conversation is waiting.</p>

            {telHref ? (
              <a className="btn btn--call" href={telHref} aria-label="Call your owner">
                <Icon name="phone" size={20} />
                CALL YOUR OWNER <span className="heart-inline">❤️</span>
              </a>
            ) : (
              <div className="stack stack--tight">
                <button type="button" className="btn btn--call" onClick={() => setShowMissing(true)} aria-label="Call your owner">
                  <Icon name="phone" size={20} />
                  CALL YOUR OWNER <span className="heart-inline">❤️</span>
                </button>
                {(showMissing || !phoneWasSet) && (
                  <p className="audio-blocked">Add his number in the setup studio.</p>
                )}
              </div>
            )}
          </motion.div>
        ) : null}

        <AnimatePresence>
          {stage >= 5 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9 }}
              className="stack stack--tight"
            >
              <p className="body-copy">
                And if there is one thing I want you to carry beyond today, it is this:
              </p>
              <p className="final-verse">
                18/11 is not special simply because it exists on a calendar. It is special because it reminds me of a
                person I would still choose, even if I were given the chance to write the beginning again.
              </p>
              <p className="final-verse">Still you. Still us.</p>
              <p className="signature">
                With all my heart,
                <br />
                Your Him. <span className="heart-inline">❤️</span>
              </p>
              <button type="button" className="btn btn--quiet" onClick={onReplay} aria-label="Replay the experience">
                <Icon name="replay" size={16} />
                You can revisit this little world whenever you want to remember 18/11.
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </SceneShell>
  )
}
