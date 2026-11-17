import { SceneShell } from '../components/SceneShell'
import { Reveal, Stagger, StaggerItem } from '../components/Reveal'
import { Icon } from '../components/Icon'

export function Scene1Greeting({ onBegin }: { onBegin: () => void }) {
  return (
    <SceneShell sceneKey="greeting">
      <Stagger>
        <StaggerItem>
          <h1 className="display">
            Hello, <em>My Pinnacle...</em>
          </h1>
        </StaggerItem>
        <StaggerItem>
          <Reveal delay={0.3}>
            <p className="date-line">
              18.11<span className="date-mark"> — </span>A date my heart never learned to forget.
            </p>
          </Reveal>
        </StaggerItem>
        <StaggerItem>
          <div className="divider" aria-hidden="true" />
        </StaggerItem>
        <StaggerItem>
          <p className="body-copy">
            I have borrowed a little moment from your day, not to ask for anything, but to give you something that words
            alone could never quite deliver.
          </p>
        </StaggerItem>
        <StaggerItem>
          <p className="body-copy">
            Tonight, I want you to experience something rather than simply read it. So, put everything else aside for a
            moment. This little world was made with you in mind.
          </p>
        </StaggerItem>
        <StaggerItem>
          <Reveal delay={0.5}>
            <p className="question">Shall we begin, My Pinnacle?</p>
          </Reveal>
        </StaggerItem>
        <StaggerItem>
          <div style={{ marginTop: 'var(--s4)' }}>
            <button type="button" className="btn btn--primary" onClick={onBegin}>
              Begin Our Little Story
              <Icon name="arrow" size={18} />
            </button>
          </div>
        </StaggerItem>
      </Stagger>
    </SceneShell>
  )
}
