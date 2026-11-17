import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Atmosphere } from './components/Atmosphere'
import { Icon } from './components/Icon'
import { AssetStudio } from './components/AssetStudio'
import { useMediaLibrary } from './lib/media'
import { PHOTO_SLOTS } from './lib/slots'
import { Scene1Greeting } from './scenes/Scene1Greeting'
import { Scene2Knock } from './scenes/Scene2Knock'
import { Scene3Music } from './scenes/Scene3Music'
import { Scene4Question } from './scenes/Scene4Question'
import { Scene5Voice } from './scenes/Scene5Voice'
import { Scene6Cake } from './scenes/Scene6Cake'
import { Scene7Call } from './scenes/Scene7Call'

const SCENE_COUNT = 7

const TRANSITIONS: Record<number, string> = {
  2: "Somewhere between the melody and the memories, there's us.",
  3: 'Now, let me borrow a little honesty from your heart.',
  4: 'This next moment has my voice written all over it.',
  5: "Enough beautiful words. Let's make a beautiful memory.",
  6: "The screen has done its part. Now it's your man's turn.",
}

export default function App() {
  const [scene, setScene] = useState(0)
  const [transition, setTransition] = useState<string | null>(null)
  const [showIdle, setShowIdle] = useState(false)
  const [studioOpen, setStudioOpen] = useState(() => window.location.hash === '#studio')
  const transitionTimer = useRef(0)
  const { media, config, refreshMedia, refreshConfig } = useMediaLibrary()

  useEffect(() => {
    const onHashChange = () => setStudioOpen(window.location.hash === '#studio')
    window.addEventListener('hashchange', onHashChange)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
      clearTimeout(transitionTimer.current)
    }
  }, [])

  useEffect(() => {
    setShowIdle(false)
    let timer = setTimeout(() => setShowIdle(true), 20000)
    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setShowIdle(true), 20000)
    }
    window.addEventListener('pointerdown', reset)
    window.addEventListener('keydown', reset)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointerdown', reset)
      window.removeEventListener('keydown', reset)
    }
  }, [scene])

  const go = useCallback((next: number) => {
    const advance = () => {
      setScene(next)
      setShowIdle(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    const line = TRANSITIONS[next]
    if (!line) {
      advance()
      return
    }
    clearTimeout(transitionTimer.current)
    setTransition(line)
    transitionTimer.current = window.setTimeout(() => {
      setTransition(null)
      advance()
    }, 2600)
  }, [])

  const closeStudio = useCallback(() => {
    window.history.pushState(null, '', window.location.pathname + window.location.search)
    setStudioOpen(false)
    setScene(0)
  }, [])

  const opening = (
    <div className="app-shell">
      <Atmosphere />
      <main className="app-main">
        <div className="scene">
          <div className="scene-inner">
            <p className="script">Preparing a little piece of my heart...</p>
          </div>
        </div>
      </main>
    </div>
  )

  if (studioOpen) {
    return (
      <>
        <Atmosphere />
        <AssetStudio
          media={media}
          config={config}
          onClose={closeStudio}
          onMediaChanged={() => void refreshMedia()}
          onConfigChanged={() => void refreshConfig()}
        />
      </>
    )
  }

  if (!media) return opening

  const photos = PHOTO_SLOTS.map((slot) => media[slot]?.url).filter((url): url is string => Boolean(url))

  return (
    <div className="app-shell">
      <Atmosphere />
      <main className="app-main">
        <header className="scene-header">
          {scene > 0 ? (
            <button type="button" className="back-button" onClick={() => go(scene - 1)} aria-label="Previous moment">
              <Icon name="back" size={22} />
            </button>
          ) : (
            <span style={{ width: 44 }} aria-hidden="true" />
          )}
          <div className="progress" role="img" aria-label={`Moment ${scene + 1} of ${SCENE_COUNT}`}>
            {Array.from({ length: SCENE_COUNT }, (_, index) => (
              <span
                key={index}
                className={`progress-dot${index === scene ? ' progress-dot--current' : ''}${
                  index < scene ? ' progress-dot--done' : ''
                }`}
              />
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          {scene === 0 ? <Scene1Greeting key="greeting" onBegin={() => go(1)} /> : null}
          {scene === 1 ? <Scene2Knock key="knock" onComplete={() => go(2)} /> : null}
          {scene === 2 ? <Scene3Music key="music" src={media['music-1']?.url ?? null} onContinue={() => go(3)} /> : null}
          {scene === 3 ? <Scene4Question key="question" onContinue={() => go(4)} /> : null}
          {scene === 4 ? <Scene5Voice key="voice" src={media.voice?.url ?? null} onContinue={() => go(5)} /> : null}
          {scene === 5 ? (
            <Scene6Cake key="cake" musicSrc={media['music-2']?.url ?? null} photos={photos} onContinue={() => go(6)} />
          ) : null}
          {scene === 6 ? (
            <Scene7Call
              key="call"
              phoneNumber={config.phoneNumber}
              phoneWasSet={config.phoneWasSet}
              onReplay={() => go(0)}
            />
          ) : null}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {transition ? (
          <motion.div
            className="transition-veil"
            role="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.p
              className="script"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
            >
              {transition}
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showIdle && !transition ? (
          <motion.p
            className="idle-note"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            Take your time, My Pinnacle. This moment isn&apos;t going anywhere.
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
