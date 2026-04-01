export default function OnboardingScreen({ draft, onChange, onSubmit }) {
  const canContinue = draft.name.trim() && draft.homeCourse.trim();

  return (
    <div className="onboarding-shell">
      <section className="hero-panel">
        <div className="hero-ribbon">
          <span className="hero-ribbon-mark"></span>
          Tee time compatibility, not random swiping
        </div>
        <div className="hero-copy">
          <p className="eyebrow">TEE TIME MATCHING</p>
          <h1>Find the golfer who fits your round.</h1>
          <p className="hero-text">
            FindA4th helps singles and partial groups match before the tee time.
            Set your home course, handicap, and search radius to get better fits.
          </p>
        </div>

        <div className="hero-stats">
          <article>
            <strong>Singles</strong>
            <span>Fill one open seat fast</span>
          </article>
          <article>
            <strong>Groups</strong>
            <span>Merge partial foursomes</span>
          </article>
          <article>
            <strong>Filtered</strong>
            <span>By course, distance, handicap</span>
          </article>
        </div>

        <div className="value-grid">
          <article>
            <span>01</span>
            <h2>Singles and groups</h2>
            <p>Match a solo golfer into an open spot or combine two partial groups.</p>
          </article>
          <article>
            <span>02</span>
            <h2>Handicap aware</h2>
            <p>Filter by skill band so competitive rounds and casual rounds both feel right.</p>
          </article>
          <article>
            <span>03</span>
            <h2>Distance based</h2>
            <p>Search the golfers and groups closest to where you actually play most.</p>
          </article>
        </div>
      </section>

      <section className="phone-frame onboarding-frame">
        <div className="phone-glow"></div>
        <div className="app-card onboarding-card">
          <p className="topbar-label">Get started</p>
          <h2 className="onboarding-title">Build your golfer profile</h2>
          <p className="onboarding-copy">
            New users should finish this setup before swiping. You can update it later in settings.
          </p>
          <div className="onboarding-feature-strip">
            <span>Most played course</span>
            <span>Handicap aware</span>
            <span>1-50 mile radius</span>
          </div>

          <form className="profile-form onboarding-form" onSubmit={onSubmit}>
            <label>
              For this tee time, you are posting as
              <div className="segmented-control">
                <button
                  className={`segment ${draft.playMode === "group_owner" ? "active" : ""}`.trim()}
                  type="button"
                  onClick={() => onChange({ target: { name: "playMode", value: "group_owner" } })}
                >
                  Group owner
                </button>
                <button
                  className={`segment ${draft.playMode === "single" ? "active" : ""}`.trim()}
                  type="button"
                  onClick={() => onChange({ target: { name: "playMode", value: "single" } })}
                >
                  Single golfer
                </button>
              </div>
            </label>
            <label>
              First name or group name
              <input
                name="name"
                type="text"
                placeholder="Alex or Saturday Skins"
                value={draft.name}
                onChange={onChange}
              />
            </label>
            {draft.playMode === "group_owner" ? (
              <label>
                Golfers already in your group
                <input
                  name="groupSize"
                  type="number"
                  min="2"
                  max="4"
                  step="1"
                  value={draft.groupSize}
                  onChange={onChange}
                />
              </label>
            ) : null}
            <label>
              Most played course
              <input
                name="homeCourse"
                type="text"
                placeholder="Pebble Ridge"
                value={draft.homeCourse}
                onChange={onChange}
              />
            </label>
            <label>
              Your handicap
              <input
                name="handicap"
                type="number"
                min="0"
                max="54"
                step="0.1"
                value={draft.handicap}
                onChange={onChange}
              />
            </label>
            <label>
              Looking within
              <div className="range-row">
                <input
                  name="distance"
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={draft.distance}
                  onChange={onChange}
                />
                <span>{draft.distance} miles</span>
              </div>
            </label>
            <label>
              Handicap match range
              <div className="range-row">
                <input
                  name="handicapRange"
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={draft.handicapRange}
                  onChange={onChange}
                />
                <span>±{draft.handicapRange}</span>
              </div>
            </label>
            <button className="primary-button" type="submit" disabled={!canContinue}>
              Start matching
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
