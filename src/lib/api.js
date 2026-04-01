import { localApi } from "./localApi";

const useHttpApi =
  typeof window !== "undefined" && window.location.search.includes("backend=1");
const sessionStorageKey = "finda4th_session_token";

function readToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(sessionStorageKey);
}

function writeToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(sessionStorageKey, token);
  else window.localStorage.removeItem(sessionStorageKey);
}

async function request(path, options = {}) {
  const token = readToken();
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    },
    ...options
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `API request failed: ${response.status}`);
  }

  return data;
}

const httpApi = {
  bootstrap() {
    return request("/api/bootstrap");
  },
  signup(credentials) {
    return request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(credentials)
    }).then((result) => {
      writeToken(result.token);
      return result;
    });
  },
  login(credentials) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    }).then((result) => {
      writeToken(result.token);
      return result;
    });
  },
  logout() {
    return request("/api/auth/logout", {
      method: "POST"
    }).finally(() => {
      writeToken(null);
    });
  },
  completeOnboarding(user) {
    return request("/api/onboarding", {
      method: "POST",
      body: JSON.stringify(user)
    });
  },
  updateSettings(user) {
    return request("/api/profile/settings", {
      method: "PATCH",
      body: JSON.stringify(user)
    });
  },
  updateTeeTime(teeTime) {
    return request("/api/tee-times/current", {
      method: "PATCH",
      body: JSON.stringify(teeTime)
    });
  },
  setFilter(filter) {
    return request("/api/discovery/filter", {
      method: "POST",
      body: JSON.stringify({ filter })
    });
  },
  refreshDeck() {
    return request("/api/bootstrap");
  },
  swipe(direction) {
    return request("/api/discovery/swipe", {
      method: "POST",
      body: JSON.stringify({ direction })
    });
  },
  getMessages(matchId) {
    return request(`/api/matches/${matchId}/messages`);
  },
  sendMessage(matchId, text) {
    return request(`/api/matches/${matchId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text })
    });
  },
  submitRating(matchId, rating, note) {
    return request(`/api/matches/${matchId}/ratings`, {
      method: "POST",
      body: JSON.stringify({ rating, note })
    });
  },
  runTrustAction(matchId, action, reason) {
    return request(`/api/matches/${matchId}/trust`, {
      method: "POST",
      body: JSON.stringify({ action, reason })
    });
  },
  updateConfirmation(matchId, confirmation) {
    return localApi.updateConfirmation(matchId, confirmation);
  },
  markNotificationRead(notificationId) {
    return localApi.markNotificationRead(notificationId);
  },
  favoritePartner(profileId) {
    return localApi.favoritePartner(profileId);
  },
  reInvitePartner(profileId) {
    return localApi.reInvitePartner(profileId);
  },
  saveScorecard(roundId, scores) {
    return localApi.saveScorecard(roundId, scores);
  },
  cancelMatch(matchId, reason) {
    return localApi.cancelMatch(matchId, reason);
  },
  createInvite(kind) {
    return localApi.createInvite(kind);
  }
};

const api = useHttpApi ? httpApi : localApi;

if (!useHttpApi) {
  localApi.token = readToken();
}

export { api, readToken, writeToken };
