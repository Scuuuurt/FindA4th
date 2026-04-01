import { startTransition, useEffect, useState } from "react";
import AuthScreen from "./components/AuthScreen";
import MatchApp from "./components/MatchApp";
import OnboardingScreen from "./components/OnboardingScreen";
import { defaultUser } from "./data/profiles";
import { api, writeToken } from "./lib/api";

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const emptyCredentials = {
  email: "",
  password: ""
};

function normalizeUser(nextUser) {
  return {
    ...nextUser,
    handicap: toNumber(nextUser.handicap, defaultUser.handicap),
    distance: toNumber(nextUser.distance, defaultUser.distance),
    handicapRange: toNumber(nextUser.handicapRange, defaultUser.handicapRange),
    availableDays: Array.isArray(nextUser.availableDays)
      ? nextUser.availableDays
      : defaultUser.availableDays,
    preferredVibe: nextUser.preferredVibe ?? defaultUser.preferredVibe,
    gender: nextUser.gender ?? defaultUser.gender,
    genderPreference: nextUser.genderPreference ?? defaultUser.genderPreference,
    mobilityPreference: nextUser.mobilityPreference ?? defaultUser.mobilityPreference,
    musicPreference: nextUser.musicPreference ?? defaultUser.musicPreference,
    availabilityWindow: nextUser.availabilityWindow ?? defaultUser.availabilityWindow,
    groupSize:
      nextUser.playMode === "group_owner"
        ? Math.min(4, Math.max(2, toNumber(nextUser.groupSize, defaultUser.groupSize)))
        : 1
  };
}

export default function App() {
  const [snapshot, setSnapshot] = useState(null);
  const [draftUser, setDraftUser] = useState(defaultUser);
  const [authMode, setAuthMode] = useState("signup");
  const [credentials, setCredentials] = useState(emptyCredentials);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    api.bootstrap().then((data) => {
      startTransition(() => {
        setSnapshot(data);
        setDraftUser(normalizeUser(data.user));
        if (data.user?.email) {
          setCredentials((current) => ({ ...current, email: data.user.email }));
        }
      });
    });
  }, []);

  function commitSnapshot(nextSnapshot) {
    startTransition(() => {
      setSnapshot(nextSnapshot);
      setDraftUser(normalizeUser(nextSnapshot.user));
      if (nextSnapshot.user?.email) {
        setCredentials((current) => ({ ...current, email: nextSnapshot.user.email }));
      }

      if (activeMatchId) {
        const stillExists = nextSnapshot.matches.find((match) => match.id === activeMatchId);
        if (!stillExists) {
          setActiveMatchId(null);
          setActiveMessages([]);
        }
      }
    });
  }

  function handleAuthChange(event) {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const result =
        authMode === "signup" ? await api.signup(credentials) : await api.login(credentials);
      writeToken(result.token ?? null);
      commitSnapshot(result.snapshot);
      setCredentials((current) => ({ ...current, password: "" }));
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    await api.logout();
    writeToken(null);
    const nextSnapshot = await api.bootstrap();
    setCredentials(emptyCredentials);
    setActiveMatchId(null);
    setActiveMessages([]);
    commitSnapshot(nextSnapshot);
  }

  function handleUserChange(event) {
    const { name, value } = event.target;
    const nextUser = normalizeUser({
      ...draftUser,
      [name]:
        name === "handicap"
          ? toNumber(value, defaultUser.handicap)
          : name === "distance"
            ? toNumber(value, defaultUser.distance)
            : name === "handicapRange"
              ? toNumber(value, defaultUser.handicapRange)
              : name === "groupSize"
                ? toNumber(value, defaultUser.groupSize)
              : value
    });

    setDraftUser(nextUser);

    if (snapshot?.authenticated && snapshot?.onboarded) {
      api.updateSettings(nextUser).then(commitSnapshot);
    }
  }

  function handleOnboardingSubmit(event) {
    event.preventDefault();
    if (!draftUser.name.trim() || !draftUser.homeCourse.trim()) return;
    api.completeOnboarding(draftUser).then(commitSnapshot);
  }

  function handleFilterChange(nextFilter) {
    api.setFilter(nextFilter).then(commitSnapshot);
  }

  function handleRefresh() {
    api.refreshDeck().then(commitSnapshot);
  }

  function handleTeeTimeUpdate(nextTeeTime) {
    api.updateTeeTime(nextTeeTime).then(commitSnapshot);
  }

  function handleSwipe(direction) {
    api.swipe(direction).then(commitSnapshot);
  }

  async function handleOpenMatch(match) {
    setActiveMatchId(match.id);
    setChatLoading(true);
    try {
      const messages = await api.getMessages(match.id);
      setActiveMessages(messages);
    } finally {
      setChatLoading(false);
    }
  }

  async function handleSendMessage(matchId, text) {
    const messages = await api.sendMessage(matchId, text);
    setActiveMessages(messages);
  }

  async function handleSubmitRating(matchId, rating, note) {
    const updatedMatch = await api.submitRating(matchId, rating, note);
    if (!updatedMatch) return;

    setSnapshot((current) => {
      if (!current) return current;
      return {
        ...current,
        matches: current.matches.map((match) => (match.id === matchId ? updatedMatch : match))
      };
    });
  }

  function handleTrustAction(matchId, action) {
    api.runTrustAction(matchId, action).then(commitSnapshot);
  }

  const activeMatch = snapshot?.matches?.find((match) => match.id === activeMatchId) ?? null;

  if (!snapshot) {
    return <div className="app-loading">Loading FindA4th...</div>;
  }

  if (!snapshot.authenticated) {
    return (
      <AuthScreen
        mode={authMode}
        credentials={credentials}
        error={authError}
        loading={authLoading}
        onModeChange={setAuthMode}
        onChange={handleAuthChange}
        onSubmit={handleAuthSubmit}
      />
    );
  }

  if (!snapshot.onboarded) {
    return (
      <OnboardingScreen
        draft={draftUser}
        onChange={handleUserChange}
        onSubmit={handleOnboardingSubmit}
      />
    );
  }

  return (
    <MatchApp
      user={snapshot.user}
      filter={snapshot.filter}
      deck={snapshot.deck}
      matches={snapshot.matches}
      previousPartners={snapshot.previousPartners ?? []}
      teeTime={snapshot.teeTime}
      activeMatch={activeMatch}
      activeMessages={activeMessages}
      chatLoading={chatLoading}
        onOpenMatch={handleOpenMatch}
        onSendMessage={handleSendMessage}
        onSubmitRating={handleSubmitRating}
        onTrustAction={handleTrustAction}
        onTeeTimeUpdate={handleTeeTimeUpdate}
        onSettingsChange={handleUserChange}
      onFilterChange={handleFilterChange}
      onRefresh={handleRefresh}
      onSwipe={handleSwipe}
      onLogout={handleLogout}
    />
  );
}
