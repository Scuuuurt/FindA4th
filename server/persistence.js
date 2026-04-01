import { defaultTeeTime, defaultUser, previousPartnersSeed, profiles } from "../src/data/profiles.js";
import { createId, hashPassword, verifyPassword } from "./auth.js";
import { hasDatabase, query } from "./db.js";

const SESSION_PREFIX = "sess";
const USER_PREFIX = "user";
const TEE_TIME_PREFIX = "tt";
const MESSAGE_PREFIX = "msg";
const RATING_PREFIX = "rating";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function profileById(profileId) {
  return profiles.find((profile) => profile.id === Number(profileId)) ?? null;
}

function filteredDeck(sourceProfiles, user, filter, swipedIds) {
  return sourceProfiles.filter((profile) => {
    const distanceMatch = profile.distanceMiles <= user.distance;
    const handicapMatch =
      Math.abs(profile.handicapValue - Number(user.handicap)) <= Number(user.handicapRange);
    const vibeMatch =
      (user.preferredVibe ?? "any") === "any" ||
      (profile.preferredVibe ?? profile.vibe.toLowerCase()) === user.preferredVibe;
    const genderMatch =
      (user.genderPreference ?? "Anyone") === "Anyone" ||
      ((user.genderPreference ?? "Anyone") === "Women" && profile.gender === "Woman") ||
      ((user.genderPreference ?? "Anyone") === "Men" && profile.gender === "Man") ||
      ((user.genderPreference ?? "Anyone") === "Non-binary golfers" &&
        profile.gender === "Non-binary");
    const mobilityMatch =
      (user.mobilityPreference ?? "either") === "either" ||
      profile.mobilityPreference === "either" ||
      profile.mobilityPreference === user.mobilityPreference;
    const musicMatch =
      (user.musicPreference ?? "either") === "either" ||
      profile.musicPreference === user.musicPreference;
    const dayOverlap =
      !(user.availableDays ?? []).length ||
      profile.availableDays?.some((day) => user.availableDays.includes(day));
    const availabilityMatch =
      (user.availabilityWindow ?? "Any time") === "Any time" ||
      profile.availabilityWindow === user.availabilityWindow;

    if (
      !distanceMatch ||
      !handicapMatch ||
      !vibeMatch ||
      !genderMatch ||
      !mobilityMatch ||
      !musicMatch ||
      !dayOverlap ||
      !availabilityMatch ||
      swipedIds.has(profile.id)
    ) {
      return false;
    }
    if (filter === "all") return true;
    if (filter === "single") return profile.type === "Single";
    if (filter === "group") return profile.type === "Group";
    return profile.vibe.toLowerCase() === filter;
  });
}

function parseDays(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function serializeDays(value) {
  return parseDays(value).join(",");
}

function assertEmailAndPassword(payload = {}) {
  if (!payload.email?.trim()) throw new Error("Email is required");
  if (!payload.password || payload.password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
}

function assertMessage(payload = {}) {
  if (!payload.text?.trim()) throw new Error("Message text is required");
}

function assertRating(payload = {}) {
  const value = Number(payload.rating);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
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

function userFromRow(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? "",
    homeCourse: row.home_course ?? "",
    handicap: Number(row.handicap),
    distance: Number(row.distance),
    handicapRange: Number(row.handicap_range),
    preferredVibe: row.preferred_vibe ?? "any",
    gender: row.gender ?? "Prefer not to say",
    genderPreference: row.gender_preference ?? "Anyone",
    mobilityPreference: row.mobility_preference ?? "either",
    musicPreference: row.music_preference ?? "either",
    availableDays: parseDays(row.available_days ?? "Sat,Sun"),
    availabilityWindow: row.availability_window ?? "Any time",
    playMode: row.play_mode ?? "group_owner",
    groupSize: Number(row.group_size ?? 3)
  };
}

function teeTimeFromRow(row, homeCourse) {
  return {
    id: row?.id ?? defaultTeeTime.id,
    teeDate: row?.tee_date ?? defaultTeeTime.teeDate,
    teeTime: row?.tee_time ?? defaultTeeTime.teeTime,
    dayLabel:
      row?.day_label ??
      formatDayLabel(row?.tee_date ?? defaultTeeTime.teeDate, row?.tee_time ?? defaultTeeTime.teeTime),
    homeCourse: row?.home_course ?? homeCourse ?? defaultTeeTime.homeCourse,
    postingType: row?.posting_type ?? defaultTeeTime.postingType,
    golfersCommitted: row?.golfers_committed ?? defaultTeeTime.golfersCommitted,
    openSlots: row?.open_slots ?? defaultTeeTime.openSlots,
    holes: Number(row?.holes ?? defaultTeeTime.holes),
    note: row?.note ?? defaultTeeTime.note
  };
}

function buildPostingState(user) {
  if ((user.playMode ?? "group_owner") === "single") {
    return {
      postingType: "single",
      golfersCommitted: 1,
      openSlots: 0
    };
  }

  const golfersCommitted = Math.min(4, Math.max(2, Number(user.groupSize) || defaultUser.groupSize));
  return {
    postingType: "group_owner",
    golfersCommitted,
    openSlots: Math.max(0, 4 - golfersCommitted)
  };
}

function normalizeTeeTime(currentTeeTime = defaultTeeTime, user = defaultUser, payload = {}) {
  const postingState = buildPostingState(user);
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

function defaultSnapshot() {
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

function matchGreeting(profile) {
  return `Looks like a fit for ${profile.teeTime}. Want to meet by the putting green 20 minutes early?`;
}

function ratingsSummary(entries = []) {
  const host = entries.find((entry) => entry.raterRole === "host") ?? null;
  const guest = entries.find((entry) => entry.raterRole === "guest") ?? null;
  const average =
    entries.length > 0
      ? Number((entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length).toFixed(1))
      : null;

  return {
    average,
    count: entries.length,
    host,
    guest,
    userRating: host
  };
}

function buildMatch(profile, matchId, ratingEntries = [], trust = {}) {
  return {
    id: matchId,
    profile,
    ratings: ratingsSummary(ratingEntries),
    trust
  };
}

function buildPreviousPartners(matches = []) {
  const seeded = previousPartnersSeed
    .map((entry) => {
      const profile = profileById(entry.profileId);
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

  const derived = matches
    .map((match) => {
      const profile = match.profile;
      if (!profile || previousPartnersSeed.some((entry) => entry.profileId === profile.id)) return null;
      return {
        id: `previous-${match.id}`,
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

function createMemoryRepository() {
  const state = {
    users: new Map(),
    sessions: new Map(),
    teeTimes: new Map(),
    swipes: new Map(),
    matches: new Map(),
    blockedProfiles: new Map(),
    trustEvents: new Map(),
    messageThreads: new Map(),
    ratings: new Map()
  };

  function ensureCollections(userId) {
    if (!state.teeTimes.has(userId)) {
      state.teeTimes.set(userId, { ...clone(defaultTeeTime), id: createId(TEE_TIME_PREFIX) });
    }
    if (!state.swipes.has(userId)) state.swipes.set(userId, new Map());
    if (!state.matches.has(userId)) state.matches.set(userId, []);
    if (!state.blockedProfiles.has(userId)) state.blockedProfiles.set(userId, new Set());
    if (!state.trustEvents.has(userId)) state.trustEvents.set(userId, []);
  }

  function findUserByEmail(email) {
    return [...state.users.values()].find((user) => user.email === email) ?? null;
  }

  function matchIdFor(userId, profileId) {
    return `match-${userId}-${profileId}`;
  }

  function snapshotForUser(userId) {
    const account = state.users.get(userId);
    if (!account) return defaultSnapshot();

    ensureCollections(userId);
    const swipeMap = state.swipes.get(userId);
    const swipedIds = new Set([...swipeMap.keys()].map(Number));
    const blockedIds = state.blockedProfiles.get(userId);
    const matches = state.matches
      .get(userId)
      .map((profileId) => {
        const profile = profileById(profileId);
        if (!profile || blockedIds.has(profileId)) return null;
        const matchId = matchIdFor(userId, profileId);
        const trustEvents = state.trustEvents.get(userId).filter((event) => event.matchId === matchId);
        return buildMatch(profile, matchId, state.ratings.get(matchId) ?? [], {
          blocked: blockedIds.has(profileId),
          reported: trustEvents.some((event) => event.action === "report"),
          noShow: trustEvents.some((event) => event.action === "no_show")
        });
      })
      .filter(Boolean);

    return {
      authenticated: true,
      onboarded: account.onboarded,
      user: {
        name: account.name,
        email: account.email,
        homeCourse: account.homeCourse,
        handicap: account.handicap,
        distance: account.distance,
        handicapRange: account.handicapRange,
        preferredVibe: account.preferredVibe,
        gender: account.gender,
        genderPreference: account.genderPreference,
        mobilityPreference: account.mobilityPreference,
        musicPreference: account.musicPreference,
        availableDays: account.availableDays,
        availabilityWindow: account.availabilityWindow,
        playMode: account.playMode,
        groupSize: account.groupSize
      },
      filter: account.currentFilter,
      deck: filteredDeck(profiles, account, account.currentFilter, swipedIds).filter(
        (profile) => !blockedIds.has(profile.id)
      ),
      matches,
      previousPartners: buildPreviousPartners(matches),
      teeTime: clone(state.teeTimes.get(userId))
    };
  }

  function sessionUserId(token) {
    return state.sessions.get(token) ?? null;
  }

  function ensureMatchAccess(userId, matchId) {
    if (!matchId.startsWith(`match-${userId}-`)) throw new Error("Match not found");
  }

  return {
    mode: "memory",

    async bootstrapState(sessionToken) {
      const userId = sessionUserId(sessionToken);
      if (!userId) return defaultSnapshot();
      return snapshotForUser(userId);
    },

    async signup(payload = {}) {
      assertEmailAndPassword(payload);
      const email = payload.email.trim().toLowerCase();
      if (findUserByEmail(email)) throw new Error("An account with this email already exists");

      const userId = createId(USER_PREFIX);
      const sessionToken = createId(SESSION_PREFIX);
      state.users.set(userId, {
        id: userId,
        email,
        passwordHash: hashPassword(payload.password),
        name: "",
        homeCourse: "",
        handicap: defaultUser.handicap,
        distance: defaultUser.distance,
        handicapRange: defaultUser.handicapRange,
        preferredVibe: defaultUser.preferredVibe,
        gender: defaultUser.gender,
        genderPreference: defaultUser.genderPreference,
        mobilityPreference: defaultUser.mobilityPreference,
        musicPreference: defaultUser.musicPreference,
        availableDays: clone(defaultUser.availableDays),
        availabilityWindow: defaultUser.availabilityWindow,
        playMode: defaultUser.playMode,
        groupSize: defaultUser.groupSize,
        currentFilter: "all",
        onboarded: false
      });
      state.sessions.set(sessionToken, userId);
      ensureCollections(userId);

      return { token: sessionToken, snapshot: snapshotForUser(userId) };
    },

    async login(payload = {}) {
      assertEmailAndPassword(payload);
      const email = payload.email.trim().toLowerCase();
      const account = findUserByEmail(email);
      if (!account || !verifyPassword(payload.password, account.passwordHash)) {
        throw new Error("Invalid email or password");
      }

      const sessionToken = createId(SESSION_PREFIX);
      state.sessions.set(sessionToken, account.id);
      return { token: sessionToken, snapshot: snapshotForUser(account.id) };
    },

    async logout(sessionToken) {
      if (sessionToken) state.sessions.delete(sessionToken);
      return { ok: true };
    },

    async completeOnboarding(sessionToken, payload = {}) {
      const userId = sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");

      const account = state.users.get(userId);
      const nextAccount = {
        ...account,
        name: payload.name ?? "",
        homeCourse: payload.homeCourse ?? "",
        handicap: Number(payload.handicap),
        distance: Number(payload.distance),
        handicapRange: Number(payload.handicapRange),
        preferredVibe: payload.preferredVibe ?? account.preferredVibe,
        gender: payload.gender ?? account.gender,
        genderPreference: payload.genderPreference ?? account.genderPreference,
        mobilityPreference: payload.mobilityPreference ?? account.mobilityPreference,
        musicPreference: payload.musicPreference ?? account.musicPreference,
        availableDays: parseDays(payload.availableDays ?? account.availableDays),
        availabilityWindow: payload.availabilityWindow ?? account.availabilityWindow,
        playMode: payload.playMode ?? account.playMode,
        groupSize:
          payload.playMode === "single"
            ? 1
            : Math.min(4, Math.max(2, Number(payload.groupSize ?? account.groupSize))),
        onboarded: true
      };

      state.users.set(userId, nextAccount);
      state.teeTimes.set(
        userId,
        normalizeTeeTime(state.teeTimes.get(userId), nextAccount, {
          homeCourse: nextAccount.homeCourse || defaultTeeTime.homeCourse
        })
      );

      return snapshotForUser(userId);
    },

    async updateSettings(sessionToken, payload = {}) {
      const userId = sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");

      const account = state.users.get(userId);
      const nextAccount = {
        ...account,
        ...payload,
        handicap: Number(payload.handicap ?? account.handicap),
        distance: Number(payload.distance ?? account.distance),
        handicapRange: Number(payload.handicapRange ?? account.handicapRange),
        preferredVibe: payload.preferredVibe ?? account.preferredVibe,
        gender: payload.gender ?? account.gender,
        genderPreference: payload.genderPreference ?? account.genderPreference,
        mobilityPreference: payload.mobilityPreference ?? account.mobilityPreference,
        musicPreference: payload.musicPreference ?? account.musicPreference,
        availableDays: parseDays(payload.availableDays ?? account.availableDays),
        availabilityWindow: payload.availabilityWindow ?? account.availabilityWindow,
        playMode: payload.playMode ?? account.playMode,
        groupSize:
          (payload.playMode ?? account.playMode) === "single"
            ? 1
            : Math.min(4, Math.max(2, Number(payload.groupSize ?? account.groupSize)))
      };

      state.users.set(userId, nextAccount);
      state.teeTimes.set(
        userId,
        normalizeTeeTime(state.teeTimes.get(userId), nextAccount, {
          homeCourse: nextAccount.homeCourse || defaultTeeTime.homeCourse
        })
      );

      return snapshotForUser(userId);
    },

    async updateTeeTime(sessionToken, payload = {}) {
      const userId = sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");

      const account = state.users.get(userId);
      state.teeTimes.set(userId, normalizeTeeTime(state.teeTimes.get(userId), account, payload));
      return snapshotForUser(userId);
    },

    async setFilter(sessionToken, filter = "all") {
      const userId = sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");
      const account = state.users.get(userId);
      state.users.set(userId, { ...account, currentFilter: filter });
      return snapshotForUser(userId);
    },

    async swipeProfile(sessionToken, direction) {
      const userId = sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");

      const snapshot = snapshotForUser(userId);
      const topProfile = snapshot.deck[0];
      if (!topProfile) return snapshot;

      state.swipes.get(userId).set(topProfile.id, direction);

      if (direction === "right") {
        const existing = state.matches.get(userId);
        if (!existing.includes(topProfile.id)) {
          state.matches.set(userId, [topProfile.id, ...existing]);
          const matchId = matchIdFor(userId, topProfile.id);
          state.messageThreads.set(matchId, [
            {
              id: createId(MESSAGE_PREFIX),
              sender: topProfile.name,
              text: matchGreeting(topProfile),
              sentAt: new Date().toISOString()
            }
          ]);
          state.ratings.set(matchId, []);
        }
      }

      return snapshotForUser(userId);
    },

    async getTeeTimes(sessionToken) {
      const userId = sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");
      return [clone(state.teeTimes.get(userId))];
    },

    async getMessages(sessionToken, matchId) {
      const userId = sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");
      ensureMatchAccess(userId, matchId);
      return clone(state.messageThreads.get(matchId) ?? []);
    },

    async sendMessage(sessionToken, matchId, payload = {}) {
      const userId = sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");
      ensureMatchAccess(userId, matchId);
      assertMessage(payload);

      const account = state.users.get(userId);
      const nextMessage = {
        id: createId(MESSAGE_PREFIX),
        sender: account.name || "You",
        text: payload.text.trim(),
        sentAt: new Date().toISOString()
      };

      const thread = state.messageThreads.get(matchId) ?? [];
      state.messageThreads.set(matchId, [...thread, nextMessage]);
      return clone(state.messageThreads.get(matchId));
    },

    async submitRating(sessionToken, matchId, payload = {}) {
      const userId = sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");
      ensureMatchAccess(userId, matchId);
      assertRating(payload);

      const entries = state.ratings.get(matchId) ?? [];
      const next = [
        ...entries.filter((entry) => entry.raterRole !== "host"),
        {
          id: createId(RATING_PREFIX),
          raterRole: "host",
          rating: Number(payload.rating),
          note: payload.note?.trim() ?? "",
          createdAt: new Date().toISOString()
        }
      ];
      state.ratings.set(matchId, next);

      const snapshot = snapshotForUser(userId);
      return snapshot.matches.find((match) => match.id === matchId) ?? null;
    },

    async runTrustAction(sessionToken, matchId, payload = {}) {
      const userId = sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");
      ensureMatchAccess(userId, matchId);

      const action = payload.action;
      const profileId = Number(matchId.split("-").at(-1));
      if (action === "block") {
        state.blockedProfiles.get(userId).add(profileId);
        state.matches.set(
          userId,
          state.matches.get(userId).filter((item) => item !== profileId)
        );
        state.messageThreads.delete(matchId);
        return snapshotForUser(userId);
      }

      state.trustEvents.get(userId).push({
        id: createId("trust"),
        matchId,
        profileId,
        action,
        createdAt: new Date().toISOString()
      });
      return snapshotForUser(userId);
    }
  };
}

function createPostgresRepository() {
  async function sessionUserId(sessionToken) {
    if (!sessionToken) return null;
    const result = await query("select user_id from sessions where id = $1", [sessionToken]);
    return result.rows[0]?.user_id ?? null;
  }

  async function ensureTeeTime(userId, homeCourse = defaultTeeTime.homeCourse) {
    const existing = await query("select id from tee_times where user_id = $1 limit 1", [userId]);
    if (existing.rows.length) return;
    const teeTimeId = createId(TEE_TIME_PREFIX);
    await query(
      `
        insert into tee_times (id, user_id, day_label, home_course, posting_type, golfers_committed, open_slots)
        values ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        teeTimeId,
        userId,
        defaultTeeTime.dayLabel,
        homeCourse,
        defaultTeeTime.postingType,
        defaultTeeTime.golfersCommitted,
        defaultTeeTime.openSlots
      ]
    );
  }

  async function loadRatingsByMatchIds(matchIds) {
    if (!matchIds.length) return new Map();
    const result = await query(
      `
        select id, match_id, rater_role, rating, note, created_at
        from ratings
        where match_id = any($1::text[])
        order by created_at desc
      `,
      [matchIds]
    );
    const grouped = new Map();
    result.rows.forEach((row) => {
      const list = grouped.get(row.match_id) ?? [];
      list.push({
        id: row.id,
        raterRole: row.rater_role,
        rating: Number(row.rating),
        note: row.note ?? "",
        createdAt: row.created_at
      });
      grouped.set(row.match_id, list);
    });
    return grouped;
  }

  async function loadTrustSummary(userId, matchRows) {
    const profileIds = matchRows.map((row) => Number(row.profile_id));
    const blockedResult = profileIds.length
      ? await query(
          "select profile_id from blocked_profiles where user_id = $1 and profile_id = any($2::int[])",
          [userId, profileIds]
        )
      : { rows: [] };
    const blockedIds = new Set(blockedResult.rows.map((row) => Number(row.profile_id)));
    const matchIds = matchRows.map((row) => row.id);
    const trustResult = matchIds.length
      ? await query(
          `
            select match_id, profile_id, action
            from trust_events
            where user_id = $1 and match_id = any($2::text[])
          `,
          [userId, matchIds]
        )
      : { rows: [] };

    const grouped = new Map();
    trustResult.rows.forEach((row) => {
      const current = grouped.get(row.match_id) ?? { reported: false, noShow: false };
      if (row.action === "report") current.reported = true;
      if (row.action === "no_show") current.noShow = true;
      grouped.set(row.match_id, current);
    });

    return { blockedIds, trustByMatchId: grouped };
  }

  async function snapshotForUser(userId) {
    const [userResult, teeTimeResult, swipeResult, matchResult] = await Promise.all([
      query(
        `
          select id, email, name, home_course, handicap, distance, handicap_range, current_filter, onboarded
          , preferred_vibe, gender, gender_preference, mobility_preference, music_preference, available_days, availability_window
          , play_mode, group_size
          from app_users
          where id = $1
        `,
        [userId]
      ),
      query(
        `
          select id, day_label, home_course, posting_type, golfers_committed, open_slots
          , tee_date, tee_time, holes, note
          from tee_times
          where user_id = $1
          order by created_at asc
          limit 1
        `,
        [userId]
      ),
      query("select profile_id from swipes where user_id = $1", [userId]),
      query(
        `
          select id, profile_id
          from matches
          where user_id = $1
          order by created_at desc
        `,
        [userId]
      )
    ]);

    const row = userResult.rows[0];
    if (!row) return defaultSnapshot();

    const user = userFromRow(row);
    const swipedIds = new Set(swipeResult.rows.map((item) => Number(item.profile_id)));
    const ratingsMap = await loadRatingsByMatchIds(matchResult.rows.map((row) => row.id));
    const { blockedIds, trustByMatchId } = await loadTrustSummary(userId, matchResult.rows);

    const matches = matchResult.rows
      .map((item) => {
        const profile = profileById(item.profile_id);
        if (!profile || blockedIds.has(Number(item.profile_id))) return null;
        return buildMatch(profile, item.id, ratingsMap.get(item.id) ?? [], {
          blocked: blockedIds.has(Number(item.profile_id)),
          reported: trustByMatchId.get(item.id)?.reported ?? false,
          noShow: trustByMatchId.get(item.id)?.noShow ?? false
        });
      })
      .filter(Boolean);

    return {
      authenticated: true,
      onboarded: Boolean(row.onboarded),
      user: {
        name: user.name,
        email: user.email,
        homeCourse: user.homeCourse,
        handicap: user.handicap,
        distance: user.distance,
        handicapRange: user.handicapRange,
        preferredVibe: user.preferredVibe,
        gender: user.gender,
        genderPreference: user.genderPreference,
        mobilityPreference: user.mobilityPreference,
        musicPreference: user.musicPreference,
        availableDays: user.availableDays,
        availabilityWindow: user.availabilityWindow,
        playMode: user.playMode,
        groupSize: user.groupSize
      },
      filter: row.current_filter ?? "all",
      deck: filteredDeck(profiles, user, row.current_filter ?? "all", swipedIds).filter(
        (profile) => !blockedIds.has(profile.id)
      ),
      matches,
      previousPartners: buildPreviousPartners(matches),
      teeTime: teeTimeFromRow(teeTimeResult.rows[0], user.homeCourse)
    };
  }

  async function ensureMatchAccess(userId, matchId) {
    const result = await query("select id from matches where id = $1 and user_id = $2", [matchId, userId]);
    if (!result.rows.length) throw new Error("Match not found");
  }

  return {
    mode: "postgres",

    async bootstrapState(sessionToken) {
      const userId = await sessionUserId(sessionToken);
      if (!userId) return defaultSnapshot();
      return snapshotForUser(userId);
    },

    async signup(payload = {}) {
      assertEmailAndPassword(payload);
      const email = payload.email.trim().toLowerCase();
      const existing = await query("select id from app_users where email = $1", [email]);
      if (existing.rows.length) throw new Error("An account with this email already exists");

      const userId = createId(USER_PREFIX);
      const sessionToken = createId(SESSION_PREFIX);

      await query(
        `
          insert into app_users (
            id, email, password_hash, name, home_course, handicap, distance, handicap_range,
            preferred_vibe, gender, gender_preference, mobility_preference, music_preference,
            available_days, availability_window, play_mode, group_size, current_filter, onboarded
          )
          values ($1, $2, $3, '', '', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'all', false)
        `,
        [
          userId,
          email,
          hashPassword(payload.password),
          defaultUser.handicap,
          defaultUser.distance,
          defaultUser.handicapRange,
          defaultUser.preferredVibe,
          defaultUser.gender,
          defaultUser.genderPreference,
          defaultUser.mobilityPreference,
          defaultUser.musicPreference,
          serializeDays(defaultUser.availableDays),
          defaultUser.availabilityWindow,
          defaultUser.playMode,
          defaultUser.groupSize
        ]
      );
      await ensureTeeTime(userId);
      await query("insert into sessions (id, user_id) values ($1, $2)", [sessionToken, userId]);

      return { token: sessionToken, snapshot: await snapshotForUser(userId) };
    },

    async login(payload = {}) {
      assertEmailAndPassword(payload);
      const email = payload.email.trim().toLowerCase();
      const result = await query(
        "select id, email, password_hash from app_users where email = $1",
        [email]
      );
      const row = result.rows[0];
      if (!row || !row.password_hash || !verifyPassword(payload.password, row.password_hash)) {
        throw new Error("Invalid email or password");
      }

      const sessionToken = createId(SESSION_PREFIX);
      await query("insert into sessions (id, user_id) values ($1, $2)", [sessionToken, row.id]);
      return { token: sessionToken, snapshot: await snapshotForUser(row.id) };
    },

    async logout(sessionToken) {
      if (sessionToken) await query("delete from sessions where id = $1", [sessionToken]);
      return { ok: true };
    },

    async completeOnboarding(sessionToken, payload = {}) {
      const userId = await sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");

      await query(
        `
          update app_users
          set
            name = $2,
            home_course = $3,
            handicap = $4,
            distance = $5,
            handicap_range = $6,
            preferred_vibe = $7,
            gender = $8,
            gender_preference = $9,
            mobility_preference = $10,
            music_preference = $11,
            available_days = $12,
            availability_window = $13,
            play_mode = $14,
            group_size = $15,
            onboarded = true,
            updated_at = now()
          where id = $1
        `,
        [
          userId,
          payload.name ?? "",
          payload.homeCourse ?? "",
          Number(payload.handicap),
          Number(payload.distance),
          Number(payload.handicapRange),
          payload.preferredVibe ?? defaultUser.preferredVibe,
          payload.gender ?? defaultUser.gender,
          payload.genderPreference ?? defaultUser.genderPreference,
          payload.mobilityPreference ?? defaultUser.mobilityPreference,
          payload.musicPreference ?? defaultUser.musicPreference,
          serializeDays(payload.availableDays ?? defaultUser.availableDays),
          payload.availabilityWindow ?? defaultUser.availabilityWindow,
          payload.playMode ?? defaultUser.playMode,
          (payload.playMode ?? defaultUser.playMode) === "single"
            ? 1
            : Math.min(4, Math.max(2, Number(payload.groupSize ?? defaultUser.groupSize)))
        ]
      );
      const postingState = buildPostingState({
        playMode: payload.playMode ?? defaultUser.playMode,
        groupSize: payload.groupSize ?? defaultUser.groupSize
      });
      await ensureTeeTime(userId, payload.homeCourse || defaultTeeTime.homeCourse);
      await query(
        `
          update tee_times
          set home_course = $2, posting_type = $3, golfers_committed = $4, open_slots = $5, updated_at = now()
          where user_id = $1
        `,
        [
          userId,
          payload.homeCourse || defaultTeeTime.homeCourse,
          postingState.postingType,
          postingState.golfersCommitted,
          postingState.openSlots
        ]
      );

      return snapshotForUser(userId);
    },

    async updateSettings(sessionToken, payload = {}) {
      const userId = await sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");

      const current = await snapshotForUser(userId);
      const nextUser = { ...current.user, ...payload };

      await query(
        `
          update app_users
          set
            name = $2,
            home_course = $3,
            handicap = $4,
            distance = $5,
            handicap_range = $6,
            preferred_vibe = $7,
            gender = $8,
            gender_preference = $9,
            mobility_preference = $10,
            music_preference = $11,
            available_days = $12,
            availability_window = $13,
            play_mode = $14,
            group_size = $15,
            updated_at = now()
          where id = $1
        `,
        [
          userId,
          nextUser.name ?? "",
          nextUser.homeCourse ?? "",
          Number(nextUser.handicap),
          Number(nextUser.distance),
          Number(nextUser.handicapRange),
          nextUser.preferredVibe ?? defaultUser.preferredVibe,
          nextUser.gender ?? defaultUser.gender,
          nextUser.genderPreference ?? defaultUser.genderPreference,
          nextUser.mobilityPreference ?? defaultUser.mobilityPreference,
          nextUser.musicPreference ?? defaultUser.musicPreference,
          serializeDays(nextUser.availableDays ?? defaultUser.availableDays),
          nextUser.availabilityWindow ?? defaultUser.availabilityWindow,
          nextUser.playMode ?? defaultUser.playMode,
          nextUser.playMode === "single"
            ? 1
            : Math.min(4, Math.max(2, Number(nextUser.groupSize ?? defaultUser.groupSize)))
        ]
      );
      const postingState = buildPostingState(nextUser);
      await query(
        `
          update tee_times
          set home_course = $2, posting_type = $3, golfers_committed = $4, open_slots = $5, updated_at = now()
          where user_id = $1
        `,
        [
          userId,
          nextUser.homeCourse || defaultTeeTime.homeCourse,
          postingState.postingType,
          postingState.golfersCommitted,
          postingState.openSlots
        ]
      );

      return snapshotForUser(userId);
    },

    async setFilter(sessionToken, filter = "all") {
      const userId = await sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");
      await query("update app_users set current_filter = $2, updated_at = now() where id = $1", [
        userId,
        filter
      ]);
      return snapshotForUser(userId);
    },

    async swipeProfile(sessionToken, direction) {
      const userId = await sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");

      const snapshot = await snapshotForUser(userId);
      const topProfile = snapshot.deck[0];
      if (!topProfile) return snapshot;

      await query(
        `
          insert into swipes (user_id, profile_id, direction)
          values ($1, $2, $3)
          on conflict (user_id, profile_id)
          do update set direction = excluded.direction
        `,
        [userId, topProfile.id, direction]
      );

      if (direction === "right") {
        const matchId = `match-${userId}-${topProfile.id}`;
        await query(
          `
            insert into matches (id, user_id, profile_id)
            values ($1, $2, $3)
            on conflict (user_id, profile_id) do nothing
          `,
          [matchId, userId, topProfile.id]
        );

        await query(
          `
            insert into messages (id, match_id, sender, body)
            select $1, $2, $3, $4
            where not exists (select 1 from messages where match_id = $2)
          `,
          [createId(MESSAGE_PREFIX), matchId, topProfile.name, matchGreeting(topProfile)]
        );
      }

      return snapshotForUser(userId);
    },

    async getTeeTimes(sessionToken) {
      const userId = await sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");
      const snapshot = await snapshotForUser(userId);
      return [snapshot.teeTime];
    },

    async updateTeeTime(sessionToken, payload = {}) {
      const userId = await sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");

      const snapshot = await snapshotForUser(userId);
      const nextTeeTime = normalizeTeeTime(snapshot.teeTime, snapshot.user, payload);

      await query(
        `
          update tee_times
          set
            day_label = $2,
            tee_date = $3,
            tee_time = $4,
            home_course = $5,
            posting_type = $6,
            golfers_committed = $7,
            open_slots = $8,
            holes = $9,
            note = $10,
            updated_at = now()
          where user_id = $1
        `,
        [
          userId,
          nextTeeTime.dayLabel,
          nextTeeTime.teeDate,
          nextTeeTime.teeTime,
          nextTeeTime.homeCourse,
          nextTeeTime.postingType,
          nextTeeTime.golfersCommitted,
          nextTeeTime.openSlots,
          nextTeeTime.holes,
          nextTeeTime.note
        ]
      );

      return snapshotForUser(userId);
    },

    async getMessages(sessionToken, matchId) {
      const userId = await sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");
      await ensureMatchAccess(userId, matchId);

      const result = await query(
        `
          select id, sender, body, sent_at
          from messages
          where match_id = $1
          order by sent_at asc
        `,
        [matchId]
      );

      return result.rows.map((row) => ({
        id: row.id,
        sender: row.sender,
        text: row.body,
        sentAt: row.sent_at
      }));
    },

    async sendMessage(sessionToken, matchId, payload = {}) {
      const userId = await sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");
      await ensureMatchAccess(userId, matchId);
      assertMessage(payload);

      const account = await query("select name from app_users where id = $1", [userId]);
      const sender = account.rows[0]?.name || "You";
      const message = {
        id: createId(MESSAGE_PREFIX),
        sender,
        text: payload.text.trim(),
        sentAt: new Date().toISOString()
      };

      await query(
        `
          insert into messages (id, match_id, sender, body, sent_at)
          values ($1, $2, $3, $4, $5)
        `,
        [message.id, matchId, message.sender, message.text, message.sentAt]
      );

      return this.getMessages(sessionToken, matchId);
    },

    async submitRating(sessionToken, matchId, payload = {}) {
      const userId = await sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");
      await ensureMatchAccess(userId, matchId);
      assertRating(payload);

      await query(
        `
          insert into ratings (id, match_id, rater_role, rating, note)
          values ($1, $2, 'host', $3, $4)
          on conflict (match_id, rater_role)
          do update set rating = excluded.rating, note = excluded.note, created_at = now()
        `,
        [createId(RATING_PREFIX), matchId, Number(payload.rating), payload.note?.trim() ?? ""]
      );

      const snapshot = await snapshotForUser(userId);
      return snapshot.matches.find((match) => match.id === matchId) ?? null;
    },

    async runTrustAction(sessionToken, matchId, payload = {}) {
      const userId = await sessionUserId(sessionToken);
      if (!userId) throw new Error("Authentication required");
      await ensureMatchAccess(userId, matchId);

      const matchResult = await query("select profile_id from matches where id = $1 and user_id = $2", [
        matchId,
        userId
      ]);
      const profileId = Number(matchResult.rows[0]?.profile_id);
      if (!profileId) throw new Error("Match not found");

      if (payload.action === "block") {
        await query(
          `
            insert into blocked_profiles (user_id, profile_id)
            values ($1, $2)
            on conflict (user_id, profile_id) do nothing
          `,
          [userId, profileId]
        );
        return snapshotForUser(userId);
      }

      await query(
        `
          insert into trust_events (id, user_id, profile_id, match_id, action)
          values ($1, $2, $3, $4, $5)
        `,
        [createId("trust"), userId, profileId, matchId, payload.action]
      );
      return snapshotForUser(userId);
    }
  };
}

export function createRepository() {
  return hasDatabase() ? createPostgresRepository() : createMemoryRepository();
}
