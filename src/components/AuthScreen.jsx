export default function AuthScreen({
  mode,
  credentials,
  error,
  loading,
  onModeChange,
  onChange,
  onSubmit
}) {
  const title = mode === "signup" ? "Create your FindA4th account" : "Welcome back to FindA4th";
  const actionLabel = mode === "signup" ? "Create account" : "Sign in";

  return (
    <div className="onboarding-shell">
      <section className="hero-panel">
        <div className="hero-ribbon">
          <span className="hero-ribbon-mark"></span>
          Built for golfers booking incomplete groups
        </div>
        <div className="hero-copy">
          <p className="eyebrow">TEE TIME MATCHING</p>
          <h1>Meet golfers with a tee time in mind.</h1>
          <p className="hero-text">
            Account-based matching keeps each golfer’s settings, swipes, and matches separate.
            Sign in to manage your own rounds and conversations.
          </p>
        </div>

        <div className="hero-stats">
          <article>
            <strong>Saved</strong>
            <span>Profile and settings</span>
          </article>
          <article>
            <strong>Private</strong>
            <span>Your own match history</span>
          </article>
          <article>
            <strong>Ready</strong>
            <span>For real chat and tee postings</span>
          </article>
        </div>

        <div className="value-grid">
          <article>
            <span>01</span>
            <h2>Your own account</h2>
            <p>Every golfer or group gets their own saved profile, filters, and match history.</p>
          </article>
          <article>
            <span>02</span>
            <h2>Persistent matches</h2>
            <p>Your right swipes and match threads stay attached to your account.</p>
          </article>
          <article>
            <span>03</span>
            <h2>Ready for scale</h2>
            <p>This is the app shape you need before adding real chat and live tee time posting.</p>
          </article>
        </div>
      </section>

      <section className="phone-frame onboarding-frame">
        <div className="phone-glow"></div>
        <div className="app-card onboarding-card auth-card">
          <div className="auth-toggle">
            <button
              className={`filter-chip ${mode === "signup" ? "active" : ""}`.trim()}
              type="button"
              onClick={() => onModeChange("signup")}
            >
              Sign up
            </button>
            <button
              className={`filter-chip ${mode === "login" ? "active" : ""}`.trim()}
              type="button"
              onClick={() => onModeChange("login")}
            >
              Log in
            </button>
          </div>

          <h2 className="onboarding-title">{title}</h2>
          <p className="onboarding-copy">Use an email and password to keep your golfer account separate.</p>
          <div className="onboarding-feature-strip">
            <span>Persistent matches</span>
            <span>Session based</span>
            <span>Golf-first discovery</span>
          </div>

          <form className="profile-form onboarding-form" onSubmit={onSubmit}>
            <label>
              Email
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={credentials.email}
                onChange={onChange}
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={credentials.password}
                onChange={onChange}
              />
            </label>
            {error ? <p className="auth-error">{error}</p> : null}
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Working..." : actionLabel}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
