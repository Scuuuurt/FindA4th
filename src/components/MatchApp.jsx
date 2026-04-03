import { useEffect, useMemo, useState } from "react";
import {
  availabilityDays,
  availabilityWindows,
  bookingStatusOptions,
  gameStyleOptions,
  genderOptions,
  genderPreferenceOptions,
  seriousnessOptions,
  socialPreferenceOptions
} from "../data/profiles";
import CourseSearchField from "./CourseSearchField";
import SwipeDeck from "./SwipeDeck";

const FILTERS = ["all", "single", "group", "competitive", "social"];
const CANCEL_REASONS = ["Schedule changed", "Booked elsewhere", "Wrong fit", "Weather concern"];
const SECONDARY_TABS = [
  ["history", "Round history"],
  ["dashboard", "Dashboard"],
  ["courses", "Course pages"]
];
const MARKET_WINDOWS = [
  ["groups", "Groups"],
  ["social", "Social"]
];

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
  const unread = notifications.filter((item) => item.unread).length;

  return (
    <section className="notification-panel">
      <div className="panel-header">
        <div>
          <p className="topbar-label">Notifications</p>
          <h3>Live demo activity</h3>
        </div>
        <div className="panel-status">{unread} unread</div>
      </div>
      <div className="notification-list">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`notification-item ${notification.unread ? "unread" : ""}`.trim()}
          >
            <div className="notification-copy">
              <div className="notification-headline-row">
                <strong>{notification.title}</strong>
                <span className="tag verified">{notification.type}</span>
              </div>
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

        <CourseSearchField
          label="Most Played / Home Course"
          name="homeCourse"
          value={user.homeCourse}
          onChange={onChange}
          placeholder="Search for your most played course"
          helperText="Search nearby demo inventory or type your own home course."
        />

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
        <CourseSearchField
          label="Tee time course"
          name="homeCourse"
          value={draft.homeCourse}
          onChange={handleChange}
          placeholder="Search for the course for this round"
          helperText="Pick a searchable course for this posting or type a custom course name."
        />
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

function FlowGuide({ teeTime, matches, roundHistory, onJump }) {
  const steps = [
    {
      id: "tee-time",
      label: "1. Post the round",
      state: teeTime.homeCourse && teeTime.teeDate && teeTime.teeTime ? "ready" : "current",
      detail: `${teeTime.homeCourse} · ${teeTime.dayLabel}`
    },
    {
      id: "discovery",
      label: "2. Review the best fits",
      state: matches.length > 0 ? "ready" : "current",
      detail:
        matches.length > 0
          ? `${matches.length} match${matches.length === 1 ? "" : "es"} already in motion`
          : "Swipe or browse golfers and groups for this exact round"
    },
    {
      id: "history",
      label: "3. Save the round after you play",
      state: roundHistory.length > 0 ? "ready" : "upcoming",
      detail:
        roundHistory.length > 0
          ? `${roundHistory.length} logged round${roundHistory.length === 1 ? "" : "s"}`
          : "Round history and dashboard unlock once the day is complete"
    }
  ];

  return (
    <section className="flow-guide-panel">
      <div className="panel-header">
        <div>
          <p className="topbar-label">Start here</p>
          <h3>Follow the live round flow</h3>
        </div>
        <div className="panel-status">Demo guide</div>
      </div>
      <div className="flow-guide-list">
        {steps.map((step) => (
          <button
            key={step.id}
            className={`flow-guide-step ${step.state}`.trim()}
            type="button"
            onClick={() => onJump(step.id)}
          >
            <span className="flow-guide-state">{step.state === "ready" ? "Ready" : step.state === "current" ? "Next" : "Later"}</span>
            <strong>{step.label}</strong>
            <p>{step.detail}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function EmptyShelf({ title, copy, actionLabel, onAction }) {
  return (
    <section className="empty-state compact">
      <div>
        <h3>{title}</h3>
        <p>{copy}</p>
        {actionLabel ? (
          <button className="ghost-button empty-state-action" type="button" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}

function buildWindowDeck(deck, marketWindow) {
  if (marketWindow === "groups") {
    return deck
      .filter((profile) => profile.type === "Group")
      .map((profile) => ({
        ...profile,
        marketWindow,
        surfaceType: "Live group",
        surfaceBadge: `${profile.slots} open slot${profile.slots > 1 ? "s" : ""}`,
        surfaceMeta: `${profile.course} · ${profile.teeTime}`
      }));
  }

  return deck
    .filter((profile) => profile.type === "Single")
    .map((profile) => ({
      ...profile,
      marketWindow,
      surfaceType: "Social golfer",
      surfaceBadge: "Future round",
      surfaceMeta: `${profile.homeCourse} · ${profile.availableDays.join(" / ")} · ${profile.availabilityWindow}`,
      fit: "Good fit for a future round",
      tags: [...profile.tags, "No tee time posted yet"]
    }));
}

function MarketWindowSwitcher({ marketWindow, onChange, groupCount, socialCount }) {
  return (
    <section className="market-window-switcher" aria-label="Product windows">
      <div className="panel-header">
        <div>
          <p className="topbar-label">Product windows</p>
          <h3>Choose between active tee times and social golf friends</h3>
        </div>
      </div>
      <div className="market-window-row">
        {MARKET_WINDOWS.map(([value, label]) => (
          <button
            key={value}
            className={`market-window-card ${marketWindow === value ? "active" : ""}`.trim()}
            type="button"
            onClick={() => onChange(value)}
          >
            <span className="flow-guide-state">{label}</span>
            <strong>{value === "groups" ? "Active tee times" : "Social / golf friends"}</strong>
            <p>
              {value === "groups"
                ? "Browse real group postings that already have a course, date, and time and need golfers now."
                : "Browse golfers without a tee time who are just looking to meet new people for a future round."}
            </p>
            <span className="market-window-count">
              {value === "groups" ? groupCount : socialCount} {value === "groups" ? "active postings" : "social golfers"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function DiscoveryContextPanel({ teeTime, user, marketWindow }) {
  if (marketWindow === "social") {
    return (
      <section className="discovery-context-panel social">
        <div>
          <p className="topbar-label">Social window</p>
          <h3>Meet golfers for a future round</h3>
          <p className="posting-lead">
            No tee time is attached here. This lane is for finding golfers with overlapping availability, similar vibe,
            and enough trust to set up the next round together.
          </p>
        </div>
        <div className="summary-accent-row">
          <span className="summary-chip">Within {user.distance} miles</span>
          <span className="summary-chip">{user.availabilityWindow}</span>
          <span className="summary-chip">{user.socialStyle}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="discovery-context-panel">
      <div>
        <p className="topbar-label">Matching against</p>
        <h3>{teeTime.homeCourse}</h3>
        <p className="posting-lead">
          {teeTime.dayLabel} · {teeTime.holes} holes · {teeTime.bookingStatus} · {teeTime.roundMobility}
        </p>
      </div>
      <div className="summary-accent-row">
        <span className="summary-chip">{teeTime.preferredSkillWindow}</span>
        <span className="summary-chip">Meet: {teeTime.meetingSpot}</span>
        <span className="summary-chip">{user.seriousness}</span>
      </div>
    </section>
  );
}

function buildGolfStats(rounds) {
  if (!rounds.length) {
    return {
      roundsPlayed: 0,
      averageScore: "-",
      bestRound: "-",
      averageOverPar: "-",
      favoriteCourse: "-"
    };
  }

  const totalScore = rounds.reduce((sum, round) => sum + (round.scorecard?.total ?? 0), 0);
  const bestRound = Math.min(...rounds.map((round) => round.scorecard?.total ?? 999));
  const courseCounts = rounds.reduce((accumulator, round) => {
    accumulator[round.course] = (accumulator[round.course] ?? 0) + 1;
    return accumulator;
  }, {});
  const favoriteCourse =
    Object.entries(courseCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "-";
  const overParTotal = rounds.reduce((sum, round) => sum + (round.statline?.overPar ?? 0), 0);

  return {
    roundsPlayed: rounds.length,
    averageScore: (totalScore / rounds.length).toFixed(1),
    bestRound,
    averageOverPar: (overParTotal / rounds.length).toFixed(1),
    favoriteCourse
  };
}

function StatsDashboard({ rounds }) {
  const stats = buildGolfStats(rounds);

  return (
    <section className="stats-dashboard">
      <div className="panel-header">
        <div>
          <p className="topbar-label">Golf stats</p>
          <h3>Your post-round trend line</h3>
        </div>
        <div className="panel-status">{stats.roundsPlayed} saved rounds</div>
      </div>
      <div className="stats-grid">
        <article>
          <strong>{stats.averageScore}</strong>
          <span>Average score</span>
        </article>
        <article>
          <strong>{stats.bestRound}</strong>
          <span>Best round total</span>
        </article>
        <article>
          <strong>{stats.averageOverPar}</strong>
          <span>Average over par</span>
        </article>
        <article>
          <strong>{stats.favoriteCourse}</strong>
          <span>Most played course</span>
        </article>
      </div>
    </section>
  );
}

function buildDashboardData(rounds, user, previousPartners) {
  const recentRounds = [...rounds].slice(0, 4);
  const split = rounds.reduce(
    (accumulator, round) => {
      const key = round.scorecard?.holes === 9 ? "nine" : "eighteen";
      accumulator[key].count += 1;
      accumulator[key].total += round.scorecard?.total ?? 0;
      return accumulator;
    },
    {
      nine: { count: 0, total: 0 },
      eighteen: { count: 0, total: 0 }
    }
  );

  const partnerCounts = rounds.reduce((accumulator, round) => {
    accumulator[round.partnerName] = (accumulator[round.partnerName] ?? 0) + 1;
    return accumulator;
  }, {});

  const mostFrequentPartner =
    Object.entries(partnerCounts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "No partner data yet";
  const bestRatedRound = [...rounds].sort((left, right) => (right.rating ?? 0) - (left.rating ?? 0))[0] ?? null;
  const trustedPartner =
    [...previousPartners].sort(
      (left, right) => (right.trustProfile?.wouldPlayAgainRate ?? 0) - (left.trustProfile?.wouldPlayAgainRate ?? 0)
    )[0] ?? null;

  const averageOverPar =
    rounds.length > 0
      ? rounds.reduce((sum, round) => sum + (round.statline?.overPar ?? 0), 0) / rounds.length
      : 0;
  const recentOverPar =
    recentRounds.length > 0
      ? recentRounds.reduce((sum, round) => sum + (round.statline?.overPar ?? 0), 0) / recentRounds.length
      : averageOverPar;
  const handicapDelta = Number(((recentOverPar - averageOverPar) / 8).toFixed(1));
  const favoritePartners = previousPartners.filter((entry) => entry.isFavorite).slice(0, 3);
  const achievements = [
    rounds.length >= 3 ? "Three logged rounds" : null,
    rounds.some((round) => (round.statline?.overPar ?? 0) <= 0) ? "Even-par-or-better day" : null,
    previousPartners.some((entry) => entry.trustProfile?.wouldPlayAgainRate >= 100) ? "Perfect chemistry pairing" : null,
    user.handicap <= 12 ? "Low-teen handicap profile" : null
  ].filter(Boolean);
  const personalitySummary = `${user.seriousness} golfer who prefers ${user.socialStyle.toLowerCase()} rounds, ${
    user.gameStyle.toLowerCase()
  }, and ${user.mobilityPreference === "either" ? "either walking or carting" : user.mobilityPreference}.`;

  return {
    scoringTrend: recentRounds.map((round) => ({
      label: round.dateLabel,
      value: round.scorecard?.total ?? 0
    })),
    overParTrend: recentRounds.map((round) => ({
      label: round.dateLabel,
      value: round.statline?.overPar ?? 0
    })),
    split,
    mostFrequentPartner,
    bestRatedRound,
    trustedPartner,
    handicapNow: user.handicap,
    handicapDelta,
    handicapDirection:
      handicapDelta < 0 ? "Trending down" : handicapDelta > 0 ? "Trending up" : "Holding steady",
    favoritePartners,
    achievements,
    personalitySummary
  };
}

function TrendBars({ items, formatter }) {
  const max = Math.max(...items.map((item) => Math.abs(item.value)), 1);

  return (
    <div className="trend-list">
      {items.map((item) => (
        <article className="trend-item" key={`${item.label}-${item.value}`}>
          <div className="trend-copy">
            <strong>{formatter(item.value)}</strong>
            <span>{item.label}</span>
          </div>
          <div className="trend-bar-rail">
            <div className="trend-bar-fill" style={{ width: `${Math.max(18, (Math.abs(item.value) / max) * 100)}%` }} />
          </div>
        </article>
      ))}
    </div>
  );
}

function PlayerDashboard({ rounds, user, previousPartners }) {
  const data = buildDashboardData(rounds, user, previousPartners);

  return (
    <section className="dashboard-shell">
      <StatsDashboard rounds={rounds} />

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="topbar-label">Handicap tracking</p>
              <h3>Current form</h3>
            </div>
            <div className="panel-status">{data.handicapDirection}</div>
          </div>
          <div className="stats-grid compact">
            <article>
              <strong>{Number(user.handicap).toFixed(1)}</strong>
              <span>Current handicap</span>
            </article>
            <article>
              <strong>{data.handicapDelta > 0 ? `+${data.handicapDelta}` : data.handicapDelta}</strong>
              <span>Recent trend</span>
            </article>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="topbar-label">Scoring trend</p>
              <h3>Recent totals</h3>
            </div>
          </div>
          <TrendBars items={data.scoringTrend} formatter={(value) => value} />
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="topbar-label">Over par</p>
              <h3>How rounds are trending</h3>
            </div>
          </div>
          <TrendBars items={data.overParTrend} formatter={(value) => (value > 0 ? `+${value}` : value)} />
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="topbar-label">9 vs 18</p>
              <h3>Round split</h3>
            </div>
          </div>
          <div className="stats-grid compact">
            <article>
              <strong>
                {data.split.nine.count
                  ? (data.split.nine.total / data.split.nine.count).toFixed(1)
                  : "-"}
              </strong>
              <span>Average 9-hole score</span>
            </article>
            <article>
              <strong>
                {data.split.eighteen.count
                  ? (data.split.eighteen.total / data.split.eighteen.count).toFixed(1)
                  : "-"}
              </strong>
              <span>Average 18-hole score</span>
            </article>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="topbar-label">Partner insights</p>
              <h3>Who you play best with</h3>
            </div>
          </div>
          <div className="insight-list">
            <article>
              <strong>{data.mostFrequentPartner}</strong>
              <span>Most frequent partner</span>
            </article>
            <article>
              <strong>{data.bestRatedRound?.partnerName ?? "No completed ratings yet"}</strong>
              <span>Best-rated recent round</span>
            </article>
            <article>
              <strong>{data.trustedPartner?.profile?.name ?? "No trusted partner yet"}</strong>
              <span>Top rebook suggestion</span>
            </article>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="topbar-label">Favorite partners</p>
              <h3>Your best rebook options</h3>
            </div>
          </div>
          <div className="insight-list">
            {data.favoritePartners.length ? (
              data.favoritePartners.map((entry) => (
                <article key={entry.id}>
                  <strong>{entry.profile.name}</strong>
                  <span>{entry.trustProfile?.overall} overall · {entry.trustProfile?.wouldPlayAgainRate}% play-again rate</span>
                </article>
              ))
            ) : (
              <article>
                <strong>No favorites yet</strong>
                <span>Favorite a few playing partners and they’ll show up here.</span>
              </article>
            )}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="topbar-label">Achievements</p>
              <h3>Momentum and milestones</h3>
            </div>
          </div>
          <div className="achievement-list">
            {data.achievements.map((item) => (
              <article className="achievement-item" key={item}>
                <strong>{item}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <p className="topbar-label">Golf personality</p>
              <h3>How FindA4th would describe you</h3>
            </div>
          </div>
          <div className="insight-list">
            <article>
              <strong>{user.homeCourse || "No course selected"}</strong>
              <span>{data.personalitySummary}</span>
            </article>
          </div>
        </section>
      </div>
    </section>
  );
}

function ListingsBoard({ deck, onOpenProfile, onSwipe, marketWindow }) {
  return (
    <section className="listings-board">
      <div className="panel-header">
        <div>
          <p className="topbar-label">{marketWindow === "social" ? "Golf friend profiles" : "Browse listings"}</p>
          <h3>{marketWindow === "social" ? "Future-round golfer connections" : "Marketplace-style tee time inventory"}</h3>
        </div>
        <div className="panel-status">{deck.length} {marketWindow === "social" ? "golfers nearby" : "live demo listings"}</div>
      </div>
      <div className="listing-grid">
        {deck.map((profile) => (
          <article className="listing-card" key={profile.id}>
            <div className="listing-image" style={{ backgroundImage: profile.image }} />
            <div className="listing-copy">
              <div className="notification-headline-row">
                <strong>{profile.name}</strong>
                <span className="tag verified">{profile.compatibility?.score ?? 0}% fit</span>
              </div>
              <p>{profile.surfaceMeta ?? `${profile.course} · ${profile.teeTime}`}</p>
              <div className="history-meta-row">
                <span>{profile.surfaceType ?? profile.type}</span>
                <span>{profile.handicap}</span>
                <span>{profile.surfaceBadge ?? `${profile.slots} spot${profile.slots > 1 ? "s" : ""}`}</span>
              </div>
              <div className="tag-row">
                {(profile.compatibility?.reasons ?? []).map((reason) => (
                  <span className="tag" key={reason}>
                    {reason}
                  </span>
                ))}
              </div>
              <div className="invite-actions-row">
                <button className="ghost-button compact" type="button" onClick={() => onOpenProfile(profile)}>
                  View
                </button>
                <button className="ghost-button compact" type="button" onClick={() => onSwipe("left", profile.id)}>
                  Pass
                </button>
                <button className="match-action" type="button" onClick={() => onSwipe("right", profile.id)}>
                  {marketWindow === "social" ? "Connect" : "Match"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ScorecardEditorModal({ round, onClose, onSave }) {
  const [draft, setDraft] = useState(round);

  useEffect(() => {
    setDraft(round);
  }, [round]);

  if (!round || !draft) return null;

  function updateScore(index, value) {
    const nextScores = draft.scorecard.scores.map((score, scoreIndex) =>
      scoreIndex === index ? Number(value) || 0 : score
    );
    setDraft((current) => ({
      ...current,
      scorecard: {
        ...current.scorecard,
        scores: nextScores,
        total: nextScores.reduce((sum, score) => sum + score, 0)
      }
    }));
  }

  function handleSave() {
    onSave(round.id, {
      scores: draft.scorecard.scores,
      pars: draft.scorecard.pars,
      uploadLabel: draft.scorecard.uploadLabel,
      personalNotes: draft.personalNotes
    });
    onClose();
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <section className="modal-card scorecard-modal">
        <div className="panel-header">
          <div>
            <p className="topbar-label">Editable scorecard</p>
            <h3>{round.title}</h3>
          </div>
          <button className="ghost-button compact" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="scorecard-editor-grid">
          {draft.scorecard.scores.map((score, index) => (
            <label className="score-hole" key={`${round.id}-hole-${index + 1}`}>
              <span>Hole {index + 1}</span>
              <small>Par {draft.scorecard.pars?.[index] ?? 4}</small>
              <input type="number" min="1" max="12" value={score} onChange={(event) => updateScore(index, event.target.value)} />
            </label>
          ))}
        </div>
        <div className="history-meta-row">
          <span>Total {draft.scorecard.total}</span>
          <span>Upload {draft.scorecard.uploadLabel ?? "No upload yet"}</span>
          {draft.statline ? <span>Over par {draft.statline.overPar > 0 ? `+${draft.statline.overPar}` : draft.statline.overPar}</span> : null}
        </div>
        {draft.statline ? (
          <div className="history-meta-row">
            <span>Best hole {draft.statline.bestHole}</span>
            <span>Worst hole {draft.statline.worstHole}</span>
          </div>
        ) : null}
        <label className="profile-span-2">
          Uploaded scorecard reference
          <input
            type="text"
            value={draft.scorecard.uploadLabel ?? ""}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                scorecard: {
                  ...current.scorecard,
                  uploadLabel: event.target.value
                }
              }))
            }
          />
        </label>
        <label className="profile-span-2">
          Personal notes
          <textarea
            rows="3"
            value={draft.personalNotes ?? ""}
            onChange={(event) => setDraft((current) => ({ ...current, personalNotes: event.target.value }))}
          />
        </label>
        <button className="primary-button" type="button" onClick={handleSave}>
          Save scorecard
        </button>
      </section>
    </div>
  );
}

function MatchList({ matches, activeMatchId, onOpenMatch, onCancelMatch, marketWindow }) {
  return (
    <section className="match-panel">
      <div className="match-panel-header">
        <div>
          <p className="topbar-label">{marketWindow === "social" ? "Connections" : "Active matches"}</p>
          <h3>{marketWindow === "social" ? "Golf friends you connected with" : "Golfers you clicked with"}</h3>
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
                  {match.mode === "social"
                    ? `${match.profile.homeCourse} · ${match.profile.availabilityWindow} · ${match.profile.socialStyle}`
                    : `${match.profile.course} · ${match.profile.teeTime} · ${match.profile.slots} slot${match.profile.slots > 1 ? "s" : ""}`}
                </p>
                <p className="match-meta">
                  {match.mode === "social" ? "Future round connection" : match.lifecycle?.label ?? "Needs round confirmation"}
                </p>
              </div>
              <div className="match-cta-group">
                <button className="match-action" type="button" onClick={() => onOpenMatch(match)}>
                  {match.mode === "social" ? "Open conversation" : "Open chat"}
                </button>
                {match.mode === "social" ? null : (
                  <button
                    className="ghost-button compact"
                    type="button"
                    onClick={() => onCancelMatch(match.id, "Schedule changed")}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </article>
          ))
        ) : (
          <article className="match-item">
            <div className="match-copy">
              <h4 className="match-name">No matches yet</h4>
              <p className="match-plan">
                {marketWindow === "social"
                  ? "Swipe through golfers you would want to meet for future rounds, then start a conversation."
                  : "Post a tee time, then swipe through golfers and groups that feel like the right fit."}
              </p>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

function RoundHistoryPanel({ rounds, onOpenRound, onReInvitePartner, onRebookRound }) {
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
              <button className="ghost-button compact" type="button" onClick={() => onOpenRound(round)}>
                Open round
              </button>
              {round.playAgainReady ? (
                <button className="ghost-button compact" type="button" onClick={() => onReInvitePartner(round.partnerName)}>
                  Play again
                </button>
              ) : null}
              <button className="ghost-button compact" type="button" onClick={() => onRebookRound(round.partnerName)}>
                Rebook round
              </button>
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

function PreviousPartnersPanel({ previousPartners, onFavoritePartner, onReInvitePartner, onRebookRound }) {
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
                {entry.trustProfile ? (
                  <div className="history-meta-row">
                    <span>{entry.trustProfile.overall} overall</span>
                    <span>{entry.trustProfile.wouldPlayAgainRate}% would play again</span>
                    <span>{entry.trustProfile.lastRoundLabel}</span>
                  </div>
                ) : null}
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
                <button className="ghost-button compact" type="button" onClick={() => onRebookRound(entry.profile.id)}>
                  Rebook
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
              {profile.surfaceMeta ?? `${profile.course} · ${profile.teeTime}`} · {profile.handicap}
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
  marketWindow,
  messages,
  loading,
  onSendMessage,
  onSubmitRating,
  onTrustAction,
  onConfirmationUpdate,
  onCompleteRound,
  onRebookRound
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
        <p className="topbar-label">{marketWindow === "social" ? "Connection workspace" : "Match workspace"}</p>
        <h3>{marketWindow === "social" ? "Open a connection to start chatting" : "Open a match to coordinate the round"}</h3>
        <p className="chat-empty-copy">
          {marketWindow === "social"
            ? "This side is just for meeting golf friends and seeing if you want to plan a future round together."
            : "The full demo story includes chat, confirmation, cancellations, trust tools, and post-round ratings."}
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
          <p className="topbar-label">{activeMatch.mode === "social" ? "Connection workspace" : "Match workspace"}</p>
          <h3>{activeMatch.profile.name}</h3>
          <p className="chat-subtitle">
            {activeMatch.mode === "social"
              ? `${activeMatch.profile.homeCourse} · ${activeMatch.profile.availabilityWindow} · ${activeMatch.profile.socialStyle}`
              : `${activeMatch.profile.course} · ${activeMatch.profile.teeTime}`}
          </p>
        </div>
        <div className="chat-pill">{activeMatch.mode === "social" ? "Future-round connection" : activeMatch.lifecycle?.label ?? "Needs confirmation"}</div>
      </div>

      {activeMatch.mode === "social" ? null : (
        <div className="lifecycle-strip">
          <div className={`lifecycle-pill ${activeMatch.lifecycle?.step === "matched" ? "active" : ""}`.trim()}>
            Matched
          </div>
          <div className={`lifecycle-pill ${activeMatch.lifecycle?.step === "confirmed" ? "active" : ""}`.trim()}>
            Confirmed
          </div>
          <div className={`lifecycle-pill ${activeMatch.lifecycle?.step === "played" ? "active" : ""}`.trim()}>
            Played
          </div>
          <div className={`lifecycle-pill ${activeMatch.lifecycle?.step === "completed" ? "active" : ""}`.trim()}>
            Rated
          </div>
        </div>
      )}

      <div className="trust-summary-grid">
        <div className="trust-card">
          <strong>{activeMatch.trustProfile?.overall?.toFixed?.(1) ?? activeMatch.profile.reliabilityRating?.toFixed(1) ?? "4.8"}</strong>
          <span>Overall trust</span>
        </div>
        <div className="trust-card">
          <strong>{activeMatch.trustProfile?.wouldPlayAgainRate ?? 100}%</strong>
          <span>Would play again</span>
        </div>
        <div className="trust-card">
          <strong>{activeMatch.trustProfile?.completedRounds ?? activeMatch.profile.completedRounds ?? 0}</strong>
          <span>Completed rounds</span>
        </div>
      </div>

      <div className="history-meta-row">
        <span>Pace {activeMatch.trustProfile?.pace ?? 4.8}</span>
        <span>Friendliness {activeMatch.trustProfile?.friendliness ?? 4.9}</span>
        <span>Reliability {activeMatch.trustProfile?.reliability ?? 4.8}</span>
        <span>Etiquette {activeMatch.trustProfile?.etiquette ?? 4.8}</span>
      </div>

      {activeMatch.mode === "social" ? null : (
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
      )}

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
          <p className="chat-empty-copy">
            {activeMatch.mode === "social"
              ? "No messages yet. Start with where you like to play and when you usually get out."
              : "No messages yet. Start coordinating the tee time."}
          </p>
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
          placeholder={
            activeMatch.mode === "social"
              ? "Message about favorite courses, usual play times, or planning a future round"
              : "Message about arrival time, carts, side game, or meeting spot"
          }
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
        {activeMatch.mode === "social" ? null : (
          <button className="ghost-button" type="button" onClick={() => onTrustAction(activeMatch.id, "no_show", "No-show flagged in demo")}>
            Flag no-show
          </button>
        )}
        <select className="compact-select" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)}>
          {CANCEL_REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
        {activeMatch.mode === "social" ? null : (
          <button className="ghost-button" type="button" onClick={() => onTrustAction(activeMatch.id, "cancel", cancelReason)}>
            Log cancellation
          </button>
        )}
        <button className="ghost-button danger" type="button" onClick={() => onTrustAction(activeMatch.id, "block", "Blocked from demo trust center")}>
          Block golfer
        </button>
        <button className="match-action" type="button" onClick={() => onRebookRound(activeMatch.profile.id)}>
          {activeMatch.mode === "social" ? "Invite to a future round" : "Rebook this group"}
        </button>
      </div>

      {activeMatch.mode === "social" ? null : (
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
        <div className="rating-actions-row">
          <button
            className="ghost-button"
            type="button"
            onClick={() => onCompleteRound(activeMatch.id)}
            disabled={activeMatch.lifecycle?.step === "played" || activeMatch.lifecycle?.step === "completed"}
          >
            Mark round as played
          </button>
          <button
            className="primary-button compact"
            type="button"
            onClick={() => onSubmitRating(activeMatch.id, review)}
            disabled={!review.overall || !["played", "completed"].includes(activeMatch.lifecycle?.step)}
          >
            Save rating
          </button>
        </div>
      </div>
      )}
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
  onCompleteRound,
  onRebookRound,
  onTeeTimeUpdate,
  onLogout,
  onSettingsChange,
  onFilterChange,
  onRefresh,
  onSwipe
}) {
  const [activeTab, setActiveTab] = useState("tee-time");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedRound, setSelectedRound] = useState(null);
  const [discoveryMode, setDiscoveryMode] = useState("swipe");
  const [marketWindow, setMarketWindow] = useState("groups");
  const unreadCount = notifications.filter((item) => item.unread).length;
  const featuredCourse = useMemo(() => courses[0] ?? null, [courses]);
  const hasSavedRounds = roundHistory.length > 0;
  const secondaryTabs = hasSavedRounds ? SECONDARY_TABS : [];
  const groupDeck = useMemo(() => buildWindowDeck(deck, "groups"), [deck]);
  const socialDeck = useMemo(() => buildWindowDeck(deck, "social"), [deck]);
  const windowDeck = useMemo(() => buildWindowDeck(deck, marketWindow), [deck, marketWindow]);
  const primaryTabs = useMemo(() => {
    if (marketWindow === "groups") {
      return [
        ["tee-time", "Post active tee time"],
        ["discovery", "Active tee times"],
        ["partners", "Previous partners"]
      ];
    }

    return [
      ["discovery", "Golf friends"],
      ["partners", "Previous partners"]
    ];
  }, [marketWindow]);
  const visibleFilters = useMemo(
    () => FILTERS.filter((value) => value !== "single" && value !== "group"),
    []
  );

  useEffect(() => {
    if (!hasSavedRounds && SECONDARY_TABS.some(([value]) => value === activeTab)) {
      setActiveTab("tee-time");
    }
  }, [activeTab, hasSavedRounds]);

  useEffect(() => {
    if (marketWindow === "social" && activeTab === "tee-time") {
      setActiveTab("discovery");
    }
  }, [activeTab, marketWindow]);

  useEffect(() => {
    if (filter === "single" || filter === "group") {
      onFilterChange("all");
    }
  }, [filter, onFilterChange]);

  return (
    <div className={`app-shell lane-${marketWindow}`.trim()}>
      <section className={`hero-panel hero-panel-redesign lane-panel lane-panel-${marketWindow}`.trim()}>
        <div className="hero-ribbon">
          <span className="hero-ribbon-mark"></span>
          Private matchmaker for incomplete tee times
        </div>
        <div className="hero-copy">
          <p className="eyebrow">TEE TIME MATCHING</p>
          <h1>{marketWindow === "groups" ? "Post a tee time and build the right foursome." : "Meet golfers first, plan the round later."}</h1>
          <p className="hero-text">
            {marketWindow === "groups"
              ? "This side of FindA4th is for active tee times that already have a course, date, and time and need golfers now."
              : "This side of FindA4th is for golfers without a tee time who just want to make golf friends for future rounds."}
          </p>
        </div>

        <div className="hero-marquee">
          {marketWindow === "groups" ? (
            <>
              <span>Active tee-time postings</span>
              <span>Match rankings and confirmations</span>
              <span>Fill an open spot now</span>
              <span>Round history and scorecards</span>
            </>
          ) : (
            <>
              <span>Meet new golf friends</span>
              <span>Availability and vibe matching</span>
              <span>No tee time required</span>
              <span>Rebook and play again</span>
            </>
          )}
        </div>

        <div className="hero-stats">
          <article>
            <strong>{marketWindow === "groups" ? (teeTime.postingType === "single" ? "Join" : `${teeTime.openSlots}`) : socialDeck.length}</strong>
            <span>{marketWindow === "groups" ? (teeTime.postingType === "single" ? "Looking for a group" : "Open spot to fill") : "Golf friends nearby"}</span>
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
          {marketWindow === "groups" ? (
            <>
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
            </>
          ) : (
            <>
              <article>
                <span>01</span>
                <h2>Friend-first discovery</h2>
                <p>Use this lane to meet golfers you would actually enjoy playing with before any tee time exists.</p>
              </article>
              <article>
                <span>02</span>
                <h2>Availability and vibe</h2>
                <p>Find people with similar schedules, personality, pace, and playing style for future rounds.</p>
              </article>
              <article>
                <span>03</span>
                <h2>Start the conversation</h2>
                <p>Connect, chat, and decide later if you want to set up a tee time together.</p>
              </article>
            </>
          )}
        </div>

        <section className="hero-showcase">
          <article className="hero-showcase-card hero-showcase-primary">
            <p className="topbar-label">{marketWindow === "groups" ? "Today&apos;s round" : "Social lane"}</p>
            <strong>{marketWindow === "groups" ? teeTime.homeCourse : user.homeCourse || "Your home course"}</strong>
            <span>{marketWindow === "groups" ? teeTime.dayLabel : `${user.availabilityWindow} · ${user.socialStyle}`}</span>
            <em>{marketWindow === "groups" ? `${teeTime.bookingStatus} · ${teeTime.greenFeeRange}` : "No tee time posted yet"}</em>
          </article>
          <article className="hero-showcase-card">
            <p className="topbar-label">{marketWindow === "social" ? "Social fit signal" : "Best-fit signal"}</p>
            <strong>{windowDeck[0]?.compatibility?.score ?? 0}% match</strong>
            <span>{windowDeck[0]?.name ?? "Waiting on the next golfer"}</span>
          </article>
        </section>

        {featuredCourse && marketWindow === "groups" ? (
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

      <main className={`phone-frame lane-frame lane-frame-${marketWindow}`.trim()}>
        <div className="phone-glow"></div>
        <section className={`app-card app-card-redesign lane-app-card lane-app-card-${marketWindow}`.trim()}>
          <header className="topbar">
            <div>
              <p className="topbar-label">FindA4th</p>
              <h2>Complete the round</h2>
              <p className="topbar-subtitle">
                {marketWindow === "groups"
                  ? "Active tee times are for rounds that are already posted and need golfers now."
                  : "Social is for golfers looking to meet people first and figure out a round later."}
              </p>
            </div>
            <div className="topbar-actions">
                <button className="ghost-button" type="button" onClick={onRefresh}>
                {marketWindow === "social" ? "Refresh golfers" : "Refresh deck"}
                </button>
              <button className="ghost-button" type="button" onClick={onLogout}>
                Log out
              </button>
            </div>
          </header>

          <MarketWindowSwitcher
            marketWindow={marketWindow}
            onChange={setMarketWindow}
            groupCount={groupDeck.length}
            socialCount={socialDeck.length}
          />

          <section className="view-tabs" aria-label="Primary app views">
            {primaryTabs.map(([value, label]) => (
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

          {secondaryTabs.length ? (
            <section className="secondary-tabs" aria-label="Additional app views">
              <span className="secondary-tabs-label">Unlocked after a completed round</span>
              <div className="secondary-tabs-row">
                {secondaryTabs.map(([value, label]) => (
                  <button
                    key={value}
                    className={`view-tab secondary ${activeTab === value ? "active" : ""}`.trim()}
                    type="button"
                    onClick={() => setActiveTab(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {marketWindow === "groups" && activeTab === "tee-time" ? (
            <>
              <section className={`intro-grid intro-grid-flow lane-intro-grid lane-intro-grid-${marketWindow}`.trim()}>
                <DemoSpotlight teeTime={teeTime} deck={windowDeck} matches={matches} notifications={notifications} invites={invites} />
                <div className="intro-sidecar">
                  <FlowGuide teeTime={teeTime} matches={matches} roundHistory={roundHistory} onJump={setActiveTab} />
                  <NotificationCenter notifications={notifications} onRead={onNotificationRead} />
                  <InvitePanel invites={invites} onCreateInvite={onCreateInvite} />
                </div>
              </section>

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
              <section className={`discovery-header-panel discovery-header-panel-${marketWindow}`.trim()}>
                <div>
                  <p className="topbar-label">{marketWindow === "social" ? "Social discovery" : "Group discovery"}</p>
                  <h3>
                    {marketWindow === "social"
                      ? "Meet golfers who want to set up a future round"
                      : teeTime.postingType === "single"
                        ? "Review groups around your posted tee time"
                        : "Review live group openings tied to real tee times"}
                  </h3>
                  <p className="posting-lead">
                    {marketWindow === "groups"
                      ? "Every card below is framed against the course, time, vibe, and skill window you posted in the tee-time step."
                      : "This window is intentionally separate from live tee times so people can connect first and decide on a future round later."}
                  </p>
                  <div className="surface-explainer-row">
                    <span className="summary-chip solid">
                      {marketWindow === "groups" ? "Active tee times only" : "No tee times in this tab"}
                    </span>
                    <span className="summary-chip">
                      {marketWindow === "groups" ? "Postings with date, time, and course" : "Golfers looking for golf friends"}
                    </span>
                  </div>
                </div>
                {marketWindow === "groups" ? (
                  <button className="ghost-button" type="button" onClick={() => setActiveTab("tee-time")}>
                    Edit tee time
                  </button>
                ) : null}
              </section>

              <section className="filters" aria-label="Profile filters">
                {visibleFilters.map((value) => (
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

              <DiscoveryContextPanel teeTime={teeTime} user={user} marketWindow={marketWindow} />

              <div className="segmented-control discovery-toggle">
                <button
                  className={`segment ${discoveryMode === "swipe" ? "active" : ""}`.trim()}
                  type="button"
                  onClick={() => setDiscoveryMode("swipe")}
                >
                  Swipe mode
                </button>
                <button
                  className={`segment ${discoveryMode === "browse" ? "active" : ""}`.trim()}
                  type="button"
                  onClick={() => setDiscoveryMode("browse")}
                >
                  Browse listings
                </button>
              </div>

              {discoveryMode === "swipe" ? (
                <>
                  <SwipeDeck deck={windowDeck} onSwipe={onSwipe} onOpenProfile={setSelectedProfile} />

                  <section className="actions">
                    <button className="swipe-button dismiss" type="button" onClick={() => onSwipe("left", windowDeck[0]?.id)}>
                      <span>x</span>
                    </button>
                    <button className="swipe-button approve" type="button" onClick={() => onSwipe("right", windowDeck[0]?.id)}>
                      <span>♥</span>
                    </button>
                  </section>
                </>
              ) : (
                <ListingsBoard deck={windowDeck} onOpenProfile={setSelectedProfile} onSwipe={onSwipe} marketWindow={marketWindow} />
              )}
            </>
          ) : null}

          {activeTab === "partners" ? (
            <PreviousPartnersPanel
              previousPartners={previousPartners}
              onFavoritePartner={onFavoritePartner}
              onReInvitePartner={onReInvitePartner}
              onRebookRound={onRebookRound}
            />
          ) : null}

          {activeTab === "history" ? (
            hasSavedRounds ? (
              <>
                <StatsDashboard rounds={roundHistory} />
                <RoundHistoryPanel
                  rounds={roundHistory}
                  onOpenRound={setSelectedRound}
                  onReInvitePartner={onReInvitePartner}
                  onRebookRound={onRebookRound}
                />
              </>
            ) : (
              <EmptyShelf
                title="Round history appears after you play"
                copy="Use the tee-time and discovery steps first. Once you mark a round as played, this shelf becomes your golf log."
                actionLabel="Go to discovery"
                onAction={() => setActiveTab("discovery")}
              />
            )
          ) : null}

          {activeTab === "dashboard" ? (
            hasSavedRounds ? (
              <PlayerDashboard rounds={roundHistory} user={user} previousPartners={previousPartners} />
            ) : (
              <EmptyShelf
                title="Dashboard unlocks after your first logged round"
                copy="Keep the first demo focused on posting a round, matching, and finishing the loop. Then the golf insights become meaningful."
                actionLabel="Post a tee time"
                onAction={() => setActiveTab("tee-time")}
              />
            )
          ) : null}

          {activeTab === "courses" ? (
            hasSavedRounds ? (
              <CoursePagesPanel courses={courses} />
            ) : (
              <EmptyShelf
                title="Course pages become more useful after a finished round"
                copy="They work best once there is history, favorite venues, and replay data feeding the demo."
                actionLabel="See previous partners"
                onAction={() => setActiveTab("partners")}
              />
            )
          ) : null}

          <MatchList
            matches={matches.filter((match) => (marketWindow === "social" ? match.mode === "social" : match.mode !== "social"))}
            activeMatchId={activeMatch?.id}
            onOpenMatch={onOpenMatch}
            onCancelMatch={onCancelMatch}
            marketWindow={marketWindow}
          />
          <MatchWorkspace
            activeMatch={activeMatch}
            marketWindow={marketWindow}
            messages={activeMessages}
            loading={chatLoading}
            onSendMessage={onSendMessage}
            onSubmitRating={onSubmitRating}
            onTrustAction={onTrustAction}
            onConfirmationUpdate={onConfirmationUpdate}
            onCompleteRound={onCompleteRound}
            onRebookRound={onRebookRound}
          />
        </section>
      </main>

      <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      <ScorecardEditorModal round={selectedRound} onClose={() => setSelectedRound(null)} onSave={onSaveScorecard} />
    </div>
  );
}
