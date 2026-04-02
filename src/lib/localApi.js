import {
  coursePagesSeed,
  defaultTeeTime,
  defaultUser,
  notificationsSeed,
  previousPartnersSeed,
  profiles,
  roundHistorySeed
} from "../data/profiles";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createToken() {
  return `local-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

const state = {
  users: new Map(),
  sessions: new Map()
};

function formatDayLabel(teeDate, teeTime) {
  if (!teeDate || !teeTime) return defaultTeeTime.dayLabel;
  const parsed = new Date(`${teeDate}T${teeTime}:00`);
  if (Number.isNaN(parsed.getTime())) return defaultTeeTime.dayLabel;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit"
  }).format(parsed);
}

function buildTeeTime(user) {
  if (user.playMode === "single") {
    return {
      ...clone(defaultTeeTime),
      homeCourse: user.homeCourse || defaultTeeTime.homeCourse,
      golfersCommitted: 1,
      openSlots: 0,
      postingType: "single"
    };
  }

  const golfersCommitted = Math.min(4, Math.max(2, Number(user.groupSize) || defaultUser.groupSize));
  return {
    ...clone(defaultTeeTime),
    homeCourse: user.homeCourse || defaultTeeTime.homeCourse,
    golfersCommitted,
    openSlots: Math.max(0, 4 - golfersCommitted),
    postingType: "group_owner"
  };
}

function normalizeTeeTime(currentTeeTime, user, payload = {}) {
  const postingState = buildTeeTime(user);
  const teeDate = payload.teeDate ?? currentTeeTime.teeDate ?? defaultTeeTime.teeDate;
  const teeTime = payload.teeTime ?? currentTeeTime.teeTime ?? defaultTeeTime.teeTime;

  return {
    ...clone(defaultTeeTime),
    ...currentTeeTime,
    ...postingState,
    homeCourse:
      payload.homeCourse ??
      currentTeeTime.homeCourse ??
      user.homeCourse ??
      defaultTeeTime.homeCourse,
    teeDate,
    teeTime,
    holes: Number(payload.holes ?? currentTeeTime.holes ?? defaultTeeTime.holes),
    bookingStatus: payload.bookingStatus ?? currentTeeTime.bookingStatus ?? defaultTeeTime.bookingStatus,
    note: payload.note ?? currentTeeTime.note ?? defaultTeeTime.note,
    preferredSkillWindow:
      payload.preferredSkillWindow ??
      currentTeeTime.preferredSkillWindow ??
      defaultTeeTime.preferredSkillWindow,
    roundMobility: payload.roundMobility ?? currentTeeTime.roundMobility ?? defaultTeeTime.roundMobility,
    fallbackMode: payload.fallbackMode ?? currentTeeTime.fallbackMode ?? defaultTeeTime.fallbackMode,
    greenFeeRange: payload.greenFeeRange ?? currentTeeTime.greenFeeRange ?? defaultTeeTime.greenFeeRange,
    meetingSpot: payload.meetingSpot ?? currentTeeTime.meetingSpot ?? defaultTeeTime.meetingSpot,
    dayLabel: formatDayLabel(teeDate, teeTime)
  };
}

function emptySnapshot() {
  return {
    authenticated: false,
    onboarded: false,
    user: clone(defaultUser),
    filter: "all",
    deck: [],
    matches: [],
    previousPartners: [],
    teeTime: clone(defaultTeeTime),
    notifications: [],
    courses: [],
    roundHistory: [],
    invites: []
  };
}

function compatibilityBreakdown(userState, profile) {
  const items = [];
  let score = 48;

  if (profile.homeCourse === userState.teeTime.homeCourse) {
    score += 16;
    items.push("Same course");
  }

  const distanceGap = Math.abs(profile.handicapValue - userState.user.handicap);
  if (distanceGap <= Math.max(2, userState.user.handicapRange / 2)) {
    score += 12;
    items.push("Tight handicap fit");
  } else if (distanceGap <= userState.user.handicapRange) {
    score += 6;
    items.push("Within handicap range");
  }

  const vibe = userState.user.preferredVibe === "any" || profile.preferredVibe === userState.user.preferredVibe;
  if (vibe) {
    score += 8;
    items.push("Preferred round vibe");
  }

  const dayOverlap = profile.availableDays?.some((day) => userState.user.availableDays.includes(day));
  if (dayOverlap) {
    score += 6;
    items.push("Availability overlap");
  }

  if (
    userState.user.mobilityPreference === "either" ||
    profile.mobilityPreference === "either" ||
    profile.mobilityPreference === userState.user.mobilityPreference
  ) {
    score += 4;
    items.push("Walk/cart match");
  }

  if (
    userState.user.musicPreference === "either" ||
    profile.musicPreference === userState.user.musicPreference
  ) {
    score += 3;
    items.push("Music preference");
  }

  if (profile.socialStyle === userState.user.socialStyle) {
    score += 4;
    items.push("Conversation style");
  }

  if (profile.gameStyle === userState.user.gameStyle) {
    score += 4;
    items.push("Side game fit");
  }

  if (profile.beginnerFriendly && userState.user.beginnerFriendly) {
    score += 3;
    items.push("Beginner-friendly");
  }

  if (profile.verifiedGolfer) {
    score += 2;
  }

  return {
    score: Math.max(58, Math.min(98, score)),
    reasons: items.slice(0, 4)
  };
}

function filteredDeck(userState) {
  const swipedIds = new Set(userState.swipes.keys());
  const blockedIds = userState.blockedProfiles ?? new Set();

  return profiles
    .filter((profile) => {
      const distanceMatch = profile.distanceMiles <= userState.user.distance;
      const handicapMatch =
        Math.abs(profile.handicapValue - userState.user.handicap) <= userState.user.handicapRange;
      const vibeMatch =
        userState.user.preferredVibe === "any" ||
        (profile.preferredVibe ?? profile.vibe.toLowerCase()) === userState.user.preferredVibe;
      const genderMatch =
        userState.user.genderPreference === "Anyone" ||
        (userState.user.genderPreference === "Women" && profile.gender === "Woman") ||
        (userState.user.genderPreference === "Men" && profile.gender === "Man") ||
        (userState.user.genderPreference === "Non-binary golfers" && profile.gender === "Non-binary");
      const mobilityMatch =
        userState.user.mobilityPreference === "either" ||
        profile.mobilityPreference === "either" ||
        profile.mobilityPreference === userState.user.mobilityPreference;
      const musicMatch =
        userState.user.musicPreference === "either" || profile.musicPreference === userState.user.musicPreference;
      const dayOverlap =
        !userState.user.availableDays?.length ||
        profile.availableDays?.some((day) => userState.user.availableDays.includes(day));
      const availabilityMatch =
        userState.user.availabilityWindow === "Any time" ||
        profile.availabilityWindow === userState.user.availabilityWindow;

      if (
        !distanceMatch ||
        !handicapMatch ||
        !vibeMatch ||
        !genderMatch ||
        !mobilityMatch ||
        !musicMatch ||
        !dayOverlap ||
        !availabilityMatch ||
        swipedIds.has(profile.id) ||
        blockedIds.has(profile.id)
      ) {
        return false;
      }

      if (userState.filter === "all") return true;
      if (userState.filter === "single") return profile.type === "Single";
      if (userState.filter === "group") return profile.type === "Group";
      return profile.vibe.toLowerCase() === userState.filter;
    })
    .map((profile) => ({
      ...profile,
      compatibility: compatibilityBreakdown(userState, profile)
    }))
    .sort((left, right) => right.compatibility.score - left.compatibility.score);
}

function trustSummary(userState, profileId, matchId) {
  const events = (userState.trustEvents ?? []).filter(
    (event) => event.profileId === profileId || (matchId && event.matchId === matchId)
  );

  return {
    blocked: (userState.blockedProfiles ?? new Set()).has(profileId),
    reported: events.some((event) => event.action === "report"),
    noShow: events.some((event) => event.action === "no_show"),
    cancellations: events.filter((event) => event.action === "cancel").length
  };
}

function buildPreviousPartners(userState) {
  const seeded = previousPartnersSeed
    .map((entry) => {
      const profile = profiles.find((profile) => profile.id === entry.profileId);
      const isFavorite = userState.favorites?.has(entry.profileId) ?? false;
      return profile
        ? {
            ...entry,
            profile,
            isFavorite,
            trusted: entry.wouldPlayAgain || isFavorite,
            trustProfile: buildTrustProfile(userState, profile)
          }
        : null;
    })
    .filter(Boolean);

  const derived = userState.matches
    .map((entry) => {
      const profile = profiles.find((profile) => profile.id === entry.profileId);
      if (
        !profile ||
        (userState.blockedProfiles ?? new Set()).has(entry.profileId) ||
        previousPartnersSeed.some((seed) => seed.profileId === entry.profileId)
      ) {
        return null;
      }

      const isFavorite = userState.favorites?.has(entry.profileId) ?? false;

      return {
        id: `previous-${entry.profileId}`,
        profile,
        lastPlayed: "Played together recently",
        chemistry: "Saved from a completed FindA4th round",
        trustedLabel: isFavorite ? "Saved as a favorite" : "Would likely play again",
        wouldPlayAgain: true,
        isFavorite,
        trusted: true,
        trustProfile: buildTrustProfile(userState, profile),
        availablePosting: {
          course: profile.course,
          teeTime: profile.teeTime,
          openSlots: profile.slots,
          note: "This partner has another opening available."
        }
      };
    })
    .filter(Boolean);

  return [...seeded, ...derived];
}

function buildInvites(userState) {
  return clone(userState.invites ?? []);
}

function buildTrustProfile(userState, profile) {
  const rounds = (userState.roundHistory ?? []).filter(
    (round) => round.partnerId === profile.id || round.partnerName === profile.name
  );
  const trustEvents = (userState.trustEvents ?? []).filter((event) => event.profileId === profile.id);
  const wouldPlayAgainCount = rounds.filter((round) => round.playAgainReady).length;
  const totals = rounds.reduce(
    (accumulator, round) => {
      const breakdown = round.ratingBreakdown ?? {};
      return {
        pace: accumulator.pace + (breakdown.pace ?? 0),
        friendliness: accumulator.friendliness + (breakdown.friendliness ?? 0),
        reliability: accumulator.reliability + (breakdown.reliability ?? 0),
        etiquette: accumulator.etiquette + (breakdown.etiquette ?? 0)
      };
    },
    { pace: 0, friendliness: 0, reliability: 0, etiquette: 0 }
  );
  const count = rounds.length || 1;

  return {
    overall:
      rounds.length > 0
        ? Number((rounds.reduce((sum, round) => sum + (round.rating ?? 0), 0) / rounds.length).toFixed(1))
        : Number(profile.reliabilityRating?.toFixed(1) ?? 4.8),
    completedRounds: profile.completedRounds + rounds.length,
    wouldPlayAgainRate: rounds.length ? Math.round((wouldPlayAgainCount / rounds.length) * 100) : 100,
    pace: rounds.length ? Number((totals.pace / count).toFixed(1)) : 4.8,
    friendliness: rounds.length ? Number((totals.friendliness / count).toFixed(1)) : 4.9,
    reliability: rounds.length ? Number((totals.reliability / count).toFixed(1)) : profile.reliabilityRating,
    etiquette: rounds.length ? Number((totals.etiquette / count).toFixed(1)) : 4.8,
    cancellations: trustEvents.filter((event) => event.action === "cancel").length,
    noShows: trustEvents.filter((event) => event.action === "no_show").length,
    lastRoundLabel: rounds[0]?.dateLabel ?? "No completed round yet"
  };
}

function buildLifecycle(match) {
  if (match.status === "completed") {
    return { step: "completed", label: "Round completed", detail: "Rated and saved to history" };
  }

  if (match.status === "played") {
    return { step: "played", label: "Round played", detail: "Waiting on post-round rating" };
  }

  if (match.confirmation?.confirmedByBoth) {
    return { step: "confirmed", label: "Confirmed", detail: "Round details locked in" };
  }

  return { step: "matched", label: "Needs confirmation", detail: "Confirm tee time details together" };
}

function snapshotForToken(token) {
  const userId = state.sessions.get(token);
  if (!userId) return emptySnapshot();
  const userState = state.users.get(userId);
  if (!userState) return emptySnapshot();

  return {
    authenticated: true,
    onboarded: userState.onboarded,
    user: clone(userState.user),
    filter: userState.filter,
    deck: filteredDeck(userState),
    matches: userState.matches
      .map((entry) => {
        const profile = profiles.find((profile) => profile.id === entry.profileId);
        if (!profile || (userState.blockedProfiles ?? new Set()).has(entry.profileId)) return null;

        return {
          id: entry.id,
          profile,
          status: entry.status ?? "matched",
          lifecycle: buildLifecycle(entry),
          ratings: entry.ratings ?? {
            average: null,
            count: 0,
            userRating: null,
            categories: null,
            wouldPlayAgain: null
          },
          confirmation: clone(entry.confirmation ?? null),
          trust: trustSummary(userState, entry.profileId, entry.id),
          trustProfile: buildTrustProfile(userState, profile)
        };
      })
      .filter(Boolean),
    previousPartners: buildPreviousPartners(userState),
    teeTime: clone(userState.teeTime),
    notifications: clone(userState.notifications),
    courses: clone(userState.courses),
    roundHistory: clone(userState.roundHistory),
    invites: buildInvites(userState)
  };
}

function requireUser(token) {
  const userId = state.sessions.get(token);
  if (!userId) throw new Error("Authentication required");
  return state.users.get(userId);
}

function normalizeCredentials(credentials) {
  return {
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password
  };
}

function defaultConfirmation(teeTime) {
  return {
    teeTime: teeTime.dayLabel,
    course: teeTime.homeCourse,
    bookingStatus: teeTime.bookingStatus,
    walkOrCart: teeTime.roundMobility,
    greenFee: teeTime.greenFeeRange,
    meetingSpot: teeTime.meetingSpot,
    confirmedByBoth: false
  };
}

export const localApi = {
  token: null,

  bootstrap() {
    return Promise.resolve(snapshotForToken(this.token));
  },

  signup(credentials) {
    const next = normalizeCredentials(credentials);
    if (!next.email) return Promise.reject(new Error("Email is required"));
    if (!next.password || next.password.length < 6) {
      return Promise.reject(new Error("Password must be at least 6 characters"));
    }
    if ([...state.users.values()].some((entry) => entry.email === next.email)) {
      return Promise.reject(new Error("An account with this email already exists"));
    }

    const userId = createToken();
    const token = createToken();
    state.users.set(userId, {
      email: next.email,
      password: next.password,
      onboarded: false,
      filter: "all",
      swipes: new Map(),
      matches: [],
      messageThreads: new Map(),
      blockedProfiles: new Set(),
      trustEvents: [],
      notifications: clone(notificationsSeed),
      courses: clone(coursePagesSeed),
      roundHistory: clone(roundHistorySeed),
      favorites: new Set(),
      invites: [
        {
          id: "invite-1",
          type: "Private round link",
          destination: "Share with the exact golfer or group you want",
          status: "Ready",
          value: "finda4th.app/demo/invite/sat824"
        }
      ],
      user: { ...clone(defaultUser), email: next.email },
      teeTime: { ...buildTeeTime({ ...clone(defaultUser), email: next.email }), id: createToken() }
    });
    state.sessions.set(token, userId);
    this.token = token;

    return Promise.resolve({ token, snapshot: snapshotForToken(token) });
  },

  login(credentials) {
    const next = normalizeCredentials(credentials);
    const entry = [...state.users.entries()].find(([, value]) => value.email === next.email);
    if (!entry || entry[1].password !== next.password) {
      return Promise.reject(new Error("Invalid email or password"));
    }
    const token = createToken();
    state.sessions.set(token, entry[0]);
    this.token = token;
    return Promise.resolve({ token, snapshot: snapshotForToken(token) });
  },

  logout() {
    if (this.token) state.sessions.delete(this.token);
    this.token = null;
    return Promise.resolve({ ok: true });
  },

  completeOnboarding(user) {
    const userState = requireUser(this.token);
    userState.onboarded = true;
    userState.user = { ...userState.user, ...clone(user) };
    userState.teeTime = normalizeTeeTime(userState.teeTime, userState.user, {
      homeCourse: userState.user.homeCourse
    });
    return Promise.resolve(snapshotForToken(this.token));
  },

  updateSettings(user) {
    const userState = requireUser(this.token);
    userState.user = { ...userState.user, ...clone(user) };
    userState.teeTime = normalizeTeeTime(userState.teeTime, userState.user, {
      homeCourse: userState.user.homeCourse
    });
    return Promise.resolve(snapshotForToken(this.token));
  },

  updateTeeTime(teeTime) {
    const userState = requireUser(this.token);
    userState.teeTime = normalizeTeeTime(userState.teeTime, userState.user, clone(teeTime));
    return Promise.resolve(snapshotForToken(this.token));
  },

  setFilter(filter) {
    const userState = requireUser(this.token);
    userState.filter = filter;
    return Promise.resolve(snapshotForToken(this.token));
  },

  refreshDeck() {
    return Promise.resolve(snapshotForToken(this.token));
  },

  swipe(direction) {
    const userState = requireUser(this.token);
    const topProfile = filteredDeck(userState)[0];
    if (!topProfile) return Promise.resolve(snapshotForToken(this.token));

    userState.swipes.set(topProfile.id, direction);
    if (direction === "right" && !userState.matches.some((match) => match.profileId === topProfile.id)) {
      const matchId = `match-${createToken()}`;
      userState.matches.unshift({
        id: matchId,
        profileId: topProfile.id,
        status: "matched",
        confirmation: defaultConfirmation(userState.teeTime),
        ratings: {
          average: null,
          count: 0,
          userRating: null,
          categories: null,
          wouldPlayAgain: null
        }
      });
      userState.messageThreads.set(matchId, [
        {
          id: createToken(),
          sender: topProfile.name,
          text: `Looks like a fit for ${topProfile.teeTime}. Want to confirm carts, green fee, and meet by the putting green 20 minutes early?`,
          sentAt: new Date().toISOString()
        }
      ]);
      userState.notifications.unshift({
        id: createToken(),
        title: "New match created",
        body: `${topProfile.name} is ready to coordinate this round.`,
        timeLabel: "Just now",
        type: "match",
        unread: true
      });
    }
    return Promise.resolve(snapshotForToken(this.token));
  },

  getMessages(matchId) {
    const userState = requireUser(this.token);
    return Promise.resolve(clone(userState.messageThreads.get(matchId) ?? []));
  },

  sendMessage(matchId, text) {
    const userState = requireUser(this.token);
    const thread = userState.messageThreads.get(matchId) ?? [];
    thread.push({
      id: createToken(),
      sender: userState.user.name || "You",
      text: text.trim(),
      sentAt: new Date().toISOString()
    });
    const target = userState.matches.find((match) => match.id === matchId);
    const profile = profiles.find((entry) => entry.id === target?.profileId);
    if (profile) {
      thread.push({
        id: createToken(),
        sender: profile.name,
        text:
          target?.confirmation?.confirmedByBoth
            ? `Perfect. I am locked in for ${target.confirmation.teeTime} and will see you at ${target.confirmation.meetingSpot}.`
            : "Sounds good on my side. Send the final green fee and meeting spot and I can confirm right away.",
        sentAt: new Date(Date.now() + 60000).toISOString()
      });
    }
    userState.messageThreads.set(matchId, thread);
    return Promise.resolve(clone(thread));
  },

  completeRound(matchId) {
    const userState = requireUser(this.token);
    const target = userState.matches.find((match) => match.id === matchId);
    if (!target) return Promise.reject(new Error("Match not found"));
    target.status = "played";
    userState.notifications.unshift({
      id: createToken(),
      title: "Round marked as played",
      body: "You can now leave ratings and save the round to history.",
      timeLabel: "Just now",
      type: "round",
      unread: true
    });
    return Promise.resolve(snapshotForToken(this.token));
  },

  submitRating(matchId, payload, legacyNote) {
    const userState = requireUser(this.token);
    const target = userState.matches.find((match) => match.id === matchId);
    if (!target) return Promise.reject(new Error("Match not found"));

    const normalized =
      typeof payload === "number"
        ? {
            overall: Number(payload),
            note: legacyNote?.trim() ?? "",
            categories: {
              pace: Number(payload),
              friendliness: Number(payload),
              reliability: Number(payload),
              etiquette: Number(payload)
            },
            wouldPlayAgain: true
          }
        : {
            overall: Number(payload.overall),
            note: payload.note?.trim() ?? "",
            categories: clone(payload.categories),
            wouldPlayAgain: Boolean(payload.wouldPlayAgain)
          };

    target.ratings = {
      average: normalized.overall,
      count: 1,
      userRating: {
        rating: normalized.overall,
        note: normalized.note,
        raterRole: "host"
      },
      categories: normalized.categories,
      wouldPlayAgain: normalized.wouldPlayAgain
    };
    target.status = "completed";

    const profile = profiles.find((entry) => entry.id === target.profileId);
    userState.roundHistory.unshift({
      id: createToken(),
      matchId,
      title: `${userState.teeTime.homeCourse} FindA4th Round`,
      course: userState.teeTime.homeCourse,
      dateLabel: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
        new Date()
      ),
      partnerId: profile?.id ?? null,
      partnerName: profile?.name ?? "Matched golfer",
      result: "Played",
      rating: normalized.overall,
      ratingBreakdown: normalized.categories,
      note: normalized.note || "Round rated and saved from the match workspace.",
      scorecard: {
        holes: userState.teeTime.holes,
        scores: Array.from({ length: userState.teeTime.holes }, () => 4),
        total: userState.teeTime.holes === 18 ? 72 : 36
      },
      confirmation: clone(target.confirmation ?? defaultConfirmation(userState.teeTime)),
      playAgainReady: normalized.wouldPlayAgain
    });

    userState.notifications.unshift({
      id: createToken(),
      title: "Round added to history",
      body: "Your rating and round details were saved to your golf log.",
      timeLabel: "Just now",
      type: "rating",
      unread: true
    });

    return Promise.resolve(snapshotForToken(this.token));
  },

  runTrustAction(matchId, action, reason = "") {
    const userState = requireUser(this.token);
    const target = userState.matches.find((match) => match.id === matchId);
    if (!target) return Promise.reject(new Error("Match not found"));

    if (action === "block") {
      userState.blockedProfiles.add(target.profileId);
      userState.matches = userState.matches.filter((match) => match.profileId !== target.profileId);
      userState.messageThreads.delete(matchId);
      return Promise.resolve(snapshotForToken(this.token));
    }

    userState.trustEvents.push({
      id: createToken(),
      matchId,
      profileId: target.profileId,
      action,
      reason,
      createdAt: new Date().toISOString()
    });

    userState.notifications.unshift({
      id: createToken(),
      title: action === "cancel" ? "Cancellation logged" : "Trust action recorded",
      body:
        action === "cancel"
          ? `Cancellation reason saved${reason ? `: ${reason}` : "."}`
          : "The trust center was updated for this round.",
      timeLabel: "Just now",
      type: "trust",
      unread: true
    });

    return Promise.resolve(snapshotForToken(this.token));
  },

  updateConfirmation(matchId, confirmation) {
    const userState = requireUser(this.token);
    const target = userState.matches.find((match) => match.id === matchId);
    if (!target) return Promise.reject(new Error("Match not found"));
    target.confirmation = {
      ...(target.confirmation ?? defaultConfirmation(userState.teeTime)),
      ...clone(confirmation)
    };
    if (target.confirmation.confirmedByBoth) {
      target.status = "confirmed";
    }
    userState.notifications.unshift({
      id: createToken(),
      title: "Round confirmation updated",
      body: "The match now has a clearer tee-time plan for both sides.",
      timeLabel: "Just now",
      type: "match",
      unread: true
    });
    return Promise.resolve(snapshotForToken(this.token));
  },

  markNotificationRead(notificationId) {
    const userState = requireUser(this.token);
    userState.notifications = userState.notifications.map((notification) =>
      notification.id === notificationId ? { ...notification, unread: false } : notification
    );
    return Promise.resolve(snapshotForToken(this.token));
  },

  favoritePartner(profileId) {
    const userState = requireUser(this.token);
    userState.favorites.add(profileId);
    userState.notifications.unshift({
      id: createToken(),
      title: "Favorite saved",
      body: "This golfer will be easier to find again in future rounds.",
      timeLabel: "Just now",
      type: "favorite",
      unread: true
    });
    return Promise.resolve(snapshotForToken(this.token));
  },

  reInvitePartner(profileId) {
    const userState = requireUser(this.token);
    const profile =
      profiles.find((entry) => entry.id === profileId) ??
      profiles.find((entry) => entry.name === profileId);
    const partnerName = profile?.name ?? profileId;

    userState.invites.unshift({
      id: createToken(),
      type: "Play-again invite",
      destination: partnerName,
      status: "Sent",
      value: `Invite for ${userState.teeTime.homeCourse} on ${userState.teeTime.dayLabel}`
    });
    userState.notifications.unshift({
      id: createToken(),
      title: "Re-invite sent",
      body: `A demo re-invite was sent to ${partnerName} for your next round.`,
      timeLabel: "Just now",
      type: "invite",
      unread: true
    });
    return Promise.resolve(snapshotForToken(this.token));
  },

  rebookRound(source) {
    const userState = requireUser(this.token);
    const profile =
      profiles.find((entry) => entry.id === source) ??
      profiles.find((entry) => entry.name === source);
    const partnerName = profile?.name ?? source;

    userState.invites.unshift({
      id: createToken(),
      type: "Rebooked round",
      destination: partnerName,
      status: "Drafted",
      value: `${userState.teeTime.homeCourse} · next ${userState.user.availabilityWindow.toLowerCase()}`
    });
    userState.notifications.unshift({
      id: createToken(),
      title: "Rebook flow started",
      body: `${partnerName} was added to a fresh tee-time draft for the next round.`,
      timeLabel: "Just now",
      type: "invite",
      unread: true
    });
    return Promise.resolve(snapshotForToken(this.token));
  },

  saveScorecard(roundId, scores) {
    const userState = requireUser(this.token);
    userState.roundHistory = userState.roundHistory.map((round) => {
      if (round.id !== roundId) return round;
      const safeScores = scores.map((value) => Number(value) || 0);
      return {
        ...round,
        scorecard: {
          ...round.scorecard,
          scores: safeScores,
          total: safeScores.reduce((sum, value) => sum + value, 0)
        }
      };
    });
    userState.notifications.unshift({
      id: createToken(),
      title: "Scorecard saved",
      body: "Your round history now includes the updated scorecard.",
      timeLabel: "Just now",
      type: "scorecard",
      unread: true
    });
    return Promise.resolve(snapshotForToken(this.token));
  },

  cancelMatch(matchId, reason = "No reason selected") {
    const userState = requireUser(this.token);
    const target = userState.matches.find((match) => match.id === matchId);
    if (!target) return Promise.reject(new Error("Match not found"));
    userState.matches = userState.matches.filter((match) => match.id !== matchId);
    userState.trustEvents.push({
      id: createToken(),
      matchId,
      profileId: target.profileId,
      action: "cancel",
      reason,
      createdAt: new Date().toISOString()
    });
    userState.notifications.unshift({
      id: createToken(),
      title: "Match cancelled",
      body: `This tee time pairing was cancelled in the demo flow${reason ? `: ${reason}` : "."}`,
      timeLabel: "Just now",
      type: "trust",
      unread: true
    });
    return Promise.resolve(snapshotForToken(this.token));
  },

  createInvite(kind) {
    const userState = requireUser(this.token);
    const invite = {
      id: createToken(),
      type:
        kind === "friend"
          ? "Invite a friend"
          : kind === "share"
            ? "Share posting"
            : "Private round link",
      destination:
        kind === "friend"
          ? "Text this to a golf buddy"
          : kind === "share"
            ? "Post this listing externally"
            : "Direct invite to one golfer or group",
      status: "Ready",
      value: `finda4th.app/demo/${kind}/${userState.teeTime.homeCourse.toLowerCase().replace(/\s+/g, "-")}`
    };
    userState.invites.unshift(invite);
    userState.notifications.unshift({
      id: createToken(),
      title: "Invite created",
      body: `${invite.type} is ready to share from this tee-time post.`,
      timeLabel: "Just now",
      type: "invite",
      unread: true
    });
    return Promise.resolve(snapshotForToken(this.token));
  }
};
