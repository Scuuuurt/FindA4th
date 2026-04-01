# FindA4th API Scaffold

This backend now supports two storage modes:

- `memory`: default fallback when `DATABASE_URL` is not set
- `postgres`: enabled automatically when `DATABASE_URL` is present

## Setup

1. Create a Postgres database.
2. Copy `.env.example` values into your local environment.
3. Run the SQL in `server/sql/schema.sql`.
4. Start the API with `npm run server`.

## Routes

- `POST /api/auth/login`
- `GET /api/bootstrap`
- `POST /api/onboarding`
- `PATCH /api/profile/settings`
- `POST /api/discovery/filter`
- `POST /api/discovery/swipe`
- `GET /api/tee-times`
- `GET /api/matches/:matchId/messages`

## What persists in Postgres

- User accounts
- Session records
- Onboarding state
- User profile and discovery settings
- Tee time summary
- Swipe history
- Matches
- Match starter messages

The React app can use the backend path by loading the frontend with `?backend=1`.

## Multi-user auth

- `POST /api/auth/signup` creates a new account and returns a session token.
- `POST /api/auth/login` returns a new session token for an existing account.
- `POST /api/auth/logout` deletes the active session token.
- Authenticated routes read `Authorization: Bearer <token>`.

Each account now has isolated swipes, matches, messages, tee time state, and profile settings.
