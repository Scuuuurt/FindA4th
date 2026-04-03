import { useState } from "react";

function labelize(value) {
  return value.replace("_", " ");
}

function ProfileCard({ profile, offset, dragX, dragging, onPointerDown, onOpenProfile, marketWindow }) {
  const isTop = offset === 0;
  const style = isTop
    ? { transform: `translateX(${dragX}px) rotate(${dragX / 18}deg)` }
    : undefined;

  const className = [
    "profile-card",
    offset === 1 ? "is-next" : "",
    offset >= 2 ? "is-back" : "",
    isTop && dragging ? "is-dragging" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={className} style={style} onPointerDown={isTop ? onPointerDown : undefined}>
      <div className="card-image" style={{ backgroundImage: profile.image }}>
        <div className="image-overlay"></div>
        <div className="badge-row">
          <span className="type-badge">{profile.surfaceType ?? profile.type}</span>
          <span className="slots-badge">
            {profile.surfaceBadge ??
              `${profile.slots} open slot${profile.slots > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      <div className="card-body">
        <div className="card-kicker-row">
          <span className="card-kicker">
            {marketWindow === "social" ? "Future-round fit" : "Best match right now"}
          </span>
          {profile.compatibility ? <span className="card-kicker">{profile.compatibility.score}% fit</span> : null}
          {profile.verifiedCourse ? <span className="card-kicker muted">Verified course</span> : null}
          {profile.verifiedGolfer ? <span className="card-kicker muted">Verified golfer</span> : null}
        </div>
        <div className="card-title-row">
          <div>
            <h3 className="profile-name">
              {profile.type === "Single" ? `${profile.name}, ${profile.age}` : profile.name}
            </h3>
            <p className="profile-meta">
              {profile.surfaceMeta ?? `${profile.course} · ${profile.teeTime}`}
            </p>
          </div>
          <div className="profile-handicap">{marketWindow === "social" ? profile.socialStyle : profile.handicap}</div>
        </div>

        <p className="profile-bio">{profile.bio}</p>

        {marketWindow === "social" ? (
          <div className="social-friend-grid">
            <div className="social-friend-card">
              <strong>Usually plays</strong>
              <span>{profile.availableDays?.join(" / ") || "Flexible"} · {profile.availabilityWindow}</span>
            </div>
            <div className="social-friend-card">
              <strong>Home base</strong>
              <span>{profile.homeCourse}</span>
            </div>
            <div className="social-friend-card">
              <strong>Round vibe</strong>
              <span>{profile.vibe} · {profile.socialStyle}</span>
            </div>
            <div className="social-friend-card">
              <strong>Good to know</strong>
              <span>{labelize(profile.mobilityPreference)} · {labelize(profile.musicPreference)}</span>
            </div>
          </div>
        ) : (
          <div className="detail-grid">
            <div className="detail-pill">{profile.fit}</div>
            <div className="detail-pill">{profile.distanceMiles} miles away</div>
            <div className="detail-pill">Home: {profile.homeCourse}</div>
            <div className="detail-pill">Vibe: {profile.vibe}</div>
            <div className="detail-pill">Pace: {profile.pace}</div>
            <div className="detail-pill">Gender: {profile.gender ?? "Prefer not to say"}</div>
            <div className="detail-pill">Move: {labelize(profile.mobilityPreference)}</div>
            <div className="detail-pill">Music: {labelize(profile.musicPreference)}</div>
            <div className="detail-pill">Window: {profile.availabilityWindow}</div>
            <div className="detail-pill">
              Rating: {profile.reliabilityRating?.toFixed(1) ?? "4.8"} ({profile.completedRounds} rounds)
            </div>
            <div className="detail-pill">Score focus: {profile.seriousness}</div>
            <div className="detail-pill">Game: {profile.gameStyle}</div>
          </div>
        )}

        {profile.compatibility?.reasons?.length ? (
          <div className="tag-row">
            {profile.compatibility.reasons.map((reason) => (
              <span className="tag verified" key={reason}>
                {reason}
              </span>
            ))}
          </div>
        ) : null}

        <div className="tag-row">
          {profile.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
          {profile.verifiedCourse ? <span className="tag verified">Verified course</span> : null}
          {profile.availableDays?.length ? (
            <span className="tag">{profile.availableDays.join(" / ")}</span>
          ) : null}
        </div>

        <div className="card-footer">
          <div>
            <strong>{profile.reliabilityRating?.toFixed(1) ?? "4.8"}</strong>
            <span>{marketWindow === "social" ? "Friend fit" : "Reliability"}</span>
          </div>
          <div>
            <strong>{marketWindow === "social" ? profile.distanceMiles : profile.completedRounds}</strong>
            <span>{marketWindow === "social" ? "Miles away" : "Rounds played"}</span>
          </div>
          <div>
            <strong>{marketWindow === "social" ? profile.homeCourse : profile.availabilityWindow}</strong>
            <span>{marketWindow === "social" ? "Home course" : "Typical window"}</span>
          </div>
        </div>

        <button className="ghost-button compact detail-button" type="button" onClick={() => onOpenProfile?.(profile)}>
          View full profile
        </button>
      </div>
    </article>
  );
}

export default function SwipeDeck({ deck, onSwipe, onOpenProfile }) {
  const [dragState, setDragState] = useState({ dragging: false, startX: 0, x: 0 });

  const topCard = deck[0];
  const laneClass =
    dragState.x > 24 ? "swiping-right" : dragState.x < -24 ? "swiping-left" : "";

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({ dragging: true, startX: event.clientX, x: 0 });
  }

  function handlePointerMove(event) {
    if (!dragState.dragging) return;
    setDragState((current) => ({
      ...current,
      x: event.clientX - current.startX
    }));
  }

  function handlePointerUp() {
    if (!dragState.dragging) return;
    const swipeX = dragState.x;
    setDragState({ dragging: false, startX: 0, x: 0 });

    if (swipeX > 90) onSwipe("right", topCard?.id);
    if (swipeX < -90) onSwipe("left", topCard?.id);
  }

  return (
    <section
      className={`deck-panel ${laneClass}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="decision-badge pass">Pass</div>
      <div className="decision-badge connect">Connect</div>

      <div className="card-stack">
        {topCard ? (
          deck
            .slice(0, 3)
            .map((profile, index) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                marketWindow={profile.marketWindow}
                offset={index}
                dragX={index === 0 ? dragState.x : 0}
                dragging={dragState.dragging}
                onPointerDown={handlePointerDown}
                onOpenProfile={onOpenProfile}
              />
            ))
            .reverse()
        ) : (
          <div className="empty-state">
            <div>
              <h3>No more golfers in this lane</h3>
              <p>Refresh the deck or loosen your filters to see more nearby golfers and groups.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
