import { useEffect, useMemo, useState } from "react";
import {
  availabilityDays,
  availabilityWindows,
  bookingStatusOptions,
  gameStyleOptions,
  genderOptions,
  genderPreferenceOptions,
  seriousnessOptions,
  socialPreferenceOptions,
  verifiedCourses
} from "../data/profiles";
import SwipeDeck from "./SwipeDeck";

const FILTERS = ["all", "single", "group", "competitive", "social"];
const CANCEL_REASONS = ["Schedule changed", "Booked elsewhere", "Wrong fit", "Weather concern"];

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

function NotificationCenter({ notifications, onRead }) {
  return (
    <section className="notification-panel">
      <div className="panel-header">
        <div>
          <p className="topbar-label">Notifications</p>
          <h3>Live demo activity</h3>
        </div>
        <div className="panel-status">{notifications.filter((item) => item.unread).length} unread</div>
      </div>
      <div className="notification-list">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`notification-item ${notification.unread ? "unread" : ""}`.trim()}
          >
            <div className="notification-copy">
              <strong>{notification.title}</strong>
              <p>{notification.body}</p>
            </div>
            <div className="notification-actions">
              <span>{notification.timeLabel}</span>
              {notification.unread ? (
                <button className="ghost-button compact" type="button" onClick={() => onRead(notification.id)}>
                  Mark read
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function InvitePanel({ invites, onCreateInvite }) {
  return (
    <section className="invite-panel">
      <div className="panel-header">
        <div>
          <p className="topbar-label">Invite tools</p>
          <h3>Share this round outside the app</h3>
        </div>
        <div className="panel-status">{invites.length} live invites</div>
      </div>
      <div className="invite-actions-row">
        <button className="ghost-button" type="button" onClick={() => onCreateInvite("friend")}>
          Invite a friend
        </button>
        <button className="ghost-button" type="button" onClick={() => onCreateInvite("share")}>
          Share posting
        </button>
        <button className="ghost-button" type="button" onClick={() => onCreateInvite("private")}>
          Private link
        </button>
      </div>
      <div className="invite-list">
        {invites.slice(0, 3).map((invite) => (
          <article className="invite-item" key={invite.id}>
            <strong>{invite.type}</strong>
            <p>{invite.destination}</p>
            <span>{invite.value}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsPanel({ user, onChange }) {
  return (
    <section className="preferences-panel">
      <div className="panel-header">
        <div>
          <p className="topbar-label">Golfer profile</p>
          <h3>Your matching settings</h3>
        </div>
        <div className="panel-status">Smart filters and demo preferences</div>
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
          <select name="homeCourse" value={user.homeCourse} onChange={onChange}>
            <option value="">Select a verified course</option>
            {verifiedCourses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </label>

        {user.playMode === "group_owner" ? (
          <label>
            Golfers already in your group
            <input name="groupSize" type="number" min="2" max="4" step="1" value={user.groupSize} onChange={onChange} />
          </label>
        ) : null}

        <label>
          Your handicap
          <input name="handicap" type="number" min="0" max="54" step="0.1" value={user.handicap} onChange={onChange} />
        </label>

        <label>
          Preferred round style
          <select name="preferredVibe" value={user.preferredVibe} onChange={onChange}>
            <option value="any">Any vibe</option>
            <option value="social">Mostly social</option>
            <option value="competitive">Mostly competitive</option>
          </select>
        </label>

        <label>
          How serious are you about score
          <select name="seriousness" value={user.seriousness} onChange={onChange}>
            {seriousnessOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Side game preference
          <select name="gameStyle" value={user.gameStyle} onChange={onChange}>
            {gameStyleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Conversation style
          <select name="socialStyle" value={user.socialStyle} onChange={onChange}>
            {socialPreferenceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Gender
          <select name="gender" value={user.gender} onChange={onChange}>
            {genderOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Looking to play with
          <select name="genderPreference" value={user.genderPreference} onChange={onChange}>
            {genderPreferenceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          Walking or cart
          <select name="mobilityPreference" value={user.mobilityPreference} onChange={onChange}>
            <option value="either">Either is fine</option>
            <option value="walking">Prefer walking</option>
            <option value="cart">Prefer carts</option>
          </select>
        </label>

        <label>
          Music preference
          <select name="musicPreference" value={user.musicPreference} onChange={onChange}>
            <option value="either">Either is fine</option>
            <option value="no_music">Prefer no music</option>
            <option value="music_okay">Music is okay</option>
          </select>
        </label>

        <label>
          Beginner-friendly rounds
          <select
            name="beginnerFriendly"
            value={user.beginnerFriendly ? "yes" : "no"}
            onChange={(event) => onChange({ target: { name: "beginnerFriendly", value: event.target.value === "yes" } })}
          >
            <option value="yes">Open to mixed skill groups</option>
            <option value="no">Prefer golfers near my level</option>
          </select>
        </label>

        <label>
          Fallback if the fit is close
          <select
            name="wouldJoinAnotherGroup"
            value={user.wouldJoinAnotherGroup ? "yes" : "no"}
            onChange={(event) =>
              onChange({ target: { name: "wouldJoinAnotherGroup", value: event.target.value === "yes" } })
            }
          >
            <option value="yes">Allow merge suggestions</option>
            <option value="no">Only direct fits</option>
          </select>
        </label>

        <label>
          Looking within
          <div className="range-row">
            <input name="distance" type="range" min="1" max="50" step="1" value={user.distance} onChange={onChange} />
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

        <label>
          Typical time window
          <select name="availabilityWindow" value={user.availabilityWindow} onChange={onChange}>
            {availabilityWindows.map((window) => (
              <option key={window} value={window}>
                {window}
              </option>
            ))}
          </select>
        </label>

        <label className="profile-span-2">
          Days you usually play
          <DayPicker value={user.availableDays} onChange={onChange} />
        </label>
      </form>
    </section>
  );
}

function TeeTimePostingPanel({ teeTime, user, onSave }) {
  const [draft, setDraft] = useState(teeTime);

  useEffect(() => {
    setDraft(teeTime);
  }, [teeTime]);

  function handleChange(event) {
    const { name, value } = event.target;
    setDraft((current) => ({
      ...current,
      [name]: name === "holes" ? Number(value) : value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!draft.homeCourse.trim() || !draft.teeDate || !draft.teeTime) return;
    onSave(draft);
  }

  return (
    <section className="posting-panel spotlight-posting">
      <div className="panel-header">
        <div>
          <p className="topbar-label">Post A Tee Time</p>
          <h3>
            {user.playMode === "single"
              ? "Start with your tee time and look for the right group"
              : "Start with your tee time and find a 4th"}
          </h3>
        </div>
        <div className="panel-status">{user.playMode === "single" ? "Single posting" : "Need one more golfer"}</div>
      </div>

      <p className="posting-lead">
        Build a real demo posting: tee time, booking status, expected spend, meeting plan, and fallback options if the
        perfect fourth does not show up.
      </p>

      <form className="profile-form" onSubmit={handleSubmit}>
        <label>
          Course
          <select name="homeCourse" value={draft.homeCourse} onChange={handleChange}>
            <option value="">Select a verified course</option>
            {verifiedCourses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </label>
        <label>
          Booking status
          <select name="bookingStatus" value={draft.bookingStatus} onChange={handleChange}>
            {bookingStatusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tee date
          <input name="teeDate" type="date" value={draft.teeDate} onChange={handleChange} />
        </label>
        <label>
          Tee time
          <input name="teeTime" type="time" value={draft.teeTime} onChange={handleChange} />
        </label>
        <label>
          Holes
          <select name="holes" value={draft.holes} onChange={handleChange}>
            <option value="9">9 holes</option>
            <option value="18">18 holes</option>
          </select>
        </label>
        <label>
          Preferred skill window
          <input
            name="preferredSkillWindow"
            type="text"
            value={draft.preferredSkillWindow ?? ""}
            placeholder="8-18 handicap"
            onChange={handleChange}
          />
        </label>
        <label>
          Walk or cart
          <select name="roundMobility" value={draft.roundMobility ?? "Either"} onChange={handleChange}>
            <option value="Either">Either</option>
            <option value="Walking">Walking</option>
            <option value="Cart">Cart</option>
          </select>
        </label>
        <label>
          Green fee range
          <input name="greenFeeRange" type="text" value={draft.greenFeeRange ?? ""} onChange={handleChange} />
        </label>
        <label>
          Meeting spot
          <input name="meetingSpot" type="text" value={draft.meetingSpot ?? ""} onChange={handleChange} />
        </label>
        <label>
          If a direct fourth is not there
          <input
            name="fallbackMode"
            type="text"
            value={draft.fallbackMode ?? ""}
            placeholder="Happy to merge with a twosome if it is the right fit"
            onChange={handleChange}
          />
        </label>
        <label className="profile-span-2">
          Round note
          <textarea
            name="note"
            rows="3"
            value={draft.note ?? ""}
            placeholder="Post a quick note about the vibe, pace, side game, or what kind of golfer fits best."
            onChange={handleChange}
          />
        </label>
        <button className="primary-button profile-span-2" type="submit">
          {user.playMode === "single" ? "Post tee time and find a group" : "Post tee time and find a 4th"}
        </button>
      </form>
    </section>
  );
}

function DemoSpotlight({ teeTime, deck, matches, notifications, invites }) {
  return (
    <section className="demo-spotlight">
      <div className="spotlight-header">
        <div>
          <p className="topbar-label">Demo story</p>
          <h3>What someone should notice in 30 seconds</h3>
        </div>
        <div className="spotlight-pill">Pitch-ready flow</div>
      </div>

      <div className="spotlight-grid">
        <article>
          <strong>{teeTime.homeCourse}</strong>
          <span>Verified course for this round</span>
        </article>
        <article>
          <strong>{deck.length}</strong>
          <span>Ranked candidates by fit</span>
        </article>
        <article>
          <strong>{matches.length}</strong>
          <span>Matches ready to confirm</span>
        </article>
        <article>
          <strong>{notifications.filter((item) => item.unread).length + invites.length}</strong>
          <span>Live activity and invite flows</span>
        </article>
      </div>
    </section>
  );
}

function MatchList({ matches, activeMatchId, onOpenMatch, onCancelMatch }) {
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
            <article className={`match-item ${activeMatchId === match.id ? "selected" : ""}`.trim()} key={match.id}>
              <div className="match-avatar" style={{ backgroundImage: match.profile.image }} aria-hidden="true" />
              <div className="match-copy">
                <h4 className="match-name">{match.profile.name}</h4>
                <p className="match-plan">
                  {match.profile.course} · {match.profile.teeTime} · {match.profile.slots} slot
                  {match.profile.slots > 1 ? "s" : ""}
                </p>
                <p className="match-meta">
                  {match.confirmation?.confirmedByBoth ? "Round confirmed" : "Needs round confirmation"}
                </p>
              </div>
              <div className="match-cta-group">
                <button className="match-action" type="button" onClick={() => onOpenMatch(match)}>
                  Open chat
                </button>
                <button
                  className="ghost-button compact"
                  type="button"
                  onClick={() => onCancelMatch(match.id, "Schedule changed")}
                >
                  Cancel
                </button>
              </div>
            </article>
          ))
        ) : (
          <article className="match-item">
            <div className="match-copy">
              <h4 className="match-name">No matches yet</h4>
              <p className="match-plan">Post a tee time, then swipe through golfers and groups that feel like the right fit.</p>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

function RoundHistoryPanel({ rounds, onSaveScorecard, onReInvitePartner }) {
  return (
    <section className="history-panel">
      <div className="panel-header">
        <div>
          <p className="topbar-label">Round history</p>
          <h3>Completed rounds and scorecards</h3>
        </div>
        <div className="panel-status">{rounds.length} rounds saved</div>
      </div>
      <div className="history-list">
        {rounds.map((round) => (
          <article className="history-item" key={round.id}>
            <div className="history-copy">
              <strong>{round.title}</strong>
              <p>
                {round.dateLabel} · {round.course} · Played with {round.partnerName}
              </p>
              <span>{round.note}</span>
              {round.confirmation ? (
                <div className="history-meta-row">
                  <span>{round.confirmation.walkOrCart}</span>
                  <span>{round.confirmation.greenFee}</span>
                  <span>{round.confirmation.meetingSpot}</span>
                </div>
              ) : null}
            </div>
            <div className="history-scorecard">
              <div className="scorecard-summary">
                <strong>{round.scorecard.total}</strong>
                <span>{round.scorecard.holes}-hole total</span>
              </div>
              <button className="ghost-button compact" type="button" onClick={() => onSaveScorecard(round.id, round.scorecard.scores)}>
                Save scorecard
              </button>
              {round.playAgainReady ? (
                <button className="ghost-button compact" type="button" onClick={() => onReInvitePartner(round.partnerName)}>
                  Play again
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CoursePagesPanel({ courses }) {
  return (
    <section className="courses-panel">
      <div className="panel-header">
        <div>
          <p className="topbar-label">Course pages</p>
          <h3>See where the demo activity is happening</h3>
        </div>
        <div className="panel-status">{courses.length} course pages</div>
      </div>
      <div className="course-grid">
        {courses.map((course) => (
          <article className="course-card" key={course.id}>
            <p className="course-location">{course.location}</p>
            <h4>{course.name}</h4>
            <p>{course.vibe}</p>
            <div className="course-meta-row">
              <span>{course.activePostings} active postings</span>
              <span>{course.bestFor}</span>
            </div>
            <div className="course-meta-row">
              <span>{course.type}</span>
              <span>{course.priceTier}</span>
              <span>{course.difficulty}</span>
            </div>
            <div className="course-meta-row">
              <span>{course.paceExpectation}</span>
              <span>{course.bestTimeWindows.join(" / ")}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PreviousPartnersPanel({ previousPartners, onFavoritePartner, onReInvitePartner }) {
  return (
    <section className="partners-panel">
      <div className="match-panel-header">
        <div>
          <p className="topbar-label">Previous partners</p>
          <h3>Favorite, trust, and re-invite golfers you already liked</h3>
        </div>
        <span className="match-count">{previousPartners.length}</span>
      </div>

      <div className="partners-list">
        {previousPartners.length ? (
          previousPartners.map((entry) => (
            <article className="partner-item" key={entry.id}>
              <div className="match-avatar" style={{ backgroundImage: entry.profile.image }} aria-hidden="true" />
              <div className="partner-copy">
                <h4 className="match-name">{entry.profile.name}</h4>
                <p className="match-plan">
                  {entry.lastPlayed} · {entry.chemistry}
                </p>
                <div className="partner-badges">
                  {entry.trusted ? <span className="tag verified">Trusted golfer</span> : null}
                  {entry.isFavorite ? <span className="tag">Favorite</span> : null}
                  {entry.trustedLabel ? <span className="tag">{entry.trustedLabel}</span> : null}
                </div>
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
              <div className="partner-actions">
                <button className="ghost-button compact" type="button" onClick={() => onFavoritePartner(entry.profile.id)}>
                  {entry.isFavorite ? "Favorited" : "Favorite"}
                </button>
                <button className="match-action" type="button" onClick={() => onReInvitePartner(entry.profile.id)}>
                  Re-invite
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state compact">
            <div>
              <h3>No previous partners yet</h3>
              <p>After a few demo matches, your best playing partners will show up here for quick rebooking.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ProfileModal({ profile, onClose }) {
  if (!profile) return null;

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <section className="modal-card">
        <div className="panel-header">
          <div>
            <p className="topbar-label">Profile detail</p>
            <h3>{profile.name}</h3>
          </div>
          <button className="ghost-button compact" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-profile-grid">
          <div className="modal-image" style={{ backgroundImage: profile.image }} />
          <div className="modal-copy">
            <p className="match-plan">
              {profile.course} · {profile.teeTime} · {profile.handicap}
            </p>
            <p className="profile-bio">{profile.bio}</p>
            <div className="tag-row">
              {profile.tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
              {profile.verifiedGolfer ? <span className="tag verified">Verified golfer</span> : null}
              {profile.beginnerFriendly ? <span className="tag">Beginner-friendly</span> : null}
            </div>
            <div className="detail-grid">
              <div className="detail-pill">Compatibility: {profile.compatibility?.score ?? 0}%</div>
              <div className="detail-pill">Style: {profile.socialStyle}</div>
              <div className="detail-pill">Game: {profile.gameStyle}</div>
              <div className="detail-pill">Score focus: {profile.seriousness}</div>
              <div className="detail-pill">No-shows: {profile.noShowCount}</div>
              <div className="detail-pill">Cancellation rate: {profile.cancellationRate}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MatchWorkspace({
  activeMatch,
  messages,
  loading,
  onSendMessage,
  onSubmitRating,
  onTrustAction,
  onConfirmationUpdate
}) {
  const [draftMessage, setDraftMessage] = useState("");
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [confirmation, setConfirmation] = useState(activeMatch?.confirmation ?? null);
  const [review, setReview] = useState({
    overall: activeMatch?.ratings?.userRating?.rating ?? 0,
    note: activeMatch?.ratings?.userRating?.note ?? "",
    categories:
      activeMatch?.ratings?.categories ?? {
        pace: 5,
        friendliness: 5,
        reliability: 5,
        etiquette: 5
      },
    wouldPlayAgain: activeMatch?.ratings?.wouldPlayAgain ?? true
  });

  useEffect(() => {
    setConfirmation(activeMatch?.confirmation ?? null);
    setReview({
      overall: activeMatch?.ratings?.userRating?.rating ?? 0,
      note: activeMatch?.ratings?.userRating?.note ?? "",
      categories:
        activeMatch?.ratings?.categories ?? {
          pace: 5,
          friendliness: 5,
          reliability: 5,
          etiquette: 5
        },
      wouldPlayAgain: activeMatch?.ratings?.wouldPlayAgain ?? true
    });
  }, [activeMatch]);

  if (!activeMatch) {
    return (
      <section className="chat-panel empty">
        <p className="topbar-label">Match workspace</p>
        <h3>Open a match to coordinate the round</h3>
        <p className="chat-empty-copy">
          The full demo story includes chat, confirmation, cancellations, trust tools, and post-round ratings.
        </p>
      </section>
    );
  }

  function updateConfirmationField(event) {
    const { name, value } = event.target;
    setConfirmation((current) => ({
      ...(current ?? {}),
      [name]: value
    }));
  }

  function updateCategory(key, value) {
    setReview((current) => ({
      ...current,
      categories: {
        ...current.categories,
        [key]: Number(value)
      }
    }));
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
        <div className="chat-pill">{activeMatch.confirmation?.confirmedByBoth ? "Confirmed" : "Needs confirmation"}</div>
      </div>

      <div className="trust-summary-grid">
        <div className="trust-card">
          <strong>{activeMatch.profile.reliabilityRating?.toFixed(1) ?? "4.8"}</strong>
          <span>Reliability</span>
        </div>
        <div className="trust-card">
          <strong>{activeMatch.profile.completedRounds ?? 0}</strong>
          <span>Completed rounds</span>
        </div>
        <div className="trust-card">
          <strong>{activeMatch.profile.verifiedGolfer ? "Yes" : "No"}</strong>
          <span>Verified golfer</span>
        </div>
      </div>

      <section className="confirmation-panel">
        <div className="panel-header">
          <div>
            <p className="topbar-label">Round confirmation</p>
            <h4>Lock in the details before the round</h4>
          </div>
          <button
            className="ghost-button compact"
            type="button"
            onClick={() =>
              onConfirmationUpdate(activeMatch.id, {
                ...confirmation,
                confirmedByBoth: true
              })
            }
          >
            Confirm round
          </button>
        </div>
        <div className="profile-form">
          <label>
            Tee time
            <input name="teeTime" type="text" value={confirmation?.teeTime ?? ""} onChange={updateConfirmationField} />
          </label>
          <label>
            Course
            <input name="course" type="text" value={confirmation?.course ?? ""} onChange={updateConfirmationField} />
          </label>
          <label>
            Booking status
            <input
              name="bookingStatus"
              type="text"
              value={confirmation?.bookingStatus ?? ""}
              onChange={updateConfirmationField}
            />
          </label>
          <label>
            Walk or cart
            <input
              name="walkOrCart"
              type="text"
              value={confirmation?.walkOrCart ?? ""}
              onChange={updateConfirmationField}
            />
          </label>
          <label>
            Green fee
            <input name="greenFee" type="text" value={confirmation?.greenFee ?? ""} onChange={updateConfirmationField} />
          </label>
          <label>
            Meeting spot
            <input
              name="meetingSpot"
              type="text"
              value={confirmation?.meetingSpot ?? ""}
              onChange={updateConfirmationField}
            />
          </label>
        </div>
      </section>

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
          placeholder="Message about arrival time, carts, side game, or meeting spot"
          value={draftMessage}
          onChange={(event) => setDraftMessage(event.target.value)}
        />
        <button className="primary-button compact" type="submit">
          Send
        </button>
      </form>

      <div className="trust-actions">
        <button className="ghost-button" type="button" onClick={() => onTrustAction(activeMatch.id, "report", "Reported from demo trust tools")}>
          Report
        </button>
        <button className="ghost-button" type="button" onClick={() => onTrustAction(activeMatch.id, "no_show", "No-show flagged in demo")}>
          Flag no-show
        </button>
        <select className="compact-select" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)}>
          {CANCEL_REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
        <button className="ghost-button" type="button" onClick={() => onTrustAction(activeMatch.id, "cancel", cancelReason)}>
          Log cancellation
        </button>
        <button className="ghost-button danger" type="button" onClick={() => onTrustAction(activeMatch.id, "block", "Blocked from demo trust center")}>
          Block golfer
        </button>
      </div>

      <div className="rating-panel">
        <div>
          <p className="topbar-label">Post-round reputation</p>
          <h4>Rate how the pairing went</h4>
          <p className="chat-empty-copy">Track pace, friendliness, reliability, etiquette, and whether you would play together again.</p>
        </div>

        <div className="rating-stars" role="radiogroup" aria-label="Rate this match">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`rating-star ${review.overall >= star ? "active" : ""}`.trim()}
              type="button"
              onClick={() => setReview((current) => ({ ...current, overall: star }))}
            >
              ★
            </button>
          ))}
        </div>

        <div className="profile-form">
          {["pace", "friendliness", "reliability", "etiquette"].map((key) => (
            <label key={key}>
              {key[0].toUpperCase() + key.slice(1)}
              <select value={review.categories[key]} onChange={(event) => updateCategory(key, event.target.value)}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="profile-span-2">
            Would play again
            <div className="segmented-control">
              <button
                className={`segment ${review.wouldPlayAgain ? "active" : ""}`.trim()}
                type="button"
                onClick={() => setReview((current) => ({ ...current, wouldPlayAgain: true }))}
              >
                Yes
              </button>
              <button
                className={`segment ${!review.wouldPlayAgain ? "active" : ""}`.trim()}
                type="button"
                onClick={() => setReview((current) => ({ ...current, wouldPlayAgain: false }))}
              >
                No
              </button>
            </div>
          </label>
        </div>

        <textarea
          className="rating-note"
          placeholder="Optional note about pace, etiquette, side games, or overall vibe"
          value={review.note}
          onChange={(event) => setReview((current) => ({ ...current, note: event.target.value }))}
        />
        <button className="primary-button compact" type="button" onClick={() => onSubmitRating(activeMatch.id, review)} disabled={!review.overall}>
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
  notifications,
  courses,
  roundHistory,
  invites,
  activeMatch,
  activeMessages,
  chatLoading,
  onOpenMatch,
  onSendMessage,
  onSubmitRating,
  onTrustAction,
  onNotificationRead,
  onFavoritePartner,
  onReInvitePartner,
  onSaveScorecard,
  onCancelMatch,
  onConfirmationUpdate,
  onCreateInvite,
  onTeeTimeUpdate,
  onLogout,
  onSettingsChange,
  onFilterChange,
  onRefresh,
  onSwipe
}) {
  const [activeTab, setActiveTab] = useState("tee-time");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const unreadCount = notifications.filter((item) => item.unread).length;
  const featuredCourse = useMemo(() => courses[0] ?? null, [courses]);

  return (
    <div className="app-shell">
      <section className="hero-panel hero-panel-redesign">
        <div className="hero-ribbon">
          <span className="hero-ribbon-mark"></span>
          Private matchmaker for incomplete tee times
        </div>
        <div className="hero-copy">
          <p className="eyebrow">TEE TIME MATCHING</p>
          <h1>Post a tee time and build the right foursome.</h1>
          <p className="hero-text">
            Today’s demo shows a fuller `FindA4th` product: smarter tee-time posting, ranked matching, round confirmation,
            trust and reputation tools, course intelligence, invites, and repeat rounds.
          </p>
        </div>

        <div className="hero-marquee">
          <span>Smarter tee-time posting</span>
          <span>Match rankings and confirmations</span>
          <span>Round history and scorecards</span>
          <span>Course pages and invite flows</span>
        </div>

        <div className="hero-stats">
          <article>
            <strong>{teeTime.postingType === "single" ? "Join" : `${teeTime.openSlots}`}</strong>
            <span>{teeTime.postingType === "single" ? "Looking for a group" : "Open spot to fill"}</span>
          </article>
          <article>
            <strong>{unreadCount}</strong>
            <span>Unread notifications</span>
          </article>
          <article>
            <strong>{roundHistory.length}</strong>
            <span>Rounds in history</span>
          </article>
        </div>

        <div className="value-grid">
          <article>
            <span>01</span>
            <h2>Tee-time first</h2>
            <p>The product starts with a real round, then builds discovery, trust, and rebooking around it.</p>
          </article>
          <article>
            <span>02</span>
            <h2>Golf-native trust</h2>
            <p>No-shows, cancellations, pace ratings, and would-play-again signals create a believable marketplace.</p>
          </article>
          <article>
            <span>03</span>
            <h2>Repeat rounds</h2>
            <p>Previous partners, round logs, and re-invites make the app feel sticky instead of one-off.</p>
          </article>
        </div>

        <section className="hero-showcase">
          <article className="hero-showcase-card hero-showcase-primary">
            <p className="topbar-label">Today&apos;s round</p>
            <strong>{teeTime.homeCourse}</strong>
            <span>{teeTime.dayLabel}</span>
            <em>{teeTime.bookingStatus} · {teeTime.greenFeeRange}</em>
          </article>
          <article className="hero-showcase-card">
            <p className="topbar-label">Best-fit signal</p>
            <strong>{deck[0]?.compatibility?.score ?? 0}% match</strong>
            <span>{deck[0]?.name ?? "Waiting on the next golfer"}</span>
          </article>
        </section>

        {featuredCourse ? (
          <section className="featured-course-card">
            <p className="topbar-label">Featured course</p>
            <h3>{featuredCourse.name}</h3>
            <p>{featuredCourse.vibe}</p>
            <div className="summary-accent-row">
              <span className="summary-chip">{featuredCourse.location}</span>
              <span className="summary-chip">{featuredCourse.activePostings} active demo postings</span>
              <span className="summary-chip">{featuredCourse.priceTier}</span>
            </div>
          </section>
        ) : null}
      </section>

      <main className="phone-frame">
        <div className="phone-glow"></div>
        <section className="app-card app-card-redesign">
          <header className="topbar">
            <div>
              <p className="topbar-label">FindA4th</p>
              <h2>Complete the round</h2>
              <p className="topbar-subtitle">Post a tee time, rank the best fits, confirm the round, and save it to your golf history.</p>
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

          <section className="intro-grid">
            <DemoSpotlight teeTime={teeTime} deck={deck} matches={matches} notifications={notifications} invites={invites} />
            <div className="intro-sidecar">
              <NotificationCenter notifications={notifications} onRead={onNotificationRead} />
              <InvitePanel invites={invites} onCreateInvite={onCreateInvite} />
            </div>
          </section>

          <section className="view-tabs" aria-label="Primary app views">
            {[
              ["tee-time", "Post a tee time"],
              ["discovery", "Discovery"],
              ["partners", "Previous partners"],
              ["history", "Round history"],
              ["courses", "Course pages"]
            ].map(([value, label]) => (
              <button
                key={value}
                className={`view-tab ${activeTab === value ? "active" : ""}`.trim()}
                type="button"
                onClick={() => setActiveTab(value)}
              >
                {label}
              </button>
            ))}
          </section>

          {activeTab === "tee-time" ? (
            <>
              <TeeTimePostingPanel teeTime={teeTime} user={user} onSave={onTeeTimeUpdate} />

              <section className="summary-strip">
                <article className="summary-card primary">
                  <p>Posted tee time</p>
                  <strong>{teeTime.dayLabel}</strong>
                  <span>
                    {teeTime.homeCourse} · {teeTime.holes} holes · {teeTime.bookingStatus} · {teeTime.greenFeeRange}
                  </span>
                  {teeTime.note ? <em className="summary-note">"{teeTime.note}"</em> : null}
                  <div className="summary-accent-row">
                    <span className="summary-chip solid">
                      {teeTime.postingType === "single" ? "Looking for a group" : "Looking for a 4th"}
                    </span>
                    <span className="summary-chip">{teeTime.roundMobility}</span>
                    <span className="summary-chip">{teeTime.preferredSkillWindow}</span>
                  </div>
                </article>
                <article className="summary-card">
                  <p>Ideal match settings</p>
                  <strong>{user.preferredVibe === "any" ? "Any vibe" : user.preferredVibe}</strong>
                  <span>
                    Within {user.distance} miles · handicap ±{user.handicapRange} · {user.availabilityWindow}
                  </span>
                  <div className="summary-accent-row">
                    <span className="summary-chip">Score: {user.seriousness}</span>
                    <span className="summary-chip">Game: {user.gameStyle}</span>
                    <span className="summary-chip">Style: {user.socialStyle}</span>
                    <span className="summary-chip">{user.wouldJoinAnotherGroup ? "Merge okay" : "Direct fits only"}</span>
                  </div>
                </article>
              </section>

              <SettingsPanel user={user} onChange={onSettingsChange} />
            </>
          ) : null}

          {activeTab === "discovery" ? (
            <>
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

              <SwipeDeck deck={deck} onSwipe={onSwipe} onOpenProfile={setSelectedProfile} />

              <section className="actions">
                <button className="swipe-button dismiss" type="button" onClick={() => onSwipe("left")}>
                  <span>x</span>
                </button>
                <button className="swipe-button approve" type="button" onClick={() => onSwipe("right")}>
                  <span>♥</span>
                </button>
              </section>
            </>
          ) : null}

          {activeTab === "partners" ? (
            <PreviousPartnersPanel
              previousPartners={previousPartners}
              onFavoritePartner={onFavoritePartner}
              onReInvitePartner={onReInvitePartner}
            />
          ) : null}

          {activeTab === "history" ? (
            <RoundHistoryPanel rounds={roundHistory} onSaveScorecard={onSaveScorecard} onReInvitePartner={onReInvitePartner} />
          ) : null}

          {activeTab === "courses" ? <CoursePagesPanel courses={courses} /> : null}

          <MatchList matches={matches} activeMatchId={activeMatch?.id} onOpenMatch={onOpenMatch} onCancelMatch={onCancelMatch} />
          <MatchWorkspace
            activeMatch={activeMatch}
            messages={activeMessages}
            loading={chatLoading}
            onSendMessage={onSendMessage}
            onSubmitRating={onSubmitRating}
            onTrustAction={onTrustAction}
            onConfirmationUpdate={onConfirmationUpdate}
          />
        </section>
      </main>

      <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
    </div>
  );
}
