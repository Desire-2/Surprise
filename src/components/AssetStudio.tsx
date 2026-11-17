import { useState, type ChangeEvent } from 'react'
import { Icon } from './Icon'
import { AUDIO_SLOTS, FILES_BY_SLOT, PHOTO_SLOTS, SLOT_LABELS, type MediaSlot } from '../lib/slots'
import { deleteAsset, savePhoneNumber, saveAsset, type AppConfig, type MediaResolution } from '../lib/media'

type Props = {
  media: Record<MediaSlot, MediaResolution> | null
  config: AppConfig
  onClose: () => void
  onMediaChanged: () => void
  onConfigChanged: () => void
}

function acceptFor(slot: MediaSlot) {
  return (AUDIO_SLOTS as readonly string[]).includes(slot) ? 'audio/*' : 'image/*'
}

export function AssetStudio({ media, config, onClose, onMediaChanged, onConfigChanged }: Props) {
  const [phone, setPhone] = useState(config.phoneNumber)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState<MediaSlot | null>(null)

  async function handleFile(slot: MediaSlot, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy(slot)
    try {
      await saveAsset(slot, file)
      setNotice(`${SLOT_LABELS[slot]} saved to this browser. It is ready for preview.`)
      onMediaChanged()
    } catch {
      setNotice('This browser could not store that file. Try a smaller file or another browser.')
    } finally {
      setBusy(null)
      event.target.value = ''
    }
  }

  async function handleRemove(slot: MediaSlot) {
    await deleteAsset(slot)
    setNotice(`${SLOT_LABELS[slot]} removed from this browser.`)
    onMediaChanged()
  }

  return (
    <div className="studio">
      <div className="studio-inner">
        <header className="studio-header">
          <div>
            <p className="studio-kicker">Private setup · just for him</p>
            <h1 className="studio-title">The Asset Studio</h1>
          </div>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Back to the story
          </button>
        </header>

        <section className="studio-section">
          <h2>Your number</h2>
          <p className="studio-note">
            The call button uses a standard phone link. Nothing is dialled unless she taps it.
          </p>
          <div className="studio-actions" style={{ marginTop: 14 }}>
            <input
              className="studio-input"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+15551234567"
              aria-label="Your phone number in international format"
              style={{ flex: '1 1 240px' }}
            />
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                savePhoneNumber(phone)
                onConfigChanged()
                setNotice('Your number is saved on this device.')
              }}
            >
              <Icon name="check" size={16} />
              Save number
            </button>
          </div>
        </section>

        <section className="studio-section">
          <h2>Music & voice</h2>
          <p className="studio-note">
            Uploads stay in this browser only — nothing is sent to a server. For the shared link, put the same files in
            the <code>public/media/</code> folder before deploying, using the download names below.
          </p>
          <div className="studio-grid">
            {AUDIO_SLOTS.map((slot) => {
              const item = media?.[slot]
              return (
                <div className="studio-item" key={slot}>
                  <div className="studio-item__head">
                    <span className="studio-item__name">{SLOT_LABELS[slot]}</span>
                    <span className={`studio-badge${item?.source === 'missing' ? ' studio-badge--missing' : ''}`}>
                      {busy === slot ? 'Saving' : item?.source === 'upload' ? 'On this device' : item?.source === 'file' ? 'Deployed file' : 'Missing'}
                    </span>
                  </div>
                  <p className="studio-note" style={{ marginTop: 0 }}>
                    Deploy name: <code>{FILES_BY_SLOT[slot][0]}</code>
                    {item?.name && item.name !== FILES_BY_SLOT[slot][0] ? ` · current: ${item.name}` : ''}
                  </p>
                  <input
                    className="studio-input"
                    type="file"
                    accept={acceptFor(slot)}
                    aria-label={`Upload ${SLOT_LABELS[slot]}`}
                    onChange={(event) => void handleFile(slot, event)}
                  />
                  {item?.url ? (
                    <>
                      <audio controls src={item.url} preload="metadata" style={{ width: '100%', marginTop: 12 }} />
                      <div className="studio-actions">
                        <a className="btn btn--ghost" href={item.url} download={FILES_BY_SLOT[slot][0]}>
                          <Icon name="download" size={15} />
                          Download for deploy
                        </a>
                        {item.source === 'upload' ? (
                          <button type="button" className="btn btn--quiet" onClick={() => void handleRemove(slot)}>
                            <Icon name="trash" size={15} />
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              )
            })}
          </div>
        </section>

        <section className="studio-section">
          <h2>Photographs (optional)</h2>
          <div className="studio-grid">
            {PHOTO_SLOTS.map((slot) => {
              const item = media?.[slot]
              return (
                <div className="studio-item" key={slot}>
                  <div className="studio-item__head">
                    <span className="studio-item__name">{SLOT_LABELS[slot]}</span>
                    <span className={`studio-badge${item?.source === 'missing' ? ' studio-badge--missing' : ''}`}>
                      {item?.source === 'upload' ? 'On this device' : item?.source === 'file' ? 'Deployed file' : 'Empty'}
                    </span>
                  </div>
                  <p className="studio-note" style={{ marginTop: 0 }}>
                    Deploy name: <code>{FILES_BY_SLOT[slot][0]}</code>
                  </p>
                  {item?.url ? <img className="studio-preview" src={item.url} alt={`Preview for ${SLOT_LABELS[slot]}`} /> : null}
                  <input
                    className="studio-input"
                    type="file"
                    accept="image/*"
                    aria-label={`Upload ${SLOT_LABELS[slot]}`}
                    onChange={(event) => void handleFile(slot, event)}
                  />
                  {item?.url ? (
                    <div className="studio-actions">
                      <a className="btn btn--ghost" href={item.url} download={FILES_BY_SLOT[slot][0]}>
                        <Icon name="download" size={15} />
                        Download for deploy
                      </a>
                      {item.source === 'upload' ? (
                        <button type="button" className="btn btn--quiet" onClick={() => void handleRemove(slot)}>
                          <Icon name="trash" size={15} />
                          Remove
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </section>

        <section className="studio-section">
          <h2>Before you share the link</h2>
          <ol className="studio-list">
            <li>
              Add his number above, or set <code>phoneNumber</code> in <code>public/config.json</code>.
            </li>
            <li>
              Put the three audio files in <code>public/media/</code> using the deploy names shown above. Your actual
              recording is used as-is — no synthesised voice, no substitutions.
            </li>
            <li>
              Add optional photos with the <code>photo-1.jpg</code> … <code>photo-6.jpg</code> names.
            </li>
            <li>
              Build and deploy the <code>dist/</code> folder, then share only the story link — not this{' '}
              <code>#studio</code> page.
            </li>
          </ol>
          <p className="studio-note">
            Uploaded files and the phone number are stored in this browser&apos;s local storage / IndexedDB. Clearing
            browser data removes them. Deployed files in <code>public/media/</code> travel with the site.
          </p>
        </section>

        {notice ? <p className="studio-note" role="status">{notice}</p> : null}
      </div>
    </div>
  )
}
