import { useState } from "react";
import SwipeDeck from "./SwipeDeck";

const FILTERS = ["all", "single", "group", "competitive", "social"];

function SettingsPanel({ user, onChange }) {
  return (
    <section className="preferences-panel">
      <div className="panel-header">
        <div>
          <p className="topbar-label">Golfer profile</p>
          <h3>Your matching settings</h3>
        </div>
        <div className="panel-status">Dialed for your home track</div>
      </div>

      <form className="profile-form" onSubmit={(event) => event.preventDefault()}>
        <label className="profile-span-2">
          For this day, you are posting as
          <div className="segmented-control">
            <button
              className={`segment ${user.playMode === "group_owner" ? "active" : ""}`.trim()}
              type="button"
              onClick={() => onChange({ target: { name: "playMode", value: "group_owner" } })}
            >
              Group owner
            </button>
            <button
              className={`segment ${user.playMode === "single" ? "active" : ""}`.trim()}
              type="button"
              onClick={() => onChange({ target: { name: "playMode", value: "single" } })}
            >
              Single golfer
            </button>
          </div>
        </label>
        <label>
          Most played course
          <input name="homeCourse" type="text" value={user.homeCourse} onChange={onChange} />
        </label>
        {user.playMode === "group_owner" ? (
          <label>
            Golfers already in your group
            <input
              name="groupSize"
              type="number"
              min="2"
              max="4"
              step="1"
              value={user.groupSize}
              onChange={onChange}
            />
          </label>
        ) : null}
        <label>
          Your handicap
          <input
            name="handicap"
            type="number"
            min="0"
            max="54"
            step="0.1"
            value={user.handicap}
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
              value={user.distance}
              onChange={onChange}
            />
            <span>{user.distance} miles</span>
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
              value={user.handicapRange}
              onChange={onChange}
            />
            <span>±{user.handicapRange}</span>
          </div>
        </label>
      </form>
    </section>
  );
}

function RatingStars({ value, onChange }) {
  return (
    <div className="rating-stars" role="radiogroup" aria-label="Rate this match">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`rating-star ${value >= star ? "active" : ""}`.trim()}
          type="button"
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function MatchList({ matches, activeMatchId, onOpenMatch }) {
  return (
    <section className="match-panel">
      <div className="match-panel-header">
        <div>
          <p className="topbar-label">Active matches</p>
          <h3>Golfers you clicked with</h3>
        </div>
        <span className="match-count">{matches.length}</span>
      </div>

      <div className="match-list">
        {matches.length ? (
          matches.map((match) => (
            <article
              className={`match-item ${activeMatchId === match.id ? "selected" : ""}`.trim()}
              key={match.id}
            >
              <div
                className="match-avatar"
                style={{ backgroundImage: match.profile.image }}
                aria-hidden="true"
              />
              <div className="match-copy">
                <h4 className="match-name">{match.profile.name}</h4>
                <p className="match-plan">
                  {match.profile.course} · {match.profile.teeTime} · {match.profile.slots} slot
                  {match.profile.slots > 1 ? "s" : ""}
                </p>
                <p className="match-meta">
                  {match.ratings.average ? `${match.ratings.average} avg rating` : "No ratings yet"}
                </p>
              </div>
              <button className="match-action" type="button" onClick={() => onOpenMatch(match)}>
                Open chat
              </button>
            </article>
          ))
        ) : (
          <article className="match-item">
            <div className="match-copy">
              <h4 className="match-name">No matches yet</h4>
              <p className="match-plan">
                Swipe right on golfers and groups that feel like a fit for your round.
              </p>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

function MatchWorkspace({
  activeMatch,
  messages,
  loading,
  onSendMessage,
  onSubmitRating
}) {
  const [draftMessage, setDraftMessage] = useState("");
  const [rating, setRating] = useState(activeMatch?.ratings?.userRating?.rating ?? 0);
  const [note, setNote] = useState(activeMatch?.ratings?.userRating?.note ?? "");

  if (!activeMatch) {
    return (
      <section className="chat-panel empty">
        <p className="topbar-label">Match workspace</p>
        <h3>Open a match to coordinate the round</h3>
        <p className="chat-empty-copy">
          Once you match, both sides should be able to confirm arrival time, cart or walking plans,
          and anything else before the tee time.
        </p>
      </section>
    );
  }

  return (
    <section className="chat-panel">
      <div className="chat-panel-header">
        <div>
          <p className="topbar-label">Match workspace</p>
          <h3>{activeMatch.profile.name}</h3>
          <p className="chat-subtitle">
            {activeMatch.profile.course} · {activeMatch.profile.teeTime}
          </p>
        </div>
        <div className="chat-pill">
          {activeMatch.ratings.average ? `${activeMatch.ratings.average} avg` : "Awaiting ratings"}
        </div>
      </div>

      <div className="chat-thread">
        {loading ? (
          <p className="chat-empty-copy">Loading messages...</p>
        ) : messages.length ? (
          messages.map((message) => (
            <article className="chat-message" key={message.id}>
              <div className="chat-message-head">
                <strong>{message.sender}</strong>
                <span>{new Date(message.sentAt).toLocaleString()}</span>
              </div>
              <p>{message.text}</p>
            </article>
          ))
        ) : (
          <p className="chat-empty-copy">No messages yet. Start coordinating the tee time.</p>
        )}
      </div>

      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          if (!draftMessage.trim()) return;
          onSendMessage(activeMatch.id, draftMessage).then(() => setDraftMessage(""));
        }}
      >
        <input
          className="chat-input"
          type="text"
          placeholder="Message about arrival time, carts, or meeting spot"
          value={draftMessage}
          onChange={(event) => setDraftMessage(event.target.value)}
        />
        <button className="primary-button compact" type="submit">
          Send
        </button>
      </form>

      <div className="rating-panel">
        <div>
          <p className="topbar-label">Post-round rating</p>
          <h4>Rate how the pairing went</h4>
          <p className="chat-empty-copy">
            Similar to Uber or Lyft, both sides can rate the experience after the round.
          </p>
        </div>

        <RatingStars value={rating} onChange={setRating} />
        <textarea
          className="rating-note"
          placeholder="Optional note about pace, etiquette, or overall vibe"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <button
          className="primary-button compact"
          type="button"
          onClick={() => onSubmitRating(activeMatch.id, rating, note)}
          disabled={!rating}
        >
          Save rating
        </button>
      </div>
    </section>
  );
}

export default function MatchApp({
  user,
  filter,
  deck,
  matches,
  previousPartners,
  teeTime,
  activeMatch,
  activeMessages,
  chatLoading,
  onOpenMatch,
  onSendMessage,
  onSubmitRating,
  onLogout,
  onSettingsChange,
  onFilterChange,
  onRefresh,
  onSwipe
}) {
  const [activeTab, setActiveTab] = useState("discovery");

  return (
    <div className="app-shell">
      <section className="hero-panel">
        <div className="hero-ribbon">
          <span className="hero-ribbon-mark"></span>
          Private matchmaker for open golf spots
        </div>
        <div className="hero-copy">
          <p className="eyebrow">TEE TIME MATCHING</p>
          <h1>Fill your foursome with the right golfer, not a random extra.</h1>
          <p className="hero-text">
            FindA4th helps singles, duos, and partial groups find each other before the round.
            Swipe through compatible players and complete your tee sheet with confidence.
          </p>
        </div>

        <div className="hero-stats">
          <article>
            <strong>{teeTime.openSlots}</strong>
            <span>Open slot live</span>
          </article>
          <article>
            <strong>{user.distance} mi</strong>
            <span>Search radius</span>
          </article>
          <article>
            <strong>±{user.handicapRange}</strong>
            <span>Handicap band</span>
          </article>
        </div>

        <div className="value-grid">
          <article>
            <span>01</span>
            <h2>Group-first profiles</h2>
            <p>Match a single player into your open slot or link two partial groups.</p>
          </article>
          <article>
            <span>02</span>
            <h2>Tee time aware</h2>
            <p>Profiles highlight course, day, handicap range, and exact opening count.</p>
          </article>
          <article>
            <span>03</span>
            <h2>Fast decision flow</h2>
            <p>Swipe left to pass, right to connect, then lock in the round together.</p>
          </article>
        </div>
      </section>

      <main className="phone-frame">
        <div className="phone-glow"></div>
        <section className="app-card">
          <header className="topbar">
            <div>
              <p className="topbar-label">FindA4th</p>
              <h2>Find your fourth golfer</h2>
              <p className="topbar-subtitle">Curated matches around your tee time and playing style.</p>
            </div>
            <div className="topbar-actions">
              <button className="ghost-button" type="button" onClick={onRefresh}>
                Refresh deck
              </button>
              <button className="ghost-button" type="button" onClick={onLogout}>
                Log out
              </button>
            </div>
          </header>

          <section className="summary-strip">
            <article className="summary-card primary">
              <p>{teeTime.postingType === "single" ? "Solo posting" : "Current booking"}</p>
              <strong>{teeTime.dayLabel}</strong>
              {teeTime.postingType === "single" ? (
                <span>{teeTime.homeCourse} · You are looking to join an existing group for this round</span>
              ) : (
                <span>
                  {teeTime.homeCourse} · {teeTime.golfersCommitted} golfers · {teeTime.openSlots} open
                  spot{teeTime.openSlots > 1 ? "s" : ""}
                </span>
              )}
              <div className="summary-accent-row">
                <span className="summary-chip solid">
                  {teeTime.postingType === "single" ? "Looking for a group" : "Ready to match"}
                </span>
                <span className="summary-chip">
                  {teeTime.postingType === "single" ? "Solo golfer today" : "Hosting a group today"}
                </span>
              </div>
            </article>
            <article className="summary-card">
              <p>Discovery fit</p>
              <strong>
                {deck.length} profile{deck.length === 1 ? "" : "s"}
              </strong>
              <span>
                Within {user.distance} miles · handicap ±{user.handicapRange}
              </span>
              <div className="summary-accent-row">
                <span className="summary-chip">Home course: {user.homeCourse}</span>
                <span className="summary-chip">
                  {user.playMode === "single" ? "Mode: single" : `Mode: group of ${user.groupSize}`}
                </span>
              </div>
            </article>
          </section>

          <SettingsPanel user={user} onChange={onSettingsChange} />

          <section className="filters" aria-label="Profile filters">
            {FILTERS.map((value) => (
              <button
                key={value}
                className={`filter-chip ${filter === value ? "active" : ""}`.trim()}
                type="button"
                onClick={() => onFilterChange(value)}
              >
                {value === "all" ? "All" : value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </section>

          <section className="view-tabs" aria-label="Primary app views">
            <button
              className={`view-tab ${activeTab === "discovery" ? "active" : ""}`.trim()}
              type="button"
              onClick={() => setActiveTab("discovery")}
            >
              Discovery
            </button>
            <button
              className={`view-tab ${activeTab === "partners" ? "active" : ""}`.trim()}
              type="button"
              onClick={() => setActiveTab("partners")}
            >
              Previous playing partners
            </button>
          </section>

          {activeTab === "discovery" ? (
            <>
              <SwipeDeck deck={deck} onSwipe={onSwipe} />

              <section className="actions">
                <button className="swipe-button dismiss" type="button" onClick={() => onSwipe("left")}>
                  <span>x</span>
                </button>
                <button className="swipe-button approve" type="button" onClick={() => onSwipe("right")}>
                  <span>♥</span>
                </button>
              </section>
            </>
          ) : (
            <section className="partners-panel">
              <div className="match-panel-header">
                <div>
                  <p className="topbar-label">Previous partners</p>
                  <h3>See familiar golfers and groups when they post again</h3>
                </div>
                <span className="match-count">
                  {previousPartners.filter((entry) => entry.availablePosting).length}
                </span>
              </div>

              <div className="partners-list">
                {previousPartners.length ? (
                  previousPartners.map((entry) => (
                    <article className="partner-item" key={entry.id}>
                      <div
                        className="match-avatar"
                        style={{ backgroundImage: entry.profile.image }}
                        aria-hidden="true"
                      />
                      <div className="partner-copy">
                        <h4 className="match-name">{entry.profile.name}</h4>
                        <p className="match-plan">
                          {entry.lastPlayed} · {entry.chemistry}
                        </p>
                        {entry.availablePosting ? (
                          <div className="partner-posting">
                            <strong>
                              Open posting: {entry.availablePosting.course} · {entry.availablePosting.teeTime}
                            </strong>
                            <p>
                              {entry.availablePosting.openSlots} open slot
                              {entry.availablePosting.openSlots > 1 ? "s" : ""} · {entry.availablePosting.note}
                            </p>
                          </div>
                        ) : (
                          <p className="match-meta">No current posting from this partner right now.</p>
                        )}
                      </div>
                      <div className="partner-status">
                        {entry.availablePosting ? "Open spot available" : "No current posting"}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state compact">
                    <div>
                      <h3>No previous partners yet</h3>
                      <p>Once you play with a matched golfer or group, they can show up here for future rounds.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          <MatchList matches={matches} activeMatchId={activeMatch?.id} onOpenMatch={onOpenMatch} />
          <MatchWorkspace
            activeMatch={activeMatch}
            messages={activeMessages}
            loading={chatLoading}
            onSendMessage={onSendMessage}
            onSubmitRating={onSubmitRating}
          />
        </section>
      </main>
    </div>
  );
}
