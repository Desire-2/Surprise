import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SceneShell } from '../components/SceneShell'
import { Reveal } from '../components/Reveal'
import { Icon } from '../components/Icon'
import { getSpeechRecognition, type SpeechController } from '../lib/speech'

const CHOICES = [
  'The man behind that familiar voice.',
  'His presence, even in the quietest moments.',
  'The little things only we understand.',
  'Being close enough to forget the distance.',
  'Everything about my Owner.',
]

type Props = { onContinue: () => void }

export function Scene4Question({ onContinue }: Props) {
  const [stage, setStage] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [choice, setChoice] = useState('')
  const [feeling, setFeeling] = useState('')
  const [wish, setWish] = useState('')
  const [listening, setListening] = useState(false)
  const [speechError, setSpeechError] = useState('')
  const recognitionRef = useRef<SpeechController | null>(null)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1200),
      setTimeout(() => setStage(2), 2700),
      setTimeout(() => setStage(3), 4400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => () => recognitionRef.current?.abort(), [])

  useEffect(() => {
    if (!submitted) return
    const timer = setTimeout(onContinue, 4200)
    return () => clearTimeout(timer)
  }, [submitted, onContinue])

  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const Recognition = getSpeechRecognition()
    if (!Recognition) {
      setSpeechError('Microphone unavailable — type instead.')
      return
    }
    try {
      const recognition = new Recognition()
      recognition.lang = 'en-US'
      recognition.interimResults = true
      recognition.continuous = false
      recognition.onresult = (event) => {
        const transcript = Array.from({ length: event.results.length }, (_, i) => event.results[i][0].transcript)
          .join(' ')
          .trim()
        setFeeling(transcript)
      }
      recognition.onerror = () => {
        setSpeechError('Microphone unavailable — type instead.')
        setListening(false)
      }
      recognition.onend = () => setListening(false)
      recognitionRef.current = recognition
      recognition.start()
      setSpeechError('')
      setListening(true)
    } catch {
      setSpeechError('Microphone unavailable — type instead.')
      setListening(false)
    }
  }

  return (
    <SceneShell sceneKey="question" tone="warm">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="acknowledged"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="stack"
          >
            <p className="final-verse">
              I wish you could see how beautiful it is to have someone whose heart still has so much to say. Thank you
              for letting me hear a little of yours.
            </p>
          </motion.div>
        ) : stage < 3 ? (
          <motion.div
            key="lead-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6 }}
            className="stack"
          >
            {stage >= 1 ? (
              <Reveal>
                <h2 className="display display--small">Can I ask you something?</h2>
              </Reveal>
            ) : null}
            {stage >= 2 ? (
              <Reveal delay={0.15}>
                <p className="question">My Pinnacle, do you ever miss your man?</p>
              </Reveal>
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            key="conversation"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="stack"
            style={{ gap: 'var(--s5)' }}
          >
            <div className="stack stack--tight">
              <p className="question">My Pinnacle, do you ever miss your man?</p>
              <p className="body-copy">
                I don&apos;t mean only the big moments. I mean the little things: the random conversations, the familiar
                voice, the unexpected laughter, the silly moments, and even the ordinary silence that somehow feels
                different when we&apos;re together.
              </p>
              <p className="soft-copy">When your thoughts find their way to me, what does your heart miss the most?</p>
            </div>

            <div className="stack stack--tight" style={{ width: '100%' }}>
              <div className="choice-list">
                {CHOICES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`choice-chip${choice === item ? ' choice-chip--selected' : ''}`}
                    aria-pressed={choice === item}
                    onClick={() => setChoice(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="feeling-input">
                If you could whisper one thing into your man&apos;s ears right now, what would it be?
              </label>
              <textarea
                id="feeling-input"
                className="textarea"
                value={feeling}
                onChange={(event) => setFeeling(event.target.value)}
                placeholder="Tell your Him what your heart is holding..."
              />
              <div className="mic-row">
                <button
                  type="button"
                  className={`mic-button${listening ? ' mic-button--listening' : ''}`}
                  onClick={toggleMic}
                  aria-label={listening ? 'Stop speaking' : 'Speak your answer'}
                  aria-pressed={listening}
                >
                  <Icon name="mic" size={20} />
                </button>
                <span className="visually-hidden" role="status">
                  {listening ? 'Listening' : speechError}
                </span>
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="wish-input">
                And if life gave you one wish for us, something you would genuinely want our future to hold, what would
                you wish for?
              </label>
              <textarea
                id="wish-input"
                className="textarea"
                value={wish}
                onChange={(event) => setWish(event.target.value)}
                placeholder="Write your little wish here..."
              />
            </div>

            <button type="button" className="btn btn--primary" onClick={() => setSubmitted(true)}>
              My Heart Has Spoken <span className="heart-inline">❤️</span>
              <Icon name="arrow" size={17} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneShell>
  )
}
