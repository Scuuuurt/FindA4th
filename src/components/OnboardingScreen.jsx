import {
  availabilityDays,
  availabilityWindows,
  genderOptions,
  genderPreferenceOptions,
  gameStyleOptions,
  seriousnessOptions,
  socialPreferenceOptions
} from "../data/profiles";
import CourseSearchField from "./CourseSearchField";

function DayPicker({ value, onChange }) {
  function toggleDay(day) {
    const next = value.includes(day) ? value.filter((item) => item !== day) : [...value, day];
    onChange({ target: { name: "availableDays", value: next } });
  }

  return (
    <div className="day-chip-row">
      {availabilityDays.map((day) => (
        <button
          key={day}
          className={`day-chip ${value.includes(day) ? "active" : ""}`.trim()}
          type="button"
          onClick={() => toggleDay(day)}
        >
          {day}
        </button>
      ))}
    </div>
  );
}

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
            FindA4th helps singles and partial groups match before the tee time. Set your verified
            course, preferences, and weekly availability to get better fits.
          </p>
        </div>

        <div className="hero-stats">
          <article>
            <strong>Filtered</strong>
            <span>By course, distance, handicap</span>
          </article>
          <article>
            <strong>Trusted</strong>
            <span>Safety tools and reliability signals</span>
          </article>
          <article>
            <strong>Repeatable</strong>
            <span>Availability-aware matches for future rounds</span>
          </article>
        </div>

        <div className="value-grid">
          <article>
            <span>01</span>
            <h2>Verified course matching</h2>
            <p>Keep matches anchored to real courses so demo rounds feel more believable.</p>
          </article>
          <article>
            <span>02</span>
            <h2>Preference aware</h2>
            <p>Sort for walking versus cart, music preference, and social versus competitive fit.</p>
          </article>
          <article>
            <span>03</span>
            <h2>Trust controls</h2>
            <p>Show reliability signals and make block, report, and no-show actions easy to find.</p>
          </article>
        </div>
      </section>

      <section className="phone-frame onboarding-frame">
        <div className="phone-glow"></div>
        <div className="app-card onboarding-card">
          <p className="topbar-label">Get started</p>
          <h2 className="onboarding-title">Build your golfer profile</h2>
          <p className="onboarding-copy">
            This version is optimized for demos, so your profile should feel like a real golfer who
            would actually join or host a round.
          </p>
          <div className="onboarding-feature-strip">
            <span>Verified home course</span>
            <span>Preference filters</span>
            <span>Availability calendar</span>
            <span>Match quality questions</span>
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

            <CourseSearchField
              label="Most Played / Home Course"
              name="homeCourse"
              value={draft.homeCourse}
              onChange={onChange}
              placeholder="Search for your most played course"
              helperText="Search the demo course list or type your own home course."
            />

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

            <label>
              Preferred round style
              <select name="preferredVibe" value={draft.preferredVibe} onChange={onChange}>
                <option value="any">Any vibe</option>
                <option value="social">Mostly social</option>
                <option value="competitive">Mostly competitive</option>
              </select>
            </label>

            <label>
              How serious are you about score
              <select name="seriousness" value={draft.seriousness} onChange={onChange}>
                {seriousnessOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Side game preference
              <select name="gameStyle" value={draft.gameStyle} onChange={onChange}>
                {gameStyleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Conversation style
              <select name="socialStyle" value={draft.socialStyle} onChange={onChange}>
                {socialPreferenceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Gender
              <select name="gender" value={draft.gender} onChange={onChange}>
                {genderOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Looking to play with
              <select name="genderPreference" value={draft.genderPreference} onChange={onChange}>
                {genderPreferenceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Walking or cart
              <select name="mobilityPreference" value={draft.mobilityPreference} onChange={onChange}>
                <option value="either">Either is fine</option>
                <option value="walking">Prefer walking</option>
                <option value="cart">Prefer carts</option>
              </select>
            </label>

            <label>
              Music preference
              <select name="musicPreference" value={draft.musicPreference} onChange={onChange}>
                <option value="either">Either is fine</option>
                <option value="no_music">Prefer no music</option>
                <option value="music_okay">Music is okay</option>
              </select>
            </label>

            <label>
              Beginner-friendly rounds
              <select
                name="beginnerFriendly"
                value={draft.beginnerFriendly ? "yes" : "no"}
                onChange={(event) =>
                  onChange({
                    target: { name: "beginnerFriendly", value: event.target.value === "yes" }
                  })
                }
              >
                <option value="yes">Yes, I am open to mixed skill groups</option>
                <option value="no">Prefer golfers near my level</option>
              </select>
            </label>

            <label>
              If a perfect fourth is not there
              <select
                name="wouldJoinAnotherGroup"
                value={draft.wouldJoinAnotherGroup ? "yes" : "no"}
                onChange={(event) =>
                  onChange({
                    target: { name: "wouldJoinAnotherGroup", value: event.target.value === "yes" }
                  })
                }
              >
                <option value="yes">I would merge with another group if the fit is right</option>
                <option value="no">Only show direct fits for my posting</option>
              </select>
            </label>

            <label>
              Typical time window
              <select name="availabilityWindow" value={draft.availabilityWindow} onChange={onChange}>
                {availabilityWindows.map((window) => (
                  <option key={window} value={window}>
                    {window}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Days you usually play
              <DayPicker value={draft.availableDays} onChange={onChange} />
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
