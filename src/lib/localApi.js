import { defaultTeeTime, defaultUser, previousPartnersSeed, profiles } from "../data/profiles";

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

function filteredDeck(userState) {
  const swipedIds = new Set(userState.swipes.keys());

  return profiles.filter((profile) => {
    const distanceMatch = profile.distanceMiles <= userState.user.distance;
    const handicapMatch =
      Math.abs(profile.handicapValue - userState.user.handicap) <= userState.user.handicapRange;

    if (!distanceMatch || !handicapMatch || swipedIds.has(profile.id)) return false;
    if (userState.filter === "all") return true;
    if (userState.filter === "single") return profile.type === "Single";
    if (userState.filter === "group") return profile.type === "Group";
    return profile.vibe.toLowerCase() === userState.filter;
  });
}

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
    note: payload.note ?? currentTeeTime.note ?? defaultTeeTime.note,
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
    teeTime: clone(defaultTeeTime)
  };
}

function buildPreviousPartners(userState) {
  const seeded = previousPartnersSeed
    .map((entry) => {
      const profile = profiles.find((profile) => profile.id === entry.profileId);
      return profile
        ? {
            id: entry.id,
            profile,
            lastPlayed: entry.lastPlayed,
            chemistry: entry.chemistry,
            availablePosting: entry.availablePosting
          }
        : null;
    })
    .filter(Boolean);

  const derived = userState.matches
    .map((entry) => {
      const profile = profiles.find((profile) => profile.id === entry.profileId);
      if (!profile || previousPartnersSeed.some((seed) => seed.profileId === entry.profileId)) return null;
      return {
        id: `previous-${entry.profileId}`,
        profile,
        lastPlayed: "Played together recently",
        chemistry: "Saved from a completed FindA4th round",
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
        if (!profile) return null;
        const ratings = entry.ratings ?? { average: null, count: 0, userRating: null, host: null, guest: null };
        return {
          id: entry.id,
          profile,
          ratings
        };
      })
      .filter(Boolean),
    previousPartners: buildPreviousPartners(userState),
    teeTime: clone(userState.teeTime)
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
        ratings: {
          average: null,
          count: 0,
          userRating: null,
          host: null,
          guest: null
        }
      });
      userState.messageThreads.set(matchId, [
        {
          id: createToken(),
          sender: topProfile.name,
          text: `Looks like a fit for ${topProfile.teeTime}. Want to meet by the putting green 20 minutes early?`,
          sentAt: new Date().toISOString()
        }
      ]);
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
    userState.messageThreads.set(matchId, thread);
    return Promise.resolve(clone(thread));
  },

  submitRating(matchId, rating, note) {
    const userState = requireUser(this.token);
    const target = userState.matches.find((match) => match.id === matchId);
    if (!target) return Promise.reject(new Error("Match not found"));

    target.ratings = {
      average: Number(rating),
      count: 1,
      userRating: {
        rating: Number(rating),
        note: note?.trim() ?? "",
        raterRole: "host"
      },
      host: {
        rating: Number(rating),
        note: note?.trim() ?? "",
        raterRole: "host"
      },
      guest: null
    };

    return Promise.resolve(clone(target));
  }
};
