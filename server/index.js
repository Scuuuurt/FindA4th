import cors from "cors";
import express from "express";
import {
  bootstrapState,
  completeOnboarding,
  sendMessage,
  getMessages,
  getTeeTimes,
  logout,
  login,
  setFilter,
  signup,
  storageMode,
  submitRating,
  swipeProfile,
  updateSettings
} from "./store.js";

const app = express();
const port = process.env.PORT || 8787;

app.use(cors());
app.use(express.json());

function sessionToken(request) {
  const authHeader = request.headers.authorization ?? "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }
  return request.headers["x-session-token"] ?? null;
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "finda4th-api", storageMode });
});

app.post("/api/auth/signup", async (request, response, next) => {
  try {
    response.json(await signup(request.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (request, response, next) => {
  try {
    response.json(await login(request.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/logout", async (request, response, next) => {
  try {
    response.json(await logout(sessionToken(request)));
  } catch (error) {
    next(error);
  }
});

app.get("/api/bootstrap", async (_request, response, next) => {
  try {
    response.json(await bootstrapState(sessionToken(_request)));
  } catch (error) {
    next(error);
  }
});

app.post("/api/onboarding", async (request, response, next) => {
  try {
    response.json(await completeOnboarding(sessionToken(request), request.body));
  } catch (error) {
    next(error);
  }
});

app.patch("/api/profile/settings", async (request, response, next) => {
  try {
    response.json(await updateSettings(sessionToken(request), request.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/discovery/filter", async (request, response, next) => {
  try {
    response.json(await setFilter(sessionToken(request), request.body.filter));
  } catch (error) {
    next(error);
  }
});

app.post("/api/discovery/swipe", async (request, response, next) => {
  try {
    response.json(await swipeProfile(sessionToken(request), request.body.direction));
  } catch (error) {
    next(error);
  }
});

app.get("/api/tee-times", async (_request, response, next) => {
  try {
    response.json(await getTeeTimes(sessionToken(_request)));
  } catch (error) {
    next(error);
  }
});

app.get("/api/matches/:matchId/messages", async (request, response, next) => {
  try {
    response.json(await getMessages(sessionToken(request), request.params.matchId));
  } catch (error) {
    next(error);
  }
});

app.post("/api/matches/:matchId/messages", async (request, response, next) => {
  try {
    response.json(await sendMessage(sessionToken(request), request.params.matchId, request.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/matches/:matchId/ratings", async (request, response, next) => {
  try {
    response.json(await submitRating(sessionToken(request), request.params.matchId, request.body));
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  response.status(error.message === "Authentication required" ? 401 : 500).json({
    error: error.message || "Unexpected server error"
  });
});

app.listen(port, () => {
  console.log(`FindA4th API listening on http://localhost:${port} using ${storageMode}`);
});
