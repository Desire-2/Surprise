import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SceneShell } from '../components/SceneShell'
import { Icon } from '../components/Icon'
import { AudioPlayer } from '../components/AudioPlayer'

type BluetoothLike = {
  requestDevice: (options: { acceptAllDevices: boolean }) => Promise<{ name?: string | null }>
}
type NavigatorWithBluetooth = Navigator & { bluetooth?: BluetoothLike }

type BtStatus = 'idle' | 'unsupported' | 'found' | 'denied' | 'error'

type Props = {
  src: string | null
  onContinue: () => void
}

export function Scene3Music({ src, onContinue }: Props) {
  const [showHelp, setShowHelp] = useState(false)
  const [ready, setReady] = useState(false)
  const [finished, setFinished] = useState(false)
  const [btStatus, setBtStatus] = useState<BtStatus>('idle')
  const [deviceName, setDeviceName] = useState('')

  useEffect(() => {
    if (!ready) return
    const timer = setTimeout(() => setFinished(true), src ? 12000 : 1200)
    return () => clearTimeout(timer)
  }, [src, ready])

  async function handleConnect() {
    setShowHelp(true)
    const bluetooth = (navigator as NavigatorWithBluetooth).bluetooth
    if (!bluetooth) {
      setBtStatus('unsupported')
      return
    }
    try {
      const device = await bluetooth.requestDevice({ acceptAllDevices: true })
      setDeviceName(device.name || 'a nearby device')
      setBtStatus('found')
    } catch (error) {
      const name = error instanceof Error ? error.name : ''
      setBtStatus(name === 'NotFoundError' ? 'denied' : 'error')
    }
  }

  function confirmConnection() {
    setReady(true)
    setShowHelp(false)
  }

  return (
    <SceneShell sceneKey="music">
      <AnimatePresence mode="wait">
        {!ready ? (
          <motion.div
            key="connect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.6 }}
            className="stack"
          >
            <Icon name="headphones" size={76} className="bluetooth-visual" />
            <div className="stack stack--tight">
              <h2 className="display display--small">A little music, a little us.</h2>
              <p className="body-copy">
                There are feelings that become difficult to explain when the heart is full. Sometimes, a melody can say
                what the lips struggle to express.
              </p>
              <p className="soft-copy">
                My Pinnacle, connect your phone to your Bluetooth speaker or headphones. I have chosen something for
                this moment.
              </p>
            </div>

            {!showHelp ? (
              <div className="stack stack--tight">
                <button type="button" className="btn btn--primary" onClick={() => void handleConnect()}>
                  Connect My Sound
                  <Icon name="bluetooth" size={17} />
                </button>
                <button type="button" className="btn btn--quiet" onClick={confirmConnection}>
                  I&apos;ll Use My Phone
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="stack"
              >
                <div className="listen-card" style={{ width: '100%' }}>
                  <p className="field-label">How to connect</p>
                  <ol className="steps">
                    <li className="step">
                      <span className="step-num">1</span>
                      <span>Open your phone&apos;s Bluetooth settings.</span>
                    </li>
                    <li className="step">
                      <span className="step-num">2</span>
                      <span>Turn Bluetooth on and choose your speaker or headphones.</span>
                    </li>
                    <li className="step">
                      <span className="step-num">3</span>
                      <span>Once sound is coming through them, tell me below.</span>
                    </li>
                  </ol>
                  <p className="studio-note">
                    {btStatus === 'found'
                      ? `This browser found ${deviceName}. Mobile browsers can't route music through Bluetooth, so please use your phone's settings to choose where the sound goes.`
                      : btStatus === 'denied'
                        ? 'No device was selected. You can still connect through your phone settings, or listen on this phone.'
                        : btStatus === 'unsupported'
                          ? 'Direct browser pairing is not available on this device. Use your phone’s Bluetooth settings instead.'
                          : btStatus === 'error'
                            ? 'Browser pairing did not complete. Your phone settings are the most reliable way to connect.'
                            : 'Direct browser pairing, where available, can only discover devices. Your phone settings control where the music plays.'}
                  </p>
                </div>
                <div className="btn-row">
                  <button type="button" className="btn btn--primary" onClick={confirmConnection}>
                    <Icon name="check" size={17} />
                    I&apos;m Connected
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={confirmConnection}>
                    I&apos;ll Use My Phone
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="listening"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="stack"
          >
            <div className="stack stack--tight">
              <p className="body-copy">
                Perfect. Now, give the world a little silence and give this melody your attention.
              </p>
              <p className="soft-copy">
                For these next few minutes, let the music carry a little piece of me to wherever you are.
              </p>
            </div>
            <AudioPlayer src={src} variant="music" autoPlay fadeInMs={3200} onEnded={() => setFinished(true)} />
            {finished ? (
              <motion.button
                type="button"
                className="btn btn--ghost"
                onClick={onContinue}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                I wonder if the melody reached the same place in your heart where my thoughts of you always seem to go.
              </motion.button>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </SceneShell>
  )
}
