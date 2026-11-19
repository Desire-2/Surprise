import { useEffect, useRef, useState } from 'react'
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
  const [musicStarted, setMusicStarted] = useState(false)
  const [musicEnded, setMusicEnded] = useState(false)
  const [musicPaused, setMusicPaused] = useState(false)
  const [musicStalled, setMusicStalled] = useState(false)
  // The parent re-creates this callback on every render (idle note, transitions),
  // so it is read through a ref: otherwise the timers below would restart and the
  // revealed lines would disappear and re-animate mid-scene.
  const continueRef = useRef(onContinue)
  const advancedRef = useRef(false)
  useEffect(() => {
    continueRef.current = onContinue
  })

  useEffect(() => {
    if (!cut) return
    const timers = [
      setTimeout(() => setReveal(1), 2400),
      setTimeout(() => setReveal(2), 5500),
      setTimeout(() => setReveal(3), 9000),
      setTimeout(() => setReveal(4), 12500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [cut])

  // A fixed timer used to swap in the final scene after 32s, long before music-2
  // had finished. Now the song is allowed to play all the way to the end; only
  // its `ended` event (or a missing song) starts the move to the last scene.
  useEffect(() => {
    if (!cut || reveal < 4 || advancedRef.current) return
    if (!musicSrc || !musicEnded) return
    const timer = setTimeout(() => {
      if (advancedRef.current) return
      advancedRef.current = true
      continueRef.current()
    }, 6000)
    return () => clearTimeout(timer)
  }, [cut, reveal, musicSrc, musicEnded])

  // No song at all still needs a gentle way forward.
  useEffect(() => {
    if (!cut || reveal < 4 || musicSrc || advancedRef.current) return
    const timer = setTimeout(() => {
      if (advancedRef.current) return
      advancedRef.current = true
      continueRef.current()
    }, 3500)
    return () => clearTimeout(timer)
  }, [cut, reveal, musicSrc])

  // If autoplay is blocked or the file never starts, don't skip the song behind
  // her back. Show a way forward and let her decide when to leave instead.
  useEffect(() => {
    if (!cut || reveal < 3 || !musicSrc || musicStarted || musicEnded) return
    const timer = setTimeout(() => setMusicStalled(true), 30000)
    return () => clearTimeout(timer)
  }, [cut, reveal, musicSrc, musicStarted, musicEnded])

  // Same idea if she pauses the song herself: wait a little, then offer a way
  // out instead of trapping her in the scene forever.
  useEffect(() => {
    if (!cut || !musicPaused || musicEnded) return
    const timer = setTimeout(() => setMusicStalled(true), 15000)
    return () => clearTimeout(timer)
  }, [cut, musicPaused, musicEnded])

  const showExit = reveal >= 4 && (!musicSrc || musicEnded || musicStalled)

  const leave = () => {
    if (advancedRef.current) return
    advancedRef.current = true
    continueRef.current()
  }

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
                  <AudioPlayer
                    src={musicSrc}
                    variant="music"
                    autoPlay
                    fadeInMs={2200}
                    onEnded={() => {
                      setMusicEnded(true)
                      setReveal(4)
                    }}
                    onPlayingChange={(isPlaying) => {
                      if (isPlaying) {
                        // Pressing play again after the song ended restarts it;
                        // wait for that playback to finish too.
                        if (musicEnded) setMusicEnded(false)
                        setMusicStarted(true)
                        setMusicPaused(false)
                        setMusicStalled(false)
                      } else if (musicStarted) {
                        setMusicPaused(true)
                      }
                    }}
                  />
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
              {showExit ? (
                <Reveal>
                  <button type="button" className="btn btn--quiet" onClick={leave}>
                    {musicEnded || !musicSrc ? 'One last thing...' : "I'm ready to move on"}
                  </button>
                </Reveal>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneShell>
  )
}
